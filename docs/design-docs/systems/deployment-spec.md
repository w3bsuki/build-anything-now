# Deployment & Infrastructure Spec

> **Owner:** Engineering  
> **Status:** final  
> **Last updated:** 2026-02-12  
> **Absorbs:** `docs/design-docs/systems/techstack-baseline.md`

---

## Purpose

Defines the complete deployment topology, build pipeline, environment configuration, and CI/CD strategy for Pawtreon. Covers web hosting, backend deployment, mobile builds, and developer tooling.

---

## Hosting Topology

```
┌─────────────────┐     ┌──────────────────────┐
│  Vercel (CDN)   │     │   Convex Cloud        │
│  Static SPA     │────▶│   Backend Functions   │
│  dist/          │     │   Realtime DB         │
└─────────────────┘     │   File Storage        │
                        └──────────────────────┘
        │                         │
        ▼                         ▼
┌─────────────────┐     ┌──────────────────────┐
│  Clerk           │     │   Stripe              │
│  Auth Provider   │     │   Payment Provider    │
└─────────────────┘     └──────────────────────┘
```

| Layer | Provider | Purpose |
|-------|----------|---------|
| Frontend hosting | Vercel | Static SPA serving with CDN, SPA catch-all rewrite |
| Backend | Convex Cloud | Serverless functions, realtime database, file storage |
| Authentication | Clerk | User identity, session management, OAuth providers |
| Payments | Stripe | Hosted checkout, webhook event delivery |
| Mobile | Capacitor | Native iOS/Android wrappers around web app |
| Translation | DeepL | Machine translation API for UGC |

---

## Frontend Build Pipeline

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: { host: true, port: 8080 },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

| Setting | Value | Notes |
|---------|-------|-------|
| Dev server port | `8080` | `host: true` enables network access for mobile testing |
| React plugin | `@vitejs/plugin-react-swc` | SWC for fast compilation |
| CSS plugin | `@tailwindcss/vite` | Tailwind CSS v4 CSS-first integration |
| Path alias | `@/` → `./src/` | Used across all source files |
| Output dir | `dist/` | Default Vite output, consumed by Vercel + Capacitor |

### NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server on port 8080 |
| `build` | `vite build` | Production build → `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint . && pnpm -s styles:gate` | ESLint + style gate enforcement |
| `typecheck` | `tsc -p tsconfig.app.json --noEmit` | TypeScript type checking (app code) |
| `convex:typecheck` | `convex typecheck` | TypeScript type checking (Convex functions) |
| `styles:scan` | `pnpm -s styles:scan:palette && ...` | Run all style scans (palette, arbitrary, gradients) |
| `styles:gate` | `pnpm -s styles:scan` | Style gate (blocks forbidden CSS patterns) |

### Style Gate

The style gate (`scripts/style-scan.mjs`) enforces design token compliance on trust-critical surfaces:

- **Palette scan:** blocks raw palette classes (`bg-blue-500`, etc.) on scoped files
- **Arbitrary scan:** blocks arbitrary Tailwind values (`w-[300px]`) except safe-area exceptions
- **Gradient scan:** blocks gradients on trust surfaces

Run via: `pnpm lint` (includes ESLint + style gate)

---

## TypeScript Configuration

### Project References

```
tsconfig.json (root — solution-style)
├── tsconfig.app.json  (frontend app code — src/)
└── tsconfig.node.json (build tooling — vite.config.ts, scripts/)
```

### App TypeScript (`tsconfig.app.json`)

| Setting | Value | Impact |
|---------|-------|--------|
| `target` | `ES2022` | Modern output |
| `module` | `ESNext` | ESM modules |
| `moduleResolution` | `bundler` | Vite-compatible resolution |
| `jsx` | `react-jsx` | React 19 JSX transform |
| `strict` | **`false`** | ⚠️ Strict mode OFF — tech debt |
| `noImplicitAny` | `false` | Allows implicit `any` |
| `strictNullChecks` | `false` (inherited from root) | No null safety |
| `noUnusedLocals` | `true` | Warns on unused vars |
| `noUnusedParameters` | `true` | Warns on unused params |
| `noFallthroughCasesInSwitch` | `true` | Switch statement safety |
| `isolatedModules` | `true` | Required for SWC/esbuild |

