import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const result = spawnSync('npm', ['pack', '--dry-run'], { encoding: 'utf8' });
const output = `${result.stdout || ''}\n${result.stderr || ''}`;
if (result.status !== 0) {
  process.stderr.write(output);
  process.exit(result.status || 1);
}

const required = [
  'bin/repolens-skill.js',
  'src/index.js',
  'src/render.js',
  'fixtures/node-package.json',
  'docs/RELEASE_CANDIDATE.md',
  'SKILL.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md'
];

const missing = required.filter((entry) => !output.includes(entry));
if (missing.length > 0) {
  console.error(`package smoke missing entries:\n${missing.join('\n')}`);
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const version = spawnSync(process.execPath, ['bin/repolens-skill.js', '--version'], {
  encoding: 'utf8',
});
if (version.status !== 0 || version.stdout.trim() !== packageJson.version) {
  console.error('package smoke failed: CLI --version did not match package.json');
  process.exit(1);
}

console.log('package smoke passed');
