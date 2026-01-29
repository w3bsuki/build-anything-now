# 🎨 Pawtreon Styling Guide
> **Theme:** Twitter/X Style (shadcn Studio) | **Stack:** Tailwind CSS v4 + shadcn/ui  
> **Last Updated:** January 16, 2026

---

## 📋 Table of Contents
1. [Theme Overview](#theme-overview)
2. [Semantic Token System](#semantic-token-system)
3. [Color Usage Patterns](#color-usage-patterns)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Patterns](#component-patterns)
7. [Anti-Patterns (What NOT to Do)](#anti-patterns)
8. [Status Badges](#status-badges)
9. [Dark Mode](#dark-mode)
10. [Quick Reference](#quick-reference)

---

## Theme Overview

We use a **Twitter/X inspired theme** from shadcn Studio with OKLCH color format. The theme is defined in `src/index.css` using CSS custom properties (design tokens).

### Stack
- **Tailwind CSS v4** - CSS-first configuration with `@tailwindcss/vite`
- **shadcn/ui** - Component library with our Twitter theme
- **OKLCH Colors** - Modern perceptually uniform color space
- **CSS Variables** - Single source of truth for theming

### Key Principles
1. **Never hardcode colors** - Always use semantic tokens
2. **Use the theme system** - `bg-primary`, not `bg-blue-500`
3. **Prefer component variants** - Use button variants, not custom classes
4. **Dark mode ready** - All tokens have light/dark values

---

## Semantic Token System

### Core Tokens (Light Mode)

| Token | OKLCH Value | Usage |
|-------|-------------|-------|
| `--background` | `oklch(1.0 0 0)` | Page background |
| `--foreground` | `oklch(0.188 0.013 248.5)` | Primary text |
| `--card` | `oklch(0.978 0.001 197.1)` | Card backgrounds |
| `--card-foreground` | `oklch(0.188 0.013 248.5)` | Card text |
| `--primary` | `oklch(0.672 0.161 245.0)` | Primary brand (Twitter blue) |
| `--primary-foreground` | `oklch(1.0 0 0)` | Text on primary |
| `--secondary` | `oklch(0.188 0.013 248.5)` | Secondary actions |
| `--secondary-foreground` | `oklch(1.0 0 0)` | Text on secondary |
| `--muted` | `oklch(0.922 0.001 286.4)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.188 0.013 248.5)` | Muted text |
| `--accent` | `oklch(0.939 0.017 250.8)` | Accent/hover states |
| `--accent-foreground` | `oklch(0.672 0.161 245.0)` | Text on accent |
| `--destructive` | `oklch(0.619 0.238 25.8)` | Error/danger |
| `--border` | `oklch(0.932 0.012 231.7)` | Borders |
| `--input` | `oklch(0.981 0.003 228.8)` | Input backgrounds |
| `--ring` | `oklch(0.682 0.158 243.4)` | Focus rings |

### Semantic Status Tokens

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `--success` | `bg-success text-success-foreground` | Success states, adopted |
| `--warning` | `bg-warning text-warning-foreground` | Warnings, attention |
| `--urgent` | `bg-urgent text-urgent-foreground` | Urgent cases |
| `--recovering` | `bg-recovering text-recovering-foreground` | Recovering status |
| `--adopted` | `bg-adopted text-adopted-foreground` | Adopted status |
| `--destructive` | `bg-destructive text-destructive-foreground` | Critical/errors |

---

## Color Usage Patterns

### ✅ DO: Use Semantic Tokens

```tsx
// Primary actions
<Button className="bg-primary text-primary-foreground">
  Donate Now
</Button>

// Card with proper background
<Card className="bg-card text-card-foreground border-border">
  Content
</Card>

// Muted secondary text
<p className="text-muted-foreground">Last updated 2 hours ago</p>

// Status badges
<Badge className="bg-urgent text-urgent-foreground">Urgent</Badge>
<Badge className="bg-recovering text-recovering-foreground">Recovering</Badge>
<Badge className="bg-adopted text-adopted-foreground">Adopted</Badge>

// Interactive elements
<Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
  Like
</Button>

// Borders
<div className="border border-border rounded-lg">
  Bordered container
</div>
```

### ❌ DON'T: Hardcode Colors

```tsx
// ❌ BAD - Hardcoded Tailwind colors
<div className="bg-blue-500" />
<p className="text-gray-600" />
<Badge className="bg-red-500 text-white" />
<div className="border-gray-200" />

// ✅ GOOD - Semantic tokens
<div className="bg-primary" />
<p className="text-muted-foreground" />
<Badge className="bg-destructive text-destructive-foreground" />
<div className="border-border" />
```

### Opacity Modifiers

Use Tailwind's opacity modifiers with semantic colors:

```tsx
// Background with opacity
<div className="bg-primary/10">Subtle primary background</div>
<div className="bg-destructive/20">Subtle danger background</div>

// Hover states with opacity
<Button className="bg-primary hover:bg-primary/90">
  Slight darken on hover
</Button>

// Borders with opacity
<div className="border border-border/50">Subtle border</div>
```

---

## Typography

### Font Stack

```css
--font-sans: Open Sans, sans-serif;  /* Theme default */
/* Alternative: Nunito (defined in fonts.css) */
```

### Text Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Captions, metadata, timestamps |
| `text-sm` | 14px | Body text, descriptions |
| `text-base` | 16px | Default body, card titles |
| `text-lg` | 18px | Section headers |
| `text-xl` | 20px | Page titles |
| `text-2xl` | 24px | Hero titles |

### Font Weights

```tsx
// Light metadata
<span className="text-xs text-muted-foreground">2h ago</span>

// Regular body
<p className="text-sm">Description text</p>

// Medium emphasis
<span className="text-sm font-medium">Label</span>

// Bold headers
<h2 className="text-lg font-semibold">Section Title</h2>

// Extra bold
<h1 className="text-xl font-bold">Page Title</h1>
```

### Special Text Sizes (Arbitrary Values)

When needed for specific UI elements, these arbitrary values are acceptable:

```tsx
// Badge counts (very small)
<span className="text-[10px]">99+</span>

// Avatar labels (between xs and sm)  
<span className="text-[11px]">@username</span>

// Tiny icons/indicators
<span className="text-[9px]">🏆</span>
```

---

## Spacing & Layout

### Spacing Scale

| Class | Size | Usage |
|-------|------|-------|
| `gap-1` | 4px | Tight icon+text |
| `gap-1.5` | 6px | Icon+label pairs |
| `gap-2` | 8px | List items, buttons in row |
| `gap-3` | 12px | Card content sections |
| `gap-4` | 16px | Between components |
| `gap-6` | 24px | Section spacing |

### Layout Patterns

```tsx
// Page padding
<div className="px-4">Mobile page content</div>

// Container centering
<div className="container mx-auto px-4">Centered content</div>

// Card padding
<Card className="p-4">Standard card padding</Card>

// Section spacing
<section className="py-6">Section with vertical padding</section>

// Flexbox patterns
<div className="flex items-center gap-2">Icon and text</div>
<div className="flex items-center justify-between">Space between</div>
```

### Border Radius

Our theme uses `--radius: 1.3rem` as base. Use the scale:

```tsx
// From theme
className="rounded-sm"  // calc(1.3rem - 4px)
className="rounded-md"  // calc(1.3rem - 2px)  
className="rounded-lg"  // 1.3rem (default)
className="rounded-xl"  // calc(1.3rem + 4px)
className="rounded-2xl" // calc(1.3rem + 8px)
className="rounded-full" // Full circle
```

---

## Component Patterns

### Buttons

Use the defined variants, don't create custom button styles:

```tsx
// Primary CTA
<Button variant="default">Donate Now</Button>

// Secondary
<Button variant="secondary">Learn More</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Ghost (for toolbars, nav)
<Button variant="ghost">Like</Button>

// Outline
<Button variant="outline">Cancel</Button>

// Link style
<Button variant="link">View All</Button>

// Custom variants we've added
<Button variant="donate">💝 Donate</Button>
<Button variant="iconHeader" size="iconTouch">
  <Bell />
</Button>
```

### Cards

```tsx
<Card className="bg-card border-border">
  <CardHeader className="pb-2">
    <CardTitle className="text-base font-semibold">Title</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter className="pt-2">
    Footer actions
  </CardFooter>
</Card>
```

### Badges

```tsx
// Use variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

// Status badges - use custom classes
<Badge className="bg-urgent text-urgent-foreground">Urgent</Badge>
<Badge className="bg-recovering text-recovering-foreground">Recovering</Badge>
<Badge className="bg-adopted text-adopted-foreground">Adopted</Badge>
<Badge className="bg-destructive text-destructive-foreground">Critical</Badge>
```

### Interactive States

```tsx
// Hover backgrounds
<div className="hover:bg-accent transition-colors">
  Hoverable item
</div>

// Active/pressed
<button className="active:scale-95 transition-transform">
  Pressable
</button>

// Focus rings
<input className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
```

---

## Anti-Patterns

### ❌ Never Do This

```tsx
// 1. Hardcoded Tailwind colors
<div className="bg-blue-500">❌</div>
<div className="text-gray-600">❌</div>
<div className="border-red-500">❌</div>

// 2. Inline OKLCH/HSL values
<div style={{ background: 'oklch(0.67 0.16 245)' }}>❌</div>
<div className="bg-[hsl(210,100%,50%)]">❌</div>

// 3. Arbitrary colors in className
<div className="bg-[#1DA1F2]">❌</div>
<div className="text-[rgb(255,0,0)]">❌</div>

// 4. Mixing color systems
<Badge className="bg-green-500/10 border-green-500/30">❌</Badge>

// 5. Creating custom button styles instead of variants
<button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">❌</button>
```

### ✅ Do This Instead

```tsx
// 1. Use semantic tokens
<div className="bg-primary">✅</div>
<div className="text-muted-foreground">✅</div>
<div className="border-destructive">✅</div>

// 2. Use CSS variables
<div className="bg-primary">✅</div>

// 3. Use theme colors with opacity
<div className="bg-primary/10">✅</div>

// 4. Use semantic status tokens
<Badge className="bg-success/10 border-success/30 text-success">✅</Badge>

// 5. Use component variants
<Button variant="default">✅</Button>
```

---

## Status Badges

### Case Status Pattern

```tsx
// Component helper (recommended)
const statusStyles = {
  critical: 'bg-destructive text-destructive-foreground',
  urgent: 'bg-urgent text-urgent-foreground', 
  recovering: 'bg-recovering text-recovering-foreground',
  adopted: 'bg-adopted text-adopted-foreground',
} as const;

<Badge className={statusStyles[status]}>{status}</Badge>

// Or use CSS component classes from index.css
<Badge className="badge-critical">Critical</Badge>
<Badge className="badge-urgent">Urgent</Badge>
<Badge className="badge-recovering">Recovering</Badge>
<Badge className="badge-adopted">Adopted</Badge>
```

### Achievement/Badge Colors

Instead of hardcoded colors, extend the theme:

```tsx
// ❌ Don't do this
{ color: 'bg-yellow-500/10 border-yellow-500/30' }
{ color: 'bg-blue-500/10 border-blue-500/30' }

// ✅ Use semantic tokens or add to theme
{ color: 'bg-warning/10 border-warning/30 text-warning' }
{ color: 'bg-primary/10 border-primary/30 text-primary' }
{ color: 'bg-success/10 border-success/30 text-success' }
```

---

## Dark Mode

### How It Works

Dark mode is handled via the `.dark` class on `<html>` and CSS custom properties:

```css
/* src/index.css */
:root {
  --background: oklch(1.0 0 0);          /* White */
  --foreground: oklch(0.188 0.013 248.5); /* Near black */
  /* ... */
}

.dark {
  --background: oklch(0 0 0);            /* Pure black */
  --foreground: oklch(0.933 0.003 228.8); /* Near white */
  /* ... */
}
```

### Best Practices

```tsx
// ✅ Automatic dark mode (just use tokens)
<div className="bg-background text-foreground">
  Works in both modes automatically
</div>

// ✅ Dark-specific overrides when needed
<div className="bg-card dark:bg-card">
  Same token, different values
</div>

// ✅ Glass effects with dark variants
<div className="glass-ultra">
  /* light: oklch(1.0 0 0 / 0.7) */
  /* dark: oklch(0.26 0.02 351.79 / 0.75) */
</div>
```

---

## Quick Reference

### Most Common Classes

| Need | Use |
|------|-----|
| Page background | `bg-background` |
| Primary text | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Primary button | `bg-primary text-primary-foreground` |
| Card background | `bg-card` |
| Border | `border-border` |
| Hover state | `hover:bg-accent` |
| Focus ring | `focus-visible:ring-ring` |
| Error/danger | `bg-destructive text-destructive-foreground` |
| Success | `bg-success text-success-foreground` |
| Warning | `bg-warning text-warning-foreground` |

### Status Badge Classes

```tsx
// Critical (most severe)
className="bg-destructive text-destructive-foreground"

// Urgent
className="bg-urgent text-urgent-foreground"

// Recovering
className="bg-recovering text-recovering-foreground"

// Adopted/Success
className="bg-adopted text-adopted-foreground"
// or
className="bg-success text-success-foreground"
```

### Icon Colors in Context

```tsx
// ❌ Don't hardcode
<Heart className="text-red-500" />
<CheckCircle className="text-green-500" />

// ✅ Use semantic colors
<Heart className="text-destructive" />
<CheckCircle className="text-success" />

// ✅ Or match surrounding context
<Heart className="text-foreground group-hover:text-destructive" />
```

---

## Migration Checklist

When updating existing code:

- [ ] Replace `bg-blue-*` → `bg-primary`
- [ ] Replace `bg-gray-*` → `bg-muted` or `bg-card`
- [ ] Replace `text-gray-*` → `text-muted-foreground`
- [ ] Replace `border-gray-*` → `border-border`
- [ ] Replace `bg-red-*` → `bg-destructive` or `bg-urgent`
- [ ] Replace `bg-green-*` → `bg-success` or `bg-adopted`
- [ ] Replace `bg-yellow-*` → `bg-warning`
- [ ] Replace `text-white` on colored bg → `text-*-foreground`
- [ ] Replace custom button styles → Button variants
- [ ] Replace arbitrary `text-[#xxx]` → semantic tokens

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/index.css` | Theme tokens (`:root` and `.dark`) |
| `src/fonts.css` | Font stack definition |
| `src/components/ui/*.tsx` | shadcn components |
| `components.json` | shadcn configuration |
| `vite.config.ts` | Tailwind v4 plugin |

---

## Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [OKLCH Color Picker](https://oklch.com)
- [shadcn Studio Themes](https://shadcnstudio.com)
