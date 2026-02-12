# UI/UX Patterns Spec

> **Owner:** Product + Design + Frontend  
> **Status:** final  
> **Last updated:** 2026-02-10

---

## Purpose

This spec defines the canonical UI/UX patterns for Pawtreon: the case-first home information architecture, page-by-page layout expectations, component usage rules, interaction states, loading/error/empty states, animation guidelines, and anti-patterns. It is the implementation reference for all frontend surfaces.

It absorbs findings from:
- `docs/design/localhost-8080-visual-audit.md` (P2 — home feed density)
- `docs/design/mobile-ux-audit-2026-02-07.md` (F12 — typography hierarchy, F13 — ambiguous FAB)
- DESIGN.md Layout Defaults and Typography sections

---

## User Stories

- As a **donor**, I want to immediately see urgent rescue cases on the home feed so I can act quickly.
- As a **rescuer**, I want a clear, uncluttered interface to create and update cases so I can focus on the animal.
- As a **volunteer**, I want consistent navigation and predictable layout so I can find what I need fast on my phone.
- As a **developer**, I want documented patterns for loading states, empty states, and error handling so every page behaves consistently.

---

## Functional Requirements

1. Home page (`/`) MUST be case-first — rescue cases are the primary content, never below other modules.
2. Stories strip MUST source from urgent/new case activity only — no generic social activities.
3. Filter rail MUST have max 4 visible controls on mobile: segmented control (`Urgent`, `Near`, `Adopt`) + `More` (opens sheet for city + distance + utilities).
4. Case feed MUST use server-driven filtering and pagination — no client-side "fetch all then filter."
5. Every page MUST have a defined loading state, error state, and empty state.
6. Notification badge counts MUST be data-driven — never hardcoded.
7. Typography MUST follow the defined type scale consistently across all pages.

---

## Home Information Architecture

### Primary Objective

`/` is a rescue-first surface. The user should immediately understand urgent need and have one clear way to act.

### First-Fold Structure (Mobile, 390x844)

```
┌─────────────────────────┐
│ 🐾 Pawtreon  🔍 🔔 👤  │  ← Compact app bar (logo + 3 icons)
├─────────────────────────┤
│ ○ ○ ○ ○ ○ ○ ○          │  ← Stories strip: "Urgent Updates"
├─────────────────────────┤
│ [Urgent|Near|Adopt]  ⋯  │  ← Filter rail (segmented + More sheet)
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🐕 Hero Urgent Case │ │  ← Hero case card (only if urgent exists)
│ │ [Help Now]          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Case Card           │ │  ← Unified case list
│ └─────────────────────┘ │
└─────────────────────────┘
```

### First-Fold Constraints

- **No** large inline search input on first fold — search opens from header icon.
- **No** duplicated urgent modules above the main case feed.
- **Max three** primary interaction zones in the first viewport.
- Hero urgent card appears **only** when an urgent case exists.

### Feed Composition (Scroll Order)

1. **Hero urgent case card** (conditional — only when urgent case exists)
2. **Unified case list** with single card system
3. **Mission initiatives module** — appears after the first case block, **never above** rescue-first content
4. **Empty state** is rescue-first with clear CTA intent: adjust filters or create a case

### Social Boundary

- `/` remains **case-first rescue feed**
- `/community` remains **discussion/social feed**
- No mixed social post cards appear in the home feed

---

## Page-by-Page Layout Specs

### Layout Primitives

| Primitive | Classes | Usage |
|-----------|---------|-------|
| Page container | `px-4 pb-24` | All pages (pb-24 for bottom nav clearance) |
| Section gap (dense) | `space-y-4` | Within compact sections |
| Section gap (standard) | `space-y-6` | Between major sections |
| Card padding (compact) | `p-3` | Feed cards, list items |
| Card padding (standard) | `p-4` | Detail cards, forms |
| Max content width | `max-w-3xl mx-auto` | Center content on desktop |

### Shared Layout Components (SSOT)

Use these components to avoid repeated page wrapper class drift:

