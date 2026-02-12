# Authentication & Security Spec

> **Owner:** Backend engineering  
> **Status:** final  
> **Last updated:** 2026-02-08

## Purpose

Defines Pawtreon's authentication flow, authorization model, security controls, and compliance requirements. Consolidates security rules from `RULES.md` into an actionable technical spec. Covers Clerk integration, Convex authorization patterns, PII protection, webhook security, rate limiting, and GDPR considerations for the EU launch market.

---

## Authentication Provider: Clerk

### Configuration

Pawtreon uses [Clerk](https://clerk.com) as its authentication provider, configured in `convex/auth.config.ts`:

```ts
export default {
  providers: [{
    domain: "https://up-cheetah-92.clerk.accounts.dev",
    applicationID: "convex",
  }],
};
```

### Supported Auth Methods
- Email + password
- Google OAuth
- Apple OAuth
- Facebook OAuth

### Auth Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │────▶│  Clerk   │────▶│  Convex  │────▶│  users   │
│  (React)  │     │  (Auth)  │     │  (JWT)   │     │  table   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  1. Sign up    │                │                │
     │──────────────▶│                │                │
     │                │  2. Create     │                │
     │                │  identity      │                │
     │                │───────────────▶│                │
     │                │  3. Webhook    │                │
     │                │  user.created  │                │
     │                │───────────────▶│  4. upsert     │
     │                │                │───────────────▶│
     │  5. JWT token  │                │                │
     │◀──────────────│                │                │
     │                │                │                │
     │  6. API call   │                │                │
     │  with JWT      │                │                │
     │───────────────────────────────▶│  7. Validate   │
     │                │                │  JWT + lookup  │
     │                │                │  by clerkId    │
```

### User Sync

User records are created/updated via Clerk webhooks:

1. Clerk fires `user.created` or `user.updated` event
2. `POST /clerk-webhook` receives the event
3. Svix signature is verified
4. `internal.users.upsert` creates or updates the `users` table record
5. User is mapped by `clerkId` (Clerk's `subject` field)

**User deletion:** Clerk `user.deleted` events are currently **logged only** — no user deletion or anonymization is implemented. This is a GDPR gap (see Compliance section).

### Session Management

- Clerk handles session tokens, refresh, and expiry
- Convex receives the JWT on every request and validates it
- No custom session storage on the backend
- Token refresh is handled by `@clerk/clerk-react` SDK automatically

---

## Authorization Model

### Auth Helper Functions (`convex/lib/auth.ts`)

| Function | Purpose | Throws |
|----------|---------|--------|
| `requireUser(ctx)` | Require auth + return user doc from `users` table lookup by `clerkId` | `"Not authenticated"` or `"User not found in database"` |
| `requireAdmin(ctx)` | Require auth + `role: "admin"` | `"Admin access required"` |
| `optionalUser(ctx)` | Return user if authenticated, `null` if guest | Never throws |
| `assertOwnership(user, resourceUserId, resourceName)` | Verify user ID owns the resource | `"You don't have permission to access this {resourceName}"` |

### Authorization Levels

| Level | Pattern | Where Used |
|-------|---------|------------|
| **Public** | No auth check | Read-only queries: `cases.list`, `clinics.list`, `campaigns.list`, `partners.list`, `volunteers.list`, `activity.*`, `cases.listByUser` |
| **Guest-aware** | `optionalUser(ctx)` | Queries that return enriched data for authenticated users: `home.getLandingFeed`, `community.listThreads`, `cases.getUiForLocale`, `users.getPublicProfile` |
| **Authenticated** | `requireUser(ctx)` | All mutations (except `reports.create`), user-specific queries: `users.me`, `donations.getMyDonations`, `notifications.*` |
| **Owner** | `requireUser(ctx)` + `assertOwnership()` | Resource mutations: `notifications.markAsRead/remove`, `paymentMethods.remove/setDefault`, `community.deleteComment` |
| **Permission** | `requireUser(ctx)` + role/relationship check | `cases.addUpdate` (owner, linked clinic, or admin), `cases.updateLifecycleStage` (same) |
| **Admin** | `requireAdmin(ctx)` | `clinics.listPendingClaims/reviewClaim`, `reports.listPending/setReviewing/resolve`, `community.lockThread` |
| **Internal** | `internalMutation` / `internalQuery` / `internalAction` | Webhook handlers, translation pipeline. Not client-callable |

### Authorization Rules (Non-Negotiable)

1. **Every mutation requires auth** — No anonymous write paths except `reports.create` (limited: uses `clerkId` from identity as fallback identifier)
2. **Every mutation that accepts an `id` enforces ownership** — Either via `assertOwnership()` or explicit role check
3. **Admin functions use `internalMutation`** or check `requireAdmin()` — Never callable by regular users
4. **Internal functions are server-only** — Used by webhooks and scheduled actions, not exposed in client API

---

## Ownership Checks

### Where Ownership Is Enforced

| Domain | Function | Check |
|--------|----------|-------|
| Notifications | `markAsRead`, `remove` | `assertOwnership(user, notification.userId)` |
| Payment Methods | `remove`, `setDefault` | `assertOwnership(user, method.userId)` |
| Cases | `addUpdate`, `updateLifecycleStage` | User is case owner, linked clinic owner, or admin |
| Community | `deleteComment` | User is comment author or admin |
| Donations | `confirmPreviewDonation` | User matches donation `userId` |

### Missing Ownership Checks (Known Gaps)

- **Case deletion** — No delete mutation exists (cases can only be closed via lifecycle transition)
- **Community post deletion** — Posts can only be soft-deleted by admin (no owner delete path)
- **Profile updates** — `updateProfile` and `updateCapabilities` operate on `requireUser()` return (implicitly self-only)

---

## Rate Limiting

### Current Implementation

Rate limits are enforced in-function using sliding window patterns:

| Endpoint | Limit | Window | Implementation |
|----------|-------|--------|----------------|
| `community.createThread` | 3 threads | 15 minutes | Count recent posts by user, reject if over limit |
| `community.createComment` | 15 comments | 5 minutes | Count recent comments by user, reject if over limit |
| `community.reportContent` | 6 reports | 10 minutes | Count recent reports by user, reject if over limit |
| `translate.requestCaseTranslations` | 20/day (configurable via `TRANSLATION_RATE_LIMIT` env var) | 24 hours | `translationRateLimits` table tracks daily counts per `clerkId` |

### Rate Limits Needed (Not Yet Implemented)

| Endpoint | Recommended Limit | Reason |
|----------|-------------------|--------|
| `cases.create` | 5/hour | Prevent spam case creation |
| `donations.createCheckoutSession` | 10/hour | Prevent checkout abuse |
| `storage.generateUploadUrl` | 20/hour | Prevent storage abuse |
| `social.addComment` | 30/hour | Prevent comment spam on cases |
| `reports.create` | 5/hour | Already partially limited by anonymous path |

---

## PII Protection

### Rules (from RULES.md)

1. **No PII in public queries** — Never return `email` or `phone` in public API responses
2. **Volunteer availability is opt-in** — Default status is `"offline"`, never expose location without consent
3. **Location safety** — Show city/neighborhood only, no precise coordinates in public-facing queries
4. **No "home address" patterns** — Blur exact locations, report doxxing

### Current Implementation

| Table | PII Fields | Protection |
|-------|-----------|------------|
| `users` | `email`, `phone` | Never included in `getPublicProfile` or `getProfileStats` responses |
| `volunteers` | User email | `volunteers.list` and `volunteers.get` explicitly exclude email from enriched user data |
| `clinicClaims` | `claimerEmail`, `claimerPhone` | Only visible in admin `listPendingClaims` query |
| `cases` | `location.coordinates` | Optional field — not exposed in basic list queries |
| `communityReports` | Reporter identity | Only visible in admin moderation queries |

### Gaps

- **Case coordinates:** When present, `coordinates` are included in `cases.get` response (public). Should be stripped or precision-limited for non-owner viewers.
- **Clerk avatar URLs:** User avatar URLs from Clerk may contain identifiable information in the URL path. Low risk but worth noting.

---

## Webhook Security

### Stripe Webhook (`POST /stripe-webhook`)

```ts
// Verification flow:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const event = stripe.webhooks.constructEvent(
  payload,                                    // Raw request body
  request.headers.get("stripe-signature"),    // Stripe signature header
  process.env.STRIPE_WEBHOOK_SECRET           // Shared secret
);
```

- **Failure mode:** Returns 400 on invalid signature, 500 on missing config
- **Events handled:** `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
- **All downstream mutations are `internalMutation`** — not callable from client

