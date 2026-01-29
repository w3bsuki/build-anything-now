# Decisions

This file tracks project-wide decisions that affect the whole repo. When a decision is made, add a dated entry under “Log”.

## Open decisions

- **Package manager:** pnpm vs npm (recommend pnpm; repo currently has multiple lockfiles)
- **Auth strategy:** Clerk → Convex identity + user sync approach (webhook/internal mutation vs client upsert)
- **Design tokens:** single token system in `src/index.css` (OKLCH vs HSL)
- **Animations:** keep shadcn animation utilities (configure `tailwindcss-animate`) vs remove

## Proposed defaults (can be ratified)

- **Typography:** Nunito for `--font-sans` (already imported in `src/main.tsx` and set in `src/fonts.css`)

## Log (decisions made)

Template:

### YYYY-MM-DD — Decision title
- **Status:** decided
- **Context:**
- **Decision:**
- **Rationale:**
- **Consequences / follow-ups:**

### 2026-01-23 — Canonical product name
- **Status:** decided
- **Context:** Repo and docs had inconsistent naming; investors and users need one consistent brand.
- **Decision:** The product name is **Pawtreon** everywhere (app, docs, decks, mobile builds).
- **Rationale:** Clear, memorable, consistent investor story and UX.
- **Consequences / follow-ups:** Remove old strings, update mobile bundle IDs, and keep future docs/code Pawtreon-only.

### 2026-01-23 — Canonical docs + OPUS loop
- **Status:** decided
- **Context:** Docs were duplicated, contradictory, and hard to use day-to-day.
- **Decision:** Keep a small canonical doc set at repo root (`VISION.md`, `PRD.md`, `ROADMAP.md`, `PLAN.md`, `TODO.md`, `STYLE.md`, `TECH-STACK.md`, `TRUST-SAFETY.md`). Keep investor docs in `docs/investor/`. Archive everything else in `docs/archive/legacy/`.
- **Rationale:** Single source of truth and a workflow that’s fast to follow.
- **Consequences / follow-ups:** Use `PLAN.md` for the Codex ↔ OPUS iteration before major changes; avoid reintroducing new “plan” docs outside the canonical set.

### 2026-01-23 — Trust UI primitives (verification + reporting)
- **Status:** decided
- **Context:** Investors (and donors) need visible trust signals in the feed and case detail, and a clear way to flag suspicious content.
- **Decision:**
  - Add a 3-state verification ladder to cases (`unverified`, `community`, `clinic`) and display it as a subtle badge in the **card header row** and case detail.
  - Add “Report concern” entry points on feed cards (via a `•••` menu) and on case detail (header action), using a bottom sheet with structured reasons.
- **Rationale:** Trust is the product; these UI primitives increase credibility immediately and create a foundation for Phase 1 verification workflows and moderation.
- **Consequences / follow-ups:** Implement `verificationStatus` as part of the Convex → UI contract (default `unverified`); add a minimal report persistence path; build moderation queue + real criteria for “Community verified” in Phase 1.

### 2026-01-23 — AI preview honesty (no fake inference)
- **Status:** decided
- **Context:** The pitch preview includes an AI-assisted create flow, but the real server-side AI pipeline is not shipped yet.
- **Decision:** Any AI “preview/demo” must be explicitly labeled as a demo (banner/watermark) and must not imply real inference is running. Use a hardcoded/plausible draft + user review, and keep publishing gated.
- **Rationale:** Trust is the product; a “fake AI” demo is a credibility risk.
- **Consequences / follow-ups:** When the real AI pipeline ships (server-side, HITL), update copy/labels and keep safety constraints from `TRUST-SAFETY.md`.

### 2026-01-23 — Convex trust gates (no public dev endpoints, no PII leaks)
- **Status:** decided
- **Context:** A full audit found identity-less mutation escape hatches and public endpoints that could expose user data or allow tampering.
- **Decision:**
  - `users.completeOnboarding` requires auth (no email fallback).
  - Dev-only user utilities are internal-only (`users.listAll`, `users.resetOnboarding`, `users.getByClerkId`).
  - Public volunteer endpoints do not return user email.
  - “Internal use” achievement awarding is internal-only (`achievements.award`).
- **Rationale:** Trust is the product; identity + money features require a hard baseline against IDOR and PII exposure.
- **Consequences / follow-ups:** Regenerate Convex bindings after API changes and keep all admin/seed tooling internal or secret-gated.
### 2026-01-23 — Adopt spec-driven development workflow
- **Status:** decided
- **Context:** Ad-hoc OPUS execution with Codex review worked for polish, but larger features need more structure to avoid rework and ensure Codex review catches issues early.
- **Decision:**
  - Adopt a Kiro-inspired spec-driven workflow for meaningful features (1+ day of work).
  - Use three-file specs: `requirements.md` (EARS notation), `design.md` (architecture), `tasks.md` (atomic tasks).
  - Store specs in `.specs/active/` (in-progress) and `.specs/completed/` (shipped).
  - Keep the lightweight `PLAN.md` flow for small fixes and polish.
- **Rationale:**
  - Structured requirements reduce ambiguity and rework.
  - EARS notation makes acceptance criteria testable.
  - Atomic tasks create a clear paper trail.
  - Codex can critique requirements/design before any code is written.
- **Consequences / follow-ups:**
  - New canonical doc: `SPEC-DRIVEN.md`
  - Templates in `.specs/_TEMPLATE/`
  - Updated `AGENTS.md` workflow section
  - First spec should be the next P1 feature (e.g., donations end-to-end or moderation queue)

### 2026-01-29 — UX styling: Keep green, add coral accent, add city filters, add hero case
- **Status:** decided
- **Context:** Research on top pet fundraiser apps (CUDDLY, Waggle, PetFundr) showed that Pawtreon's green is unique but lacked emotional warmth. The current filter pills (Urgent, Near Me, Adopted, Following) didn't support local discovery.
- **Decision:**
  1. **Keep teal/green primary** (`oklch(0.70 0.15 175)`) — differentiates from competitors, signals trust.
  2. **Add warm coral accent** (`oklch(0.72 0.16 30)`) — use for urgent badges, donate CTAs, hero cards for emotional warmth.
  3. **Replace "Following" pill with city pills** — Sofia, Varna, Plovdiv (dynamic based on case count).
  4. **Add a "Hero Case" card** — feature the most critical case at top of feed when on Urgent filter.
  5. **Keep hybrid feed approach** — social feed with intent-based filtering is correct.
- **Rationale:**
  - Green provides professional trust signal (medical/safe); coral adds emotional warmth for activation.
  - City filters support local volunteers who want to physically help nearby, without requiring geolocation permission.
  - Hero case creates focus and urgency — proven pattern from CUDDLY.
- **Consequences / follow-ups:**
  - New tokens: `--warm-accent`, `--warm-accent-foreground`, `--warm-surface`, `--warm-surface-foreground`
  - New component: `HeroCaseCard.tsx`
  - Updated `IntentFilterPills.tsx` with city filters
  - Updated `IndexV2.tsx` to display hero case and pass city counts
