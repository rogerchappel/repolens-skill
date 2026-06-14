function includesAny(files, needles) {
  return needles.some((needle) => files.some((file) => file === needle || file.includes(needle)));
}

function analyzeRepoSnapshot(input) {
  const files = Array.isArray(input.files) ? input.files.map(String) : [];
  const scripts = input.package && input.package.scripts ? input.package.scripts : {};
  const gaps = [];
  if (!includesAny(files, ['README.md'])) gaps.push('README is missing.');
  if (!includesAny(files, ['test/', '.test.', '.spec.'])) gaps.push('No obvious tests found.');
  if (!includesAny(files, ['.github/workflows'])) gaps.push('No GitHub Actions workflow found.');
  if (!scripts.test) gaps.push('No package test script found.');
  const focusFiles = files.filter((file) => /package.json|README|src\/|test\/|docs\/|workflow/.test(file)).slice(0, 12);
  const commands = Object.entries(scripts).filter(([name]) => ['test', 'check', 'build', 'smoke'].includes(name)).map(([name, cmd]) => 'npm run ' + name + ' # ' + cmd);
  return { name: input.name || 'unknown-repo', fileCount: files.length, focusFiles, riskSignals: gaps, testCommands: commands.length ? commands : ['Inspect package metadata before running commands.'], releaseReadiness: gaps.length ? 'incubate' : 'ship', reviewOrder: ['Project metadata', 'Public docs', 'Core source', 'Tests and fixtures', 'CI and release notes'] };
}

export { analyzeRepoSnapshot };
