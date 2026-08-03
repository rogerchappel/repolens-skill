# Repolens Skill

## When To Use

Use this skill when an agent needs to scans a local project snapshot and produces an agent-ready review packet with risk signals, files to inspect, test commands, and release-readiness gaps from a local repository snapshot JSON.

## Required Inputs

- A snapshot JSON object with a required `files` array of string paths.
- An optional `package` object (or `null`). Its optional `scripts` field must be
  an object whose values are command strings.
- A requested output format: `markdown` or `json`.

For example:

```json
{
  "name": "sample-node",
  "files": ["README.md", "test/index.test.js"],
  "package": { "scripts": { "test": "node --test" } }
}
```

Malformed top-level or nested fields are rejected without generating a review
brief. See `fixtures/` for complete valid snapshots.

## Side-Effect Boundaries

This skill is read-only. It may read the input file supplied by the operator and write to stdout. It must not call external APIs, mutate source repositories, send messages, update CRMs, or use credentials.

## Approval Requirements

No approval is needed for local fixture analysis. Operator approval is required before using the generated brief to perform any external action. Destructive or irreversible actions require explicit owner approval in a separate workflow.

## Examples

```bash
node bin/repolens-skill.js fixtures/node-package.json --format markdown
```

## Validation Workflow

1. Run `npm test`.
2. Run `npm run check`.
3. Run `npm run build`.
4. Run `npm run smoke`.
5. Inspect the generated Markdown for clear stop conditions and honest limitations.
