// Docs coverage checker.
//
// Asserts every Markdown doc in the monorepo is "accounted for": either
// linked from a documentation hub (README.md, docs/README.md, ONTOLOGY.md)
// or covered by a documented naming/location convention that the README
// declares. Exits non-zero and lists any orphaned docs.
//
// Run: node scripts/check-docs-coverage.mjs   (npm run check:docs)

import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();

const SKIP_DIRS = new Set([
  ".git", "node_modules", "_site", "dist", ".venv",
  ".wrangler", ".playwright-mcp", ".reports",
]);

// Hubs whose links count as "hinted at from the README" (README points to
// docs/README.md, so its links are transitively reachable from the README).
const HUBS = ["README.md", "docs/README.md", "ONTOLOGY.md"];

// Convention-covered docs. These are declared in README.md § Documentation.
const CONVENTION_BASENAMES = new Set([
  "AGENTS.md", "MEMORY.md", "README.md", "SKILL.md",
]);
const CONVENTION_DIRS = ["archive/", "audit/", "kits/"];

function rel(p) {
  return path.relative(repoRoot, p).split(path.sep).join("/");
}

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) out.push(full);
  }
  return out;
}

async function referencedPaths() {
  const refs = new Set();
  for (const hub of HUBS) {
    const abs = path.join(repoRoot, hub);
    let src;
    try { src = await fs.readFile(abs, "utf8"); } catch { continue; }
    const hubDir = path.dirname(abs);
    // any token that looks like a path ending in .md (link target or inline)
    for (const m of src.matchAll(/[\w./-]+\.md/g)) {
      let target = m[0].split("#")[0];
      const resolved = rel(path.resolve(hubDir, target));
      refs.add(resolved);
    }
  }
  return refs;
}

function isConventionCovered(relPath) {
  if (CONVENTION_BASENAMES.has(path.basename(relPath))) return true;
  return CONVENTION_DIRS.some((d) => relPath.startsWith(d));
}

const docs = (await walk(repoRoot)).map(rel).sort();
const refs = await referencedPaths();

const orphans = docs.filter((d) => !refs.has(d) && !isConventionCovered(d));

if (orphans.length) {
  console.error(`Docs coverage FAILED — ${orphans.length} doc(s) not accounted for:`);
  for (const o of orphans) console.error(`  - ${o}`);
  console.error("\nFix: link it from docs/README.md (or README.md/ONTOLOGY.md),");
  console.error("or place it under a documented convention (AGENTS/MEMORY/README/SKILL, archive/, audit/, kits/).");
  process.exit(1);
}

console.log(`Docs coverage PASS — ${docs.length} docs accounted for (${refs.size} explicit links + conventions).`);
