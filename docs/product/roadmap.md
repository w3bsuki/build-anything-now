# Pawtreon — Product Roadmap

> **Owner:** Product (Human) + OPUS  
> **Status:** review  
> **Last updated:** 2026-02-10

---

## Sequencing Rule

Priority order (default, can be adjusted):

1. Trust + money + case lifecycle
2. Directory expansion + partner operations
3. Mission initiatives surfaces
4. Distribution + retention features
5. AI acceleration

---

## Current Position: ~Week 6-7 of 8

Phase 0 and Phase 1 are complete. Phase 2 is nearly complete (receipt polish pending). Phase 3 is in progress (claim admin tooling pending). Phase 4 is complete. The 8-week sprint is on track with one remaining blocker (clinic claim admin queue).

---

## Phase 0 (Week 1) — Baseline and Governance Reset ✅ COMPLETE

### Deliverables
- Canonical docs cleanup and supporting docs pack under `docs/`.
- Decision log updates for active assumptions.
- Baseline quality check and debt list capture.

### Exit Criteria — All Met
- [x] Canonical links resolve.
- [x] No references to archived `.specs` in active workflow docs.
- [x] Supporting plan docs created with ownership and cadence.
- [x] Canonical docs topology ratified (7 root docs + supporting `docs/` packs).
- [x] Decision log updated with defaults and superseded process notes.

---

## Phase 1 (Weeks 2-3) — Case Lifecycle Completion ✅ COMPLETE

### Deliverables
- Owner/authorized update composer on case detail.
- Structured updates with evidence metadata.
- Lifecycle transitions including `seeking_adoption` and closure outcomes.

### Exit Criteria — All Met
- [x] Owner can post updates with optional media evidence.
- [x] Supporters see timeline updates immediately.
- [x] Lifecycle transitions enforced and persisted (`active_treatment` → `seeking_adoption` → `closed_success` / `closed_transferred` / `closed_other`).
- [x] Structured update payload: type + optional evidence type + optional images + clinic attribution.
- [x] Donation gating respects lifecycle/trust state on case detail.

---

## Phase 2 (Weeks 3-5) — Trust + Money 🟡 NEARLY COMPLETE

### Deliverables
- Stripe payment intent + webhook completion path.
- Idempotent donation completion and receipt metadata.
- Moderation queue actions and verification updates with audit logs.

### Exit Criteria
- [x] End-to-end small donation in Stripe test mode (hosted checkout + webhook completion).
- [x] Stripe webhook route and idempotent donation completion path added.
- [x] Stripe hosted checkout + webhook completion path wired.
- [x] Moderation queue backend actions with audit logging (`open`/`reviewing`/`closed` resolution path).
- [x] Admin moderation page added (`/admin/moderation`).
- [x] Verification state updates visible in feed and detail.
- [x] Admin/mod ops can process reports safely.
- [ ] **Remaining:** Post-checkout success/cancel return UX messaging and receipt/history surfacing polish in account-facing flows.

---

## Phase 3 (Weeks 5-7) — Bulgaria Directory + Partner Ops 🟡 IN PROGRESS

### Deliverables
- Seeded clinic dataset for Sofia, Varna, Plovdiv.
- Active claim flow and claim review operations.
- Outreach pipeline for NGOs/clinics/stores.

### Exit Criteria
- [x] Clinic discovery works by city and 24/7 filters.
- [x] Clinic seeding strategy documented and seed data expanded.
- [x] Existing claim submit flow retained with duplicate pending-claim guard.
- [ ] **Remaining:** Claim review/approval tooling for admins — explicit admin review queue + approve/reject/dispute actions with SLA dashboard.
- [ ] Outreach process is documented and actionable (outreach pipeline doc exists in `docs/partners/`).

---

## Phase 4 (Weeks 7-8) — Mission Campaign Surfaces ✅ COMPLETE

### Deliverables
- Home featured initiative module.
- Account/profile mission hub.
- Clear separation of rescue campaigns vs platform initiatives.

### Exit Criteria — All Met
- [x] Campaign classification added (rescue vs initiative).
- [x] Home featured initiative module added.
- [x] Account/profile mission hub section added.
- [x] Campaigns page initiative filter/section added.
- [x] Users can discover/donate to initiatives distinctly.
- [x] Initiative roadmap and use-of-funds are explicit.

---

## Phase 5 (Post-Sprint) — Distribution + Retention

> Items from backlog. Sequenced for after the core 8-week sprint.

### 5A — Social & Discovery
- [ ] Follow graph + following feed tab
- [ ] OG/share SSR surfaces (share pages + OG image generation)
- [ ] External link cards (FB/IG post attribution)

### 5B — Engagement & Coordination
- [ ] Notification center + delivery channels (in-app, push, email)
- [ ] Recurring support model (monthly donations to rescuers/clinics)
- [ ] Volunteer availability + directory + transport requests

### 5C — Trust Hardening
- [ ] Duplicate detection / pHash image matching
- [ ] Verification promotion flow (community → clinic)
- [ ] Analytics dashboards (cases, donations, verification, moderation)

---

## Monitoring and Rollout

- **Cohort launch focus:** Sofia, Varna, Plovdiv (Bulgaria-first).
- **Weekly metric review:** case creation speed, trust conversion, moderation SLA, claim approval time.
- **Feature flags recommended** for: donations, moderation actions, lifecycle transitions.

### Key Metrics to Track
| Metric | Target | Phase |
|--------|--------|-------|
| Time-to-case-created | < 3 min | Phase 1 |
| Stripe test donation e2e | Pass | Phase 2 |
| Report resolution time | < 24h first response | Phase 2 |
| Claim approval cycle | 24h response / 72h resolution | Phase 3 |
| Initiative discovery rate | Track | Phase 4 |
| Repeat donor rate (D30) | Track | Phase 5+ |

---

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Clinic claim admin tooling delayed | Phase 3 incomplete | Prioritize as next sprint item |
| Receipt UX polish blocked on design | Phase 2 lingering | Ship functional receipt, iterate UX |
| SSR share pages need separate infra | Phase 5 delayed | Evaluate serverless OG generation first |
| Volunteer coordination needs privacy review | Phase 5B delayed | Privacy-safe defaults defined in RULES.md |
