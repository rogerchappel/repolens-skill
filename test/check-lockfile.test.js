import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const script = new URL('../scripts/check-lockfile.js', import.meta.url);

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'repolens-lockfile-'));
  cpSync(new URL('../package.json', import.meta.url), join(directory, 'package.json'));
  cpSync(new URL('../package-lock.json', import.meta.url), join(directory, 'package-lock.json'));
  return directory;
}

test('lockfile check accepts synchronized package metadata', (t) => {
  const directory = fixture();
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const output = execFileSync(process.execPath, [script.pathname], {
    cwd: directory,
    encoding: 'utf8',
  });

  assert.match(output, /package-lock\.json is in sync/);
});

test('lockfile check rejects a missing lockfile', (t) => {
  const directory = fixture();
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  rmSync(join(directory, 'package-lock.json'));

  const result = spawnSync(process.execPath, [script.pathname], {
    cwd: directory,
    encoding: 'utf8',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /package-lock\.json is required/);
});

test('lockfile check rejects drift and leaves the lockfile unchanged', (t) => {
  const directory = fixture();
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const packagePath = join(directory, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = '0.1.1';
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  const lockPath = join(directory, 'package-lock.json');
  const original = readFileSync(lockPath, 'utf8');

  const result = spawnSync(process.execPath, [script.pathname], {
    cwd: directory,
    encoding: 'utf8',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /package-lock\.json is out of sync/);
  assert.equal(readFileSync(lockPath, 'utf8'), original);
});