**Known debt:** `strict: false` with `noImplicitAny: false` and `strictNullChecks: false` means TypeScript catches fewer bugs. Roadmap item: progressively enable strict checks file-by-file.

### Node TypeScript (`tsconfig.node.json`)

| Setting | Value |
|---------|-------|
| `target` | `ES2022` |
| `module` | `ESNext` |
| `strict` | `true` |

Strict mode is ON for build tooling but OFF for app code.

### Convex TypeScript (`convex/tsconfig.json`)

Convex has its own TypeScript configuration managed by the Convex CLI. Type checking via `convex typecheck`.

---

## ESLint Configuration

Single flat config file (`eslint.config.js`):

| Scope | Config | Notes |
|-------|--------|-------|
| All `**/*.{ts,tsx}` | `@eslint/js` recommended + `typescript-eslint` recommended | Base rules |
| All `**/*.{ts,tsx}` | `react-hooks` recommended | Hook rules enforcement |
| All `**/*.{ts,tsx}` | `react-refresh` only-export-components (warn) | HMR compatibility |
| `convex/**/*.{ts,tsx}` | `globals.node` | Server-side globals for Convex |
| All `**/*.{ts,tsx}` | `globals.browser` | Browser globals for frontend |
| All | `@typescript-eslint/no-unused-vars: warn` | Unused vars with `_` prefix exceptions |
| Ignored | `dist`, `convex/_generated` | Build output + generated code |

---

## Environment Variables

### Required Variables

| Variable | Where Used | Example |
|----------|------------|---------|
| `VITE_CONVEX_URL` | Frontend (Vite) | `https://xxx.convex.cloud` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend (Vite) | `pk_live_xxx` or `pk_test_xxx` |
| `APP_ORIGIN` | Convex backend (HTTP share pages) | `https://pawtreon.app` |
| `STRIPE_SECRET_KEY` | Convex backend (action) | `sk_live_xxx` or `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Convex backend (HTTP) | `whsec_xxx` |
| `CLERK_WEBHOOK_SECRET` | Convex backend (HTTP) | `whsec_xxx` (Svix) |
| `DEEPL_AUTH_KEY` | Convex backend (action) | DeepL API key |
| `TRANSLATION_RATE_LIMIT` | Convex backend (action) | Max translations per period |

### Variable Locations

| Variable Prefix | Location | Access Pattern |
|----------------|----------|----------------|
| `VITE_*` | Vercel env vars → Vite build-time injection | `import.meta.env.VITE_*` |
| Non-`VITE_*` | Convex dashboard → Environment Variables | `process.env.*` in Convex actions |

**Security:** Only `VITE_` prefixed vars are embedded in the client bundle. All secret keys (Stripe, Clerk webhook, DeepL) are server-side only in Convex.

---

## Vercel Configuration

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

- **SPA catch-all rewrite:** All routes serve `index.html`, client-side router handles navigation
- **No server-side rendering:** Pure client-side SPA
- **No serverless functions:** All backend logic in Convex
- **No edge middleware:** Auth handled client-side by Clerk

### Deployment

Vercel auto-deploys from the connected Git branch:
- `main` → production
- PR branches → preview deployments

Build command: `vite build`  
Output directory: `dist`  
Install command: `pnpm install`

---

## Convex Deployment

### Development

```bash
npx convex dev          # Start dev server (watches for changes)
```

- Connects to Convex dev deployment
- Hot-reloads function changes
- Uses dev environment variables from Convex dashboard

### Production

```bash
npx convex deploy       # Deploy to production
```

- Pushes all functions + schema to production Convex deployment
- Runs schema migrations automatically
- Requires `CONVEX_DEPLOY_KEY` for CI/CD

### Function Files

19 function files in `convex/`:

| File | Functions | Domain |
|------|-----------|--------|
| `users.ts` | 8 | User management |
| `cases.ts` | 11 | Case CRUD + lifecycle |
| `donations.ts` | 8 | Payments + receipts |
| `clinics.ts` | 7 | Clinic directory + claims |
| `campaigns.ts` | 4 | Campaign management |
| `community.ts` | 12 | Forum posts + moderation |
| `volunteers.ts` | 5 | Volunteer coordination |
| `social.ts` | 7 | Likes, follows, saves |
| `achievements.ts` | 4 | Badge system |
| `notifications.ts` | 5 | Notification delivery |
| `partners.ts` | 3 | Partner directory |
| `petServices.ts` | 6 | Pet service directory + claims |
| `settings.ts` | 3 | User settings |
| `activity.ts` | 1 | Activity feed |
| `home.ts` | 1 | Landing feed |
| `reports.ts` | 3 | Content reports |
| `storage.ts` | 1 | File upload URLs |
| `translate.ts` | 2 | UGC translation |
| `http.ts` | 2 | Webhook endpoints |

Plus: `schema.ts` (27 tables), `auth.config.ts`, `devSeed.ts` (empty — gutted during refactor), `lib/auth.ts` (4 auth helpers).

---

## Mobile Deployment (Capacitor)

### Configuration

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.pawtreon.app',
  appName: 'Pawtreon',
  webDir: 'dist'
};
```

