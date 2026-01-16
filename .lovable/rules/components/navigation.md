# Navigation & Layout Components

## Bottom Navigation (Mobile)

The primary navigation on mobile is a fixed bottom nav bar.

### Structure
```tsx
// Located in: src/components/CommunityBottomNav.tsx

<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
  <div className="flex items-center justify-around h-14 max-w-md mx-auto">
    <NavItem to="/" icon={Home} label="Home" />
    <NavItem to="/cases" icon={Heart} label="Cases" />
    <NavItem to="/clinics" icon={Hospital} label="Clinics" />
    <NavItem to="/community" icon={Users} label="Community" />
    <NavItem to="/profile" icon={User} label="Profile" />
  </div>
</nav>
```

### Nav Item Component
```tsx
function NavItem({ to, icon: Icon, label }: NavItemProps) {
  const isActive = location.pathname === to
  
  return (
    <Link 
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full",
        "text-muted-foreground transition-colors",
        isActive && "text-primary"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
```

## Page Header (Mobile)

### Standard Page Header
```tsx
// Located in: src/components/MobilePageHeader.tsx

<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
  <div className="flex items-center justify-between h-14 px-4">
    <Button variant="ghost" size="icon" onClick={goBack}>
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <h1 className="font-semibold text-base">{title}</h1>
    <div className="w-10" /> {/* Spacer for balance */}
  </div>
</header>
```

### Header with Actions
```tsx
<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
  <div className="flex items-center justify-between h-14 px-4">
    <Button variant="ghost" size="icon">
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <h1 className="font-semibold text-base">{title}</h1>
    <Button variant="ghost" size="icon">
      <Share2 className="h-5 w-5" />
    </Button>
  </div>
</header>
```

## Page Layout Template

```tsx
function PageTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MobilePageHeader title="Page Title" />
      
      {/* Main Content */}
      <main className="pb-20"> {/* Space for bottom nav */}
        <div className="px-4 py-4 space-y-4">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <CommunityBottomNav />
    </div>
  )
}
```

## Sheet (Mobile Modal)

For mobile-first modals, use Sheet sliding from bottom:

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Options</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="rounded-t-2xl">
    <SheetHeader>
      <SheetTitle>Options</SheetTitle>
    </SheetHeader>
    <div className="py-4 space-y-4">
      {/* Content */}
    </div>
  </SheetContent>
</Sheet>
```

## Tabs Navigation

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="all" className="w-full">
  <TabsList className="w-full justify-start gap-2 h-auto p-0 bg-transparent">
    <TabsTrigger 
      value="all"
      className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
    >
      All
    </TabsTrigger>
    <TabsTrigger 
      value="urgent"
      className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
    >
      Urgent
    </TabsTrigger>
  </TabsList>
  <TabsContent value="all" className="mt-4">
    {/* Content */}
  </TabsContent>
</Tabs>
```

## Scroll Areas

### Horizontal Scroll (Filter Pills)
```tsx
<div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
  <div className="flex gap-2 pb-2">
    {filters.map(filter => (
      <Button 
        key={filter.id}
        variant={active === filter.id ? "default" : "outline"}
        size="sm"
        className="shrink-0 rounded-full"
      >
        {filter.label}
      </Button>
    ))}
  </div>
</div>
```

### Vertical Scroll (List)
```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="h-[400px]">
  <div className="space-y-2 pr-4">
    {items.map(item => (
      <ItemCard key={item.id} {...item} />
    ))}
  </div>
</ScrollArea>
```

## Layout Spacing Rules

| Element | Spacing |
|---------|---------|
| Page padding | `px-4` |
| Section gap | `space-y-6` |
| Card gap in grid | `gap-4` |
| Bottom nav clearance | `pb-20` |
| Header height | `h-14` (56px) |
| Bottom nav height | `h-14` + safe area |
