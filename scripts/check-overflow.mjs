// Layout overflow checker.
//
// check:a11y and check:links both pass on a page that scrolls sideways on a
// phone, because neither one lays the page out. This serves apps/stex/dist and
// asserts, at narrow viewports, that no page is wider than the screen.
//
// The usual cause is a grid track sized by content that cannot wrap — a long
// value in a `.spec-table` cell (its td is white-space: nowrap by design), a
// wide `minmax()` floor, or an unconstrained image or table. Content that is
// deliberately scrollable inside its own container (`.spec-figure`) is ignored.
//
// Needs a Chromium build: npx playwright install chromium-headless-shell
// Run: node scripts/check-overflow.mjs   (npm run check:overflow)

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { startStaticServer } from "./lib/static-server.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(repoRoot, "apps", "stex", "dist");
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.OVERFLOW_PORT || "4319", 10);
const widths = [390, 768];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("check:overflow needs Playwright. Install it, then:");
  console.error("  npx playwright install chromium-headless-shell");
  process.exit(1);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return files.flat();
}

const pages = (await walk(distDir))
  .filter((file) => file.endsWith(".html"))
  .map((file) => `/${path.relative(distDir, file).split(path.sep).join("/")}`)
  .sort();

if (pages.length === 0) {
  console.error(`No built pages under ${path.relative(repoRoot, distDir)} — run npm run build first.`);
  process.exit(1);
}

const server = await startStaticServer({ rootDir: distDir, host, port });
const browser = await chromium.launch();
const failures = [];

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const route of pages) {
      await page.goto(`http://${host}:${port}${route}`, { waitUntil: "load" });
      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        if (doc.scrollWidth <= doc.clientWidth) return null;

        // Ignore anything inside a container that is meant to scroll on its own.
        const inScroller = (el) => {
          for (let node = el.parentElement; node; node = node.parentElement) {
            if (/auto|scroll|hidden/.test(getComputedStyle(node).overflowX)) return true;
          }
          return false;
        };

        let worst = null;
        for (const el of document.body.querySelectorAll("*")) {
          const rect = el.getBoundingClientRect();
          if (rect.right <= doc.clientWidth + 1 || inScroller(el)) continue;
          if (!worst || rect.width > worst.width) {
            worst = {
              width: Math.round(rect.width),
              tag: el.tagName.toLowerCase(),
              cls: String(el.className.baseVal ?? el.className).trim().slice(0, 60),
            };
          }
        }
        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, worst };
      });

      if (result) {
        const culprit = result.worst
          ? ` — widest unconstrained element: <${result.worst.tag} class="${result.worst.cls}"> at ${result.worst.width}px`
          : "";
        failures.push(`${route} at ${width}px: scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth}${culprit}`);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error("Horizontal overflow detected:");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Overflow check passed — ${pages.length} pages at ${widths.join("px, ")}px`);
