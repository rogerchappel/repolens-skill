function hasReadme(files) {
  return files.some((file) => /(^|\/)README\.md$/i.test(file));
}

function hasTest(files) {
  return files.some((file) =>
    /(^|\/)(test|tests|__tests__)(\/|$)/i.test(file) || /\.(test|spec)\.[^/]+$/i.test(file));
}

function hasWorkflow(files) {
  return files.some((file) => /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(file));
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateRepoSnapshot(input) {
  if (!isObject(input)) {
    throw new TypeError('Invalid snapshot: expected a top-level JSON object.');
  }
  if (!Array.isArray(input.files) || input.files.some((file) => typeof file !== 'string')) {
    throw new TypeError('Invalid snapshot: "files" must be an array of strings.');
  }
  if (input.package !== undefined && input.package !== null && !isObject(input.package)) {
    throw new TypeError('Invalid snapshot: "package" must be an object or null.');
  }
  if (input.package && input.package.scripts !== undefined && !isObject(input.package.scripts)) {
    throw new TypeError('Invalid snapshot: "package.scripts" must be an object.');
  }
  const scripts = input.package?.scripts || {};
  for (const [name, command] of Object.entries(scripts)) {
    if (typeof command !== 'string') {
      throw new TypeError(`Invalid snapshot: script "${name}" must be a string.`);
    }
  }
}

function analyzeRepoSnapshot(input) {
  validateRepoSnapshot(input);
  const files = input.files;
  const scripts = input.package?.scripts || {};
  const gaps = [];
  if (!hasReadme(files)) gaps.push('README is missing.');
  if (!hasTest(files)) gaps.push('No obvious tests found.');
  if (!hasWorkflow(files)) gaps.push('No GitHub Actions workflow found.');
  if (!scripts.test) gaps.push('No package test script found.');
  const focusFiles = files.filter((file) => /package.json|README|src\/|test\/|docs\/|workflow/.test(file)).slice(0, 12);
  const commands = Object.entries(scripts).filter(([name]) => ['test', 'check', 'build', 'smoke'].includes(name)).map(([name, cmd]) => 'npm run ' + name + ' # ' + cmd);
  return { name: input.name || 'unknown-repo', fileCount: files.length, focusFiles, riskSignals: gaps, testCommands: commands.length ? commands : ['Inspect package metadata before running commands.'], releaseReadiness: gaps.length ? 'incubate' : 'ship', reviewOrder: ['Project metadata', 'Public docs', 'Core source', 'Tests and fixtures', 'CI and release notes'] };
}

export { analyzeRepoSnapshot, validateRepoSnapshot };
