import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

execFileSync('npx', ['astro', 'build'], { cwd: appRoot, stdio: 'inherit' });

console.log('Built apps/admin/dist');
