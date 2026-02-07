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
- **Status:** superseded on 2026-02-06
- **Context:** Docs were duplicated, contradictory, and hard to use day-to-day.
- **Decision:** This historical decision introduced a now-legacy root doc model that has been replaced.
- **Rationale:** Single source of truth and a workflow that’s fast to follow.
- **Consequences / follow-ups:** Follow the active 2026-02-06 docs topology (7 canonical root docs + supporting docs under `docs/`).

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
- **Status:** superseded on 2026-02-06
- **Context:** Ad-hoc OPUS execution with Codex review worked for polish, but larger features need more structure to avoid rework and ensure Codex review catches issues early.
- **Decision:**
  - This workflow is archived for historical reference.
  - Active workflow does not use `.specs` paths.
- **Rationale:**
  - Structured requirements reduce ambiguity and rework.
  - EARS notation makes acceptance criteria testable.
  - Atomic tasks create a clear paper trail.
  - Codex can critique requirements/design before any code is written.
- **Consequences / follow-ups:**
  - Use canonical root docs and `docs/` supporting packs as defined in 2026-02-06 decisions.

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

### 2026-02-06 — Canonical docs topology ratified (7 root docs + supporting packs)
- **Status:** decided
- **Context:** Root canonical docs were changed to 7-file governance in `AGENTS.md`, but `README.md` and `docs/README.md` still referenced removed legacy docs.
- **Decision:**
  - Canonical root docs are exactly: `PRD.md`, `TASKS.md`, `DESIGN.md`, `RULES.md`, `DECISIONS.md`, `AGENTS.md`, `README.md`.
  - All expanded planning docs live under `docs/` grouped by domain (`product`, `architecture`, `design`, `partners`, `mission`, `investor`, `archive`).
- **Rationale:** Preserve a small, strict root control plane while allowing deep planning detail without root sprawl.
- **Consequences / follow-ups:** Keep root at hard cap; if a new root doc is proposed, merge or replace first.

### 2026-02-06 — Single signup, multi-capability profile model
- **Status:** decided
- **Context:** Role-specific signup creates friction and does not match real user behavior (donor + volunteer + org collaborator in one account).
- **Decision:** Users sign up once, then enable capabilities and verification pathways from account/profile settings; organization claims remain available as an optional onboarding branch.
- **Rationale:** Faster activation and fewer dead-end onboarding paths.
- **Consequences / follow-ups:** Keep onboarding lightweight, move durable role/capability controls into account/profile surfaces.

### 2026-02-06 — Drones/safehouse strategy is roadmap funding track, not MVP feature scope
- **Status:** decided
- **Context:** Drone scouting and shelter/safehouse are mission-critical long-term initiatives but introduce large operational complexity.
- **Decision:** Treat drones/safehouse as Pawtreon mission initiatives with roadmap milestones and dedicated fundraising, separate from MVP rescue-case functionality.
- **Rationale:** Keeps MVP execution focused on trust + money + case lifecycle while preserving investor/user narrative for future expansion.
- **Consequences / follow-ups:** Expose initiatives as a dedicated product surface, with transparent milestones and use-of-funds updates.

### 2026-02-06 — Mission campaign placement in product UX
- **Status:** decided
- **Context:** Need visibility for Pawtreon initiatives without mixing them into regular rescue campaigns.
- **Decision:** Launch mission campaigns in two surfaces:
  - featured module on home feed
  - dedicated section in account/profile hub
- **Rationale:** High discoverability with clear contextual separation.
- **Consequences / follow-ups:** Add explicit campaign classification and UI labeling for rescue campaigns vs platform initiatives.

### 2026-02-06 — Bulgaria directory rollout strategy
- **Status:** decided
- **Context:** Users need reliable clinic discovery immediately; partner network onboarding is progressive.
- **Decision:** Seed verified clinic directory first (Sofia, Varna, Plovdiv initial cohort), keep claim/verification flow active, onboard stores/shelters progressively.
- **Rationale:** Immediate rescue utility plus controlled quality of partner data.
- **Consequences / follow-ups:** Maintain verification source metadata and claim review SLA in ops docs.

### 2026-02-06 — Spec-driven `.specs` workflow archived for day-to-day execution
- **Status:** decided
- **Context:** Prior decision referenced `.specs` and `PLAN.md`, but current repo governance disallows `.specs` and uses root canonical docs + `TASKS.md`.
- **Decision:** `.specs` is archived and not part of active workflow; planning and execution operate through canonical root docs and supporting packs under `docs/`.
- **Rationale:** Remove process drift and keep one consistent operating model.
- **Consequences / follow-ups:** New process docs must not reintroduce `.specs` paths or missing legacy root docs.

