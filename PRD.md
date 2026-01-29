# Pawtreon — Product Requirements Document (PRD)

> **Last updated:** 2026-01-23  
> **Stage:** Pre-launch (investor pitch preview → MVP launch)  
> **Canonical name:** Pawtreon

## One‑liner
**Pawtreon** is a trust-first, mobile-first fundraising + community app for animals in need — built like an **Instagram feed** for discovery and updates, with **Patreon-like recurring support** for rescuers and partners.

## Mission
Help animals get emergency care **faster** by making it easy to:
1) create credible cases in minutes, 2) fund them safely, 3) verify and update transparently, 4) coordinate help locally.

## The problem
- Rescue posts are fragmented across Facebook/Instagram; urgent cases get lost.
- Donor trust is low because scams and reposts are common.
- Clinics and rescuers lack a simple workflow for verification, updates, and accountability.
- Generic crowdfunding isn’t built for “on-the-street rescue” reality.

## Product principles (non‑negotiable)
1. **Trust before growth**: verification + evidence + reporting are first-class.
2. **Mobile-first speed**: “found animal → case drafted” should take minutes.
3. **Human-in-the-loop**: AI can assist, but never publishes or diagnoses automatically.
4. **Transparency wins**: updates + receipts + outcomes are the product.
5. **Social consolidation**: social links are inputs; Pawtreon becomes system-of-record.

## Users & roles (multi-role profiles)
Users can hold multiple roles (badges), not a single “type”:
- **Finder / Good Samaritan**: finds an animal, needs quick help.
- **Rescuer / Volunteer**: creates cases, coordinates help, posts updates.
- **Donor**: wants fast donation + proof + outcomes.
- **Clinic / Partner**: verifies cases and posts medical updates; enables trust.
- **Shelter / Organization**: ongoing cases, campaigns, and adoption workflows.
- **Pet shop / Store**: provides supplies, drop-off points, sponsorship, and local distribution.
- **Sponsor / Brand**: funds campaigns, matches donations, provides resources.
- **Moderator / Admin**: reviews reports, manages fraud, enforces policy.

## Core objects (data model level)
- **Case**: a fundraising + rescue record (photos, story, location, goal, status).
- **Update**: timestamped progress + evidence (clinic-verified where possible).
- **Donation**: payment + receipt + attribution; supports anonymous donors.
- **Profile**: user identity + badges + impact stats.
- **Organization**: clinics/shelters/partners (verification capabilities).
- **External source**: a social link (FB/IG/etc) attached to a case/post as evidence.
- **Report**: scam/abuse/duplicate flags for human review.

## Core loops (what makes Pawtreon a “living” social product)
### 1) Rescue loop (creator loop)
See animal → create case → verification → updates → outcome → credibility increases.

### 2) Donor loop (trust loop)
Discover case in feed → trust signals → donate/subscribe → follow updates → share → repeat.

### 3) Network loop (social consolidation)
Social post link → link card / attribution → community verification → native updates in Pawtreon.

## MVP scope (Phase 1: “real money, real trust”)
### Must ship (core)
- **Home feed** that feels social (fast + “alive”) and prioritizes urgent cases.
- **Case page**: story, progress, updates timeline, trust indicators, donate CTA.
- **Create case (manual)**: photos + location + goal + story + submit/publish.
- **Donations end-to-end**: checkout, receipts, donation history.
- **Trust signals v1**:
  - verification status ladder (unverified → community verified → clinic verified)
  - reports flow + basic moderation queue (manual ops is fine initially)
- **Sharing**:
  - share links and a clean in-app share UX
  - plan for SSR OpenGraph share pages (can be separate project; no full rewrite)

### Should ship (high ROI)
- **Community**: rules/pinned post, credible content formats, reporting entry points.
- **Profiles**: public profile, impact stats, role badges (editable later).
- **Notifications**: case updates and donation receipts.

## Growth surface (Phase 2: “distribution + retention”)
- **External link cards** for FB/IG posts (safe default) and source attribution.
- **Follow**: follow rescuers/clinics; “following” feed tab.
- **Recurring support**:
  - recurring donations to cases/campaigns
  - Patreon-like “support this rescuer/clinic monthly” (after trust primitives).
- **Volunteer coordination (privacy-safe)**:
  - live availability status (`available` / `busy` / `offline`) with user-controlled visibility
  - map/directory view (approximate location by default; never show precise home location)
  - transport requests and “who can help nearby” surfaces (after trust primitives)
