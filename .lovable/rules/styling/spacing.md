# Spacing System

## Base Unit: 4px (Tailwind's Default)

Our spacing follows Tailwind's 4px base unit system.

## Spacing Scale Reference

```
0    = 0px
0.5  = 2px
1    = 4px
1.5  = 6px
2    = 8px
2.5  = 10px
3    = 12px
3.5  = 14px
4    = 16px
5    = 20px
6    = 24px
7    = 28px
8    = 32px
9    = 36px
10   = 40px
11   = 44px
12   = 48px
14   = 56px
16   = 64px
20   = 80px
```

## Common Spacing Patterns

### Page Padding
```tsx
// Standard page horizontal padding
<div className="px-4">{content}</div>  // 16px

// NEVER use px-6 or larger on mobile (wastes space)
```

### Content Spacing
```tsx
// Tight - within components
<div className="space-y-1">{/* 4px */}</div>
<div className="space-y-2">{/* 8px */}</div>

// Normal - between elements
<div className="space-y-3">{/* 12px */}</div>
<div className="space-y-4">{/* 16px */}</div>

// Loose - between sections
<div className="space-y-6">{/* 24px */}</div>
<div className="space-y-8">{/* 32px */}</div>
```

### Section Spacing
```tsx
// Section vertical padding
<section className="py-6">{content}</section>  // 24px top/bottom

// Section with header
<section>
  <div className="px-4 py-3">{/* Section header */}</div>
  <div className="px-4">{/* Section content */}</div>
</section>
```

### Card Padding
```tsx
// Card content padding
<CardContent className="p-4">{content}</CardContent>

// Compact card
<CardContent className="p-3">{content}</CardContent>

// Card with header
<CardHeader className="p-4 pb-2">
  <CardTitle>Title</CardTitle>
</CardHeader>
<CardContent className="p-4 pt-0">
  {content}
</CardContent>
```

### Gap Patterns
```tsx
// Flex gap - tight
<div className="flex items-center gap-2">{/* 8px */}</div>

// Flex gap - normal
<div className="flex items-center gap-3">{/* 12px */}</div>

// Flex gap - loose
<div className="flex items-center gap-4">{/* 16px */}</div>

// Grid gap
<div className="grid gap-4">{/* 16px */}</div>
```

## Component-Specific Spacing

### List Items
```tsx
// Standard list item
<div className="flex items-center gap-3 p-4">
  {/* gap-3 (12px) between avatar and text */}
  {/* p-4 (16px) padding all around */}
</div>
```

### Buttons
```tsx
// Button with icon
<Button>
  <Icon className="mr-2 h-4 w-4" />
  {/* mr-2 (8px) between icon and text */}
  Label
</Button>
```

### Forms
```tsx
// Form field spacing
<div className="space-y-4">  {/* 16px between fields */}
  <div className="space-y-2">  {/* 8px between label and input */}
    <Label>Email</Label>
    <Input />
    <p className="text-sm text-muted-foreground">{helper}</p>
  </div>
</div>
```

### Headers
```tsx
// Page header
<header className="h-14 px-4">{/* 56px height, 16px padding */}</header>

// Header with gaps
<header className="flex items-center gap-4 px-4">
  {/* gap-4 (16px) between elements */}
</header>
```

## Touch Target Sizing

### Minimum Touch Target: 44px × 44px

```tsx
// Icon button - 44px
<Button variant="ghost" size="icon" className="h-11 w-11">
  <Icon className="h-5 w-5" />
</Button>

// Standard touch target
<button className="min-h-[44px] min-w-[44px] p-3">
  {content}
</button>

// List item (already touch-friendly with p-4)
<button className="p-4">{/* 64px+ height naturally */}</button>
```

## Bottom Navigation Clearance

```tsx
// Always add bottom padding for fixed bottom nav
<main className="pb-20">{/* 80px clearance */}</main>

// Safe area for notch/home indicator
<div className="pb-safe">{/* or pb-6 fallback */}</div>
```

## Margin vs Padding Decision Tree

```
Need space INSIDE an element?
├─ YES → Use padding (p-*, px-*, py-*)
└─ NO → Need space BETWEEN siblings?
         ├─ YES → Use gap-* (preferred) or space-y-*/space-x-*
         └─ NO → Need space from parent edge?
                  └─ Use margin (m-*, mx-*, my-*)
```

## Best Practices

✅ **DO:**
```tsx
// Use consistent spacing scale
<div className="space-y-4">
  <div className="space-y-2">{/* Nested is smaller */}</div>
</div>

// Use gap for flex/grid
<div className="flex gap-3">{items}</div>

// Keep mobile horizontal padding to px-4
<main className="px-4">{content}</main>

// Account for bottom nav
<main className="pb-20">{content}</main>
```

❌ **DON'T:**
```tsx
// Don't mix margin approaches
<div>
  <Item className="mb-4" />
  <Item className="mt-4" />  // Inconsistent
</div>

// Don't use arbitrary values when scale works
<div className="p-[15px]">{/* Use p-4 */}</div>

// Don't forget touch targets
<button className="p-1">{icon}</button>  // Too small!

// Don't use large horizontal padding on mobile
<div className="px-8">{/* Wastes space */}</div>
```

## Quick Reference

| Use Case | Spacing |
|----------|---------|
| Page horizontal padding | `px-4` |
| Between form fields | `space-y-4` |
| Label to input | `space-y-2` |
| List item padding | `p-4` |
| Card content | `p-4` |
| Grid gap | `gap-4` |
| Flex items gap | `gap-3` |
| Section vertical | `py-6` |
| Bottom nav clearance | `pb-20` |
| Touch target min | `44px` (h-11 w-11) |
