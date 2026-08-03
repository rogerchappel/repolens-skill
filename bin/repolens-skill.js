#!/usr/bin/env node
import fs from 'node:fs';
import { analyzeRepoSnapshot } from '../src/index.js';
import { renderMarkdown } from '../src/render.js';

const args = process.argv.slice(2);
const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const file = args[0];
const formatIndex = args.indexOf('--format');
const format = formatIndex >= 0 ? args[formatIndex + 1] : 'markdown';

if (args.includes('--version')) {
  console.log(packageJson.version);
  process.exit(0);
}

if (!file || args.includes('--help')) {
  console.log('Usage: repolens-skill <input.json> [--format markdown|json]');
  process.exit(file ? 0 : 1);
}
if (!['markdown', 'json'].includes(format)) {
  console.error('Unsupported format: ' + format);
  process.exit(1);
}
let input;
try { input = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (error) { console.error('Failed to read JSON input: ' + error.message); process.exit(1); }
let result;
try { result = analyzeRepoSnapshot(input); }
catch (error) { console.error(error.message); process.exit(1); }
console.log(format === 'json' ? JSON.stringify(result, null, 2) : renderMarkdown(result));
