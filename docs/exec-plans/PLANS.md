# Pawtreon — ExecPlans (`docs/exec-plans/`)

> **Owner:** OPUS + Human  
> **Status:** final  
> **Last updated:** 2026-02-12  

---

## Purpose

An **ExecPlan** is a *living*, *decision-complete* execution plan that a fresh agent (or human) can follow to deliver a **working, observable** result in this repo.

ExecPlans exist to:
- Make multi-hour work restartable from repo state alone
- Keep “progress history” out of permanent specs while still capturing decisions, surprises, and outcomes
- Reduce human attention load by making intent, validation, and recovery explicit

---

## When an ExecPlan is required (non-negotiable)

Write an ExecPlan **before coding** when any of the following are true:
1. The work is estimated **> 2 hours**, **or**
2. The work is **high-risk** (money, auth, PII, schema, trust/safety, webhooks), **or**
3. The work is a broad refactor spanning multiple domains (frontend + backend + docs/tooling).

If none are true, you can proceed without an ExecPlan (but still follow CI + validation).

---

## Where ExecPlans live

- New plans: `docs/exec-plans/active/YYYY-MM-DD-short-slug-execplan.md`
- Completed plans: `docs/exec-plans/completed/YYYY-MM-DD-short-slug-execplan.md`

Rule: **History is allowed only in ExecPlans.**  
Do not add progress logs, decision journals, or “rounds” to PRD/spec/design/system docs.

---

## How to write an ExecPlan (requirements)

Your ExecPlan must be:
- **Self-contained:** a beginner to this repo can succeed with only the working tree + this file.
- **Outcome-focused:** it must define user-visible behavior or a demonstrable internal behavior (via tests/logs/CLI).
- **Decision-complete:** it must not ask the implementer to choose key approaches; choose and explain why.
- **Maintained while executing:** update `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` as you go.

---

## ExecPlan Template (copy this)

Create a new file under `docs/exec-plans/active/` and start with the template in:
- `docs/exec-plans/active/TEMPLATE-execplan.md`

Notes:
- Keep `Progress` granular and timestamped so it reflects the *actual* state.
- If the plan changes mid-flight, record the change as a decision and keep the plan self-contained.

---

## Repo-specific “Concrete Steps” defaults

Unless the ExecPlan explicitly says otherwise, include these commands in `## Concrete Steps` and `## Validation and Acceptance`:

- `pnpm -s lint`
- `pnpm -s typecheck`
- `pnpm -s test`
- `pnpm -s build`
- `pnpm -s docs:check` (when docs are touched)

If backend contracts or Convex APIs change, include:
- Run Convex dev locally for regenerated types: `npx convex dev`
- `pnpm -s convex:typecheck`

---

## High-risk addendum (required for high-risk plans)

If the ExecPlan touches **payments/auth/PII/schema/trust/webhooks**, add explicit sections covering:
- **Data changes** (tables/fields/indexes; migration/backfill plan if needed)
- **API surface changes** (new/changed Convex queries/mutations/actions; compatibility notes)
- **Abuse cases / trust risks / mitigations**
- **Idempotence and recovery** (how to retry safely; rollback strategy)

---

## GitHub enforcement (recommended)

This is configured in GitHub (outside the repo), but the intent is:
- Default: allow merges with **0 human approvals** when CI is green (low/medium risk).
- High-risk paths require explicit approval (Human/code owner).

Minimum high-risk paths:
- `convex/schema.ts`
- `convex/http.ts`
- `convex/lib/auth.ts`
- `convex/donations.ts`

Preferred approach:
- Use **GitHub rulesets** with path filters on `main` to require approvals for the high-risk paths, while leaving low-risk merges unblocked.
