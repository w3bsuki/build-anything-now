# ExecPlan — Volunteer coordination batch 3 (availability, directory, transport)

> **Owner:** Codex  
> **Status:** review  
> **Last updated:** 2026-02-12

This ExecPlan is a living document. Keep these sections up to date as work proceeds:
`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

This plan must follow: `docs/exec-plans/PLANS.md`.

---

## Purpose / Big Picture

Ship volunteer coordination v1 so volunteers can opt into availability, be discoverable by city/capability, and receive transport-help requests from case detail without exposing precise location or public PII.

---

## Progress

- [x] (2026-02-12 19:24Z) Audited current volunteer spec, schema, backend/API, and frontend surfaces.
- [x] (2026-02-12 19:24Z) Wrote execution plan before implementation (this file).
- [x] (2026-02-12 19:38Z) Implemented Convex volunteer directory + availability/capability mutations.
- [x] (2026-02-12 19:38Z) Implemented transport request mutation + nearby matching query + notification fanout.
- [x] (2026-02-12 19:38Z) Built frontend settings controls + volunteers directory route + case transport request UI.
- [x] (2026-02-12 19:38Z) Added Convex tests, i18n keys (en/bg), and updated docs/checklists.
- [x] (2026-02-12 19:38Z) Ran validation gates and resolved compile issues.

---

## Surprises & Discoveries

- Observation: Volunteer state is split between `users` (availability/capabilities/city) and `volunteers` (bio/stats/badges/rating).
  Evidence: `convex/schema.ts` users + volunteers tables; `convex/volunteers.ts` currently enriches volunteer docs with user names only.

- Observation: `users.completeOnboarding` currently defaults volunteer availability to `available`, conflicting with opt-in privacy rule.
  Evidence: `convex/users.ts` sets `updateData.volunteerAvailability = "available"` inside volunteer onboarding branch.

- Observation: Some volunteer users may not yet have a `volunteers` table row even if onboarding marked them as volunteers.
  Evidence: Existing onboarding writes volunteer fields on `users`, while volunteer profile persistence previously required separate table seeding.

---

## Decision Log

- Decision: Keep existing split data model (`users` + `volunteers`) for batch 3 and implement a unified read model in volunteer queries.
  Rationale: Avoids risky schema migration while unblocking directory/transport features now.
  Date/Author: 2026-02-12 / Codex

- Decision: Implement transport requests as case-scoped mutation + notification fanout, without introducing a new persistent table in this batch.
  Rationale: Meets current acceptance needs (nearby match + notify) with lower schema risk; can add request history table later if needed.
  Date/Author: 2026-02-12 / Codex

---

## Outcomes & Retrospective

Shipped:
- Expanded `convex/volunteers.ts` with directory + transport APIs:
  - queries: `listDirectory`, `listTransportMatches`
  - mutations: `create`, `update`, `updateAvailability`, `updateCapabilities`, `createTransportRequest`
  - internal mutations: `setTopVolunteer`, `incrementStats`
- Added volunteer coordination test coverage in `convex/tests/volunteers.coordination.test.ts`.
- Added new `/volunteers` directory route + page (`src/pages/VolunteersDirectory.tsx`).
- Added volunteer settings controls in `src/pages/Settings.tsx` (availability + capabilities with lazy profile bootstrap).
- Added transport-request UI on case detail (`src/pages/AnimalProfile.tsx`) and volunteer metadata display improvements on profile (`src/pages/VolunteerProfile.tsx`).
- Added/updated i18n keys in `public/locales/en/translation.json` and `public/locales/bg/translation.json`.
- Updated tracking docs (`TASKS.md`, `PRD.md`, `DECISIONS.md`) and regenerated docs index.

Validation completed:
- `npx convex codegen`
- `pnpm -s typecheck`
- `pnpm -s lint` (0 errors, existing 4 warnings unchanged)
- `pnpm -s test` (34/34 tests passing)
- `pnpm -s docs:index`
- `pnpm -s docs:check`

---

## Context and Orientation

- Current volunteer API (`convex/volunteers.ts`) has only `list` and `get` queries.
- Volunteer profile route exists at `src/pages/VolunteerProfile.tsx` and `/volunteers/:id` in `src/App.tsx`.
- Volunteer list currently lives as a segment inside `src/pages/Partners.tsx`.
- Settings page (`src/pages/Settings.tsx`) has no volunteer availability/capability controls yet.
- Case detail (`src/pages/AnimalProfile.tsx`) currently has donate/chat/support actions but no transport request action.
- Translation keys are centralized in `public/locales/en/translation.json` and `public/locales/bg/translation.json`.

Terms used:
- Availability states: `available` | `busy` | `offline`.
- Nearby matching: city-level matching only using `users.volunteerCity`.

---

## Plan of Work

1) Backend volunteer model + directory query
- Edit `convex/volunteers.ts`.
- Add constants + validators for allowed availability/capability values.
- Add owner-auth mutations using `getAuthUserId(ctx)`:
  - `create` (create volunteer profile if missing for current user),
  - `update` (bio/location ownership update),
  - `updateAvailability` (set `users.volunteerAvailability`),
  - `updateCapabilities` (set `users.volunteerCapabilities`).
- Add `listDirectory` query with filters (`city`, `capability`, `availability`) and default exclusion of `offline`.
- Enrich responses with safe fields only (no email/phone), returning city/capabilities/availability for UI cards.

2) Transport request flow
- Edit `convex/volunteers.ts` (same module for this batch scope).
- Add `listTransportMatches` query (caseId + city override optional) to return nearby available transport-capable volunteers.
- Add `createTransportRequest` mutation (owner/authenticated case participant path) that:
  - validates requester auth and case existence,
  - computes city-level matches,
  - inserts in-app `notifications` records (`type: "system"`) for matched volunteers,
  - returns `notifiedCount` and matched volunteer IDs for UX feedback.

3) Frontend settings and directory
- Edit `src/pages/Settings.tsx` to add volunteer availability toggle and capability chips for volunteer users.
- Create `src/pages/VolunteersDirectory.tsx` route using SSOT primitives (`PageShell`, `PageSection`, `SectionHeader`).
- Add route `/volunteers` in `src/App.tsx`.
- Directory UI shows filters and volunteer cards with capabilities/city/availability and links to `/volunteers/:id`.

4) Case detail transport CTA
- Edit `src/pages/AnimalProfile.tsx`.
- Add “Who can help nearby” UI section + request action:
  - render matched volunteers from `api.volunteers.listTransportMatches`,
  - provide button to call `api.volunteers.createTransportRequest`,
  - show success/error toasts and preserve trust-safe copy.

5) Tests, i18n, docs
- Add `convex/tests/volunteers.coordination.test.ts` for:
  - auth gating,
  - availability/capability updates,
  - directory filtering behavior,
  - transport request notification fanout.
- Add/extend translation keys in both locale files.
- Update `TASKS.md`, `PRD.md`, and append `DECISIONS.md` with batch-3 architecture decisions.

---

## Interfaces and Dependencies

- Convex module: `convex/volunteers.ts`
  - New queries: `listDirectory`, `listTransportMatches`
  - New mutations: `create`, `update`, `updateAvailability`, `updateCapabilities`, `createTransportRequest`
  - New internal mutations: `setTopVolunteer`, `incrementStats` (implemented for spec completeness, not yet wired to UI)
- Frontend dependencies:
  - `src/pages/Settings.tsx` uses `api.users.me`, `api.volunteers.updateAvailability`, `api.volunteers.updateCapabilities`
  - `src/pages/VolunteersDirectory.tsx` uses `api.volunteers.listDirectory`
  - `src/pages/AnimalProfile.tsx` uses `api.volunteers.listTransportMatches` + `api.volunteers.createTransportRequest`
- Compatibility:
  - Keep existing `api.volunteers.list` and `api.volunteers.get` so existing partners/profile surfaces do not break.
  - No schema table additions in this batch; no migration/backfill needed.

---

## Concrete Steps

Run from repo root `J:\pawsy\build-anything-now`.

- `npx convex codegen`
- `pnpm -s convex:typecheck`
- `pnpm -s typecheck`
- `pnpm -s lint`
- `pnpm -s test`
- `pnpm -s docs:index`
- `pnpm -s docs:check`

Expected high-level outcomes:
- Convex API/types regenerate successfully.
- TypeScript, lint, tests, and docs checks pass.

---

## Validation and Acceptance

- Settings (volunteer user):
  - Change availability to `offline`/`busy`/`available` and verify state persists and reflects in directory results.
  - Update capabilities and verify directory capability filter reflects changes.

- Directory:
  - Visit `/volunteers`, apply city/capability/availability filters, confirm returned cards match filters.
  - Confirm default list excludes offline volunteers.

- Case transport:
  - On case detail, load nearby transport matches.
  - Trigger transport request and observe success toast + increased notifications for matched volunteers (Convex test assertion).

- API safety:
  - Unauthenticated calls to new mutations fail.
  - No public query response includes user email or phone.

---

## Idempotence and Recovery

- Safe to rerun:
  - `npx convex codegen`, typecheck/lint/test/docs commands.
  - Directory queries and list endpoints.
- Mutation retries:
  - `updateAvailability` and `updateCapabilities` are last-write-wins and safe to retry.
  - `createTransportRequest` uses deterministic matching but emits notifications; retry can duplicate notifications. Recovery: guard UI against accidental double-submit and use disabled-pending button state.
- Rollback:
  - Revert touched files in a single batch; no schema migrations in this plan.

---

## Artifacts and Notes

- Keep validation outputs short in commit/PR notes.
- Reference changed files and test names as proof.

---

## Security / Privacy / Trust Notes

- Auth/Authz:
  - All new mutations require authenticated user via `getAuthUserId(ctx)`.
  - Ownership checks on any case/volunteer updates by ID.
- Privacy:
  - Public directory/query responses exclude email/phone.
  - City-level matching only; no precise coordinates.
  - Availability defaults remain opt-in and user-controlled.
- Money/webhooks:
  - N/A for this batch.
- Abuse and mitigations:
  - Transport request fanout limited to availability + capability + city matches.
  - UI should prevent rapid double-submit to reduce notification spam.
