# Pawtreon — Tasks

> **Purpose:** Current sprint only. What we're doing NOW.  
> **Rule:** Archive completed items weekly. Don't accumulate history.  
> **Last updated:** 2026-02-12

---

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
  - [ ] Expand style gate scope from landing surfaces to full trust-critical flows (`case/create/donation/community`) after cleanup batch 2.
  - AC: No duplicated urgency modules in home first fold and no hardcoded unread badge counts.

- [x] **DONATIONS: Post-checkout return UX + receipts polish**
  - [x] Case page shows explicit success/cancel return banner.
  - [x] Stripe receipt URL stored on completion (webhook) and surfaced in history.
  - AC: Users receive clear post-checkout state and receipt visibility after redirect.

- [ ] **PARTNER OPS: Clinic claim admin queue**
  - Claim submit/search exists.
  - Remaining: explicit admin review queue + approval/reject/dispute actions with SLA dashboard.
  - AC: Admin can process clinic claims end-to-end with traceable logs.

- [ ] **STYLING: Tailwind/shadcn remediation batch 1**
  - Animal profile, account, campaigns and home mission surfaces were refreshed.
  - [x] Batch 2: Home + Community + Campaigns trust-surface alignment (token rails, focus/touch baseline, chip/search/header consistency).
  - [x] Expand style gate scope from narrow landing set to scoped trust surfaces (`home/community/campaigns` + shared components).
  - [x] Remove unused legacy home variants after alignment to reduce style drift.
  - [x] Added SSOT layout primitives (`PageShell`, `PageSection`, `SectionHeader`, `StickySegmentRail`, `StickyActionBar`, `StatsGrid`).
  - [x] Migrated trust-critical pages to shared wrappers (`/`, `/case/:id`, `/create-case`, `/campaigns`, `/clinics`).
  - [x] Refactored `/partners` into data-driven segments with stores/services inside partners IA.
  - Remaining: run full visual QA matrix and complete residual token drift cleanup on non-critical routes.
  - AC: core trust flows use semantic token classes consistently, no mock trust content in partners/services, and style gates catch regressions.

---

## Current Sprint — Master Plan Execution (Weeks 1-8)

### Phase 0 — Governance / Docs Baseline
- [x] Canonical docs topology aligned (7 root docs + supporting `docs/` specs)
- [x] Supporting docs packs created:
  - `docs/product/*`
  - `docs/features/*`
  - `docs/systems/*`
  - `docs/design/*`
  - `docs/business/*`
  - `docs/missions/*`
  - `docs/partners/*`
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
- [ ] Receipt history UI polish (schema fields present, user-facing surfacing still partial).

---

### Phase 3 — Bulgaria Directory + Partner Ops
- [x] Clinic seeding strategy documented and seed data expanded.
- [x] Existing claim submit flow retained with duplicate pending-claim guard.
- [ ] Claim review/approval tooling for admins (pending).

---

### Phase 4 — Mission Campaign Surfaces
- [x] Campaign classification added (rescue vs initiative).
- [x] Home featured initiative module added.
- [x] Account/profile mission hub section added.
- [x] Campaigns page initiative filter/section added.

---

## Backlog (Post Current Sprint)

- [ ] Follow graph + following feed
- [ ] Recurring support model
- [ ] OG/share SSR surfaces
- [ ] Notification center + delivery channels
- [ ] Duplicate detection/pHash

