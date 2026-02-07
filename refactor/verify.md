# Task 10: Final Verification

> **Goal:** After all refactor tasks are complete, run a comprehensive verification pass to ensure the entire app compiles, builds, lints, and starts correctly.

---

## Your Process

Run every verification step below in order. Fix any failures.

---

## Step 1: TypeScript Compilation

```bash
pnpm exec tsc -p tsconfig.app.json --noEmit
```

If errors:
- Broken imports from deleted files → remove the import or update the path
- Missing type references → fix or add
- Unused variable errors (if tsconfig was tightened) → remove the variable

## Step 2: Convex Type Check

```bash
pnpm exec tsc -p convex/tsconfig.json --noEmit
```

Or if available:
```bash
npx convex typecheck
```

## Step 3: ESLint

```bash
pnpm lint
```

If errors:
- Auto-fixable → run `pnpm lint --fix`
- Manual fixes → fix them

## Step 4: Build

```bash
pnpm build
```

This is the critical test. If it passes, the app is deployable.

Check the output:
- Build size — note for comparison
- Any warnings about large chunks → may need code splitting (not in scope for this refactor, just note)

## Step 5: Dev Server

```bash
pnpm dev
```

Start the dev server and verify:
- App loads in browser
- Home page renders
- No console errors
- Navigation works
- Dark mode toggle works (if present)

## Step 6: Style Gate

```bash
pnpm styles:scan
```

Run the style scanner (if it still exists after cleanup). Verify no regressions.

## Step 7: File Count Check

Run a count of files before and after refactoring to quantify the cleanup:

```bash
# Count source files
find src -type f | wc -l
find convex -type f -not -path "convex/_generated/*" | wc -l
```

Note the reduction for the commit message.

---

## Final Summary

After all checks pass, write a brief summary:
- Total files removed
- Dependencies removed
- Key changes per area
- Any known issues or follow-up items

---

## Commit
```
refactor: final verification pass — all checks green
```
