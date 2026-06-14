import fs from 'node:fs';
import cp from 'node:child_process';
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });
for (const file of ['README.md', 'SKILL.md', 'package.json']) fs.copyFileSync(file, 'dist/' + file);
cp.execFileSync('node', ['bin/repolens-skill.js', 'fixtures/node-package.json', '--format', 'json'], { stdio: ['ignore', 'pipe', 'inherit'] });
console.log('repolens-skill build passed');
