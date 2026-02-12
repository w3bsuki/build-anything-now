# Docs Overhaul — Execution Report

> **Owner:** OPUS + Codex + Human
> **Status:** final
> **Last updated:** 2026-02-10

---

> **Archived:** This is a completed ExecPlan-style execution report (kept for historical context).

## Summary

Six-phase documentation overhaul executed on 2026-02-10. Transformed 14 draft specs into 18 fully-structured specifications with bidirectional PRD traceability, auto-generated feature registry, EARS safety requirements on high-risk surfaces, and acceptance criteria on every spec. Zero broken links, 100% header compliance, single canonical PRD.

Research inputs: Kiro (EARS notation, steering files), OpenSpec (artifact-guided workflow), GitHub Spec Kit (constitution→implement pattern). Codex review provided 9 scoping constraints — all adopted.

---

## What Changed

### Phase 1 — Consolidate PRD
- Merged duplicate `PRD.md` into root `PRD.md` (richer content preserved)
- Adopted 3-state checklist: `[x]` shipped, `[~]` partial, `[ ]` not started
- Deleted `PRD.md` (duplicate)

### Phase 2 — Heal Docs
- Fixed all broken `docs-v2/` cross-references (5 files: master-plan, 3 investor docs, PRD)
- Added standard headers to 14 files missing them (investor docs batch, docs/AGENTS.md, docs/readme.md)
- Deleted orphans: `docs/master_plan.md`, `docs/prompt_guide.md`
- Rewrote `docs/readme.md` with updated structure

### Phase 3 — Strengthen AGENTS.md
- Root `AGENTS.md`: added Stack table, Quick Commands, Critical Gotchas, File Locations (with sub-AGENTS), Common Tasks (4 recipes)
- Created `src/AGENTS.md` (frontend rules: components, styling, i18n, routes)
- Created `convex/AGENTS.md` (backend rules: schema, naming, security, auth)
- Created `.github/copilot-instructions.md` (VS Code Copilot pointer)

### Phase 4 — Manifest + Cross-Links
- Created `scripts/gen-feature-index.mjs` — auto-generates `docs/generated/feature-index.md` from spec headers
- Generated INDEX.md with 18 specs (title, status, owner, last-updated, PRD ref)
- Added spec links to every PRD feature checklist item (e.g., `AUTH — Clerk authentication → spec`)
- Added `> **PRD Ref:**` back-reference to all 18 spec headers
- Created `scripts/check-doc-links.mjs` — validates all markdown internal links
- Fixed 2 broken links found (ui-patterns-spec dead ref, README stale PRD path)
- Final state: 79 files scanned, 94 links checked, 0 broken

### Phase 5 — Spec Quality
- **Design system extension:** Added Component Catalog (22 shadcn primitives) and Accessibility Baseline (WCAG 2.1 AA) to `docs/design-docs/ui/ui-patterns-spec.md`
- **EARS notation:** Applied to 3 high-risk specs:
  - `donations-spec.md` — 12 EARS rules (money flow safety)
  - `admin-moderation-spec.md` — 10 EARS rules (trust/safety)
  - `onboarding-spec.md` — 9 EARS rules (auth/security)
- **Acceptance Criteria:** Added to all 18 specs (was missing from all 14 original + added to 4 new)
- **4 new specs created:**
  - `activity-feed-spec.md` — stories, timelines, activity aggregation (from `convex/activity.ts`, 434 lines)
  - `home-feed-spec.md` — landing page, intent filtering, hero case, trust gating (from `convex/home.ts`, 314 lines)
  - `pet-services-spec.md` — non-clinic service directory, claims (from `convex/petServices.ts`, 150 lines)
  - `social-spec.md` — comments, follows, likes, saves (from `convex/social.ts`, 156 lines)
- **Small files resolved:**
  - `settings.ts` (53 lines) → appendix in profiles-spec.md
  - `storage.ts` (12 lines) → utility, no spec needed

### Phase 6 — Governance
- Added Status Lifecycle rules to `docs/AGENTS.md`: draft→review→final with escape hatch
- Updated spec template from 9 sections to 10 (added Acceptance Criteria as section 9)
- Added PRD Ref field to required header template
- Appended 5 decision entries to `DECISIONS.md`
- Ran final validation checklist — all green

---

## Final Metrics

| Metric | Before | After |
|--------|--------|-------|
| Feature specs | 14 | 18 |
| Specs with Acceptance Criteria | 0 | 18 (100%) |
| Specs with PRD back-refs | 0 | 18 (100%) |
| PRD items with spec links | 0 | 25+ items linked |
| EARS safety requirements | 0 | 31 rules (3 specs) |
| Broken cross-references | 2+ | 0 |
| Duplicate PRDs | 2 | 1 |
| Orphaned docs | 3 | 0 |
| Files with missing headers | 14 | 0 |
| Auto-generated artifacts | 0 | 2 (INDEX.md, link checker) |
| DECISIONS.md entries added | — | 5 |

---

## Scripts Created

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/gen-feature-index.mjs` | Auto-generate `docs/generated/feature-index.md` from spec headers | `node scripts/gen-feature-index.mjs` |
| `scripts/check-doc-links.mjs` | Validate all markdown internal links resolve to real files | `node scripts/check-doc-links.mjs` |

---

## Files Created

| File | Purpose |
|------|---------|
| `src/AGENTS.md` | Frontend agent rules |
| `convex/AGENTS.md` | Backend agent rules |
| `.github/copilot-instructions.md` | VS Code Copilot context pointer |
| `docs/generated/feature-index.md` | Auto-generated feature registry |
| `docs/product-specs/features/activity-feed-spec.md` | Activity feed & stories spec |
| `docs/product-specs/features/home-feed-spec.md` | Home feed & landing spec |
| `docs/product-specs/features/pet-services-spec.md` | Pet services directory spec |
| `docs/product-specs/features/social-spec.md` | Social interactions spec |

## Files Modified

| File | Changes |
|------|---------|
| `PRD.md` | Content merged from PRD.md, spec links added to checklist |
| `AGENTS.md` | Stack table, commands, gotchas, recipes, file locations |
| `DECISIONS.md` | 5 new decision entries |
| `README.md` | Fixed stale PRD path |
| `docs/AGENTS.md` | Status lifecycle, 10-section template, PRD Ref header |
| `docs/readme.md` | Complete rewrite |
| `docs/design-docs/ui/ui-patterns-spec.md` | Component Catalog + Accessibility Baseline |
| `docs/product-specs/strategy/master-plan.md` | Fixed docs-v2/ refs |
| `docs/references/investor-ideation/` (10 files) | Added headers, fixed broken refs |
| All 14 original feature specs | Added PRD Ref + Acceptance Criteria |
| 3 high-risk specs | Added EARS Requirements sections |

## Files Deleted

| File | Reason |
|------|--------|
| `PRD.md` | Duplicate PRD (merged into root) |
| `docs/master_plan.md` | Orphan duplicate of `docs/product-specs/strategy/master-plan.md` |
| `docs/prompt_guide.md` | Ephemeral migration artifact (459 lines) |

---

## Design Decisions (Reference)

All logged in `DECISIONS.md` under date 2026-02-10:
1. **Docs overhaul v2** — 6-phase architecture with bidirectional traceability
2. **EARS scoped to 3 specs** — Money (donations), trust (moderation), security (auth) only
3. **INDEX.md script-generated** — Never hand-maintained
4. **Design system merged** — Into ui-patterns-spec.md, not separate file
5. **settings.ts/storage.ts too small** — Folded into adjacent specs
