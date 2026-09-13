import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderMarkdown } from '../src/render.js';

test('renderMarkdown renders an empty riskSignals array as "- None"', () => {
  const result = renderMarkdown({ name: 'test', riskSignals: [] });
  assert.ok(result.includes('## Risk Signals'));
  assert.ok(result.includes('- None'));
});

test('renderMarkdown renders a non-empty riskSignals array as bullet list', () => {
  const result = renderMarkdown({
    name: 'bare-bones',
    title: 'Review',
    riskSignals: ['README is missing.', 'No tests found.'],
  });
  assert.ok(result.split('\n').length >= 5);
  assert.ok(result.includes('- README is missing.'));
  assert.ok(result.includes('- No tests found.'));
  // Should not contain '- None' when there are items
  assert.equal(result.indexOf('- None'), -1);
});

test('renderMarkdown renders an empty focusFiles array as "- None"', () => {
  const result = renderMarkdown({ name: 'empty-focus', focusFiles: [] });
  assert.ok(result.includes('## Focus Files'));
  assert.ok(result.includes('- None'));
});

test('renderMarkdown renders non-empty focusFiles as bullet list', () => {
  const result = renderMarkdown({
    name: 'focused',
    focusFiles: ['README.md', 'package.json'],
  });
  assert.ok(result.includes('- README.md'));
  assert.ok(result.includes('- package.json'));
});

test('renderMarkdown handles a null title by falling back to name', () => {
  const result = renderMarkdown({ name: 'fallback-name', riskSignals: [] });
  assert.equal(result.startsWith('# fallback-name'), true);
});

test('renderMarkdown handles an undefined title by falling back to name', () => {
  const result = renderMarkdown({ name: 'undef-title-fallback', riskSignals: [] });
  assert.equal(result.startsWith('# undef-title-fallback'), true);
});

test('renderMarkdown handles a completely blank result object', () => {
  const result = renderMarkdown({});
  assert.ok(result.startsWith('# Brief'));
});

test('renderMarkdown renders testCommands bullet list', () => {
  const result = renderMarkdown({
    name: 'cmded',
    testCommands: ['npm run test # node --test', 'npm run check # eslint src/'],
  });
  assert.ok(result.includes('## Test Commands'));
  assert.ok(result.includes('- npm run test # node --test'));
  assert.ok(result.includes('- npm run check # eslint src/'));
});

test('renderMarkdown renders reviewOrder as bullet list', () => {
  const result = renderMarkdown({
    name: 'ordered',
    reviewOrder: ['Project metadata', 'Public docs', 'Core source'],
  });
  assert.ok(result.includes('## Review Order'));
  assert.ok(result.includes('- Project metadata'));
  assert.ok(result.includes('- Public docs'));
});

test('renderMarkdown does not emit a section for title or name keys', () => {
  const result = renderMarkdown({
    title: 'Custom Title',
    name: 'ignored-name',
    riskSignals: [],
  });
  // There should be only one '# ' header line for the top-level heading
  const headers = result.match(/^# .+$/gm);
  assert.equal(headers.length, 1);
  assert.equal(headers[0], '# Custom Title');
});
