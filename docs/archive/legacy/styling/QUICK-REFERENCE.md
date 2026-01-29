# 🚀 Styling Quick Reference
> **Copy-paste ready patterns for Pawtreon**

---

## Color Tokens Cheat Sheet

### Backgrounds
```tsx
bg-background      // Page background
bg-card            // Card/surface
bg-muted           // Subtle background
bg-accent          // Hover state background
bg-primary         // Primary brand
bg-secondary       // Secondary brand
bg-destructive     // Error/danger
bg-success         // Success state
bg-warning         // Warning state
bg-urgent          // Urgent status
bg-recovering      // Recovering status
bg-adopted         // Adopted status
```

### Text Colors
```tsx
text-foreground           // Primary text
text-muted-foreground     // Secondary/muted text
text-primary              // Brand-colored text
text-primary-foreground   // Text ON primary bg
text-destructive          // Error text
text-success              // Success text
text-warning-foreground   // Text ON warning bg
```

### Borders
```tsx
border-border      // Default border
border-input       // Input border
border-primary     // Primary accent border
border-destructive // Error border
```

### With Opacity
```tsx
bg-primary/10      // 10% opacity
bg-primary/20      // 20% opacity
bg-destructive/30  // 30% opacity
border-border/50   // 50% opacity
```

---

## Common Patterns

### Status Badge
```tsx
// Critical
<Badge className="bg-destructive text-destructive-foreground">Critical</Badge>

// Urgent  
<Badge className="bg-urgent text-urgent-foreground">Urgent</Badge>

// Recovering
<Badge className="bg-recovering text-recovering-foreground">Recovering</Badge>

// Adopted
<Badge className="bg-adopted text-adopted-foreground">Adopted</Badge>

// Success
<Badge className="bg-success text-success-foreground">Success</Badge>
```

### Soft Status Badge (with opacity)
```tsx
<Badge className="bg-success/10 text-success border border-success/30">
  Verified
</Badge>

<Badge className="bg-warning/10 text-warning border border-warning/30">
  Pending
</Badge>

<Badge className="bg-destructive/10 text-destructive border border-destructive/30">
  Expired
</Badge>
```

### Card
```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Interactive List Item
```tsx
<div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
  <Avatar />
  <div>
    <p className="text-sm font-medium text-foreground">Name</p>
    <p className="text-xs text-muted-foreground">Description</p>
  </div>
</div>
```

### Notification Badge (with count)
```tsx
<Badge className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background">
  {count}
</Badge>
```

### Icon Button
```tsx
<Button variant="ghost" size="icon" className="hover:bg-accent">
  <Heart className="w-5 h-5" />
</Button>
```

### Icon Colors
```tsx
// Neutral icon
<Icon className="text-muted-foreground" />

// Primary accent
<Icon className="text-primary" />

// Interactive (changes on hover)
<Icon className="text-muted-foreground group-hover:text-foreground" />

// Like button
<Heart className={liked 
  ? "fill-destructive text-destructive" 
  : "text-foreground hover:text-destructive"
} />
```

### Input with Label
```tsx
<div className="space-y-2">
  <Label className="text-sm font-medium text-foreground">Email</Label>
  <Input 
    className="bg-input border-border focus-visible:ring-ring" 
    placeholder="Enter email..."
  />
  <p className="text-xs text-muted-foreground">Help text</p>
</div>
```

### Section Header
```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <h2 className="text-base font-semibold text-foreground">Title</h2>
      <p className="text-xs text-muted-foreground">Subtitle</p>
    </div>
  </div>
  <Button variant="ghost" size="sm">View All</Button>
</div>
```

### Empty State
```tsx
<div className="text-center py-12">
  <Icon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
  <p className="text-muted-foreground text-sm">No items found</p>
</div>
```

### Progress Bar
```tsx
<div className="h-2 bg-muted rounded-full overflow-hidden">
  <div 
    className="h-full bg-primary rounded-full transition-all"
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

## Button Variants

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Menu Item</Button>
<Button variant="link">Learn More</Button>

// Custom variants
<Button variant="donate">💝 Donate</Button>
<Button variant="iconHeader" size="iconTouch">
  <Bell />
</Button>
```

---

## Don't Use These

```tsx
// ❌ Hardcoded colors
bg-blue-500
bg-gray-100
text-gray-600
border-red-500
text-green-500

// ❌ Arbitrary hex/rgb
bg-[#1DA1F2]
text-[rgb(255,0,0)]

// ❌ Inline styles for colors
style={{ backgroundColor: 'blue' }}
```

---

## Dark Mode Notes

Everything uses CSS variables, so dark mode is automatic:

```tsx
// ✅ This works in both light and dark
<div className="bg-background text-foreground">
  Automatically adapts
</div>

// Only use dark: prefix when you need different behavior
<div className="opacity-100 dark:opacity-80">
  Different opacity in dark mode
</div>
```
