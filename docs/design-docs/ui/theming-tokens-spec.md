# Design Tokens & Theming Spec

> **Owner:** Frontend  
> **Status:** final  
> **Last updated:** 2026-02-10

---

## Purpose

Pawtreon uses **Tailwind CSS v4** with a **CSS-first configuration** — no `tailwind.config.js`. All design tokens, theme values, and color palette definitions live in a single file: `src/index.css`. This spec documents the full token hierarchy, color palette, typography system, shadow system, and styling constraints. It absorbs and supersedes:

- `docs/design-docs/ui/tailwind-shadcn-remediation-plan.md`
- `refactor/tailwind.md` (audit findings)
- `refactor/shadcn.md` (component audit)
- DESIGN.md Styling System section

`src/index.css` is imported by `src/main.tsx` and is the single stylesheet entrypoint for app tokens and Tailwind v4 configuration. No separate `globals.css` is used in this Vite app.

---

## User Stories

- As a **frontend developer**, I want a documented token hierarchy so I know exactly which CSS classes to use for every surface, text, and interactive element.
- As a **designer**, I want the color palette documented with OKLCH values so I can verify contrast ratios and brand consistency.
- As a **reviewer**, I want forbidden patterns listed so I can catch violations in code review.
- As an **accessibility auditor**, I want WCAG AA compliance requirements defined per token pair.

---

## Functional Requirements

1. All colors MUST use semantic token classes — never raw Tailwind palette classes.
2. Light and dark mode MUST have complete token parity — every token defined in `:root` MUST have a corresponding `.dark` override.
3. New tokens MUST follow the three-level naming hierarchy: primitive → semantic → component.
4. The style gate (`pnpm styles:gate`) MUST pass before any PR merges to app surfaces.
5. All OKLCH values MUST meet WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text/UI components) against their paired foreground/background.

---

## Token Architecture

### Three-Level Hierarchy

```
Primitive Tokens (raw OKLCH values in :root / .dark)
  └─→ Semantic Tokens (mapped via @theme inline block)
       └─→ Component Tokens (consumed via Tailwind utility classes)
```

**Level 1 — Primitive tokens:** Raw OKLCH color values defined in `:root` (light) and `.dark` blocks. These are CSS custom properties like `--background: oklch(1.0000 0 0)`.

**Level 2 — Semantic tokens:** The `@theme inline` block maps primitive tokens to Tailwind-consumable names. For example: `--color-background: var(--background)` makes `bg-background` available as a Tailwind class.

**Level 3 — Component tokens:** Consumed directly in JSX via Tailwind classes (`bg-background`, `text-foreground`, `border-border`) or in `@layer components` custom classes (`.badge-urgent`, `.sticky-donate`).

### File Structure

All token definitions live in `src/index.css`:

| Section | Purpose |
|---------|---------|
| Imports | `@import "tailwindcss"`, `@import "tw-animate-css"`, `@custom-variant dark` |
| `@layer base` | Global defaults: `border-border`, `bg-background`, `font-sans`, `antialiased`, `letter-spacing` |
| `@layer components` | Custom component classes: progress bar, status badges, sticky donate CTA |
| `@layer utilities` | Custom utilities: `scrollbar-hide`, `scroll-touch`, `glass-ultra`, `nav-shadow` |
| `@theme inline` | Semantic token mappings (Tailwind ↔ CSS variable bridge) |
| `:root` | Light theme primitive token values |
| `.dark` | Dark theme primitive token overrides |

---

## Color Palette

All colors use the **OKLCH color space** (`oklch(lightness chroma hue)`). OKLCH provides perceptually uniform lightness, making it easier to maintain consistent contrast ratios across the palette.

### Core Semantic Colors

