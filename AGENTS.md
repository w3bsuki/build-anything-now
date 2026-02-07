# Pawtreon — Agent Rules

> **Purpose:** How OPUS, Codex, and Human work together.  
> **Last updated:** 2026-02-06

---

## Canonical Docs (Read These First)

| File | Purpose |
|------|---------|
| `PRD.md` | Product vision + canonical feature checklist |
| `TASKS.md` | Current sprint (what we do NOW) |
| `DESIGN.md` | Architecture, stack, data model, patterns |
| `docs/design/ui-patterns-spec.md` | Canonical UI/UX patterns for case-first surfaces |
| `RULES.md` | Trust/safety, UX guardrails, constraints |
| `DECISIONS.md` | Append-only decision log |
| `AGENTS.md` | This file — workflow contract |
| `README.md` | Setup/run/build (onboarding only) |

Everything else lives in `docs/` (product, architecture, design, partners, mission, investor, archive, legal).

---

## Agent Roles

| Agent | Role | What They Do |
|-------|------|--------------|
| **OPUS** (Claude in VS Code) | Executor | Writes code, runs commands, implements |
| **Codex** | Reviewer | Challenges assumptions, catches blind spots |
| **Human** | Decider | Approves, resolves disputes, makes final calls |

---

## Workflow

### Normal Work (Most Changes)

1. Pick task from `TASKS.md` (or add one)
2. OPUS posts 1–2 screen proposal (approach + AC)
3. Codex reviews (optional for low-risk)
4. Human decides
5. OPUS implements
6. Update `TASKS.md` when done
7. If it changes product scope → update `PRD.md` checklist
8. If it's a durable decision → append to `DECISIONS.md`

### High-Risk Work (Money / Auth / PII / Schema / Trust)

Same loop, plus:
- OPUS must add/update a **Feature section in `DESIGN.md`** before coding
- Include: data changes, API surface, abuse cases, mitigations
- Codex review **required** — must explicitly sign off on risks

---

## Review Gates

| Risk Level | Examples | Review Required |
|------------|----------|-----------------|
| **High** | Payments, auth, PII, schema, trust/safety | Yes — Codex sign-off |
| **Medium** | Multi-file features, new pages | Optional |
| **Low** | Bug fixes, copy, polish | No |

---

## Rules (Non-Negotiable)

1. **Read `PRD.md` first** — it's the product bible
2. **Check `TASKS.md`** — know what's in progress
3. **Follow `DESIGN.md`** — use the patterns
4. **Follow `docs/design/ui-patterns-spec.md`** for UI/UX and styling constraints
5. **Obey `RULES.md`** — no exceptions for trust/safety
6. **Log decisions** — append to `DECISIONS.md`

### What NOT To Do

- ❌ Don't create new `.md` files in root without approval
- ❌ Don't add folders to root
- ❌ Don't use `.specs/` anymore (archived)
- ❌ Don't accumulate "rounds" or history in any file
- ❌ Don't ship high-risk without Codex review

---

## Prompt Prefixes (Optional)

When asking for help, prefix to activate the right context:

| Prefix | Focus |
|--------|-------|
| `BACKEND:` | Convex functions, API, data |
| `FRONTEND:` | React, UI, Tailwind, i18n |
| `AUDIT:` | Repo-wide scans (security, perf, consistency) |
| `TEST:` | Typecheck, tests, CI |

---

## File Locations

```
/
├── PRD.md              # Product + feature checklist
├── TASKS.md            # Current sprint
├── DESIGN.md           # Architecture + patterns
├── RULES.md            # Trust/safety + UX rules
├── DECISIONS.md        # Decision log
├── AGENTS.md           # This file
├── README.md           # Setup/onboarding
└── docs/
    ├── product/        # Product deep dives
    ├── architecture/   # Architecture deep dives
    ├── design/         # UI/UX specs and audits
    ├── partners/       # Partner ops
    ├── mission/        # Mission strategy docs
    ├── investor/       # Pitch materials
    ├── archive/        # Old docs, specs
    └── legal/          # Terms, privacy (future)
```

**Hard cap:** 7 root docs. If we need an 8th, we merge something.
