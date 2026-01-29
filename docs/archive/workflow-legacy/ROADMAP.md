# 🗺️ Planmode: Investor-Ready Roadmap + TODO (Pawtreon)

> **Today:** Jan 23, 2026  
> **Investor pitch:** Jan 24, 2026  
> **Objective:** Present a crisp, trust-first rescue fundraising product with a believable execution plan.

---

## 0) Quick links (in-app)
- Investor deck (interactive): `/presentation`
- Partner deck (interactive): `/partner`

---

## 1) “Tomorrow-ready” checklist (highest ROI)

### A) Pitch flow (what must work in the pitch)
- [ ] Home feed loads fast and looks “social”
- [ ] Open a case → see story, updates, donate CTA, trust indicators
- [ ] Create flow is non-broken (even if gated/“coming soon” for publishing)
- [ ] Community page shows credible content + rules/pinned post
- [ ] Deck routes are reachable and branded consistently

### B) Credibility polish (low effort, high impact)
- [x] Pick a single name everywhere (**Pawtreon**)
- [ ] No dead ends: every nav/CTA leads to real UI (sample data OK) or a clear “Coming soon” screen (no 404s)
- [x] No dead CTAs: Donate opens a full donation flow (modal/sheet) + success state
- [x] No raw i18n keys visible (`nav.*`, `actions.*` etc) — add missing translations or fallbacks
- [ ] Replace placeholder contact details in investor docs
- [ ] Ensure the “Ask” amount + use-of-funds matches your near-term milestones

### C) Narrative (investor clarity)
- [ ] 1-sentence positioning: “Trust-first emergency care crowdfunding for street animals”
- [ ] 3 moats: clinic verification, fraud prevention, social consolidation
- [ ] Clear wedge market (geo + partner type) and expansion path

---

## 2) Decisions to lock (before building more)
- [x] **Brand:** Pawtreon (canonical name everywhere)
- [ ] **Web stack:** keep Vite app; add SSR share pages (recommended) — see `TECH-STACK.md`
- [ ] **Trust model:** donation gating for unverified cases (yes/no)
- [ ] **Onboarding:** minimal friction at signup + role badges editable later (recommended)

---

## 3) Roadmap (phased, believable)

### Phase 0 — Investor pitch preview polish (1–3 days)
- [x] Make decks easy to find/share (and consistent)
- [x] Fix broken navigation paths (`/profile/edit`, `/messages/:id`, etc.)
- [x] Donation modal flow (amount → method → confirm → success) wired from case detail
- [x] Make the Create flows feel real (even if publish is staged)
- [x] Add “Trust” UI (verification status badges, reporting entry points)
- [x] Make language banner dismissible and non-annoying (persist choice)

### Phase 1 — MVP launch (2–6 weeks)
**Goal:** real cases, real donations, real updates, real trust signals.
- [ ] Create Case publish (photos → storage → Convex case create)
- [ ] Donations (payment provider, receipts, transaction audit trail)
- [ ] Clinic verification workflow (case confirmation + updates)
- [ ] Notifications (case updates, donation receipts)
- [ ] Moderation + reports queue (manual ops first)
- [ ] Share pages (OpenGraph per case)

### Phase 2 — Trust + Growth (6–12 weeks)
- [ ] Social sharing + source attribution
- [ ] Volunteer tools (availability, transport requests, privacy-safe local map/directory)
- [ ] Faster onboarding for shelters/clinics/partners
- [ ] Analytics + dashboards (cases, donations, verification)

### Phase 3 — AI acceleration (parallel track)
See: `TRUST-SAFETY.md`

### Phase 4 — “Moonshots” (investor optional)
- Live map at scale, dispatch tooling, partnerships
- Drone scouting / livestream experiments (only after core trust + ops work)

---

## 4) Engineering TODO list (by area)

### Trust & Safety (should be top-3 priority)
- [ ] Verification status + display rules
- [ ] Duplicate image detection + suspicious pattern scoring
- [ ] Reporting + admin review queue
- [ ] “Donations allowed?” gating rules per risk/verification

### Core product
- [ ] Create Case publish end-to-end
- [ ] Case updates (clinic + rescuer)
- [ ] Donation flow end-to-end
- [ ] Search that feels instant (cases, clinics, partners, community)

### Social feed (make it feel like a real network)
- [ ] Consistent “post card” design across cases/community
- [ ] Likes/comments/share primitives (don’t fake counts in production)
- [ ] External link cards (Phase 0)

### AI features (after trust primitives exist)
- [ ] AI draft generation from photos (action) + review UI
- [ ] “Need Help” triage + safety constraints + escalation UX
- [ ] AI-assisted scam detection as a signal (never as sole authority)

### Mobile → Native
- [ ] Camera capture UX (Capacitor), share sheet, haptics
- [ ] Push notifications strategy
- [ ] Offline-safe draft case creation (optional)

### Metrics (for investors)
- [ ] DAU/MAU, retention, donation conversion funnel
- [ ] Case verification rate, fraud flag rate
- [ ] Partner funnel: contacted → onboarded → verified → active

---

## 5) Docs to finalize for the pitch
- [ ] Fill real numbers/placeholders in `docs/investor/*`
- [ ] Update roadmap to include trust + AI + social consolidation
- [ ] Add a 1-page “Investor One Pager” (optional)
