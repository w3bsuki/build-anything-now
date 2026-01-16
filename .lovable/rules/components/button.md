# Button Component Specification

## Import
```tsx
import { Button } from "@/components/ui/button"
```

## Variants

### Default (Primary)
Use for: Main CTAs, donate buttons, form submissions
```tsx
<Button>Donate Now</Button>
<Button><Heart className="mr-2 h-4 w-4" />Support This Pet</Button>
```

### Outline
Use for: Secondary actions, cancel buttons, filters
```tsx
<Button variant="outline">View Details</Button>
<Button variant="outline" size="sm">Filter</Button>
```

### Ghost
Use for: Tertiary actions, icon buttons, navigation items
```tsx
<Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
<Button variant="ghost">Learn More</Button>
```

### Destructive
Use for: Delete actions, cancellations, warnings
```tsx
<Button variant="destructive">Remove</Button>
```

### Donate (Custom)
Use for: Donation-specific CTAs with emphasis
```tsx
<Button variant="donate" className="w-full">
  <Heart className="mr-2 h-4 w-4" />
  Donate ₱500
</Button>
```

### Icon Header (Custom)
Use for: Header action buttons with touch-optimized size
```tsx
<Button variant="iconHeader" size="icon">
  <Bell className="h-5 w-5" />
</Button>
```

## Sizes

| Size | Height | Usage |
|------|--------|-------|
| `default` | 40px (h-10) | Standard buttons |
| `sm` | 36px (h-9) | Compact buttons, inline actions |
| `lg` | 44px (h-11) | Emphasized CTAs |
| `icon` | 40x40px | Icon-only buttons |
| `iconSm` | 36x36px | Compact icon buttons |
| `iconTouch` | 44x44px | Touch-optimized icon buttons |

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
