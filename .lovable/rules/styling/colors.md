# Color System

## Theme: Twitter Blue (OKLCH)

Our color system uses OKLCH color space for perceptually uniform colors. The theme is Twitter-inspired with a signature blue primary.

## Base Colors (From src/index.css)

### Light Mode
```css
/* Core */
--background: oklch(1.0000 0 0);           /* Pure white */
--foreground: oklch(0.1884 0.0128 248.5103); /* Near black with blue tint */
--card: oklch(0.9784 0.0011 197.1387);      /* Very subtle warm gray */
--card-foreground: oklch(0.1884 0.0128 248.5103);

/* Brand */
--primary: oklch(0.6723 0.1606 244.9955);   /* Twitter Blue! */
--primary-foreground: oklch(1.0000 0 0);    /* White */

/* Secondary */
--secondary: oklch(0.1884 0.0128 248.5103); /* Dark (inverted) */
--secondary-foreground: oklch(1.0000 0 0);

/* Muted */
--muted: oklch(0.9222 0.0013 286.3737);     /* Light gray */
--muted-foreground: oklch(0.1884 0.0128 248.5103);

/* Accent */
--accent: oklch(0.9392 0.0166 250.8453);    /* Light blue-gray */
--accent-foreground: oklch(0.6723 0.1606 244.9955);

/* Destructive */
--destructive: oklch(0.6188 0.2376 25.7658); /* Red */

/* Borders */
--border: oklch(0.9317 0.0118 231.6594);    /* Light blue-gray border */
--input: oklch(0.9809 0.0025 228.7836);     /* Very light input bg */
--ring: oklch(0.6818 0.1584 243.3540);      /* Focus ring blue */
```

### Dark Mode
```css
--background: oklch(0 0 0);                  /* Pure black */
--foreground: oklch(0.9328 0.0025 228.7857); /* Off-white */
--card: oklch(0.2097 0.0080 274.5332);       /* Dark gray */
--primary: oklch(0.6692 0.1607 245.0110);    /* Twitter Blue (slightly adjusted) */
--muted: oklch(0.2090 0 0);                  /* Dark gray */
--muted-foreground: oklch(0.5637 0.0078 247.9662);
--border: oklch(0.2674 0.0047 248.0045);     /* Dark border */
```

## Semantic Status Colors

Pet and system status colors (defined in theme):

```css
/* Light mode */
--success: oklch(0.65 0.18 145);           /* Green */
--success-foreground: oklch(1.00 0 0);
--warning: oklch(0.80 0.16 75);            /* Amber */
--warning-foreground: oklch(0.25 0.02 45);
--urgent: oklch(0.65 0.20 25);             /* Warm red */
--urgent-foreground: oklch(1.00 0 0);
--recovering: oklch(0.70 0.15 175);        /* Teal */
--recovering-foreground: oklch(1.00 0 0);
--adopted: oklch(0.65 0.18 145);           /* Green (same as success) */
--adopted-foreground: oklch(1.00 0 0);

/* Dark mode - slightly lighter for visibility */
--success: oklch(0.70 0.16 145);
--warning: oklch(0.78 0.14 75);
--urgent: oklch(0.62 0.18 25);
--recovering: oklch(0.68 0.14 175);
--adopted: oklch(0.70 0.16 145);
```

## Using Colors (Tailwind Classes)

### ALWAYS Use Theme Tokens - NEVER Hardcode

```tsx
// ✅ CORRECT - Use semantic tokens
<div className="bg-background" />
<div className="bg-card" />
<div className="bg-primary" />
<div className="bg-muted" />
<p className="text-foreground" />
<p className="text-muted-foreground" />
<p className="text-primary" />
<span className="text-destructive" />
<div className="border-border" />

// ✅ CORRECT - Status colors (theme tokens)
<div className="bg-urgent text-urgent-foreground" />
<div className="bg-recovering text-recovering-foreground" />
<div className="bg-adopted text-adopted-foreground" />
<div className="bg-success text-success-foreground" />
<div className="bg-warning text-warning-foreground" />

// ❌ WRONG - Never hardcode colors
<div className="bg-blue-500" />
<div className="bg-orange-400" />
<div className="bg-[#1DA1F2]" />
<div style={{ backgroundColor: 'hsl(203, 89%, 53%)' }} />
```

