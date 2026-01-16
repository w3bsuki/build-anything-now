# Loading & State Components

## Skeleton Components

### Import
```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

### Basic Skeletons
```tsx
// Text line
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />

// Heading
<Skeleton className="h-6 w-2/3" />

// Avatar
<Skeleton className="h-12 w-12 rounded-full" />

// Image
<Skeleton className="aspect-[4/3] w-full rounded-lg" />

// Button
<Skeleton className="h-10 w-24 rounded-md" />
```

### Card Skeleton
```tsx
function CardSkeleton() {
  return (
    <Card className="border border-border overflow-hidden">
      <Skeleton className="aspect-[4/3]" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-1/3 mt-1" />
        </div>
      </CardContent>
    </Card>
  )
}
```

### List Skeleton
```tsx
function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Grid Skeleton
```tsx
function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
```

## Loading Spinner

```tsx
import { Loader2 } from "lucide-react"

// Inline spinner
<Loader2 className="h-4 w-4 animate-spin" />

// Full page loader
<div className="flex items-center justify-center min-h-[200px]">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>

// Button loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

## Empty States

### Generic Empty State
```tsx
function EmptyState({ 
  icon: Icon = Inbox,
  title = "No items found",
  description = "Try adjusting your filters or check back later.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
        {description}
      </p>
      {action}
    </div>
  )
}
```

### Specific Empty States
```tsx
// No pets found
<EmptyState
  icon={PawPrint}
  title="No pets found"
  description="We couldn't find any pets matching your criteria."
  action={<Button variant="outline">Clear Filters</Button>}
/>

// No donations yet
<EmptyState
  icon={Heart}
  title="No donations yet"
  description="Be the first to help this pet!"
  action={<Button>Donate Now</Button>}
/>

// Search no results
<EmptyState
  icon={Search}
  title="No results"
  description="Try a different search term."
/>
```

## Error States

### Generic Error
```tsx
function ErrorState({
  title = "Something went wrong",
  description = "We're having trouble loading this content.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
```

### Inline Error
```tsx
<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
  <div className="flex gap-3">
    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
    <div>
      <p className="font-medium text-destructive">Payment failed</p>
      <p className="text-sm text-muted-foreground mt-1">
        Your card was declined. Please try a different payment method.
      </p>
    </div>
  </div>
</div>
```

## Success States

```tsx
<div className="rounded-lg border border-success/50 bg-success/10 p-4">
  <div className="flex gap-3">
    <CheckCircle className="h-5 w-5 text-success shrink-0" />
    <div>
      <p className="font-medium text-success">Donation successful!</p>
      <p className="text-sm text-muted-foreground mt-1">
        Thank you for helping Max. You'll receive a confirmation email shortly.
      </p>
    </div>
  </div>
</div>
```

## Best Practices

✅ **DO:**
```tsx
// Match skeleton shape to content
<Skeleton className="aspect-[4/3]" /> // For images

// Use consistent animation
<Skeleton /> // Built-in pulse animation

// Show meaningful empty states
<EmptyState title="No pets found" action={<Button>Browse All</Button>} />
```

❌ **DON'T:**
```tsx
// Don't use vague loading text
<p>Loading...</p> // Use skeleton instead

// Don't show empty div for empty state
{items.length === 0 && <div />} // Show EmptyState

// Don't forget error handling
{data && <Content />} // Also handle loading and error
```
