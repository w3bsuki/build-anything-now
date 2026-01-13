# 📐 Component & Code Standards Guide - PawsSafe

> **Purpose:** Establish consistent patterns for UI components and codebase quality  
> **Last Updated:** January 13, 2026

---

## 🎨 Design System Tokens

### Color Palette

```css
/* Primary Brand Colors */
--primary: oklch(0.65 0.18 145);      /* Green - Main brand */
--primary-foreground: white;

/* Status Colors */
--destructive: oklch(0.55 0.2 25);    /* Red - Errors, urgent */
--warning: oklch(0.75 0.15 85);       /* Orange - Warnings */
--success: oklch(0.65 0.18 145);      /* Green - Success */
--info: oklch(0.65 0.15 250);         /* Blue - Information */

/* Case Status Colors */
--status-critical: oklch(0.55 0.2 25);
--status-urgent: oklch(0.75 0.18 50);
--status-recovering: oklch(0.65 0.18 145);
--status-adopted: oklch(0.65 0.15 250);

/* Semantic Colors */
--background: oklch(0.99 0 0);
--foreground: oklch(0.15 0 0);
--card: oklch(1 0 0);
--muted: oklch(0.95 0 0);
--muted-foreground: oklch(0.45 0 0);
--border: oklch(0.9 0 0);
```

### Typography