| Token | Light (OKLCH) | Dark (OKLCH) | Tailwind Class | Usage |
|-------|---------------|--------------|----------------|-------|
| `--background` | `0.985 0.004 250` | `0.16 0.01 250` | `bg-background` | Page background |
| `--foreground` | `0.26 0.018 248` | `0.94 0.01 250` | `text-foreground` | Primary text |
| `--card` | `1 0 0` | `0.2 0.013 250` | `bg-card` | Card surfaces |
| `--card-foreground` | `0.26 0.018 248` | `0.94 0.01 250` | `text-card-foreground` | Card text |
| `--popover` | `1 0 0` | `0.2 0.013 250` | `bg-popover` | Popover/dropdown surfaces |
| `--primary` | `0.60 0.14 185` | `0.72 0.12 185` | `bg-primary` | Brand primary, CTAs |
| `--primary-foreground` | `1 0 0` | `0.16 0.02 200` | `text-primary-foreground` | Text on primary |
| `--secondary` | `0.94 0.02 185` | `0.28 0.015 250` | `bg-secondary` | Secondary surfaces/actions |
| `--muted` | `0.955 0.006 250` | `0.23 0.012 250` | `bg-muted` | Muted backgrounds |
| `--muted-foreground` | `0.46 0.016 248` | `0.72 0.012 250` | `text-muted-foreground` | Secondary text |
| `--accent` | `0.95 0.006 250` | `0.28 0.015 250` | `bg-accent` | Accent highlights |
| `--destructive` | `0.62 0.24 25` | `0.68 0.2 25` | `bg-destructive` | Error, danger |
| `--border` | `0.88 0.008 250` | `0.37 0.014 250` | `border-border` | Borders |
| `--input` | `0.995 0.002 250` | `0.29 0.014 250` | `bg-input` | Input backgrounds |
| `--ring` | `var(--primary)` | `var(--primary)` | `ring-ring` | Focus rings |

### Status Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--success` | `0.66 0.14 150` | `0.74 0.12 150` | Success states |
| `--warning` | `0.84 0.14 90` | `0.78 0.12 90` | Warning states |
| `--urgent` | `0.76 0.16 60` | `0.70 0.14 60` | Urgent case type |
| `--recovering` | `0.63 0.13 185` | `0.70 0.11 185` | Recovering case type |
| `--adopted` | `var(--success)` | `var(--success)` | Adopted case type |
| `--destructive` | `0.62 0.24 25` | `0.68 0.2 25` | Critical case type, errors |

Each status token has a paired `*-foreground` token chosen for contrast (white for dark fills; dark foreground for light fills like `urgent`).

### Warm Accent Tokens

Used for emotional warmth in rescue/donation contexts:

| Token | Light | Dark |
|-------|-------|------|
| `--warm-accent` | `0.66 0.18 33` | `0.74 0.14 33` |
| `--warm-accent-foreground` | `1.00 0 0` | `1.00 0 0` |
| `--warm-surface` | `0.975 0.012 60` | `0.28 0.02 34` |
| `--warm-surface-foreground` | `0.31 0.05 30` | `0.95 0.01 34` |

### Surface Hierarchy Tokens

Twitter/X-style layered surface system:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--surface` | `1 0 0` | `0.2 0.013 250` | Base layer |
| `--surface-elevated` | `1 0 0` | `0.23 0.016 250` | Cards, modals |
| `--surface-sunken` | `0.95 0.006 250` | `0.15 0.01 250` | Recessed areas |
| `--surface-overlay` | `1 0 0 / 0.92` | `0.19 0.011 250 / 0.96` | Overlay surfaces (blur is optional) |

### Navigation Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--nav-surface` | `0.995 0.003 250 / 0.98` | `0.19 0.011 250 / 0.98` |
| `--nav-border` | `0.88 0.008 250` | `0.37 0.014 250` |

### Avatar Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--avatar-bg` | `0.92 0.02 185` | `0.27 0.02 185` |
| `--avatar-border` | `0.86 0.03 185` | `0.35 0.025 185` |
| `--avatar-border-stacked` | `0.76 0.03 185` | `0.45 0.03 185` |
| `--avatar-placeholder` | `0.56 0.04 185` | `0.58 0.04 185` |

