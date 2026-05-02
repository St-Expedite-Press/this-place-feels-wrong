import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();

const historicalAllowlist = new Set([
  "CHANGELOG.md",
  "docs/state-of-play.md",
  "agent/kits/static-web/TOOLING_DISCUSSION.md",
  "agent/skills/docs-assay/SKILL.md",
  "scripts/check-tooling-integrity.mjs",
]);

const stalePatterns = [
  { label: "internal/agent", regex: /internal\/agent/g },
  { label: ".agents/skills", regex: /\.agents\/skills/g },
  { label: "AGENTS.md", regex: /\bAGENTS\.md\b/g },
];

const textExtensions = new Set([
  ".json",
  ".md",
  ".mjs",
  ".js",
  ".sh",
  ".yaml",
  ".yml",
  ".toml",
  ".ts",
  ".astro",
  ".txt",
  ".css",
  ".html",
]);

const skipDirs = new Set([
  ".git",
  "node_modules",
  ".venv",
  ".playwright-mcp",
  ".wrangler",
  ".reports",
]);

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function isTextFile(filePath) {
  const base = path.basename(filePath);
  if (base === "Makefile") return true;
  if (base.startsWith(".")) {
    return [".gitignore", ".mcp.json"].includes(base);
  }
  return textExtensions.has(path.extname(filePath));
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
      continue;
    }

    if (entry.isFile() && isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function assertJson(filePath) {
  JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function assertOpenApiReadable(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  if (!/^openapi:\s*3\./m.test(source)) {
    throw new Error(`OpenAPI header missing or invalid in ${rel(filePath)}`);
  }
}

async function assertRootScriptTargetsExist() {
  const pkg = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8"));
  for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
    const match = /^node\s+scripts\/run-bash\.mjs\s+([^\s]+(?:\.sh))\b/.exec(String(command));
    if (!match) continue;

    const target = path.join(repoRoot, match[1]);
    await fs.access(target).catch(() => {
      throw new Error(`package.json script "${name}" points to missing file: ${match[1]}`);
    });
  }
}

async function assertMakeTargetsExist() {
  const source = await fs.readFile(path.join(repoRoot, "Makefile"), "utf8");
  const matches = source.matchAll(/^\tsh\s+([A-Za-z0-9_./-]+\.sh)(?:\s|$)/gm);

  for (const match of matches) {
    const target = path.join(repoRoot, match[1]);
    await fs.access(target).catch(() => {
      throw new Error(`Makefile points to missing shell file: ${match[1]}`);
    });
  }
}

async function assertAgentKitConfigTargetsExist() {
  const configPath = path.join(repoRoot, "agent", "kits", "static-web", "agent.config.json");
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  const candidatePaths = [
    ...Object.values(config.entrypoints ?? {}),
    ...Object.values(config.paths ?? {}),
  ];

  for (const candidate of candidatePaths) {
    const target = path.join(repoRoot, String(candidate));
    await fs.access(target).catch(() => {
      throw new Error(`agent.config.json points to missing path: ${candidate}`);
    });
  }
}

async function assertNoStaleReferences() {
  const files = await walk(repoRoot);
  const failures = [];

  for (const filePath of files) {
    const relativePath = rel(filePath);
    if (historicalAllowlist.has(relativePath) || relativePath.startsWith("archive/")) {
      continue;
    }

    const source = await fs.readFile(filePath, "utf8");
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const pattern of stalePatterns) {
        if (pattern.regex.test(line)) {
          failures.push(`${relativePath}:${index + 1}: stale reference "${pattern.label}"`);
        }
        pattern.regex.lastIndex = 0;
      }
    });
  }

  if (failures.length) {
    throw new Error(failures.join("\n"));
  }
}

await assertJson(path.join(repoRoot, "docs", "ontology", "project-ontology.json"));
await assertJson(path.join(repoRoot, "agent", "kits", "static-web", "agent.config.json"));
await assertOpenApiReadable(path.join(repoRoot, "apps", "communications-worker", "openapi.yaml"));
await assertRootScriptTargetsExist();
await assertMakeTargetsExist();
await assertAgentKitConfigTargetsExist();
await assertNoStaleReferences();

console.log("Tooling integrity checks passed");
