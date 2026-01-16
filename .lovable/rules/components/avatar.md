# Avatar Component

## Import
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
```

## Basic Usage
```tsx
<Avatar>
  <AvatarImage src={user.imageUrl} alt={user.name} />
  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
</Avatar>
```

## Sizes

```tsx
// Small - comments, compact lists
<Avatar className="h-8 w-8">
  <AvatarImage src={src} />
  <AvatarFallback className="text-xs">AB</AvatarFallback>
</Avatar>

// Default - most uses
<Avatar className="h-10 w-10">
  <AvatarImage src={src} />
  <AvatarFallback className="text-sm">AB</AvatarFallback>
</Avatar>

// Medium - list items, cards
<Avatar className="h-12 w-12">
  <AvatarImage src={src} />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>

// Large - profiles, headers
<Avatar className="h-16 w-16">
  <AvatarImage src={src} />
  <AvatarFallback className="text-lg">AB</AvatarFallback>
</Avatar>

// XL - profile pages
<Avatar className="h-24 w-24">
  <AvatarImage src={src} />
  <AvatarFallback className="text-2xl">AB</AvatarFallback>
</Avatar>
```

## User Avatars (People)
```tsx
function UserAvatar({ user, size = "default" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }
  
  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage 
        src={user.imageUrl} 
        alt={user.name}
        className="object-cover"
      />
      <AvatarFallback className="bg-primary/10 text-primary">
        {user.name?.charAt(0).toUpperCase() || "?"}
      </AvatarFallback>
    </Avatar>
  )
}
```

## Pet Avatars
```tsx
function PetAvatar({ pet, size = "default" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }
  
  // Square-ish for pets to show more of face
  return (
    <Avatar className={cn(sizeClasses[size], "rounded-lg")}>
      <AvatarImage 
        src={pet.imageUrl} 
        alt={pet.name}
        className="object-cover"
      />
      <AvatarFallback className="rounded-lg bg-muted">
        <PawPrint className="h-1/2 w-1/2 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  )
}
```

## Partner/Organization Avatars
```tsx
function PartnerAvatar({ partner, size = "default" }) {
  const sizeClasses = {
    sm: "h-10 w-10",
    default: "h-12 w-12",
    lg: "h-16 w-16",
  }
  
  return (
    <Avatar className={cn(sizeClasses[size], "rounded-lg")}>
      <AvatarImage 
        src={partner.logoUrl} 
        alt={partner.name}
        className="object-contain p-1"
      />
      <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs">
        {partner.name?.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
```

## Avatar with Status
```tsx
function AvatarWithStatus({ user, status }) {
  const statusColors = {
    online: "bg-success",
    busy: "bg-warning",
    offline: "bg-muted-foreground",
    urgent: "bg-status-urgent",
  }
  
  return (
    <div className="relative">
      <Avatar>
        <AvatarImage src={user.imageUrl} />
        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <span 
        className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
          statusColors[status]
        )}
      />
    </div>
  )
}
```

## Avatar with Badge
```tsx
function AvatarWithBadge({ user, badgeContent }) {
  return (
    <div className="relative">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.imageUrl} />
        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
        {badgeContent}
      </span>
    </div>
  )
}
```

## Avatar Stack (Multiple)
```tsx
function AvatarStack({ users, max = 4 }) {
  const visible = users.slice(0, max)
  const remaining = users.length - max
  
  return (
    <div className="flex -space-x-3">
      {visible.map((user, i) => (
        <Avatar 
          key={user.id} 
          className="h-8 w-8 border-2 border-background"
          style={{ zIndex: visible.length - i }}
        >
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="text-xs">
            {user.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
          +{remaining}
        </div>
      )}
    </div>
  )
}
```

## With Text Row
```tsx
function AvatarWithInfo({ user, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.imageUrl} />
        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.name}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
```

## Best Practices

✅ **DO:**
```tsx
// Always provide fallback
<Avatar>
  <AvatarImage src={url} alt={name} />
  <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
</Avatar>

// Use object-cover for photos
<AvatarImage className="object-cover" />

// Use object-contain for logos
<AvatarImage className="object-contain p-1" />

// Use rounded-lg for pets/orgs, keep circle for people
<Avatar className="rounded-lg" /> // Pet/org
<Avatar /> // Person (default circle)
```

❌ **DON'T:**
```tsx
// Don't skip fallbacks
<Avatar>
  <AvatarImage src={url} />
  // Missing fallback!
</Avatar>

// Don't use generic fallbacks
<AvatarFallback>?</AvatarFallback> // Use initial instead

// Don't forget alt text
<AvatarImage src={url} /> // Add alt={name}
```