| Component | File | Responsibility |
|-----------|------|----------------|
| `PageShell` | `src/components/layout/PageShell.tsx` | App-level min-height, nav clearance, desktop top offset |
| `PageSection` | `src/components/layout/PageSection.tsx` | Section spacing + max-width + horizontal padding |
| `SectionHeader` | `src/components/layout/SectionHeader.tsx` | Standardized title/count/action row |
| `StickySegmentRail` | `src/components/layout/StickySegmentRail.tsx` | Desktop sticky filters/segment rails |
| `StickyActionBar` | `src/components/trust/StickyActionBar.tsx` | Sticky trust CTA container at bottom |
| `StatsGrid` | `src/components/common/StatsGrid.tsx` | Reusable metric stat block |

**Critical:** All pages MUST include `pb-24` (or equivalent bottom padding) to clear the fixed bottom navigation bar. The bottom nav at `fixed bottom-0 z-50` covers ~60px of content without padding.

### Per-Page Expectations

| Page | Route | Layout | Key Elements |
|------|-------|--------|--------------|
| **Home** | `/` | Case-first feed | App bar, stories strip, filter rail, case cards, initiative module |
| **Case Detail** | `/case/:id` | Full-width detail | Hero image, status badge, donation CTA (sticky bottom), updates timeline, comments |
| **Campaigns** | `/campaigns` | List with sections | Featured campaigns (deduplicated from main list), all campaigns, category filters |
| **Campaign Detail** | `/campaigns/:id` | Detail + progress | Hero, funding progress, description, related cases, donate CTA |
| **Clinics** | `/clinics` | Directory | Search, city filter rail, clinic cards (single-column at ≤360px per F7) |
| **Clinic Detail** | `/clinics/:id` | Profile + directory | Clinic info, services, hours, linked cases, reviews, claim CTA |
| **Partners** | `/partners` | Directory | Filter rail, partner cards, stats (must show real counts per F4) |
| **Partner Detail** | `/partners/:id` | Profile | Partner info, linked campaigns, impact stats |
| **Community** | `/community` | Shell layout | Own header + bottom nav via `CommunityMobileShellLayout`, board tabs, post list |
| **Community Post** | `/community/:postId` | Thread detail | Post content, 2-level comments, like/report actions |
| **Account** | `/account` | Settings hub | Profile card, menu items (donations, achievements, settings, etc.) |
| **Notifications** | `/notifications` | List | Notification items with type icons, timestamps, read/unread |
| **Settings** | `/settings` | Form | Language, theme, notification preferences |
| **Create Case** | `/create-case` | Multi-step form | Photo upload, details, location, funding goal, preview |
| **Admin** | `/admin/*` | Queue | Filterable, sortable moderation/claims items |

### Community Shell Pattern

The community section uses `CommunityMobileShellLayout` — the **only shared layout component** in the app. It provides:
- Sticky header with community branding, notification bell, account icon
- `CommunityBottomNav` instead of global `Navigation`
- Safe area inset support: `pt-[env(safe-area-inset-top)]`
- Auto-hides on thread detail pages

Non-community routes now use SSOT layout primitives (`PageShell`, `PageSection`, `SectionHeader`, `StickySegmentRail`) for trust-surface consistency and reduced wrapper duplication.

---

## Component Patterns

### Card System

Use a **single case card family** for feed consistency. Card types by context:

| Context | Card Variant | Key Differences |
|---------|-------------|-----------------|
| Home feed | Full card | Image + title + status + progress + CTA |
| Campaign detail | Linked case | Compact — title + status + thumbnail |
| Search results | Result card | Title + status + location |
| Saved cases | List item | Title + status + saved date |

Card constraints from DESIGN.md:
- Show 2–3 cards per screen on mobile
- Media ratio: `aspect-video` (feed) or `aspect-[3/2]` (photo-forward)
- Avatars: `1:1` aspect ratio

### Notification Badges

- Badge counts MUST be powered by backend unread counts (from `home.getUnreadCounts` query)
- Never hardcode badge numbers
- Display: `9+` for counts > 9
- Use `ring-1 ring-background` for visual separation from parent

