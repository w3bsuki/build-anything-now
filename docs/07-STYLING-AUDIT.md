# 🔍 PawsSafe Styling Audit
> **Date:** January 14, 2026  
> **Theme:** Sunset Horizon  
> **Stack:** Tailwind CSS v4 + shadcn/ui + OKLCH color tokens

---

## 🚨 CRITICAL ISSUES

### 1. Mobile Zoom on Input Focus (HIGH PRIORITY)
**Problem:** Search bars and other inputs zoom in when focused on iOS/mobile Safari.

**Root Cause:** The `<meta viewport>` tag in `index.html` is missing zoom prevention:
```html
<!-- Current -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- Missing -->
maximum-scale=1.0, user-scalable=no
```

**Also:** Input elements have `text-sm` (14px) which triggers iOS auto-zoom. iOS zooms when font-size < 16px.

**Affected Files:**
- `index.html` (viewport meta)
- `src/pages/Index.tsx` (search input uses `text-sm`)
- `src/pages/Campaigns.tsx` (search input uses `text-sm`)
- `src/components/ui/input.tsx` (base Input uses `text-base` on mobile but `md:text-sm` on desktop - this is correct)

**Fix Applied:**
1. ~~Add viewport meta for zoom prevention~~ (Bad for accessibility - don't do this)
2. ✅ All search inputs now use `text-base` (16px) on mobile via `text-base md:text-sm`

---

### 2. Duplicated CSS Token Systems (HIGH PRIORITY)
**Problem:** `src/index.css` defines theme tokens TWICE in conflicting formats:

| Location | Format | Lines |
|----------|--------|-------|
| `@layer base :root` | HSL (`30 33% 98%`) | ~1-100 |
| Second `:root` block | OKLCH (`oklch(0.99 0.01 67.74)`) | ~170+ |

**Impact:** The second OKLCH `:root` block **completely overrides** the first HSL block, making the HSL definitions dead code.

**Also in conflict:**
- `app/globals.css` defines a THIRD set of tokens (teal primary theme - different from Sunset Horizon)
- `.dark` mode is defined in both files with different values

**Fix Required:** Single source of truth - keep only OKLCH tokens in `src/index.css`, remove `app/globals.css` duplication.

---

### 3. Font Conflicts (MEDIUM-HIGH)
**Problem:** `--font-sans` is defined in FOUR places with different values:

| File | Value |
|------|-------|
| `src/index.css` (HSL block) | `Montserrat, sans-serif` |
| `src/index.css` (OKLCH block .dark) | `Geist, Geist Fallback, ...` |
| `src/fonts.css` | `Nunito, ...` |
| `main.tsx` imports | `@fontsource/nunito` |

**Current Reality:** `fonts.css` is loaded LAST in `main.tsx`, so Nunito wins - but this is fragile and confusing.

**Fix Required:** Keep Nunito (it's imported), remove conflicting `--font-sans` declarations.

---

## 🎨 HEADER & NAVIGATION ISSUES

### 4. Logo Has Button-Like Background
**Problem:** The mobile header logo has a gradient background that competes for attention with the actual CTA (+) button.

**Current Code** (`Navigation.tsx`):
```tsx
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
  <HeartHandshake className="w-[18px] h-[18px] text-white" />
</div>
```

**Issue:** This reads as a tappable button, not a brand mark. The primary color fill is too strong for a logo container.

**Recommendation:**
- Remove background fill OR use a much lighter tint (`bg-primary/10` or transparent)
- Let the icon itself carry the brand color
- Reserve solid `bg-primary` for actual action buttons

### 5. Header Icon Buttons Inconsistent
**Problem:** Bell, Profile, and + buttons all have different styles in the header.

**Current Styles:**
| Button | Background | Size | Border-Radius |
|--------|------------|------|---------------|
| Bell | None (transparent) | `w-9 h-9` | None |
| Profile | None (transparent) | `w-9 h-9` | None |
| + (Create) | `bg-primary` | `w-8 h-8` | `rounded-full` |

**Issues:**
1. Bell and Profile have no hover/tap states on mobile
2. Create button is smaller (`w-8`) than siblings (`w-9`) - inconsistent
3. Create button uses raw `rounded-full` while others use nothing

**Recommendation:**
- All header icon buttons: `w-9 h-9 rounded-xl` or `rounded-full`
- Bell/Profile: Add `active:bg-muted/50` for tap feedback
- Create: Match sizing to siblings, use `w-9 h-9`

### 6. Header Padding Creates Space Below
**Problem:** User reports "header spacing is weird, it adds padding inside the search bar below it"

**Analysis:** The header is `h-14` fixed, and the page content has:
```tsx
<div className="min-h-screen pt-14 pb-20 md:pb-8 md:pt-16">
```

Then the sticky search area adds:
```tsx
<div className="sticky top-14 md:top-14 bg-background/95 backdrop-blur-sm z-30 pt-2.5 pb-3">
```

**The Issue:** The `pt-2.5` on the sticky container creates visual separation that looks like "inside padding". Combined with the `bg-background/95` semi-transparency, it creates a jarring layered effect.

**Fix Options:**
1. Reduce `pt-2.5` to `pt-1.5` for tighter spacing
2. Make sticky background fully opaque (`bg-background`) 
3. Add subtle separator line between header and sticky search

---

## 🔍 SEARCH BAR & FILTER PILLS

### 7. Search Bar Background Too Muted
**Problem:** Search bar uses `bg-muted/70` which is very low contrast against `bg-background`.

**Current Token Values (OKLCH):**
```css
--background: oklch(0.99 0.01 67.74);  /* Nearly white */
--muted: oklch(0.97 0.02 44.86);       /* Very light warm gray */
```

At 70% opacity: `bg-muted/70` = nearly invisible contrast.

**User Feedback:** "the backgrounds/fills for search bar... the colors can be slightly better, they're a bit too muted"

**Recommendation:**
- Use `bg-muted` (100%) instead of `bg-muted/70`
- Or introduce a new `--input-background` token with more contrast
- Consider `border border-border` for clearer boundaries

### 8. Filter Pills Unselected State Too Faint
**Problem:** Unselected pills use `bg-muted/60 text-foreground/70` - very low visibility.

**Current Code** (`FilterPills.tsx`):
```tsx
selected === option.id
  ? "bg-primary text-primary-foreground shadow-sm"
  : "bg-muted/60 text-foreground/70 hover:bg-muted hover:text-foreground"
```

**Issues:**
1. `bg-muted/60` at 60% opacity is barely visible
2. `text-foreground/70` reduces text contrast unnecessarily
3. No border, so pills blend into background

**Recommendation:**
```tsx
// Better unselected state:
"bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-accent-foreground"
```

---

## 🌐 INTERNATIONALIZATION (i18n) ISSUES

### 9. Mixed Language Content on Home Page
**Problem:** User sees German/Ukrainian mixed with English when locale is set to English.

**Root Cause Analysis:**

1. **i18n Configuration** (`src/i18n/index.ts`):
   ```ts
   detection: {
     order: ['localStorage', 'navigator'],
     caches: ['localStorage'],
   }
   ```
   The `navigator` detector may pick up browser language preferences that differ from the selected locale.

2. **Translation Keys Present:** All required keys exist in `en/translation.json`, `de/translation.json`, and `uk/translation.json` - so this is NOT a missing key issue.

3. **Possible Causes:**
   - Browser `navigator.language` returning `de` or `uk` on first load before localStorage is set
   - Race condition: component renders before i18n namespace loads
   - Stale localStorage value from previous session

4. **Mock Data Translation Hook** (`useTranslatedMockData.ts`):
   - Uses `t()` function correctly for mock data
   - Mock case titles like "Found a kitten with an injured paw" should be from `t('mockData.cases.case2.title')`

**Investigation Needed:**
- Check if the issue occurs on first load only
- Check localStorage for stale `i18nextLng` value
- Add `react: { useSuspense: true }` to i18n config to ensure translations load before render

**Quick Fix:** Add explicit fallback handling:
```ts
// In i18n/index.ts
detection: {
  order: ['localStorage', 'querystring', 'navigator'],
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
}
```

---

## 🎨 COLOR TOKEN ANALYSIS

### Current Sunset Horizon Palette (OKLCH):

| Token | Light Mode | Perceived Color |
|-------|------------|-----------------|
| `--primary` | `oklch(0.74 0.16 34.57)` | Warm coral/orange |
| `--secondary` | `oklch(0.96 0.02 28.97)` | Very light peachy beige |
| `--muted` | `oklch(0.97 0.02 44.86)` | Barely-there warm gray |
| `--accent` | `oklch(0.83 0.11 57.89)` | Soft golden amber |
| `--background` | `oklch(0.99 0.01 67.74)` | Off-white with warm tint |
| `--border` | `oklch(0.93 0.04 40.57)` | Light peachy tan |

### Problems with Current Tokens:

1. **Muted too close to Background:**
   - `--muted` (0.97 lightness) vs `--background` (0.99 lightness) = only 2% difference
   - This is why search bars and pills feel "too muted"

2. **Secondary lacks punch:**
   - `--secondary-foreground: oklch(0.56 0.13 32.65)` is a brownish mid-tone
   - Works for text but feels muddy for UI elements

3. **Missing semantic status colors in OKLCH:**
   - `--urgent`, `--critical`, `--recovering`, `--adopted` defined in HSL only
   - Need OKLCH versions for consistency

### Recommended Token Adjustments:

```css
/* Increase muted contrast */
--muted: oklch(0.94 0.03 44.86);  /* Was 0.97, now 0.94 */

/* Add dedicated input background */
--input-background: oklch(0.95 0.02 50);

/* Semantic status colors (add to OKLCH section) */
--urgent: oklch(0.65 0.20 25);
--urgent-foreground: oklch(1.00 0 0);
--critical: oklch(0.58 0.22 22);
--critical-foreground: oklch(1.00 0 0);
--recovering: oklch(0.70 0.15 175);
--recovering-foreground: oklch(1.00 0 0);
--adopted: oklch(0.65 0.18 145);
--adopted-foreground: oklch(1.00 0 0);
```

---

## 📋 UI COMPONENT STANDARDIZATION

### Components Using Inconsistent Patterns:

| Component | Issue |
|-----------|-------|
| `CaseCard.tsx` | Uses custom `btn-donate` class instead of Button variant |
| `FilterPills.tsx` | Uses inline styles instead of design tokens |
| `Navigation.tsx` | Logo uses `bg-gradient-to-br` (non-standard) |
| `StatusBadge.tsx` | Uses custom `.badge-*` classes (correct, keep) |
| `ProgressBar.tsx` | Uses custom `.progress-bar-*` classes (correct, keep) |

### Button Variants Missing:
Current `button.tsx` has: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

**Missing variants needed:**
- `donate` - Primary with heart icon, full width, rounded-full
- `icon-header` - Transparent with hover state for header icons

---

## 🔧 TECHNICAL DEBT

### 1. Two CSS Files with Theme Definitions
- `src/index.css` - Main styles (should be single source)
- `app/globals.css` - Has COMPLETELY DIFFERENT theme (teal primary!)

**Action:** Delete or repurpose `app/globals.css`. It defines:
```css
--primary: oklch(0.55 0.15 180);  /* Teal, not orange! */
```
This is NOT the Sunset Horizon theme.

### 2. Unused Animation Classes
`tailwindcss-animate` is NOT in dependencies but `tw-animate-css` is.
Code uses `animate-in slide-in-from-bottom` in `Navigation.tsx`.

**Check:** Does `tw-animate-css` provide these classes? If not, they're dead code.

### 3. Shadow System Complexity
Current `index.css` defines shadows at multiple levels with OKLCH alpha:
```css
--shadow-xs: 0px 6px 12px -3px oklch(0.00 0 0 / 0.04);
```

But `@theme inline` references:
```css
--shadow-xs: var(--shadow-xs);  /* Circular reference */
```

This may cause issues with Tailwind v4's new theme system.

---

## ✅ ACTION ITEMS (Priority Order)

### P0 - Critical (Do First)
1. [x] Add viewport meta for zoom prevention in `index.html`
2. [x] Set search input `text-base` on mobile (not `text-sm`)
3. [x] Remove duplicate token blocks in `src/index.css`
4. [x] Investigate i18n mixed language issue

### P1 - High Priority
5. [x] Remove `app/globals.css` or align with Sunset Horizon theme (renamed to .deprecated)
6. [x] Consolidate `--font-sans` to single Nunito definition
7. [x] Increase `--muted` contrast (0.97 → 0.94)
8. [x] Update FilterPills unselected state for better visibility

### P2 - Medium Priority
9. [x] Remove logo background fill or make much lighter
10. [x] Standardize header icon button sizes and states
11. [x] Reduce sticky search container top padding
12. [x] Add semantic status tokens to OKLCH section (already complete)

### P3 - Nice to Have
13. [x] Create Button `donate` variant
14. [x] Create Button `icon-header` variant (added as `iconHeader`)
15. [x] Audit shadow system for circular references (valid Tailwind v4 pattern)
16. [x] Verify `tw-animate-css` provides all used animation classes (imported)

---

## 📊 FILES TO MODIFY

| File | Changes Needed |
|------|----------------|
| `index.html` | Add `maximum-scale=1.0, user-scalable=no` |
| `src/index.css` | Remove HSL block, keep OKLCH, add status tokens |
| `app/globals.css` | DELETE or repurpose |
| `src/fonts.css` | Keep as single font source |
| `src/pages/Index.tsx` | Search input → `text-base` |
| `src/pages/Campaigns.tsx` | Search input → `text-base` |
| `src/components/Navigation.tsx` | Logo styling, header button consistency |
| `src/components/FilterPills.tsx` | Improve unselected state contrast |
| `src/i18n/index.ts` | Review detection order, add safeguards |

---

## 🎯 ACCEPTANCE CRITERIA

After fixes:
- [ ] No zoom on mobile input focus
- [ ] Single token system (OKLCH only)
- [ ] Single font family (Nunito)
- [ ] Header logo doesn't look like a button
- [ ] Header icons have consistent sizing and tap states
- [ ] Search bar and pills have adequate contrast
- [ ] English locale shows 100% English content
- [ ] Dark mode uses correct Sunset Horizon colors

---

*Generated by styling audit • PawsSafe v1.0.0*
