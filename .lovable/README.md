# Pawtreon Design System

Welcome to the Pawtreon `.lovable` design system. This folder contains comprehensive UI/UX rules and patterns that ensure consistent, mobile-first, high-quality design across all features.

## Structure

```
.lovable/
├── README.md           # This file
├── system.md           # Core agent instructions & design philosophy
└── rules/
    ├── components/     # Component specifications
    │   ├── button.md   # Button variants (default, secondary, outline, ghost, destructive, donate, iconHeader)
    │   ├── card.md     # Card patterns (borders, not shadows - Twitter flat style)
    │   ├── badge.md    # Status badges (urgent, recovering, adopted)
    │   ├── forms.md    # Inputs, selects, form patterns
    │   ├── navigation.md # Bottom nav, headers, tabs
    │   ├── dialog.md   # Modals (desktop), sheets (mobile)
    │   ├── avatar.md   # User/pet/partner avatars
    │   └── states.md   # Loading, empty, error states
    ├── patterns/       # Page-level patterns
    │   ├── page-layouts.md # Standard page structures
    │   └── lists.md    # List item patterns
    └── styling/        # Design tokens & utilities
        ├── colors.md   # Color system (OKLCH tokens)
        ├── typography.md # Open Sans, font sizes, weights
        └── spacing.md  # Spacing scale, touch targets
```

## Quick Start

### For AI Agents
Include the content of `system.md` and relevant component/pattern rules when generating or modifying UI code.

### For Developers
Reference these documents when:
- Creating new components
- Building new features
- Reviewing pull requests
- Ensuring design consistency

## Core Principles

1. **Mobile-First** - Design for 375px width, enhance for larger
2. **Touch-Optimized** - 44px minimum touch targets
3. **Twitter Blue Aesthetic** - Borders over shadows, flat design, OKLCH colors
4. **No Hardcoded Colors** - ALWAYS use theme tokens (`bg-primary`, never `bg-blue-500`)
5. **Accessible** - Proper contrast, semantic HTML, focus states

## Theme: Twitter Blue

We use a Twitter-inspired design language with OKLCH colors:
- **Primary:** `oklch(0.6723 0.1606 244.9955)` - Twitter Blue
- **Borders over shadows** - Shadow tokens are 0% opacity
- **Flat design** with subtle depth via borders
- **Font:** Open Sans (`--font-sans`)
- **Large border radius:** `--radius: 1.3rem`

## Color System (MUST USE TOKENS)

```tsx
// ✅ CORRECT
<div className="bg-primary text-primary-foreground" />
<div className="bg-background text-foreground" />
<div className="border-border bg-card" />
<Badge className="bg-urgent text-urgent-foreground" />

// ❌ WRONG - Never do this
<div className="bg-blue-500" />
<div className="bg-[#1DA1F2]" />
<div className="text-gray-600" />
```

## Pre-defined Utilities (From index.css)

```tsx
// Status badge classes
<span className="badge-urgent">Urgent</span>
<span className="badge-critical">Critical</span>
<span className="badge-recovering">Recovering</span>
<span className="badge-adopted">Adopted</span>

// Glass morphism
<div className="glass-ultra">{content}</div>
<div className="glass-subtle">{content}</div>

// Navigation shadow
<nav className="nav-shadow">{content}</nav>

// Scroll utilities
<div className="scrollbar-hide scroll-touch">{content}</div>
```

## Component Library

Built on **shadcn/ui** with custom variants:
- Custom button variants: `donate`, `iconHeader`
- Semantic status tokens: `urgent`, `recovering`, `adopted`, `success`, `warning`
- Mobile-optimized patterns

## Adding Rules

When adding new design rules:
1. Create or update the appropriate `.md` file
2. Include clear code examples using THEME TOKENS ONLY
3. Add DO/DON'T sections
4. Keep patterns consistent with existing docs
5. Test patterns on mobile viewport

## Version

Design System v1.0 - January 2025
Framework: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
