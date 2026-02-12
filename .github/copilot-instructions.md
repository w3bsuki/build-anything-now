# Copilot Instructions

See `AGENTS.md` in the repo root for full project context, agent roles, and workflow rules.

## Key Files
- `PRD.md` — Product vision + canonical feature checklist
- `DESIGN.md` — Architecture, stack, data model, patterns
- `RULES.md` — Trust/safety, UX guardrails, constraints
- `TASKS.md` — Current sprint (what we do NOW)
- `docs/design/ui-patterns-spec.md` — Canonical UI/UX patterns

## Stack
React 19 + Vite 7 + TypeScript, Convex (backend), Clerk (auth), Capacitor (mobile), shadcn/ui + Tailwind CSS v4, i18next, Stripe.

## Critical Rules
- Tailwind v4 config is in `src/index.css`, not `tailwind.config.*`
- shadcn/ui components are in `src/components/ui/`
- All Convex mutations require auth — use `getAuthUserId()` from `convex/lib/auth.ts`
- Never edit `convex/_generated/`
- Use `cn()` from `src/lib/utils.ts` for conditional classes
- Use `useTranslation()` for all user-facing strings
