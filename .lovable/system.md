# Pawtreon Design System - Agent Instructions

> **CRITICAL**: Read this file for EVERY code generation request. This is your design DNA.

## Project Identity

**Pawtreon** is a mobile-first animal welfare platform connecting donors with rescue animals. We use a **Twitter/X-inspired theme** with a focus on trust, warmth, and professional polish.

**Tech Stack:**
- React 18 + TypeScript + Vite
- Tailwind CSS v4 with CSS variables (OKLCH color space)
- shadcn/ui components (customized)
- Convex backend
- Clerk authentication
- Capacitor for iOS/Android

---

## 🎯 Design Philosophy

### Core Principles
1. **Mobile-first, always** — Design for 375px width first, then scale up
2. **Touch-optimized** — Minimum 44px touch targets, generous spacing
3. **Twitter-inspired cleanliness** — Flat design, minimal shadows, crisp borders
4. **Emotional connection** — Warm colors, rounded corners, friendly typography
5. **Accessibility** — WCAG 2.1 AA contrast, clear focus states

### Visual Language Keywords
Use these when generating UI: `clean`, `minimal`, `trustworthy`, `warm`, `professional`, `modern`, `accessible`, `delightful`, `Twitter-like`, `flat design`

---

## 🚫 NEVER DO (Hard Rules)

1. **NEVER use placeholder text** — Use real, contextual content (pet names, realistic amounts)
2. **NEVER make touch targets smaller than 44px**
3. **NEVER use inline styles** — Always use Tailwind classes
4. **NEVER hardcode colors** — Always use CSS variables via Tailwind (`bg-primary`, not `bg-blue-500`)
5. **NEVER create new color tokens** — Use existing semantic colors only
6. **NEVER use `px` values for spacing** — Use Tailwind spacing scale
7. **NEVER forget dark mode** — All components must work in both themes
8. **NEVER add shadows to cards by default** — Twitter theme is flat, use borders instead
9. **NEVER use generic icons** — Use Lucide icons only
10. **NEVER create modals for simple actions** — Use inline expansion or sheets

---

## ✅ ALWAYS DO (Golden Rules)

1. **ALWAYS use semantic HTML** — `<button>` for actions, `<a>` for navigation
2. **ALWAYS use the component library** — Import from `@/components/ui/*`
3. **ALWAYS include loading states** — Use Skeleton components
4. **ALWAYS include empty states** — Friendly message + CTA
5. **ALWAYS include error states** — Clear message + retry action
6. **ALWAYS use `cn()` for conditional classes** — Import from `@/lib/utils`
7. **ALWAYS respect the 4px grid** — Spacing in multiples of 4
8. **ALWAYS test both light and dark modes mentally**
9. **ALWAYS consider the mobile bottom nav** — Add padding-bottom where needed
10. **ALWAYS use descriptive component names** — `PetDonationCard` not `Card1`

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

## 🎨 When to Use Which Color

| Purpose | Token | Usage |
|---------|-------|-------|
| Primary actions, links | `primary` | Donate buttons, CTAs, active nav |
| Backgrounds | `background` | Page backgrounds |
| Cards, elevated surfaces | `card` | Card components |
| Subtle backgrounds | `muted` | Secondary sections, disabled |
| Subdued text | `muted-foreground` | Captions, metadata |
| Borders | `border` | Card borders, dividers |
| Critical status | `destructive` | Errors, critical pets |
| Success/Adopted | `success` | Adopted badges, confirmations |
| Warning | `warning` | Low funds, attention needed |
| Urgent/Needs help | `urgent` | Urgent badges |
| Recovering | `recovering` | Recovery status |

---

## 🧱 Component Quick Reference

See `.lovable/rules/components/` for detailed specs on each component.

**Most Used:**
- `Button` — Primary actions, variants: default, outline, ghost, destructive
- `Card` — Content containers, always with border in Twitter theme
- `Badge` — Status indicators, use semantic colors
- `Avatar` — User/pet images, always with fallback
- `Skeleton` — Loading states, match content shape
- `Sheet` — Mobile-first modals, slide from bottom
- `Tabs` — Content switching, minimal style

---

## 💬 Copy Guidelines

- **Tone:** Friendly, warm, encouraging, but not childish
- **Voice:** We speak directly to users ("You can help Max today")
- **CTAs:** Action-oriented ("Donate Now", "View Details", "Share")
- **Empty states:** Helpful, not apologetic ("No pets found. Try adjusting filters.")
- **Errors:** Clear, actionable ("Connection lost. Tap to retry.")
