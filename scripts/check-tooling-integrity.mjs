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

function collectWorkerRoutes(source) {
  const routes = new Set();
  const matches = source.matchAll(/url\.pathname\s*===\s*"([^"]+)"/g);
  for (const match of matches) {
    const lineStart = source.lastIndexOf("\n", match.index) + 1;
    const lineEnd = source.indexOf("\n", match.index);
    const line = source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd);
    const methodMatch = /request\.method\s*===\s*"([A-Z]+)"/.exec(line);
    routes.add(`${methodMatch?.[1] ?? "POST"} ${match[1]}`);
  }
  return routes;
}

function collectOpenApiRoutes(source) {
  const routes = new Set();
  let currentPath = "";
  const methodNames = new Set(["get", "post", "put", "patch", "delete", "options"]);
  for (const line of source.split(/\r?\n/)) {
    const pathMatch = /^  (\/api\/[^:]+):\s*$/.exec(line);
    if (pathMatch) {
      currentPath = pathMatch[1];
      continue;
    }
    const methodMatch = /^    ([a-z]+):\s*$/.exec(line);
    if (currentPath && methodMatch && methodNames.has(methodMatch[1])) {
      routes.add(`${methodMatch[1].toUpperCase()} ${currentPath}`);
    }
  }
  return routes;
}

function collectJsonOntologyRoutes(ontology) {
  return new Set(Object.keys(ontology?.apps?.communications_worker?.routes ?? {}));
}

function collectBacktickRoutes(source) {
  const routes = new Set();
  const matches = source.matchAll(/`(GET|POST|PUT|PATCH|DELETE|OPTIONS) (\/api\/[^`]+)`/g);
  for (const match of matches) {
    routes.add(`${match[1]} ${match[2]}`);
  }
  return routes;
}

function collectTableRoutes(source) {
  const routes = new Set();
  const matches = source.matchAll(/\|\s*(GET|POST|PUT|PATCH|DELETE|OPTIONS)\s*\|\s*`(\/api\/[^`]+)`/g);
  for (const match of matches) {
    routes.add(`${match[1]} ${match[2]}`);
  }
  return routes;
}

async function assertApiRouteParity() {
  const workerSource = await fs.readFile(path.join(repoRoot, "apps", "communications-worker", "src", "index.ts"), "utf8");
  const expected = collectWorkerRoutes(workerSource);
  const failures = [];

  const checks = [
    {
      label: "apps/communications-worker/openapi.yaml",
      routes: collectOpenApiRoutes(await fs.readFile(path.join(repoRoot, "apps", "communications-worker", "openapi.yaml"), "utf8")),
    },
    {
      label: "docs/ontology/project-ontology.json",
      routes: collectJsonOntologyRoutes(JSON.parse(await fs.readFile(path.join(repoRoot, "docs", "ontology", "project-ontology.json"), "utf8"))),
    },
    {
      label: "docs/ontology/ontology.md",
      routes: collectBacktickRoutes(await fs.readFile(path.join(repoRoot, "docs", "ontology", "ontology.md"), "utf8")),
    },
    {
      label: "README.md",
      routes: collectBacktickRoutes(await fs.readFile(path.join(repoRoot, "README.md"), "utf8")),
    },
    {
      label: "docs/state-of-play.md",
      routes: collectBacktickRoutes(await fs.readFile(path.join(repoRoot, "docs", "state-of-play.md"), "utf8")),
    },
    {
      label: "apps/communications-worker/README.md",
      routes: collectBacktickRoutes(await fs.readFile(path.join(repoRoot, "apps", "communications-worker", "README.md"), "utf8")),
    },
    {
      label: "AGENTS.md",
      routes: collectTableRoutes(await fs.readFile(path.join(repoRoot, "AGENTS.md"), "utf8")),
    },
  ];

  for (const check of checks) {
    for (const route of expected) {
      if (!check.routes.has(route)) {
        failures.push(`${check.label}: missing API route ${route}`);
      }
    }
  }

  if (failures.length) {
    throw new Error(failures.join("\n"));
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
await fs.access(path.join(repoRoot, "docs", "ontology", "ontology.md"));
await assertJson(path.join(repoRoot, "agent", "kits", "static-web", "agent.config.json"));
await assertOpenApiReadable(path.join(repoRoot, "apps", "communications-worker", "openapi.yaml"));
await assertApiRouteParity();
await assertRootScriptTargetsExist();
await assertMakeTargetsExist();
await assertAgentKitConfigTargetsExist();
await assertNoStaleReferences();

console.log("Tooling integrity checks passed");
