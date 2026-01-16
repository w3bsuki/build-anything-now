# Page Layout Patterns

## Standard Page Structure

### Mobile-First Page Template
```tsx
function Page() {
  return (
    <div className="flex flex-col min-h-screen pb-20"> {/* pb-20 for bottom nav */}
      {/* Page Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold truncate">Page Title</h1>
          <div className="ml-auto flex items-center gap-2">
            {/* Header actions */}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Page content */}
      </main>
    </div>
  )
}
```

### Homepage/Feed Layout
```tsx
function FeedPage() {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Feed</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button className="flex-1 py-3 text-sm font-medium border-b-2 border-primary">
            For You
          </button>
          <button className="flex-1 py-3 text-sm text-muted-foreground">
            Following
          </button>
        </div>
      </header>
      
      {/* Feed Content */}
      <main className="flex-1">
        {/* Feed items */}
      </main>
    </div>
  )
}
```

### Detail Page Layout
```tsx
function DetailPage({ pet }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Image */}
      <div className="relative aspect-[4/3] w-full">
        <img 
          src={pet.imageUrl} 
          alt={pet.name}
          className="object-cover w-full h-full"
        />
        {/* Floating back button */}
        <Button 
          variant="secondary" 
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/80 backdrop-blur"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {/* Floating actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur">
            <Share className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 -mt-4 bg-background rounded-t-2xl relative">
        <div className="p-4">
          {/* Detail content */}
        </div>
      </div>
      
      {/* Sticky Bottom CTA */}
      <div className="sticky bottom-0 p-4 bg-background border-t safe-bottom">
        <Button className="w-full h-12" size="lg">
          Donate Now
        </Button>
      </div>
    </div>
  )
}
```

## Section Patterns

### Section with Header
```tsx
<section>
  <div className="flex items-center justify-between px-4 py-3">
    <h2 className="font-semibold text-lg">Section Title</h2>
    <Button variant="ghost" size="sm" className="text-primary">
      See All
      <ChevronRight className="ml-1 h-4 w-4" />
    </Button>
  </div>
  <div className="px-4">
    {/* Section content */}
  </div>
</section>
```

### Horizontal Scroll Section
```tsx
<section>
  <div className="flex items-center justify-between px-4 py-3">
    <h2 className="font-semibold text-lg">Featured Pets</h2>
    <Button variant="ghost" size="sm" className="text-primary">
      See All
    </Button>
  </div>
  <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
    {items.map(item => (
      <Card key={item.id} className="shrink-0 w-[280px] snap-start">
        {/* Card content */}
      </Card>
    ))}
  </div>
</section>
```

### Grid Section
```tsx
<section className="px-4 py-6">
  <h2 className="font-semibold text-lg mb-4">All Pets</h2>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(item => (
      <Card key={item.id}>
        {/* Card content */}
      </Card>
    ))}
  </div>
</section>
```

## Spacing Constants

```css
/* Page padding */
.page-padding { @apply px-4; }

/* Section spacing */
.section-gap { @apply py-6; }
.section-gap-sm { @apply py-4; }

/* Content spacing */
.content-gap { @apply space-y-4; }
.content-gap-sm { @apply space-y-2; }
.content-gap-lg { @apply space-y-6; }

/* Card grid */
.card-grid { @apply grid gap-4 sm:grid-cols-2; }

/* Bottom nav clearance */
.nav-clearance { @apply pb-20; }

/* Safe area (for notch/home indicator) */
.safe-bottom { @apply pb-safe; } /* or pb-6 as fallback */
```

## Header Variants

### Simple Header
```tsx
<header className="h-14 flex items-center px-4 border-b bg-background">
  <h1 className="font-semibold">{title}</h1>
</header>
```

### Header with Back
```tsx
<header className="h-14 flex items-center gap-4 px-4 border-b bg-background">
  <Button variant="ghost" size="icon" onClick={() => router.back()}>
    <ArrowLeft className="h-5 w-5" />
  </Button>
  <h1 className="font-semibold flex-1 truncate">{title}</h1>
</header>
```

### Header with Actions
```tsx
<header className="h-14 flex items-center px-4 border-b bg-background">
  <Button variant="ghost" size="icon" onClick={() => router.back()}>
    <ArrowLeft className="h-5 w-5" />
  </Button>
  <h1 className="font-semibold flex-1 truncate text-center">{title}</h1>
  <Button variant="ghost" size="icon">
    <MoreVertical className="h-5 w-5" />
  </Button>
</header>
```

### Transparent Header (Over Image)
```tsx
<header className="absolute top-0 inset-x-0 z-10 h-14 flex items-center justify-between px-4">
  <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur">
    <ArrowLeft className="h-5 w-5" />
  </Button>
  <div className="flex gap-2">
    <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur">
      <Share className="h-5 w-5" />
    </Button>
  </div>
</header>
```

## Best Practices

✅ **DO:**
```tsx
// Always account for bottom nav
<main className="pb-20">{content}</main>

// Use sticky headers
<header className="sticky top-0 z-40 bg-background/95 backdrop-blur" />

// Add safe area padding
<div className="safe-bottom">{/* sticky bottom content */}</div>

// Use consistent section spacing
<section className="px-4 py-6">{content}</section>
```

❌ **DON'T:**
```tsx
// Don't forget bottom padding for nav
<main>{content}</main> // Content hidden behind nav

// Don't use px-6 or larger (wastes mobile space)
<div className="px-6">{content}</div>

// Don't use fixed position without z-index
<header className="fixed">{/* missing z-40+ */}</header>

// Don't forget backdrop blur on translucent headers
<header className="bg-background/80">{/* add backdrop-blur */}</header>
```
