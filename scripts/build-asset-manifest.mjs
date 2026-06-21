import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(repoRoot, "apps", "web", "public", "assets");
const sourceRoot = path.join(repoRoot, "assets", "source");
const jsonPath = path.join(repoRoot, "assets", "manifest.json");
const textPath = path.join(repoRoot, "assets", "manifest.txt");
const checkOnly = process.argv.includes("--check");

const posix = (value) => value.split(path.sep).join("/");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

async function digest(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function buildManifest(generatedAt = new Date().toISOString()) {
  const entries = [];
  for (const file of await walk(publicRoot)) {
    const relativePublic = posix(path.relative(publicRoot, file));
    const sourceCandidate = path.join(sourceRoot, relativePublic);
    const sourceOwned = relativePublic.startsWith("img/") || relativePublic.startsWith("gif/");
    if (sourceOwned) {
      try {
        await stat(sourceCandidate);
      } catch {
        throw new Error(`Published media has no canonical source: ${relativePublic}`);
      }
    }
    entries.push({
      path: `apps/web/public/assets/${relativePublic}`,
      ownership: sourceOwned ? "synced-media" : "authored-public",
      source: sourceOwned ? `assets/source/${relativePublic}` : null,
      bytes: (await stat(file)).size,
      sha256: await digest(file),
    });
  }
  return {
    schema_version: 1,
    generated_at: generatedAt,
    roots: {
      canonical_media: "assets/source/",
      authored_public: "apps/web/public/assets/",
      generated_build: "apps/web/dist/assets/",
    },
    entries,
  };
}

function renderText(manifest) {
  const lines = [
    "# Asset Manifest",
    `# Generated: ${manifest.generated_at}`,
    "# ownership  sha256  bytes  path  source",
  ];
  for (const entry of manifest.entries) {
    lines.push(
      `${entry.ownership}  ${entry.sha256}  ${entry.bytes}  ${entry.path}  ${entry.source ?? "-"}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

const normalize = (manifest) => ({ ...manifest, generated_at: "CHECK" });

if (checkOnly) {
  const existingJson = JSON.parse(await readFile(jsonPath, "utf8"));
  const expected = await buildManifest("CHECK");
  if (JSON.stringify(normalize(existingJson)) !== JSON.stringify(expected)) {
    throw new Error("assets/manifest.json is out of date; run npm run assets:sync");
  }
  const expectedText = renderText({ ...expected, generated_at: "CHECK" });
  const existingText = (await readFile(textPath, "utf8")).replace(
    /^# Generated: .*$/m,
    "# Generated: CHECK",
  );
  if (existingText !== expectedText) {
    throw new Error("assets/manifest.txt is out of date; run npm run assets:sync");
  }
  console.log(`[asset-manifest] PASS: ${expected.entries.length} published assets`);
} else {
  const manifest = await buildManifest();
  await writeFile(jsonPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(textPath, renderText(manifest));
  console.log(`[asset-manifest] wrote ${manifest.entries.length} entries`);
}
