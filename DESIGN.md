# Pawtreon — Design

> **Purpose:** Architecture, stack, data model, patterns, and technical decisions.  
> **Last updated:** 2026-01-23

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Convex (realtime DB + serverless functions) |
| Auth | Clerk |
| Mobile | Capacitor (iOS + Android) |
| UI | shadcn/ui + Tailwind CSS |
| i18n | i18next |
| Payments | Stripe (planned) |

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
*Status: Not started*

TODO when implementing:
- Data: payment intents, webhook handling
- API: `createPaymentIntent`, `handleWebhook`
- Security: verify webhook signatures, idempotent processing
- Rollout: test mode first, gradual rollout

### Feature: Moderation Queue
*Status: Not started*

TODO when implementing:
- Data: report status flow, admin actions
- API: `listPendingReports`, `resolveReport`
- Security: admin-only access, audit log
