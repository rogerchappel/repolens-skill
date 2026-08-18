#!/usr/bin/env node
import fs from 'node:fs';
import { analyzeRepoSnapshot } from '../src/index.js';
import { renderMarkdown } from '../src/render.js';

const args = process.argv.slice(2);
const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(values) {
  let file;
  let format = 'markdown';

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--format') {
      const next = values[index + 1];
      if (!next || next.startsWith('--')) fail('Missing value for --format.');
      format = next;
      index += 1;
    } else if (value.startsWith('--')) {
      fail('Unknown option: ' + value);
    } else if (file) {
      fail('Unexpected positional argument: ' + value);
    } else {
      file = value;
    }
  }

  return { file, format };
}

if (args.includes('--version')) {
  console.log(packageJson.version);
  process.exit(0);
}

if (args.includes('--help')) {
  console.log('Usage: repolens-skill <input.json> [--format markdown|json]');
  process.exit(0);
}

const { file, format } = parseArgs(args);
if (!file) fail('Missing input file. Usage: repolens-skill <input.json> [--format markdown|json]');
if (!['markdown', 'json'].includes(format)) {
  fail('Unsupported format: ' + format);
}
let input;
try { input = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (error) { console.error('Failed to read JSON input: ' + error.message); process.exit(1); }
let result;
try { result = analyzeRepoSnapshot(input); }
catch (error) { console.error(error.message); process.exit(1); }
console.log(format === 'json' ? JSON.stringify(result, null, 2) : renderMarkdown(result));
