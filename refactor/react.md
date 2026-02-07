# Task 5: React + Router Cleanup

> **Goal:** Audit React component architecture, routing setup, provider nesting, hooks, and page organization. Remove dead code, consolidate patterns, align with React 19 + React Router v7.

---

## Your Process

1. **Read React Router v7 docs** — understand the latest patterns for route configuration, lazy loading, and layout routes.
2. **Audit `App.tsx`** — it's 212 lines with ~50 imports and flat route definitions.
3. **Audit each page** — check for dead pages, stub pages, or pages that are just wrappers.
4. **Audit hooks** — check usage of each custom hook.
5. **Verify** — `pnpm build` must pass.

---

## Files to Audit

### `src/main.tsx`

Current setup: `ClerkProvider` > `ConvexProviderWithClerk` > `App`

**Check:**
1. The conditional Convex initialization (`convex = convexUrl ? ... : null`) — is this still needed? If Convex is always required in production, simplify and just throw if missing.
2. The console.warn for missing Convex — is this a dead code path? If the app doesn't work without Convex, make it a hard error.
3. Font imports — 5 Nunito weight imports. Verify all 5 weights (400, 500, 600, 700, 800) are actually used in the CSS/Tailwind config. Remove unused weights.
4. Import order — `./i18n` should come before component imports.

### `src/App.tsx` (212 lines)

**Issues to investigate:**

1. **Massive flat import block** — 50+ page imports at the top. Consider if React Router v7's lazy route pattern or route-based code splitting would help. At minimum, check if any imported page is not actually used in a `<Route>`.

2. **Dead routes** — check every `<Route>` definition. If a page is essentially a placeholder or empty, remove it.

3. **Provider nesting** — currently: `QueryClientProvider` > `TooltipProvider` > `Toaster(s)` > `BrowserRouter` > `Routes`.
   - Is `QueryClientProvider` (@tanstack/react-query) actually used? Convex has its own reactivity. Search for `useQuery` from tanstack — if nothing uses it, remove the provider AND the dependency.
   - Two toasters: `<Toaster />` (from `ui/toaster`) and `<Sonner />` (from `ui/sonner`). Does the app use both toast systems? Pick one and remove the other.

4. **`ScrollToTop`** — verify this is needed and works correctly with React Router v7.

5. **`OnboardingRedirect`** — this wraps the entire route tree. Verify it doesn't cause unnecessary re-renders.

6. **`LanguageDetectionBanner`** — verify it's used and functional.

7. **`ProductTour`** — check if the product tour is functional or just scaffolding. If it's scaffolding with no real tour steps, remove it.

### Page Files to Audit

Check each page in `src/pages/` for:
- Is it imported in `App.tsx`?
- Does it render real content or is it a stub?
- Are pages `Presentation.tsx` and `PartnerPresentation.tsx` demo/pitch pages? If so, are they still needed?

Pages to investigate:
- `Presentation.tsx` / `PartnerPresentation.tsx` — investor pitch pages
- `Messages.tsx` — is messaging implemented or stubbed?
- `VolunteerProfile.tsx` — is this implemented?
- `CreateCaseAi.tsx` — is AI case creation implemented or just a shell?
- `CreateAdoption.tsx` — is this a real flow?
- `CommunityActivity.tsx` / `CommunityMembers.tsx` — real or stubs?

### Custom Hooks (`src/hooks/`)

Current hooks:
- `use-mobile.tsx` — check if used, verify implementation
- `use-toast.ts` — may be a duplicate (see shadcn task)
- `useForumBackendMode.ts` — check if this is used or a dead feature flag
- `useOnboardingRedirect.tsx` — check if functional
- `useProductTour.ts` — check if functional or scaffolding

For each: search for imports across the codebase. If zero usage, delete.

### Component Organization

Review the top-level `src/components/` structure:
```
auth/, community/, donations/, homepage/, profile/, search/, skeletons/, tour/, trust/, ui/
```

Plus loose files:
```
CampaignCard.tsx, CaseCard.tsx, ClinicCard.tsx, CommunityBottomNav.tsx,
EmergencyBanner.tsx, FeaturedClinicCard.tsx, FilterPills.tsx,
FloatingActionButton.tsx, ImageGallery.tsx, LanguageDetectionBanner.tsx,
MobilePageHeader.tsx, Navigation.tsx, NavLink.tsx, PageHeader.tsx,
PartnerCard.tsx, ProgressBar.tsx, ScrollToTop.tsx, ShareButton.tsx,
StatusBadge.tsx, UpdatesTimeline.tsx
```

**Check:**
- Are there components that should be grouped into subfolders?
- Are there loose components that are only used by a single page? Those could live closer to the page.
- Don't reorganize the whole thing — just flag dead components and delete them.

---

## Verification

```bash
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

---

## Commit
```
refactor: clean React routing, remove dead pages/hooks, consolidate providers
```
