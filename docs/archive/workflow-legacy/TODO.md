# Pawtreon — TODO (Execution Backlog)

> **Last updated:** 2026-01-23  
> **Purpose:** single, runnable task list (what we do next).  
> **Workflow:** pick task → propose in `PLAN.md` (Codex → OPUS → decision) → implement → check off → update `ROADMAP.md` + `DECISIONS.md` when needed.

## Legend
- **P0 / P1 / P2 / P3**: roadmap phases (see `ROADMAP.md`)
- **[OPUS]**: requires one OPUS review iteration before implementation
- **AC:** acceptance criteria (what “done” means)

---

## P0 — Investor pitch readiness (Jan 24, 2026)

### Must be flawless (no surprises)
- [ ] Decks load cleanly (`/presentation`, `/partner`) on mobile + desktop  (Round 2)
  - AC: no broken images, no missing translations, no dead buttons, no obvious placeholder copy.
- [ ] Make decks easy to share (Round 2)
  - [ ] Confirm copy-link UX works everywhere (clipboard + fallback prompt)
  - [ ] Decide the “investor share URL” you’ll send (direct route link is fine)
- [ ] Create flow feels real (even if publish is staged) (Round 2)
  - [x] `/create-case` feels like a real flow (validation copy + non-janky steps)
  - [x] `/create-case-ai` “List with AI” preview feels believable (photo step → extracted draft → user review → publish gated/coming-soon)
  - [x] Ensure the Create drawer labels/descriptions are polished and consistent
- [ ] Community feels credible (Round 2)
  - [x] Ensure the community page has a visible “rules/safety” section or pinned post
  - [x] Ensure users can report concerns from community content (Phase 1 can be “coming soon”)
- [ ] Investor doc placeholders removed (`docs/investor/*`) (Cut from Round 2; do manually if needed for pitch)
  - [ ] Contact email + intro
  - [ ] Ask amount + use-of-funds matched to Phase 1 milestones
  - [ ] Timeline + near-term milestones consistent with `ROADMAP.md`
- [ ] Pitch QA checklist (15 minutes) (Round 2)
  - [x] Run `pnpm build`
  - [ ] Smoke: feed → case → donate → success
  - [ ] Smoke: create → list with AI preview
  - [ ] Smoke: community → view posts
  - [ ] Smoke: profile edit route loads

### Shipped in Round 1 (leave stable unless we decide otherwise)
- [x] Verification badge displayed on case cards + case detail
- [x] “Report concern” entry points (card menu + case detail header) + report submission
- [x] No raw i18n keys in navigation/create critical paths (fallbacks added)
- [x] Donation flow drawer opens from case detail and completes a full UX loop

---

## P0 — Immediate polish after the pitch (1–3 days)

### Security hotfixes (must land before real users)
- [ ] Fix unauthenticated onboarding/role tampering paths in Convex (`convex/users.ts`) [OPUS]
  - AC: `completeOnboarding` requires auth; no email/clerkId “escape hatches” in public functions.
- [ ] Gate or internalize dev-only Convex endpoints (`convex/users.ts` list/reset) [OPUS]
  - AC: `listAll`/`resetOnboarding` are not callable by normal clients.
- [ ] Remove PII leakage from volunteer/public endpoints (`convex/volunteers.ts`) [OPUS]
  - AC: no public query returns user email; public profile shape is explicit.
- [ ] Make “internal use” mutations truly internal (`convex/achievements.ts` award, etc.) [OPUS]
  - AC: achievements cannot be self-awarded via direct client calls.

### Trust polish (low effort, high impact)
- [x] Add "What this means" explainer for verification ladder (tooltip/dialog) [OPUS]
  - AC: users can understand Unverified vs Community vs Clinic in <10 seconds.
  - Done: Added `showExplainer` prop to `VerificationBadge` with tooltip explaining each status. Enabled on case detail page.
- [x] Add lightweight "Reported / under review" internal-only badge (ops visibility) [OPUS]
  - Done: Created `ReportedBadge` component (ops-only visibility via role check). Shows "Reported" or "Under review" based on report status. Integrated into TwitterCaseCard and CaseCard. Added `getCasePendingReportStatus` Convex query.
