import { spawn } from "node:child_process";

export function resolveCommand(baseName) {
  return process.platform === "win32" ? `${baseName}.cmd` : baseName;
}

function buildSpawnOptions(command, options = {}, defaultStdio) {
  const spawnOptions = {
    stdio: defaultStdio,
    ...options,
  };

  if (process.platform === "win32" && command.toLowerCase().endsWith(".cmd")) {
    spawnOptions.shell = true;
  }

  return spawnOptions;
}

export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const spawnOptions = buildSpawnOptions(command, options, "inherit");

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

export function runCommandCapture(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const spawnOptions = buildSpawnOptions(command, options, ["ignore", "pipe", "pipe"]);
    const child = spawn(command, args, {
      ...spawnOptions,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        const error = new Error(`${command} exited with signal ${signal}`);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }

      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const error = new Error(`${command} exited with code ${code ?? 1}`);
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}