### Interactive State Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--interactive-hover` | `0.965 0.006 250` | `0.26 0.014 250` | Hover background |
| `--interactive-active` | `0.945 0.008 250` | `0.30 0.015 250` | Active/pressed |
| `--chip-bg` | `0.97 0.005 250` | `0.27 0.013 250` | Chip default |
| `--chip-bg-active` | `var(--primary)` | `var(--primary)` | Chip selected |
| `--chip-border` | `var(--border)` | `var(--border)` | Chip border |
| `--search-bg` | `1 0 0 / 0.98` | `0.25 0.013 250` | Search input bg |
| `--search-border` | `var(--border)` | `var(--border)` | Search input border |
| `--focus-ring-strong` | `var(--primary)` | `var(--primary)` | Strong focus indicator |

### Overlay Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--overlay-dim` | `0.24 0.01 248 / 0.58` | `0 0 0 / 0.72` |

### Chart Tokens

Five chart colors for data visualization:

| Token | Value (same in L/D) |
|-------|---------------------|
| `--chart-1` | `0.6723 0.1606 244` (blue) |
| `--chart-2` | `0.6907 0.1554 160` (teal) |
| `--chart-3` | `0.8214 0.1600 82` (yellow) |
| `--chart-4` | `0.7064 0.1822 151` (green) |
| `--chart-5` | `0.5919 0.2186 10` (red) |

### Sidebar Tokens

Sidebar tokens exist for shadcn/ui `Sidebar` component compatibility. **The app does not use a sidebar** — it uses mobile bottom nav. These tokens are retained for shadcn component compatibility but may be removed if the `sidebar.tsx` primitive is deleted.

| Token | Retained for shadcn | Candidate for removal |
|-------|---------------------|-----------------------|
| `--sidebar`, `--sidebar-foreground` | Yes | Yes — if `sidebar.tsx` is deleted |
| `--sidebar-primary`, `--sidebar-primary-foreground` | Yes | Yes |
| `--sidebar-accent`, `--sidebar-accent-foreground` | Yes | Yes |
| `--sidebar-border`, `--sidebar-ring` | Yes | Yes |

---

## Font System

**Primary font:** Nunito  
**Loaded weights:** 400 (light), 500 (normal), 600 (medium), 700 (semibold), 800 (bold)

### Font Stack

```css
--font-sans: Nunito, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
--font-serif: Georgia, serif;
--font-mono: Menlo, monospace;
```

### Typography Scale

From DESIGN.md (canonical):

| Element | Classes | Notes |
|---------|---------|-------|
| Page title | `text-lg font-semibold` | Section/page headers |
| Card title | `text-[15px] font-semibold leading-snug` | Case cards, campaign cards |
| Body | `text-sm text-muted-foreground leading-relaxed` | Descriptions, secondary text |
| Inputs | `text-base` | **Mandatory** on mobile — prevents iOS zoom |
| Fine print | `text-xs text-muted-foreground` | Timestamps, metadata |

### Letter Spacing

Custom tracking tokens derived from a base `--letter-spacing: 0em`:

| Token | Value |
|-------|-------|
| `--tracking-tighter` | `-0.05em` |
| `--tracking-tight` | `-0.025em` |
| `--tracking-normal` | `0em` |
| `--tracking-wide` | `+0.025em` |
| `--tracking-wider` | `+0.05em` |
| `--tracking-widest` | `+0.1em` |

Applied globally via `body { letter-spacing: var(--tracking-normal); }`.

---

## Border Radius System

Base radius: `--radius: 1rem` (16px)

| Token | Calculation | Effective Value |
|-------|-------------|-----------------|
| `--radius-sm` | `radius - 4px` | `12px` |
| `--radius-md` | `radius - 2px` | `14px` |
| `--radius-lg` | `radius` | `16px` |
| `--radius-xl` | `radius + 4px` | `20px` |
| `--radius-2xl` | `radius + 8px` | `24px` |
| `--radius-3xl` | `radius + 12px` | `28px` |
| `--radius-4xl` | `radius + 16px` | `32px` |

---

## Shadow System

Custom 8-level shadow system using OKLCH-based shadow color. Dark mode uses higher opacity values for stronger visual separation on dark surfaces.

### Light Mode Shadows

