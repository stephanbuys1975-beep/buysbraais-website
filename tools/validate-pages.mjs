import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const required = [
  "index.html", "404.html", "about/index.html", "catering/index.html",
  "gallery/index.html", "gallery/gallery-v2.css", "contact/index.html",
  "styles.css", "script.js", "robots.txt", "sitemap.xml", "site.webmanifest",
  "assets/buys-braais-social.jpg",
  "assets/photos/event-grill-burgers.jpeg", "assets/photos/event-guests-dining.jpeg"
];
const forbidden = [
  /exact transcription/i,
  /capture(?:d)? visually/i,
  /higher-resolution editor capture/i,
  /service description pending/i,
  /migration preview/i,
  /preview only/i
];
const errors = [];

for (const file of required) {
  try { await access(path.join(dist, file)); }
  catch { errors.push(`Missing required file: ${file}`); }
}

async function filesUnder(dir) {
  const output = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) output.push(...await filesUnder(full));
    else output.push(full);
  }
  return output;
}

function hasValidImageSignature(file, bytes) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (ext === ".png") {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (ext === ".webp") {
    return bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  }
  return true;
}

const files = await filesUnder(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const publicPages = new Map([
  ["index.html", "https://buysbraais.com/"],
  ["about/index.html", "https://buysbraais.com/about/"],
  ["catering/index.html", "https://buysbraais.com/catering/"],
  ["gallery/index.html", "https://buysbraais.com/gallery/"],
  ["contact/index.html", "https://buysbraais.com/contact/"]
]);
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(dist, file);
  for (const pattern of forbidden) {
    if (pattern.test(html)) errors.push(`${relative} contains ${pattern}`);
  }
  const canonical = publicPages.get(relative);
  if (canonical) {
    const requiredMetadata = [
      `<link rel="canonical" href="${canonical}">`,
      `<meta property="og:url" content="${canonical}">`,
      '<meta property="og:image" content="https://buysbraais.com/assets/buys-braais-social.jpg">',
      '<meta name="twitter:card" content="summary_large_image">',
      '<meta name="twitter:image" content="https://buysbraais.com/assets/buys-braais-social.jpg">'
    ];
    for (const metadata of requiredMetadata) {
      if (!html.includes(metadata)) errors.push(`${relative} is missing required metadata: ${metadata}`);
    }
  }
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/.test(ref)) continue;
    const clean = ref.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = clean.startsWith("/")
      ? path.join(dist, clean.slice(1))
      : path.resolve(path.dirname(file), clean);
    try { await access(target); }
    catch { errors.push(`${relative} has missing local reference: ${ref}`); }
  }
}

const photoDir = path.join(dist, "assets", "photos");
for (const file of files.filter((item) => item.startsWith(photoDir))) {
  if (!/\.(?:jpe?g|png|webp)$/i.test(file)) continue;
  const bytes = await readFile(file);
  if (!hasValidImageSignature(file, bytes)) {
    errors.push(`${path.relative(dist, file)} does not contain a valid ${path.extname(file).slice(1).toUpperCase()} image signature`);
  }
}

console.log("BUYS BRAAI'S CLOUDFLARE PAGES VALIDATION");
console.log(`Files checked: ${files.length}`);
console.log(`HTML pages checked: ${htmlFiles.length}`);
console.log(`Images signature-checked: ${files.filter((file) => file.startsWith(photoDir) && /\.(?:jpe?g|png|webp)$/i.test(file)).length}`);
console.log(`Errors: ${errors.length}`);
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
