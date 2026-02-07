# Tech Stack Baseline

- Owner: Engineering
- Update cadence: Monthly or after architecture decisions
- Last updated: 2026-02-06

## Current Baseline (Repo Truth)
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS v4 + shadcn/ui
- Backend: Convex
- Auth: Clerk
- Mobile shell: Capacitor (iOS/Android)
- i18n: i18next
- Payments: Stripe (integration in progress)

## Key Entry Points
- App routes: `src/App.tsx`
- Theme/tokens: `src/index.css`
- Convex schema: `convex/schema.ts`
- Convex HTTP actions: `convex/http.ts`

## Quality Gates
- `pnpm -s lint`
- `pnpm -s exec tsc -p tsconfig.app.json --noEmit`
- `pnpm -s build`

## Constraints
- Keep Vite SPA path for core app.
- Avoid root-doc sprawl; planning lives under `docs/`.
- High-risk features require explicit design and trust review.

## Non-goals (Current Cycle)
- Framework migration.
- Drone operational software.
- Shelter ERP.
