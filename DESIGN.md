# Pawtreon — Design

> **Purpose:** Architecture, stack, data model, patterns, and technical decisions.  
> **Last updated:** 2026-02-10

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript |
| Backend | Convex (realtime DB + serverless functions) |
| Auth | Clerk |
| Mobile | Capacitor (iOS + Android) |
| UI | shadcn/ui + Tailwind CSS v4 |
| i18n | i18next |
| Payments | Stripe (hosted checkout + webhook implemented; receipt UX polish pending) |

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Mobile (Capacitor)  │  Web (Vite SPA)          │
└──────────────────────┴──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              React + React Router               │
│         (components, pages, hooks)              │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                   Convex                        │
│    (queries, mutations, actions, storage)       │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                    Clerk                        │
│              (auth, identity)                   │
└─────────────────────────────────────────────────┘
```

## Data Model (Core Objects)

### Case
Fundraising + rescue record.
```ts
{
  _id: Id<"cases">
  creatorId: Id<"users">
  title: string
  story: string
  species: "dog" | "cat" | "bird" | "other"
  urgency: "critical" | "high" | "medium" | "low"
  goal: number
  raised: number
  status: "active" | "funded" | "closed"
  verificationStatus: "unverified" | "community" | "clinic"
  location: { city: string, country: string }
  images: Id<"_storage">[]
  createdAt: number
}
```

### Update
Timestamped progress on a case.
```ts
{
  _id: Id<"updates">
  caseId: Id<"cases">
  authorId: Id<"users">
  content: string
  images: Id<"_storage">[]
  isClinicVerified: boolean
  createdAt: number
}
```

### Donation
Payment + receipt.
```ts
{
  _id: Id<"donations">
  caseId: Id<"cases">
  donorId: Id<"users">
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  stripePaymentId?: string
  isAnonymous: boolean
  createdAt: number
}
```

### Profile (User)
User identity + badges.
```ts
{
  _id: Id<"users">
  clerkId: string
  name: string
  avatar?: string
  roles: ("finder" | "rescuer" | "donor" | "clinic" | "shelter" | "admin")[]
  impactStats: { donated: number, casesHelped: number }
  createdAt: number
}
```

### Organization
Clinics, shelters, partners.
```ts
{
  _id: Id<"organizations">
  name: string
  type: "clinic" | "shelter" | "store" | "sponsor"
  isVerified: boolean
  members: Id<"users">[]
  location: { city: string, country: string }
}
```

### Report
Scam/abuse flags.
```ts
{
  _id: Id<"reports">
  targetType: "case" | "user" | "post"
  targetId: string
  reporterId: Id<"users">
  reason: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  createdAt: number
}
```

## API Conventions

### Naming
- Queries: `get*`, `list*` (e.g., `getCase`, `listCases`)
- Mutations: `create*`, `update*`, `delete*` (e.g., `createCase`)
- Internal: `_internal*` prefix (admin/system only)

### Security Rules
1. **All mutations require auth** — no anonymous writes
2. **No PII in public queries** — never return email/phone in public shapes
3. **Admin endpoints use internalMutation** — not callable from client
4. **Ownership checks** — mutations validate user owns the resource
5. **Rate limiting** — on abuse-prone endpoints (reports, uploads, AI)

## Folder Structure

```
src/
├── components/       # Shared UI components
│   ├── ui/          # shadcn/ui primitives (don't edit)
│   └── ...          # App-specific components
├── pages/           # Route pages
├── hooks/           # Custom React hooks
├── lib/             # Utilities, helpers
├── types/           # TypeScript types
└── i18n/            # Translation setup

