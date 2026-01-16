# Button Component Specification

## Import
```tsx
import { Button } from "@/components/ui/button"
```

## Variants (From src/components/ui/button.tsx)

### default
Primary CTA - Twitter Blue background
```tsx
<Button>Donate Now</Button>
<Button><Heart className="mr-2 h-4 w-4" />Support This Pet</Button>
// Classes: bg-primary text-primary-foreground hover:bg-primary/90
```

### secondary
Dark/inverted style
```tsx
<Button variant="secondary">Secondary Action</Button>
// Classes: bg-secondary text-secondary-foreground hover:bg-secondary/80
```

### outline
Bordered, transparent background - for secondary actions
```tsx
<Button variant="outline">View Details</Button>
<Button variant="outline" size="sm">Filter</Button>
// Classes: border border-input bg-background hover:bg-accent
```

### ghost
No background until hover - for tertiary actions
```tsx
<Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
<Button variant="ghost">Learn More</Button>
// Classes: hover:bg-accent hover:text-accent-foreground
```

### link
Text link style with underline on hover
```tsx
<Button variant="link">Learn More</Button>
// Classes: text-primary underline-offset-4 hover:underline
```

### destructive
For dangerous/delete actions
```tsx
<Button variant="destructive">Remove</Button>
// Classes: bg-destructive text-destructive-foreground hover:bg-destructive/90
```

### donate (Custom)
Donation-specific CTA with shadow emphasis
```tsx
<Button variant="donate" className="w-full">
  <Heart className="mr-2 h-4 w-4" />
  Donate ₱500
</Button>
// Classes: bg-primary text-primary-foreground font-semibold rounded-md hover:brightness-105 shadow-lg
```

### iconHeader (Custom)
Header action buttons with scale feedback
```tsx
<Button variant="iconHeader" size="iconSm">
  <Bell className="h-5 w-5" />
</Button>
// Classes: rounded-xl hover:bg-muted/60 active:scale-95 transition-all [&_svg]:size-6
```

## Sizes (From button.tsx)

| Size | Dimensions | Usage |
|------|------------|-------|
| `default` | h-10 px-4 py-2 | Standard buttons |
| `sm` | h-9 rounded-md px-3 | Compact buttons, inline actions |
| `lg` | h-11 rounded-md px-8 | Emphasized CTAs |
| `icon` | size-10 (40px) | Icon-only buttons |
| `iconSm` | size-9 (36px) | Compact icon buttons |
| `iconTouch` | size-10 (40px) | Touch-optimized icon buttons |

## Best Practices

✅ **DO:**
```tsx
// Full-width mobile buttons
<Button className="w-full sm:w-auto">Submit</Button>

// Icon + text with proper spacing
<Button><Plus className="mr-2 h-4 w-4" />Add New</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Saving...
</Button>
```

❌ **DON'T:**
```tsx
// Don't use custom colors
<Button className="bg-blue-500">Bad</Button>

// Don't forget icons need size
<Button><Plus />Missing size</Button>

// Don't make tiny buttons
<Button className="h-6 px-1">Too small</Button>
```

## States

- **Hover:** Slightly darker/lighter background
- **Active:** Scale down slightly (0.98)
- **Disabled:** 50% opacity, no pointer events
- **Focus:** Ring outline with offset

## Accessibility

- Always include text or `aria-label` for icon buttons
- Use `type="button"` for non-submit buttons in forms
- Ensure sufficient color contrast (4.5:1 minimum)
