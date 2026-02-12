# Pawtreon — Tasks

> **Purpose:** Current sprint only. What we're doing NOW.  
> **Rule:** Archive completed items weekly. Don't accumulate history.  
> **Last updated:** 2026-02-12

---

## How to Use This File

- `TASKS.md` is for work that is **>30 minutes**, **user-facing**, **risky**, or **multi-file**.
- Tiny drive-by fixes can skip `TASKS.md`, but must still pass CI.
- If a task is **>2 hours** or **high-risk** (money/auth/PII/schema/trust/safety/webhooks), create an ExecPlan in `docs/exec-plans/active/` and link it from the task item.

## In Progress

- [x] **COMMUNITY: Dedicated mobile forum shell (stage 1)**
  - [x] Global mobile bottom nav is hidden on `/community*`.
  - [x] Community-specific mobile shell added (header + bottom tabs).
  - [x] Community bottom tabs are `Feed`, `Followed`, `Messages`, `New Thread`.
  - [x] `New Thread` from any community tab routes to `/community?compose=1` and opens composer in-place.
  - [x] Stage-1 preview routes added: `/community/followed`, `/community/messages`.
  - [x] Community feed reduced mobile control density by moving primary compose action to bottom nav.
  - AC: `/community` behaves as a forum-first mobile surface without dead-end tab routes.

- [ ] **HOME: Case-first landing refactor + Convex feed contract**
  - [x] Home first fold simplified (compact header + urgent stories + compact pill rail).
  - [x] Large inline search removed from first fold; search now opens via header action.
  - [x] Home feed wired to server-driven contract (`home.getLandingFeed`) with hero + unified list.
  - [x] Header unread badges switched to real Convex counts (`home.getUnreadCounts`).
  - [x] Expand style gate scope from landing surfaces to full trust-critical flows (`case/create/donation/community`) after cleanup batch 2.
  - AC: No duplicated urgency modules in home first fold and no hardcoded unread badge counts.

- [x] **DONATIONS: Post-checkout return UX + receipts polish**
  - [x] Case page shows explicit success/cancel return banner.
  - [x] Stripe receipt URL stored on completion (webhook) and surfaced in history.
  - AC: Users receive clear post-checkout state and receipt visibility after redirect.

- [x] **RUN 2 FOUNDATIONS: Follow feed + testing + analytics + strict TS (batch 1)**
  - [x] Added `home.getFollowingFeed` with cursor pagination and wired Home `Following` segment + empty state.
  - [x] Replaced `/community/followed` preview with live followed-creators thread list.
  - [x] Donation history surfaces now show `View Receipt` (when URL exists) or `Receipt ID` fallback.
  - [x] Added Vitest + `convex-test` baseline (13 test files, passing).
  - [x] Added PostHog bootstrap (`respect_dnt: true`, `persistence: localStorage`) and critical event tracking hooks.
  - [x] Enabled `strictNullChecks` + `noImplicitAny` in `tsconfig.app.json` and resolved resulting app type errors.
  - AC: Followed feed and receipt UX are production-wired, critical test baseline exists, analytics bootstrap is active when env vars are set, and app typecheck stays clean under strict batch-1 flags.

- [x] **TRUST: Duplicate detection v1 (perceptual similarity)**
  - [x] Added optional `perceptualHashes` input on `cases.create` and persisted `pHash`/`dHash` fingerprints.
  - [x] Added bucketed Hamming-distance matching to flag likely transformed/reused images.
  - [x] Duplicate reports/audit logs now include perceptual match evidence payload.
  - [x] Added Convex tests for perceptual match + non-match paths.
  - AC: Similar images (not only byte-identical uploads) are risk-flagged for moderation review.

- [x] **PARTNER OPS: Clinic claim admin queue**
  - [x] Admin review queue wired (`/admin/clinic-claims`).
  - [x] Approve/reject with rejection reason + audit log.
  - [x] Claimant gets in-app notification on approval/rejection.
  - Remaining: optional "needs info"/dispute state + richer SLA dashboard.
  - AC: Admin can process clinic claims end-to-end with traceable logs.

