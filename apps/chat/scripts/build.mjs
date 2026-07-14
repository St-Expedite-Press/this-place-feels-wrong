import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const source = path.join(appRoot, 'src');
const output = path.join(appRoot, 'dist');

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await fs.cp(source, output, { recursive: true });
await fs.copyFile(
  path.join(repoRoot, 'packages', 'chat-client', 'browser.js'),
  path.join(output, 'chat-client.js'),
);

console.log('Built apps/chat/dist');
