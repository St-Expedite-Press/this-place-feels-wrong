import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const [, , scriptPath, ...args] = process.argv;

if (!scriptPath) {
  console.error("Usage: node scripts/run-bash.mjs <script> [args...]");
  process.exit(1);
}

const resolvedScript = path.resolve(process.cwd(), scriptPath);

let runner;
if (process.platform === "win32") {
  const translated = spawnSync("wsl.exe", ["wslpath", "-a", resolvedScript.replaceAll("\\", "/")], {
    encoding: "utf8",
  });

  if (translated.status !== 0) {
    console.error(translated.stderr || "Failed to translate Windows path for WSL");
    process.exit(translated.status ?? 1);
  }

  runner = {
    command: "wsl.exe",
    args: ["sh", translated.stdout.trim(), ...args],
  };
} else {
  runner = { command: "sh", args: [resolvedScript, ...args] };
}

const child = spawn(runner.command, runner.args, {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
