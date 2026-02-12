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

### 2026-02-08 — petServices and clinics tables remain separate
- **Status:** decided
- **Context:** Schema audit found that `petServices` and `clinics` tables overlap in structure (name, city, address, phone, verified, claims flow). Merging was considered.
- **Decision:** Keep `petServices` and `clinics` as separate tables.
- **Rationale:**
  - Different trust requirements: clinics verify medical cases and provide clinical evidence; pet services do not.
  - Different discovery patterns: clinics are found during rescue urgency; pet services are browsed casually.
  - Merging would add type-checking complexity and risk breaking clinic verification trust signals.
  - Separate tables allow independent evolution (e.g., clinics may get emergency protocols, pet services may get booking).
- **Consequences / follow-ups:** Document relationship in `data-model-spec.md`. Revisit if marketplace feature (Phase 4) requires a unified directory.

### 2026-02-08 — Vitest selected as test framework
- **Status:** decided
- **Context:** Project has 0% test coverage with no test framework installed. Need to choose between Vitest and Jest.
- **Decision:** Use Vitest with `@testing-library/react`, `convex-test`, and Playwright (for E2E, Phase 2).
- **Rationale:**
  - Native Vite integration — same build pipeline, shared config, zero-config TypeScript.
  - Native ESM support (project uses `"type": "module"`).
  - Jest-compatible API for easy migration if needed.
  - SWC-powered transforms match the `@vitejs/plugin-react-swc` setup.
- **Consequences / follow-ups:** Add `vitest`, `@testing-library/react`, `convex-test` to devDependencies. Create `vitest.config.ts`. Start with critical path tests (donations, auth helpers, case CRUD).

### 2026-02-08 — PostHog selected for product analytics
- **Status:** decided
- **Context:** Project has zero analytics tracking. Need GDPR-compliant solution for EU (Bulgaria) launch.
- **Decision:** Use PostHog (Cloud EU instance) for product analytics, event tracking, funnels, and session replay.
- **Rationale:**
  - EU hosting available (GDPR compliance for Bulgaria launch).
  - Open source with self-host option if scale/cost requires migration.
  - Generous free tier (1M events/month) covers MVP needs.
  - Built-in feature flags, session replay, and funnel analysis reduce toolchain complexity.
  - `respect_dnt: true` and no-PII event design align with trust-first product values.
- **Consequences / follow-ups:** Add `posthog-js` dependency. Add `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` env vars. Implement cookie consent banner before Bulgaria launch.

### 2026-02-08 — TypeScript strict mode roadmap: progressive enablement
- **Status:** decided
- **Context:** `tsconfig.app.json` has `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`. This reduces type safety but was inherited from initial scaffolding.
- **Decision:** Progressively enable strict checks file-by-file rather than flipping `strict: true` globally.
- **Rationale:**
  - Global `strict: true` would produce hundreds of errors across 100+ files, blocking all other work.
  - File-by-file migration via `// @ts-strict` comments or per-directory overrides lets us prioritize critical paths (auth helpers, donation flow, case mutations).
  - Build tooling (`tsconfig.node.json`) already has `strict: true`, proving the pattern works.
- **Consequences / follow-ups:** Start with `convex/lib/auth.ts` and `convex/donations.ts`. Track progress in refactor tasks. Target `strict: true` globally after 80% of files pass.

### 2026-02-08 — Phase 5 system specs completed (docs-v2/systems/)
- **Status:** decided
- **Context:** Master plan items #22-#27 required 6 system/architecture spec documents covering data model, API reference, auth/security, deployment, testing, and analytics.
- **Decision:** All 6 specs written and finalized in `docs-v2/systems/`:
  - `data-model-spec.md` — 27 tables, relationships, gap audit resolution
  - `api-reference.md` — 84+ functions across 19 files, HTTP endpoints
  - `auth-security-spec.md` — Clerk auth, authorization model, GDPR gaps
  - `deployment-spec.md` — Vercel + Convex + Capacitor, env vars, CI/CD design
  - `testing-spec.md` — Vitest strategy, coverage targets, test data approach
  - `analytics-spec.md` — PostHog, 32 events, KPI framework, dashboards
