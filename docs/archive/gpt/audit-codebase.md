# Codebase audit (detailed)
> Goal: production-ready, clean, minimal complexity.

## Repo map (what exists)
- Frontend: `src/` (Vite + React 19 + React Router 7 + shadcn/ui + Tailwind v4 + i18next)
- Backend: `convex/` (schema + functions; `_generated/` checked in)
- Mobile: `android/`, `ios/`, `capacitor.config.ts`
- Docs: `docs/` (original plans), plus `gpt/plan/` (repo-aligned plan docs created by this audit)

## Highest-risk issues (security)
### Confirmed authz bypasses in Convex
- `convex/notifications.ts`
  - `markAsRead` patches arbitrary notification id (no ownership check)
  - `remove` deletes arbitrary notification id (no ownership check)
  - `create` inserts notifications for arbitrary userId (no auth/internal gate)
- `convex/paymentMethods.ts`
  - `remove` deletes arbitrary payment method id (no ownership check)
- `convex/cases.ts`
  - `addUpdate` allows any authed user to add updates to any case id
- `convex/clinics.ts`
  - `seed` can be called without auth
- `convex/users.ts`
  - `upsert` is publicly callable and can create/modify users without authentication (should be internal webhook or require identity)

### Why this matters
These issues enable cross-user data access/manipulation and are launch blockers.

## Backend completeness (Convex)
### Current state
- Schema includes: `users`, `donations`, `achievements`, `paymentMethods`, `notifications`, `userSettings`, `cases`, `adoptions`, `clinics`.
- UI routes indicate additional domains exist (campaigns, partners, volunteers, community), but those tables/APIs are not in schema yet.

### Performance risks
- `convex/cases.ts` and `convex/clinics.ts` fetch all rows then filter in memory.
- `convex/donations.ts` enriches donations with per-row `ctx.db.get` (N+1). Fine at small scale; should be optimized before launch if donation volume is non-trivial.

## Frontend completeness
### Mock data + TODOs
Many pages explicitly note TODOs to wire Convex queries/mutations:
- `src/pages/Profile.tsx`, `src/pages/MyDonations.tsx`, `src/pages/DonationHistory.tsx`,
  `src/pages/Notifications.tsx`, `src/pages/Achievements.tsx`, `src/pages/PaymentMethods.tsx`,
  `src/pages/Settings.tsx`, plus creation flows.

### Auth integration gap
- `@clerk/clerk-react` is installed but not used in `src/` (no provider/routes/hooks).

### Dark mode gap
- `next-themes` is referenced, but no `ThemeProvider` exists in the app.

## Tooling / quality gates
### Multiple lockfiles
- `pnpm-lock.yaml` + `package-lock.json` + `bun.lockb` — pick one (recommend `pnpm`) and remove the others to prevent dependency drift.

### ESLint + TypeScript failing
See `gpt/checks-run.md` for the exact failures; these must be fixed for “production ready”.

## Styling system health (Tailwind v4 + shadcn)
- `src/index.css` currently contains layered HSL tokens + unlayered OKLCH tokens. This is fragile and makes dark-mode semantics inconsistent.
- Several shadcn utilities are likely missing (animations).
- Many arbitrary sizes exist; normalize where it improves consistency.

## Shipping polish
- `index.html` still uses Lovable defaults (title/OG tags).
- `README.md` still references Lovable placeholders.
- App naming is inconsistent across code and docs (“Pawsy”, “PawsSafe”, “PawsSafe Animal Welfare Platform”).
