import fs from "node:fs/promises";
import path from "node:path";
import nunjucks from "nunjucks";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "apps", "web", "src");
const OUT = path.join(ROOT, "dist", "site");
const DATA_PATH = path.join(SRC, "data", "site.json");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyDirContents(fromDir, toDir) {
  await ensureDir(toDir);
  await fs.cp(fromDir, toDir, { recursive: true, force: true });
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function build() {
  const siteData = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  const pages = siteData.pages || {};

  const env = nunjucks.configure(SRC, {
    autoescape: false,
    noCache: true,
    trimBlocks: true,
    lstripBlocks: true,
  });

  await fs.rm(OUT, { recursive: true, force: true });
  await ensureDir(OUT);
  await copyDirContents(path.join(SRC, "assets"), path.join(OUT, "assets"));

  const staticDir = path.join(SRC, "static");
  try {
    await copyDirContents(staticDir, OUT);
  } catch {
    // Static directory is optional.
  }

  for (const [templateName, page] of Object.entries(pages)) {
    const outputPath = path.join(OUT, page.output);
    await ensureDir(path.dirname(outputPath));
    const html = env.render(path.join("pages", `${templateName}.njk`), {
      site: siteData.site,
      page,
    });
    await fs.writeFile(outputPath, `${html.trim()}\n`);
  }

  const sitemapEntries = Object.values(pages)
    .filter((page) => page.includeInSitemap !== false)
    .map((page) => {
      const loc = page.output === "index.html"
        ? siteData.site.origin
        : `${siteData.site.origin}/${page.output}`;
      return [
        "  <url>",
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${xmlEscape(page.lastmod || siteData.site.lastmod)}</lastmod>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapEntries,
    "</urlset>",
    "",
  ].join("\n");
  await fs.writeFile(path.join(OUT, "sitemap.xml"), sitemap);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
