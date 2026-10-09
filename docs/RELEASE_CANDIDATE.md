# Release Candidate Notes

## Classification

ship

## Included

- Local-first CLI and library API.
- Agent skill instructions.
- Fixture-backed tests.
- Safety and side-effect documentation.

## Verification

Pending PR body should record:

- `npm ci` (from a fresh checkout)
- `npm run release:check` (the complete CI gate: lockfile, check, tests, build, fixture smoke, and packaged-consumer smoke)
- `npm run package:smoke` packs and installs the tarball in a temporary consumer, then verifies version, help, and fixture rendering through the installed CLI. It also confirms build/check source scripts excluded by `package.json` are absent from the archive.

## Known Limitations

- Deterministic heuristics only.
- No connector execution.
- No package publishing in this release candidate.

## Verification Results

- `npm ci` PASS, dependencies installed from the committed lockfile.
- `npm run release:check` PASS, including lockfile validation, documentation checks, tests, build, fixture smoke, and installed-package consumer smoke.

## Commit Groups

- Project scaffold and metadata.
- Product, orchestration, skill, and release docs.
- Fixtures, engine, renderer, CLI, and tests.
- Check, build, validation, README, and license.
