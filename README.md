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
- Supporting planning packs (`docs/`):
  - Product: [`docs/product/master-plan.md`](docs/product/master-plan.md), [`docs/product/roadmap.md`](docs/product/roadmap.md), [`docs/product/case-lifecycle-spec.md`](docs/product/case-lifecycle-spec.md), [`docs/product/profile-capabilities-spec.md`](docs/product/profile-capabilities-spec.md)
  - Architecture: [`docs/architecture/techstack-baseline.md`](docs/architecture/techstack-baseline.md), [`docs/architecture/data-model-gap-audit.md`](docs/architecture/data-model-gap-audit.md)
  - Design system: [`docs/design/tailwind-shadcn-remediation-plan.md`](docs/design/tailwind-shadcn-remediation-plan.md)
  - Partners and ops: [`docs/partners/bulgaria-clinic-seeding-plan.md`](docs/partners/bulgaria-clinic-seeding-plan.md), [`docs/partners/claim-verification-ops.md`](docs/partners/claim-verification-ops.md), [`docs/partners/outreach-pipeline.md`](docs/partners/outreach-pipeline.md)
  - Mission initiatives: [`docs/mission/pawtreon-initiatives.md`](docs/mission/pawtreon-initiatives.md)
  - Investor and docs index: [`docs/README.md`](docs/README.md)

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
- Investor hub: [`docs/investor/README.md`](docs/investor/README.md)
