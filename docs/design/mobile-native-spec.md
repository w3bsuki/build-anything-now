# Mobile & Native Spec

> **Owner:** Frontend  
> **Status:** final  
> **Last updated:** 2026-02-09

---

## Purpose

Pawtreon is a **mobile-first** platform. The primary user experience is on a phone — donors scrolling rescue cases, rescuers posting updates from the field, volunteers checking availability. This spec documents: Capacitor native integration, responsive breakpoints, touch target rules, bottom nav behavior, safe area insets, iOS/Android specifics, and PWA considerations.

Absorbs all findings from:
- `docs/design/mobile-ux-audit-2026-02-07.md` (F1–F13, 5-phase remediation plan)
- `docs/design/localhost-8080-visual-audit.md` (P0 — presentation white-screen)
- RULES.md Mobile-First section
- DESIGN.md Native Path section

---

## User Stories

- As a **donor on iPhone**, I want every button and card to be fully visible and tappable so I can donate quickly.
- As a **rescuer in the field**, I want to take photos with my phone camera and create a case immediately.
- As a **volunteer**, I want push notifications when a nearby animal needs transport.
- As a **user on a small phone (320px)**, I want all content to be readable without horizontal scrolling.

---

## Functional Requirements

1. All interactive elements MUST have minimum 44x44px touch targets (RULES.md mandate).
2. All form inputs MUST use `text-base` (16px) to prevent iOS zoom on focus.
3. The bottom navigation bar MUST NOT overlap page content (F1 fix: all pages need `pb-24` or equivalent).
4. Safe area insets MUST be applied on all fixed/sticky elements (top and bottom).
5. The app MUST be responsive at 320px width — no horizontal overflow, no clipped content.
6. Native features (camera, GPS, push, share) MUST gracefully degrade when running as web app (non-Capacitor).

---

## Capacitor Integration

### Current State

Capacitor config (`capacitor.config.ts`) is **barebones**:

```typescript
{
  appId: 'com.pawtreon.app',
  appName: 'Pawtreon',
  webDir: 'dist'
}
```

No plugins are configured. The `android/` and `ios/` directories exist as minimal shells.

### Target Plugin Inventory

| Plugin | Package | Purpose | Priority |
|--------|---------|---------|----------|
| **Camera** | `@capacitor/camera` | Case photo capture | P0 — required for case creation |
| **Geolocation** | `@capacitor/geolocation` | Location for cases/clinics/nearby filtering | P0 — required for "Near me" |
| **Push Notifications** | `@capacitor/push-notifications` | Alert on donations, case updates, volunteer requests | P1 — post-MVP |
| **Share** | `@capacitor/share` | Native share sheet for cases/campaigns | P1 — growth mechanic |
| **Haptics** | `@capacitor/haptics` | Subtle feedback on donations, likes | P2 — polish |
| **StatusBar** | `@capacitor/status-bar` | Status bar color/style matching app theme | P1 — visual polish |
| **SplashScreen** | `@capacitor/splash-screen` | Branded launch screen | P1 — professional feel |
| **Keyboard** | `@capacitor/keyboard` | Keyboard behavior control (accessory bar, auto-scroll) | P2 — form UX |
| **App** | `@capacitor/app` | App state management, back button handling | P1 — Android required |

### Plugin Fallback Strategy

When running as web (no native shell), plugins should degrade gracefully:

| Plugin | Web Fallback |
|--------|-------------|
| Camera | HTML `<input type="file" accept="image/*" capture>` |
| Geolocation | Browser Geolocation API |
| Push Notifications | Not available — use in-app notification center |
| Share | Web Share API (`navigator.share`) with clipboard fallback |
| Haptics | No-op (skip silently) |
| StatusBar | CSS `meta[name="theme-color"]` |

---

## Responsive Breakpoints

### Tested Viewports

| Device | Width × Height | Status |
|--------|----------------|--------|
| iPhone SE (ultra-thin) | 320×568 | Tested — multiple issues found |
| iPhone 12 | 375×812 | Tested — primary reference |
| iPhone 14 | 390×844 | Tested — current target |
| Desktop | 1440×900 | Tested — secondary |

