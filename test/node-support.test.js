import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const lockfile = JSON.parse(
  readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'),
);
const workflow = readFileSync(
  new URL('../.github/workflows/ci.yml', import.meta.url),
  'utf8',
);

test('supported Node baseline is consistent across package metadata and CI', () => {
  assert.equal(packageJson.engines.node, '>=22');
  assert.equal(lockfile.packages[''].engines.node, packageJson.engines.node);
  assert.match(workflow, /node-version: 22/);
  assert.match(workflow, /run: npm ci/);
  assert.match(workflow, /run: npm run release:check/);
});
