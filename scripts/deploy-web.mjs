import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveCommand, runCommand, runCommandCapture } from "./lib/process-utils.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const webDir = path.join(repoRoot, "apps", "web");
const distDir = path.join(webDir, "dist");
const project = process.env.CF_PAGES_PROJECT || "stexpedite-press";
const npmCommand = resolveCommand("npm");
const npxCommand = resolveCommand("npx");
const requiredEnvVars = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"];

if (process.argv.includes("--help")) {
  console.log("Usage: npm run deploy:web");
  console.log("Env: CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... CF_PAGES_PROJECT=stexpedite-press");
  process.exit(0);
}

function fail(message) {
  const error = new Error(message);
  error.isUserFacing = true;
  throw error;
}

function readRequiredEnv(name) {
  const value = String(process.env[name] ?? "").trim();
  if (!value) {
    fail(`Missing required environment variable: ${name}.`);
  }
  return value;
}

function formatKnownProjects(projects) {
  const names = projects
    .map((entry) => String(entry?.name ?? "").trim())
    .filter(Boolean)
    .slice(0, 8);

  return names.length ? names.join(", ") : "none returned";
}

async function listPagesProjects(env) {
  try {
    const { stdout } = await runCommandCapture(npxCommand, ["wrangler", "pages", "project", "list", "--json"], {
      cwd: repoRoot,
      env,
    });
    return JSON.parse(stdout.trim());
  } catch (error) {
    const details = [error?.stdout, error?.stderr, error?.message].filter(Boolean).join("\n");

    if (/api token|unauthorized|forbidden|authentication|not authenticated|authorization/i.test(details)) {
      fail("Cloudflare rejected CLOUDFLARE_API_TOKEN while verifying Pages access.");
    }

    if (
      /account.?id|could not find account|unknown account|invalid account|not a member of account|object identifier is invalid|code:\s*7003/i.test(
        details,
      )
    ) {
      fail("Cloudflare rejected CLOUDFLARE_ACCOUNT_ID while verifying Pages access.");
    }

    fail(`Unable to verify Cloudflare Pages access with Wrangler.\n${details}`.trim());
  }
}

async function assertPagesProjectAccess() {
  const env = { ...process.env };
  for (const name of requiredEnvVars) {
    env[name] = readRequiredEnv(name);
  }

  const projects = await listPagesProjects(env);
  if (!Array.isArray(projects)) {
    fail("Wrangler returned an unexpected Cloudflare Pages project list response.");
  }

  const hasProject = projects.some((entry) => String(entry?.name ?? "").trim() === project);
  if (!hasProject) {
    fail(
      `Cloudflare Pages project "${project}" is not visible with the supplied CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID. Known projects: ${formatKnownProjects(projects)}.`,
    );
  }

  return env;
}

async function main() {
  const deployEnv = await assertPagesProjectAccess();

  await runCommand(process.execPath, ["-e", ""], {
    cwd: webDir,
    env: deployEnv,
  }).catch(() => {});

  await runCommand(npmCommand, ["--prefix", "apps/web", "run", "build"], {
    cwd: repoRoot,
    env: deployEnv,
  });

  await runCommand(npxCommand, ["wrangler", "pages", "deploy", distDir, "--project-name", project], {
    cwd: repoRoot,
    env: deployEnv,
  });
}

await main().catch((error) => {
  if (error?.isUserFacing) {
    console.error(error.message);
  } else {
    console.error(error?.stack ?? String(error));
  }
  process.exit(1);
});
