# Repo organization & practices (recommended)
> Goal: “clean and not over-engineered” while still production-ready.

## High-value, low-ceremony practices
- **One package manager**: pnpm only (single lockfile).
- **3 gates**: lint + typecheck + build must pass locally and in CI.
- **Fail-fast env validation**: crash on missing required env vars in prod builds.
- **Security ownership checks**: every mutation checks identity + ownership.

## Suggested project structure (minimal change)
Current structure is already fine. Keep changes small:
- `src/pages/*` — route components
- `src/components/*` — shared feature components
- `src/components/ui/*` — shadcn primitives (keep in sync with deps)
- `src/lib/*` — utilities (`cn`, env helpers, formatters)
- `src/hooks/*` — reusable hooks
- `src/types/*` — domain types (migrate to Convex `Id<>` types as backend wiring happens)

## Cleanups to prioritize
- Resolve naming inconsistency: “Pawsy” vs “PawsSafe”.
- Update placeholders:
  - `README.md` (Lovable placeholders)
  - `index.html` title/OG/meta
- Consolidate Tailwind tokens (see `gpt/plan/06-TAILWIND-SHADCN-STYLING.md`).

## CI (minimal)
- Add one workflow that runs:
  - `pnpm lint`
  - `pnpm exec tsc -p tsconfig.app.json --noEmit`
  - `pnpm build`

## What to avoid (over-engineering traps)
- Storybook before the UI stabilizes.
- Service worker caching unless offline is a core requirement.
- Large “architecture rewrites” before wiring real data and fixing security.
