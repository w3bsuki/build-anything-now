# Pawtreon — Tasks

> **Purpose:** Current sprint only. What we're doing NOW.  
> **Rule:** Archive completed items weekly. Don't accumulate history.  
> **Last updated:** 2026-01-23

---

## In Progress

*(none)*

---

## P1 Sprint — MVP ("real money, real trust")

These must ship before launch. Ordered by dependency/priority:

### Money (Critical Path)
- [ ] **DONATIONS: Stripe integration**
  - Stripe account + API keys
  - `createPaymentIntent` mutation
  - Webhook handler for payment confirmation
  - Update case `raised` amount on success
  - Receipt generation + email (or in-app)
  - AC: Real €5 donation completes end-to-end

### Trust (Critical Path)
- [ ] **MODERATION: Report queue (admin)**
  - Admin-only page listing pending reports
  - Review UI: see case/user, reason, reporter
  - Actions: resolve (hide case, warn user) or dismiss
  - AC: Admin can process reports

- [ ] **VERIFICATION: Community verify flow**
  - "I can verify this" button for trusted users
  - Threshold logic (e.g., 3 verifications → community verified)
  - Badge update on case
  - AC: Case moves from unverified → community verified

- [ ] **DUPLICATE DETECTION: pHash matching**
  - Generate pHash on image upload
  - Check against existing case images
  - Flag potential duplicates for review
  - AC: Uploading same image twice triggers warning

### Case Lifecycle
- [ ] **CASE UPDATES: Rescuer updates**
  - "Add update" button on case detail (owner only)
  - Text + optional images
  - Timeline shows updates chronologically
  - AC: Owner can post updates, donors see them

- [ ] **CASE OUTCOMES: Close-out flow**
  - "Close case" with outcome (success/transferred/other)
  - Final update + receipts/evidence
  - Case marked closed, no more donations
  - AC: Case lifecycle is complete

### Distribution
- [ ] **SHARING: OG meta tags**
  - SSR share pages OR serverless OG image generation
  - Title, description, image from case
  - AC: Sharing case link shows rich preview on FB/Twitter

- [ ] **NOTIFICATIONS: Core alerts**
  - Case update notifications (for donors/followers)
  - Donation receipt notifications
  - In-app notification center (or email fallback)
  - AC: Donor notified when case they supported gets update

### Security (Pre-Launch)
- [ ] **SECURITY: Lock down dev endpoints**
  - `listAll`, `resetOnboarding` → internalMutation only
  - Audit all queries for PII leakage
  - AC: No sensitive data in public API responses

---

## Blocked

- [ ] **CLINIC: Verification workflow**
  - Waiting on: Partner API spec / clinic onboarding flow
  - Unblocks: Clinic-verified badge, clinic-authored updates

---

## Done (This Sprint)

- [x] **CREATE CASE: Wire publish to Convex** — Photos → storage → mutation → feed
- [x] Verification badges on case cards + detail
- [x] Report concern flow (card menu + detail header)
- [x] i18n fallbacks for critical paths
- [x] Donation modal flow (preview UX)
- [x] Create case UI (validation, steps)
- [x] "List with AI" preview flow
- [x] Community rules/safety section

---

## P2 Backlog (Post-MVP)

Not in current sprint, but tracked for planning:

- [ ] FOLLOW — Follow rescuers/clinics, "following" feed tab
- [ ] RECURRING — Monthly support for rescuers/clinics
- [ ] EXTERNAL LINKS — FB/IG link cards, source attribution
- [ ] VOLUNTEER: AVAILABILITY — Opt-in status
- [ ] VOLUNTEER: DIRECTORY — Approximate location map
- [ ] VOLUNTEER: TRANSPORT — "Who can help nearby"
- [ ] CLINIC ONBOARDING — Claim/verify clinic flow
- [ ] ANALYTICS — Dashboards for cases, donations, verification
