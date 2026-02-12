# Pawtreon — Product Requirements Document (PRD)

> **Owner:** Product (Human) + OPUS  
> **Status:** final  
> **Last updated:** 2026-02-12

---

## One‑liner

**Pawtreon** is a trust-first, mobile-first fundraising + community app for animals in need — built like an **Instagram feed** for discovery and updates, with **Patreon-like recurring support** for rescuers and partners.

## Mission

Help animals get emergency care **faster** by making it easy to:

1. Create credible cases in minutes
2. Fund them safely
3. Verify and update transparently
4. Coordinate help locally

## The Problem

- Rescue posts are fragmented across Facebook/Instagram; urgent cases get lost in algorithmic feeds.
- Donor trust is low because scams and reposts are common — no verification, no receipts, no accountability.
- Clinics and rescuers lack a simple workflow for verification, updates, and transparent progress tracking.
- Generic crowdfunding (GoFundMe, etc.) isn't built for the "on-the-street rescue" reality — no urgency tiers, no clinic verification, no local coordination.
- Volunteers willing to help (transport, fostering) have no reliable way to find nearby cases or signal availability.

## Product Principles (Non‑Negotiable)

1. **Trust before growth**: verification + evidence + reporting are first-class citizens. Every surface that touches money or credibility must earn trust before optimizing for reach.
2. **Mobile-first speed**: "found animal → case drafted" should take minutes, not hours. The creation flow must work one-handed on a phone in the street.
3. **Human-in-the-loop**: AI can assist (draft extraction, triage hints), but never publishes or diagnoses automatically. A human reviews and approves every case and every AI suggestion.
4. **Transparency wins**: updates + receipts + outcomes are the product. Donors see where money goes. Supporters see treatment progress. Everyone sees the outcome.
5. **Social consolidation**: social links are inputs; Pawtreon becomes system-of-record. Facebook/Instagram posts can be referenced, but Pawtreon owns the verified, structured version of the rescue story.

---

## Users & Roles (Multi-Capability Profiles)

Users sign up once and can hold multiple capabilities (not a single "type"). Capabilities are acquired through onboarding choices, profile settings, and verification pathways.

| Role | Who They Are | What They Can Do |
|------|-------------|-----------------|
| **Finder / Good Samaritan** | Spots an animal in distress, needs quick help | Create a case, attach photos/location, request help from nearby volunteers |
| **Rescuer** | Active rescue community member, creates and manages cases | Create cases, post structured updates with evidence, manage case lifecycle through treatment → adoption → closure |
| **Donor** | Wants fast donation + proof + outcomes | Browse feed, donate to cases/campaigns, track donation history, receive receipts, follow case updates |
| **Volunteer** | Transport, fostering, events, social media help | Set availability status, appear in volunteer directory, respond to transport requests, track hours and impact |
| **Professional** | Individual vet, groomer, trainer | Claim professional profile, provide verified case updates, appear in service directory |
| **Business / Organization** | Clinic, pet store, shelter, hotel | Claim org profile, verify cases with clinical evidence, manage team members, appear in partner directory |
| **Sponsor / Brand** | Corporate giving, campaign matching | Fund campaigns, match donations, get visibility on sponsored surfaces |
| **Moderator / Admin** | Ops, trust, review | Process moderation queue, approve/reject clinic claims, manage verification status, audit logs |

---

## Core Objects (Data Model Level)

| Object | Purpose |
|--------|---------|
| **Case** | Fundraising + rescue record: photos, story, location, goal, status, urgency, verification level |
| **Update** | Timestamped progress + evidence on a case: type (medical/milestone/update/success), clinic attribution, photos |
| **Donation** | Payment + receipt + attribution: amount, currency, Stripe IDs, anonymous flag, message |
| **Profile (User)** | User identity + capabilities + badges + impact stats + verification status |
| **Organization** | Clinics/shelters/partners: verification capabilities, claim status, team members |
| **Campaign** | Fundraising container: rescue campaigns (tied to cases) or initiative campaigns (platform missions like drone program, safehouse) |
| **Community Post** | Forum content: title, body, images, case link, city tag, category (urgent_help/case_update/adoption/advice/general/announcements) |
| **Clinic / Pet Service** | Directory entries: name, city, address, phone, 24h flag, specializations, verified status |
| **Volunteer** | Volunteer profile: capabilities, availability status, city, stats (animals helped, hours, adoptions) |
| **Achievement** | Badge/gamification: category (donation/verification/volunteer/special), unlock conditions, awarded-by |
| **Notification** | In-app/push/email alerts: type (donation_received/case_update/achievement_unlocked/campaign_ended/system), read status |
| **Report** | Scam/abuse/duplicate flags for human review: reason, status, resolution, audit trail |
| **External Source** | Social link (FB/IG/etc.) attached to a case/post as evidence |
| **Message** | 1:1 direct message between users (post-MVP) |

---

## Core Loops

### 1) Rescue Loop (Creator Loop)
See animal → create case → verification → updates with evidence → outcome → credibility increases → more trust for next case.

