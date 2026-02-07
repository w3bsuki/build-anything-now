# Task 1: Dead File Cleanup

> **Goal:** Remove all stale, deprecated, unused, and orphaned files from the repo. Pure deletion — no code refactoring.

---

## Your Process

1. **Scan the entire repo** for files matching the deletion targets below.
2. **Verify each file is not imported** anywhere before deleting.
3. **Delete everything listed** — do not ask, do not preserve "just in case."
4. **Run `pnpm build`** after deletion to verify nothing breaks.

---

## Deletion Targets

### Root-level audit PNGs (old visual audit screenshots)
Delete ALL `.png` files in the project root:
- `audit-partners.png`
- `audit-home-full.png`
- `audit-home-320.png`
- `audit-community.png`
- `audit-clinics.png`
- `audit-campaigns.png`
- `audit-account.png`
- Any other `*.png` files in the root directory

### `.playwright-mcp/` folder
Delete the entire `.playwright-mcp/` directory. It contains old screenshot artifacts from Playwright MCP runs — dozens of PNGs that are not part of the app.

### `test-results/` folder
Delete the entire `test-results/` directory. Contains only `.last-run.json` — stale test output.

### `app/` folder
Delete the entire `app/` directory. Contains only `globals.css.deprecated` — a leftover from a previous framework experiment.

### `docs/archive/` subfolders
Delete the entire `docs/archive/` directory tree. It contains:
- `docs/archive/gpt/` — old GPT audit outputs (8+ files)
- `docs/archive/legacy/` — old legacy docs with subfolders
- `docs/archive/workflow-legacy/` — old `.specs/` folder, `PLAN.md`, `ROADMAP.md`, `TODO.md`, etc.

These are historical artifacts. The canonical docs are in the root (`PRD.md`, `DESIGN.md`, etc.).

### `src/App.css` — Vite starter boilerplate
This file contains the default Vite React starter CSS (logo spin animation, centered layout). It is NOT used by the app — the app uses `src/index.css` for all styling. Verify it's not imported anywhere, then delete it.

### `src/fonts.css` — duplicate font declaration
This file redeclares `--font-sans` which is already fully defined in `src/index.css` `@theme` block. Check if it's imported in `main.tsx` — if so, remove the import AND the file. The font stack in `index.css` is canonical.

### `src/pages/demo/` — empty demo folder
This folder is empty. Delete it.

### `src/data/presentationData.ts` — investor pitch data
Check if this is used by `Presentation.tsx` or `PartnerPresentation.tsx`. If those pages are just demo/pitch pages not part of the core app, flag them but keep for now. If `presentationData.ts` is only used by pitch pages, keep it with the pages.

### `docs/OPUS-REVIEW-THREAD.md`
Check if this is a stale review thread. If it's an old conversation log, delete it.

### `CONTRIBUTING.md`
Check if this contains useful information beyond what's in `README.md`. If it's just a stub that duplicates README, delete it. The project has `AGENTS.md` for contributor workflow.

---

## Verification

After all deletions:
```bash
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

If either fails, check which deleted file caused a broken import and fix the import (remove it or update it).

---

## Commit
```
refactor: remove stale PNGs, archive docs, deprecated files, and empty folders
```