### FAB (Floating Action Button)

The center "+" button in the bottom nav is the primary creation action. Per audit finding F13, the FAB is **ambiguous** — users don't know what it creates.

**Required:** Add contextual disambiguation:
- On `/` (home): FAB creates a case → label "New Case" or case icon
- On `/community`: FAB creates a post → label "New Post"
- On other pages: Either hide or show a menu with create options

---

## Component Library Guide

### Using shadcn Primitives

1. **Import from `@/components/ui/`** — never re-implement a component that exists as a primitive.
2. **Don't put business logic in `components/ui/`** — these must remain app-agnostic. Business logic goes in page components or custom components.
3. **Compose, don't extend** — build complex components by composing primitives, not by modifying them in place.
4. **Variant props over conditional classes** — use shadcn variant props (`variant="destructive"`, `size="sm"`) instead of manual class conditionals.

### Component Naming

| Location | Convention | Example |
|----------|-----------|---------|
| `components/ui/` | Lowercase kebab | `button.tsx`, `card.tsx` |
| `components/` | PascalCase | `CaseCard.tsx`, `DonationModal.tsx` |
| `pages/` | PascalCase | `AnimalProfile.tsx`, `CreateCase.tsx` |
| `layouts/` | PascalCase + suffix | `CommunityMobileShellLayout.tsx` |

---

## Interaction States

Every interactive element MUST define these states:

| State | Visual Treatment | Token |
|-------|-----------------|-------|
| **Default** | Base styling | Surface/foreground tokens |
| **Hover** | Subtle background shift | `bg-interactive-hover` or `hover:bg-muted` |
| **Focus** | Ring indicator | `focus-visible:ring-2 focus-visible:ring-ring` |
| **Active/Pressed** | Deeper background | `bg-interactive-active` or `active:bg-muted` |
| **Disabled** | Reduced opacity | `opacity-50 cursor-not-allowed pointer-events-none` |
| **Loading** | Spinner or pulse | Inline spinner or `animate-pulse` on skeleton |

### Button States

```
[Default] → hover → [Hover] → mousedown → [Active] → mouseup → [Default]
                                                    → focus → [Focused]
[Default] → disabled → [Disabled] (no hover/active)
[Default] → loading → [Loading] (spinner replaces label, no interaction)
```

### Card States

- **Hover:** Subtle shadow increase (`shadow-sm → shadow`)
- **Tap/Click:** No visual state change (navigates immediately)
- **Loading:** Skeleton placeholder (see Loading States)

---

## Loading, Error, and Empty States

### Loading States

**Rule:** Every data-dependent surface MUST show skeleton placeholders during loading — never blank space, never persistent gray circles (F10 fix).

| Surface | Skeleton Pattern |
|---------|-----------------|
| Case card | Gray rectangle (image) + 3 gray lines (text) + gray bar (progress) |
| Campaign card | Gray rectangle (image) + 2 gray lines + gray bar |
| Clinic card | Gray circle (icon) + 2 gray lines |
| Profile | Gray circle (avatar) + 3 gray lines |
| Lists | 3–5 skeleton items |

Implementation: Use `@/components/ui/skeleton` with `animate-pulse`. CSS-only shimmer — no JS animation libraries.

### Error States

| Error Type | Treatment |
|------------|-----------|
| Page-level data fetch error | Error boundary with "Something went wrong" + retry button |
| Component-level error | Inline error message with retry, component degrades gracefully |
| Network error | Toast notification: "Connection lost. Retrying..." |
| Auth error | Redirect to `/sign-in` with return URL |

### Empty States

**Rule:** Every empty state is rescue-first. Don't show blank pages — show a CTA.

| Surface | Empty State |
|---------|-------------|
| Home feed (no cases) | "No rescue cases yet. Be the first to report an animal in need." + [Create Case] CTA |
| Filtered feed (no results) | "No cases match your filters. Try adjusting them." + [Clear Filters] |
| Campaign list (empty) | "No campaigns yet." + [Create Campaign] for authorized users |
| Notifications (empty) | "All caught up! No new notifications." |
| Donations (no history) | "You haven't made any donations yet. Every bit helps." + [Browse Cases] |
| Search (no results) | "No results found. Try different keywords." |