| Setting | Value |
|---------|-------|
| App ID | `com.pawtreon.app` |
| App Name | `Pawtreon` |
| Web Directory | `dist` (Vite build output) |

### Build Flow

```
pnpm build                    # Build web app → dist/
npx cap sync                  # Sync web assets + plugins to native projects
npx cap open ios              # Open in Xcode
npx cap open android          # Open in Android Studio
```

### Platform Projects

| Platform | Location | Build Tool |
|----------|----------|------------|
| iOS | `ios/` | Xcode |
| Android | `android/` | Android Studio (Gradle) |

### Capacitor Plugins

| Plugin | Version | Purpose |
|--------|---------|---------|
| `@capacitor/core` | ^8.0.0 | Core runtime |
| `@capacitor/cli` | ^8.0.0 | Build tooling |
| `@capacitor/ios` | ^8.0.0 | iOS platform |
| `@capacitor/android` | ^8.0.0 | Android platform |

**Note:** No additional native plugins installed yet (camera, geolocation, push notifications are future additions per `mobile-native-spec.md`).

---

## Dependency Inventory

### Runtime Dependencies (31 packages)

| Category | Packages |
|----------|----------|
| **React** | `react` ^19.2.3, `react-dom` ^19.2.3, `react-router-dom` ^7.12.0 |
| **Backend** | `convex` ^1.31.6 |
| **Auth** | `@clerk/clerk-react` ^5.59.3 |
| **Payments** | `stripe` ^17.7.0 |
| **Mobile** | `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android` (all ^8.0.0) |
| **UI primitives** | 12× `@radix-ui/react-*` packages, `vaul` ^1.1.2, `lucide-react` ^0.562.0 |
| **Styling** | `class-variance-authority` ^0.7.1, `clsx` ^2.1.1, `tailwind-merge` ^3.4.0, `tw-animate-css` ^1.3.0 |
| **i18n** | `i18next` ^25.7.4, `react-i18next` ^16.5.2, `i18next-browser-languagedetector` ^8.2.0, `i18next-http-backend` ^3.0.2 |
| **Utilities** | `date-fns` ^4.1.0, `framer-motion` ^12.26.2, `zod` ^4.3.5, `svix` ^1.34.0, `react-joyride` ^2.9.3 |
| **Font** | `@fontsource/nunito` ^5.2.7 |

### Dev Dependencies (10 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^7.3.1 | Build tool |
| `@vitejs/plugin-react-swc` | ^4.2.2 | React SWC compiler |
| `tailwindcss` | ^4.1.18 | CSS framework |
| `@tailwindcss/vite` | ^4.1.18 | Vite plugin for Tailwind |
| `typescript` | ^5.9.3 | Type system |
| `typescript-eslint` | ^8.52.0 | TS + ESLint integration |
| `eslint` | ^9.39.2 | Linter |
| `@eslint/js` | ^9.39.2 | ESLint JS config |
| `eslint-plugin-react-hooks` | ^7.0.1 | React hook rules |
| `eslint-plugin-react-refresh` | ^0.4.26 | HMR compatibility |
| `globals` | ^17.0.0 | Global variable definitions |
| `@types/node` | ^25.0.6 | Node.js type defs |
| `@types/react` | ^19.2.8 | React type defs |
| `@types/react-dom` | ^19.2.3 | ReactDOM type defs |

### Package Manager

- **Primary:** `pnpm` (lockfile: `pnpm-lock.yaml`)
- **Also present:** `bun.lockb` (legacy — should be removed)
- **Package name:** `"pawtreon"` (was renamed from `"vite_react_shadcn_ts"`)

