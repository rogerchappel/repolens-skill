import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { analyzeRepoSnapshot } from '../src/index.js';
const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function load(name) { return JSON.parse(fs.readFileSync(path.join('fixtures', name), 'utf8')); }

test('repolens-skill produces stable fixture output', () => {
  const brief = analyzeRepoSnapshot(load('node-package.json'));
  assert.equal(brief.releaseReadiness, 'ship');
  assert.ok(brief.testCommands.some((cmd) => cmd.includes('npm run test')));

  const sparse = analyzeRepoSnapshot(load('sparse-repo.json'));
  assert.equal(sparse.releaseReadiness, 'incubate');
  assert.ok(sparse.riskSignals.length >= 2);
});

test('cli reports package version', () => {
  const version = execFileSync(process.execPath, ['bin/repolens-skill.js', '--version'], {
    encoding: 'utf8',
  }).trim();
  assert.equal(version, packageJson.version);
});
