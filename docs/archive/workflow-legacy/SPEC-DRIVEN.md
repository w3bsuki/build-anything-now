# Pawtreon — Spec-Driven Development

> **Inspired by:** Kiro's spec-driven workflow (requirements → design → tasks)  
> **Adapted for:** OPUS ↔ Codex dual-agent collaboration  
> **Last updated:** 2026-01-23

## What is spec-driven development?

Spec-driven development is **structure before code**. Instead of "vibe coding" (natural language → code → hope it works), we:

1. **Capture requirements** as formal user stories with testable acceptance criteria (EARS notation)
2. **Document design** with architecture, data flow, and implementation considerations
3. **Break into discrete tasks** that map directly to requirements
4. **Execute with tracking** — one task at a time, with verification

This creates a paper trail that makes reviews faster and more adversarial (in a good way).

---

## Roles & Responsibilities (RACI)

| Activity | OPUS (Claude) | Codex | Human |
|----------|---------------|-------|-------|
| Draft requirements | **Responsible** | — | Informed |
| Review requirements | — | **Responsible** | Approves |
| Draft design | **Responsible** | — | Informed |
| Review design | — | **Responsible** | Approves |
| Generate tasks | **Responsible** | — | Informed |
| Execute tasks | **Responsible** | — | Informed |
| Verify implementation | **Responsible** | Consulted | Approves |
| Lock spec / sign-off | — | — | **Decides** |

**In practice:**
- **OPUS** (Claude, in VS Code) = drafts specs, writes code, runs commands, implements
- **Codex** = reviews specs, challenges assumptions, catches blind spots
- **Human** = makes final calls, resolves disputes, approves locks

---

## Directory structure

```
.specs/
├── _TEMPLATE/                    # Copy this folder for each new feature
│   ├── requirements.md           # User stories + acceptance criteria
│   ├── design.md                 # Architecture + data models + interfaces
│   └── tasks.md                  # Implementation plan with checkboxes
│
├── active/                       # Currently in-progress specs
│   └── <feature-name>/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
└── completed/                    # Shipped specs (archive)
    └── <feature-name>/
        └── ...
```

---

## Workflow: OPUS ↔ Codex with specs

### Phase 1: Requirements (OPUS drafts → Codex critiques)

1. **OPUS** creates a new spec folder in `.specs/active/<feature-name>/`
2. **OPUS** drafts `requirements.md` with:
   - Feature summary
   - User stories (who, what, why)
   - Acceptance criteria in EARS notation (3–7 ACs per story, at least one error/negative case)
   - Out-of-scope items
   - Assumptions / risks / mitigations
3. **Human** pastes to Codex for critique
4. **Codex** responds with:
   - Missing edge cases
   - Ambiguous requirements
   - Trust/safety gaps
   - Suggested rewrites
5. **OPUS** updates `requirements.md` based on Codex feedback
6. **Human** confirms requirements are locked → proceed to design

### Phase 2: Design (OPUS proposes → Codex validates)

1. **OPUS** drafts `design.md` with:
   - High-level architecture
   - Data models / schema changes
   - API / function signatures
   - Error handling strategy
   - Security considerations
   - Testing strategy (using current repo toolchain)
2. **Human** pastes to Codex for technical review
3. **Codex** responds with:
   - Architecture concerns
   - Performance implications
   - Security holes
   - Alternative approaches
4. **OPUS** updates `design.md`
5. **Human** confirms design is locked → proceed to tasks

### Phase 3: Tasks (OPUS generates → execution begins)

1. **OPUS** creates `tasks.md` with:
   - Small, verifiable, reviewable tasks (1–3 hours each)
   - Each task maps to a requirement (AC-X.X reference)
   - Clear "done" definition
   - Dependencies marked
2. **Execution loop:**
   - Pick top unchecked task
   - Mark `[~]` (in-progress) — only one at a time by default
   - Implement
   - Verify (lint, types, build)
   - Mark `[x]` (done)
   - Record in PLAN.md if it's a major decision