### Tailwind Breakpoints

Using Tailwind's default breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| (default) | 0px | Mobile-first base styles |
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets, community shell hides on md+ |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

### Critical Width Rules

- **320px:** All content must be readable. Single-column layouts only. No 2-column grids (F7 fix for clinic cards).
- **360px:** Transition point — 2-column grids allowed above this width.
- **390px:** Primary design target. All specs validated at this width.
- **768px+:** Community shell header hides (`md:hidden`). Desktop navigation may differ.

---

## Touch Targets

### Rules (Non-Negotiable, from RULES.md)

- **Minimum size:** 44×44px for all interactive elements
- **Minimum spacing:** 8px between adjacent touch targets
- **Implementation:** Use `size="iconTouch"` button variant for icon-only actions

### Known Violations (F9 Findings)

| Location | Issue | Fix |
|----------|-------|-----|
| Header icon cluster (search + notifications + account) | 3 icons in ~100px — too close | Space icons with `gap-1` minimum, each icon button 44×44 |
| Campaign "Допринеси" buttons | Narrow width, low height | Minimum `min-h-11 min-w-[88px]` |
| Community like/comment icons | Small tap targets | Use `size="iconTouch"` variant |
| Filter pills | Too small in cramped layouts | Minimum `min-h-9 px-3` |

### Icon Button Standard

All icon-only buttons MUST use:
```tsx
<Button variant="iconHeader" size="iconTouch">
  <Icon />
</Button>
```

The `iconTouch` size variant enforces 44×44px minimum. Every icon button MUST also have an `aria-label`.

---

## Bottom Navigation

### Current Implementation

The `Navigation` component is mounted globally in `App.tsx` as `fixed bottom-0 z-50`. It renders on every page.

### F1 Fix: Content Overlap (CRITICAL)

**Problem:** The bottom nav covers ~60px of page content. Progress bars, donation amounts, CTAs, and card text are hidden behind it. On 320px screens, the coverage is proportionally even larger.

**Solution:**

1. All page content containers MUST include bottom padding to clear the nav:
   ```css
   pb-24  /* 96px — accounts for nav height + safe area */
   ```

2. The sticky donate CTA (`.sticky-donate`) already uses `pb-[env(safe-area-inset-bottom)]` — this pattern must be applied consistently.

3. Pages that should NOT show the nav (onboarding, sign-in, presentations) must either:
   - Conditionally hide the `Navigation` component, OR
   - Render without bottom padding

### Nav Behavior

| Context | Nav Visible | Notes |
|---------|-------------|-------|
| Home, Campaigns, Clinics, Partners | Yes | Global bottom nav |
| Community (shell) | No (global) / Yes (community nav) | Community has its own `CommunityBottomNav` |
| Case Detail, Clinic Detail, Campaign Detail | Yes | Global nav |
| Onboarding | No | Clean onboarding flow |
| Sign-in / Sign-up | No | Auth pages |
| Presentation / Partner Presentation | No | Investor/demo surfaces |
| Create Case / Create Adoption | Yes | Navigation available |

### FAB (Center Button)

The center "+" button creates new content. Per F13, it's currently ambiguous.

**Required disambiguation:**
- Context-aware label or icon
- On home: creates a case
- On community: creates a post
- Other pages: either hide or show a create menu

---

## Safe Area Insets

### Current State

**Inconsistently applied.** Only two locations use safe area insets:

1. `CommunityMobileShellLayout` header: `pt-[env(safe-area-inset-top)]`
2. `.sticky-donate` class: `pb-[env(safe-area-inset-bottom)]`

All other fixed/sticky elements (global `Navigation`, page headers) do NOT use safe area insets.

### Required Pattern

Every fixed or sticky element MUST account for safe area insets:

| Element | Required Inset |
|---------|---------------|
| Top sticky headers | `pt-[env(safe-area-inset-top)]` |
| Bottom fixed nav | `pb-[env(safe-area-inset-bottom)]` |
| Bottom sticky CTAs | `pb-[env(safe-area-inset-bottom)]` |
| Full-screen modals | Both top and bottom insets |

### Viewport Configuration

`index.html` should include:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

