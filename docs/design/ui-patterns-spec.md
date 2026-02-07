# Pawtreon UI Patterns Spec

> **Purpose:** Canonical UI/UX patterns for case-first rescue surfaces and shared design behavior.
> **Owner:** Product + Design + Frontend
> **Last updated:** 2026-02-06

---

## Summary

This spec defines the case-first home information architecture, component usage rules, styling/theming constraints, and accessibility interaction standards for Pawtreon.

It is the implementation reference for:
- `src/pages/IndexV2.tsx`
- Home feed components under `src/components/homepage/*`
- Search overlay and top-level navigation actions

---

## Scope

### In scope
- Home (`/`) first-fold IA and feed composition
- Stories strip behavior for urgent/new case updates
- Action density limits on mobile headers and filter rails
- Tailwind v4 + shadcn token-safe usage for trust-critical surfaces
- Interaction and accessibility baseline for mobile + desktop

### Out of scope
- Community forum information architecture (`/community`) beyond route separation
- Campaigns IA redesign beyond placement rules on home
- Backend moderation and payments workflows
- Marketing-only pages and investor deck visuals

---

## Home Information Architecture

### Primary objective
`/` is a rescue-first surface. The user should immediately understand urgent need and have one clear way to act.

### First-fold structure (mobile)
1. Compact app bar: logo + search icon + notifications + account.
2. Stories strip labeled `Urgent Updates`, sourced only from urgent/new case activity.
3. Compact filter rail with max 4 controls: `Urgent`, `Near me`, `Sofia`, `More`.

### First-fold constraints
- No large inline search input on first fold.
- No duplicated urgent modules above the main case feed.
- Max three primary interaction zones in the first viewport.

### Feed composition
1. Hero urgent case card (only when urgent case exists).
2. Unified case list with one card system.
3. Mission initiatives module appears after the first case block, never above rescue-first content.
4. Empty state is rescue-first with clear CTA intent (adjust filters / create case).

### Social boundary
- `/` remains case-first rescue feed.
- `/community` remains discussion/social feed.
- No mixed social post cards in home feed during this phase.

---

## Component Patterns And Anti-Patterns

### Patterns
- Use a single server-driven home contract for hero/stories/cases/filter counts/unread counts.
- Keep stories as case update snapshots, not generic social activities.
- Use one case card family for list consistency.
- Keep notification badges data-driven (no hardcoded values).

### Anti-patterns
- Stacking avatars + large search + quick pills + urgent strip in one fold.
- Client-side “fetch all then filter/sort” for core case feed behavior.
- Duplicate urgency surfaces that repeat identical content.
- App/business logic inside `components/ui/*` primitives.

---

## Token And Theming Rules

### Required
- Semantic token classes only on trust-critical flows:
  - `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `ring-ring`, semantic status tokens.
- Tailwind v4 CSS-first model via `@theme` variables in `src/index.css`.
- Animation utilities via `tw-animate-css` import; avoid legacy plugin-only patterns.

### Forbidden on trust-critical flows
- Palette classes like `text-red-500`, `bg-blue-600`.
- Gradient classes (`bg-gradient-to-*`, `from-*`, `via-*`, `to-*`).
- Arbitrary color values (`bg-[#...]`, `text-[oklch(...)]`) in JSX classes.

### Enforcement
- Use scripts:
  - `pnpm -s styles:scan:palette`
  - `pnpm -s styles:scan:arbitrary`
  - `pnpm -s styles:scan:gradients`
  - `pnpm -s styles:gate`

---

## Accessibility And Interaction Rules

- 44x44 minimum touch targets on mobile icon actions.
- Visible focus states on interactive controls (`focus-visible` ring).
- Search overlay supports keyboard escape to close.
- Feed cards preserve readable text contrast over images.
- Avoid motion overload; use short, purposeful transitions.
- Maintain clear heading hierarchy and meaningful labels.

---

## Acceptance Criteria

### Functional
- Home uses server-driven query contract for filters + pagination.
- Stories row shows urgent/new case stories only.
- Search is opened from header action and applies server-side filtering.
- Header badges are powered by backend unread counts.

### UX
- First fold has no duplicated urgency strip.
- First fold interaction density is reduced to the defined three-zone structure.
- Case-first hierarchy is visually clear at `390x844` and `1440x900`.

### System quality
- `pnpm -s lint` passes.
- `pnpm -s exec tsc -p tsconfig.app.json --noEmit` passes.
- `pnpm -s build` passes.
- `pnpm -s styles:gate` passes for scoped trust-flow files.

---

## Risks And Mitigations

- **Risk:** Reduced first-fold controls may hurt discoverability for some users.
  - **Mitigation:** Keep `More` filter and searchable overlay entry in the top bar.

- **Risk:** Stories can drift toward noisy social activity.
  - **Mitigation:** Restrict home stories data source to urgent/new case events.

- **Risk:** Style drift reappears over time.
  - **Mitigation:** Keep style gate scripts in local/CI quality checks and expand scope incrementally.

- **Risk:** Community expectations conflict with rescue-first home objective.
  - **Mitigation:** Maintain explicit IA split: rescue on `/`, discussion on `/community`.
