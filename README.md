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
  - Product: [`PRD.md`](PRD.md) (canonical), [`docs/product/roadmap.md`](docs/product/roadmap.md), [`docs/product/master-plan.md`](docs/product/master-plan.md)
  - Features: [`docs/features/`](docs/features/) — 14 per-feature specs (cases, profiles, donations, clinics, campaigns, community, volunteers, adoption, onboarding, notifications, messaging, search, achievements, admin)
  - Systems: [`docs/systems/`](docs/systems/) — data model, API reference, auth/security, deployment, testing, analytics
  - Design: [`docs/design/`](docs/design/) — UI patterns, theming tokens, mobile-native, i18n
  - Business: [`docs/business/`](docs/business/) — monetization, partner types, growth
  - Missions: [`docs/missions/`](docs/missions/) — drone program, safehouse, marketplace, pet insurance
  - Partners: [`docs/partners/`](docs/partners/) — clinic seeding, claim verification, outreach pipeline
  - Docs index: [`docs/readme.md`](docs/readme.md)

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
