# Task 2: Vite 7 Alignment

> **Goal:** Audit and align the Vite configuration, build pipeline, and HTML entry point with Vite 7 best practices.

---

## Your Process

1. **Read the latest Vite 7 documentation** — focus on `defineConfig`, plugin patterns, environment variables, and build optimization.
2. **Audit every file listed below** against current best practices.
3. **Refactor** — apply changes, remove legacy patterns.
4. **Verify** — `pnpm build` must pass cleanly.

---

## Files to Audit

### `vite.config.ts`

Current state:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: { host: "::", port: 8080 },
  plugins: [
    tailwindcss(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
```

**Issues to fix:**
1. **Remove `lovable-tagger`** — this is a Lovable.dev artifact. Remove the import and the conditional plugin. Also remove `lovable-tagger` from `package.json` dependencies.
2. **Use `import.meta.dirname`** instead of `path` + `__dirname`. Vite 7 with ESM supports `import.meta.dirname` natively. Remove the `path` import.
3. **Audit plugin order** — Tailwind CSS Vite plugin should come before React plugin (it already does, good).
4. **Check if `server.host: "::"` is still appropriate** — this listens on all interfaces including IPv6. For local dev, `true` or `"0.0.0.0"` may be more standard. Align with Vite 7 docs.
5. **Add build optimizations if missing** — check if `build.target`, `build.sourcemap`, `build.rollupOptions` should be configured for production.
6. **Check for Vite 7 deprecations** — read the Vite 7 migration guide and fix any deprecated patterns.

### `index.html`

Current state contains stale Lovable references:
- `<meta name="description" content="Lovable Generated Project" />`
- `<meta name="author" content="Lovable" />`
- `<meta property="og:title" content="Lovable App" />`
- `<meta property="og:description" content="Lovable Generated Project" />`
- `<meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />`
- `<meta name="twitter:site" content="@Lovable" />`
- `<meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />`
- `<!-- TODO: Set the document title...` comment

**Fix all of these:**
- Set description to something relevant: "Trust-first fundraising for animals in need"
- Set author to "Pawtreon"
- Set og:title to "Pawtreon"
- Set og:description to match
- Remove or replace og:image and twitter:image (use a placeholder path like `/og-image.png` for now)
- Set twitter:site to "@pawtreon" or remove
- Remove TODO comments

### `tsconfig.json` (root)

Current state has permissive settings:
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

**Do NOT change these in this task** — that's Task 7 (ESLint + TypeScript). Just note them here for awareness. The root tsconfig is a project references wrapper — the real config is `tsconfig.app.json`.

### `tsconfig.app.json`

Current `strict: false` and all linting checks off. **Defer to Task 7.** Just verify the `paths` alias `@/*` matches `vite.config.ts` alias (it does).

### `tsconfig.node.json`

Used for config files (vite.config.ts, etc.). Check it aligns with Vite 7 expectations. Current target is `ES2022` — verify this is correct for Vite 7.

---

## Verification

```bash
pnpm build
pnpm dev  # start and verify the app loads
```

---

## Commit
```
refactor: align vite.config.ts and index.html with Vite 7 best practices
```
