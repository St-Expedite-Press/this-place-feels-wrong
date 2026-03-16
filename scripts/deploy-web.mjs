import path from "node:path";
import { fileURLToPath } from "node:url";

import { runCommand } from "./lib/process-utils.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const branch = process.env.DEPLOY_WEB_BRANCH || "main";

if (process.argv.includes("--help")) {
  console.log("Usage: npm run deploy:web");
  console.log("Env: DEPLOY_WEB_BRANCH=main");
  process.exit(0);
}

await runCommand(process.execPath, [path.join(scriptDir, "build-site.mjs")], {
  cwd: repoRoot,
  env: process.env,
});

await runCommand("git", ["push", "origin", branch], {
  cwd: repoRoot,
  env: process.env,
});