- **Rationale:** Comprehensive system documentation enables onboarding, auditing, and implementation planning.
- **Consequences / follow-ups:** Master plan items #22-#27 marked `[x]`. Absorb and archive `docs/architecture/data-model-gap-audit.md` and `docs/architecture/techstack-baseline.md` when `docs-v2` is promoted to `docs`.

### 2026-02-09 — docs-v2/ promoted to docs/ (documentation migration complete)
- **Status:** decided
- **Context:** Two parallel docs folders existed: `docs/` (original, 28 markdown files, 2,711 lines, 23 audit PNGs) and `docs-v2/` (spec-driven rewrite, 49 markdown files, 11,016 lines, 0 PNGs). Audit confirmed docs-v2 is superior on every axis: structure, depth, consistency, AI comprehension, and implementation readiness.
- **Decision:** Delete `docs/`, rename `docs-v2/` to `docs/`. Migrate `docs/AGENTS.md` governance rules and `docs/partners/` (3 operational docs) into the new `docs/` before deletion. Update all references in root docs (AGENTS.md, README.md, TASKS.md, DESIGN.md) and internal cross-references.
- **Rationale:**
  - docs-v2 has 14 complete feature specs vs 2 partial ones in docs.
  - docs-v2 has 6 system specs (data model, API, auth, deployment, testing, analytics) vs 2 gap-audits in docs.
  - Every spec follows a consistent template (Purpose, User Stories, Functional Reqs, Data Model, API, UI, Edge Cases).
  - Zero PNG noise — all audit screenshots were absorbed into specs and deleted.
  - An AI agent can implement features directly from docs-v2 specs without reverse-engineering source code.
- **Consequences / follow-ups:** Single `docs/` folder is now canonical. 53 markdown files, 8 domain folders. No migration table needed — all content absorbed. Future docs follow `docs/AGENTS.md` spec template.

### 2026-02-10 — Docs overhaul v2: spec-driven architecture with bidirectional traceability
- **Status:** decided
- **Context:** After docs-v2 promotion, the documentation was comprehensive but lacked: (1) bidirectional cross-links between PRD checklist and feature specs, (2) auto-generated feature registry, (3) acceptance criteria on specs, (4) EARS notation for high-risk specs, (5) component catalog and accessibility baseline in design system spec, (6) specs for 4 backend files (activity, home, petServices, social), (7) status lifecycle governance.
- **Decision:** Execute 6-phase docs overhaul:
  - Phase 1: Consolidate PRD (merge duplicate, adopt 3-state checklist)
  - Phase 2: Heal docs (fix broken refs, enforce headers, clean orphans)
  - Phase 3: Strengthen AGENTS.md (add stack/recipes, create src/convex AGENTS, Copilot instructions)
  - Phase 4: Manifest + cross-links (auto-generated INDEX.md, PRD↔spec bidirectional links, link-check script)
  - Phase 5: Spec quality (design system extension, EARS for 3 high-risk specs, acceptance criteria for ALL 18 specs, 4 new specs)
  - Phase 6: Governance (status lifecycle rules, DECISIONS.md entries, final validation)
- **Rationale:** Researched Kiro (EARS notation, steering), OpenSpec (artifact-guided), GitHub Spec Kit (constitution→implement). Adopted best practices: EARS scoped to money/trust only (3 specs), script-generated INDEX.md (not hand-maintained), acceptance criteria as standard section 9, design system merged into ui-patterns-spec.md (not separate file).
- **Consequences / follow-ups:**
  - 18 feature specs (from 14), all with 10-section structure including Acceptance Criteria
  - `scripts/gen-feature-index.mjs` auto-generates `docs/features/INDEX.md`
  - `scripts/check-doc-links.mjs` validates all cross-references (zero broken links)
  - EARS requirements on 3 high-risk specs: donations (12 rules), admin-moderation (10 rules), onboarding (9 rules)
  - PRD feature checklist items link to their specs; specs link back to PRD items via `> **PRD Ref:**`
  - Status lifecycle defined: draft→review→final, with escape hatch for final docs
  - Codex reviewer conditionally approved plan with 9 required scoping changes (all adopted)

