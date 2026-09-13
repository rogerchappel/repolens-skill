import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
const BIN = path.join('bin', 'repolens-skill.js');

test('cli --help prints usage and exits cleanly', () => {
  const result = spawnSync(process.execPath, [BIN, '--help'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.ok(result.stdout.includes('Usage: repolens-skill'));
  assert.ok(result.stdout.includes('--format markdown|json'));
});

test('cli --help ignores any positional arguments passed with it', () => {
  // --help must be used by itself; passing extra args should trigger an error
  const result = spawnSync(process.execPath, [BIN, '--help', 'fixtures/node-package.json'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('must be used by itself'));
});

test('cli reports error for missing input file (file not found)', () => {
  const nonExistent = path.join('fixtures', `nonexistent-${Date.now()}.json`);
  const result = spawnSync(process.execPath, [BIN, nonExistent], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^Failed to read JSON input:/i);
  fs.rmSync(nonExistent, { force: true });
});

test('cli rejects unsupported format values', () => {
  for (const fmt of ['xml', 'csv', 'html', 'text']) {
    const result = spawnSync(process.execPath, [
      BIN, 'fixtures/node-package.json', '--format', fmt,
    ], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^Unsupported format: /);
  }
});

test('cli renders valid snapshot as markdown when --format markdown', () => {
  const output = execFileSync(process.execPath, [BIN, 'fixtures/node-package.json', '--format', 'markdown'], {
    encoding: 'utf8',
  });
  assert.ok(output.startsWith('# sample-node'));
  assert.ok(output.includes('## File Count'));
  assert.ok(output.includes('## Focus Files'));
});

test('cli renders valid snapshot as json when --format json', () => {
  const output = execFileSync(process.execPath, [BIN, 'fixtures/node-package.json', '--format', 'json'], {
    encoding: 'utf8',
  });
  const parsed = JSON.parse(output);
  assert.equal(parsed.name, 'sample-node');
  assert.ok(Array.isArray(parsed.focusFiles));
  assert.ok(typeof parsed.releaseReadiness === 'string');
});

test('cli no-args reports missing input file and exits 1', () => {
  const result = spawnSync(process.execPath, [BIN], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.ok(result.stderr.includes('Missing input file'));
});
