# Task 9: Package.json + Dependencies

> **Goal:** Audit all dependencies. Remove unused packages. Check for correct versions. Consolidate scripts. Clean up the project identity.

---

## Your Process

1. **For EVERY dependency in `dependencies` and `devDependencies`**, search the codebase for imports of that package.
2. **If not imported anywhere**, remove it.
3. **Check for outdated patterns** in scripts.
4. **Run `pnpm install`** after changes to regenerate the lockfile.
5. **Verify** — `pnpm build` must pass.

---

## `package.json` Audit

### Project Identity
Current `"name": "vite_react_shadcn_ts"` — this is a Lovable/template artifact.
Change to `"pawtreon"`.

### Scripts

Current:
```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint . && pnpm -s styles:gate",
  "preview": "vite preview",
  "styles:scan:palette": "node scripts/style-scan.mjs palette",
  "styles:scan:arbitrary": "node scripts/style-scan.mjs arbitrary",
  "styles:scan:gradients": "node scripts/style-scan.mjs gradients",
  "styles:scan": "...",
  "styles:gate": "pnpm -s styles:scan"
}
```

**Check:**
1. Are the `styles:scan:*` scripts still needed after the Tailwind cleanup? If the style scanner is useful as a CI gate, keep it. If it scans for patterns we've already fixed, simplify or remove.
2. `build:dev` — is this used? If not, remove.
3. Should there be a `typecheck` script? Add: `"typecheck": "tsc -p tsconfig.app.json --noEmit"`
4. Should there be a `convex:dev` script? Add if useful: `"convex:dev": "npx convex dev"`

### Dependencies to Investigate

**Likely unused — search for imports before removing:**

| Package | Why suspicious |
|---------|---------------|
| `@tanstack/react-query` | Convex has its own reactivity. Is `useQuery` from tanstack used anywhere? |
| `react-joyride` | Product tour library. Is the tour feature complete or scaffolding? |
| `react-resizable-panels` | Panel resizing — is this used in the mobile-first app? |
| `recharts` | Charts — are there dashboards? |
| `cmdk` | Command palette — is this used? |
| `embla-carousel-react` | Carousel — is this used? |
| `next-themes` | Theme switching — verify it's used for dark mode. |
| `vaul` | Drawer component — verify usage. |
| `stripe` | Server-side Stripe — this should be in Convex, not frontend. Check if it's used in frontend code or only in Convex. If only Convex, it's a peer dep question. |
| `svix` | Webhook service — is this used? |
| `input-otp` | OTP input — is there an OTP flow? |
| `react-day-picker` | Date picker — is this used? |
| `@vercel/analytics` | Are Vercel analytics configured? |
| `framer-motion` | Animation library — how heavily used? If just for a few transitions, consider if it's worth the bundle size. |

**DevDependencies to check:**

| Package | Why suspicious |
|---------|---------------|
| `lovable-tagger` | Lovable artifact — remove (already flagged in vite.md) |
| `i18next-cli` | Is the CLI extraction tool actually used in any workflow? |

### After Removing Packages

```bash
pnpm install  # regenerate lockfile
pnpm build    # verify nothing breaks
```

For each removed package, check:
1. No import statements reference it
2. No `package.json` scripts reference it
3. No config files reference it

---

## Verification

```bash
pnpm install
pnpm lint
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

---

## Commit
```
refactor: remove unused dependencies, clean package.json, add typecheck script
```