---

## CI/CD Pipeline (Implemented)

### Current State

CI (GitHub Actions) is implemented in `.github/workflows/ci.yml`:
- Runs on `pull_request` and `push` to `main`
- Gates include: lint, typecheck, Convex typecheck, tests, build, docs check

Deployments (CD) are still largely manual / provider-managed:
- Frontend: Vercel deploys from Git pushes (preview + production per Vercel settings)
- Backend: `npx convex deploy` is run manually for production changes
- Mobile: manual build via Xcode / Android Studio

### CI Pipeline

```
Git Push / PR
  │
  ├── pnpm install
  ├── pnpm lint              (ESLint + style gate)
  ├── pnpm typecheck         (tsc --noEmit)
  ├── pnpm convex:typecheck  (Convex type check)
  ├── pnpm test              (Vitest)
  ├── pnpm build             (Vite production build)
  ├── pnpm docs:check         (docs header + link checks)
  │
  ├── [PR] → Vercel preview deployment
  ├── [main] → Vercel production deployment
  └── [main] → npx convex deploy (production)
```

### CI Gates

| Gate | Tool | Blocks Merge |
|------|------|-------------|
| Lint | ESLint + style gate | Yes |
| Type check (app) | `tsc --noEmit` | Yes |
| Type check (Convex) | `convex typecheck` | Yes |
| Unit tests | Vitest | Yes |
| Build | `vite build` | Yes |
| Docs check | `pnpm docs:check` | Yes |
| E2E tests | Playwright (future) | No (advisory) |

### Workflow Source of Truth

See `.github/workflows/ci.yml` (kept in sync with `package.json` scripts).

---

## Environments

### Current

| Environment | Frontend | Backend | Status |
|-------------|----------|---------|--------|
| Development | `localhost:8080` | Convex dev deployment | Active |
| Production | Vercel (auto-deploy) | Convex production | Active |

### Recommended (Future)

| Environment | Purpose | Frontend | Backend |
|-------------|---------|----------|---------|
| Development | Local dev | `localhost:8080` | Convex dev |
| Staging | Pre-production testing | Vercel preview | Convex staging deployment |
| Production | Live users | Vercel production | Convex production |

**Staging deployment:** Convex supports multiple project deployments. Create a separate Convex project for staging with its own env vars (test Stripe keys, test Clerk app).

---

## Domain & DNS

| Domain | Status | Purpose |
|--------|--------|---------|
| `pawtreon.com` | TBD | Production domain |
| Clerk domain | `up-cheetah-92.clerk.accounts.dev` | Auth provider |
| Convex URL | `https://xxx.convex.cloud` | Backend API |

---

## Monitoring & Alerting (Future)

### Current State

No monitoring infrastructure. Observability relies on:
- Vercel deployment logs
- Convex dashboard (function logs, errors, usage)
- Clerk dashboard (auth events)
- Stripe dashboard (payment events)

### Recommended Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Error tracking | Sentry | Frontend + Convex error capture |
| Uptime | Vercel / BetterUptime | Service availability |
| Analytics | PostHog | Product analytics (see `analytics-spec.md`) |
| Performance | Vercel Analytics | Web Vitals, TTFB, LCP |
| Logs | Convex dashboard | Function execution logs |

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| `strict: false` in `tsconfig.app.json` | High | Tech debt — plan progressive enablement |
| `bun.lockb` co-exists with `pnpm-lock.yaml` | Low | Remove `bun.lockb` |
| `devSeed.ts` is empty (gutted during refactor) | Medium | Rebuild seed data for dev environment |
| No CI/CD pipeline | High | Implement GitHub Actions |
| No staging environment | Medium | Create separate Convex staging project |
| No error tracking | High | Add Sentry |
| Manual Convex deploys | Medium | Automate via CI |

---

## Open Questions

1. **Custom domain:** When will `pawtreon.com` be configured on Vercel?
2. **Staging Convex project:** Should we create a separate Convex project for staging, or use Convex branch deployments?
3. **Mobile CI:** Should iOS/Android builds be automated via Fastlane or similar?
4. **Lockfile cleanup:** Should `bun.lockb` be deleted now, or after confirming no Bun usage remains?
5. **TypeScript strict roadmap:** Target date for enabling `strict: true` in `tsconfig.app.json`?
