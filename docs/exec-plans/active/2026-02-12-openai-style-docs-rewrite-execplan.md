# ExecPlan — OpenAI-Style Docs Rewrite (Hybrid Adaptation)

> **Owner:** Codex + Human  
> **Status:** draft  
> **Last updated:** 2026-02-12  

This ExecPlan is a living document. Keep these sections up to date as work proceeds:
`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

This plan must follow: `docs/exec-plans/PLANS.md`.

---

## Purpose / Big Picture

Rebuild supporting docs into an OpenAI harness-inspired information architecture with strict layering, generated artifacts, and deterministic validation while preserving root canonical SSOT docs (`PRD.md`, `TASKS.md`, `DESIGN.md`, `RULES.md`, `DECISIONS.md`, `AGENTS.md`, `README.md`).

---

## Progress

- [x] (2026-02-12 22:25Z) Create ExecPlan before implementation work.
- [x] (2026-02-12 22:30Z) Move docs into target IA (`design-docs`, `product-specs`, `references`, `generated`).
- [x] (2026-02-12 22:45Z) Rewrite root/docs map control-plane docs (`AGENTS.md`, `docs/AGENTS.md`, `docs/readme.md`).
- [x] (2026-02-12 23:00Z) Rewrite strategy narrative into `docs/product-specs/strategy/future-goals.md`.
- [x] (2026-02-12 23:10Z) Update links and generator/validator scripts to new paths.
- [x] (2026-02-12 23:20Z) Generate `docs/generated/feature-index.md`, `docs/generated/taskset.md`, `docs/generated/quality-score.md`.
- [x] (2026-02-12 23:30Z) Run docs gates and fix all failures.

---

## Surprises & Discoveries

- Observation: The working tree was already dirty in many files before this execution.
  Evidence: `git status --short` showed existing modifications in docs, frontend, backend, and CI files.

---

## Decision Log

- Decision: Execute docs rewrite on top of existing dirty worktree and only modify files needed for this docs migration.
  Rationale: User explicitly confirmed parallel work in another terminal and requested immediate implementation.
  Date/Author: 2026-02-12 / Codex + Human

---

## Outcomes & Retrospective

- Supporting docs are now reorganized to the OpenAI-style hybrid IA (`product-specs`, `design-docs`, `generated`, `references`, `archive`).
- Root canonical SSOT doc roles remain unchanged.
- Generator and validation tooling was updated and expanded (feature index + taskset + quality score).
- `pnpm -s docs:check` passes with zero broken links.

---

## Context and Orientation

Current supporting docs are spread across `docs/features`, `docs/systems`, `docs/design`, `docs/product`, `docs/missions`, `docs/business`, `docs/partners`, `docs/investor`. Existing tooling:
- `scripts/gen-feature-index.mjs` currently generates `docs/generated/feature-index.md`.
- `scripts/validate-docs.mjs` validates docs headers and feature-spec template conformance.
- `scripts/check-doc-links.mjs` validates markdown relative links.

Target IA:
- `docs/design-docs/` for architecture and UI/system design.
- `docs/product-specs/` for strategy + product specs (features, missions).
- `docs/references/` for non-SSOT ideation materials.
- `docs/generated/` for generated artifacts (`feature-index`, `taskset`, `quality-score`).

---

## Plan of Work

1. Create target directories and move files with `git mv` following the migration map.
2. Rewrite map/control docs:
   - Root `AGENTS.md`
   - `docs/AGENTS.md`
   - `docs/readme.md`
3. Rewrite `docs/product-specs/strategy/future-goals.md` from roadmap content with future-only orientation.
4. Update all repo links to new doc paths.
5. Update scripts:
   - `scripts/gen-feature-index.mjs` to read from `docs/product-specs/features` and write `docs/generated/feature-index.md`
   - `scripts/validate-docs.mjs` to validate new paths and ignore `docs/generated/**` and `docs/archive/**`
   - `scripts/check-doc-links.mjs` to ignore `docs/archive/**`
   - Add `scripts/gen-taskset.mjs`
   - Add `scripts/gen-quality-score.mjs`
6. Update `package.json` docs commands and checks.
7. Add non-SSOT warning block at top of every file under `docs/references/**`.
8. Archive dropped material into `docs/archive/2026-02-openai-rewrite/`.

---

## Interfaces and Dependencies

- Root canonical docs remain path-stable and authoritative.
- Supporting docs links in:
  - `PRD.md`
  - `DESIGN.md`
  - `README.md`
  - docs files under `docs/**`
  must be updated to new paths.
- `pnpm -s docs:check` contract changes:
  - Includes generated artifact freshness checks for `taskset` and `quality-score`.

---

## Concrete Steps

From repo root:

1. Move files:
   - Use `git mv` for all mapped docs path changes.
2. Update docs scripts and package scripts.
3. Regenerate docs artifacts:
   - `pnpm -s docs:index`
   - `pnpm -s docs:taskset`
   - `pnpm -s docs:quality`
4. Validate:
   - `pnpm -s docs:check`
   - `pnpm -s lint`
   - `pnpm -s typecheck`
   - `pnpm -s test`
   - `pnpm -s build`

---

## Validation and Acceptance

- `pnpm -s docs:check` succeeds with zero broken links.
- Generated docs exist and are up to date:
  - `docs/generated/feature-index.md`
  - `docs/generated/taskset.md`
  - `docs/generated/quality-score.md`
- No active references to the legacy docs layout outside archive.
- `PRD.md` feature links resolve to `docs/product-specs/features/*`.

---

## Idempotence and Recovery

- `git mv` operations are safe to re-run if target file does not already exist.
- Generators are deterministic and safe to run repeatedly.
- If a move fails mid-way, re-run from `git status` and finish remaining moves.
- Rollback strategy: revert only docs rewrite files introduced by this plan (do not touch unrelated dirty files).

---

## Artifacts and Notes

Artifacts to produce:
- Updated docs tree matching target IA
- Generated index/taskset/quality files
- Passing docs gate output transcript

---

## Security / Privacy / Trust Notes

N/A (docs-only refactor; no auth/data/money runtime behavior changes).