### 2) Donor Loop (Trust Loop)
Discover case in feed → trust signals (verification badge, clinic attribution, update history) → donate → follow updates → see outcome + receipt → share → repeat with confidence.

### 3) Network Loop (Social Consolidation)
Social post link → link card / attribution → community verification → native updates in Pawtreon → Pawtreon becomes system-of-record.

### 4) Volunteer Loop (Coordination)
Set availability → receive transport/foster request → help animal → earn impact stats + badges → recognition → continued engagement.

---

## MVP Scope (Phase 1: "Real Money, Real Trust")

### Must Ship (Core)
- **Home feed** that feels social (fast + "alive") and prioritizes urgent cases
- **Case page**: story, progress, updates timeline, trust indicators, donate CTA
- **Create case (manual)**: photos + location + goal + story + submit/publish
- **Donations end-to-end**: Stripe hosted checkout, receipts, donation history
- **Trust signals v1**:
  - Verification status ladder (unverified → community verified → clinic verified)
  - Reports flow + moderation queue (manual ops is fine initially)
- **Sharing**: share links and clean in-app share UX; plan for SSR OpenGraph share pages

### Should Ship (High ROI)
- **Community**: rules/pinned post, credible content formats, reporting entry points
- **Profiles**: public profile, impact stats, role badges (editable later)
- **Notifications**: case updates and donation receipts

---

## Growth Surface (Phase 2: "Distribution + Retention")

- **External link cards** for FB/IG posts (safe default) and source attribution
- **Follow**: follow rescuers/clinics; "following" feed tab
- **Recurring support**: recurring donations to cases/campaigns; Patreon-like "support this rescuer/clinic monthly" (after trust primitives)
- **Volunteer coordination (privacy-safe)**:
  - Live availability status (`available` / `busy` / `offline`) with user-controlled visibility
  - Map/directory view (approximate location by default; never show precise home location)
  - Transport requests and "who can help nearby" surfaces (after trust primitives)
- **SEO/OG**: SSR share pages + OG images for virality
- **Clinic onboarding**: claim/verify clinic flow with admin review queue

---

## AI Acceleration (Phase 3: "Speed + Scam Resistance")

### AI-Assisted Case Creation ("List with AI")
Photo(s) → structured draft (species/urgency/title/story) → user review → publish. Never auto-publishes.

### "Need Help Now" Assistant (Safety Constrained)
Non-diagnostic triage + checklists + escalation to real clinics/resources. No dosing, no invasive procedures, no diagnoses.

### AI Fraud Signals (Never Sole Authority)
Duplicate detection, pattern scoring, suspicious text/image signals → flags for human review only.

---

## Non-Goals (For Now)

- Drone scouting / livestream operations (moonshot; only after trust + ops are strong — treated as mission initiative with dedicated funding)
- Full shelter CRM suite
- Chat-first "everything is messaging" product (messaging will be added as a feature, not as the core paradigm)
- Framework migration away from Vite + React SPA

---

## Success Metrics (Early)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time-to-case-created | < 3 minutes for basic draft | Timestamp: page load → publish |
| Case view → donate conversion | Track, no target yet | Funnel analytics |
| Repeat donor rate | Track D30/D90 | Cohort analysis |
| Verification rate | Cases that become community/clinic verified | Status transitions |
| Report resolution time | < 24h first response | Moderation queue metrics |
| False positive rate (reports) | Track, minimize | Resolution outcomes |
| Share rate per case | Track downstream installs/opens | Share events + attribution |
| Claim approval cycle time | 24h first response, 72h resolution | Claim queue metrics |
| Time to first case update | Track after publish | Update timestamps |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Scams / reposts** | Verification ladder, external source attribution, reporting, risk scoring, audit logging |
| **Medical liability** | Disclaimers, safe prompts, no dosing/invasive instructions, escalation UX, "contact vet NOW" for emergencies |
| **Clinic adoption** | Minimal workflow, clear benefit (trust + less inbound chaos), partner incentives, seeded directory |
| **Donor fatigue** | Transparent outcomes, impact stats, success story surfacing, receipts |
| **Platform abuse** | Rate limiting, content policies, moderation queue, block/report primitives |
| **Data privacy (EU/GDPR)** | No PII in public APIs, city-level location only, opt-in availability, data export readiness |

---

## Open Decisions

| Decision | Status | Notes |
|----------|--------|-------|
| Donation gating rules for unverified/high-risk cases | Partially decided | Soft-gated with warning (per RULES.md verification ladder); exact thresholds TBD |
| Recurring support model (case-based vs creator-based vs both) | Open | Need to decide before P2 recurring work |
| Moderation ops SLA and on-call | Open | Queue exists, SLA targets defined (24h/72h), ops staffing TBD |
| petServices vs clinics table merge | Decided | Kept separate — different trust requirements and discovery patterns (DECISIONS.md 2026-02-08) |

---

## Feature Checklist (Canonical)

