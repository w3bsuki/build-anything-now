# Pawtreon Documentation System

> **Owner:** OPUS + Human  
> **Status:** final  
> **Last updated:** 2026-02-10

## Purpose

This is the supporting docs hub for Pawtreon. Root canonical docs (`PRD.md`, `TASKS.md`, `DESIGN.md`, `RULES.md`, `DECISIONS.md`, `AGENTS.md`, `README.md`) remain the control plane.

Daily SSOT workflow uses 5 docs:
1. `PRD.md` — canonical feature status (`[x]`, `[~]`, `[ ]`)
2. `TASKS.md` — current sprint execution
3. `DESIGN.md` — architecture + implementation patterns
4. `RULES.md` — trust/safety constraints
5. `DECISIONS.md` — durable decisions and rationale

Everything under `docs/` adds detail, never conflicting truth.

## Structure

```
docs/
├── readme.md                    ← You are here
├── AGENTS.md                    ← Docs-specific agent rules
├── product/                     ← Product-level docs
│   ├── roadmap.md               ← Phased delivery timeline
│   └── master-plan.md           ← Product thesis + north star
├── features/                    ← Per-feature specs (auto-indexed)
│   ├── INDEX.md                 ← Feature registry (auto-generated)
│   ├── activity-feed-spec.md
│   ├── home-feed-spec.md
│   ├── pet-services-spec.md
│   ├── social-spec.md
│   ├── cases-spec.md
│   ├── donations-spec.md
│   ├── profiles-spec.md
│   ├── community-spec.md
│   ├── campaigns-spec.md
│   ├── clinics-spec.md
│   ├── volunteers-spec.md
│   ├── adoption-spec.md
│   ├── onboarding-spec.md
│   ├── notifications-spec.md
│   ├── messaging-spec.md
│   ├── search-discovery-spec.md
│   ├── achievements-spec.md
│   └── admin-moderation-spec.md
├── systems/                     ← Architecture & infrastructure (6 specs)
│   ├── data-model-spec.md
│   ├── api-reference.md
│   ├── auth-security-spec.md
│   ├── deployment-spec.md
│   ├── testing-spec.md
│   └── analytics-spec.md
├── design/                      ← UI/UX & theming (4 specs)
│   ├── ui-patterns-spec.md      ← Canonical design system
│   ├── theming-tokens-spec.md
│   ├── mobile-native-spec.md
│   └── i18n-spec.md
├── business/                    ← Revenue, partnerships, growth
│   ├── monetization-spec.md
│   ├── partner-types-spec.md
│   └── growth-spec.md
├── missions/                    ← Platform initiative specs
│   ├── drone-program-spec.md
│   ├── safehouse-spec.md
│   ├── marketplace-spec.md
│   └── pet-insurance-spec.md
├── partners/                    ← Operational partner docs
│   ├── bulgaria-clinic-seeding-plan.md
│   ├── claim-verification-ops.md
│   └── outreach-pipeline.md
└── investor/                    ← Pitch materials (12 files)
    └── README.md                ← Investor hub index
```

## Spec Template

Every feature spec follows the canonical 10-section structure defined in `docs/AGENTS.md` §5:
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

## Progress Tracking

- Feature implementation status comes from `PRD.md` only.
- `docs/features/INDEX.md` is generated and should summarize PRD progress, not replace PRD.
- Spec `Status` (`draft/review/final`) means document maturity, not shipped feature state.

## Validation Commands

```bash
pnpm docs:index   # regenerate docs/features/INDEX.md
pnpm docs:check   # validate doc headers/template + links
```

## Rules

1. **One spec per feature domain** — don't split a feature across multiple files
2. **Specs reference schema.ts** — data model lives in code, specs describe intent
3. **No duplicating PRD.md** — specs add depth, root PRD has the canonical checklist
4. **Status lifecycle** — `draft → review → final`. `final` = locked for content changes
5. **Decisions go to DECISIONS.md** — specs describe what, decisions explain why
6. **Follow docs/AGENTS.md** — headers, naming, placement rules
