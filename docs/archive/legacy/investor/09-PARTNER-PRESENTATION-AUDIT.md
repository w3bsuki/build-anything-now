# 🔍 Partner Presentation Audit & Improvement Plan

> **Page:** `/partner` - Partner Pitch Presentation  
> **Audit Date:** January 15, 2026  
> **Focus:** Mobile-first UX, standardized styling, pixel-perfect presentation

---

## 📊 Executive Summary

The Partner Presentation (`/partner`) is a 13-slide pitch deck targeting veterinary clinics, shelters, and pet stores. While functional, several areas need improvement for production readiness, especially mobile UX and standardized component patterns.

### Critical Issues Identified

| Priority | Issue | Impact |
|----------|-------|--------|
| 🔴 High | Slide 2 horizontal swipe cards are confusing on mobile | Users may miss critical content |
| 🔴 High | Inconsistent card padding and spacing across slides | Unprofessional appearance |
| 🟠 Medium | Touch targets too small in some areas | Accessibility/usability issues |
| 🟠 Medium | Multiple "swipe to see more" patterns create fatigue | Cognitive overload |
| 🟡 Low | Inconsistent icon sizing across card components | Visual inconsistency |

---

## 🎯 Slide 2/13 - "The Problem" (CRITICAL FIX NEEDED)

### Current State
```tsx
// Mobile: Horizontal swipeable cards
<div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
  {problemCards.map((card) => (
    <div className="w-[85vw] max-w-[300px] shrink-0 snap-center">
      <InfoCard {...card} />
    </div>
  ))}
</div>
<div className="mt-2 text-center text-[11px] text-muted-foreground">
  ← Swipe to see more →
</div>
```

### Problems
1. **Horizontal scroll is unintuitive** - Users expect vertical scrolling in a slide presentation
2. **Hidden content** - 2 of 3 critical problem cards are initially hidden
3. **Swipe hint is tiny** (11px) and easily missed
4. **Inconsistent with other slides** - Creates jarring UX when navigating
5. **Content is critical** - This slide sets up the entire value proposition

### ✅ Recommended Fix: Vertical Stacked Cards

Replace horizontal swipe with a **vertical stacked layout** on mobile:

```tsx
// IMPROVED: Mobile - Vertical stacked cards
<div className="mt-6 space-y-3 md:hidden">
  {problemCards.map((card) => (
    <InfoCard key={card.title} {...card} />
  ))}
</div>

// Desktop: Keep the grid (works well)
<div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
  {problemCards.map((card) => (
    <InfoCard key={card.title} {...card} />
  ))}
</div>
```

### Design Rationale
- **All 3 cards visible** - No hidden content
- **Natural scroll** - Vertical within the slide container
- **Consistent pattern** - Matches other slides
- **Better readability** - Full-width cards on mobile

---

## 📱 Mobile UX Improvements (All Slides)

### Issue 1: Multiple Horizontal Swipe Carousels

**Affected Slides:**
- Slide 2: Problem cards (3 items)
- Slide 5: Clinic value cards (5 items)
- Slide 11: Partnership tiers (3 items)

**Problem:** Users encounter 3+ separate horizontal swipe areas. This is:
- Confusing ("which way do I swipe?")
- Error-prone (interferes with slide navigation)
- Fatigue-inducing (different mental model per section)

**Solution:** Convert to vertical layouts with strategic grouping:

| Slide | Current | Recommended |
|-------|---------|-------------|
| Slide 2 | 3 horizontal cards | 3 vertical stacked cards |
| Slide 5 | 5 horizontal cards | 2-column grid (mobile: 1-col) |
| Slide 11 | 3 horizontal tier cards | Vertical accordion or stacked cards |

### Issue 2: Touch Target Sizes

**Current:** Many interactive elements are undersized

```css
/* Current: Progress dots */
.size-2 /* 8px - TOO SMALL */

/* Current: Slide navigation buttons */
.h-9.w-9 /* 36px - Below 44px minimum */
```

