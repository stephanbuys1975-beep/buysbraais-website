import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const required = [
  "index.html", "404.html", "about/index.html", "catering/index.html",
  "gallery/index.html", "contact/index.html", "styles.css", "script.js",
  "robots.txt", "sitemap.xml", "site.webmanifest",
  "assets/photos/event-grill-burgers.jpeg", "assets/photos/event-guests-dining.jpeg"
];
const forbidden = [
  /exact transcription/i,
  /capture(?:d)? visually/i,
  /higher-resolution editor capture/i,
  /service description pending/i
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

const files = await filesUnder(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(html)) errors.push(`${path.relative(dist, file)} contains ${pattern}`);
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
    catch { errors.push(`${path.relative(dist, file)} has missing local reference: ${ref}`); }
  }
}

console.log("BUYS BRAAI'S CLOUDFLARE PAGES VALIDATION");
console.log(`Files checked: ${files.length}`);
console.log(`HTML pages checked: ${htmlFiles.length}`);
console.log(`Errors: ${errors.length}`);
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
