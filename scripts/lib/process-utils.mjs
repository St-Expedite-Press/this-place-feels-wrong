import { spawn } from "node:child_process";

export function resolveCommand(baseName) {
  return process.platform === "win32" ? `${baseName}.cmd` : baseName;
}

export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const spawnOptions = {
      stdio: "inherit",
      ...options,
    };

    if (process.platform === "win32" && command.toLowerCase().endsWith(".cmd")) {
      spawnOptions.shell = true;
    }

    const child = spawn(command, args, {
      ...spawnOptions,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited with signal ${signal}`));
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 1}`));
    });
  });
}