### 2026-02-06 — Home IA split: case-first landing + community-social boundary
- **Status:** decided
- **Context:** The landing first fold was overloaded (stories + large search + multiple urgency surfaces), and product intent needed a clearer split between rescue execution and community discussion.
- **Decision:**
  - Keep `/` as a case-first rescue surface.
  - Keep `/community` as the social/discussion surface.
  - Home stories row uses urgent/new case story events only (not generic social posts).
  - Home first fold uses compact header + urgent stories + compact filter rail; no duplicated urgent strip.
- **Rationale:** Reduce action overload, improve rescue clarity, and preserve social engagement without mixing intents in one feed.
- **Consequences / follow-ups:**
  - Home now relies on a server-driven landing query contract (`home.getLandingFeed`).
  - Design behavior is codified in `docs/design/ui-patterns-spec.md`.

### 2026-02-06 — Tailwind v4 + shadcn trust-surface alignment scope
- **Status:** decided
- **Context:** Style gates were passing but only covered a narrow file set, while trust-critical surfaces still had token drift, legacy visual noise, and inconsistent interaction patterns.
- **Decision:**
  - Enforce style rails on scoped product surfaces: Home + Community + Campaigns.
  - Deprecate and remove unused legacy home UI variants to reduce drift.
  - Keep `/community` social and `/` case-first, with one header action pattern and one chip/search visual model across scoped surfaces.
  - Keep Convex-first data flow; no client-heavy filtering migrations.
- **Rationale:** Trust is the product; consistent, accessible, low-noise rescue surfaces are required for credibility and fast action.
- **Consequences / follow-ups:**
  - Expand `styles:gate` scan targets.
  - Remove fake social proof on trust-critical fundraising views.
  - Preserve Vite + React + Convex stack with no framework migration.

### 2026-02-06 — Trust-surface style gate policy ratified
- **Status:** decided
- **Context:** After scope lock, style rails still needed concrete enforcement rules so regressions are caught in CI and not only in manual review.
- **Decision:**
  - `styles:gate` now scans Home + Community + Campaigns pages and their shared header/chip/search/card components.
  - Palette utilities and gradient utilities are blocked on those scoped trust surfaces.
  - Arbitrary value classes are blocked by default, with safe-area layout exceptions only.
  - Icon-only header actions standardize to a minimum `44x44` touch target (`Button size="iconTouch"`).
- **Rationale:** Keeps trust-critical rescue surfaces visually calm, token-safe, and accessible while still allowing required mobile safe-area layout behavior.
- **Consequences / follow-ups:** Remaining style debt outside the scoped surfaces stays in backlog and should be migrated to the same rails incrementally.

### 2026-02-07 — Community route gets dedicated mobile forum shell (stage 1)
- **Status:** decided
- **Context:** `/community` was sharing the global mobile shell, which overloaded first-fold controls and conflicted with forum-first actions.
- **Decision:**
  - Keep global desktop navigation unchanged.
  - On mobile, `/community*` uses a dedicated community shell with a focused header and forum-specific bottom nav.
  - Stage 1 tabs are `Feed`, `Followed`, `Messages`, and `New Thread` (compose opens via `/community?compose=1`).
  - `Followed` and `Messages` ship as explicit preview states in Stage 1 (no dead ends).
- **Rationale:** Preserves the product IA split (`/` rescue-first, `/community` discussion-first) while reducing interaction clutter on trust-critical mobile surfaces.
- **Consequences / follow-ups:**
  - Stage 2 will wire `Followed` to follow graph filtering and `Messages` to real conversation list data.
  - Members/activity remain secondary community destinations outside the primary bottom tab set.

### 2026-02-07 — Convex cleanup uses aggressive handler pruning with schema freeze
- **Status:** decided
- **Context:** Refactor scope required large backend cleanup, but product routes and data model contracts must remain stable during this pass.
- **Decision:**
  - Remove unreferenced Convex handlers (queries/mutations/internal functions) aggressively.
  - Keep schema tables unchanged unless a table has zero operational references.
  - Preserve all currently shipped routes, including deck/preview surfaces.
- **Rationale:** Reduces API attack and maintenance surface now without introducing schema migration risk.
- **Consequences / follow-ups:**
  - Regenerate Convex `_generated` API types immediately after handler pruning.
  - Downstream callers outside this repo must migrate if they relied on removed handlers.
