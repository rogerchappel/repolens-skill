import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const lockfile = 'package-lock.json';
if (!existsSync(lockfile)) {
  console.error('package-lock.json is required; restore it and run npm install --package-lock-only');
  process.exit(1);
}

const original = readFileSync(lockfile);
let failure;
try {
  const result = spawnSync(
    'npm',
    ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
    { encoding: 'utf8' },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    failure = result.stderr || result.stdout || 'npm could not validate package-lock.json\n';
  } else if (!readFileSync(lockfile).equals(original)) {
    failure = 'package-lock.json is out of sync with package.json; run npm install --package-lock-only\n';
  }
} catch (error) {
  failure = `${error.message}\n`;
} finally {
  // npm may modify the tracked file even when it exits unsuccessfully or
  // validation itself throws. Restore the original bytes on every path.
  writeFileSync(lockfile, original);
}

if (failure) {
  process.stderr.write(failure);
  process.exit(1);
}

console.log('package-lock.json is in sync with package.json');
