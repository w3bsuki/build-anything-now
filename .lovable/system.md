# Pawtreon Design System - Agent Instructions

> **CRITICAL**: Read this file for EVERY code generation request. This is your design DNA.

## Project Identity

**Pawtreon** is a mobile-first animal welfare platform connecting donors with rescue animals. We use a **Twitter Blue theme** with OKLCH colors - clean, flat design with signature blue primary.

**Tech Stack:**
- React 18 + TypeScript + Vite
- Tailwind CSS v4 with CSS variables (OKLCH color space)
- shadcn/ui components (customized)
- Convex backend
- Clerk authentication  
- Capacitor for iOS/Android
- Font: Open Sans (--font-sans)

---

## 🎯 Design Philosophy

### Core Principles
1. **Mobile-first, always** — Design for 375px width first, then scale up
2. **Touch-optimized** — Minimum 44px touch targets, generous spacing
3. **Twitter-inspired cleanliness** — Flat design, borders over shadows, crisp edges
4. **Emotional connection** — Rounded corners (1.3rem radius), friendly typography
5. **Accessibility** — WCAG 2.1 AA contrast, clear focus states

### Visual Language Keywords
Use these when generating UI: `clean`, `minimal`, `trustworthy`, `professional`, `modern`, `accessible`, `Twitter-like`, `flat design`, `borders not shadows`

---

## 🚫 NEVER DO (Hard Rules)

1. **NEVER use placeholder text** — Use real, contextual content (pet names, realistic amounts)
2. **NEVER make touch targets smaller than 44px**
3. **NEVER use inline styles** — Always use Tailwind classes
4. **NEVER hardcode colors** — ALWAYS use theme tokens (`bg-primary`, NEVER `bg-blue-500` or `bg-[#1DA1F2]`)
5. **NEVER use Tailwind color palette** — No `bg-gray-100`, `text-slate-600`, etc.
6. **NEVER create new color tokens** — Use existing semantic colors from index.css
7. **NEVER use `px` values for spacing** — Use Tailwind spacing scale
8. **NEVER forget dark mode** — All components must work in both themes
9. **NEVER use shadow-* for depth** — Theme has 0% shadow opacity, use borders instead
10. **NEVER use generic icons** — Use Lucide icons only
11. **NEVER create modals on mobile** — Use Sheet (bottom slide) instead of Dialog

---

## ✅ ALWAYS DO (Golden Rules)

1. **ALWAYS use semantic HTML** — `<button>` for actions, `<a>` for navigation
2. **ALWAYS use the component library** — Import from `@/components/ui/*`
3. **ALWAYS use theme color tokens** — `bg-primary`, `text-muted-foreground`, `border-border`
4. **ALWAYS include loading states** — Use Skeleton components
5. **ALWAYS include empty states** — Friendly message + CTA
6. **ALWAYS include error states** — Clear message + retry action
7. **ALWAYS use `cn()` for conditional classes** — Import from `@/lib/utils`
8. **ALWAYS respect the 4px grid** — Spacing in multiples of 4
9. **ALWAYS test both light and dark modes mentally**
10. **ALWAYS consider the mobile bottom nav** — Add pb-20 where needed
11. **ALWAYS use descriptive component names** — `PetDonationCard` not `Card1`

---

## 📁 File Organization

```
src/
├── components/
│   ├── ui/              # shadcn primitives (DO NOT EDIT unless necessary)
│   ├── homepage/        # Homepage-specific components
│   ├── auth/            # Authentication components
│   ├── skeletons/       # Loading skeleton components
│   └── [Feature]Card.tsx  # Feature cards at root level
├── pages/               # Route pages (flat structure)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
└── types/               # TypeScript type definitions
```

---

## 🔗 Import Aliases

```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
```

---

## 📱 Responsive Breakpoints

```
Mobile:  < 640px  (default, design here FIRST)
Tablet:  640px+   (sm:)
Desktop: 1024px+  (lg:)
```

Pattern: `className="mobile-style sm:tablet-style lg:desktop-style"`

---

## 🎨 Theme Color Tokens (From index.css)

| Purpose | Token | Example |
|---------|-------|---------|
| Primary actions, links | `primary` | `bg-primary`, `text-primary` |
| Page backgrounds | `background` | `bg-background` |
| Cards, surfaces | `card` | `bg-card` |
| Subtle backgrounds | `muted` | `bg-muted`, `hover:bg-muted` |
| Secondary text | `muted-foreground` | `text-muted-foreground` |
| Borders, dividers | `border` | `border-border`, `border-border/50` |
| Danger/errors | `destructive` | `bg-destructive`, `text-destructive` |
| Pet: Urgent | `urgent` | `bg-urgent text-urgent-foreground` |
| Pet: Recovering | `recovering` | `bg-recovering text-recovering-foreground` |
| Pet: Adopted | `adopted` | `bg-adopted text-adopted-foreground` |
| Success states | `success` | `bg-success text-success-foreground` |
| Warnings | `warning` | `bg-warning text-warning-foreground` |

### Pre-defined Badge Classes (in index.css)
```tsx
<span className="badge-urgent">Urgent</span>
<span className="badge-critical">Critical</span>
<span className="badge-recovering">Recovering</span>
<span className="badge-adopted">Adopted</span>
```

### Glass Utilities (in index.css)
```tsx
<div className="glass-ultra">{/* 70% white, 20px blur */}</div>
<div className="glass-subtle">{/* 50% white, 12px blur */}</div>
<nav className="nav-shadow">{/* floating nav shadow */}</nav>
```

---

## 🧱 Component Quick Reference

See `.lovable/rules/components/` for detailed specs on each component.

**Most Used:**
- `Button` — variants: default, secondary, outline, ghost, destructive, donate, iconHeader
- `Card` — Content containers, use `border border-border` (no shadows)
- `Badge` — Status indicators with semantic colors
- `Avatar` — User/pet images, always with AvatarFallback
- `Skeleton` — Loading states, match content shape
- `Sheet` — Mobile modals (use instead of Dialog on mobile)
- `Tabs` — Content switching, minimal style

---

## 💬 Copy Guidelines

- **Tone:** Friendly, warm, encouraging, but not childish
- **Voice:** We speak directly to users ("You can help Max today")
- **CTAs:** Action-oriented ("Donate Now", "View Details", "Share")
- **Empty states:** Helpful, not apologetic ("No pets found. Try adjusting filters.")
- **Errors:** Clear, actionable ("Connection lost. Tap to retry.")