---

## Typography Hierarchy

Consistent type scale across all pages (addresses F12 audit finding):

| Level | HTML | Classes | Usage |
|-------|------|---------|-------|
| Page title | `<h1>` | `text-lg font-semibold` | Page headers (one per page) |
| Section title | `<h2>` | `text-base font-semibold` | Section headers within page |
| Subsection | `<h3>` | `text-sm font-semibold` | Subsection headers |
| Card title | `<h3>` or `<p>` | `text-[15px] font-semibold leading-snug` | Case/campaign card titles |
| Body | `<p>` | `text-sm text-muted-foreground leading-relaxed` | Descriptions, content |
| Fine print | `<span>` | `text-xs text-muted-foreground` | Timestamps, metadata, captions |

**Critical:** Section headers like "Urgent Updates" and "Cases Needing Help" MUST use `<h2>` consistently — never `<p>`. The audit found random heading weight/size across pages.

---

## Animation Guidelines

### Principles

1. **Short and purposeful** — transitions serve UX, not decoration
2. **Reduced motion support** — respect `prefers-reduced-motion` media query
3. **No motion overload** — max 1-2 animated elements visible at a time

### Allowed Transitions

| Property | Duration | Easing | Use Case |
|----------|----------|--------|----------|
| `opacity` | `150ms` | `ease-in-out` | Fade in/out (modals, tooltips) |
| `transform` | `200ms` | `ease-out` | Slide/scale (sheets, drawers) |
| `background-color` | `150ms` | `ease` | Hover state transitions |
| `box-shadow` | `150ms` | `ease` | Card hover elevation |

### Forbidden Animations

- Looping decorative animations (spinners excepted)
- Auto-playing carousels
- `transition-all` (too broad, can cause layout jank)
- Animation on initial page load (except skeleton shimmer)

### Skeleton Shimmer

Use CSS-only shimmer via `animate-pulse` from Tailwind. This is the **only** animation that should appear on page load. Duration: inherited from Tailwind defaults (~2s).

---

## Filter Rail

### Mobile Constraints

- **Max 4 visible controls** on mobile first fold: segmented control (`Urgent`, `Near`, `Adopt`) + `More`
- No horizontal scrolling in the primary rail (must fit at `320px`)
- City and distance controls live behind `More` (bottom drawer/sheet)
- Selected segment uses a calm elevated fill; sheet chips can use `bg-chip-bg-active text-primary-foreground`

### Desktop

- Same controls and semantics as mobile (segmented + More)
- No hover "lift" / translate effects on trust surfaces

### Filter Behavior

- Filters are **server-driven** — each filter change triggers a new Convex query
- No client-side "fetch all then filter" pattern
- Filter state persists in URL query params for shareability

---

## Search Overlay

- Opens from header search icon (magnifying glass)
- Covers full viewport on mobile, overlay on desktop
- Keyboard escape closes the overlay
- Search query hits server-side — searches cases, clinics, campaigns, community posts
- Results grouped by type with type indicators
- Empty search state: "Search for rescue cases, clinics, or community posts"

---

## Token and Theming Rules

### Required on App Surfaces

Semantic token classes only:
- `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`
- `border-border`, `ring-ring`
- Status tokens: `bg-urgent`, `bg-recovering`, `bg-adopted`, `bg-destructive`

### Forbidden on App Surfaces

- Palette classes: `text-red-500`, `bg-blue-600`
- Gradient classes: `bg-gradient-to-*`, `from-*`, `via-*`, `to-*`
- Arbitrary color values: `bg-[#...]`, `text-[oklch(...)]`

### Enforcement

```bash
pnpm styles:scan:palette     # Detects raw palette usage
pnpm styles:scan:arbitrary   # Detects arbitrary values
pnpm styles:scan:gradients   # Detects gradient usage
pnpm styles:gate             # Runs all scans, fails on violations
```

---

## Global Components in App.tsx

These components are mounted globally at the app root:

