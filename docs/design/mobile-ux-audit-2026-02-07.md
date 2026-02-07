# Mobile UX Audit & Refactor Plan

> **Purpose:** Comprehensive audit findings + phased remediation plan for mobile UI/UX issues found via Playwright live testing.  
> **Viewport tested:** 375x812 (iPhone 12), 320x568 (iPhone SE / ultra-thin)  
> **Audit date:** 2026-02-07  
> **Owner:** Frontend  
> **Status:** Planning

---

## Table of Contents

1. [Audit Findings](#audit-findings)
2. [Severity Scoring](#severity-scoring)
3. [Refactor Plan — Phases](#refactor-plan--phases)
4. [Task Breakdown](#task-breakdown)
5. [Acceptance Criteria](#acceptance-criteria)
6. [Risks & Mitigations](#risks--mitigations)

---

## Audit Findings

### F1. Bottom Nav Overlaps Content (CRITICAL)

**Where:** All pages, most visible on Home (`/`) feed  
**What:** The `Navigation.tsx` bottom bar is `fixed bottom-0 z-50` but no corresponding `pb-[nav-height]` spacer exists on the page content containers. The nav literally covers the bottom ~60px of content — progress bars, donation amounts, CTA buttons, and card text are hidden behind it. On 320px, the nav covers even more relative screen area.  
**Impact:** Users can't see or tap content under the nav. On case cards, the "Help Now" CTA and donation progress can be completely obscured.  
**File:** `src/components/Navigation.tsx:137`, all page layouts.

### F2. i18n Missing Keys — Language Soup (CRITICAL)

**Where:** Every page  
**What:** Console floods with 60+ `i18next::translator: missingKey` warnings per page load. The UI renders a chaotic mix:
- Nav labels: Bulgarian (Начало, Кампании, Клиники, Партньори)
- Section headers: English ("Urgent Updates", "Cases Needing Help", "Featured Rescue Campaigns")
- Filter pills: Mixed ("Urgent" + "Near Me" in EN, "София" in BG)
- CTAs: Bulgarian ("Допринеси", "Подкрепи") on English cards
- Campaign/case content: All English (seed data)
- Stats labels: Bulgarian ("Събрани", "Цел") inside English cards

**Impact:** No user gets a coherent language experience. Trust-destroying for a donations platform.  
**Files:** `public/locales/bg/translation.json`, all component files using hardcoded strings.

### F3. Massive Content Duplication (CRITICAL)

**Where:** Campaigns (`/campaigns`), Community (`/community`), Partners (`/partners`)  
**What:**
- **Campaigns:** "Featured Rescue Campaigns (8)" shows identical cards that repeat in "Всички кампании (12)" below. Same Mass Vaccination Drive, Spay & Neuter Program, Emergency Medical Fund, Winter Shelter Fund cards appear 2-3x each. Page is 30+ screens long.
- **Community:** Every thread is rendered twice — "Luna found her forever home" x2, "Volunteer of the Month" x2, "Upcoming Adoption Event" x2, etc.
- **Partners:** VetCare Network x2, PetFood Bulgaria x2, Animal Rescue Sofia x2, Mountain Rescue Dogs x2.

**Impact:** User scrolls through repetitive content, assumes the app is broken or data is fake. Massively inflates scroll depth.  
**Files:** `convex/campaigns.ts` (featured vs list query overlap), `convex/community.ts:listThreads`, `convex/partners.ts`, page components.

### F4. Contradictory Counts / Broken Stats (HIGH)

**Where:** Partners, Community  
**What:**
- Partners page stats: **"0 Партньори"** displayed, but 16 partners listed below, plus "66,900+ Помогнати животни" and "€502,001 Дарени EUR".
- Community header: **"0 threads"** label, but 12+ threads rendered below.

**Impact:** Instant credibility loss. A donations platform showing "$502K donated" next to "0 partners" looks like a scam.  
**Files:** Partners page stats aggregation, Community thread count logic.

### F5. Sign-in Branding Mismatch (HIGH)

**Where:** `/sign-in` (Clerk)  
**What:** Clerk modal says **"Sign in to paws"** instead of **"Pawtreon"**.  
**Impact:** Looks unfinished. Users may think they're on the wrong site.  
**Fix:** Update Clerk dashboard application name.

### F6. Horizontal Scroll Text Clipping (HIGH)

**Where:** Home urgent stories strip, case card carousel  
**What:** Story bubbles truncate to "Max - Крит...", "Куче след...", "Намер...". Case cards in horizontal scroll: "Charlie - Recov" cut mid-word. No tooltip, expand, or second line.  
**Impact:** Users can't tell cases apart. The urgency strip — the highest-value UI real estate — is unreadable.  
**Files:** Stories strip component, case card carousel.

### F7. Clinic Card Cramping at 320px (MEDIUM)

**Where:** `/clinics`  
**What:** 2-column grid cramps names to "Vet Clinic Sofia...", "PetMed 24/7 Em...", "Happy Tails Vet...", "Exotic Pets Care...". Ratings, distance, and 24/7 badges fight for ~150px width. At 320px, essentially unreadable.  
**Impact:** Users can't compare clinics. Defeats purpose of the directory.  
**Files:** Clinics page grid/card component.

### F8. No Pagination / Infinite Scroll (MEDIUM)

**Where:** `/campaigns`, `/partners`, `/clinics`  
**What:** All items are loaded and rendered at once. Campaigns page is 30+ screen scrolls. Zero "load more", no cursor-based pagination, no virtualization.  
**Impact:** Poor performance on low-end devices. Overwhelming UX. Users abandon before reaching bottom.  
**Files:** Campaign/partner/clinic list queries and page components.

### F9. Tap Targets Too Small (MEDIUM)

**Where:** All pages — header icon cluster, campaign CTAs, community interaction icons  
**What:** Top-right icon cluster (search + notifications + account) = 3 icons in ~100px. Campaign "Допринеси" buttons are narrow. Community like/comment icons are tiny.  
**Spec violation:** RULES.md mandates 44x44px minimum. `ui-patterns-spec.md` defines this explicitly.  
**Files:** Header components, CTA buttons, community interaction icons.

### F10. Missing Loading / Skeleton States (MEDIUM)

**Where:** Home feed, campaign images, community  
**What:** Several images render as persistent gray circles that never resolve. No skeleton animation, no placeholder text, no shimmer. Page feels broken during load.  
**Files:** Image components, feed card components.

### F11. Filter Pill Overflow Without Indicator (LOW)

**Where:** `/clinics`, `/partners`  
**What:** City/category filter pills overflow horizontally with no scroll indicator (fade, arrow, or dots). Users don't know there are more options.  
**Files:** Filter rail components.

### F12. Inconsistent Typography / Heading Hierarchy (LOW)

**Where:** All pages  
**What:** "Urgent Updates" rendered as `<p>`, "Cases Needing Help" as `<h2>`. Campaign section headers vary in weight/size randomly. No consistent type scale applied.  
**Spec violation:** DESIGN.md defines explicit type scale (page title `text-lg font-semibold`, card title `text-[15px] font-semibold`).  
**Files:** All page components.

### F13. Ambiguous FAB (LOW)

**Where:** Bottom nav center button  
**What:** The "+" floating action button has no label or context. Create a case? Write a post? Add a clinic? Unclear.  
**Files:** `src/components/Navigation.tsx`.

---

## Severity Scoring

| ID | Finding | Severity | Effort | Priority |
|----|---------|----------|--------|----------|
| F1 | Bottom nav overlaps content | CRITICAL | S | P0 |
| F2 | i18n missing keys / language mix | CRITICAL | L | P0 |
| F3 | Content duplication (campaigns/community/partners) | CRITICAL | M | P0 |
| F4 | Contradictory counts (0 partners / 0 threads) | HIGH | S | P1 |
| F5 | Clerk branding "paws" | HIGH | XS | P1 |
| F6 | Story/carousel text clipping | HIGH | M | P1 |
| F7 | Clinic card cramping at 320px | MEDIUM | M | P2 |
| F8 | No pagination / infinite lists | MEDIUM | L | P2 |
| F9 | Tap targets below 44x44 | MEDIUM | M | P2 |
| F10 | Missing skeleton/loading states | MEDIUM | M | P2 |
| F11 | Filter pill overflow indicator | LOW | S | P3 |
| F12 | Typography / heading hierarchy | LOW | M | P3 |
| F13 | Ambiguous FAB | LOW | S | P3 |

**Effort key:** XS = <30min, S = <2hr, M = half-day, L = 1-2 days

---

## Refactor Plan — Phases

### Phase 0: Emergency Fixes (1 day)
> Fix the things that make the app look broken or untrustworthy.

| Task | Finding | Est. |
|------|---------|------|
| Add page-level bottom padding for nav clearance | F1 | S |
| Fix Clerk application name to "Pawtreon" | F5 | XS |
| Fix partner count query (return actual count, not 0) | F4 | S |
| Fix community thread count display | F4 | S |

**Gate:** Verified at 375px and 320px — nav does not overlap any content, counts match reality.

---

### Phase 1: Data Integrity & Deduplication (1-2 days)
> Eliminate duplicate content and broken data contracts.

| Task | Finding | Est. |
|------|---------|------|
| Campaigns: Deduplicate featured vs all-campaigns sections | F3 | M |
| Community: Fix thread deduplication in `listThreads` query | F3 | M |
| Partners: Fix partner deduplication in list query | F3 | S |
| Audit all list queries for duplicate ID emission | F3 | S |

**Approach options:**
- **Option A (Exclude):** `listAll` query filters out IDs already in `featured` result. Frontend passes featured IDs to exclude.
- **Option B (Merge):** Single query returns `{ featured: [...], rest: [...] }` with no overlap. (Preferred — single round-trip)
- **Option C (Frontend dedup):** Page component deduplicates by `_id` before rendering. (Quick fix, not ideal long-term.)

**Gate:** No content card appears more than once on any page. Screenshot regression at 375px.

---

### Phase 2: i18n Remediation (1-2 days)
> Achieve coherent single-language experience on all screens.

| Task | Finding | Est. |
|------|---------|------|
| Audit all hardcoded English strings in components | F2 | M |
| Add missing BG translation keys for all surfaces | F2 | L |
| Add missing EN translation keys for all surfaces | F2 | M |
| Replace hardcoded strings with `t()` calls | F2 | L |
| Add i18n key coverage CI check (warn on missing keys) | F2 | M |

**Scope priority order:**
1. Home page strings (section headers, filters, CTAs)
2. Campaign page strings (section headers, status labels)
3. Community page strings (thread labels, action labels)
4. Clinics page strings (filter labels, section headers)
5. Partners page strings (filter labels, stats labels)

**Gate:** Zero `missingKey` console warnings on Home, Campaigns, Community, Clinics, Partners. UI renders coherent single-language at BG and EN.

---

### Phase 3: Mobile Layout & Responsiveness (2-3 days)
> Fix the things that break at 320px and make the app feel cramped.

| Task | Finding | Est. |
|------|---------|------|
| Stories strip: 2-line truncation or expand-on-tap for names | F6 | M |
| Case carousel: Ensure card text doesn't clip mid-word | F6 | M |
| Clinics: Switch to 1-column grid at ≤360px | F7 | S |
| Clinics: Ensure name + rating + distance don't overlap | F7 | M |
| Header icon cluster: Enforce 44x44 tap targets with proper spacing | F9 | M |
| Campaign CTA buttons: Minimum width + height enforcement | F9 | S |
| Community interaction icons: 44x44 touch targets | F9 | S |
| Filter rails: Add horizontal fade/scroll indicator | F11 | S |
| Bottom nav FAB: Add contextual label (tooltip or subtitle) | F13 | S |

**Gate:** At 320x568 — no text clipping, no overlapping elements, all tap targets ≥44x44. Screenshot regression.

---

### Phase 4: Polish & Performance (2-3 days)
> Skeleton states, pagination, typography consistency.

| Task | Finding | Est. |
|------|---------|------|
| Add skeleton loading cards for case feed | F10 | M |
| Add skeleton loading for campaign cards | F10 | M |
| Add skeleton loading for clinic/partner lists | F10 | S |
| Add image placeholder/fallback for broken images | F10 | S |
| Campaigns: Add cursor-based pagination or "load more" | F8 | L |
| Partners: Add pagination or "load more" | F8 | M |
| Clinics: Add pagination (already partially done with view modes) | F8 | M |
| Normalize heading hierarchy across all pages | F12 | M |
| Apply consistent type scale per DESIGN.md spec | F12 | M |

**Gate:** No gray placeholder orbs persist >2s. Pages load max 10-20 items initially with clear "load more" affordance. `pnpm build` passes. Heading hierarchy validates semantically (h1→h2→h3 order).

---

## Task Breakdown

### Summary Gantt

```
Phase 0 (Emergency)     ████░░░░░░░░░░░░░░░░  Day 1
Phase 1 (Dedup)         ░░░░████████░░░░░░░░  Days 2-3
Phase 2 (i18n)          ░░░░░░░░████████░░░░  Days 3-5
Phase 3 (Layout)        ░░░░░░░░░░░░████████  Days 5-7
Phase 4 (Polish)        ░░░░░░░░░░░░░░░░████  Days 8-10
```

Phases 2 and 3 can partially overlap (different surface areas).

### Total Estimated Effort

| Phase | Estimate |
|-------|----------|
| Phase 0 | 0.5 day |
| Phase 1 | 1.5 days |
| Phase 2 | 2 days |
| Phase 3 | 2.5 days |
| Phase 4 | 2.5 days |
| **Total** | **~9 working days** |

---

## Acceptance Criteria

### Per-Phase Gates (defined above in each phase)

### Overall Done Criteria

- [ ] At 375x812 and 320x568: bottom nav never overlaps page content
- [ ] At 375x812 and 320x568: all text is readable, no mid-word clipping on visible cards
- [ ] Zero `i18next::translator: missingKey` warnings on all 5 core pages (Home, Campaigns, Community, Clinics, Partners)
- [ ] No content card appears more than once on the same page
- [ ] All displayed counts match actual rendered item counts
- [ ] All interactive elements meet 44x44px minimum touch target
- [ ] Skeleton loading states appear during data fetch on all feed surfaces
- [ ] Campaign + Partner lists use pagination or "load more" (max initial render ≤20 items)
- [ ] Type scale follows DESIGN.md spec consistently
- [ ] Clerk sign-in says "Pawtreon", not "paws"
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm styles:gate` passes for scoped surfaces

### Regression Testing

Playwright snapshots at these viewports after each phase:
- 320x568 (iPhone SE)
- 375x812 (iPhone 12)
- 390x844 (iPhone 14)
- 1440x900 (desktop)

Pages to screenshot: `/`, `/campaigns`, `/clinics`, `/partners`, `/community`, `/sign-in`

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| i18n key audit takes longer than estimated (large surface area) | High | Medium | Prioritize 5 core pages only. Marketing/presentation pages can follow. |
| Dedup fix in Convex queries changes feed ordering behavior | Medium | Medium | Always return deterministic sort. Test with seed data. |
| Pagination changes break existing bookmark/deep-link patterns | Low | Low | Use cursor-based pagination that doesn't shift item order. |
| 320px layout changes break desktop layout | Medium | Medium | Mobile-first media queries only. Desktop inherits wider layout. |
| Skeleton states add bundle size | Low | Low | Use CSS-only shimmer animation, not JS animation libraries. |

---

## Relationship to Existing Work

This plan extends and accelerates the following in-progress TASKS.md items:

- **STYLING: Tailwind/shadcn remediation** — Phase 3 + Phase 4 align with the remaining remediation batch for create-case and directory surfaces.
- **HOME: Case-first landing refactor** — Phase 0 (nav clearance) and Phase 3 (stories strip fix) directly serve the case-first home mission.
- **Existing `docs/design/tailwind-shadcn-remediation-plan.md`** — This audit supersedes the "Priority Migration Queue" with concrete findings and phased tasks.

This plan does NOT touch:
- Backend schema changes
- Payment/donation flows
- Admin moderation queue
- Capacitor native build
