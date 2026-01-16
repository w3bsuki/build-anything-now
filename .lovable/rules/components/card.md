# Card Component Specification

## Import
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
```

## Twitter Theme Style

In our Twitter-inspired theme, cards are:
- **Bordered** (not shadowed) — Use `border border-border`
- **Flat** — No elevation, clean appearance
- **Rounded** — `rounded-lg` by default (radius based on design token)

## Basic Structure

```tsx
<Card className="border border-border">
  <CardHeader className="pb-3">
    <CardTitle className="text-base font-semibold">Pet Name</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

## Card Variants by Use Case

### Pet/Case Card (Compact Mobile)
```tsx
<Card className="border border-border overflow-hidden">
  <div className="relative aspect-[4/3]">
    <img src={imageUrl} alt={petName} className="object-cover w-full h-full" />
    <Badge className="absolute top-2 left-2">{status}</Badge>
  </div>
  <CardContent className="p-3">
    <h3 className="font-semibold text-base">{name}</h3>
    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
    <div className="mt-3">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-1">₱{raised} / ₱{goal}</p>
    </div>
  </CardContent>
</Card>
```

### Interactive Card (Clickable)
```tsx
<Card 
  className="border border-border cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
  onClick={handleClick}
  role="button"
  tabIndex={0}
>
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Stats Card
```tsx
<Card className="border border-border">
  <CardContent className="p-4 text-center">
    <p className="text-2xl font-bold text-primary">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </CardContent>
</Card>
```

### List Item Card
```tsx
<Card className="border border-border">
  <CardContent className="p-3 flex items-center gap-3">
    <Avatar className="h-12 w-12">
      <AvatarImage src={image} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">{title}</p>
      <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
  </CardContent>
</Card>
```

## Spacing Guidelines

| Element | Padding |
|---------|---------|
| CardHeader | `p-4 pb-3` or `p-3 pb-2` (compact) |
| CardContent | `p-4 pt-0` or `p-3 pt-0` (compact) |
| CardFooter | `p-4 pt-0` or `p-3 pt-0` (compact) |
| Compact card overall | `p-3` |

## Best Practices

✅ **DO:**
```tsx
// Use border for Twitter theme
<Card className="border border-border">

// Responsive images with aspect ratio
<div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">

// Truncate long text
<p className="line-clamp-2">{description}</p>

// Group cards with consistent gap
<div className="grid gap-4 sm:grid-cols-2">
```

❌ **DON'T:**
```tsx
// Don't use shadows in Twitter theme
<Card className="shadow-lg">

// Don't nest cards
<Card><Card>Bad</Card></Card>

// Don't use inconsistent padding
<CardContent className="px-2 py-6">

// Don't forget overflow hidden for images
<Card><img className="rounded-lg" /></Card>
```

## Loading State
```tsx
<Card className="border border-border">
  <Skeleton className="aspect-[4/3] rounded-t-lg" />
  <CardContent className="p-3 space-y-2">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-2 w-full mt-3" />
  </CardContent>
</Card>
```

## Empty State
```tsx
<Card className="border border-border border-dashed">
  <CardContent className="p-8 text-center">
    <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <p className="text-muted-foreground">No pets found</p>
    <Button variant="outline" className="mt-4">Browse All Pets</Button>
  </CardContent>
</Card>
```