### 2026-02-10 — EARS notation scoped to money/trust specs only
- **Status:** decided
- **Context:** EARS (Easy Approach to Requirements Syntax) provides unambiguous When/If/While/Shall requirements. Could apply to all specs, but adds overhead.
- **Decision:** Apply EARS notation only to 3 high-risk specs: donations-spec.md (12 rules), admin-moderation-spec.md (10 rules), onboarding-spec.md (9 rules). Other specs use standard functional requirements.
- **Rationale:** Codex review: "EARS is high-ceremony. For a 3-person team, it's overhead on low-risk specs. Scope to money (donations), trust (moderation), and security (auth) where precision prevents real damage."
- **Consequences / follow-ups:** If additional specs become high-risk (e.g., recurring payments), add EARS section to those specs at that time.

### 2026-02-10 — Feature INDEX.md is script-generated, never hand-maintained
- **Status:** decided
- **Context:** Feature registry (INDEX.md) could be maintained by hand or generated from spec file headers.
- **Decision:** Auto-generate via `node scripts/gen-feature-index.mjs`. Extracts title, status, owner, last-updated, PRD ref from each `*-spec.md` file header. Run after adding/updating specs.
- **Rationale:** Codex review: "Don't hand-maintain INDEX.md — it will drift. Script-generate from file headers."
- **Consequences / follow-ups:** INDEX.md is not manually edited. Implementation-status derivation details were tightened in the 2026-02-09 PRD-SSOT decision.

### 2026-02-10 — Design system content merged into ui-patterns-spec.md (not separate file)
- **Status:** decided
- **Context:** Plan originally proposed a separate `design-system-spec.md`. Existing `ui-patterns-spec.md` (446 lines, status: final) already covers layout, components, typography, and anti-patterns.
- **Decision:** Extend `ui-patterns-spec.md` with Component Catalog table (22 shadcn primitives with usage rules) and Accessibility Baseline section (WCAG 2.1 AA). No separate file.
- **Rationale:** Codex review: "You already have a 446-line ui-patterns-spec. A separate design-system-spec creates a split-brain. Merge."
- **Consequences / follow-ups:** ui-patterns-spec.md is now ~530 lines. Remains the single design reference alongside theming-tokens-spec.md (tokens/colors).

### 2026-02-10 — settings.ts and storage.ts too small for own specs
- **Status:** decided
- **Context:** `settings.ts` (53 lines, 1 mutation) and `storage.ts` (12 lines, 1 mutation) exist without feature specs.
- **Decision:** `settings.ts` documented as appendix in profiles-spec.md. `storage.ts` is a utility wrapper — no spec needed (documented in code).
- **Rationale:** 12-line files don't warrant 100+ line spec files. Document in adjacent specs.
- **Consequences / follow-ups:** None.

### 2026-02-09 — Feature implementation status locked to PRD; docs index and checks automated
- **Status:** decided
- **Context:** `docs/features/INDEX.md` could drift from actual shipped work because it previously relied on hardcoded mappings and spec document status. This created incorrect answers for daily questions like "how many features are built?".
- **Decision:**
  - `PRD.md` checklist is the canonical implementation status source.
  - `docs/features/INDEX.md` is generated from spec headers plus PRD checklist links (`node scripts/gen-feature-index.mjs`).
  - Added docs quality gate commands:
    - `pnpm docs:index`
    - `pnpm docs:validate`
    - `pnpm docs:check`
  - Added `scripts/validate-docs.mjs` to enforce docs headers/status values and required feature-spec sections.
- **Rationale:** A single status authority and automated checks prevent drift and make daily product-state queries deterministic.
- **Consequences / follow-ups:**
  - When PRD checklist links or feature headers change, regenerate INDEX.
  - Feature spec `Status` now explicitly represents document maturity (`draft/review/final`), not shipped state.

