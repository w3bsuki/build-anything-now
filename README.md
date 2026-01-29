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
- Core (canonical):
  - [`VISION.md`](VISION.md)
  - [`PRD.md`](PRD.md)
  - [`ROADMAP.md`](ROADMAP.md)
  - [`PLAN.md`](PLAN.md)
  - [`TODO.md`](TODO.md)
  - [`STYLE.md`](STYLE.md)
  - [`TECH-STACK.md`](TECH-STACK.md)
  - [`TRUST-SAFETY.md`](TRUST-SAFETY.md)
  - [`DECISIONS.md`](DECISIONS.md)
- Investor + archive index: [`docs/README.md`](docs/README.md)
- Dev workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)

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
