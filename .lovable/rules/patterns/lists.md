# List & Item Patterns

## Standard List Item

### Basic List Item
```tsx
function ListItem({ item, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 active:bg-muted transition-colors"
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={item.imageUrl} />
        <AvatarFallback>{item.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </button>
  )
}
```

### List Item with Badge
```tsx
function ListItemWithBadge({ item }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={item.imageUrl} />
        <AvatarFallback>{item.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{item.title}</p>
          <Badge variant="secondary" className="shrink-0">New</Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
      </div>
    </div>
  )
}
```

### List Item with Action
```tsx
function ListItemWithAction({ item, onAction }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={item.imageUrl} />
        <AvatarFallback>{item.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onAction}>
        Follow
      </Button>
    </div>
  )
}
```

## Pet List Item
```tsx
function PetListItem({ pet, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 active:bg-muted"
    >
      <Avatar className="h-14 w-14 rounded-lg shrink-0">
        <AvatarImage src={pet.imageUrl} className="object-cover" />
        <AvatarFallback className="rounded-lg">
          <PawPrint className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold truncate">{pet.name}</p>
          <StatusBadge status={pet.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {pet.species} • {pet.age}
        </p>
        {pet.fundingGoal && (
          <div className="mt-2">
            <Progress value={(pet.raised / pet.fundingGoal) * 100} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              ${pet.raised} of ${pet.fundingGoal} raised
            </p>
          </div>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </button>
  )
}
```

## Donation/Transaction Item
```tsx
function DonationItem({ donation }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
        <Heart className="h-5 w-5 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          Donated to {donation.petName}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDate(donation.date)}
        </p>
      </div>
      <span className="font-semibold text-success shrink-0">
        ${donation.amount}
      </span>
    </div>
  )
}
```

## Notification Item
```tsx
function NotificationItem({ notification, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-4 w-full text-left hover:bg-muted/50",
        !notification.read && "bg-primary/5"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={notification.actorImage} />
        <AvatarFallback>{notification.actorName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.read && "font-medium")}>
          <span className="font-semibold">{notification.actorName}</span>
          {" "}{notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  )
}
```

## Settings List Item
```tsx
function SettingsItem({ icon: Icon, title, description, onClick, value }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 w-full text-left hover:bg-muted/50 active:bg-muted"
    >
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {value ? (
        <span className="text-sm text-muted-foreground">{value}</span>
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
    </button>
  )
}
```

## List with Dividers
```tsx
<div className="divide-y divide-border">
  {items.map(item => (
    <ListItem key={item.id} item={item} />
  ))}
</div>
```

## List with Section Headers
```tsx
<div>
  <div className="px-4 py-2 bg-muted/50">
    <h3 className="text-sm font-medium text-muted-foreground">Today</h3>
  </div>
  <div className="divide-y">
    {todayItems.map(item => <ListItem key={item.id} item={item} />)}
  </div>
  
  <div className="px-4 py-2 bg-muted/50 mt-4">
    <h3 className="text-sm font-medium text-muted-foreground">Yesterday</h3>
  </div>
  <div className="divide-y">
    {yesterdayItems.map(item => <ListItem key={item.id} item={item} />)}
  </div>
</div>
```

## Swipeable List Item (Conceptual)
```tsx
// Use a library like react-swipeable-list
<SwipeableList>
  <SwipeableListItem
    swipeRight={{
      content: <div className="bg-destructive">Delete</div>,
      action: () => handleDelete(item.id)
    }}
  >
    <ListItem item={item} />
  </SwipeableListItem>
</SwipeableList>
```

## Best Practices

✅ **DO:**
```tsx
// Use min-w-0 for truncation to work
<div className="flex-1 min-w-0">
  <p className="truncate">{text}</p>
</div>

// Use shrink-0 on fixed-width elements
<Avatar className="h-12 w-12 shrink-0" />

// Touch-friendly tap targets (48px min)
<button className="p-4">{/* content */}</button>

// Visual feedback on tap
<button className="hover:bg-muted/50 active:bg-muted" />

// Consistent avatar sizes
// 10 (40px) for icons/small
// 12 (48px) for standard
// 14 (56px) for featured
```

❌ **DON'T:**
```tsx
// Don't forget shrink-0
<Avatar className="h-12 w-12" /> // Will shrink in flex

// Don't use too small touch targets
<button className="p-2">{/* content */}</button>

// Don't forget truncation classes
<p>{veryLongText}</p> // Will overflow

// Don't use fixed widths on text containers
<div className="w-[200px]">{text}</div>
```