**Fix:**
```css
/* Recommended: Progress dots with larger tap area */
.size-3 /* 12px visible dot */
/* ...with p-2 wrapper for 44px total tap area */

/* Recommended: Navigation buttons */
.h-11.w-11 /* 44px minimum */
```

### Issue 3: Progress Indicator on Mobile

**Current:** Shows only 5 dots at a time with dynamic window
```tsx
{slides.slice(
  Math.max(0, currentSlide - 2),
  Math.min(totalSlides, currentSlide + 3)
).map(...)}
```

**Problem:** 
- Context is lost (where am I in the 13 slides?)
- Dots jump around confusingly

**Recommended:** Simple text indicator + minimal progress bar
```tsx
// Mobile footer improvement
<div className="flex items-center gap-3">
  <Progress value={(currentSlide + 1) / totalSlides * 100} className="h-1 flex-1" />
  <span className="text-xs tabular-nums text-muted-foreground">
    {currentSlide + 1}/{totalSlides}
  </span>
</div>
```

---

## 🎨 Styling Standardization

### Token Usage Audit

| Component | Current | Should Be |
|-----------|---------|-----------|
| `InfoCard` padding | `p-3 pb-2 md:p-6 md:pb-3` | `p-4 md:p-6` (consistent) |
| `ValueCard` padding | `p-4 md:p-6` | ✅ Correct |
| `BenefitCard` padding | `p-4` | ✅ Correct |
| `TierCard` padding | `p-4 md:p-6` | ✅ Correct |

### Recommended: Unified Card Component Props

```tsx
// Define standard padding variants
const cardPadding = {
  sm: 'p-3 md:p-4',
  default: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};
```

### Typography Inconsistencies

| Location | Current | Recommendation |
|----------|---------|----------------|
| Slide title | `text-2xl` to `text-3xl` | Standardize to `text-3xl md:text-5xl` |
| Kicker badge | `text-[10px]` | Use `text-xs` (12px) for readability |
| Card titles | `text-lg` to `text-xl` | Standardize to `text-lg md:text-xl` |
| Descriptions | `text-sm` to `text-base` | `text-sm md:text-base` |

### Spacing Scale Compliance

Current code uses arbitrary values in some places:
```tsx
// ❌ Arbitrary
className="mt-5 space-y-2"
className="mt-8 md:mt-10"

// ✅ Tailwind scale (multiples of 4)
className="mt-4 space-y-2"  // 16px
className="mt-8 md:mt-10"   // 32px / 40px ✅
```

---

## 🧩 Component Improvements

### 1. InfoCard Enhancement

**Current Issues:**
- Inconsistent padding on mobile vs desktop
- Icon size varies (`text-3xl` vs `text-4xl`)

**Improved:**
```tsx
function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="p-4 md:p-6">
        <div className="text-4xl mb-2">{icon}</div>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### 2. Mobile Navigation Footer

**Current Issues:**
- Dots are too small and confusing
- Buttons could be more prominent

**Improved Design:**
```tsx
// Mobile footer - cleaner navigation
<div className="flex items-center justify-between gap-4 md:hidden">
  <Button
    variant="outline"
    size="icon"
    className="h-11 w-11 rounded-full"
    onClick={prevSlide}
    disabled={currentSlide === 0}
  >
    <ChevronLeft className="size-5" />
  </Button>
  
  <div className="flex flex-col items-center gap-1">
    <Progress 
      value={(currentSlide + 1) / totalSlides * 100} 
      className="h-1.5 w-20" 
    />
    <span className="text-xs text-muted-foreground tabular-nums">
      {currentSlide + 1} of {totalSlides}
    </span>
  </div>
  
  <Button
    size="icon"
    className="h-11 w-11 rounded-full"
    onClick={nextSlide}
    disabled={currentSlide === totalSlides - 1}
  >
    <ChevronRight className="size-5" />
  </Button>
