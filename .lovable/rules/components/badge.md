# Badge Component Specification

## Import
```tsx
import { Badge } from "@/components/ui/badge"
```

## Semantic Status Badges

Always use the correct semantic color for status badges:

### Pet Status Badges
```tsx
// Critical - needs immediate help
<Badge className="bg-destructive text-destructive-foreground">Critical</Badge>

// Urgent - needs attention soon
<Badge className="bg-urgent text-urgent-foreground">Urgent</Badge>

// Recovering - getting better
<Badge className="bg-recovering text-recovering-foreground">Recovering</Badge>

// Adopted - success state
<Badge className="bg-adopted text-adopted-foreground">Adopted</Badge>

// Success - general success
<Badge className="bg-success text-success-foreground">Funded</Badge>

// Warning - attention needed
<Badge className="bg-warning text-warning-foreground">Low Funds</Badge>
```

### General Badges
```tsx
// Default (muted)
<Badge variant="default">New</Badge>

// Secondary
<Badge variant="secondary">Featured</Badge>

// Outline (subtle)
<Badge variant="outline">Partner</Badge>

// Destructive
<Badge variant="destructive">Expired</Badge>
```

## Badge Positioning

### On Cards (Top-left overlay)
```tsx
<div className="relative">
  <img src={image} className="aspect-[4/3] object-cover" />
  <Badge className="absolute top-2 left-2 bg-urgent text-urgent-foreground">
    Urgent
  </Badge>
</div>
```

### On Cards (Top-right overlay)
```tsx
<div className="relative">
  <img src={image} className="aspect-[4/3] object-cover" />
  <Badge className="absolute top-2 right-2" variant="secondary">
    <Heart className="h-3 w-3 mr-1" />
    234
  </Badge>
</div>
```

### Inline with text
```tsx
<div className="flex items-center gap-2">
  <span className="font-medium">{name}</span>
  <Badge variant="outline" className="text-xs">Verified</Badge>
</div>
```

### Multiple badges
```tsx
<div className="flex flex-wrap gap-1.5">
  <Badge className="bg-urgent text-urgent-foreground">Urgent</Badge>
  <Badge variant="outline">Dog</Badge>
  <Badge variant="outline">Quezon City</Badge>
</div>
```

## Size Variations

```tsx
// Default size
<Badge>Default</Badge>

// Smaller text
<Badge className="text-xs">Small</Badge>

// With icon
<Badge className="gap-1">
  <Star className="h-3 w-3" />
  Featured
</Badge>
```

## Best Practices

✅ **DO:**
```tsx
// Use semantic colors for status
<Badge className="bg-urgent text-urgent-foreground">Urgent</Badge>

// Consistent positioning
<Badge className="absolute top-2 left-2">

// Include proper contrast
<Badge className="bg-destructive text-destructive-foreground">
```

❌ **DON'T:**
```tsx
// Don't use arbitrary colors
<Badge className="bg-red-500">Bad</Badge>

// Don't make badges too large
<Badge className="text-lg px-6 py-2">Oversized</Badge>

// Don't use badges for actions
<Badge onClick={...}>Clickable Badge</Badge> // Use Button instead
```

## Accessibility

- Badges are decorative, not interactive
- Status badges should have nearby text explaining the status
- Color alone should not convey meaning (use text labels)
