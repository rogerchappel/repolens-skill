# Changelog

## 0.1.0

- Normalize Windows and POSIX snapshot path separators and use consistent,
  boundary-aware matching for readiness signals and focus-file selection.
- Use a committed npm lockfile for reproducible local and CI installs, with a
  release check that rejects missing or stale lockfile state.
- Initial public skill package with local repository review brief generation,
  fixture-backed tests, CLI smoke coverage, and package smoke validation.