```css
/* Font Family */
--font-sans: 'Montserrat', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px - captions, badges */
--text-sm: 0.875rem;    /* 14px - body small */
--text-base: 1rem;      /* 16px - body */
--text-lg: 1.125rem;    /* 18px - body large */
--text-xl: 1.25rem;     /* 20px - heading 4 */
--text-2xl: 1.5rem;     /* 24px - heading 3 */
--text-3xl: 1.875rem;   /* 30px - heading 2 */
--text-4xl: 2.25rem;    /* 36px - heading 1 */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### Spacing Scale

```css
/* Use multiples of 4px */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px - base unit */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-sm: 0.375rem;  /* 6px - buttons, inputs */
--radius-md: 0.5rem;    /* 8px - cards */
--radius-lg: 0.75rem;   /* 12px - modals */
--radius-xl: 1rem;      /* 16px - large containers */
--radius-full: 9999px;  /* pills, avatars */
```

### Shadows

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

---

## 🧩 Component Patterns

### File Structure

```
src/components/
├── ui/                    # shadcn/ui primitives (don't modify)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── skeletons/            # Loading skeletons
│   ├── CaseCardSkeleton.tsx
│   └── ...
├── forms/                # Form components
│   ├── DonationForm.tsx
│   └── ...
├── layouts/              # Layout components
│   ├── PageHeader.tsx
│   └── ...
└── [FeatureName].tsx     # Feature components
```

### Component Template

```tsx
// ComponentName.tsx
import { type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

// 1. Interface definition
interface ComponentNameProps {
  /** Required prop description */
  requiredProp: string;
  /** Optional prop with default */
  optionalProp?: boolean;
  /** Event handler */
  onAction?: () => void;
  /** Additional class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

// 2. Component implementation with named export
export function ComponentName({
  requiredProp,
  optionalProp = false,
  onAction,
  className,
  children,
}: ComponentNameProps) {
  const { t } = useTranslation();
  
  // 3. Hooks at top
  // 4. Derived state
  // 5. Event handlers
  const handleClick = () => {
    onAction?.();
  };
  
  // 6. Render
  return (
    <div 
      className={cn(
        'base-classes',
        optionalProp && 'conditional-classes',
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

// 7. Display name for devtools (optional)
ComponentName.displayName = 'ComponentName';
```

### Card Component Pattern

```tsx
// FeatureCard.tsx
interface FeatureCardProps {
  data: FeatureData;
  variant?: 'default' | 'compact';
  onAction?: (id: string) => void;
}

export function FeatureCard({ data, variant = 'default', onAction }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Image section */}
      <div className="relative aspect-video">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Overlay badges */}
        <StatusBadge status={data.status} className="absolute top-3 left-3" />
      </div>
      
      {/* Content section - consistent padding */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-base line-clamp-2">{data.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {data.description}
        </p>
        
        {/* Progress or stats */}
        {data.progress && (
          <ProgressBar value={data.progress} className="mt-3" />
        )}
        
        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button onClick={() => onAction?.(data.id)}>
            {t('common.action')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Skeleton Component Pattern

```tsx
// FeatureCardSkeleton.tsx
export function FeatureCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video bg-muted" />
      
      <CardContent className="p-4">
        {/* Title placeholder */}
        <div className="h-5 bg-muted rounded w-3/4" />
        
        {/* Description placeholder */}
        <div className="h-4 bg-muted rounded w-full mt-2" />
        <div className="h-4 bg-muted rounded w-2/3 mt-1" />
        
        {/* Progress placeholder */}
        <div className="h-2 bg-muted rounded w-full mt-4" />
        
        {/* Button placeholder */}
        <div className="h-10 bg-muted rounded w-full mt-4" />
      </CardContent>
    </Card>
  );
}
```

### Form Component Pattern

```tsx
// FeatureForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  amount: z.number().positive('Amount must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

interface FeatureFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  defaultValues?: Partial<FormValues>;
  isLoading?: boolean;
}

export function FeatureForm({ onSubmit, defaultValues, isLoading }: FeatureFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      ...defaultValues,
    },
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      toast({ title: t('toast.success') });
    } catch (error) {
      toast({ variant: 'destructive', title: t('toast.error') });
    }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.title')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('form.titlePlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* More fields... */}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : t('form.submit')}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 📱 Responsive Design Patterns

### Breakpoints

```css
/* Mobile first approach */
/* Default: mobile (< 640px) */
/* sm: 640px+ (large phones) */
/* md: 768px+ (tablets) */
/* lg: 1024px+ (laptops) */
/* xl: 1280px+ (desktops) */
```

### Grid Patterns

```tsx
// Card Grid - Responsive columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// List to Grid transition
<div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Mobile Navigation Pattern

```tsx
// Show/hide based on screen size
<nav className="fixed bottom-0 left-0 right-0 md:hidden">
  {/* Mobile bottom navigation */}
</nav>

<nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64">
  {/* Desktop sidebar */}
</nav>
```

### Touch Target Sizes

```tsx
// Minimum 44x44px touch targets
<Button className="min-h-[44px] min-w-[44px]">
  <Icon />
</Button>

// Icon buttons with proper sizing
<button className="w-11 h-11 flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>
```

---

## ♿ Accessibility Standards

### ARIA Patterns

```tsx
// Interactive lists
<ul role="list" aria-label="Available cases">
  {cases.map(caseItem => (
    <li key={caseItem.id} role="listitem">
      <CaseCard data={caseItem} />
    </li>
  ))}
</ul>

// Filter pills (radio group pattern)
<div role="radiogroup" aria-label="Filter by status">
  {options.map(option => (
    <button
      key={option.id}
      role="radio"
      aria-checked={selected === option.id}
      onClick={() => setSelected(option.id)}
    >
      {option.label}
    </button>
  ))}
</div>

// Loading states
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Skeleton /> : <Content />}
</div>

// Image carousel
<div 
  role="region" 
  aria-roledescription="carousel"
  aria-label="Animal photos"
>
  <div role="group" aria-roledescription="slide" aria-label="1 of 5">
    <img src={...} alt="Description of image" />
  </div>
</div>
```

### Focus Management

```tsx
// Focus trap for modals
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Modal({ isOpen, onClose, children }) {
  const ref = useFocusTrap(isOpen);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  return (
    <div ref={ref} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

### Skip Links

```tsx
// Add at top of App.tsx
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded"
>
  Skip to main content
</a>

// Mark main content
<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>
```

### Color Contrast

- Text on background: minimum 4.5:1 ratio
- Large text (18px+ or 14px+ bold): minimum 3:1 ratio
- Interactive elements: minimum 3:1 against adjacent colors

---

## 🌍 Internationalization Patterns

### Translation Key Structure

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "Something went wrong"
  },
  "navigation": {
    "home": "Home",
    "campaigns": "Campaigns",
    "clinics": "Clinics",
    "profile": "Profile"
  },
  "status": {
    "critical": "Critical",
    "urgent": "Urgent",
    "recovering": "Recovering",
    "adopted": "Adopted"
  },
  "cases": {
    "title": "Cases",
    "createNew": "Report Animal",
    "noResults": "No cases found",
    "donate": "Donate Now"
  },
  "forms": {
    "required": "This field is required",
    "minLength": "Must be at least {{min}} characters",
    "invalidEmail": "Please enter a valid email"
  },
  "toast": {
    "success": "Success!",
    "error": "Error",
    "saved": "Changes saved"
  }
}
```

### Component Usage

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* Simple key */}
      <h1>{t('cases.title')}</h1>
      
      {/* With interpolation */}
      <p>{t('forms.minLength', { min: 10 })}</p>
      
      {/* With count (pluralization) */}
      <span>{t('cases.count', { count: items.length })}</span>
      
      {/* With formatting */}
      <span>{t('donation.amount', { amount: formatCurrency(100) })}</span>
    </div>
  );
}
```

### Currency & Date Formatting

```tsx
// src/lib/formatters.ts
export function formatCurrency(amount: number, currency = 'BGN', locale = 'bg-BG') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | number, locale = 'bg-BG') {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | number, locale = 'bg-BG') {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return rtf.format(0, 'day'); // "today"
  if (days === 1) return rtf.format(-1, 'day'); // "yesterday"
  if (days < 7) return rtf.format(-days, 'day');
  if (days < 30) return rtf.format(-Math.floor(days / 7), 'week');
  return rtf.format(-Math.floor(days / 30), 'month');
}
```

---

## 🔌 Data Fetching Patterns

### Convex Query Pattern

```tsx
// Using Convex with React Query-style patterns
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function CasesList() {
  const cases = useQuery(api.cases.list, { status: 'active' });
  
  if (cases === undefined) {
    return <CasesListSkeleton />;
  }
  
  if (cases.length === 0) {
    return <EmptyState title="No cases found" />;
  }
  
  return (
    <div className="grid gap-4">
      {cases.map(caseItem => (
        <CaseCard key={caseItem._id} data={caseItem} />
      ))}
    </div>
  );
}
```

### Mutation Pattern

```tsx
function DonateButton({ caseId }: { caseId: Id<'cases'> }) {
  const donate = useMutation(api.donations.create);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDonate = async () => {
    setIsLoading(true);
    try {
      await donate({ caseId, amount: 50, currency: 'BGN' });
      toast({ title: t('toast.donationSuccess') });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: t('toast.error'),
        description: error instanceof Error ? error.message : undefined 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button onClick={handleDonate} disabled={isLoading}>
      {isLoading ? <Loader2 className="animate-spin" /> : t('actions.donate')}
    </Button>
  );
}
```

### Error Boundary Pattern

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to Sentry or other error tracking
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 🧪 Testing Standards

### Component Test Pattern

```tsx
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName requiredProp="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleAction = vi.fn();
    render(<ComponentName requiredProp="test" onAction={handleAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
  
  it('applies conditional classes', () => {
    const { container } = render(
      <ComponentName requiredProp="test" optionalProp />
    );
    expect(container.firstChild).toHaveClass('conditional-classes');
  });
});
```

### Accessibility Test Pattern

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<ComponentName requiredProp="test" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 📝 Code Quality Rules

### ESLint Rules (Add to eslint.config.js)

```javascript
// Recommended rules to add
rules: {
  // Accessibility
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/click-events-have-key-events': 'warn',
  'jsx-a11y/no-noninteractive-element-interactions': 'warn',
  
  // React
  'react/jsx-no-target-blank': 'error',
  'react/jsx-key': 'error',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
  
  // TypeScript
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/explicit-function-return-type': 'off',
  
  // Import order
  'import/order': ['warn', {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    'newlines-between': 'always',
  }],
}
```

### Import Order

```tsx
// 1. React and framework imports
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. External libraries
import { useQuery } from 'convex/react';
import { useTranslation } from 'react-i18next';

// 3. Internal imports (absolute paths)
import { cn } from '@/lib/utils';
import { api } from '@/convex/_generated/api';

// 4. Components
import { Button } from '@/components/ui/button';
import { CaseCard } from '@/components/CaseCard';

// 5. Types
import type { Case } from '@/types';

// 6. Assets/styles (if any)
import './ComponentName.css';
```

---

## ✅ Component Checklist

Before submitting a new component, verify:

### Functionality
- [ ] Component renders without errors
- [ ] Props are properly typed
- [ ] Events are handled correctly
- [ ] Edge cases are handled (empty, loading, error)

### Accessibility
- [ ] Has proper ARIA attributes
- [ ] Keyboard navigable
- [ ] Focus indicators visible
- [ ] Color contrast passes
- [ ] Screen reader tested

### Internationalization
- [ ] All text uses translation keys
- [ ] No hardcoded strings
- [ ] Dates/currencies formatted

### Responsiveness
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Touch targets are 44px+

### Code Quality
- [ ] Follows naming conventions
- [ ] Properly typed with TypeScript
- [ ] No ESLint warnings
- [ ] Has JSDoc comments for complex logic

---

*Document Version: 1.0*  
*Last Updated: January 13, 2026*
