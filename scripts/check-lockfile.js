import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const lockfile = 'package-lock.json';
if (!existsSync(lockfile)) {
  console.error('package-lock.json is required; restore it and run npm install --package-lock-only');
  process.exit(1);
}

const original = readFileSync(lockfile);
const result = spawnSync(
  'npm',
  ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
  { encoding: 'utf8' },
);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout || 'npm could not validate package-lock.json\n');
  process.exit(result.status || 1);
}

const generated = readFileSync(lockfile);
if (!generated.equals(original)) {
  writeFileSync(lockfile, original);
  console.error('package-lock.json is out of sync with package.json; run npm install --package-lock-only');
  process.exit(1);
}

console.log('package-lock.json is in sync with package.json');