- [ ] **STYLING: Tailwind/shadcn remediation batch 1**
  - Animal profile, account, campaigns and home mission surfaces were refreshed.
  - [x] Batch 2: Home + Community + Campaigns trust-surface alignment (token rails, focus/touch baseline, chip/search/header consistency).
  - [x] Expand style gate scope from narrow landing set to scoped trust surfaces (`home/community/campaigns` + shared components).
  - [x] Remove unused legacy home variants after alignment to reduce style drift.
  - [x] Added SSOT layout primitives (`PageShell`, `PageSection`, `SectionHeader`, `StickySegmentRail`, `StickyActionBar`, `StatsGrid`).
  - [x] Migrated trust-critical pages to shared wrappers (`/`, `/case/:id`, `/create-case`, `/campaigns`, `/clinics`).
  - [x] Refactored `/partners` into data-driven segments with stores/services inside partners IA.
  - Remaining: run full visual QA matrix on trust + non-critical surfaces.
  - AC: core trust flows use semantic token classes consistently, no mock trust content in partners/services, and style gates catch regressions.

---

## Current Sprint — Master Plan Execution (Weeks 1-8)

### Phase 0 — Governance / Docs Baseline
- [x] Canonical docs topology aligned (7 root docs + supporting `docs/` specs)
- [x] Supporting docs packs created:
  - `docs/product-specs/strategy/*`
  - `docs/product-specs/features/*`
  - `docs/design-docs/systems/*`
  - `docs/design-docs/ui/*`
  - `docs/references/business-ideation/*`
  - `docs/product-specs/missions/*`
  - `docs/references/partner-ideation/*`
- [x] Decision log updated with defaults and superseded process notes.

### Phase 1 — Case Lifecycle (Core)
- [x] Owner/authorized "Add Update" flow on case detail with modal UI.
- [x] Structured update payload: type + optional evidence type + optional images + clinic attribution.
- [x] Lifecycle transitions: `active_treatment` -> `seeking_adoption` -> closed outcomes.
- [x] Donation gating respects lifecycle/trust state on case detail.

---

### Phase 2 — Trust + Money
- [x] Moderation queue backend actions with audit logging (`open`/`reviewing`/`closed` resolution path).
- [x] Admin moderation page added (`/admin/moderation`).
- [x] Stripe webhook route and idempotent donation completion path added.
- [x] Stripe hosted checkout + webhook completion path wired.
- [x] Receipt history UI polish (schema fields present, user-facing surfacing complete).
- [x] Recurring donations v1 shipped (Stripe subscription checkout, webhook lifecycle sync, monthly support management UI).

---

### Phase 3 — Bulgaria Directory + Partner Ops
- [x] Clinic seeding strategy documented and seed data expanded.
- [x] Existing claim submit flow retained with duplicate pending-claim guard.
- [x] Claim review/approval tooling for admins (approve/reject + notifications).

---

### Phase 4 — Mission Campaign Surfaces
- [x] Campaign classification added (rescue vs initiative).
- [x] Home featured initiative module added.
- [x] Account/profile mission hub section added.
- [x] Campaigns page initiative filter/section added.

---

## Backlog (Post Current Sprint)

- [x] Follow graph + following feed
- [x] Recurring support model
- [x] External link cards + source attribution (case + community)
- [x] Volunteer coordination v1 (availability settings, volunteer directory, case transport request notifications)
- [x] Analytics dashboards v1 (`/admin/analytics`: cases, donations, verification, moderation)
- [x] Notification delivery channels (push token registration + email delivery wiring + hourly case-update batching/throttling)
- [x] Duplicate detection/pHash (sha256 + perceptual similarity shipped)
- [x] Verification ladder automation + revocation UI

