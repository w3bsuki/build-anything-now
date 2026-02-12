# Frontend Agent Rules (`src/`)

> **Owner:** OPUS  
> **Status:** final  
> **Last updated:** 2026-02-10  
> **Scope:** All files under `src/`.

---

## Component Patterns

- Use shadcn/ui primitives from `src/components/ui/` as the base layer
- Compose domain components from primitives — don't modify shadcn source files
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- Every interactive element needs: visible hover/active state, focus ring, accessible label

## Styling Rules

- **Tailwind v4** — config lives in `src/index.css`, NOT `tailwind.config.*`
- Use semantic token classes (`bg-background`, `text-foreground`, `border-border`)
- **Forbidden on trust surfaces** (home, community, campaigns): palette utilities (`bg-green-500`), gradient utilities, arbitrary values (except safe-area)
- Touch targets minimum 44x44px — use `Button size="iconTouch"` for icon-only actions
- Inputs must be `text-base` (prevents iOS Safari zoom)

## i18n Rules

- Always use `useTranslation()` — never hardcode user-facing strings
- Translation files: `public/locales/{lang}/translation.json`
- Key naming: `section.subsection.key` (e.g., `home.feed.empty`)
- Fallback chain: requested language → English → key name

## Route Conventions

- Pages live in `src/pages/` — one file per route
- Route registration in `src/App.tsx`
- Use layouts from `src/layouts/` — don't build custom shells
- Community routes (`/community*`) use a dedicated mobile shell

## Import Conventions

- Absolute imports via `@/` prefix (maps to `src/`)
- Group imports: React → third-party → `@/components` → `@/hooks` → `@/lib` → relative
- No barrel exports (`index.ts`) — import directly from source files

## Key Files

| File | Purpose |
|------|---------|
| `src/index.css` | Tailwind v4 config + design tokens |
| `src/App.tsx` | Router + route definitions |
| `src/main.tsx` | App entry point, providers |
| `src/components/ui/` | shadcn/ui primitives |
| `src/lib/utils.ts` | `cn()` and shared utilities |