convex/
├── schema.ts        # Data model definitions
├── cases.ts         # Case queries/mutations
├── donations.ts     # Donation queries/mutations
├── users.ts         # User queries/mutations
├── reports.ts       # Report queries/mutations
├── lib/             # Shared server utilities
│   └── auth.ts      # Auth helpers
└── _generated/      # Convex generated files
```

## Styling System

Canonical UI patterns spec:
- `docs/design/ui-patterns-spec.md` (case-first IA, interaction density rules, token/theming gates)
- `docs/design/theming-tokens-spec.md` (design tokens, color palette, forbidden patterns)

SSOT styling files and boundaries:
- `src/index.css` is the single Tailwind v4 + token entrypoint (no `globals.css`).
- `src/components/ui/*` are shadcn primitives and stay app-agnostic.
- SSOT layout primitives live in `src/components/layout/`:
  - `PageShell`
  - `PageSection`
  - `SectionHeader`
  - `StickySegmentRail`
- Trust CTA wrapper lives in `src/components/trust/StickyActionBar.tsx`.
- Shared metric wrapper lives in `src/components/common/StatsGrid.tsx`.

### Principles
1. **Token-only colors** — use semantic tokens, not hardcoded hex
2. **Trust-first look** — calm surfaces, clear hierarchy
3. **Mobile-first** — design for phone, scale up
4. **One primary CTA** — per surface

### Token Classes
- Surfaces: `bg-background`, `bg-card`, `bg-muted`
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border-border`
- Focus: `ring-ring`
- Status: `bg-destructive`, `bg-urgent`, `bg-recovering`, `bg-adopted`

### Layout Defaults
- Page padding: `px-4`
- Section gaps: `space-y-4` (dense), `space-y-6` (standard)
- Card padding: `p-3` (compact), `p-4` (standard)
- Prefer SSOT wrappers over repeated page-level utility composition:
  - `PageShell` for app-level spacing and nav clearance
  - `PageSection` for content width and section rhythm
  - `SectionHeader` for title/count/action consistency
  - `StickySegmentRail` for desktop sticky filters/segments

### Typography
- Font: `Nunito`
- Page title: `text-lg font-semibold`
- Card title: `text-[15px] font-semibold leading-snug`
- Body: `text-sm text-muted-foreground leading-relaxed`
- **Inputs must be `text-base`** on mobile (prevents iOS zoom)

### Cards (Feed)
- Show 2–3 cards per screen on mobile
- Media ratio: `aspect-video` (feed) or `aspect-[3/2]` (photo-forward)
- Avatars: `1:1`

## Native Path (Capacitor)

### Phase 1 (Current)
- Capacitor for iOS/Android distribution
- Native affordances: camera, share sheet, haptics

### Phase 2 (If needed)
- Evaluate React Native only if WebView hits limits
- Keep Convex + Clerk; reuse data layer

## SSR Share Pages (Planned)

For social sharing (OpenGraph), add a small SSR layer:
- Option A: Separate Next.js project for `/share/case/:id`
- Option B: Serverless OG image generation

**Do not rewrite the whole app to Next.js.** Vite SPA + Capacitor is the right path for the core product.

---

## Feature Sections

Add sections here when implementing high-risk features (money/auth/schema):

### Feature: Donations (Stripe)
*Status: In progress*

Implemented:
- Data model fields for Stripe checkout/payment intent linkage and receipts
- API/flow for hosted checkout session + webhook completion path
- Idempotent completion and webhook signature verification path

Remaining:
- Post-checkout success/cancel return UX messaging on case detail (no lost state after redirect)
- Receipt/history surfacing polish in account-facing flows (donations list/history is real data, not mock)
- Populate `receiptUrl` from Stripe charge metadata (when available) for user-facing receipts

### Feature: Notifications (In-app)
*Status: In progress*

Scope:
- Replace mock notification center UI with Convex-driven data and real-time unread counts.
- Add minimal notification triggers for core trust loops (donation received, case update, clinic claim reviewed).

Data changes:
- None (schema already contains `notifications` and `userSettings`).

API surface:
- Add internal notification creator mutations (not client-callable).
- Wire donation completion and case update operations to create notifications.

Abuse/trust risks addressed:
- Remove mock/fake notification content from account surfaces.
- Ensure notification content contains no third-party PII.

Mitigations:
- Keep notification payloads generic (no donor email/phone).
- Defer batching/throttling to a follow-up once baseline delivery is correct.

### Feature: Moderation Queue
*Status: In progress*

Implemented:
- Data/report status flow with moderation actions and audit trail
- Admin moderation surface at `/admin/moderation`

Remaining:
- Ops throughput/SLA dashboard refinements and queue ergonomics

### Feature: Launch Trust Hardening (Rate Limits + i18n)
*Status: In progress*

Scope:
- Add rate limiting for abuse-prone reporting endpoints (per RULES.md and admin-moderation EARS M-07).
- Remove/disable client-side IP geolocation language detection banner for production (rely on i18next detection).
- Ensure donation gating is consistent across UI, Convex case contract, and donations checkout creation.

Data changes:
- Add a lightweight report rate limit table (per-user-per-day) for case reports.

API surface:
- Report creation rejects when daily quota is exceeded.
- No new public PII is introduced.

### Feature: Trust UI System Alignment (Tailwind v4 + shadcn)
*Status: In progress*

Scope:
- Home (`/`) + Community (`/community*`) + Campaigns (`/campaigns*`) visual system alignment
- Tailwind v4 token enforcement expansion (`styles:gate` now scans app surfaces in `src/`, excluding `src/components/ui/*`)
- shadcn boundary cleanup for `components/ui/*` primitives and adapters

Data changes:
- None (UI-only changes; no Convex schema or persistence contract changes)

API surface:
- No backend API changes
- UI primitive behavior change: `Button` `size="iconTouch"` minimum touch target is `44x44`

Abuse/trust risks addressed:
- Remove fake social proof from trust-critical fundraising surfaces
- Remove dead UI actions in trust flows (search clear behavior)
- Reduce visual noise (gradients/heavy shadows) on rescue-critical surfaces to lower ambiguity

Mitigations:
- Semantic token-only styling in scoped trust surfaces
- Accessibility baseline on raw interactive controls (`focus-visible` ring, touch target size)
- Expanded style gates for home/community/campaign surfaces to prevent regression

### Feature: SSOT Design System + Partners Services Integration
*Status: In progress*

Scope:
- Introduce shared layout primitives for trust-critical pages.
- Migrate key trust routes (`/`, `/case/:id`, `/create-case`, `/campaigns`, `/clinics`) to SSOT wrappers.
- Refactor `/partners` into data-driven segments:
  - `partners`
  - `volunteers`
  - `stores_services`
- Keep stores/services inside `/partners` and maintain referral-only model (no native checkout/cart in this phase).

Data changes:
- None (schema unchanged).

API surface:
- Added `petServices.list` and `petServices.get` public queries for partners-integrated services surfaces.

Abuse/trust risks addressed:
- Remove mock/fake store-sitter content from `/partners`.
- Remove dead/ambiguous UI actions in trust-adjacent directory surfaces.

Mitigations:
- Data-driven counts and empty states.
- Token-first UI wrappers to reduce styling drift and inconsistent trust affordances.

### Feature: Convex API Pruning + Security Hardening
*Status: In progress*

Scope:
- Remove unreferenced Convex query/mutation/internal handlers from public API surface.
- Keep schema tables unchanged unless they have zero operational references.
- Preserve all active product routes, including deck/preview routes.

Data changes:
- None (no schema/table removals in this pass).

API surface:
- Convex generated client API shrinks due removal of dead handlers.
- Dev seed and legacy social helper handlers are removed from callable surface.
- No new endpoints added.

Abuse/trust risks addressed:
- Reduce accidental exposure of legacy or dead mutation paths.
- Reduce operator misuse risk from stale dev-seed handlers.
- Lower maintenance risk from unused trust-critical code paths.

Mitigations:
- Regenerate Convex API types after pruning.
- Run Convex strict typecheck and deployment-safe typecheck gate.
- Keep webhook/internal security patterns unchanged for active money/auth flows.
