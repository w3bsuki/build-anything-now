# Dialog & Sheet Components

## Import
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
```

## Mobile-First Rule

**ALWAYS use Sheet on mobile, Dialog on desktop:**
```tsx
import { useIsMobile } from "@/hooks/use-mobile"

function ResponsiveModal({ children, ...props }) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <Sheet {...props}>{children}</Sheet>
  }
  return <Dialog {...props}>{children}</Dialog>
}
```

Or use the pattern:
```tsx
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"

// For mobile: bottom sheet slides up
// For desktop: centered dialog
```

## Basic Dialog (Desktop)
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Form content */}
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Basic Sheet (Mobile)
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Open Menu</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="rounded-t-2xl">
    <SheetHeader className="text-left">
      <SheetTitle>Options</SheetTitle>
      <SheetDescription>
        Choose an action below.
      </SheetDescription>
    </SheetHeader>
    <div className="py-4">
      {/* Content */}
    </div>
  </SheetContent>
</Sheet>
```

## Mobile Sheet Patterns

### Action Sheet
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="rounded-t-2xl">
    {/* Handle bar */}
    <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
    
    <div className="space-y-2">
      <Button variant="ghost" className="w-full justify-start h-12">
        <Edit className="mr-3 h-5 w-5" />
        Edit
      </Button>
      <Button variant="ghost" className="w-full justify-start h-12">
        <Share className="mr-3 h-5 w-5" />
        Share
      </Button>
      <Button variant="ghost" className="w-full justify-start h-12 text-destructive hover:text-destructive">
        <Trash className="mr-3 h-5 w-5" />
        Delete
      </Button>
    </div>
    
    <div className="mt-4 pt-4 border-t">
      <Button variant="outline" className="w-full h-12">
        Cancel
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

### Filter Sheet
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="sm">
      <Filter className="mr-2 h-4 w-4" />
      Filters
    </Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
    <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
    
    <SheetHeader className="text-left">
      <SheetTitle>Filter Results</SheetTitle>
    </SheetHeader>
    
    <ScrollArea className="h-[50vh] pr-4">
      <div className="space-y-6 py-4">
        {/* Filter sections */}
      </div>
    </ScrollArea>
    
    <div className="flex gap-3 pt-4 border-t">
      <Button variant="outline" className="flex-1 h-12">
        Reset
      </Button>
      <Button className="flex-1 h-12">
        Apply
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

### Form Sheet
```tsx
<Sheet>
  <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh]">
    <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
    
    <SheetHeader className="text-left">
      <SheetTitle>Add Payment Method</SheetTitle>
      <SheetDescription>
        Enter your card details.
      </SheetDescription>
    </SheetHeader>
    
    <form className="py-4 space-y-4">
      {/* Form fields */}
    </form>
    
    <div className="pt-4 border-t safe-bottom">
      <Button type="submit" className="w-full h-12">
        Add Card
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

## Confirmation Dialog
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete 
        your donation history.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Success Modal
```tsx
<Dialog open={showSuccess} onOpenChange={setShowSuccess}>
  <DialogContent className="text-center">
    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
      <CheckCircle className="h-8 w-8 text-success" />
    </div>
    <DialogHeader>
      <DialogTitle className="text-center">Donation Successful!</DialogTitle>
      <DialogDescription className="text-center">
        Thank you for helping Max. Your $25 donation will make a difference.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="sm:justify-center">
      <Button onClick={() => setShowSuccess(false)}>
        Continue
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Sheet Handle Bar
Always include for bottom sheets:
```tsx
<div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
```

## Dialog Sizing
```tsx
// Small - confirmations
<DialogContent className="sm:max-w-[360px]" />

// Default - forms
<DialogContent className="sm:max-w-[425px]" />

// Medium - larger forms
<DialogContent className="sm:max-w-[500px]" />

// Large - complex content
<DialogContent className="sm:max-w-[600px]" />

// Full screen on mobile
<DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)]" />
```

## Sheet Sides
```tsx
// Bottom sheet (mobile default) - most common
<SheetContent side="bottom" className="rounded-t-2xl" />

// Right sheet (desktop nav)
<SheetContent side="right" />

// Left sheet (mobile nav)
<SheetContent side="left" />

// Full height bottom sheet
<SheetContent side="bottom" className="rounded-t-2xl h-[90vh]" />
```

## Best Practices

✅ **DO:**
```tsx
// Use sheets on mobile
const isMobile = useIsMobile()
// Then conditionally render Sheet or Dialog

// Add handle bar for bottom sheets
<div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />

// Round top corners on bottom sheet
<SheetContent className="rounded-t-2xl" />

// Safe area padding
<div className="safe-bottom">{/* bottom content */}</div>

// Touch-friendly buttons in sheets
<Button className="w-full h-12">Action</Button>
```

❌ **DON'T:**
```tsx
// Don't use Dialog on mobile
// It's not thumb-friendly

// Don't skip handle bars on bottom sheets
// Users expect drag-to-dismiss visual cue

// Don't make sheets too tall
// Max 85-90vh so user sees they can dismiss

// Don't use tiny buttons in sheets
<Button className="h-8">Submit</Button> // Too small for mobile
```
