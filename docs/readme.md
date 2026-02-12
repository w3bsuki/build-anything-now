# Pawtreon Documentation Hub

> **Owner:** OPUS + Human  
> **Status:** final  
> **Last updated:** 2026-02-12

## Purpose

This directory is the supporting documentation layer for Pawtreon.

Root canonical SSOT remains:
- `PRD.md`
- `TASKS.md`
- `DESIGN.md`
- `RULES.md`
- `DECISIONS.md`
- `AGENTS.md`
- `README.md`

`docs/` provides depth, not competing truth.

---

## Information Architecture

```text
docs/
  AGENTS.md
  readme.md
  design-docs/
    INDEX.md
    systems/
    ui/
  product-specs/
    INDEX.md
    strategy/
    features/
    missions/
  exec-plans/
    PLANS.md
    active/
    completed/
  generated/
    feature-index.md
    taskset.md
    quality-score.md
  references/
    business-ideation/
    partner-ideation/
    investor-ideation/
  archive/
    2026-02-openai-rewrite/
```

---

## What Lives Where

- `docs/product-specs/`
  - `strategy/`: product thesis and future goals
  - `features/`: per-feature decision-complete specs
  - `missions/`: long-range mission specs
- `docs/design-docs/`
  - `systems/`: architecture, API, auth, deployment, testing, analytics
  - `ui/`: UI patterns, tokens, mobile-native and i18n design specs
- `docs/exec-plans/`
  - Living plans for >2h and high-risk work
- `docs/generated/`
  - Generated snapshots and quality artifacts
- `docs/references/`
  - Non-SSOT context docs (business/partner/investor ideation)
- `docs/archive/`
  - Archived historical docs

---

## Core Rules

1. Root docs are the only SSOT.
2. `PRD.md` owns shipped status.
3. Progress logs belong in ExecPlans, not specs.
4. `docs/references/**` is non-SSOT and for context only.
5. Feature and mission specs must follow the 10-section template in `docs/AGENTS.md`.

---

## Commands

```bash
pnpm -s docs:index         # regenerate docs/generated/feature-index.md
pnpm -s docs:taskset       # regenerate docs/generated/taskset.md
pnpm -s docs:quality       # regenerate docs/generated/quality-score.md
pnpm -s docs:check         # validate docs, generated outputs, and links
```

---

## Key Entrypoints

- Docs contract: `docs/AGENTS.md`
- Product spec index: `docs/product-specs/INDEX.md`
- Design doc index: `docs/design-docs/INDEX.md`
- Generated feature index: `docs/generated/feature-index.md`
- ExecPlan system: `docs/exec-plans/PLANS.md`