| Component | Purpose | Notes |
|-----------|---------|-------|
| `Navigation` | Bottom nav bar | Fixed bottom, z-50. Hidden on `/community*` to avoid double-nav conflict with community shell |
| `LanguageDetectionBanner` | IP-based language suggestion | Has CORS issue with ipapi.co (P1). Should not run on presentation routes. |
| `ProductTour` | First-use guided tour | Scaffolding exists — decision needed: keep/remove/rebuild |
| `Toaster` | Toast notifications | shadcn toast. Sonner also exists — consolidate. |
| `ScrollToTop` | Scroll to top on navigation | Resets scroll position on route change |
| `OnboardingRedirect` | Redirect to onboarding | Checks `onboardingCompleted` flag |

---

## Component Catalog

All shadcn/ui primitives live in `src/components/ui/`. These are the installed primitives and their usage rules.

| Component | File | When to Use | Notes |
|-----------|------|-------------|-------|
| Avatar | `avatar.tsx` | User/rescuer profile images | Always pair with fallback initials |
| Badge | `badge.tsx` | Status labels, verification tags, counts | Use variant props; never raw color classes |
| Button | `button.tsx` | All interactive actions | Use `variant` + `size` props; `destructive` for irreversible |
| Card | `card.tsx` | Case cards, profile cards, settings groups | Compose with `CardHeader`, `CardContent`, `CardFooter` |
| Dialog | `dialog.tsx` | Confirmations, detail views on desktop | Prefer `Drawer` on mobile viewports |
| Drawer | `drawer.tsx` | Bottom sheets on mobile | Donation flow, case actions, mobile-first modals |
| Dropdown Menu | `dropdown-menu.tsx` | Overflow menus, sort options | Report menu on case cards uses this |
| Input | `input.tsx` | Text fields | Pair with `Label`; always include aria-label |
| Label | `label.tsx` | Form field labels | Required for all inputs — a11y non-negotiable |
| Progress | `progress.tsx` | Donation progress bars | Shows donation goal completion on case cards |
| Radio Group | `radio-group.tsx` | Single-select options (report reasons, categories) | |
| Scroll Area | `scroll-area.tsx` | Horizontally-scrollable regions (stories strip) | |
| Select | `select.tsx` | Dropdowns with predefined options | Prefer over native `<select>` for styling |
| Separator | `separator.tsx` | Visual dividers between content sections | |
| Sheet | `sheet.tsx` | Side panels (desktop filters, nav on tablet) | |
| Skeleton | `skeleton.tsx` | Loading placeholders | All async surfaces MUST use skeleton shimmer |
| Switch | `switch.tsx` | Toggle settings (notifications, dark mode) | |
| Tabs | `tabs.tsx` | Section switching (profile tabs, community tabs) | |
| Textarea | `textarea.tsx` | Multi-line input (case story, community posts) | |
| Toast | `toast.tsx` + `toaster.tsx` | Success/error feedback | Use `useToast()` hook; never alert() |
| Tooltip | `tooltip.tsx` | Icon-only button explanations | Required for all icon-only actions |

**Rules:**
1. Never re-implement a primitive — if shadcn has it, use it.
2. Never add business logic to `components/ui/` — keep them app-agnostic.
3. Install new primitives via `pnpm dlx shadcn@latest add <name>`.
4. Customize via Tailwind v4 tokens in `src/index.css`, not by editing the component.

---

## Accessibility Baseline

Pawtreon targets **WCAG 2.1 AA** compliance across all surfaces.

### Heading Hierarchy

- Every page MUST have exactly one `<h1>` (page title).
- Headings MUST be sequential: `h1 → h2 → h3`. Never skip levels.
- Never use `<p>` styled as a heading — use proper heading elements.

### Color & Contrast

- Body text: minimum **4.5:1** contrast ratio against background.
- Large text (≥18px bold or ≥24px regular): minimum **3:1**.
- UI components and graphical objects: minimum **3:1**.
- All contrast checked against both light and dark mode tokens.
- See [theming-tokens-spec.md](theming-tokens-spec.md) for OKLCH values and pairings.

