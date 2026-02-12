# Pawtreon — AGENTS.md (Control Map)

> **Purpose:** Short, stable map for agents.  
> **Last updated:** 2026-02-12

This file is intentionally short. For deeper rules, use the nearest scoped file:
- Frontend: `src/AGENTS.md`
- Backend: `convex/AGENTS.md`
- Docs: `docs/AGENTS.md`

---

## Quick Commands

```bash
pnpm dev          # Vite dev server
npx convex dev    # Convex backend (run alongside Vite)
pnpm -s lint
pnpm -s typecheck
pnpm -s test
pnpm -s build
pnpm -s docs:check
```

## Canonical SSOT (Root Only)

These root docs are the control plane:
- `PRD.md` — product + canonical shipped-status checklist
- `TASKS.md` — current sprint execution
- `DESIGN.md` — architecture + implementation patterns
- `RULES.md` — trust/safety + UX/security invariants
- `DECISIONS.md` — durable decisions (append-only)
- `README.md` — setup/run/build onboarding
- `AGENTS.md` — agent workflow map

## Supporting Docs (Under `docs/`)

- `docs/readme.md` — docs IA map and navigation
- `docs/product-specs/` — feature/mission/strategy specs
- `docs/design-docs/` — systems + UI architecture specs
- `docs/exec-plans/` — required living plans for >2h/high-risk work
- `docs/generated/` — generated artifacts (`feature-index`, `taskset`, `quality-score`)
- `docs/references/` — non-SSOT ideation context (investor/partner/business)

## ExecPlan Rule (Non-Negotiable)

Create an ExecPlan before coding when:
1. Estimated work is > 2 hours, or
2. Scope is high-risk (money/auth/PII/schema/trust/safety/webhooks), or
3. Refactor spans multiple domains.

Use:
- `docs/exec-plans/PLANS.md`
- `docs/exec-plans/active/`
- `docs/exec-plans/completed/`

History/progress logs belong in ExecPlans only.

## Risk Gates

High-risk paths (minimum):
- `convex/schema.ts`
- `convex/http.ts`
- `convex/lib/auth.ts`
- `convex/donations.ts`

Merge expectations:
- Low/medium: CI green + self-review + agent review notes.
- High: ExecPlan + explicit review/approval.

## Non-Negotiable Invariants

- All Convex mutations require auth.
- No PII in public queries.
- Webhook signatures must be verified.
- Never edit `convex/_generated/`.
- Run relevant checks before merge.
