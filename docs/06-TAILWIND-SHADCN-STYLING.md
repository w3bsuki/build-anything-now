# 🎨 Tailwind v4 + shadcn Styling Plan - PawsSafe
> **Goal:** One coherent token system (light/dark), consistent typography/spacing, and no dead utilities.

## Current state (observed)
- `src/index.css` defines theme tokens twice (HSL tokens in `@layer base` + OKLCH tokens in a later `:root`), which makes behavior fragile.
- Semantic status tokens (`--success`, `--warning`, `--urgent`, `--recovering`, `--adopted`) are missing dark-mode values.
- Fonts are set in multiple places (`src/main.tsx`, `src/index.css`, `src/fonts.css`).
- shadcn animation utilities (`animate-in`, `fade-in-*`, `slide-in-*`, etc.) appear in the codebase, but `tailwindcss-animate` is not configured.

## Decisions (record in `../DECISIONS.md`)
- [ ] Brand primary color (current UI uses orange; keep or change)
- [ ] Typography: choose a single `--font-sans` (recommend Nunito since it is already imported)
- [ ] Gradients policy: allowed vs disallowed (if allowed, restrict to 1–2 patterns)
- [ ] Animations: keep (configure plugin) vs remove (strip dead class names)

## Plan

### 1) Consolidate tokens
File: `src/index.css`
- [ ] Pick one token format as the source of truth (recommend OKLCH).
- [ ] Remove the duplicate token set so `:root` and `.dark` are each defined once.
- [ ] Ensure `@theme inline` mappings match the chosen format (avoid mixing `hsl(var(...))` with `oklch(...)` values).

### 2) Make semantic tokens dark-mode complete
File: `src/index.css`
- [ ] Define `.dark` values for: `--success`, `--warning`, `--urgent`, `--recovering`, `--adopted` (and their `*-foreground` tokens where used).

### 3) Fonts: one source of truth
Files: `src/main.tsx`, `src/index.css`, `src/fonts.css`
- [ ] Keep a single `--font-sans` definition for both light and dark (recommend: `src/fonts.css`).
- [ ] Remove/avoid conflicting `--font-sans` overrides elsewhere.

### 4) shadcn animations (optional)
If animations are desired:
- [ ] Add dependency: `tailwindcss-animate`
- [ ] Add Tailwind v4 CSS-first directive to `src/index.css`: `@plugin "tailwindcss-animate";`

If animations are not desired:
- [ ] Remove `animate-in`/`fade-in-*`/`slide-in-*` classnames from primitives/components to avoid shipping dead utilities.

### 5) Reduce arbitrary values (where safe)
- [ ] Prefer Tailwind scale utilities over arbitrary sizes (`text-xs`, `w-64`, `z-50`, etc).
- [ ] Keep arbitrary values only when required (e.g., Radix positioning).

## Acceptance criteria
- [ ] No duplicated token systems in `src/index.css`
- [ ] Light/dark tokens produce correct contrasts (including semantic status colors)
- [ ] Fonts are consistent across modes and pages
- [ ] Animations either work (plugin configured) or are fully removed

