import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const entries = [
  "index.html", "404.html", "about", "catering", "gallery", "contact",
  "assets", "styles.css", "script.js", "robots.txt", "sitemap.xml", "site.webmanifest"
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await cp(path.join(root, entry), path.join(dist, entry), { recursive: true });
}

async function countFiles(dir) {
  let count = 0;
  for (const item of await readdir(dir, { withFileTypes: true })) {
    count += item.isDirectory() ? await countFiles(path.join(dir, item.name)) : 1;
  }
  return count;
}

console.log(`Built ${await countFiles(dist)} deployable files in dist/`);
