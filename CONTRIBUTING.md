# Contributing

## Prerequisites
- Node.js 20+ recommended
- pnpm recommended (or npm)

## Setup
```bash
pnpm install
pnpm dev

# Backend (Convex)
npx convex dev
```

## Before pushing
```bash
pnpm lint
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

## Docs
- Source of truth: `docs/` (start at `docs/README.md`)
- Audit artifacts: `docs/archive/gpt/` (reference only)

## Commit messages
Use a simple convention:
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `refactor: ...`