---

## Review gates (conditional)

Not every spec needs two full reviews. Calibrate based on risk:

| Risk level | Examples | Review gates |
|------------|----------|--------------|
| **High** | Trust/safety, money, auth, schema changes, new user flows | 2 gates: requirements + design (separate) |
| **Medium** | Multi-file features, UI overhauls, new pages | 1 gate: combined requirements + design review |
| **Low** | Single-file refactors, copy changes, style fixes | No spec needed — use TODO.md / PLAN.md |

**Always spec (regardless of size):**
- Anything touching payments/donations
- Anything touching auth/identity
- Anything touching user data/PII
- Schema changes
- Trust/safety features

---

## EARS notation (for requirements)

EARS = Easy Approach to Requirements Syntax

### Patterns

| Type | Pattern | Example |
|------|---------|---------|
| **Ubiquitous** | THE SYSTEM SHALL [behavior] | THE SYSTEM SHALL display a loading spinner during API calls |
| **Event-driven** | WHEN [event] THE SYSTEM SHALL [behavior] | WHEN a user submits a report THE SYSTEM SHALL save it and show confirmation |
| **State-driven** | WHILE [state] THE SYSTEM SHALL [behavior] | WHILE the user is unauthenticated THE SYSTEM SHALL hide the donate button |
| **Optional** | WHERE [feature enabled] THE SYSTEM SHALL [behavior] | WHERE clinic verification is enabled THE SYSTEM SHALL show the clinic badge |
| **Unwanted** | IF [condition] THEN THE SYSTEM SHALL NOT [behavior] | IF the case is reported THEN THE SYSTEM SHALL NOT allow new donations |

### Guidelines
- **3–7 acceptance criteria per user story** (not more, not fewer)
- **At least one negative/error case** per story (what should NOT happen)
- Keep it tight — EARS is a tool, not bureaucracy

---

## Task states

| Symbol | State | Meaning |
|--------|-------|---------|
| `[ ]` | Not started | Ready to pick up |
| `[~]` | In-progress | Currently being worked on (prefer one at a time) |
| `[x]` | Done | Completed and verified |
| `[!]` | Blocked | Waiting on external dependency |
| `[-]` | Dropped | Descoped (explain why) |

---

## Spec status vocabulary (consistent across all templates)

| Status | Meaning |
|--------|---------|
| 🟡 Draft | Being written, not yet reviewed |
| 🔵 In Review | Sent to Codex for critique |
| 🟢 Locked | Approved, ready for next phase or execution |
| ✅ Complete | Shipped, moved to `.specs/completed/` |

---

## Change control

| Change type | Re-review required? |
|-------------|---------------------|
| Typo / clarification (no behavior change) | No |
| New AC added to existing story | Yes (Codex review) |
| New user story added | Yes (Codex review) |
| Schema / data model change | Yes (full design re-review) |
| Architecture change | Yes (full design re-review) |
| Task reordering / splitting | No |
| Task dropped (descoped) | Document reason, no re-review |

---

## Non-functional requirements checklist

Every `requirements.md` should consider (even if answer is "N/A"):

- [ ] **Accessibility:** WCAG compliance, screen reader support
- [ ] **Performance:** load time budgets, bundle size impact
- [ ] **i18n:** which strings need translation
- [ ] **Analytics:** what events to track
- [ ] **Offline/mobile:** Capacitor constraints, offline behavior
- [ ] **Permissions:** who can do what (by role)

---

## Integration with existing docs

| Existing doc | Role in spec-driven workflow |
|--------------|------------------------------|
| `VISION.md` | North star — specs must align |
| `PRD.md` | Product context — requirements derive from here |
| `ROADMAP.md` | Prioritization — which spec to build next |
| `PLAN.md` | Lightweight reviews for small changes (link to spec for big ones) |
| `TODO.md` | Operational backlog — may reference spec tasks |
| `DECISIONS.md` | Lasting decisions made during spec execution |
| `TRUST-SAFETY.md` | Constraints — every spec must respect |
| `STYLE.md` | UI constraints — design.md references |
| `TECH-STACK.md` | Tech constraints — design.md references |

