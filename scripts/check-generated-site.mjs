import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "apps", "web", "src");
const DIST = path.join(ROOT, "dist", "site");
const DATA_PATH = path.join(SRC, "data", "site.json");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  }));
  return nested.flat();
}

function relFrom(base, file) {
  return path.relative(base, file).replaceAll(path.sep, "/");
}

async function listFiles(dir) {
  try {
    const files = await walk(dir);
    return files.map((file) => relFrom(dir, file));
  } catch {
    return [];
  }
}

const siteData = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
const pageOutputs = Object.values(siteData.pages || {}).map((page) => page.output);
const staticFiles = await listFiles(path.join(SRC, "static"));
const assetFiles = (await listFiles(path.join(SRC, "assets"))).map((file) => `assets/${file}`);
const expected = new Set([...pageOutputs, "sitemap.xml", ...staticFiles, ...assetFiles]);
const actual = new Set(await listFiles(DIST));

const missing = [...expected].filter((file) => !actual.has(file)).sort();
const extra = [...actual].filter((file) => !expected.has(file)).sort();

if (missing.length || extra.length) {
  if (missing.length) {
    console.error("Missing generated files:");
    console.error(missing.join("\n"));
  }
  if (extra.length) {
    console.error("Unexpected generated files:");
    console.error(extra.join("\n"));
  }
  process.exit(1);
}

console.log("Generated site matches source expectations");
