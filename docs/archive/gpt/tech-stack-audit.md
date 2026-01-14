# Tech stack audit (2026-01-13)

## Current stack (observed)
- **Frontend:** Vite 7 + React 19 + React Router 7
- **Styling:** Tailwind CSS v4 (CSS-first) + shadcn/ui + Radix
- **Backend:** Convex (schema + functions)
- **Auth:** Clerk (installed, not yet integrated)
- **i18n:** i18next + http backend + language detector
- **Mobile:** Capacitor (android/ios projects present)

## What’s already “modern enough”
- Tailwind v4 + `@tailwindcss/vite`
- React 19 + TypeScript 5.9 + Vite 7
- Convex as the backend/data layer

## Stack-level issues to fix (production blockers or high ROI)
### 1) Package manager drift
- Repo includes `pnpm-lock.yaml`, `package-lock.json`, and `bun.lockb`.
- Recommendation: pick **pnpm** and remove the other lockfiles after validation.

### 2) shadcn/ui out of sync with library versions
- Typecheck failures in UI primitives indicate generated components don’t match installed library versions.
- Recommendation: re-sync/fix the failing primitives first (see `gpt/plan/04-COMPONENT-STANDARDS-GUIDE.md`).

### 3) Missing shadcn animation plugin (Tailwind v4)
- Utilities like `animate-in` appear used but not configured.
- Recommendation: either install/configure `tailwindcss-animate` or remove those classnames.

### 4) Unused/half-integrated dependencies (reduce complexity)
- `@tanstack/react-query` is wired in `App.tsx`, but the app is not using Convex hooks yet and React Query doesn’t appear to provide value right now.
- `next-themes` is referenced (Sonner), but no `ThemeProvider` exists.
- Recommendation: either fully integrate these or remove them to keep the stack clean.

## Likely additions for production readiness (keep minimal)
- **Stripe**: `@stripe/stripe-js` (client) + `stripe` (server-side in Convex actions) if donations must be real payments.
- **CI**: GitHub Actions workflow (lint + typecheck + build) — minimal but high ROI.
