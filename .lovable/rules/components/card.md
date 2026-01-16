# Card Component Specification

## Import
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
```

## Twitter Blue Theme Style

In our Twitter-inspired theme, cards are:
- **Bordered** (NOT shadowed) — Use `border border-border` or `border border-border/50`
- **Flat** — Theme has shadow-* at 0% opacity, so shadows won't show
- **Rounded** — `rounded-xl` recommended (--radius: 1.3rem)
- **Clean** — Use `bg-card` for card background

### From STYLING-GUIDE.md
```tsx
// Basic Card
<div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
  {/* Content */}
</div>

// Card with Image
<div className="bg-card rounded-xl overflow-hidden shadow-sm">
  <div className="aspect-[3/2] bg-muted">
    <img className="w-full h-full object-cover" />
  </div>
  <div className="p-3">
    {/* Content */}
  </div>
</div>
```

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
<Card className="border border-border/50 overflow-hidden">
  <div className="relative aspect-[3/2]">
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
| CardContent | `p-4 pt-0` or `p-3` |
| CardFooter | `p-4 pt-0` or `p-3 pt-0` |
| Compact card overall | `p-3` |

## Aspect Ratios (From STYLING-GUIDE.md)

```
16:9 - Wide landscape (desktop)
3:2  - Standard photos (RECOMMENDED for cards)
4:3  - Instagram-style (tall)
1:1  - Square (avatars)
```

## Best Practices

✅ **DO:**
```tsx
// Use border for Twitter theme (shadows are 0% opacity)
<Card className="border border-border">
<Card className="border border-border/50">

// Use aspect-[3/2] for card images
<div className="aspect-[3/2] relative overflow-hidden">

// Truncate long text
<p className="line-clamp-2">{description}</p>

// Group cards with consistent gap
<div className="grid gap-4 sm:grid-cols-2">

// Use rounded-xl for card radius
<Card className="rounded-xl border border-border/50 overflow-hidden">
```

❌ **DON'T:**
```tsx
// Don't rely on shadows (they're 0% opacity in theme)
<Card className="shadow-lg"> // Won't show!

// Don't use Tailwind color palette
<Card className="bg-gray-50"> // Use bg-card

// Don't nest cards
<Card><Card>Bad</Card></Card>

// Don't use inconsistent padding
<CardContent className="px-2 py-6">

// Don't forget overflow-hidden for images
<Card><img className="rounded-lg" /></Card>
```

## Loading State
```tsx
<Card className="border border-border">
  <Skeleton className="aspect-[3/2]" />
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