The `viewport-fit=cover` is required for safe area insets to work on iOS.

---

## iOS-Specific

### Input Zoom Prevention

**Rule (RULES.md):** All `<input>`, `<textarea>`, and `<select>` elements MUST use `text-base` (16px) font size. Font sizes below 16px trigger iOS auto-zoom on focus, which breaks the viewport.

### Status Bar

Current: No configuration. Target: Match app theme color.

```typescript
// capacitor.config.ts addition
plugins: {
  StatusBar: {
    style: 'DARK',     // or 'LIGHT' based on theme
    backgroundColor: '#000000'  // match --background token
  }
}
```

### Scroll Bounce

iOS Safari has default rubber-band scrolling. The `.scroll-touch` utility class enables momentum scrolling on scrollable containers:
```css
.scroll-touch {
  -webkit-overflow-scrolling: touch;
}
```

### Splash Screen

Currently none configured. Target: Branded splash with Pawtreon logo, teal primary background.

---

## Android-Specific

### Back Button Handling

Android hardware/gesture back button MUST navigate correctly within the app. Requires `@capacitor/app` plugin:

```typescript
import { App } from '@capacitor/app';

App.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    App.exitApp();
  }
});
```

### Notification Channels

Android requires notification channels for push notifications (API 26+). Create channels:
- `rescue_alerts` — Urgent rescue cases nearby (high priority)
- `donations` — Donation received/completed (default priority)
- `updates` — Case updates, campaign milestones (low priority)
- `system` — Account, security, admin (default priority)

### Status Bar

Android: Use `@capacitor/status-bar` to set color matching the app theme and handle translucent status bar overlap.

---

## PWA Considerations

### Current State

**No PWA support exists.** There is:
- No `manifest.json`
- No service worker
- No offline support

### Decision: Defer

PWA support is deferred. The primary distribution channels are:
1. **Web** — Direct browser access (primary for MVP)
2. **iOS/Android** — Capacitor native shells (for app store distribution)

PWA adds complexity (service worker caching, offline data sync with Convex) without significant user benefit during launch. Revisit after native apps are published.

---

## Audit Findings Registry

All mobile UX audit findings (F1–F13) with current status and ownership:

| ID | Finding | Severity | Spec Owner | Status |
|----|---------|----------|------------|--------|
| **F1** | Bottom nav overlaps content | CRITICAL | mobile-native-spec (this) | Open — needs `pb-24` on all pages |
| **F2** | i18n missing keys / language soup | CRITICAL | i18n-spec | Open — see i18n spec |
| **F3** | Content duplication (campaigns/community/partners) | CRITICAL | Feature specs (cases, campaigns, community) | Open — dedup queries |
| **F4** | Contradictory counts (0 partners / 0 threads) | HIGH | Feature specs (partners, community) | Open — fix count queries |
| **F5** | Clerk branding "paws" instead of "Pawtreon" | HIGH | onboarding-spec | Open — Clerk dashboard config |
| **F6** | Story/carousel text clipping | HIGH | ui-patterns-spec | Open — 2-line truncation or expand |
| **F7** | Clinic cards cramped at 320px | MEDIUM | ui-patterns-spec | Open — 1-column at ≤360px |
| **F8** | No pagination on long lists | MEDIUM | Feature specs (campaigns, partners, clinics) | Open — cursor-based pagination |
| **F9** | Tap targets below 44×44px | MEDIUM | mobile-native-spec (this) | Open — `iconTouch` variant |
| **F10** | Missing skeleton/loading states | MEDIUM | ui-patterns-spec | Open — shimmer skeleton pattern |
| **F11** | Filter pill overflow without indicator | LOW | ui-patterns-spec | Open — fade/scroll indicator |
| **F12** | Inconsistent typography/heading hierarchy | LOW | ui-patterns-spec | Open — enforce type scale |
| **F13** | Ambiguous FAB | LOW | mobile-native-spec (this) | Open — contextual label |

### Visual Audit Findings

