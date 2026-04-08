import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE = path.join(ROOT, "apps", "web", "dist");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  }));
  return files.flat();
}

const htmlFiles = (await walk(SITE)).filter((file) => file.endsWith(".html"));
const failures = [];

for (const file of htmlFiles) {
  const html = await fs.readFile(file, "utf8");
  if (!/<html[^>]*lang=/i.test(html)) failures.push(`Missing html lang: ${path.relative(ROOT, file)}`);
  if (!/<title>/i.test(html)) failures.push(`Missing title: ${path.relative(ROOT, file)}`);
  if (!/<h1[\s>]/i.test(html)) failures.push(`Missing h1: ${path.relative(ROOT, file)}`);
  const images = Array.from(html.matchAll(/<img\b[^>]*>/gi)).map((match) => match[0]);
  for (const image of images) {
    if (!/\balt=/i.test(image)) {
      failures.push(`Image missing alt: ${path.relative(ROOT, file)}`);
      break;
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Accessibility heuristic checks passed");
