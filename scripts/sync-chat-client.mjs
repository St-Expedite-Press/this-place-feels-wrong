import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const source = path.join(repoRoot, 'packages', 'chat-client', 'browser.js');
const targets = [
  path.join(repoRoot, 'apps', 'stex', 'public', 'assets', 'js', 'chat-client.js'),
  path.join(repoRoot, 'apps', 'rice', 'chat-client.js'),
];
const checkOnly = process.argv.includes('--check');
const expected = fs.readFileSync(source);
let drift = false;

for (const target of targets) {
  const relative = path.relative(repoRoot, target);
  if (checkOnly) {
    const current = fs.existsSync(target) ? fs.readFileSync(target) : null;
    if (!current || !current.equals(expected)) {
      console.error(`Shared chat client drift: ${relative}`);
      drift = true;
    }
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, expected);
  console.log(`Synced ${relative}`);
}

if (drift) process.exit(1);
