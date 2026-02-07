# Task 7: ESLint + TypeScript Config

> **Goal:** Tighten ESLint and TypeScript configurations. Remove overly permissive settings, align with modern flat config patterns, enforce basic quality gates.

---

## Your Process

1. **Read the ESLint flat config docs** — understand the latest patterns for `eslint.config.js`.
2. **Read TypeScript 5.9 docs** — check for any new compiler options or deprecated ones.
3. **Audit and tighten configs** — but don't go so strict that the existing codebase can't compile. The goal is reasonable defaults, not perfection.
4. **Verify** — `pnpm lint` and `pnpm exec tsc --noEmit` must pass.

---

## Files to Audit

### `eslint.config.js`

Current state: flat config with typescript-eslint, react-hooks, react-refresh plugins. 

**Check:**
1. The Convex override block gives both `globals.node` AND `globals.browser` — is that correct for Convex functions? Convex runs in its own runtime, not exactly Node. Check Convex docs for recommended ESLint config.
2. `@typescript-eslint/no-unused-vars: "off"` — this is too permissive. Set to `"warn"` with `argsIgnorePattern: "^_"` so prefixed underscored args are allowed but truly unused vars get flagged.
3. Check if any useful ESLint rules should be enabled:
   - `no-console` at `warn` level (allow `console.warn/error`, flag `console.log`)
   - `prefer-const`
   - Any react-specific rules from the plugin defaults
4. Verify `ignores: ["dist"]` also ignores `convex/_generated/` — generated code should not be linted.

### `tsconfig.json` (root — project references wrapper)

Current:
```json
{
  "noImplicitAny": false,
  "noUnusedParameters": false,
  "skipLibCheck": true,
  "allowJs": true,
  "noUnusedLocals": false,
  "strictNullChecks": false
}
```

**Issues:**
1. These options are on the root config but the root `"files": []` means it doesn't compile anything directly — it's a project references shell. These options get inherited by `tsconfig.app.json` and `tsconfig.node.json` only if those don't override them.
2. `allowJs: true` — is there any JS in `src/`? If not, remove this.
3. `strictNullChecks: false` — this is the most dangerous permissive setting. Ideally set to `true`, but it may cause hundreds of errors in the existing codebase. Flag it for a future effort but don't enable it in this pass unless the codebase handles it.
4. `noImplicitAny: false` — same as above. Flag for future but don't break the build.

**Recommended approach:** Set `noUnusedLocals: true` and `noUnusedParameters: true` in `tsconfig.app.json` — these are low-risk and help catch dead code. Fix any resulting errors by removing unused variables.

### `tsconfig.app.json`

Current: `strict: false`, all checks off.

**Minimum tightening (low breakage risk):**
1. Set `noUnusedLocals: true`
2. Set `noUnusedParameters: true`
3. Set `noFallthroughCasesInSwitch: true`
4. Leave `strict: false` for now — enabling it would require fixing nullability everywhere.
5. Verify `target: "ES2020"` is appropriate — could upgrade to `ES2022` since Vite 7 targets modern browsers.
6. Verify `lib` includes the right DOM types.

### `tsconfig.node.json`

Used for config files. Verify:
1. `target: "ES2022"` — fine
2. It should include `vite.config.ts`, `eslint.config.js`, etc.
3. Check if its `include` array is correct

---

## After Config Changes

```bash
# Fix any new lint errors from tightened rules
pnpm lint --fix

# Fix any new type errors from tightened tsconfig
pnpm exec tsc -p tsconfig.app.json --noEmit
```

If `noUnusedLocals/noUnusedParameters` flags real unused code, remove it. That's the whole point — this is a cleanup refactor.

---

## Verification

```bash
pnpm lint
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

---

## Commit
```
refactor: tighten ESLint and TypeScript configs, remove unused variables
```