### Clerk Webhook (`POST /clerk-webhook`)

```ts
// Verification flow:
const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
const evt = wh.verify(payload, {
  "svix-id": svixId,
  "svix-timestamp": svixTimestamp,
  "svix-signature": svixSignature,
});
```

- **Failure mode:** Returns 400 on invalid/missing headers, 500 on missing config
- **Events handled:** `user.created`, `user.updated`, `user.deleted`
- **All downstream mutations are `internalMutation`** — not callable from client

### Required Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `STRIPE_SECRET_KEY` | Stripe webhook, checkout session creation | Stripe API authentication |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook | Signature verification |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook | Svix signature verification |
| `VITE_CLERK_PUBLISHABLE_KEY` | Client-side Clerk SDK | Client auth initialization |
| `VITE_CONVEX_URL` | Client-side Convex | Backend connection |
| `DEEPL_AUTH_KEY` | Translation action | DeepL API authentication |
| `TRANSLATION_RATE_LIMIT` | Translation rate limiter | Daily quota override (default: 20) |

---

## Audit Trail

### `auditLogs` Table

All high-risk operations are logged to the `auditLogs` table with:
- `actorId` — User who performed the action
- `entityType` + `entityId` — What was affected
- `action` — What happened
- `details` — Human-readable description
- `metadataJson` — Structured metadata (JSON string)
- `createdAt` — Timestamp

