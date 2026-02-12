# Pawtreon

Mobile-first animal welfare platform (cases, donations, clinics, community).

- **Frontend:** Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- **Backend:** Convex
- **Auth:** Clerk (installed; integration in progress)
- **Mobile:** Capacitor (iOS/Android projects included)

## Getting started

### 1) Install dependencies
```bash
pnpm install
# or: npm install
```

### 2) Configure env
Copy `.env.example` to `.env.local` and set at least:
```env
VITE_CONVEX_URL=
VITE_CLERK_PUBLISHABLE_KEY=
```

### 3) Run dev
```bash
pnpm dev

# Backend (Convex) in another terminal
npx convex dev
```

The app runs on `http://localhost:8080`.

If `VITE_CONVEX_URL` is not set, the app runs with mock data.

## Quality gates
```bash
pnpm lint
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

## Docs
### Canonical vs Supporting Docs
- Canonical root docs (source of truth):
  - [`PRD.md`](PRD.md)
  - [`TASKS.md`](TASKS.md)
  - [`DESIGN.md`](DESIGN.md)
  - [`RULES.md`](RULES.md)
  - [`DECISIONS.md`](DECISIONS.md)
  - [`AGENTS.md`](AGENTS.md)
  - [`README.md`](README.md)
- Supporting spec-driven docs (`docs/`):
  - Hub + contract: [`docs/readme.md`](docs/readme.md), [`docs/AGENTS.md`](docs/AGENTS.md)
  - Product specs: [`docs/product-specs/`](docs/product-specs/) (strategy + features + missions)
  - Design docs: [`docs/design-docs/`](docs/design-docs/) (systems + UI)
  - Generated artifacts: [`docs/generated/feature-index.md`](docs/generated/feature-index.md), [`docs/generated/taskset.md`](docs/generated/taskset.md), [`docs/generated/quality-score.md`](docs/generated/quality-score.md)
  - References (non-SSOT ideation): [`docs/references/`](docs/references/)

## Mobile (Capacitor)
```bash
pnpm build
npx cap sync
npx cap open android
npx cap open ios
```

## Investor / Partner decks
- Investor deck (in-app): `/presentation`
- Partner deck (in-app): `/partner`
- Investor hub: [`docs/references/investor-ideation/README.md`](docs/references/investor-ideation/README.md)
