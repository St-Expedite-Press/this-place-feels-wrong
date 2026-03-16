import { access, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveCommand, runCommand } from "./lib/process-utils.mjs";
import { startStaticServer } from "./lib/static-server.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const distDir = path.join(repoRoot, "dist", "site");
const reportsDir = path.join(repoRoot, ".reports");
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "4175", 10);
const reportPath = path.join(reportsDir, "lighthouse.json");

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function hasChrome() {
  if (process.env.CHROME_PATH) {
    return true;
  }

  if (process.platform === "win32") {
    const browserCommands = [
      ["where.exe", ["chrome"]],
      ["where.exe", ["msedge"]],
      ["where.exe", ["chromium"]],
    ];

    for (const [command, args] of browserCommands) {
      const probe = spawnSync(command, args, { stdio: "ignore" });
      if (probe.status === 0) {
        return true;
      }
    }
  }

  const candidates =
    process.platform === "win32"
      ? [
          path.join(process.env["PROGRAMFILES"] || "", "Google", "Chrome", "Application", "chrome.exe"),
          path.join(process.env["PROGRAMFILES(X86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
          path.join(process.env["PROGRAMFILES"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
          path.join(process.env["PROGRAMFILES(X86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
        ]
      : ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];

  for (const candidate of candidates) {
    if (candidate && (await exists(candidate))) {
      return true;
    }
  }

  return false;
}

if (!(await exists(distDir))) {
  console.error(`Dist directory not found: ${distDir}. Run build first.`);
  process.exit(1);
}

if (!(await hasChrome())) {
  console.log("Chrome/Chromium not found; set CHROME_PATH to enable Lighthouse");
  process.exit(0);
}

const server = await startStaticServer({
  rootDir: distDir,
  host,
  port,
});

try {
  await mkdir(reportsDir, { recursive: true });
  try {
    await runCommand(resolveCommand("npx"), [
      "-y",
      "lighthouse",
      `http://${host}:${port}/index.html`,
      "--quiet",
      "--output",
      "json",
      "--output-path",
      reportPath,
      "--chrome-flags=--headless --no-sandbox",
    ], {
      cwd: repoRoot,
      env: process.env,
    });
  } catch (error) {
    if (!process.env.CHROME_PATH) {
      console.log("Chrome/Chromium could not be launched; set CHROME_PATH to enable Lighthouse");
      process.exit(0);
    }

    throw error;
  }

  console.log(`Lighthouse report written to ${reportPath}`);
} finally {
  server.close();
}