### Logged Operations

| Domain | Actions Logged |
|--------|---------------|
| **Cases** | `lifecycle_transition` (stage changes), `case_update_added` (new updates) |
| **Reports** | `report_resolved` (moderation actions with resolution details) |
| **Clinic Claims** | `clinic_claim_reviewed` (approve/reject with reason) |
| **Community** | `thread_locked` / `thread_unlocked`, `comment_deleted` |
| **Donations** | Completion logging via webhook (tracked in donation status, not separate audit log) |

### Not Yet Logged (Should Be)

- User role changes (e.g., promoting to admin)
- User verification level changes
- Case risk level changes
- Payment method changes
- Settings changes (for compliance)

---

## GDPR Compliance (EU Launch — Bulgaria)

### Requirements for EU Launch

| Requirement | Status | Details |
|-------------|--------|---------|
| **Consent for data collection** | Not implemented | Need cookie/tracking consent banner. Currently no analytics tracking exists |
| **Right to access** | Not implemented | Need data export endpoint — user can request all their data |
| **Right to erasure** | Not implemented | Need user deletion flow — Clerk fires `user.deleted` but no action taken |
| **Data minimization** | Partially implemented | PII fields are optional, public queries exclude PII |
| **Purpose limitation** | Implemented | Data is collected only for platform functionality |
| **Data portability** | Not implemented | Need structured data export (JSON/CSV) |
| **Breach notification** | Not implemented | No breach detection or notification system |

### Required Implementation

1. **User deletion flow:**
   - Clerk `user.deleted` webhook → soft-delete user record
   - Anonymize donations (keep amounts, remove `userId` link)
   - Delete or anonymize comments, posts, reports
   - Remove saved cases, follows, messages
   - Keep audit logs (legal retention)

2. **Data export endpoint:**
   - Admin or self-service endpoint
   - Export: profile, donations, cases, comments, settings
   - Format: JSON

3. **Consent management:**
   - Cookie consent banner (when analytics are added)
   - Marketing email opt-in (already in `userSettings`)
   - Push notification opt-in (already in `userSettings`)

---

## Security Checklist (Before Shipping)

From `RULES.md` — required for any feature touching money, auth, or PII:

- [ ] Ownership checks on all mutations
- [ ] No PII in public query responses
- [ ] Rate limiting configured on abuse-prone endpoints
- [ ] Admin endpoints are internal-only or requireAdmin-gated
- [ ] Audit logging for sensitive operations
- [ ] Emergency escalation paths exist
- [ ] Webhook signatures verified
- [ ] No identity-less mutation paths

---

## Open Questions

1. **User deletion implementation** — Timeline for GDPR-compliant `user.deleted` handling? Critical for Bulgaria EU launch.
2. **Coordinates precision** — Should case `location.coordinates` be precision-limited (e.g., rounded to 3 decimal places ≈ 111m) in public queries?
3. **Session revocation** — If a user is banned/suspended, how quickly are their active sessions invalidated? Clerk handles this but needs testing.
4. **API abuse detection** — Beyond rate limiting, should we implement IP-based throttling or anomaly detection?
5. **Strict mode TypeScript** — App-level TypeScript has `strict: false`. Enabling strict mode would catch potential null-safety issues in auth flows.