### Interactive Elements

- All clickable elements MUST have visible focus indicators (`ring-ring` token).
- Icon-only buttons MUST have either: `aria-label`, `<Tooltip>`, or visible text.
- Touch targets: minimum **44×44px** on mobile (WCAG 2.5.8).
- Disabled elements: use `aria-disabled` + reduced opacity, not just visual dimming.

### Forms

- Every `<Input>`, `<Textarea>`, `<Select>` MUST have an associated `<Label>` or `aria-label`.
- Error messages MUST be linked to inputs via `aria-describedby`.
- Required fields MUST use `aria-required="true"`.
- Form submission errors MUST be announced via live region or toast.

### Images & Media

- Case photos MUST have `alt` text describing the animal/situation.
- Decorative images use `alt=""` (empty string, not omitted).
- Videos (future): MUST have captions.

### Navigation

- Bottom navigation MUST use `<nav>` with `aria-label="Main navigation"`.
- Active route MUST be indicated with `aria-current="page"`.
- Skip-to-content link SHOULD be present (implement when adding keyboard nav).

### Testing Expectations

- Run axe-core in dev tools periodically.
- Verify with keyboard-only navigation (Tab, Enter, Escape).
- Check screen reader announcements for critical flows: donation, case creation, report submission.

---

## Anti-Patterns

| Anti-Pattern | Why Bad | Correct Pattern |
|--------------|---------|-----------------|
| Stacking stories + nested filter containers + scrolling pills in one fold | Overwhelming, reduces clarity | Three-zone first fold structure with a single segmented rail + `More` sheet |
| Client-side "fetch all then filter" | Poor performance, wrong mental model | Server-driven queries via Convex |
| Duplicate urgency surfaces with same content | Confusing, inflates scroll | Single hero + unified list |
| Business logic in `components/ui/` | Breaks reusability | Logic in page/custom components |
| Hardcoded strings in JSX | Breaks i18n | Use `t()` from react-i18next |
| Hardcoded badge counts | Fake trust, stale data | Backend-driven unread counts |
| No pagination on long lists | Performance, UX | Cursor-based pagination, max 10-20 initial items |
| Ambiguous FAB with no context | Confusing creation action | Contextual label or icon per route |
| `<p>` for section headers | Broken heading hierarchy | Proper `<h2>`, `<h3>` usage |
| Gray placeholder circles that never resolve | Looks broken | Skeleton shimmer with timeout fallback |

---

## Acceptance Criteria

### Functional

- Home uses server-driven query for filters + pagination
- Stories row shows urgent/new case stories only
- Search is opened from header action and applies server-side filtering
- Header badges are powered by backend unread counts

### UX

- First fold has no duplicated urgency strip
- First fold interaction density follows the three-zone structure
- Case-first hierarchy is visually clear at `390x844` and `1440x900`
- All pages include bottom nav clearance padding
- All section headers use proper heading elements

### Quality Gates

- `pnpm lint` passes
- `tsc --noEmit` passes
- `pnpm build` passes
- `pnpm styles:gate` passes for app surfaces (`src/`, excluding `src/components/ui/*`)

---

## Non-Functional Requirements

- **Performance:** No client-side filtering or sorting of full datasets. All feed queries server-driven with cursor-based pagination.
- **Responsiveness:** All patterns tested at 320x568 (iPhone SE), 375x812 (iPhone 12), 390x844 (iPhone 14), 1440x900 (desktop).
- **Accessibility:** Proper heading hierarchy (h1 → h2 → h3), meaningful labels on icon-only actions, WCAG AA contrast ratios.
- **Consistency:** One card system, one type scale, one loading pattern across all surfaces.

---

## Open Questions

1. **ProductTour:** Keep, remove, or rebuild? Currently exists as scaffolding.
2. **Desktop layout:** Home uses a narrow content rail with large unused side margins. Consider two-column layout or wider grid for desktop viewports.
3. **Card hover effects:** Currently cards have hover states on desktop. Should these be more pronounced? Define card interaction model for desktop vs. mobile.
