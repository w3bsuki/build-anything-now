# Color System

## Theme: Twitter-Inspired (OKLCH)

Our color system uses OKLCH color space for perceptually uniform colors.

## Base Colors (CSS Variables)

```css
/* Located in src/index.css */

/* Light Mode */
--background: oklch(1 0 0);
--foreground: oklch(0.1451 0.0041 286.0594);
--primary: oklch(0.6723 0.1606 244.9955);
--primary-foreground: oklch(1 0 0);
--secondary: oklch(0.9686 0.0026 264.5412);
--muted: oklch(0.9686 0.0026 264.5412);
--muted-foreground: oklch(0.5569 0.0108 264.5412);
--accent: oklch(0.9686 0.0026 264.5412);
--border: oklch(0.9216 0.0052 264.5412);
--destructive: oklch(0.5774 0.2079 27.3348);

/* Dark Mode */
--background: oklch(0 0 0);
--foreground: oklch(0.9843 0.0026 264.5412);
--primary: oklch(0.6723 0.1606 244.9955);
--border: oklch(0.2627 0.0055 264.5412);
```

## Semantic Status Colors

### Pet Status Colors
```css
--status-urgent: oklch(0.6297 0.2577 29.2339);      /* Red - urgent needs */
--status-recovering: oklch(0.7608 0.1608 70.0804); /* Amber - in recovery */
--status-adopted: oklch(0.6792 0.1472 155.3965);   /* Green - happy ending */
```

### Feedback Colors
```css
--success: oklch(0.6792 0.1472 155.3965);  /* Green */
--warning: oklch(0.7608 0.1608 70.0804);   /* Amber */
--error: oklch(0.5774 0.2079 27.3348);     /* Red (same as destructive) */
```

## Using Colors

### In Tailwind Classes
```tsx
// Background
<div className="bg-background" />
<div className="bg-primary" />
<div className="bg-muted" />
<div className="bg-destructive" />

// Text
<p className="text-foreground" />
<p className="text-muted-foreground" />
<p className="text-primary" />
<p className="text-destructive" />

// Status (custom)
<div className="bg-status-urgent" />
<span className="text-status-adopted" />

// Opacity variants
<div className="bg-primary/10" /> /* 10% opacity */
<div className="bg-muted/50" />   /* 50% opacity */
```

### Status Badge Colors
```tsx
const statusColors = {
  urgent: "bg-status-urgent/10 text-status-urgent border-status-urgent/20",
  recovering: "bg-status-recovering/10 text-status-recovering border-status-recovering/20",
  adopted: "bg-status-adopted/10 text-status-adopted border-status-adopted/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
}
```

### Icon Background Colors
```tsx
// Success context
<div className="h-10 w-10 rounded-full bg-success/10">
  <CheckCircle className="h-5 w-5 text-success" />
</div>

// Warning context
<div className="h-10 w-10 rounded-full bg-warning/10">
  <AlertTriangle className="h-5 w-5 text-warning" />
</div>

// Error context
<div className="h-10 w-10 rounded-full bg-destructive/10">
  <AlertCircle className="h-5 w-5 text-destructive" />
</div>

// Neutral context
<div className="h-10 w-10 rounded-full bg-muted">
  <Settings className="h-5 w-5 text-muted-foreground" />
</div>
```

## Color Usage Guidelines

### Primary Color
- **Use for:** CTAs, links, active states, progress indicators
- **Don't use for:** Large backgrounds, body text

```tsx
// ✅ Good
<Button>Donate Now</Button>
<Progress className="bg-primary" />
<a className="text-primary">Learn more</a>

// ❌ Bad
<div className="bg-primary p-8">{/* Large primary bg */}</div>
<p className="text-primary">{/* Body text in primary */}</p>
```

### Muted Colors
- **Use for:** Backgrounds, secondary text, borders, dividers
- **Muted-foreground:** Secondary text, icons, timestamps

```tsx
// ✅ Good
<p className="text-muted-foreground">Posted 2 hours ago</p>
<div className="bg-muted rounded-lg p-4">{/* subtle container */}</div>
<Settings className="h-5 w-5 text-muted-foreground" />

// ❌ Bad
<h1 className="text-muted-foreground">Important Title</h1> // Use foreground
```

### Destructive Color
- **Use for:** Delete actions, errors, critical warnings
- **Always require confirmation** for destructive actions

```tsx
// ✅ Good
<Button variant="destructive">Delete</Button>
<p className="text-destructive">This action cannot be undone.</p>

// ❌ Bad
<Button variant="destructive">Cancel</Button> // Use outline instead
```

## Twitter Design Principles

### Borders Over Shadows
```tsx
// ✅ Twitter style - use borders
<Card className="border border-border" />

// ❌ Avoid heavy shadows
<Card className="shadow-lg" />
```

### Clean Whites
```tsx
// ✅ Clean backgrounds
<div className="bg-background" />
<div className="bg-card" />

// ❌ Avoid cream/off-white
<div className="bg-gray-50" />
```

### Minimal Color Accents
```tsx
// ✅ Use color sparingly for emphasis
<Badge className="bg-primary text-primary-foreground">New</Badge>
<Button>Primary Action</Button>

// ❌ Don't overuse color
<div className="bg-primary/20 border-primary">{/* too much */}</div>
```

## Accessibility

### Contrast Requirements
- **Normal text:** 4.5:1 minimum contrast ratio
- **Large text (18px+):** 3:1 minimum contrast ratio
- **Interactive elements:** Clearly distinguishable states

### Focus States
```tsx
// Built into components via focus-visible
<Button>Has focus ring</Button>
<Input className="focus-visible:ring-2" />
```

### Don't Rely on Color Alone
```tsx
// ✅ Good - icon + color + text
<Badge className="bg-destructive/10 text-destructive">
  <AlertCircle className="mr-1 h-3 w-3" />
  Error
</Badge>

// ❌ Bad - color only
<span className="text-destructive">●</span>
```