---

## Spec lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│  1. PICK from ROADMAP.md                                        │
│     ↓                                                           │
│  2. CREATE spec folder in .specs/active/<feature>/              │
│     ↓                                                           │
│  3. DRAFT requirements.md (OPUS)                                │
│     ↓                                                           │
│  4. REVIEW requirements (Codex) — iterate until locked          │
│     ↓                                                           │
│  5. DRAFT design.md (OPUS)                                      │
│     ↓                                                           │
│  6. REVIEW design (Codex) — iterate until locked                │
│     [For medium-risk: combine steps 4+6 into one review]        │
│     ↓                                                           │
│  7. GENERATE tasks.md (OPUS)                                    │
│     ↓                                                           │
│  8. EXECUTE tasks one by one (OPUS)                             │
│     - Mark [~] when starting                                    │
│     - Verify: pnpm lint, tsc, build                             │
│     - Mark [x] when done                                        │
│     ↓                                                           │
│  9. SHIP — move spec to .specs/completed/                       │
│     ↓                                                           │
│ 10. UPDATE ROADMAP.md checkbox + DECISIONS.md if needed         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Codex critique contract

When reviewing a spec, Codex must be **adversarial to weak assumptions**:

### Requirements review checklist
- [ ] Are all user types covered?
- [ ] Are edge cases explicit?
- [ ] Are error states defined (at least one per story)?
- [ ] Does this respect TRUST-SAFETY.md?
- [ ] Is anything ambiguous or untestable?
- [ ] What's missing that will bite us later?
- [ ] Are non-functional requirements addressed?

### Design review checklist
- [ ] Does the data model support all requirements?
- [ ] Are there security holes (auth, validation, injection)?
- [ ] What breaks at scale?
- [ ] Is this the simplest approach that works?
- [ ] Does this match TECH-STACK.md and STYLE.md?
- [ ] What are the risks?
- [ ] Is the testing strategy realistic given current toolchain?

### Task review checklist
- [ ] Is each task small and verifiable (1–3 hours)?
- [ ] Do tasks map to requirements (AC-X.X)?
- [ ] Are dependencies correct?
- [ ] Is the verification step clear?

---

## Quick reference commands

### PowerShell (Windows)

```powershell
# Create a new spec
New-Item -ItemType Directory -Path ".specs\active\<feature-name>" -Force
Copy-Item -Path ".specs\_TEMPLATE\*" -Destination ".specs\active\<feature-name>\" -Recurse

# Check quality gates
pnpm lint
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

### Bash (macOS/Linux)

```bash
# Create a new spec
mkdir -p .specs/active/<feature-name>
cp -r .specs/_TEMPLATE/* .specs/active/<feature-name>/

# Check quality gates
pnpm lint
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

---

## FAQ

**Q: Do I need a spec for every change?**  
A: No. Use specs for **meaningful features** (1+ day of work, multiple files, product impact) or **any change touching trust/safety/money/auth/schema** regardless of size. Bug fixes and small tweaks can go straight to `TODO.md`.

**Q: What if requirements change mid-spec?**  
A: Check the change-control table above. Minor clarifications don't need re-review; new stories or schema changes do.

**Q: How detailed should design.md be?**  
A: Detailed enough that OPUS tomorrow (or a new developer) could implement it without asking questions. Include types, function signatures, and error handling.

**Q: What about testing?**  
A: Testing strategy in `design.md` should reference the **current repo toolchain**. If no test runner exists yet, say "manual smoke test" — don't pretend we have Vitest if we don't.

**Q: Can I merge requirements + design for smaller features?**  
A: You don’t need to merge files. For medium-risk features, keep `requirements.md` + `design.md`, but do a single combined Codex review of both, then generate `tasks.md`.
