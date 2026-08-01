import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
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

test('lookalike paths do not satisfy repository readiness checks', () => {
  const brief = analyzeRepoSnapshot({
    files: ['docs/NOTREADME.md', 'contest/example.js', 'notes/.github/workflows-old.yml'],
    package: { scripts: { test: 'node --test' } },
  });

  assert.equal(brief.releaseReadiness, 'incubate');
  assert.deepEqual(brief.riskSignals, [
    'README is missing.',
    'No obvious tests found.',
    'No GitHub Actions workflow found.',
  ]);
});

test('valid nested README and test paths plus an anchored workflow are detected', () => {
  const brief = analyzeRepoSnapshot({
    files: ['docs/README.md', 'packages/core/tests/unit.js', '.github/workflows/ci.yaml'],
    package: { scripts: { test: 'node --test' } },
  });

  assert.equal(brief.releaseReadiness, 'ship');
  assert.deepEqual(brief.riskSignals, []);
});

test('test and spec filenames are detected without matching lookalike directories', () => {
  for (const file of ['src/index.test.js', 'src/index.spec.mjs']) {
    const brief = analyzeRepoSnapshot({
      files: ['README.md', file, '.github/workflows/ci.yml'],
      package: { scripts: { test: 'node --test' } },
    });
    assert.equal(brief.releaseReadiness, 'ship');
  }
});

test('cli rejects invalid snapshot shapes without a stack trace', () => {
  for (const contents of ['null', '[]', '{']) {
    const fixture = path.join(process.cwd(), `invalid-${Math.random()}.json`);
    fs.writeFileSync(fixture, contents);
    try {
      const result = spawnSync(process.execPath, ['bin/repolens-skill.js', fixture], { encoding: 'utf8' });
      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      assert.doesNotMatch(result.stderr, /\n\s+at /);
      assert.match(result.stderr, contents === '{'
        ? /^Failed to read JSON input:/
        : /^Invalid snapshot: expected a top-level JSON object\.\n$/);
    } finally {
      fs.rmSync(fixture);
    }
  }
});