| Token | Value |
|-------|-------|
| `--shadow-2xs` | `0 1px 1px 0 oklch(0.20 0.01 248 / 0.05)` |
| `--shadow-xs` | `0 1px 2px 0 oklch(0.20 0.01 248 / 0.08)` |
| `--shadow-sm` | `0 2px 8px -3px oklch(0.20 0.01 248 / 0.12)` |
| `--shadow` | `0 4px 12px -5px oklch(0.20 0.01 248 / 0.14)` |
| `--shadow-md` | `0 8px 20px -10px oklch(0.20 0.01 248 / 0.16)` |
| `--shadow-lg` | `0 14px 32px -14px oklch(0.20 0.01 248 / 0.18)` |
| `--shadow-xl` | `0 20px 44px -20px oklch(0.20 0.01 248 / 0.20)` |
| `--shadow-2xl` | `0 30px 68px -26px oklch(0.20 0.01 248 / 0.24)` |

**Shadow color:** `oklch(0.20 0.01 248 / alpha)` — near-black with a cool-blue hue.

### Dark Mode Shadows

| Token | Value |
|-------|-------|
| `--shadow-2xs` | `0 1px 1px 0 oklch(0 0 0 / 0.25)` |
| `--shadow-xs` | `0 1px 3px 0 oklch(0 0 0 / 0.32)` |
| `--shadow-sm` | `0 4px 10px -4px oklch(0 0 0 / 0.42)` |
| `--shadow` | `0 8px 16px -8px oklch(0 0 0 / 0.46)` |
| `--shadow-md` | `0 12px 24px -12px oklch(0 0 0 / 0.50)` |
| `--shadow-lg` | `0 18px 36px -18px oklch(0 0 0 / 0.55)` |
| `--shadow-xl` | `0 24px 50px -24px oklch(0 0 0 / 0.60)` |
| `--shadow-2xl` | `0 34px 74px -30px oklch(0 0 0 / 0.65)` |

**Shadow color:** Pure black `oklch(0 0 0 / alpha)` — higher opacity (0.25–0.65) than light mode for visibility on dark surfaces.

---

## shadcn/ui Integration

### Configuration (`components.json`)

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Key configuration notes:
- `style: "new-york"` — the active shadcn style variant
- `rsc: false` — no React Server Components (Vite SPA, not Next.js)
- `config: ""` — empty because Tailwind v4 uses CSS-first config (no `tailwind.config.js`)
- `cssVariables: true` — components use CSS variables for theming (required for our token system)
- `baseColor: "slate"` — shadcn's base palette reference, but actual colors are overridden by our OKLCH tokens

### Component Inventory

`src/components/ui/` currently contains 23 active primitives:
- `avatar.tsx`
- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `dialog.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `input.tsx`
- `label.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `skeleton.tsx`
- `switch.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toast.tsx`
- `toaster.tsx`
- `tooltip.tsx`
- `use-toast.ts`

### Toast System Duplication

Current implementation uses shadcn toast stack:
- `src/components/ui/toaster.tsx`
- `src/components/ui/toast.tsx`
- `src/components/ui/use-toast.ts`

`Toaster` is mounted in `App.tsx`.

### Button `iconTouch` Variant

A custom button variant `size="iconTouch"` is used in `CommunityMobileShellLayout` for 44x44px touch-compliant icon buttons. This variant MUST maintain minimum 44x44px dimensions and be used for all mobile icon actions.

---

## Custom Component Classes

Defined in `@layer components`:

| Class | Purpose | Usage |
|-------|---------|-------|
| `.progress-bar-track` | Progress bar background | Donation/campaign progress |
| `.progress-bar-fill` | Progress bar fill | Donation/campaign progress |
| `.badge-urgent` | Urgent status badge | Case cards |
| `.badge-critical` | Critical status badge | Case cards |
| `.badge-recovering` | Recovering status badge | Case cards |
| `.badge-adopted` | Adopted status badge | Case cards |
| `.sticky-donate` | Fixed-bottom donate CTA | Case detail page |

Defined in `@layer utilities`:

| Class | Purpose |
|-------|---------|
| `.scrollbar-hide` | Hide scrollbar (stories strip, carousels) |
| `.scroll-touch` | iOS momentum scrolling |
| `.glass-ultra` | Backdrop-blur glass overlay |
| `.nav-shadow` | Navigation shadow |

---

## Forbidden Patterns

These patterns are **banned** across app surfaces:

