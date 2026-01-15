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
- [`docs/README.md`](docs/README.md) — execution docs (canonical)
- [`docs/archive/gpt/README.md`](docs/archive/gpt/README.md) — audit artifacts (reference)
- [`DECISIONS.md`](DECISIONS.md) — project-wide decisions
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — dev workflow

## Mobile (Capacitor)
```bash
pnpm build
npx cap sync
npx cap open android
npx cap open ios
```
