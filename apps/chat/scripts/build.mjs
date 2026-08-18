import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const output = path.join(appRoot, 'dist');

execFileSync('npx', ['astro', 'build'], { cwd: appRoot, stdio: 'inherit' });
await fs.copyFile(
  path.join(repoRoot, 'packages', 'chat-client', 'browser.js'),
  path.join(output, 'chat-client.js'),
);

console.log('Built apps/chat/dist');
