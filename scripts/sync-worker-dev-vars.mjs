import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const rootEnvPath = path.join(repoRoot, ".env");
const workerDir = path.join(repoRoot, "apps", "communications-worker");
const workerDevVarsPath = path.join(workerDir, ".dev.vars");

const REQUIRED_KEYS = [
  "RESEND_API_KEY",
  "FOURTH_WALL_API_KEY",
  "TURNSTILE_SECRET",
  "UPDATES_IMPORT_TOKEN",
];

const OPTIONAL_DEFAULTS = {
  FROM_EMAIL: "St. Expedite Press <no-reply@stexpedite.press>",
  TO_EMAIL: "editor@stexpedite.press",
  RATE_LIMIT_MAX: "20",
  RATE_LIMIT_WINDOW_MS: "60000",
};

function parseDotenv(source) {
  const result = new Map();
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1);
    result.set(key, value);
  }
  return result;
}

if (!fs.existsSync(rootEnvPath)) {
  console.error("Missing root .env file");
  process.exit(1);
}

const rootEnv = parseDotenv(fs.readFileSync(rootEnvPath, "utf8"));
const outputLines = [
  "# Generated from repo root .env by scripts/sync-worker-dev-vars.mjs",
  "# Do not commit secrets.",
];

for (const [key, fallback] of Object.entries(OPTIONAL_DEFAULTS)) {
  const value = rootEnv.get(key) ?? fallback;
  outputLines.push(`${key}=${value}`);
}

for (const key of REQUIRED_KEYS) {
  const value = rootEnv.get(key);
  if (!value) continue;
  outputLines.push(`${key}=${value}`);
}

fs.writeFileSync(workerDevVarsPath, `${outputLines.join("\n")}\n`, "utf8");
console.log(`Wrote ${path.relative(repoRoot, workerDevVarsPath)}`);
