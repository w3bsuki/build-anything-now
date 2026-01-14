# GPT XHIGH — Production Readiness Audit (Pawsy / “PawsSafe”)
> **Repo:** `j:\pawsy\build-anything-now`  
> **Date:** 2026-01-13  
> **Scope:** Full codebase audit + `/docs` audit. No existing files modified; new audit + plan lives in `gpt/` (plans in `gpt/plan/`).

## Deepthink (guiding constraints)
- **Security first**: backend authz/authn must be correct before shipping anything else.
- **No over‑engineering**: only add systems that directly reduce risk or unlock shipping (CI, basic tests, env validation, error boundaries).
- **One source of truth**: choose a single package manager, a single theme token system, and a single naming/branding (“Pawsy” vs “PawsSafe”).
- **Shadcn + Tailwind v4 correctness**: tokens must be coherent (light/dark), and UI primitives must match library versions.

## Executive summary (current state)
- **Build:** `npm run build` ✅ (but warns about large chunks; code splitting needed).
- **Lint:** `npm run lint` ❌ (9 errors, 12 warnings).
- **Typecheck:** `npx tsc -p tsconfig.app.json --noEmit` ❌ (UI primitives + pages have TS errors).
- **Backend:** Convex exists, but **multiple critical authorization bypasses** are present and pages still rely heavily on mock data.
- **Auth:** Clerk is installed, but **not integrated in the frontend** (no `ClerkProvider` usage found).
- **Styling:** Tailwind v4 is set up, but **theme tokens are duplicated/mixed (HSL + OKLCH)** and shadcn animation utilities appear unconfigured.
- **Docs:** `/docs` is thorough, but has **mismatches with the real repo** (imports/paths, token palette, assumptions about tooling/tests).

## Critical blockers (must fix before “production ready”)
1. **Convex authorization bypasses** (confirmed in code)
   - `convex/notifications.ts`: `markAsRead`, `remove`, `create` missing ownership/auth checks.
   - `convex/paymentMethods.ts`: `remove` missing ownership check (auth only).
   - `convex/cases.ts`: `addUpdate` missing ownership/role checks.
   - `convex/clinics.ts`: `seed` callable by anyone.
   - Also high risk: `convex/users.ts` `upsert` is callable without auth; should be internal-only (webhook) or authenticated.
2. **Frontend is not wired to backend**
   - Many pages contain TODOs like “replace with `useQuery(api...)`” but still use mock data.
3. **Code health gates failing**
   - ESLint errors + TS errors mean the repo cannot be treated as production-ready.
4. **Tailwind/shadcn token coherence**
   - `src/index.css` defines tokens twice (layered HSL + unlayered OKLCH) and has inconsistent font tokens.
5. **Shipping details**
   - `index.html` and `README.md` still contain Lovable placeholders (“Lovable App”, “REPLACE_WITH_PROJECT_ID”).
   - App naming is inconsistent (“Pawsy” vs “PawsSafe”).

## Tailwind v4 + shadcn audit (high-level)
See `gpt/tailwind-phase1-audit.md` for the Phase 1 format list.

Key findings:
- `src/index.css` mixes **two token systems** (HSL tokens in `@layer base` + OKLCH tokens in a second `:root`), creating “works by accident” behavior and dark-mode gaps for semantic tokens like `--success`, `--urgent`, etc.
- Multiple components use `animate-in`, `fade-in-*`, `slide-in-*`, etc (typical shadcn), but `tailwindcss-animate` is **not present in `package.json`** and no `@plugin` directive exists in `src/index.css`.
- Many arbitrary values exist (`w-[260px]`, `text-[10px]`, `z-[70]`, `top-[6.5rem]`, etc). Some are justified (Radix/shadcn positioning), many can be normalized to the design scale.

## Codebase audit (high-level)
### Tooling & repo hygiene
- **Multiple package manager lockfiles** tracked: `pnpm-lock.yaml`, `package-lock.json`, `bun.lockb`. This is a production risk.
- No CI (`.github/` missing). No tests configured.
- TypeScript is configured non-strict in the app (`tsconfig.app.json`), while Convex is strict (`convex/tsconfig.json`).

### Frontend architecture
- Vite + React Router v7, shadcn/ui, Tailwind v4, i18next.
- `@tanstack/react-query` is installed and a `QueryClientProvider` is used, but **Convex data hooks are not implemented yet** (mostly TODOs). Consider removing React Query if it won’t be used (avoid over-engineering).
- `next-themes` is referenced in `src/components/ui/sonner.tsx` but no `ThemeProvider` exists in the app; dark-mode control looks incomplete.

### Backend (Convex)
- Schema exists and is a good start (`convex/schema.ts`) but missing many tables referenced by the UI (campaigns, partners, volunteers, community, etc).
- Critical authz gaps exist (see blockers section).
- Some queries filter in memory after collecting all documents (`convex/cases.ts`, `convex/clinics.ts`) → performance risk as data grows.

### Performance
- Production build warns about chunks > 500kb. Route-level lazy loading and/or manual chunking is needed.

### Internationalization & UX
- i18next is configured and locales exist, but some UI strings are hardcoded (docs already call this out).
- `src/components/LanguageDetectionBanner.tsx` performs **IP geolocation over HTTP** (mixed content + privacy issue).

## `/docs` folder audit (high-level)
Strengths:
- `/docs` is unusually comprehensive and already identifies real issues (security bypasses, missing auth, mock data, etc).

Mismatches / fixes needed:
- Several docs assume paths/imports that don’t exist (example from `docs/04-COMPONENT-STANDARDS-GUIDE.md`: `@/convex/_generated/api` — current generated API lives at `convex/_generated/*` in repo root).
- Token palette guidance is inconsistent with the actual theme used in `src/index.css` (docs show green primary; app uses orange primary).
- Docs include “nice-to-have” additions (Storybook, service worker caching, extensive load testing) that may be overkill for “clean and not over-engineered”.

## Deliverables created by this audit
- **Audit files:** `gpt/` (detailed findings + Tailwind Phase 1 audit + checks run)
- **New actionable plans (your own versions):** `gpt/plan/` (updated versions of the existing docs, aligned to this repo’s reality)

## What to do next (execution order)
1. Read `gpt/plan/00-MASTER-LAUNCH-PLAN.md`
2. Execute `gpt/plan/05-SECURITY-REMEDIATION-PLAN.md` (backend security first)
3. Execute `gpt/plan/02-BACKEND-COMPLETION-PLAN.md` (schema + APIs that match existing UI routes)
4. Execute `gpt/plan/01-UI-UX-ALIGNMENT-PLAN.md` (a11y + i18n + UX gaps)
5. Execute `gpt/plan/06-TAILWIND-SHADCN-STYLING.md` (token + styling coherence)
6. Execute `gpt/plan/04-COMPONENT-STANDARDS-GUIDE.md` + `gpt/plan/03-PRODUCTION-LAUNCH-CHECKLIST.md` (quality gates + ship checklist)

## Notes on methodology
- Tailwind audit followed the `tailwind-audit` skill workflow (adapted to Vite + `src/index.css` and no `scripts/scan-tailwind-palette.mjs` in repo).
- See exact command outputs in `gpt/checks-run.md`.
