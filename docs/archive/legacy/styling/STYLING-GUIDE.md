# 🌅 Pawtreon Styling Guide
> **⚠️ DEPRECATED:** This document contains outdated Sunset Horizon theme references.
> **👉 See [FINAL-STYLING-SPEC.md](./FINAL-STYLING-SPEC.md) for the current Twitter theme.**
> **Last Updated:** January 16, 2026

---

## ⚠️ THIS DOCUMENT IS OUTDATED

Pawtreon now uses the **Twitter theme from tweakcn**, not Sunset Horizon.

Key differences:
- Primary color is now **Twitter Blue (#1e9df1)**, not warm coral
- Navigation uses **black/foreground** for active states, not blue
- Blue is reserved for **CTAs only** (buttons, links)

**Please refer to [FINAL-STYLING-SPEC.md](./FINAL-STYLING-SPEC.md) for all styling decisions.**

---

## 🎨 Color Palette (LEGACY - DO NOT USE)

### Primary Brand Color
```
Primary: oklch(0.74 0.16 34.57) - Warm Coral/Sunset Orange
```
Use for: CTAs, active states, brand accents, links

### Status Colors (Semantic)
```
Critical:   oklch(0.61 0.21 22.21) - Deep Red
Urgent:     oklch(0.65 0.20 25)    - Warm Red  
Recovering: oklch(0.70 0.15 175)   - Teal
Adopted:    oklch(0.65 0.18 145)   - Green
Success:    oklch(0.65 0.18 145)   - Green
Warning:    oklch(0.80 0.16 75)    - Amber
```

### Surfaces
```
Background: oklch(0.99 0.01 67.74) - Warm Off-White
Card:       oklch(1.00 0 0)        - Pure White
Muted:      oklch(0.94 0.03 44.86) - Warm Light Gray
```

### Text
```
Foreground:       oklch(0.34 0.01 7.89)  - Near Black
Muted-foreground: oklch(0.49 0.05 27.86) - Warm Gray
```

---

## 📐 Spacing Guidelines

### Page Layout
```tsx
// Horizontal page padding
className="px-4"  // 16px on mobile

// Section spacing
className="space-y-6"  // 24px between sections

// Card internal padding  
className="p-3" or "p-4"  // 12-16px
```

### Component Spacing
```tsx
// Icon + text gap
className="gap-1.5"  // 6px

// Items in a row
className="gap-2" or "gap-3"  // 8-12px

// Between components
className="gap-4"  // 16px
```

---

## 🔤 Typography

### Font Family
```css
--font-sans: Nunito, ui-sans-serif, system-ui, sans-serif;
```

### Font Sizes
```tsx
// Page titles
className="text-lg font-bold"  // 18px bold

// Section headers
className="text-base font-semibold"  // 16px semibold

// Card titles
className="text-base font-semibold"  // 16px semibold

// Body text
className="text-sm"  // 14px

// Captions, metadata
className="text-xs"  // 12px
```

---

## 🔘 Button Standards

### Primary CTA (Donate, Join, etc.)
```tsx
<Button variant="default" className="h-10 rounded-xl font-semibold">
  <Heart className="w-4 h-4 mr-2" />
  Donate Now
</Button>
```

### Secondary Actions
```tsx
<Button variant="secondary" className="h-9 rounded-lg">
  Share
</Button>
```

### Icon Buttons
```tsx
<Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
  <Bell className="w-5 h-5" />
</Button>
```

### Sizes Reference
```
h-9  = 36px  - Small buttons, icon buttons
h-10 = 40px  - Standard CTAs
h-11 = 44px  - Large emphasis (use sparingly)
```

---

## 🏷️ Badge Standards

### Status Badges
```tsx
// Use StatusBadge component
<StatusBadge status="urgent" size="sm" />
```

### Notification Badges
```tsx
<Badge className="h-4 min-w-4 rounded-full px-1 text-[10px] font-semibold">
  {count}
</Badge>
```

---

## 🖼️ Card Standards

### Basic Card
```tsx
<div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
  {/* Content */}
</div>
```

### Card with Image
```tsx
<div className="bg-card rounded-xl overflow-hidden shadow-sm">
  <div className="aspect-[3/2] bg-muted">
    <img className="w-full h-full object-cover" />
  </div>
  <div className="p-3">
    {/* Content */}
  </div>
</div>
```

### Recommended Aspect Ratios
```
16:9 - Wide landscape (desktop)
3:2  - Standard photos (recommended for cards)
4:3  - Instagram-style (current, but tall)
1:1  - Square (avatars)
```

---

## 🔵 Avatar Standards

### Size Guide
```
w-8 h-8   - Small (32px) - Lists, compact
w-9 h-9   - Header icons (36px)
w-10 h-10 - Standard (40px) - Post headers
w-12 h-12 - Featured (48px) - Hero circles
w-14 h-14 - Large (56px) - Stories
```

### Story Ring (Active/New)
```tsx
// Theme-consistent gradient
className="bg-gradient-to-tr from-primary via-primary/90 to-primary/70"

// NOT generic colors:
// ❌ from-amber-500 via-orange-500 to-rose-500
```

### Avatar Container
```tsx
<div className="rounded-full p-[2px] bg-gradient-to-tr from-primary to-primary/70">
  <div className="rounded-full bg-background p-[2px]">
    <img className="rounded-full w-12 h-12 object-cover" />
  </div>
</div>
```

---

## 📊 Progress Bar

### Standard Usage
```tsx
<ProgressBar
  current={320}
  goal={500}
  currency="EUR"
  layout="compact"
  size="sm"  // sm | md | lg
/>
```

### Manual (if needed)
```tsx
<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
  <div 
    className="h-full bg-primary rounded-full"
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

## 🧭 Navigation

### Bottom Nav (Mobile)
- 5 items: Home, Campaigns, Create (+), Community, Partners
- Center item is raised FAB
- Active state: `text-primary`

### Header Icons (Mobile)
```tsx
// Recommended pattern
<NavLink
  to="/notifications"
  className={cn(
    "size-9 flex items-center justify-center rounded-lg",
    "hover:bg-muted/60 active:bg-muted/80",
    isActive && "bg-primary/10"
  )}
>
  <Bell className={cn(
    "size-5",
    isActive ? "text-primary" : "text-foreground/80"
  )} />
</NavLink>
```

---

## 🔄 Transitions

### Standard Hover/Active
```css
transition-colors duration-150
```

### Scale Feedback
```css
active:scale-[0.98] transition-transform
```

### Image Hover
```css
transition-transform duration-500 hover:scale-105
```

---

## ⚠️ Anti-Patterns (Don't Do)

```tsx
// ❌ Don't use hardcoded colors
className="bg-orange-500"

// ✅ Use theme tokens
className="bg-primary"

// ❌ Don't mix color systems
style={{ color: 'hsl(30, 100%, 50%)' }}

// ✅ Use CSS variables
className="text-primary"

// ❌ Don't create giant CTAs
className="h-14 text-lg"

// ✅ Keep CTAs proportional
className="h-10 text-sm font-semibold"

// ❌ Don't repeat information
// "7 helping" + "Join 7 people"

// ✅ Show info once, meaningfully
// "Join 7 • Help Luna"
```

---

## ✅ Checklist Before Shipping

- [ ] Colors use theme tokens (not hardcoded)
- [ ] Touch targets ≥ 44px
- [ ] Font sizes from scale (text-xs/sm/base/lg)
- [ ] Spacing from scale (gap-1/2/3/4/6)
- [ ] Buttons use Button component
- [ ] Badges use Badge component
- [ ] Cards have proper border-radius (rounded-xl)
- [ ] Shadows are subtle (shadow-sm)
- [ ] No redundant information
- [ ] Icons have proper sizing

---

*Reference this guide for all UI implementation. Update as patterns evolve.*
