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
Start with these (in order):
1. `PRD.md` — Product vision + feature checklist
2. `TASKS.md` — Current sprint
3. `DESIGN.md` — Architecture + patterns
4. `RULES.md` — Trust/safety + UX rules
5. `AGENTS.md` — Workflow for OPUS/Codex

## Commit messages
Use a simple convention:
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `refactor: ...`