- **SEO/OG**: SSR share pages + OG images for virality.

## AI acceleration (Phase 3: “speed + scam resistance”)
### AI-assisted case creation (“List with AI”)
Photo(s) → structured draft (species/urgency/title/story) → user review → publish.

### “Need help now” assistant (safety constrained)
Non-diagnostic triage + checklists + escalation to real clinics/resources.

### AI fraud signals (never sole authority)
Duplicate detection, pattern scoring, suspicious text/image signals → flags for review.

## Non-goals (for now)
- Drone scouting / livestream operations (moonshot; only after trust + ops are strong).
- Full shelter CRM suite.
- Chat-first “everything is messaging” product (we can add messaging later).

## Success metrics (early)
- Time-to-case-created (target: < 3 minutes for a basic draft).
- Conversion: case view → donate.
- Repeat donor rate (D30/D90).
- Verification rate (cases that become community/clinic verified).
- Report resolution time + false positive rate.
- Share rate per case + downstream installs/opens.

## Risks & mitigations
- **Scams / reposts** → verification ladder, external source attribution, reporting, risk scoring.
- **Medical liability** → disclaimers, safe prompts, no dosing/invasive instructions, escalation UX.
- **Clinic adoption** → minimal workflow, clear benefit (trust + less inbound chaos), partner incentives.

## Open decisions (needs a crisp “yes/no”)
- Donation gating rules for unverified/high-risk cases.
- Recurring support model (case-based vs creator-based vs both).
- Moderation ops: SLA and who is “on-call” for urgent reports.

---

## Feature Checklist (Canonical)

> **This is the single source of truth for what's built.**  
> Mark `[x]` only when the feature is real (no dead CTAs, no broken routes).

### P0 — Foundation (Done)
- [x] AUTH — Clerk authentication
- [x] HOME FEED — Instagram-like case discovery
- [x] CASE PAGE — Story, updates timeline, trust indicators, donate CTA
- [x] CASE CARDS — Verification badges, report menu
- [x] CREATE CASE UI — Photos, location, goal, story (UI only)
- [x] LIST WITH AI — Preview flow (photo → draft → review)
- [x] DONATION MODAL — Amount → method → confirm → success (preview)
- [x] COMMUNITY — Rules/safety section, report entry points
- [x] PROFILES — Basic profile page, role display
- [x] I18N — Multi-language support, fallbacks

### P1 — MVP ("real money, real trust")
- [x] CREATE CASE PUBLISH — Wire to Convex, photos to storage
- [ ] DONATIONS — Stripe checkout, receipts, history (real)
- [ ] TRUST: VERIFICATION — Unverified → community → clinic ladder
- [ ] TRUST: MODERATION — Report queue, admin review, actions
- [ ] TRUST: DUPLICATE DETECTION — pHash image matching
- [ ] CASE UPDATES — Rescuer + clinic updates, evidence attachments
- [ ] CASE OUTCOMES — Close-out flow, receipts, transparency
- [ ] SHARING — OG meta tags, SSR share pages
- [ ] NOTIFICATIONS — Case updates, donation receipts

### P2 — Growth
- [ ] FOLLOW — Follow rescuers/clinics, "following" feed tab
- [ ] RECURRING — Monthly support for rescuers/clinics
- [ ] EXTERNAL LINKS — FB/IG link cards, source attribution
- [ ] VOLUNTEER: AVAILABILITY — Opt-in status (available/busy/offline)
- [ ] VOLUNTEER: DIRECTORY — Approximate location map
- [ ] VOLUNTEER: TRANSPORT — "Who can help nearby" requests
- [ ] CLINIC ONBOARDING — Claim/verify clinic flow
- [ ] ANALYTICS — Cases, donations, verification dashboards

### P3 — AI Acceleration
- [ ] AI CASE CREATION — Server-side extraction, confidence hints
- [ ] AI SCAM SIGNALS — Pattern scoring, duplicate detection
- [ ] NEED HELP NOW — Non-diagnostic triage, emergency escalation

### Future (Not Now)
- [ ] DRONE SCOUTING — Livestream operations (moonshot)
- [ ] SHELTER CRM — Full management suite
- [ ] MESSAGING — In-app chat system

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| `TASKS.md` | Current sprint |
| `DESIGN.md` | Architecture + patterns |
| `RULES.md` | Trust/safety + UX rules |
| `DECISIONS.md` | Decision log |
| `AGENTS.md` | Workflow contract |