> **This is the single source of truth for what's built.**
> Mark `[x]` only when the feature is real (no dead CTAs, no broken routes).

### P0 — Foundation (Done)
- [x] AUTH — Clerk authentication → [spec](docs/features/onboarding-spec.md)
- [x] HOME FEED — Instagram-like case discovery → [spec](docs/features/search-discovery-spec.md)
- [x] CASE PAGE — Story, updates timeline, trust indicators, donate CTA → [spec](docs/features/cases-spec.md)
- [x] CASE CARDS — Verification badges, report menu → [spec](docs/features/cases-spec.md)
- [x] CREATE CASE UI — Photos, location, goal, story (UI only) → [spec](docs/features/cases-spec.md)
- [x] LIST WITH AI — Preview flow (photo → draft → review) → [spec](docs/features/cases-spec.md)
- [x] DONATION MODAL — Amount → method → confirm → success (preview) → [spec](docs/features/donations-spec.md)
- [x] COMMUNITY — Rules/safety section, report entry points → [spec](docs/features/community-spec.md)
- [x] PROFILES — Basic profile page, role display → [spec](docs/features/profiles-spec.md)
- [x] I18N — Multi-language support, fallbacks → [spec](docs/design/i18n-spec.md)

### P1 — MVP ("Real Money, Real Trust")
- [x] CREATE CASE PUBLISH — Wire to Convex, photos to storage → [spec](docs/features/cases-spec.md)
- [x] DONATIONS — Stripe hosted checkout + webhook completion + post-checkout return banner + receipt links → [spec](docs/features/donations-spec.md)
- [~] TRUST: VERIFICATION — Unverified → community → clinic ladder (community endorsements + clinic evidence + admin override; automation pending) → [spec](docs/features/cases-spec.md)
- [x] TRUST: MODERATION — Report queue, admin review, actions, audit logging → [spec](docs/features/admin-moderation-spec.md)
- [~] TRUST: DUPLICATE DETECTION — v0 sha256 exact-match flags + report; pHash matching pending → [spec](docs/features/admin-moderation-spec.md)
- [x] CASE UPDATES — Rescuer + clinic updates, evidence attachments, structured update types → [spec](docs/features/cases-spec.md)
- [x] CASE OUTCOMES — Close-out flow, lifecycle transitions (active_treatment → seeking_adoption → closed) → [spec](docs/features/cases-spec.md)
- [x] SHARING — OG meta tags + SSR share pages (`/share/case/:id`)
- [x] NOTIFICATIONS — Case updates, donations (received/confirmed), clinic claim review → [spec](docs/features/notifications-spec.md)

### P2 — Growth
- [x] MISSION INITIATIVES — Dedicated initiative campaign classification + surfaces → [spec](docs/features/campaigns-spec.md)
- [ ] FOLLOW — Follow rescuers/clinics, "following" feed tab
- [ ] RECURRING — Monthly support for rescuers/clinics → [spec](docs/features/donations-spec.md)
- [ ] EXTERNAL LINKS — FB/IG link cards, source attribution
- [ ] VOLUNTEER: AVAILABILITY — Opt-in status (available/busy/offline) → [spec](docs/features/volunteers-spec.md)
- [ ] VOLUNTEER: DIRECTORY — Approximate location map → [spec](docs/features/volunteers-spec.md)
- [ ] VOLUNTEER: TRANSPORT — "Who can help nearby" requests → [spec](docs/features/volunteers-spec.md)
- [x] CLINIC ONBOARDING — Claim submit + admin review queue + claimant notification → [spec](docs/features/clinics-spec.md)
- [ ] ANALYTICS — Cases, donations, verification dashboards → [spec](docs/systems/analytics-spec.md)

### P3 — AI Acceleration
- [ ] AI CASE CREATION — Server-side extraction, confidence hints
- [ ] AI SCAM SIGNALS — Pattern scoring, duplicate detection
- [ ] NEED HELP NOW — Non-diagnostic triage, emergency escalation

### Future (Not Now)
- [ ] DRONE SCOUTING — Livestream operations (moonshot, mission initiative) → [spec](docs/missions/drone-program-spec.md)
- [ ] SHELTER CRM — Full management suite
- [ ] MESSAGING — In-app chat system → [spec](docs/features/messaging-spec.md)

> **Legend:** `[x]` = shipped, `[~]` = partially done, `[ ]` = not started

---

## Related Docs

| Doc | Purpose | Path |
|-----|---------|------|
| Current sprint | What we're doing NOW | `TASKS.md` |
| Architecture + patterns | Stack, data model, conventions | `DESIGN.md` |
| Trust/safety + UX rules | Non-negotiable constraints | `RULES.md` |
| Decision log | Why we decided what | `DECISIONS.md` |
| Workflow contract | Agent roles + process | `AGENTS.md` |
| Product roadmap | Phased delivery timeline | `docs/product/roadmap.md` |
| Product thesis | North star + scope | `docs/product/master-plan.md` |
| Feature specs | Per-feature specs | `docs/features/` |