| Pattern | Example | Why Forbidden |
|---------|---------|---------------|
| Raw palette classes | `bg-blue-500`, `text-red-600` | Bypasses token system, breaks theming |
| Gradient classes | `bg-gradient-to-r`, `from-teal-500` | Visual noise on trust surfaces |
| Arbitrary color values | `bg-[#FF6B35]`, `text-[oklch(...)]` | Unmaintainable, bypasses tokens |
| Hardcoded hex/rgb | `style={{ color: '#333' }}` | Breaks dark mode |
| Self-referencing `@theme` vars | `--tracking-normal: var(--letter-spacing)` | Fragile, circular dependency risk |

### Style Gate Enforcement

Automated scanning via:

```bash
pnpm styles:scan:palette    # Detects raw palette classes
pnpm styles:scan:arbitrary  # Detects arbitrary values
pnpm styles:scan:gradients  # Detects gradient usage
pnpm styles:gate            # Runs all scans, fails on violations
```

`styles:gate` scans all files under `src/` (excluding `src/components/ui/`) to enforce token policy and prevent palette/arbitrary/gradient regressions.

---

## Accessibility

### Contrast Requirements

All foreground/background token pairs MUST meet **WCAG AA** minimum contrast ratios:
- **Normal text (< 18px / < 14px bold):** 4.5:1
- **Large text (≥ 18px / ≥ 14px bold):** 3:1
- **UI components and graphical objects:** 3:1

### Focus States

Every interactive element MUST have a visible focus indicator:
- Default: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Strong (high-contrast): `focus-visible:ring-2 focus-visible:ring-focus-ring-strong`

### Dark Mode

The `@custom-variant dark (&:is(.dark *))` pattern enables class-based dark mode toggling. All token pairs maintain readable contrast in both modes.

---

## Known Issues & Remediation

Issues identified from `refactor/tailwind.md` and `docs/design-docs/ui/tailwind-shadcn-remediation-plan.md`:

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Self-referencing `@theme` variable (`--tracking-normal: var(--letter-spacing)`) | Medium | Resolved — `--tracking-normal` is now directly defined in `@theme inline` |
| 2 | Duplicate `--font-sans` in `@theme`, `:root`, and `.dark` blocks | Low | Resolved — font vars live in `@theme inline`, duplicates removed |
| 3 | `.dark` redeclares `--radius`, `--spacing`, `--font-*` (identical to `:root`) | Low | Partially resolved — `--radius` and font duplicates removed; `--spacing` retained intentionally |
| 4 | Sidebar tokens (`--color-sidebar-*`) may be dead if `sidebar.tsx` is removed | Low | Open — audit component usage first |
| 5 | Chart tokens — verify chart components exist | Low | Open — audit usage |
| 6 | Two toast systems coexist (shadcn Toaster + Sonner) | Medium | Open — pick one |
| 7 | Legacy `Open Sans` font references | Resolved | Fixed — Nunito is now consistent everywhere |
| 8 | Priority migration queue for trust-critical surfaces | In progress | Per remediation plan |

---

## Non-Functional Requirements

- **Performance:** Token system adds zero runtime overhead — all CSS custom properties, no JS.
- **Bundle size:** `tw-animate-css` import adds ~2KB gzipped. Verify animations are used; remove if not.
- **Browser support:** OKLCH is supported in all modern browsers (Chrome 111+, Safari 15.4+, Firefox 113+). No fallback needed for target audience.
- **Maintainability:** Single-file token system (`index.css`) is the only source of truth. No external theme config files.

---

## Open Questions

1. **Sidebar tokens:** Delete `sidebar.tsx` and all `--sidebar-*` tokens, or keep for potential future desktop sidebar?
2. **Chart tokens:** Are all 5 chart colors used? Audit `chart.tsx` usage.
3. **Toast consolidation:** Which toast system to keep — shadcn `Toaster` or Sonner?
4. **`tw-animate-css`:** Is this package actively used for animations? If only for shadcn component enter/exit, consider if it can be replaced with vanilla CSS transitions.
5. **Token drift:** Ensure `docs/design-docs/ui/theming-tokens-spec.md` stays in sync with `src/index.css` after token updates.
