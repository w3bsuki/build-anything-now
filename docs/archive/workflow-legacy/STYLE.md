# Pawtreon Styling System (Single Source of Truth)

**Canonical:** this doc + `src/index.css`. If they disagree, **`src/index.css` wins**.

## Principles
1. **Trust-first look**: calm surfaces, clear hierarchy, no visual chaos.
2. **App-like speed**: mobile-first layouts, predictable spacing, minimal reflow.
3. **Token-only colors**: use semantic tokens (`bg-card`, `text-muted-foreground`) not hardcoded hex/`bg-red-500` for product UI.
4. **Avoid gradients by default**: prefer flat, calm surfaces. If a gradient is used (rare), keep it subtle and consistent (single pattern).
5. **One primary action** per surface: cards have 1 CTA; detail pages can have 2–3 actions.

## Theme + tokens
- Tokens live in `src/index.css` (`:root` and `.dark`).
- Use only semantic Tailwind classes wired to tokens:
  - Surfaces: `bg-background`, `bg-card`, `bg-muted`
  - Text: `text-foreground`, `text-muted-foreground`
  - Borders: `border-border`
  - Focus: `ring-ring`
  - Status: `bg-destructive`, `bg-urgent`, `bg-recovering`, `bg-adopted`

## Layout + spacing (defaults)
- **Page padding:** `px-4`
- **Section gaps:** `space-y-4` (dense), `space-y-6` (standard)
- **Card padding:** `p-3` (compact), `p-4` (standard)
- **Radii:** use the design tokens (avoid custom `rounded-[...]` unless required)

## Typography
- **Font:** `Nunito` (imported in `src/main.tsx`); keep `--font-sans` consistent with this.
- **Inputs must be `text-base` on mobile** (prevents iOS zoom).
- Titles:
  - Page title: `text-lg font-semibold`
  - Card title: `text-[15px] font-semibold leading-snug`
- Body:
  - `text-sm text-muted-foreground leading-relaxed`

## Buttons (standards)
- **Primary CTA:** `h-10` (cards), `h-11` only when it’s the *main* bottom action.
- **Icon touch target:** minimum `44x44` (use `size="iconTouch"` variants where available).

## Cards (feed rules)
- Prefer showing **2–3 cards per screen** on mobile (avoid “one giant card”).
- Recommended media ratios:
  - Feed cards: `aspect-video` (compact) or `aspect-[3/2]` (photo-forward)
  - Avatars: `1:1`
- Keep social proof compact (avatars + “X helping”) and avoid duplication.

## Navigation
- Mobile header stays sticky.
- “Stories” row scrolls away (not sticky).
- Bottom nav is always visible on primary browse pages; hide it on immersive flows (case detail, forms, messages).

## shadcn/ui usage
- Do not edit `src/components/ui/*` unless necessary; add variants via component props.
- Prefer `cn()` patterns and existing primitives over bespoke wrappers.

## Accessibility + polish
- Every interactive element must have:
  - a visible hover/active state
  - a focus ring (`focus:ring-2 focus:ring-ring`)
  - an accessible label if icon-only

## When you need to change the look
1. Change tokens in `src/index.css` (light + dark).
2. Update this doc if the rule changes.
3. Log any lasting design decision in `DECISIONS.md`.
