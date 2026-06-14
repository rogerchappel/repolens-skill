import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { analyzeRepoSnapshot } from '../src/index.js';

function load(name) { return JSON.parse(fs.readFileSync(path.join('fixtures', name), 'utf8')); }

test('repolens-skill produces stable fixture output', () => {
  const brief = analyzeRepoSnapshot(load('node-package.json'));
  assert.equal(brief.releaseReadiness, 'ship');
  assert.ok(brief.testCommands.some((cmd) => cmd.includes('npm run test')));

  const sparse = analyzeRepoSnapshot(load('sparse-repo.json'));
  assert.equal(sparse.releaseReadiness, 'incubate');
  assert.ok(sparse.riskSignals.length >= 2);
});
