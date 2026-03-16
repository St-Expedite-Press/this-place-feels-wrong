import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveCommand, runCommand } from "./lib/process-utils.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const workerDir = path.join(repoRoot, "apps", "communications-worker");

if (process.argv.includes("--help")) {
  console.log("Usage: npm run dev:worker");
  process.exit(0);
}

await runCommand(process.execPath, [path.join(scriptDir, "sync-worker-dev-vars.mjs")], {
  cwd: repoRoot,
  env: process.env,
});

await runCommand(resolveCommand("npx"), ["wrangler", "dev", "--remote"], {
  cwd: workerDir,
  env: process.env,
});

