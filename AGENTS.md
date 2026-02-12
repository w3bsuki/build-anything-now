# Pawtreon — Agent Rules

> **Purpose:** How OPUS, Codex, and Human work together.  
> **Last updated:** 2026-02-10

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 7 + TypeScript |
| Backend | Convex (realtime DB + serverless functions) |
| Auth | Clerk |
| Mobile | Capacitor (iOS + Android) |
| UI | shadcn/ui + Tailwind CSS v4 |
| i18n | i18next |
| Payments | Stripe (hosted checkout + webhooks) |

## Quick Commands

```bash
pnpm dev          # Start Vite dev server
npx convex dev    # Start Convex backend (run alongside Vite)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm docs:index   # Regenerate feature index from specs + PRD
pnpm docs:check   # Validate docs headers/template + links
```

## Critical Gotchas

- Convex requires `npx convex dev` running alongside Vite — both must be up
- Tailwind v4 config lives in `src/index.css`, NOT `tailwind.config.*`
- shadcn/ui components live in `src/components/ui/`
- Convex auto-generated types are in `convex/_generated/` — never edit
- `refactor/` folder is ephemeral cleanup tooling — delete when refactor completes

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

Everything else lives in `docs/` (product, features, systems, design, business, missions, partners, investor).

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
├── PRD.md              # Product + feature checklist (canonical)
├── TASKS.md            # Current sprint
├── DESIGN.md           # Architecture + patterns
├── RULES.md            # Trust/safety + UX rules
├── DECISIONS.md        # Decision log
├── AGENTS.md           # This file
├── README.md           # Setup/onboarding
├── src/AGENTS.md       # Frontend agent rules
├── convex/AGENTS.md    # Backend agent rules
└── docs/
    ├── features/       # Per-feature specs + INDEX.md (auto-generated)
    ├── product/        # Roadmap, master plan
    ├── systems/        # Data model, API, auth, deployment, testing, analytics
    ├── design/         # UI patterns, theming, mobile, i18n
    ├── business/       # Revenue, partner types, growth
    ├── missions/       # Platform initiatives (drones, safehouse)
    ├── partners/       # Operational partner docs
    └── investor/       # Pitch materials
```

**Hard cap:** 7 root docs. If we need an 8th, we merge something.

---

## Common Tasks (Recipes)

### Add a new page
1. Create `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx`
3. Use an existing layout from `src/layouts/`
4. Add i18n keys in `public/locales/en/translation.json`
5. Use `useTranslation()` for all user-facing strings

### Add a Convex function
1. Add or modify handler in the relevant `convex/*.ts` file
2. Follow naming: `get*`/`list*` for queries, `create*`/`update*`/`delete*` for mutations
3. All mutations require auth — use `getAuthUserId()` from `convex/lib/auth.ts`
4. Run `npx convex dev` to regenerate types

### Add a shadcn/ui component
1. `pnpm dlx shadcn@latest add <component-name>`
2. Component appears in `src/components/ui/`
3. Customize using Tailwind v4 tokens from `src/index.css`
4. Always use `cn()` from `src/lib/utils.ts` for conditional classes

### TASKS.md Archive Ceremony
Every Monday, OPUS archives completed sprint items to `docs/archive/sprints/YYYY-WW.md`. TASKS.md retains only: **In Progress**, **Current Sprint**, **Backlog**.
