import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [, , scriptPath, ...args] = process.argv;

if (!scriptPath) {
  console.error("Usage: node scripts/run-bash.mjs <script> [args...]");
  process.exit(1);
}

const resolvedScript = path.resolve(process.cwd(), scriptPath);

function findWindowsShell() {
  const candidates = [
    process.env.BASH,
    process.env.SH,
    "C:\\Program Files\\Git\\bin\\bash.exe",
    "C:\\Program Files\\Git\\usr\\bin\\sh.exe",
    "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
    "C:\\Program Files (x86)\\Git\\usr\\bin\\sh.exe",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  for (const command of ["bash.exe", "sh.exe"]) {
    const probe = spawnSync("where.exe", [command], { encoding: "utf8" });
    if (probe.status === 0) {
      const [first] = probe.stdout.split(/\r?\n/).filter(Boolean);
      if (first) return first;
    }
  }

  return null;
}

let runner;
if (process.platform === "win32") {
  const translated = spawnSync("wsl.exe", ["wslpath", "-a", resolvedScript.replaceAll("\\", "/")], {
    encoding: "utf8",
  });

  if (translated.status === 0) {
    runner = {
      command: "wsl.exe",
      args: ["sh", translated.stdout.trim(), ...args],
    };
  } else {
    const shell = findWindowsShell();
    if (!shell) {
      console.error("No shell runner found. Install WSL or Git for Windows to run repo shell scripts.");
      process.exit(1);
    }
    runner = {
      command: shell,
      args: [resolvedScript.replaceAll("\\", "/"), ...args],
    };
  }
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
