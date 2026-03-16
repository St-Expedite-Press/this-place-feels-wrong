import path from "node:path";
import { fileURLToPath } from "node:url";

import { runCommand } from "./lib/process-utils.mjs";
import { startStaticServer } from "./lib/static-server.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const distDir = path.join(repoRoot, "dist", "site");
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "8000", 10);

if (process.argv.includes("--help")) {
  console.log("Usage: npm run dev:web");
  console.log("Env: HOST=127.0.0.1 PORT=8000");
  process.exit(0);
}

await runCommand(process.execPath, [path.join(scriptDir, "build-site.mjs")], {
  cwd: repoRoot,
  env: process.env,
});

const server = await startStaticServer({
  rootDir: distDir,
  host,
  port,
});

console.log(`Serving ${distDir} at http://${host}:${port}`);

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

