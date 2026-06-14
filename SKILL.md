# Repolens Skill

## When To Use

Use this skill when an agent needs to scans a local project snapshot and produces an agent-ready review packet with risk signals, files to inspect, test commands, and release-readiness gaps from a local repository snapshot JSON.

## Required Inputs

- A JSON file matching one of the documented fixture shapes.
- A requested output format: `markdown` or `json`.

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
