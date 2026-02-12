# ExecPlan — Admin analytics dashboards batch 4

> **Owner:** Codex  
> **Status:** review  
> **Last updated:** 2026-02-12

This ExecPlan is a living document. Keep these sections up to date as work proceeds:
`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

This plan must follow: `docs/exec-plans/PLANS.md`.

---

## Purpose / Big Picture

Ship `/admin/analytics` with actionable operational metrics sourced from existing Convex data, covering case performance, donations, verification timelines, and moderation throughput.

---

## Progress

- [x] (2026-02-12 19:51Z) Audited analytics spec + current admin routes + available schema fields.
- [x] (2026-02-12 19:51Z) Wrote Batch 4 ExecPlan before implementation.
- [x] (2026-02-12 20:05Z) Implemented admin analytics aggregate queries in Convex.
- [x] (2026-02-12 20:14Z) Built `/admin/analytics` page and route.
- [x] (2026-02-12 20:22Z) Added analytics query lifecycle tests.
- [x] (2026-02-12 20:28Z) Added `admin.analytics.*` i18n keys and updated root checklists.
- [x] (2026-02-12 22:10Z) Hardened analytics UX/query details after review (case-only verification log index usage, currency surfaced from data, moderation reason fallback, extra cohort assertions).
- [x] (2026-02-12 20:40Z) Ran required validation gates (`convex:typecheck`, `typecheck`, `lint`, `test`) and docs checks (`docs:index`, `docs:check`).

---

## Surprises & Discoveries

- Observation: Existing analytics spec predates shipped PostHog bootstrap and still describes “no analytics tracking.”
  Evidence: `docs/design-docs/systems/analytics-spec.md` current-state section is outdated vs current codebase.

- Observation: Case “funded at” timestamp is not persisted directly.
  Evidence: `cases` table has `status` but no `fundedAt`; donation flow updates status in `convex/donations.ts`.

- Observation: Verification transition timestamps are only inferable from `auditLogs`.
  Evidence: `convex/cases.ts` writes `case.verification_set` / `case.verification_upgraded` actions with timestamps.

---

## Decision Log

- Decision: Keep analytics computations query-time (no snapshot table) for Batch 4.
  Rationale: Meets current requirement with existing data and avoids schema/routine complexity in this batch.
  Date/Author: 2026-02-12 / Codex

- Decision: Derive case funded time from completed donation stream cumulative sum (first point goal is reached).
  Rationale: No native `fundedAt` field exists; this produces deterministic and explainable “time to funded.”
  Date/Author: 2026-02-12 / Codex

---

## Outcomes & Retrospective

- Shipped admin dashboards at `/admin/analytics` with four aggregate sections: cases, donations, verification, moderation.
- Added admin-only Convex analytics queries (`convex/adminAnalytics.ts`) without introducing new schema tables.
- Added backend coverage in `convex/tests/admin-analytics.metrics.test.ts` for auth gating and metric derivation.
- Added localized copy for English and Bulgarian in `public/locales/{en,bg}/translation.json`.
- Updated canonical status docs (`TASKS.md`, `PRD.md`) and decision trail (`DECISIONS.md`).
- Validation outcomes:
  - `pnpm -s typecheck` ✅
  - `pnpm -s convex:typecheck` ✅
  - `pnpm -s lint` ✅ (4 existing warnings, 0 errors)
  - `pnpm -s test` ✅ (19 files, 40 tests)
  - `pnpm -s docs:index` ✅
  - `pnpm -s docs:check` ✅

---

## Context and Orientation

- Admin pages currently exist at:
  - `src/pages/admin/ModerationQueue.tsx`
  - `src/pages/admin/ClinicClaimsQueue.tsx`
- Routes are defined in `src/App.tsx`.
- Admin gating currently uses `users.me` on frontend and `requireAdmin(ctx)` in Convex queries/mutations.
- Relevant tables:
  - `cases`, `donations`, `subscriptions`, `reports`, `auditLogs`.
- Analytics should be backed by aggregate queries, not raw document dumps.

---

## Plan of Work

1) Convex analytics query module
- Add `convex/adminAnalytics.ts` with admin-only queries:
  - `getCaseAnalytics`
  - `getDonationAnalytics`
  - `getVerificationAnalytics`
  - `getModerationAnalytics`
- Each query enforces `requireAdmin(ctx)`.
- Include stable defaults (30-day window) and optional `days` arg.

2) Route and page
- Add `src/pages/admin/AdminAnalytics.tsx`.
- Register route `/admin/analytics` in `src/App.tsx`.
- Use SSOT primitives (`PageShell`, `PageSection`, `SectionHeader`, `StatsGrid`), mobile-first cards, and admin guard UX.

3) Translation keys
- Extend `public/locales/en/translation.json` and `public/locales/bg/translation.json` with `admin.analytics.*`.

4) Tests
- Add `convex/tests/admin-analytics.metrics.test.ts`:
  - verifies admin access control,
  - verifies core aggregates and timeline shape,
  - verifies recurring vs one-time split and moderation calculations.

5) Docs/checklist updates
- Update `TASKS.md` and `PRD.md` analytics status after shipping.
- Append `DECISIONS.md` with the derivation approach for funded/verification timings.

---

## Interfaces and Dependencies

- New backend file: `convex/adminAnalytics.ts`.
- New frontend file: `src/pages/admin/AdminAnalytics.tsx`.
- Route addition in `src/App.tsx`.
- Translation additions under `admin.analytics` namespace.
- Test additions in `convex/tests/admin-analytics.metrics.test.ts`.
- No schema changes expected in this batch.

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

- Admin user can open `/admin/analytics` and view:
  - case created/funded/closed trend,
  - average time-to-funded,
  - city breakdown,
  - donation totals/average/cohorts/recurring split,
  - verification status and average time-to-community/clinic,
  - moderation status counts, avg resolution time, top reasons.
- Non-admin users see admin-required guard and cannot query protected data.
- Metrics render without exposing PII (no email/phone).

---

## Idempotence and Recovery

- Queries are read-only and safe to rerun.
- If timeline derivation fails for edge cases, fallback metrics should return zeros/empty arrays rather than throw.
- Safe rollback is file-level revert (no migrations).

---

## Artifacts and Notes

- Keep acceptance proof in tests and command outputs.
- Reference backend query names and route path in final summary.

---

## Security / Privacy / Trust Notes

- Auth/Authz: all analytics queries require admin via `requireAdmin(ctx)`.
- Privacy: no PII returned; analytics are aggregate and anonymized.
- Money/webhook: read-only use of donation/subscription ledgers; no payment flow mutation.
- Abuse: analytics route is admin-only and non-public.
