# Repolens Skill

Repository review briefing skill for local project snapshots.

Repolens Skill is a local-first agent skill package that scans a local project snapshot and produces an agent-ready review packet with risk signals, files to inspect, test commands, and release-readiness gaps. It is designed for dry-run agent workflows where inputs are explicit files and outputs are reviewable artifacts.

## Quickstart

```bash
npm install
npm test
npm run smoke
npm run release:check
node bin/repolens-skill.js fixtures/node-package.json --format markdown
```

## CLI

```bash
node bin/repolens-skill.js fixtures/node-package.json --format markdown
node bin/repolens-skill.js fixtures/node-package.json --format json
```

The CLI reads repository snapshot JSON and prints a repository review brief. It never calls external services, writes to third-party systems, or reads credentials.

### Snapshot JSON shape

Each snapshot must be a top-level JSON object with this shape:

```json
{
  "name": "optional-repository-name",
  "files": ["README.md", "src/index.js", "test/index.test.js"],
  "package": {
    "scripts": {
      "test": "node --test",
      "build": "node scripts/build.js"
    }
  }
}
```

`files` is required and every entry must be a string. `package` is optional and
may be an object or `null`; when present, `package.scripts` is optional but must
be an object whose command values are strings. Invalid snapshots are rejected
with a concise error and do not produce a review brief.

## Release Verification

```bash
npm run package:smoke
npm run release:check
```

`package:smoke` runs `npm pack --dry-run` and confirms the package includes the
CLI, source modules, fixtures, release docs, skill file, README, and license.
`release:check` combines static checks, tests, build, fixture smoke, and package
smoke so maintainers can use the same gate locally and in CI.

## Library

Import from `src/index.js` for tests or agent wrappers. The public functions are intentionally small so other agents can inspect and adapt the behavior.
`analyzeRepoSnapshot` enforces the same snapshot shape as the CLI and throws a
`TypeError` when the input is invalid.

## Safety Notes

- Local file input only.
- No network calls.
- No credential handling.
- Any external action must happen in a separate, explicitly approved workflow.

## Limitations

This is a deterministic MVP. It uses simple heuristics and fixtures, not live enrichment or model calls. Treat output as a review packet, not an authority.
