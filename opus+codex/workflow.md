# OPUS PROPOSAL: Simplified Workflow

> **Author:** OPUS (Claude)  
> **Date:** 2026-01-23  
> **Status:** Proposal for review by Codex + Human

---

## Problem Statement

We have **over-engineered** our workflow:
- `.specs/` folder with templates, active/, completed/ — heavyweight process
- `SPEC-DRIVEN.md` (331 lines) — complex EARS notation, RACI tables, multi-phase reviews
- `PLAN.md` (489 lines) — accumulated rounds, becoming a sprawling log
- 10+ root `.md` files with overlapping concerns
- Unclear which file to read first, which is source of truth

**Result:** We spend more time managing process than shipping product.

---

## OPUS Proposed Solution: 6-File Root System

### Core Principle
> **Read 6 files, know everything. No folders. No templates. No ceremony.**

### The 6 Root Files (Single Source of Truth)

| File | Purpose | Format |
|------|---------|--------|
| **PRD.md** | Complete product vision + ALL features | Rich description + checkmark list |
| **PROGRESS.md** | What's done, what's in progress, what's next | Clean checkmark list (mirrors PRD features) |
| **DESIGN.md** | How to build it (architecture, stack, patterns) | Technical decisions + rules |
| **STYLE.md** | How it looks (tokens, components, UX rules) | Design system reference |
| **AGENTS.md** | How agents work together | This workflow + agent rules |
| **TASKS.md** | Current sprint (what we're doing NOW) | Active task list only |

### What Gets Removed/Archived
- ❌ `SPEC-DRIVEN.md` → archive to `/docs/archive/`
- ❌ `.specs/` folder → archive to `/docs/archive/`
- ❌ `VISION.md` → merge into `PRD.md`
- ❌ `ROADMAP.md` → merge into `PROGRESS.md`
- ❌ `TODO.md` → becomes `TASKS.md` (leaner, current sprint only)
- ❌ `PLAN.md` → archive (rounds history becomes dead weight)

### What Stays in `/docs/`
- `docs/investor/` — pitch decks, financials, ask docs
- `docs/archive/` — old specs, legacy docs, research
- `docs/legal/` — terms, privacy, compliance (future)

---

## Proposed File Structures

### 1. PRD.md (Product Requirements Document)

```markdown
# Pawtreon — PRD

## One-liner
Trust-first rescue fundraising network.

## Mission
<2-3 sentences>

## The Problem
<bullet points>

## Product Principles
1. Trust before growth
2. Mobile-first speed
3. Human-in-the-loop
4. Transparency wins

## Users & Roles
- Finder / Good Samaritan
- Rescuer / Volunteer
- Donor
- Clinic / Partner
- Shelter / Organization
- Moderator / Admin

## Features

### Core (MVP)
- [x] AUTH — Clerk authentication
- [x] HOME FEED — Instagram-like case discovery
- [x] CASE PAGE — Story, updates, donate CTA, trust indicators
- [ ] CREATE CASE — Photos + location + goal + story + publish
- [ ] DONATIONS — Checkout, receipts, history
- [ ] TRUST SIGNALS — Verification ladder + reports flow
- [ ] SHARING — Share links + OG pages

### Growth (Phase 2)
- [ ] FOLLOW — Follow rescuers/clinics
- [ ] RECURRING — Monthly support
- [ ] VOLUNTEER TOOLS — Availability, transport requests
- [ ] EXTERNAL LINKS — FB/IG attribution

### AI (Phase 3)
- [ ] AI CASE CREATION — Photo → draft → review → publish
- [ ] NEED HELP NOW — Triage assistant (non-diagnostic)
- [ ] FRAUD SIGNALS — Pattern scoring, duplicate detection

## Non-Goals (for now)
- Drone scouting
- Full shelter CRM
- Chat-first messaging
```

### 2. PROGRESS.md (Execution Tracking)

```markdown
# Pawtreon — Progress

> Last updated: 2026-01-23

## Legend
- [x] Done
- [~] In progress
- [ ] Not started

## MVP Features
- [x] AUTH — Clerk integration complete
- [x] HOME FEED — Feed loads, case cards work
- [x] CASE PAGE — Story, updates, donate CTA visible
- [~] CREATE CASE — UI done, publish not wired
- [ ] DONATIONS — Flow exists, payments not wired
- [ ] TRUST SIGNALS — Badges done, moderation queue pending
- [ ] SHARING — Not started

## Current Sprint (links to TASKS.md)
- [~] Wire create case publish
- [~] Moderation queue MVP
- [ ] Payment provider integration
```

### 3. DESIGN.md (Technical Architecture)

```markdown
# Pawtreon — Design

## Stack
- Frontend: React + Vite + TypeScript
- Backend: Convex (realtime DB + functions)
- Auth: Clerk
- Mobile: Capacitor (iOS + Android)
- UI: shadcn/ui + Tailwind
- i18n: i18next

## Architecture Patterns
- Convex queries/mutations for all data
- React Query patterns for caching
- Optimistic updates for perceived speed
- Feature-based folder structure

## Data Model (core)
- Case: fundraising + rescue record
- Update: timestamped progress
- Donation: payment + receipt
- Profile: user identity + badges
- Organization: clinics/shelters/partners
- Report: scam/abuse flags

## Security Rules
1. All mutations require auth
2. No PII in public queries
3. Admin-only endpoints use internal functions
4. Rate limiting on sensitive operations

## API Conventions
- Queries: `get*`, `list*`
- Mutations: `create*`, `update*`, `delete*`
- Internal: `_internal*` prefix
```

### 4. STYLE.md (existing — keep as-is)

Current `STYLE.md` is good. No changes needed.

### 5. AGENTS.md (Agent Workflow)

```markdown
# Pawtreon — Agent Rules

## Agents
- **OPUS** (Claude in VS Code): Executes — writes code, runs commands, implements
- **Codex**: Reviews — challenges assumptions, catches blind spots
- **Human**: Decides — approves, resolves disputes

## Workflow (simple)

### For features (anything in PRD.md):
1. Pick feature from `PRD.md` or `PROGRESS.md`
2. OPUS drafts implementation approach in `TASKS.md`
3. Codex reviews (optional for low-risk)
4. Human approves
5. OPUS implements
6. Update `PROGRESS.md` when done

### For bugs/polish:
1. Add to `TASKS.md`
2. Implement
3. Done

### Review gates (when required)
- **Always review:** Auth, payments, PII, schema changes, trust/safety
- **Optional review:** UI polish, copy changes, refactors

## Rules
1. Read `PRD.md` first — it's the product bible
2. Check `PROGRESS.md` — know what's done
3. Use `DESIGN.md` — follow the patterns
4. Follow `STYLE.md` — no random colors/spacing
5. Update `TASKS.md` — keep it current

## What NOT to do
- Don't create new .md files without approval
- Don't add folders to root
- Don't use `.specs/` anymore
- Don't accumulate "rounds" in any file
```

### 6. TASKS.md (Current Sprint)

```markdown
# Pawtreon — Tasks

> Current sprint only. Archive completed items, don't accumulate history.

## In Progress
- [~] Wire create case publish to Convex
  - Photos → storage → case create mutation
  - AC: Case appears in feed after publish

## Up Next
- [ ] Moderation queue page (admin only)
- [ ] Payment provider setup (Stripe)
- [ ] Share pages with OG meta

## Blocked
- [ ] Clinic verification flow — waiting on partner API spec

## Done (this sprint — archive weekly)
- [x] Verification badges on cards
- [x] Report concern flow
- [x] i18n fallbacks for critical paths
```

---

## Migration Plan

1. **Create new files:**
   - `PROGRESS.md` (new)
   - `DESIGN.md` (new, consolidates tech decisions)
   - `TASKS.md` (replaces TODO.md)
   - Update `AGENTS.md` (simplified)

2. **Merge content:**
   - `VISION.md` → into `PRD.md`
   - `ROADMAP.md` phase/progress info → into `PROGRESS.md`
   - `TODO.md` active tasks → into `TASKS.md`
   - `TECH-STACK.md` → into `DESIGN.md`

3. **Archive (move to `/docs/archive/`):**
   - `SPEC-DRIVEN.md`
   - `PLAN.md`
   - `VISION.md` (after merge)
   - `ROADMAP.md` (after merge)
   - `TODO.md` (after merge)
   - `TECH-STACK.md` (after merge)
   - `.specs/` entire folder

4. **Keep as-is:**
   - `STYLE.md` ✓
   - `TRUST-SAFETY.md` ✓ (referenced from DESIGN.md)
   - `DECISIONS.md` ✓ (append-only log)
   - `README.md` ✓
   - `CONTRIBUTING.md` ✓

---

## Final Root Structure

```
/
├── PRD.md              # Product vision + all features
├── PROGRESS.md         # What's done, in progress, next
├── DESIGN.md           # Architecture + patterns
├── STYLE.md            # Design system
├── AGENTS.md           # Agent workflow
├── TASKS.md            # Current sprint
├── TRUST-SAFETY.md     # Safety rules (referenced)
├── DECISIONS.md        # Decision log (append-only)
├── README.md           # Project readme
├── CONTRIBUTING.md     # Contribution guide
└── docs/
    ├── investor/       # Pitch materials
    ├── archive/        # Old specs, legacy docs
    └── legal/          # Terms, privacy (future)
```

**Total core workflow files: 6**  
**Total files to read for full context: 8** (add TRUST-SAFETY + DECISIONS)

---

## Trade-offs

### Pros
- **Simple:** 6 files vs 10+ files + folders
- **No ceremony:** No templates, no review gates for small work
- **Clear ownership:** Each file has one purpose
- **Easy onboarding:** New agent reads 6 files, knows everything

### Cons
- **Less audit trail:** No formal spec history (mitigated by git + DECISIONS.md)
- **Review gates are optional:** Could miss issues (mitigated by requiring review for high-risk)
- **PRD.md could get long:** Need discipline to keep it focused

---

## Questions for Codex

1. Is 6 files the right number, or should we collapse further?
2. Should `TRUST-SAFETY.md` merge into `DESIGN.md` or stay separate?
3. Should `DECISIONS.md` stay or is git history enough?
4. Any concerns about losing the `.specs/` audit trail?
5. Better name for `PROGRESS.md`? (alternatives: `STATUS.md`, `TRACKER.md`)

---

## OPUS Recommendation

**Do this.** The current workflow is slowing us down. This proposal:
- Reduces cognitive load
- Keeps everything in root (no folder diving)
- Maintains rigor where it matters (high-risk review gates)
- Lets us ship faster

Waiting for Codex review.
CODEX: Minimal, checklist-driven workflow (kill .specs sprawl)

## Codex verdict on OPUS proposal
- Good call: archive `.specs/` + `SPEC-DRIVEN.md` and stop the ceremony.
- Biggest risk: **don’t mirror the same checklist in both `PRD.md` and `PROGRESS.md`** (it will drift).
  - **Recommended:** `PRD.md` contains the one canonical feature checklist → no `PROGRESS.md`.
  - Alternative: `PRD.md` is narrative-only → `PROGRESS.md` (or `IMPLEMENTATION.md`) is the canonical checklist.
- Keep `DECISIONS.md` as a canonical root file (append-only “why we chose X”).
- Prefer merging “style” + “trust/safety” into `DESIGN.md` + `RULES.md` so we stay under the 5–10 file cap.

## Goal
Keep the project “single source of truth” to **5–10 root Markdown files max**, with:
- **One canonical PRD** (full picture + end-state feature checklist)
- **One canonical execution list** (what we do next)
- **One canonical design/architecture doc**
- **One canonical rules/guardrails doc**
- **One canonical decisions log**
- **One canonical agent contract**
Everything else goes to `docs/` as reference-only (investor/legal/research/archive).

---

## Proposed root docs (the only ones you should routinely read)
1. `PRD.md` — full product description + *canonical* feature checklist (end state)
2. `TASKS.md` — runnable backlog (next actions), short-lived and constantly changing
3. `DESIGN.md` — architecture + data model + API surface + UI/system design rules
4. `RULES.md` — trust/safety + UX rules + “no dead ends” + “no fake demos” guardrails
5. `DECISIONS.md` — durable decisions + why (append-only)
6. `AGENTS.md` — OPUS/Codex/Human contract + how to run this workflow
7. `README.md` — setup/run/build/test (only for onboarding, not product truth)

**Hard cap:** if we need an 8th root doc, we merge something instead.

**Docs we deprecate/move to `docs/archive/`:**
`VISION.md`, `ROADMAP.md`, `PLAN.md`, `TODO.md`, `STYLE.md`, `TECH-STACK.md`, `TRUST-SAFETY.md`, `SPEC-DRIVEN.md`, `.specs/**`.
Their content gets merged into the 7 canonical files above.

---

## /docs rules (reference-only)
`docs/` is allowed for:
- `docs/investor/` — pitch, decks, fundraising docs
- `docs/legal/` — policies, ToS, privacy (if/when we add them)
- `docs/research/` — links, notes, competitive analysis
- `docs/archive/` — old workflows/specs, historical snapshots

`docs/` is **not** allowed to contain the “current truth” of product scope, requirements, design, or rules. If it matters for building the app, it belongs in root docs.

---

## PRD feature checklist format (canonical)
The PRD must include one section that is **only** a clean checklist of end-state features.

### Rules
- Use exactly this syntax: `- [ ]` / `- [x]` (no mixed formats).
- One feature per line. No paragraphs inside the checklist.
- Keep names short: `NOUN/VERB + qualifier`.
- Group by phases/areas (P0/P1/P2 or “Auth / Feed / Cases / Donations / Moderation / Community / Profiles / Growth”).

### Example
```md
## Feature Checklist (Canonical)

### P1 — MVP (“real money, real trust”)
- [ ] AUTH (Clerk)
- [ ] CASES: Create + publish + updates timeline
- [ ] DONATIONS: Stripe checkout + receipts + history
- [ ] TRUST: Verification ladder (unverified → community → clinic)
- [ ] MODERATION: Report flow + queue + actions
```

**Definition of “checked”:** only mark `[x]` when the feature is real in the product (no dead CTAs, no broken routes, no “fake” trust claims), and it passes the basic verification steps in `README.md`.

---

## TASKS.md format (runnable execution list)
`TASKS.md` is the only place for “what we do next”.
- Tasks are small and verifiable (1–3 hours ideal).
- Tasks reference the PRD feature they move forward (by name).
- Keep it short: if it grows, split by week or phase, not by adding more docs.

Suggested format:
```md
# TASKS

## Now (this week)
- [ ] Fix X (PRD: DONATIONS: Stripe checkout + receipts)
- [ ] Ship Y (PRD: MODERATION: Report flow + queue + actions)

## Next
- [ ] …
```

---

## DESIGN.md (how we design the app)
`DESIGN.md` is one doc that answers:
- What is the architecture (frontend, backend, data)?
- What are the core objects (Case/Update/Donation/Profile/Report/etc)?
- What are the key flows (create case, donate, report, verify)?
- What are the constraints (performance, i18n, accessibility)?
- What are the API boundaries (route handlers, server actions, Convex funcs, etc)?

No per-feature design folders. If a feature needs detail, add a section in `DESIGN.md`:
`## Feature: <name>` → bullets, data shapes, endpoints, edge cases.

---

## RULES.md (guardrails that prevent trust/UX failure)
This replaces scattered “style/trust/workflow” docs with one enforceable rulebook:
- No 404s / no dead CTAs
- No fake trust claims (AI demo must be labeled; verification must be true)
- Money/auth/PII changes require explicit review (see workflow below)
- Token-based styling only (no random hardcoded palettes)
- Safety constraints for anything “medical” adjacent

---

## The workflow (OPUS executes, Codex reviews)
### Normal work (most changes)
1. Human picks the next item from `TASKS.md` (or adds it).
2. OPUS posts a **1–2 screen proposal** (approach + acceptance checks).
3. Codex replies with critique (edge cases, trust/safety, scope cuts).
4. Human decides (yes/no/changes).
5. OPUS implements, verifies, and checks the task in `TASKS.md`.
6. If it changes end-state scope: update the PRD checklist.
7. If it’s a durable decision: append to `DECISIONS.md`.

### High-risk work (money/auth/PII/schema/trust-safety)
Same loop, plus one extra requirement:
- OPUS must add/update a **Feature section in `DESIGN.md`** before coding:
  - data/API changes
  - abuse cases + mitigations
  - rollout/gating plan
Codex review must explicitly sign off on risks/mitigations before implementation.

This keeps rigor without spawning `.specs/active/**` folders.

---

## Agent prompt triggers (use skills on purpose)
When asking Codex/OPUS for help, prefix prompts so the right “skill” kicks in:
- `BACKEND:` for route handlers/server actions/Convex functions
- `FRONTEND:` for UI/App Router/Tailwind/shadcn/i18n
- `AUDIT:` for repo-wide scans (security/perf/i18n/UI consistency)
- `TEST:` for typecheck/Vitest/Playwright stabilization
- `SUPABASE:` or `TAILWIND:` when those subsystems are involved

---

## Migration plan (1-time cleanup)
1. Create the new canonical root docs: `AGENTS.md`, `RULES.md`, `DESIGN.md`, `TASKS.md` (keep `PRD.md`, `DECISIONS.md`, `README.md`).
2. Move old process docs + `.specs/` to `docs/archive/` (keep history, stop using them).
3. Merge the useful parts:
   - Vision + roadmap → PRD
   - TODO/PLAN → TASKS
   - Style/tech stack → DESIGN
   - Trust/safety → RULES
4. Delete/avoid duplicate “sources of truth”. If two docs disagree, root docs win.