### 2026-02-10 — SSOT design system architecture + partners-first stores/services IA
- **Status:** decided
- **Context:** Tailwind v4 + shadcn installation was correct, but trust-critical surfaces still had styling drift from repeated wrappers, ad-hoc controls, and mock content in `/partners`.
- **Decision:**
  - Adopt SSOT layout primitives for trust surfaces:
    - `PageShell`
    - `PageSection`
    - `SectionHeader`
    - `StickySegmentRail`
    - `StickyActionBar`
    - `StatsGrid`
  - Keep `src/index.css` as the single CSS entrypoint and token source.
  - Refactor `/partners` to data-driven segments (`partners`, `volunteers`, `stores_services`) with segment state in query params.
  - Keep stores/services inside `/partners` IA for this phase; no standalone `/stores` route.
  - Keep stores/services referral-only in this phase (no native marketplace cart/checkout).
- **Rationale:** Reduces trust-surface inconsistency without overengineering, removes fake social proof risk, and keeps monetization scope aligned with current trust-first product maturity.
- **Consequences / follow-ups:**
  - Added `petServices.list` and `petServices.get` public queries for partners-integrated directory surfaces.
  - Continue phased migration of remaining non-critical routes to SSOT wrappers.
  - Revisit standalone stores route and native commerce only after recurring + trust primitives are stable.

### 2026-02-10 — Remove rigid system lock language from active planning docs
- **Status:** decided
- **Context:** Active docs used "locked assumptions/defaults" language that implied immutable system choices and reduced planning flexibility.
- **Decision:**
  - Treat roadmap/task defaults as adjustable guidance, not hard locks.
  - Remove lock wording from active planning docs where it is not a safety or compliance requirement.
  - Keep trust/safety and accessibility requirements enforced through `RULES.md` and quality gates.
- **Rationale:** Product and visual direction need fast iteration; rigid wording should not block valid changes.
- **Consequences / follow-ups:**
- `docs/product/roadmap.md` and `TASKS.md` now use non-lock phrasing.
- Existing historical decision entries remain for audit trail but are interpreted as superseded where this entry applies.

### 2026-02-12 — Remove client IP-based language detection banner
- **Status:** decided
- **Context:** `LanguageDetectionBanner` performs a client-side IP geolocation fetch (`ipapi.co`) to suggest a locale. This adds a third-party dependency, can fail via CORS/network, and is unnecessary for Bulgaria/EU launch where data minimization matters.
- **Decision:** Remove/disable IP-based language detection in the shipped app. Locale selection relies on i18next detection (`localStorage → querystring → navigator`) and the Settings language picker.
- **Rationale:** Improves reliability, reduces privacy surface area, and aligns with the i18n spec guidance to avoid fragile geo-detection.
- **Consequences / follow-ups:** Ensure Settings persists `language` in `userSettings` and keeps `i18nextLng` in sync.

### 2026-02-12 — Rate limit abuse-prone case reports
- **Status:** decided
- **Context:** Trust surfaces require “report everywhere” but report endpoints are abuse-prone. Admin/moderation spec includes an explicit quota rule (EARS M-07).
- **Decision:** Require an authenticated identity to create a case report and enforce a per-identity daily quota (default: 10 reports/UTC day), stored server-side in Convex.
- **Rationale:** Prevents spam storms, preserves moderation throughput, and keeps the reporting system credible.
- **Consequences / follow-ups:** Add a lightweight rate-limit table and enforce it inside `reports.create`. Provide a user-friendly error when the quota is exceeded.

### 2026-02-12 — Duplicate detection v1 uses client perceptual hashes + server similarity checks
- **Status:** decided
- **Context:** Exact `sha256` duplicate checks only detect byte-identical uploads and miss lightly transformed image reuse (resize/compression/crop variants), which weakens trust moderation coverage.
- **Decision:**
  - Compute perceptual image hashes on case creation client-side (`pHash` + `dHash`) and send them as optional metadata tied to uploaded storage IDs.
  - Store perceptual hashes in `imageFingerprints` with bucket keys for candidate lookup.
  - Run server-side Hamming-distance matching at create time (conservative threshold) and treat matches as review signals only (`riskLevel: high` + duplicate report + audit log), not auto-rejection.
- **Rationale:** Extends duplicate detection to near-duplicates without adding image decode dependencies to Convex runtime, while preserving human-in-the-loop moderation.
- **Consequences / follow-ups:** Keep thresholds/bucket strategy tunable from production telemetry; revisit false-positive/false-negative rates after moderation volume data.
