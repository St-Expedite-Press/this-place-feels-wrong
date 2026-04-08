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

function normalizeRef(baseDir, ref) {
  if (/^(https?:|mailto:|tel:|javascript:|#)/.test(ref)) return null;
  const clean = ref.split("?")[0].split("#")[0];
  if (clean.startsWith("/")) return path.join(SITE, clean);
  return path.join(baseDir, clean);
}

const htmlFiles = (await walk(SITE)).filter((file) => file.endsWith(".html"));
const broken = [];

for (const file of htmlFiles) {
  const html = await fs.readFile(file, "utf8");
  const refs = Array.from(html.matchAll(/(?:href|src)="([^"]+)"/g)).map((match) => match[1]);
  for (const ref of refs) {
    const target = normalizeRef(path.dirname(file), ref);
    if (!target) continue;
    let finalTarget = target;
    try {
      const stat = await fs.stat(finalTarget);
      if (stat.isDirectory()) finalTarget = path.join(finalTarget, "index.html");
    } catch {
      if (ref.endsWith("/")) finalTarget = path.join(finalTarget, "index.html");
    }
    try {
      await fs.access(finalTarget);
    } catch {
      broken.push(`${path.relative(ROOT, file)} -> ${ref}`);
    }
  }
}

if (broken.length) {
  console.error(broken.join("\n"));
  process.exit(1);
}

console.log("Link check passed");