- [ ] Add a minimal moderation queue screen (Phase 1 may expand)

### No dead ends / no fake trust breaks
- [ ] Audit nav/CTAs: every link lands on real UI or clear “Coming soon” screen (no 404s)
- [ ] Replace hardcoded badge counts (notifications/posts) with:
  - [ ] real Convex data, or
  - [ ] hide badges until real (preferred for trust)

### Feed (“Instagram alive” feeling) [OPUS]
- [x] Decide final feed card layout (TwitterCaseCard vs InstagramCaseCard vs unified)
  - Decision: TwitterCaseCard is the standard feed card. InstagramCaseCard adds carousel complexity not needed for MVP. CaseCard is too basic (no poster header). See PLAN.md Round 3.
- [x] Card density experiment: test `aspect-[3/2]` vs `aspect-video` and keep only if better
  - AC: ~2 cards visible per screen on modern phones without feeling cramped.
  - Decision: Keep `aspect-video` (16:9) — already shows ~2 cards per screen. No change needed.
- [x] Stories row behavior: visible near top, not sticky, doesn't steal scroll space
  - AC: no jitter/buggy hide animations on desktop.
  - Verified: HomeHeaderV2 renders stories via `topContent` prop above sticky search bar. Stories scroll away naturally (not sticky). No jitter.

---

## P1 — MVP launch (2–6 weeks) — “real money, real trust”

### Cases (create + publish)
- [ ] Uploads + storage: camera/upload → storage IDs → case creation (real)
- [ ] Drafts: save draft locally (or in Convex) + resume later
- [ ] Create Case validations (goals, location, required evidence)
- [ ] Case updates: rescuer updates + clinic updates + evidence attachments
- [ ] Case close-out: outcome + receipts + transparency (funded/closed)

### Donations (real payments + receipts)
- [ ] Pick provider (Stripe recommended) + implement real checkout
- [ ] Receipt + donation history backed by real transactions
- [ ] Donation gating rules per `TRUST-SAFETY.md` (unverified/high-risk behavior)

### Trust & Safety (minimum ops tooling)
- [ ] Moderation queue UI (reports list → review → status change)
- [ ] Duplicate media detection (pHash) + suspicious scoring signals
- [ ] Clinic verification workflow:
  - [ ] clinic account verification
  - [ ] case “Clinic ✓” confirmation + clinic-authored updates
- [ ] Rate limits on abuse-prone endpoints (reports, AI, uploads)

### Community + social primitives
- [ ] Community post reporting + basic moderation actions
- [ ] External source attribution (safe default):
  - [ ] link cards (FB/IG URL → preview → link out)
  - [ ] no scraping/caching restricted media

### Profiles + onboarding
- [ ] Multi-role badges (donor + volunteer + clinic + store) without re-signup
- [ ] “Claim clinic/store” flows for partners/professionals
- [ ] Profile completeness UX (lightweight, optional)

---

## P2 — Growth (6–12 weeks)
- [ ] Follow system + “Following” feed tab
- [ ] Recurring support (Patreon-like): support rescuers/clinics monthly
- [ ] Volunteer coordination (privacy-safe)
  - [ ] Availability status visibility controls (available/busy/offline)
  - [ ] Local map/directory view (approximate location by default)
  - [ ] Transport requests + “who can help nearby” surfaces
- [ ] Share/SEO layer:
  - [ ] SSR share pages with OpenGraph per-case (mini Next.js or serverless)
  - [ ] OG image generation

---

## P3 — AI acceleration (parallel track; only after trust primitives)

### “List with AI” (HITL, never auto-publish)
- [ ] Server-side AI pipeline (Convex action) that extracts: species, urgency, summary, suggested goal range, evidence checklist
- [ ] Review screen: highlight confidence + required user confirmations
- [ ] AI scam signals (dup image, suspicious text) as a *signal*, not a decision

### “Need help now” assistant (safety constrained)
- [ ] Non-diagnostic triage flows + escalation UX
- [ ] Hard safety rules: no dosing/invasive instructions; always emergency guidance

---

## Mobile → Native (Capacitor path)
- [ ] Camera capture UX + native share sheet
- [ ] Push notifications strategy (provider + permission UX)
- [ ] Offline-safe drafts for case creation (optional)
