# Repolens Skill

Repository review briefing skill for local project snapshots.

Repolens Skill is a local-first agent skill package that scans a local project snapshot and produces an agent-ready review packet with risk signals, files to inspect, test commands, and release-readiness gaps. It is designed for dry-run agent workflows where inputs are explicit files and outputs are reviewable artifacts.

## Quickstart

```bash
npm install
npm test
npm run smoke
node bin/repolens-skill.js fixtures/node-package.json --format markdown
```

## CLI

```bash
node bin/repolens-skill.js fixtures/node-package.json --format markdown
node bin/repolens-skill.js fixtures/node-package.json --format json
```

The CLI reads repository snapshot JSON and prints a repository review brief. It never calls external services, writes to third-party systems, or reads credentials.

## Library

Import from `src/index.js` for tests or agent wrappers. The public functions are intentionally small so other agents can inspect and adapt the behavior.

## Safety Notes

- Local file input only.
- No network calls.
- No credential handling.
- Any external action must happen in a separate, explicitly approved workflow.

## Limitations

This is a deterministic MVP. It uses simple heuristics and fixtures, not live enrichment or model calls. Treat output as a review packet, not an authority.
