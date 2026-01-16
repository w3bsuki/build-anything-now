# Input & Form Components Specification

## Imports
```tsx
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
```

## Input Field

### Basic Input
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email"
    className="h-11" // Touch-friendly height
  />
</div>
```

### Input with Icon
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input 
    placeholder="Search pets..." 
    className="pl-10 h-11"
  />
</div>
```

### Input with Error
```tsx
<div className="space-y-2">
  <Label htmlFor="amount" className="text-destructive">Amount</Label>
  <Input 
    id="amount" 
    className="border-destructive focus-visible:ring-destructive"
    aria-invalid="true"
  />
  <p className="text-sm text-destructive">Please enter a valid amount</p>
</div>
```

## Textarea

```tsx
<div className="space-y-2">
  <Label htmlFor="message">Your Message</Label>
  <Textarea 
    id="message"
    placeholder="Write your message here..."
    className="min-h-[120px] resize-none"
  />
  <p className="text-xs text-muted-foreground">Max 500 characters</p>
</div>
```

## Select

```tsx
<div className="space-y-2">
  <Label>Pet Type</Label>
  <Select>
    <SelectTrigger className="h-11">
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="dog">Dog</SelectItem>
      <SelectItem value="cat">Cat</SelectItem>
      <SelectItem value="other">Other</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## Checkbox

```tsx
<div className="flex items-start space-x-3">
  <Checkbox id="terms" className="mt-0.5" />
  <div className="space-y-1">
    <Label htmlFor="terms" className="text-sm font-medium leading-none">
      Accept terms and conditions
    </Label>
    <p className="text-sm text-muted-foreground">
      You agree to our Terms of Service and Privacy Policy.
    </p>
  </div>
</div>
```

## Radio Group

```tsx
<RadioGroup defaultValue="one-time" className="space-y-3">
  <div className="flex items-center space-x-3">
    <RadioGroupItem value="one-time" id="one-time" />
    <Label htmlFor="one-time">One-time donation</Label>
  </div>
  <div className="flex items-center space-x-3">
    <RadioGroupItem value="monthly" id="monthly" />
    <Label htmlFor="monthly">Monthly donation</Label>
  </div>
</RadioGroup>
```

## Switch

```tsx
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label htmlFor="notifications">Push notifications</Label>
    <p className="text-sm text-muted-foreground">
      Receive updates about your donations
    </p>
  </div>
  <Switch id="notifications" />
</div>
```

## React Hook Form Integration

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const schema = z.object({
  amount: z.number().min(50, "Minimum donation is ₱50"),
  message: z.string().optional(),
})

function DonationForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: 100, message: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Donation Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100" {...field} className="h-11" />
              </FormControl>
              <FormDescription>Enter amount in PHP</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Donate</Button>
      </form>
    </Form>
  )
}
```

## Mobile Form Best Practices

✅ **DO:**
```tsx
// Use h-11 for touch-friendly inputs
<Input className="h-11" />

// Stack labels above inputs on mobile
<div className="space-y-2">
  <Label>Field</Label>
  <Input />
</div>

// Use appropriate input types
<Input type="email" inputMode="email" />
<Input type="tel" inputMode="tel" />
<Input type="number" inputMode="numeric" />

// Add autocomplete attributes
<Input autoComplete="email" />
```

❌ **DON'T:**
```tsx
// Don't use tiny inputs
<Input className="h-8" />

// Don't use placeholder as label
<Input placeholder="Email" /> // Without Label

// Don't forget touch spacing
<div className="space-y-1"> // Too tight
```

## Form Layout Patterns

### Single Column (Mobile)
```tsx
<form className="space-y-4">
  <FormField />
  <FormField />
  <Button className="w-full">Submit</Button>
</form>
```

### Two Column (Desktop)
```tsx
<form className="space-y-4">
  <div className="grid gap-4 sm:grid-cols-2">
    <FormField />
    <FormField />
  </div>
  <Button className="w-full sm:w-auto">Submit</Button>
</form>
```
