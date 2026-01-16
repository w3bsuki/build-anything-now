# Typography System

## Font Family (From Theme)

```css
/* Defined in src/index.css */
--font-sans: Open Sans, sans-serif;
--font-serif: Georgia, serif;
--font-mono: Menlo, monospace;
```

The theme uses **Open Sans** as the primary font, applied globally via:
```css
body {
  @apply font-sans antialiased;
  letter-spacing: var(--tracking-normal);
}
```

## Type Scale

### Tailwind Classes
```tsx
// Display - Hero text only
<h1 className="text-4xl font-bold">Hero Title</h1>        // 36px
<h1 className="text-3xl font-bold">Large Display</h1>     // 30px

// Page Headers
<h1 className="text-2xl font-bold">Page Title</h1>        // 24px
<h1 className="text-xl font-semibold">Section Title</h1>  // 20px

// Content Headers
<h2 className="text-lg font-semibold">Card Title</h2>     // 18px
<h3 className="text-base font-semibold">Subsection</h3>   // 16px

// Body Text
<p className="text-base">Body text</p>                    // 16px
<p className="text-sm">Secondary text</p>                 // 14px
<p className="text-xs">Caption/timestamp</p>              // 12px
```

### From STYLING-GUIDE.md
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

## Font Weights

```tsx
// Regular (400) - body text default
<p>Regular text</p>

// Medium (500) - emphasis, labels
<label className="font-medium">Label</label>
<p className="font-medium">Emphasized text</p>

// Semibold (600) - headings, names, titles
<h2 className="font-semibold">Card Title</h2>
<span className="font-semibold">{userName}</span>

// Bold (700) - hero, display text only
<h1 className="text-2xl font-bold">Hero Title</h1>
```

## Line Heights

Tailwind defaults are appropriate for most cases:
```tsx
// Tight - headings
<h1 className="leading-tight">Heading</h1>  // 1.25

// Normal - body text (default)
<p className="leading-normal">Body</p>      // 1.5

// Relaxed - readable paragraphs
<p className="leading-relaxed">Long form content...</p>  // 1.625
```

## Text Colors

```tsx
// Primary text - headings, important content
<h1 className="text-foreground">Title</h1>

// Secondary text - descriptions, metadata
<p className="text-muted-foreground">Description</p>

// Interactive text - links
<a className="text-primary hover:underline">Link</a>

// Error text
<span className="text-destructive">Error message</span>

// Success text
<span className="text-success">Success!</span>
```

## Text Utilities

### Truncation
```tsx
// Single line truncate
<p className="truncate">{longText}</p>

// Multi-line clamp
<p className="line-clamp-2">{longText}</p>
<p className="line-clamp-3">{longText}</p>
```

### Alignment
```tsx
// Mobile-first (usually left)
<p className="text-left">Left aligned</p>

// Centered (modals, empty states)
<p className="text-center">Centered</p>

// Right (numbers, prices)
<span className="text-right">${price}</span>
```

## Common Compositions

### Hero Section
```tsx
<div className="text-center space-y-2">
  <h1 className="text-2xl font-bold">Help Save a Life</h1>
  <p className="text-muted-foreground">
    Every donation makes a difference
  </p>
</div>
```

### Card Header
```tsx
<div>
  <h3 className="font-semibold">{pet.name}</h3>
  <p className="text-sm text-muted-foreground">
    {pet.breed} • {pet.age}
  </p>
</div>
```

### List Item Text
```tsx
<div className="flex-1 min-w-0">
  <p className="font-medium truncate">{title}</p>
  <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
</div>
```

### Form Field
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Email</label>
  <Input placeholder="you@example.com" />
  <p className="text-sm text-muted-foreground">
    Enter your email address
  </p>
</div>
```

### Stats Display
```tsx
<div className="text-center">
  <p className="text-3xl font-bold">{value}</p>
  <p className="text-sm text-muted-foreground">{label}</p>
</div>
```

### Price Display
```tsx
// Large price
<span className="text-2xl font-bold">${amount}</span>

// Inline price
<span className="font-semibold">${amount}</span>

// With original (strikethrough)
<div>
  <span className="text-muted-foreground line-through text-sm">${original}</span>
  <span className="font-semibold ml-2">${discounted}</span>
</div>
```

## Best Practices

✅ **DO:**
```tsx
// Use semantic hierarchy
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

// Use muted-foreground for secondary text
<p className="text-muted-foreground">{description}</p>

// Truncate long text
<p className="truncate">{potentiallyLongText}</p>

// Use font-semibold for names/titles
<span className="font-semibold">{name}</span>
```

❌ **DON'T:**
```tsx
// Don't use too many sizes on one screen
<h1 className="text-4xl">
<h2 className="text-3xl">
<h3 className="text-2xl">
<h4 className="text-xl">  // Too many levels

// Don't use bold for everything
<p className="font-bold">{description}</p>

// Don't use tiny text for important info
<p className="text-[10px]">{importantInfo}</p>

// Don't forget min-w-0 for truncation in flex
<div className="flex">
  <p className="truncate">{text}</p>  // Won't work without min-w-0
</div>
```

## Mobile Typography Tips

1. **Keep it scannable** - Short paragraphs, clear hierarchy
2. **Adequate size** - Minimum 14px for body text, 12px for captions
3. **Sufficient contrast** - Use foreground and muted-foreground appropriately
4. **Touch-friendly labels** - Labels clearly associated with inputs
