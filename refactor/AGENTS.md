# Refactor Agent Instructions

> **Read this first.** This file tells you how to work through the refactor.

---

## What is this?

You are cleaning up and aligning the **Pawtreon** codebase with best practices. Pawtreon is a React 19 + Vite 7 + Tailwind v4 + shadcn/ui + Convex (backend) + Clerk (auth) + Capacitor (mobile) fundraising app for animals.

The codebase was partially scaffolded by Lovable.dev and has accumulated stale files, unused dependencies, Lovable artifacts, loose configs, and over-engineering.

---

## How to Execute

1. **Open `TASKS.md`** in this folder — it lists 10 tasks in order.
2. **Execute tasks sequentially** — each task has a dedicated `.md` file with the full plan.
3. **For each task:**
   - Read the `.md` file completely
   - Plan your changes (list what you'll do)
   - Execute the changes
   - Run the verification commands specified in the task
   - Commit with the suggested commit message
4. **Think independently** — the task files tell you WHAT to audit and WHERE to look. You must read the latest docs for each tool (Vite 7, Tailwind v4, shadcn, etc.) and make the right decisions yourself.
5. **Delete aggressively** — the goal is to reduce code volume, not preserve it. If something is not actively used, remove it.
6. **Don't add features** — this is cleanup and alignment only.

---

## Project Context

- **PRD:** `../PRD.md` — product vision
- **Design:** `../DESIGN.md` — architecture, data model, patterns
- **Rules:** `../RULES.md` — trust/safety constraints (don't break these)
- **Current tasks:** `../TASKS.md` — active sprint items (don't break in-progress work)

---

## Key Files

| File | What it is |
|------|-----------|
| `vite.config.ts` | Vite 7 config — has Lovable tagger to remove |
| `index.html` | Entry HTML — has Lovable meta tags to fix |
| `src/index.css` | Tailwind v4 full config (419 lines) |
| `components.json` | shadcn/ui config |
| `src/components/ui/` | 49 shadcn primitives — many likely unused |
| `convex/schema.ts` | 699-line Convex schema |
| `package.json` | Dependencies — name is still "vite_react_shadcn_ts" |
| `src/App.tsx` | 212-line router with 50+ imports |
| `eslint.config.js` | ESLint flat config |
| `tsconfig*.json` | TypeScript configs (permissive) |

---

## What to Preserve

- `ios/`, `android/`, `capacitor.config.ts` — mobile shell
- `convex/_generated/` — auto-generated, don't touch
- `public/locales/` — translation files
- All functional pages and components that are actively used
- The trust/safety patterns described in `RULES.md`
- The data model contracts in `DESIGN.md`

---

## What to Delete

- All root `*.png` audit screenshots
- `.playwright-mcp/` folder
- `test-results/` folder
- `app/` folder (deprecated CSS)
- `src/App.css` (Vite starter boilerplate)
- `src/fonts.css` (duplicate font declaration)
- `src/pages/demo/` (empty)
- Any shadcn/ui component not imported anywhere
- Any npm package not imported anywhere
- Lovable artifacts (`lovable-tagger`, Lovable meta tags)
- Dead hooks, dead exports, commented-out code
