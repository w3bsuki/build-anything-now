# `/docs` audit (what’s good, what’s off, how to fix)

## What’s strong in the existing docs
- The docs correctly identify real blockers:
  - Convex authorization bypasses
  - Clerk installed but not integrated
  - Mock data everywhere
  - Language geolocation uses HTTP
- The structure is already a reasonable “launch plan” set.

## Key mismatches vs the real repo
1. **Convex import paths in docs**
   - Some docs reference `@/convex/_generated/api`, but the repo has `convex/_generated/*` at the root.
   - Fix approach: add a Vite + TS alias for `convex/*` (simple) or standardize on relative imports (messy).
2. **Design tokens in docs don’t match the app**
   - `docs/04-COMPONENT-STANDARDS-GUIDE.md` suggests a green primary palette; the implemented theme uses orange primary.
   - Fix approach: define the final palette in one place (Tailwind v4 tokens in `src/index.css`) and update docs accordingly.
3. **Tooling assumptions**
   - Docs often use `pnpm`, but `package.json` scripts don’t include the additional scripts referenced (tests/typecheck/etc).
   - Fix approach: decide on `pnpm` as the canonical package manager, then add minimal scripts (lint/typecheck/build) aligned with the repo.
4. **Over-engineering risk**
   - Suggestions like Storybook, service worker caching, and heavy load-testing can be valuable, but shouldn’t be required for “v1 production ready”.

## What this audit adds
- `gpt/plan/*` contains updated, repo-aligned versions of the docs:
  - Adjusted for Tailwind v4 CSS-first config (`src/index.css`)
  - Updated with real lint/typecheck failures observed
  - Reframed to prioritize “ship without over-engineering”
