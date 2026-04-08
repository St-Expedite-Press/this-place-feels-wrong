import path from "node:path";
import { fileURLToPath } from "node:url";

import { runCommand } from "./lib/process-utils.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const webDir = path.join(repoRoot, "apps", "web");
const distDir = path.join(webDir, "dist");
const project = process.env.CF_PAGES_PROJECT || "stexpedite-press";

if (process.argv.includes("--help")) {
  console.log("Usage: npm run deploy:web");
  console.log("Env: CF_PAGES_PROJECT=stexpedite-press");
  process.exit(0);
}

await runCommand(process.execPath, ["-e", ""], {
  cwd: webDir,
  env: process.env,
}).catch(() => {});

await runCommand("npm", ["--prefix", "apps/web", "run", "build"], {
  cwd: repoRoot,
  env: process.env,
});

await runCommand("npx", ["wrangler", "pages", "deploy", distDir, "--project-name", project], {
  cwd: repoRoot,
  env: process.env,
});
