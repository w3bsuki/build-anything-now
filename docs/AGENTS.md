# Pawtreon Docs Agent Contract (`docs/`)

> **Owner:** OPUS + Human  
> **Status:** final  
> **Last updated:** 2026-02-12  
> **Scope:** Applies to all files under `docs/`.

---

## 1) Authority and Precedence

1. Root governance stays canonical in `AGENTS.md`.
2. This file adds docs-specific rules for `docs/`.
3. Precedence:
   - System/developer/user instructions
   - Root `AGENTS.md`
   - This file (`docs/AGENTS.md`)

---

## 2) Canonical vs Supporting Truth

Canonical root docs are the only SSOT:
- `PRD.md`
- `TASKS.md`
- `DESIGN.md`
- `RULES.md`
- `DECISIONS.md`
- `AGENTS.md`
- `README.md`

Everything under `docs/` is supporting depth.

Rules:
1. Never create a second source of truth in `docs/`.
2. Shipped status (`[x]`, `[~]`, `[ ]`) is canonical in `PRD.md` only.
3. Long progress/history logs live in `docs/exec-plans/**` only.

---

## 3) Docs IA Ownership

Use these packs:

| Folder | Purpose |
|--------|---------|
| `docs/product-specs/` | Product strategy + feature + mission specs |
| `docs/design-docs/` | System architecture + UI/design architecture |
| `docs/exec-plans/` | Living execution plans (active/completed) |
| `docs/generated/` | Generated indices/artifacts |
| `docs/references/` | Non-SSOT ideation context |
| `docs/archive/` | Archived materials |

### References Boundary

`docs/references/**` is explicitly non-SSOT.

Every file under `docs/references/**` must include a warning block near the top:

`> **Non-SSOT:** This document is ideation/reference context and does not override root canonical docs.`

---

## 4) Required Header for Non-Generated Docs

Every non-generated doc must begin with:

```md
# [Title]

> **Owner:** [who maintains this]
> **Status:** draft | review | final
> **Last updated:** YYYY-MM-DD
> **PRD Ref:** [optional; required for product feature specs]
```

Status lifecycle:
- `draft`: work in progress
- `review`: under review
- `final`: stable and maintained

---

## 5) Decision-Complete Spec Template

All feature and mission specs must include these sections:
1. Purpose
2. User Stories
3. Functional Requirements
4. Data Model
5. API Surface
6. UI Surfaces
7. Edge Cases & Abuse
8. Non-Functional Requirements
9. Acceptance Criteria
10. Open Questions

---

## 6) Naming and Placement Rules

1. Use lowercase kebab-case names.
2. Suffixes:
   - `*-spec.md` — specs
   - `*-plan.md` — plans
   - `*-audit.md` — audits
3. Do not add planning docs to repo root.

Exceptions:
- `docs/exec-plans/PLANS.md`
- `docs/exec-plans/active/TEMPLATE-execplan.md`

---

## 7) Generated Files Policy

Treat generated files as derived outputs:
- `docs/generated/feature-index.md`
- `docs/generated/taskset.md`
- `docs/generated/quality-score.md`

Do not hand-edit generated outputs. Update generator scripts instead.

---

## 8) Post-Edit Checklist

After docs edits:
1. Confirm no contradiction with root canonical docs.
2. Regenerate artifacts:
   - `pnpm -s docs:index`
   - `pnpm -s docs:taskset`
   - `pnpm -s docs:quality`
3. Validate:
   - `pnpm -s docs:check`
4. Update `Last updated` where required.