</div>
```

### 3. Slide Container Padding

**Current:** Inconsistent padding on mobile
```tsx
className="px-5 pb-32 pt-24 md:px-10"
```

**Recommended:** Standard responsive padding
```tsx
className="px-4 pb-28 pt-20 md:px-8 lg:px-10 md:pb-32 md:pt-28"
```

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (Slide 2)

- [ ] Replace horizontal swipe cards with vertical stack on mobile
- [ ] Ensure all 3 problem cards are visible without scrolling
- [ ] Test touch interactions don't interfere with slide navigation
- [ ] Update `data-deck-swipe="ignore"` attribute handling

### Phase 2: Mobile Navigation

- [ ] Increase touch targets to 44px minimum
- [ ] Replace dot navigation with progress bar + text indicator
- [ ] Ensure consistent button sizing across mobile/desktop
- [ ] Test swipe gestures work smoothly

### Phase 3: Styling Standardization

- [ ] Audit and standardize all card padding values
- [ ] Standardize typography scale across all slides
- [ ] Remove arbitrary spacing values where possible
- [ ] Ensure consistent icon sizing (size-5/size-6)

### Phase 4: Accessibility

- [ ] Add proper `aria-label` to all navigation elements
- [ ] Ensure focus indicators are visible
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Verify color contrast ratios on all elements

### Phase 5: Performance

- [ ] Review component memoization
- [ ] Test slide transitions on low-end devices
- [ ] Ensure smooth 60fps animations
- [ ] Audit bundle size of presentation component

---

## 🎯 Specific Code Changes

### Change 1: Slide 2 Mobile Layout

**File:** `src/pages/PartnerPresentation.tsx`  
**Lines:** ~115-135

```tsx
// BEFORE (horizontal swipe)
<div className="mt-6 md:hidden">
  <div
    data-deck-swipe="ignore"
    className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide"
  >
    {problemCards.map((card) => (
      <div key={card.title} className="w-[85vw] max-w-[300px] shrink-0 snap-center">
        <InfoCard {...card} />
      </div>
    ))}
  </div>
  <div className="mt-2 text-center text-[11px] text-muted-foreground">
    ← Swipe to see more →
  </div>
</div>

// AFTER (vertical stack)
<div className="mt-6 space-y-3 md:hidden">
  {problemCards.map((card) => (
    <InfoCard key={card.title} {...card} />
  ))}
</div>
```

### Change 2: Mobile Footer Navigation

**File:** `src/pages/PartnerPresentation.tsx`  
**Lines:** ~1247-1290

Replace complex dot navigation with simpler progress indicator.

### Change 3: InfoCard Standardization

**File:** `src/pages/PartnerPresentation.tsx`  
**Lines:** ~1405-1420

Standardize padding and spacing.

---

## 🔄 Before/After Visual Comparison

### Slide 2 - Mobile

| Before | After |
|--------|-------|
| 3 horizontal cards (1 visible) | 3 vertical stacked cards (all visible) |
| Requires swipe to see content | Natural scroll within slide |
| "← Swipe to see more →" hint | No hint needed |
| Inconsistent with other slides | Consistent vertical flow |

### Navigation Footer - Mobile

| Before | After |
|--------|-------|
| Dynamic 5-dot indicator | Progress bar + "X of Y" text |
| 36px button touch targets | 44px button touch targets |
| Confusing dot jumps | Clear linear progress |

---

## 📈 Success Metrics

After implementation, validate:

1. **Task Completion Rate:** Users can navigate all 13 slides without confusion
2. **Content Visibility:** 100% of Slide 2 content is visible on first view
3. **Touch Accuracy:** No accidental swipes trigger wrong actions
4. **Accessibility Score:** Lighthouse accessibility > 95
5. **Performance:** Slide transitions < 300ms on mid-tier devices

---

## 🔗 Related Documentation

- [04-COMPONENT-STANDARDS-GUIDE.md](./04-COMPONENT-STANDARDS-GUIDE.md) - Component patterns
- [06-TAILWIND-SHADCN-STYLING.md](./06-TAILWIND-SHADCN-STYLING.md) - Token system
- [08-PRESENTATION-AUDIT-IMPROVEMENTS.md](./08-PRESENTATION-AUDIT-IMPROVEMENTS.md) - Investor deck audit

---

*Document Version: 1.0*  
*Last Updated: January 15, 2026*
