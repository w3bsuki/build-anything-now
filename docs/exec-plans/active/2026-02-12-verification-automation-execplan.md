# ExecPlan — Batch 5 verification automation hardening

> **Owner:** Codex  
> **Status:** review  
> **Last updated:** 2026-02-12  

This ExecPlan is a living document. Keep these sections up to date as work proceeds:
`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

This plan must follow: `docs/exec-plans/PLANS.md`.

---

## Purpose / Big Picture

Ship the remaining verification-ladder controls so trust status is harder to game:
- admins can explicitly revoke/downgrade verification with reasoned audit trail,
- endorsements are rate-limited,
- suspicious endorsement bursts are detected and risk-flagged,
- auto-promotion to community verification uses stronger criteria than raw count.

---

## Progress

- [x] (2026-02-12 22:22Z) Audited verification spec, current `cases` backend flow, and case-detail admin UI.
- [x] (2026-02-12 22:29Z) Wrote Batch 5 ExecPlan before implementation.
- [x] (2026-02-12 22:46Z) Implemented verification safeguards in Convex (`cases` + schema support).
- [x] (2026-02-12 22:49Z) Added admin revocation UX with required downgrade reason.
- [x] (2026-02-12 22:53Z) Added Convex tests for revocation, endorsement limits, anti-brigading, refined promotion.
- [x] (2026-02-12 22:54Z) Added i18n keys and updated canonical docs/checklists.
- [x] (2026-02-12 22:57Z) Ran required validation gates (`convex:typecheck`, `typecheck`, `lint`, `test`, docs checks).

---

## Surprises & Discoveries

- Observation: Admin can already set verification status on case detail, but downgrade reasons are optional and no explicit revocation action is emitted.
  Evidence: `convex/cases.ts` `setVerificationStatus` logs only `case.verification_set`, and `src/pages/AnimalProfile.tsx` does not pass notes.

- Observation: Community auto-promotion currently depends only on endorsement count threshold.
  Evidence: `convex/cases.ts` `endorseCase` promotes when `endorsedCount >= 3`.

- Observation: No endorsement-specific rate limit table exists.
  Evidence: `convex/schema.ts` contains `reportRateLimits` and `translationRateLimits`, but no `endorsementRateLimits`.

---

## Decision Log

- Decision: Keep verification status enum as `unverified | community | clinic` in this batch.
  Rationale: Required functionality is revocation + quality controls, not new trust labels; avoids broader UI/data contract churn.
  Date/Author: 2026-02-12 / Codex

- Decision: Implement endorsement abuse controls server-side in `cases.endorseCase` (rate limit + anti-brigading risk signal + refined promotion qualification).
  Rationale: Centralizes trust enforcement where endorsements are written and keeps client behavior non-authoritative.
  Date/Author: 2026-02-12 / Codex

---

## Outcomes & Retrospective

- Shipped verification automation hardening in `cases` flow:
  - mandatory reason for admin downgrades,
  - explicit revocation audit action,
  - endorsement daily rate limit,
  - anti-brigading signal with risk/report/audit side effects,
  - refined auto-promotion based on qualified endorsements.
- Updated case-detail admin verification controls to collect and enforce downgrade rationale.
- Added verification automation tests (`convex/tests/cases.verification-automation.test.ts`) and adjusted threshold promotion test to cover qualified endorser age behavior.
- Added/updated translation keys for verification UX in EN/BG locales.
- Updated product/status docs (`PRD.md`, `TASKS.md`, `DECISIONS.md`).
- Validation outcomes:
  - `npx convex codegen` ✅
  - `pnpm -s convex:typecheck` ✅
  - `pnpm -s typecheck` ✅
  - `pnpm -s lint` ✅ (4 existing warnings, 0 errors)
  - `pnpm -s test` ✅ (20 files, 43 tests)
  - `pnpm -s docs:index` ✅
  - `pnpm -s docs:check` ✅

---

## Context and Orientation

- Verification ladder behavior is primarily in `convex/cases.ts`.
- Case schema and endorsement records live in `convex/schema.ts` (`cases`, `caseEndorsements`).
- Case detail trust actions are rendered in `src/pages/AnimalProfile.tsx`.
- Existing tests:
  - `convex/tests/cases.endorse-trusted.test.ts`
  - `convex/tests/cases.endorse-threshold-promotion.test.ts`
- Current gap from product checklist: revocation UX and endorsement quality controls remain open.

---

## Plan of Work

1) Backend safeguards (`convex/cases.ts`, `convex/schema.ts`)
- Add endorsement rate-limit storage in schema.
- In `endorseCase`, enforce per-user daily endorsement quota.
- Add anti-brigading heuristic from recent endorsements and endorser account age; on trigger, risk-flag case + audit log (and optionally moderation report signal).
- Refine auto-promotion criteria from raw threshold to “qualified endorsements” (trusted + non-suspicious).

2) Revocation semantics (`convex/cases.ts`)
- Update `setVerificationStatus` to:
  - detect downgrade vs upgrade/lateral,
  - require reason notes for downgrade,
  - emit explicit revocation audit action (`case.verification_revoked`) with metadata.

3) Admin UI flow (`src/pages/AnimalProfile.tsx`)
- Extend admin verification controls with downgrade reason input.
- Block save for downgrade until reason is provided.
- Send reason notes to mutation and show translated success/error toasts.

4) Tests (`convex/tests/*`)
- Add/expand tests for:
  - downgrade requiring reason + audit action,
  - endorsement daily limit,
  - anti-brigading flag behavior,
  - refined promotion criteria (count-only no longer sufficient if suspicious/unqualified).

5) i18n + docs
- Add new strings to `public/locales/en/translation.json` and `public/locales/bg/translation.json`.
- Update `TASKS.md`, `PRD.md`, `DECISIONS.md` once shipped.
- Keep this ExecPlan progress/outcome sections current.

---

## Interfaces and Dependencies

- Backend mutations:
  - `cases.setVerificationStatus` (behavior change)
  - `cases.endorseCase` (behavior change)
- Schema:
  - add `endorsementRateLimits` table for per-user/day quota.
- Frontend:
  - `AnimalProfile` admin verification form includes downgrade reason handling.
- Compatibility:
  - Existing callers of `endorseCase` remain valid.
  - `setVerificationStatus` may now reject downgrades without reason; admin UI will provide this.

---

## Concrete Steps

Run from repo root `J:\pawsy\build-anything-now`:

- `npx convex codegen`
- `pnpm -s convex:typecheck`
- `pnpm -s typecheck`
- `pnpm -s lint`
- `pnpm -s test`
- `pnpm -s docs:index`
- `pnpm -s docs:check`

---

## Validation and Acceptance

- Admin can downgrade a case from `clinic`/`community` to lower status only when a reason is provided.
- Downgrade writes an audit entry with explicit revocation action and reason metadata.
- Endorsements are rejected when user exceeds daily quota.
- Suspicious endorsement bursts trigger risk flagging/audit evidence and do not silently auto-promote.
- Legitimate trusted endorsements still allow promotion to `community` when refined criteria are met.
- All required checks pass with no new lint/type/test failures.

---

## Idempotence and Recovery

- Schema + codegen steps are safe to repeat.
- Mutation logic changes are deterministic and retry-safe.
- If partial failure occurs during development, rerun codegen/tests after fixing compile/test issues.
- Rollback strategy: revert changed files (`convex/schema.ts`, `convex/cases.ts`, affected UI/tests/locales/docs).

---

## Artifacts and Notes

- Proof comes from:
  - Convex tests in `convex/tests/*verification*` / endorsement suites,
  - lint/type/test command outputs,
  - audit-log assertions in tests.

---

## Security / Privacy / Trust Notes

- Auth/authz: all mutation paths keep `requireUser` / `requireAdmin` checks.
- PII: no public query payload changes; no new email/phone exposure.
- Money/webhooks: N/A (verification-only batch).
- Abuse mitigation: endorsement quotas + burst detection reduce coordinated trust manipulation and improve moderation visibility.