### Opacity Modifiers (Tailwind Native)
```tsx
// Use opacity modifiers with tokens
<div className="bg-primary/10" />  /* 10% primary */
<div className="bg-primary/20" />  /* 20% primary */
<div className="bg-muted/50" />    /* 50% muted */
<div className="border-border/50" /> /* 50% border */
```

## Component Color Patterns

### Badge Status Colors (Pre-defined in index.css)
```tsx
// Use the pre-defined component classes
<span className="badge-urgent">Urgent</span>
<span className="badge-critical">Critical</span>
<span className="badge-recovering">Recovering</span>
<span className="badge-adopted">Adopted</span>

// Or with tokens directly
<Badge className="bg-urgent text-urgent-foreground">Urgent</Badge>
<Badge className="bg-success text-success-foreground">Success</Badge>
```

### Icon Background Colors
```tsx
// Success context
<div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
  <CheckCircle className="h-5 w-5 text-success" />
</div>

// Warning context
<div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
  <AlertTriangle className="h-5 w-5 text-warning" />
</div>

// Error/destructive context
<div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
  <AlertCircle className="h-5 w-5 text-destructive" />
</div>

// Primary accent context
<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
  <Heart className="h-5 w-5 text-primary" />
</div>

// Neutral context
<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
  <Settings className="h-5 w-5 text-muted-foreground" />
</div>
```

## Twitter Blue Design Principles

### 1. Shadows Are Disabled (0 opacity in theme)
The theme has shadows set to 0% opacity - use borders instead:
```tsx
// ✅ Twitter style - borders for depth
<Card className="border border-border" />
<Card className="border border-border/50" />

// ⚠️ shadow-* classes exist but are 0 opacity in this theme
<Card className="shadow-sm" /> // Won't show visible shadow
```

### 2. Clean Backgrounds
```tsx
// ✅ Use theme backgrounds
<div className="bg-background" />  // Pure white (light) / black (dark)
<div className="bg-card" />        // Subtle warm gray
<div className="bg-muted" />       // Light gray

// ❌ Don't use Tailwind color palette
<div className="bg-gray-50" />
<div className="bg-slate-100" />
```

### 3. Primary Blue for Emphasis
```tsx
// ✅ Use primary (Twitter Blue) for CTAs and active states
<Button>Primary Action</Button>
<Badge className="bg-primary text-primary-foreground">New</Badge>
<span className="text-primary">Link text</span>

// ✅ Primary/10 for subtle backgrounds
<div className="bg-primary/10">Selected item</div>
```

## Glass Morphism Utilities (From index.css)

```tsx
// Ultra glass effect (70% white, 20px blur)
<div className="glass-ultra">{content}</div>

// Subtle glass effect (50% white, 12px blur)
<div className="glass-subtle">{content}</div>

// Nav shadow utility (for floating nav)
<nav className="nav-shadow">{content}</nav>
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
<Input /> // Has focus-visible:ring-2 by default
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

## Anti-Patterns

❌ **NEVER DO:**
```tsx
// Hardcoded hex/rgb/hsl
className="bg-[#1DA1F2]"
style={{ color: 'rgb(29, 161, 242)' }}

// Tailwind color palette directly
className="bg-blue-500"
className="text-gray-600"
className="border-slate-200"

// Mixing color systems
className="bg-primary text-gray-900"

// Arbitrary OKLCH values
className="bg-[oklch(0.67_0.16_245)]"
```

✅ **ALWAYS DO:**
```tsx
// Semantic tokens only
className="bg-primary text-primary-foreground"
className="bg-background text-foreground"
className="border-border"

// Status tokens
className="bg-urgent text-urgent-foreground"

// Opacity with tokens
className="bg-primary/10"
className="border-border/50"
```
