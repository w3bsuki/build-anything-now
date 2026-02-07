# Refactor — Master Task List

> **Purpose:** Orchestrate a full tech-stack cleanup and best-practices alignment for Pawtreon.
> **How to use:** Execute tasks in order. Each task points to a dedicated `.md` file with the full plan. Read the plan, then execute it autonomously — audit, plan, refactor, verify.
> **Date:** 2026-02-07

---

## Context

**Pawtreon** is a trust-first, mobile-first fundraising + community app for animals in need.

**Stack:** React 19 + Vite 7 + TypeScript + Tailwind CSS v4 + shadcn/ui + Convex (backend) + Clerk (auth) + Capacitor (mobile) + i18next + Stripe

**Goal of this refactor:** Align every layer of the stack with current best practices, remove all dead/stale/unused files, reduce code volume, and leave a clean baseline to continue building from.

---

## Task Execution Order

### Task 1: Dead File Cleanup
**Read:** `cleanup.md`
**Scope:** Delete all stale PNGs, deprecated files, empty folders, archive cruft, leftover Lovable/GPT artifacts, unused scripts, empty demo pages. This is pure deletion — no code changes.

### Task 2: Vite 7 Alignment
**Read:** `vite.md`
**Scope:** Audit `vite.config.ts`, `index.html`, `tsconfig*.json`, build pipeline. Align with Vite 7 best practices. Remove `lovable-tagger`. Fix meta tags.

### Task 3: Tailwind CSS v4 Alignment
**Read:** `tailwind.md`
**Scope:** Audit `src/index.css` (the Tailwind v4 config), token system, `@theme` block, custom components/utilities. Remove duplicate font declarations. Align with Tailwind v4 CSS-first config patterns.

### Task 4: shadcn/ui Alignment
**Read:** `shadcn.md`
**Scope:** Audit `components.json`, all `src/components/ui/*` primitives, theming integration. Align with latest shadcn/ui patterns. Remove unused UI primitives. Clean up `use-toast` duplication.

### Task 5: React + Router Cleanup
**Read:** `react.md`
**Scope:** Audit `App.tsx` routing, page imports, component structure, hooks. Remove dead pages (empty demo folder). Consolidate provider nesting. Align with React 19 + React Router v7 patterns.

### Task 6: Convex Backend Cleanup
**Read:** `convex.md`
**Scope:** Audit `convex/schema.ts` (699 lines), all query/mutation files, `_generated/` alignment. Remove dead exports, unused tables, over-engineered patterns. Keep it lean.

### Task 7: ESLint + TypeScript Config
**Read:** `eslint-typescript.md`
**Scope:** Audit `eslint.config.js`, all `tsconfig*.json` files. Tighten rules. Remove overly permissive `noImplicitAny: false` etc. Align with modern flat config patterns.

### Task 8: i18n + Assets Cleanup
**Read:** `i18n-assets.md`
**Scope:** Audit i18n setup, locale files, font loading, public assets. Remove stale locale keys. Consolidate font CSS. Clean `public/` folder.

### Task 9: Package.json + Dependencies
**Read:** `dependencies.md`
**Scope:** Audit all dependencies. Remove unused packages. Check for outdated versions. Consolidate scripts. Clean up lockfile.

### Task 10: Final Verification
**Read:** `verify.md`
**Scope:** After all refactors, run full build + lint + typecheck. Verify the app compiles and runs. Catch any broken imports from deleted files.

---

## Rules for Execution

1. **Read the `.md` file first** — it contains the full audit plan and specific instructions.
2. **Plan before acting** — list what you will change, then execute.
3. **Delete aggressively** — if it's not imported/used, delete it.
4. **Verify after each task** — run `pnpm build` or `pnpm exec tsc --noEmit` to catch breakage.
5. **Don't add new features** — this is cleanup only.
6. **Don't touch Convex `_generated/`** — those are auto-generated.
7. **Keep `ios/`, `android/`, `capacitor.config.ts`** — mobile shell stays.
8. **Keep all Convex function files** — but clean dead exports within them.
9. **Commit after each task** — one clean commit per task.
