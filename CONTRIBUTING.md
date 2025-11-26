# Contributing

## Requisitos

- Node.js >= 18
- npm

## Setup

1. Fork & clone.
2. `npm ci`
3. `npm run test`

## Flujo

1. Create feature branch.
2. Use Conventional Commits (`feat:`, `fix:`, etc.).
3. Ensures 100% coverage.
4. Open PR with description and checklist.

## Hooks

The hooks are configured with Husky v9. If this is your first installation, run npm ci (which triggers prepare: husky), or run npx husky init if the .husky/\_ folder is missing.
