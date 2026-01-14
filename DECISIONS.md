# Decisions

This file tracks project-wide decisions that affect the whole repo. When a decision is made, add a dated entry under “Log”.

## Open decisions

- **Project name:** "Pawsy" vs "PawsSafe"
- **Package manager:** pnpm vs npm (recommend pnpm; repo currently has multiple lockfiles)
- **Auth strategy:** Clerk → Convex identity + user sync approach (webhook/internal mutation vs client upsert)
- **Design tokens:** single token system in `src/index.css` (OKLCH vs HSL)
- **Animations:** keep shadcn animation utilities (configure `tailwindcss-animate`) vs remove

## Proposed defaults (can be ratified)

- **Typography:** Nunito for `--font-sans` (already imported in `src/main.tsx` and set in `src/fonts.css`)

## Log (decisions made)

Template:

### YYYY-MM-DD — Decision title
- **Status:** decided
- **Context:**
- **Decision:**
- **Rationale:**
- **Consequences / follow-ups:**