| ID | Finding | Severity | Spec Owner | Status |
|----|---------|----------|------------|--------|
| **P0** | Presentation white-screen (invalid report query) | HIGH | Feature spec (cases) | Open — guard `ReportedBadge` |
| **P1** | CORS failures from `ipapi.co/json/` | MEDIUM | i18n-spec | Open — see i18n spec |
| **P2** | Home feed density too high on first fold | LOW | ui-patterns-spec | Open — reduce initial cards |

---

## Remediation Plan

### Phase 0: Emergency Fixes (0.5 day)

| Task | Finding | Effort |
|------|---------|--------|
| Add `pb-24` to all page containers | F1 | S |
| Fix Clerk app name to "Pawtreon" | F5 | XS |
| Fix partner/community count queries | F4 | S |

### Phase 1: Data Integrity (1.5 days)

| Task | Finding | Effort |
|------|---------|--------|
| Deduplicate campaigns featured vs. all | F3 | M |
| Fix community thread deduplication | F3 | M |
| Fix partner list deduplication | F3 | S |

### Phase 2: i18n Remediation (2 days)

See [i18n-spec.md](i18n-spec.md) for full plan.

### Phase 3: Mobile Layout (2.5 days)

| Task | Finding | Effort |
|------|---------|--------|
| Stories strip: 2-line truncation or expand | F6 | M |
| Case carousel: prevent mid-word clipping | F6 | M |
| Clinics: 1-column grid at ≤360px | F7 | S |
| Header icon cluster: 44×44 spacing | F9 | M |
| Campaign CTA: min width + height | F9 | S |
| Community icons: 44×44 touch targets | F9 | S |
| Filter rails: scroll indicator | F11 | S |
| FAB: contextual label | F13 | S |

### Phase 4: Polish (2.5 days)

| Task | Finding | Effort |
|------|---------|--------|
| Skeleton loading for case feed | F10 | M |
| Skeleton loading for campaign cards | F10 | M |
| Skeleton loading for clinic/partner lists | F10 | S |
| Image placeholder/fallback | F10 | S |
| Cursor-based pagination for campaigns | F8 | L |
| Pagination for partners | F8 | M |
| Heading hierarchy normalization | F12 | M |

**Total estimated effort:** ~9 working days across all phases.

---

## Regression Testing

### Required Viewports

Playwright visual snapshots at these viewports after each remediation phase:

| Viewport | Device | Priority |
|----------|--------|----------|
| 320×568 | iPhone SE | P0 — stress test |
| 375×812 | iPhone 12 | P0 — primary |
| 390×844 | iPhone 14 | P0 — current target |
| 1440×900 | Desktop | P1 — secondary |

### Required Pages

Screenshot regression on every release:
- `/` (home)
- `/campaigns`
- `/clinics`
- `/partners`
- `/community`
- `/sign-in`
- `/case/:id` (any case detail)

### Acceptance Criteria

- At 375×812 and 320×568: bottom nav NEVER overlaps content
- At 320×568: all text readable, no mid-word clipping on visible cards
- All interactive elements meet 44×44px minimum touch target
- Skeleton loading states appear during data fetch on all feed surfaces
- No gray placeholder circles persist beyond 2 seconds

---

## Non-Functional Requirements

- **Performance:** Initial page render must complete within 3 seconds on 3G (Lighthouse mobile simulation).
- **Bundle size:** Capacitor plugins are tree-shaken — only imported plugins are included.
- **Offline:** No offline support in MVP (Convex is online-first). Future: offline queue for case creation.
- **Accessibility:** Touch targets ≥44×44px, focus rings on all interactive elements, screen reader labels on icon-only buttons.

---

## Open Questions

1. **Shared `PageLayout` wrapper:** Should we create a component that standardizes `px-4 pb-24 max-w-3xl mx-auto pt-[env(safe-area-inset-top)]` across all pages?
2. **Navigation visibility:** Should the global `Navigation` component conditionally hide on routes that have their own nav (community) or don't need nav (onboarding, auth, presentations)?
3. **Capacitor plugin implementation timing:** Install all P0 plugins now, or defer until native app store submission?
4. **Visual regression CI:** Set up Playwright visual comparisons in CI, or rely on manual screenshot review?
5. **webDir for mobile:** Does `dist` output need any Capacitor-specific configuration (e.g., no hash-based routing)?
