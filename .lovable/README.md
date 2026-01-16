# Pawtreon Design System

Welcome to the Pawtreon `.lovable` design system. This folder contains comprehensive UI/UX rules and patterns that ensure consistent, mobile-first, high-quality design across all features.

## Structure

```
.lovable/
├── README.md           # This file
├── system.md           # Core agent instructions & design philosophy
└── rules/
    ├── components/     # Component specifications
    │   ├── button.md   # Button variants and usage
    │   ├── card.md     # Card patterns (Twitter flat style)
    │   ├── badge.md    # Status badges and labels
    │   ├── forms.md    # Inputs, selects, form patterns
    │   ├── navigation.md # Bottom nav, headers, tabs
    │   ├── dialog.md   # Modals, sheets, action sheets
    │   ├── avatar.md   # User/pet/partner avatars
    │   └── states.md   # Loading, empty, error states
    ├── patterns/       # Page-level patterns
    │   ├── page-layouts.md # Standard page structures
    │   └── lists.md    # List item patterns
    └── styling/        # Design tokens & utilities
        ├── colors.md   # Color system (OKLCH)
        ├── typography.md # Font sizes, weights
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
3. **Twitter Aesthetic** - Borders over shadows, clean whites, flat design
4. **Consistent Spacing** - px-4 page padding, gap-3/4 content spacing
5. **Accessible** - Proper contrast, semantic HTML, focus states

## Theme: Twitter-Inspired

We use a Twitter-inspired design language:
- **Clean borders** instead of heavy shadows
- **OKLCH color space** for perceptually uniform colors
- **Flat design** with subtle depth cues
- **System fonts** for optimal performance
- **Large border radius** (1.3rem default)

## Component Library

Built on **shadcn/ui** with custom variants:
- Custom button variants: `donate`, `iconHeader`
- Semantic status badges: urgent, recovering, adopted
- Glass morphism utilities
- Mobile-optimized patterns

## Adding Rules

When adding new design rules:
1. Create or update the appropriate `.md` file
2. Include clear code examples
3. Add DO/DON'T sections
4. Keep patterns consistent with existing docs
5. Test patterns on mobile viewport

## Version

Design System v1.0 - January 2025
Framework: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
