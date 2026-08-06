import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
const temporaryRoot = mkdtempSync(join(tmpdir(), 'repolens-package-smoke-'));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) {
    const output = `${result.stdout || ''}${result.stderr || ''}`;
    throw new Error(`${command} ${args.join(' ')} failed\n${output}`);
  }
  return result.stdout.trim();
}

try {
  const packOutput = run('npm', ['pack', '--json', '--pack-destination', temporaryRoot], {
    cwd: projectRoot,
  });
  const [{ filename, files }] = JSON.parse(packOutput);
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
    'CHANGELOG.md',
  ];
  const packedPaths = new Set(files.map((file) => file.path));
  const missing = required.filter((entry) => !packedPaths.has(entry));
  if (missing.length > 0) {
    throw new Error(`packed artifact is missing entries:\n${missing.join('\n')}`);
  }

  const consumer = join(temporaryRoot, 'consumer');
  mkdirSync(consumer);
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true }));
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', join(temporaryRoot, filename)], {
    cwd: consumer,
  });

  const executable = join(
    consumer,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'repolens-skill.cmd' : 'repolens-skill',
  );
  const fixture = join(consumer, 'node_modules', 'repolens-skill', 'fixtures', 'node-package.json');
  const executableOptions = process.platform === 'win32' ? { shell: true } : {};

  const version = run(executable, ['--version'], executableOptions);
  if (version !== packageJson.version) {
    throw new Error(`installed CLI reported version ${version}, expected ${packageJson.version}`);
  }

  const help = run(executable, ['--help'], executableOptions);
  if (!help.includes('Usage: repolens-skill <input.json> [--format markdown|json]')) {
    throw new Error('installed CLI did not print the documented help');
  }

  const markdown = run(executable, [fixture, '--format', 'markdown'], executableOptions);
  if (!markdown.startsWith('# sample-node') || !markdown.includes('## Release Readiness\nship')) {
    throw new Error('installed CLI did not render the fixture as documented markdown');
  }

  const json = JSON.parse(run(executable, [fixture, '--format', 'json'], executableOptions));
  if (json.name !== 'sample-node' || json.releaseReadiness !== 'ship') {
    throw new Error('installed CLI did not render the fixture as documented JSON');
  }

  console.log('package smoke passed: packed tarball installed and CLI verified');
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
