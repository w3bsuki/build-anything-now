# 🐦 Pawtreon Final Styling Specification
> **Theme:** Twitter (from tweakcn)  
> **Last Updated:** January 16, 2026  
> **Status:** CANONICAL - This is the single source of truth

---

## 🎯 Design Philosophy

Pawtreon follows **Twitter's design system** adapted for a pet fundraising platform:

| Principle | Implementation |
|-----------|---------------|
| **Trust** | Twitter Blue primary creates familiarity and trust for donations |
| **Clarity** | Black text, clean white backgrounds, minimal visual noise |
| **Action** | Blue CTAs stand out clearly against neutral navigation |
| **Professionalism** | No childish colors - this handles real money for real animals |

---

## 🎨 Color Tokens (Source: tweakcn Twitter Theme)

### Core Palette

```css
/* These are the official Twitter theme values */
/* Stored in OKLCH format in src/index.css */

/* Primary - Twitter Blue */
--primary: #1e9df1;           /* oklch(0.67 0.16 245) */
--primary-foreground: #ffffff;

/* Secondary - Near Black (for text, active states) */
--secondary: #0f1419;         /* oklch(0.19 0.01 249) */
--secondary-foreground: #ffffff;

/* Background */
--background: #ffffff;
--foreground: #0f1419;        /* Near black */

/* Card */
--card: #f7f8f8;              /* Very light gray */
--card-foreground: #0f1419;

/* Muted */
--muted: #E5E5E6;             /* Light gray for backgrounds */
--muted-foreground: #536471;  /* Gray for inactive elements */

/* Accent */
--accent: #E3ECF6;            /* Light blue tint */
--accent-foreground: #1e9df1; /* Twitter blue */

/* Destructive */
--destructive: #f4212e;       /* Twitter red */
--destructive-foreground: #ffffff;

/* Border & Input */
--border: #e1eaef;            /* Light border */
--input: #f7f9fa;             /* Input background */
--ring: #1da1f2;              /* Focus ring - Twitter blue */
```

### Semantic Status Colors

```css
/* For case/campaign status badges */
--success: oklch(0.65 0.18 145);     /* Green - Adopted/Completed */
--warning: oklch(0.80 0.16 75);      /* Amber - Needs attention */
--urgent: oklch(0.65 0.20 25);       /* Red-orange - Urgent */
--critical: oklch(0.61 0.21 22);     /* Deep red - Critical */
--recovering: oklch(0.70 0.15 175);  /* Teal - In recovery */
```

---

## 🧭 Navigation Pattern (CRITICAL)

### The Twitter Rule
> **Navigation uses foreground (black), CTAs use primary (blue)**

This is how Twitter actually works - and it's essential for a professional fundraising app:

| Element | Color | Token |
|---------|-------|-------|
| Nav icon (inactive) | Gray | `text-muted-foreground` |
| Nav icon (active) | Black | `text-foreground` |
| Nav label (inactive) | Gray | `text-muted-foreground` |
| Nav label (active) | Black + Bold | `text-foreground font-semibold` |
| Primary CTA buttons | Blue | `bg-primary text-primary-foreground` |
| Create (+) button | Blue | `bg-primary text-primary-foreground` |

### Why Not Blue Navigation?

❌ **Blue nav icons** = Everything looks clickable, no hierarchy  
✅ **Black active icons** = Clear "you are here" indicator  
✅ **Blue CTAs** = Clear "do this action" indicator

---

## 🔘 Button Hierarchy

### Primary (Donations, Main Actions)
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
  Help Luna
</Button>
```

### Secondary (Less important actions)
```tsx
<Button variant="secondary" className="rounded-full">
  Share
</Button>
```

### Ghost (Toolbar actions)
```tsx
<Button variant="ghost" size="icon" className="rounded-full">
  <Heart />
</Button>
```

### Outline (Cancel, Back)
```tsx
<Button variant="outline" className="rounded-full">
  Cancel
</Button>
```

---

## 📐 Spacing & Layout

### Mobile Page Structure
```tsx
<div className="min-h-screen pt-14 pb-20">  {/* Header + Bottom nav space */}
  <main className="px-4 space-y-6">
    {/* Content */}
  </main>
</div>
```

### Spacing Scale
```
gap-1   = 4px   (icon + text inline)
gap-2   = 8px   (between related items)
gap-3   = 12px  (component internal)
gap-4   = 16px  (section padding)
gap-6   = 24px  (between sections)
p-3     = 12px  (card padding)
p-4     = 16px  (page padding)
```

---

## 🔤 Typography

### Font
```css
--font-sans: 'Open Sans', system-ui, sans-serif;
```

### Scale
```
text-xs    = 12px  (badges, captions)
text-sm    = 14px  (body small, metadata)
text-base  = 16px  (body, inputs - required for iOS no-zoom)
text-lg    = 18px  (headings)
text-xl    = 20px  (page titles)
```

### Weights
```
font-normal    = 400  (body)
font-medium    = 500  (labels)
font-semibold  = 600  (emphasis)
font-bold      = 700  (headings)
```

---

## 🏷️ Status Badges

Use semantic tokens for case/campaign status:

```tsx
// StatusBadge component handles these automatically
<StatusBadge status="critical" />   // Deep red
<StatusBadge status="urgent" />     // Red-orange
<StatusBadge status="recovering" /> // Teal
<StatusBadge status="adopted" />    // Green
```

---

## 🖼️ Cards

### Standard Card
```tsx
<div className="bg-card rounded-xl border border-border overflow-hidden">
  {/* Content */}
</div>
```

### Image Aspect Ratios
```
3:2     = Standard photos (recommended)
16:9    = Wide landscape
1:1     = Avatars, thumbnails
```

---

## 📱 Mobile Considerations

### Touch Targets
- Minimum 44x44px for all interactive elements
- Use `min-w-[56px]` for nav items

### Input Zoom Prevention
- All inputs use `text-base` (16px) on mobile
- iOS zooms on focus when font-size < 16px

### Safe Areas
```tsx
pb-[env(safe-area-inset-bottom)]  // Bottom nav
pt-[env(safe-area-inset-top)]     // If no header
```

---

## ⚠️ What NOT to Do

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| Blue navigation icons | Black/gray navigation |
| `text-primary` for nav active | `text-foreground` for nav active |
| Sunset/coral/orange colors | Twitter blue (#1e9df1) |
| Custom gradients on icons | Solid colors from tokens |
| `text-sm` on mobile inputs | `text-base` to prevent zoom |
| Multiple theme definitions | Single source in `index.css` |

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `src/index.css` | **Single source of truth** for all tokens |
| `src/components/ui/button.tsx` | Button variants |
| `src/components/StatusBadge.tsx` | Status badge styling |
| `src/components/Navigation.tsx` | Navigation patterns |

---

## ✅ Checklist for New Components

When creating new components, verify:

- [ ] Uses design tokens (not hardcoded colors)
- [ ] Navigation elements use `foreground`/`muted-foreground`
- [ ] CTAs use `primary`/`primary-foreground`
- [ ] Touch targets ≥ 44px
- [ ] Mobile inputs use `text-base`
- [ ] Proper dark mode token variants
- [ ] Consistent border-radius (`rounded-xl` for cards, `rounded-full` for buttons)

---

*This document supersedes all previous styling guides including STYLING-GUIDE.md and sunset horizon references.*
