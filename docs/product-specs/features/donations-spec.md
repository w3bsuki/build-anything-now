# Donations & Payments Spec

> **Owner:** OPUS (implementation), Codex (risk review — money flow)
> **Status:** draft
> **Last updated:** 2026-02-12
> **PRD Ref:** DONATION MODAL, DONATIONS, RECURRING

---

## Purpose

Donations are the revenue engine of Pawtreon. Every dollar raised for an animal flows through this system. The donations spec covers the **end-to-end money flow**: from a donor clicking "Donate" on a case or campaign, through Stripe hosted checkout, webhook confirmation, receipt generation, and donation history. The system must be trustworthy (receipts, transparency, no fake amounts), secure (Stripe-hosted, webhook-verified, idempotent), and compliant with RULES.md money rules.

---

## User Stories

- As a **donor**, I want to donate to a case with a few clicks and get a receipt so I trust my money is tracked.
- As a **donor**, I want to see my donation history with amounts, cases, and statuses so I can track my impact.
- As a **case owner**, I want to see incoming donations and updated fundraising progress so I know how close I am to the goal.
- As a **campaign donor**, I want to donate to a campaign and see my contribution reflected in the campaign's progress.
- As an **anonymous donor**, I want my identity hidden from the case owner and public while still getting a receipt.
- As a **moderator**, I want donation gating on unverified/high-risk cases so scams don't receive funds.

---

## Functional Requirements

### Payment Provider

**Stripe hosted checkout** — no custom card forms. Users are redirected to Stripe's hosted checkout page, which handles PCI compliance, card input, 3D Secure, and payment processing.

### Donation Types

| Type | Status | Description |
|---|---|---|
| **One-time to case** | Implemented | Single donation to a specific rescue case |
| **One-time to campaign** | Implemented (schema) | Single donation to a campaign via `campaignRefId` |
| **Recurring/monthly** | Implemented | Recurring support for rescuers/clinics via Stripe Subscriptions and webhook-driven ledger entries |

### Checkout Flow

```
1. User clicks "Donate" on case/campaign
   ↓
2. DonationFlowDrawer opens
   ↓
3. User selects amount + optional message + anonymous toggle
   ↓
4. Client calls `donations.createCheckoutSession` mutation
   ↓
5. Mutation creates pending donation record + Stripe checkout session
   ↓
6. Client redirects to Stripe hosted checkout URL
   ↓
7. User completes payment on Stripe
   ↓
8. Stripe sends webhook to /stripe-webhook
   ↓
9. Webhook handler calls internal mutations to confirm/fail
   ↓
10. Donation status updated, case fundraising incremented, receipt generated
   ↓
11. User returns to successUrl (`/case/:id?donation=success`) → sees a confirmation banner and can jump to history
```

### `createCheckoutSession` Mutation (Production Path)

**Input args:**
- `caseId?: Id<"cases">` — case to donate to
- `campaignRefId?: Id<"campaigns">` — campaign to donate to
- `amount: number` — donation amount (must be > 0)
- `currency: string` — currency code (e.g., "EUR")
- `message?: string` — optional donor message
- `anonymous: boolean` — hide donor identity
- `successUrl: string` — redirect URL after successful payment
- `cancelUrl: string` — redirect URL if user cancels

**What it does:**
1. Validates auth (requires authenticated user)
2. Validates amount > 0
3. Validates success/cancel URLs start with "http"
4. If `caseId` provided: fetches case, runs `assertCaseDonationAllowed` check
5. Generates idempotency key: `{userId}:{amount}:{caseId}:{campaignId}:{timeBucket}`
6. Inserts `donations` record with `status: "pending"`, `paymentProvider: "stripe"`
7. If `STRIPE_SECRET_KEY` configured:
   - Creates Stripe checkout session with `mode: "payment"`, line items, metadata
   - Patches donation with `stripeCheckoutSessionId`
   - Returns `{ mode: "stripe", donationId, checkoutUrl }`
8. If no Stripe key (dev mode):
   - Returns `{ mode: "preview", donationId, checkoutUrl: null }`
9. Writes audit log entry

### Preview Mode

When `STRIPE_SECRET_KEY` is not configured (local development):
- Donation is created as pending
- `confirmPreviewDonation` mutation allows manual confirmation
- Blocked when Stripe is configured (prevents bypass in production)
- Useful for testing donation flows without real payments

---

## Webhook Handling

### Stripe Webhook Endpoint (`/stripe-webhook`)

Route in `convex/http.ts`. Verifies Stripe signature using `STRIPE_WEBHOOK_SECRET`.

**Handled events:**

| Event | Handler | What It Does |
|---|---|---|
| `payment_intent.succeeded` | `confirmPaymentFromWebhook` | Finds donation by `stripePaymentIntentId`, marks completed, updates case fundraising, generates receipt |
| `payment_intent.payment_failed` | `markPaymentFailedFromWebhook` | Finds donation, marks failed, audit logs |
| `checkout.session.completed` | `confirmCheckoutSessionFromWebhook` | Finds donation by `stripeCheckoutSessionId`, marks completed, updates case fundraising, generates receipt |

### Confirmation Logic (`confirmPaymentFromWebhook` / `confirmCheckoutSessionFromWebhook`)

1. Find donation by Stripe ID (payment intent or checkout session)
2. If not found → return `{ ok: false, reason: "donation_not_found" }`
3. If already completed → return `{ ok: true, reason: "already_completed" }` (idempotent)
4. Patch donation:
   - `status` → `"completed"`
   - `amount` → from Stripe `amount_received / 100` (authoritative)
   - `currency` → from Stripe (uppercase)
   - `stripeChargeId`, `stripePaymentIntentId` (backfill)
   - `completedAt` → now
   - `receiptId` → generate `PT-XXXXXXXX` if not exists
5. If donation has `caseId`:
   - Fetch case, increment `fundraising.current` += amount
   - Auto-set `status: "funded"` if `current >= goal`
6. Write audit log

### Failure Handling (`markPaymentFailedFromWebhook`)

1. Find donation by `stripePaymentIntentId`
2. Skip if already completed (don't overwrite success)
3. Patch: `status: "failed"`, `failedAt: now`
4. Write audit log

---

## Donation Gating

### `assertCaseDonationAllowed` Rules

Donations are blocked when:

| Condition | Result | Rationale |
|---|---|---|
| `status === "closed"` | **BLOCK** | Case is resolved |
| `lifecycleStage` is any `closed_*` | **BLOCK** | Case is resolved |
| `verificationStatus === "unverified"` AND `riskLevel === "high"` | **BLOCK** | Unverified + high-risk = review needed |

All other combinations → **ALLOW** (including unverified + low/medium risk with soft warning in UI).

From RULES.md:
- **No dead CTAs** — Donate button always opens a real flow (when allowed)
- **Donation gating** — Unverified + high-risk → blocked/warned until reviewed
- **No fake amounts** — Never show inflated/fake donation counts

---

## Idempotency

### Prevention of Double Charges

**Key generation:** `makeIdempotencyKey(userId, amount, caseId, campaignId)` creates a deterministic key:
```
{userId}:{amount}:{caseId|"none"}:{campaignId|"none"}:{timeBucket}
```

Where `timeBucket = Math.floor(Date.now() / 10000)` (~10 second windows).

**Stripe-level:** The idempotency key is passed to `stripe.checkout.sessions.create()` — Stripe will return the same session for duplicate requests within the window.

**Webhook-level:** `confirmPaymentFromWebhook` and `confirmCheckoutSessionFromWebhook` check if donation is already `"completed"` before processing — ensures webhooks are idempotent (Stripe may retry).

**Schema index:** `by_idempotency_key` on `donations` table for efficient lookup.

---

## Receipt System

### Receipt ID Generation

Format: `PT-XXXXXXXX` where `XXXXXXXX` is 8 random alphanumeric characters (uppercase).

Generated by `makeReceiptId()` function. Assigned during webhook confirmation (`confirmPaymentFromWebhook` / `confirmCheckoutSessionFromWebhook`).

### Receipt Fields

| Field | Source | Purpose |
|---|---|---|
| `receiptId` | Generated (`PT-XXXXXXXX`) | Pawtreon receipt reference |
| `receiptUrl` | Stripe | Link to Stripe-hosted receipt |

### Display

- Shown to donor in donation history
- Shown in donation success confirmation
- Accessible from profile donation tab

From RULES.md: **Receipts required** — every donation generates a receipt.

---

## Donation History

### Donor View (`getMyDonations` query)

Returns all donations for the authenticated user, ordered by most recent:
- Donation fields: amount, currency, status, message, anonymous, timestamps
- Enriched with: case name, case first image URL
- Used on profile "Donations" section

### Donor Stats (`getMyStats` query)

Aggregated metrics for authenticated user:
- `totalDonations` — count of completed donations
- `totalAmount` — sum of completed donation amounts
- `animalsHelped` — count of unique cases donated to

### Case Owner View

Case owners see:
- `fundraising.current` / `fundraising.goal` on their case
- Progress bar showing donation progress
- Individual donations are not itemized to case owner (privacy) — they see aggregated total

---

## Revenue Model

### 5% Platform Fee

From master plan: Pawtreon takes a 5% platform fee on transactions.

**Current implementation status:** NOT implemented in code. The `confirmPaymentFromWebhook` mutations add the full donation amount to `fundraising.current`.

**Required implementation:**
1. Calculate fee: `platformFee = amount * 0.05`
2. Net amount to case: `netAmount = amount * 0.95`
3. Options:
   - Deduct at webhook confirmation (reduce `fundraising.current` increment)
   - Track separately (store `platformFee` on donation record)
   - Handle via Stripe Connect (future — separate payment splits)
4. Display: show donors the full amount, show case owners net received amount

**Recommendation:** Defer Stripe Connect integration. For MVP, add `platformFeeAmount` field to donation record, compute at confirmation time, but credit full amount to case `fundraising.current`. Track fee revenue separately for accounting.

---

## Anonymous Donations

### How It Works

- `anonymous: boolean` field on donation record
- When `true`:
  - Donor identity hidden from case owner
  - Donor identity hidden in public donation feeds (future)
  - Donor still sees their own donation in history
  - Receipt still generated for donor

### Privacy Rules

- Anonymous donations are counted in `fundraising.current` (amount is never hidden)
- `anonymous` flag checked in any donor-facing display
- Admin can see all donations regardless of anonymous flag (for audit/fraud review)

---

## Currency Handling

- **Primary currency:** EUR
- **Schema allows:** Any string in `currency` field
- **Stripe converts:** Amount sent to Stripe as `unit_amount = Math.round(amount * 100)` in the donation's currency
- **Multi-currency future:** When expanding beyond EUR, need currency conversion display and consistent accounting
- **Display:** Currency symbol resolved on frontend based on code

---

## Data Model

### `donations` Table (schema L78-L103)

| Field | Type | Required | Purpose |
|---|---|---|---|
| `userId` | `Id<"users">` | Yes | Donor reference |
| `caseId` | `Id<"cases">?` | No | Case donated to |
| `campaignId` | `string?` | No | Legacy campaign string ID |
| `campaignRefId` | `Id<"campaigns">?` | No | Campaign reference (canonical) |
| `donationKind` | `"one_time" \| "recurring"?` | No | Discriminator for one-time vs recurring charges |
| `subscriptionId` | `Id<"subscriptions">?` | No | Link to subscription (recurring charges) |
| `amount` | `number` | Yes | Donation amount |
| `currency` | `string` | Yes | Currency code (e.g., "EUR") |
| `status` | enum(4) | Yes | `pending \| completed \| failed \| refunded` |
| `paymentMethod` | `string?` | No | Legacy payment method |
| `paymentProvider` | `"stripe" \| "manual"` | No | Provider type |
| `stripeCheckoutSessionId` | `string?` | No | Stripe session ID |
| `stripePaymentIntentId` | `string?` | No | Stripe payment intent ID |
| `stripeSubscriptionId` | `string?` | No | Stripe subscription ID (recurring) |
| `stripeInvoiceId` | `string?` | No | Stripe invoice ID (recurring) |
| `stripeChargeId` | `string?` | No | Stripe charge ID |
| `idempotencyKey` | `string?` | No | Dedup key |
| `receiptId` | `string?` | No | Pawtreon receipt ID (`PT-XXXXXXXX`) |
| `receiptUrl` | `string?` | No | Stripe receipt URL |
| `transactionId` | `string?` | No | External transaction reference |
| `message` | `string?` | No | Donor message |
| `anonymous` | `boolean` | Yes | Hide donor identity |
| `completedAt` | `number?` | No | Completion timestamp |
| `failedAt` | `number?` | No | Failure timestamp |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:** `by_user`, `by_case`, `by_campaign_ref`, `by_subscription`, `by_stripe_checkout_session`, `by_stripe_payment_intent`, `by_stripe_invoice`, `by_idempotency_key`, `by_status`, `by_kind`

### `subscriptions` Table (schema)

Subscriptions represent recurring support relationships. Webhooks keep subscription state in sync and materialize recurring charges into `donations` rows.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `userId` | `Id<"users">` | Yes | Subscriber (payer) |
| `targetType` | `"case" \| "user"` | Yes | What is being supported |
| `targetId` | `string` | Yes | Target document ID |
| `stripeSubscriptionId` | `string?` | No | Stripe subscription ID |
| `stripeCheckoutSessionId` | `string?` | No | Stripe checkout session ID |
| `status` | enum(5) | Yes | `pending \| active \| past_due \| canceled \| unpaid` |
| `amount` | `number` | Yes | Amount per interval |
| `currency` | `string` | Yes | Currency code |
| `interval` | `"month" \| "year"` | Yes | Billing interval |
| `createdAt` | `number` | Yes | Creation timestamp |
| `updatedAt` | `number?` | No | Last sync timestamp |
| `canceledAt` | `number?` | No | Cancel timestamp |

**Indexes:** `by_user`, `by_user_status`, `by_target`, `by_checkout_session`, `by_stripe_subscription`

### `paymentMethods` Table (schema L140-L151)

**Status: UI-backed placeholder (not Stripe-integrated).** The app can list/remove/set-default payment methods, but creating and using saved methods is not wired to Stripe yet. Fields: userId, type (card/paypal/bank), name, lastFour, expiry, isDefault.

**Recommendation:** Prefer Stripe Customer Portal or Stripe-sourced payment method listing. Do not build custom payment method storage for real cards (PCI) outside Stripe.

---

## API Surface

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `donations.getMyDonations` | query | required | Donor's donation history with case enrichment |
| `donations.getMyStats` | query | required | Aggregated donor stats |
| `donations.create` | mutation | required | Legacy preview donation (backward compat) |
| `donations.createCheckoutSession` | mutation | required | Production Stripe checkout creation |
| `donations.confirmPaymentFromWebhook` | internalMutation | internal | Webhook: payment intent succeeded |
| `donations.confirmCheckoutSessionFromWebhook` | internalMutation | internal | Webhook: checkout session completed |
| `donations.markPaymentFailedFromWebhook` | internalMutation | internal | Webhook: payment failed |
| `donations.confirmPreviewDonation` | mutation | required | Dev-only preview confirmation |
| `subscriptions.list` | query | required | List current user's subscriptions with target enrichment |
| `subscriptions.create` | mutation | required | Create Stripe subscription checkout (or preview subscription) |
| `subscriptions.cancel` | mutation | required | Cancel a subscription (ownership-checked) |
| `subscriptions.confirmCheckoutSessionFromWebhook` | internalMutation | internal | Webhook: checkout session completed (subscription mode) |
| `subscriptions.syncStatusFromWebhook` | internalMutation | internal | Webhook: subscription status update/delete |
| `subscriptions.ensureRecurringDonationFromInvoice` | internalMutation | internal | Webhook: invoice paid materializes recurring donation row |
| `paymentMethods.getMyPaymentMethods` | query | optional | List current user's saved payment methods |
| `paymentMethods.remove` | mutation | required | Remove saved payment method (ownership-checked) |
| `paymentMethods.setDefault` | mutation | required | Set saved payment method as default |

### HTTP Endpoints

| Route | Method | Purpose |
|---|---|---|
| `/stripe-webhook` | POST | Stripe event handler (signature-verified) for one-time + recurring events |
| `/clerk-webhook` | POST | Clerk user sync (signature-verified) |

---

## UI Surfaces

| Page/Component | Route/Location | Purpose |
|---|---|---|
| `DonationFlowDrawer` | drawer on case detail | Amount selection → checkout initiation |
| `AnimalProfile.tsx` | `/case/:id` | Donate CTA, progress bar |
| `CampaignProfile.tsx` | `/campaign/:id` | Campaign donate CTA |
| `Account.tsx` | `/account` | Donation stats summary |
| `PublicProfile.tsx` | `/profile/:id` | Donation impact stats |
| Post-checkout return | successUrl | Confirmation state with receipt |

---

## Edge Cases & Abuse

1. **Double charge prevention** — Idempotency key + Stripe session dedup + webhook idempotent handlers
2. **Webhook replay** — `confirmPaymentFromWebhook` returns early if donation already completed
3. **Missing webhook** — If webhook never fires, donation stays `"pending"` indefinitely. Consider: cleanup job for stale pending donations (>24h)
4. **Amount mismatch** — Webhook updates amount from Stripe's `amount_received` (authoritative), overriding client-submitted amount
5. **Donation to closed case** — Blocked by `assertCaseDonationAllowed` in `createCheckoutSession`
6. **Donation to high-risk unverified case** — Blocked by `assertCaseDonationAllowed`
7. **Zero/negative amount** — Blocked by `amount > 0` validation in `createCheckoutSession`
8. **Invalid URLs** — Success/cancel URLs must start with "http"
9. **Stripe key missing in production** — Returns preview mode; production deployment must verify Stripe keys are configured
10. **Orphaned Stripe sessions** — If user closes browser before completing Stripe checkout, session expires (Stripe default: 24h). Donation record stays pending.
11. **Invoice replay (recurring)** — `invoice.paid` webhook must be idempotent (no duplicate recurring donations for same invoice/subscription)
12. **Subscription status drift** — `customer.subscription.updated/deleted` webhooks keep local subscription status in sync

---

## Non-Functional Requirements

### Security
- Stripe webhook signature verification (HMAC via `STRIPE_WEBHOOK_SECRET`)
- Clerk webhook signature verification (Svix)
- No custom card forms — Stripe handles PCI compliance
- All mutations require auth (no anonymous donation creation)
- Internal mutations for webhook handlers (not client-callable)
- Audit logging for all money operations

### Performance
- Donation confirmation is async via webhook (no blocking wait)
- `getMyDonations` enriches with case data via sequential reads (acceptable for MVP; consider denormalization at scale)
- `getMyStats` scans all user donations (acceptable for MVP; consider aggregation table at scale)

### Accessibility
- DonationFlowDrawer must support keyboard navigation
- Amount selection must have accessible labels
- Success/failure states must be screen-reader friendly

---

## Acceptance Criteria

- [ ] `createCheckoutSession` validates auth, `amount > 0`, success/cancel URLs start with `"http"`, and runs `assertCaseDonationAllowed` when `caseId` is provided.
- [ ] Idempotency key is deterministic: `{userId}:{amount}:{caseId|"none"}:{campaignId|"none"}:{timeBucket}` and is passed to Stripe.
- [ ] Webhook handler verifies Stripe signature, finds donation by `stripePaymentIntentId`, updates status to `"completed"`, sets amount from Stripe’s `amount_received / 100`, increments case `fundraising.current`, and generates a `PT-XXXXXXXX` receipt ID.
- [ ] Webhook processing is idempotent: if donation is already `"completed"`, handler returns without modifying the record.
- [ ] `markPaymentFailedFromWebhook` sets `status: "failed"` but does not overwrite a `"completed"` status.
- [ ] Preview mode (`confirmPreviewDonation`) is available only when `STRIPE_SECRET_KEY` is not configured and is blocked in production.
- [ ] Anonymous donations hide donor identity from public views but donor still sees the donation in their own history.
- [ ] `getMyDonations` returns all donations for the authenticated user ordered by most recent, enriched with case name and image.
- [ ] `getMyStats` returns accurate aggregates: `totalDonations`, `totalAmount`, and `animalsHelped` (unique cases).
- [ ] `subscriptions.create` creates a pending subscription and returns a Stripe Checkout URL when Stripe is configured, or preview mode when it is not.
- [ ] `checkout.session.completed` in subscription mode confirms the local subscription and stores `stripeSubscriptionId` idempotently.
- [ ] `invoice.paid` creates exactly one `"recurring"` donation row per Stripe invoice and links it to the matching subscription.
- [ ] `subscriptions.cancel` is ownership-checked and results in a `"canceled"` local subscription status (and cancels in Stripe when not in preview mode).

## EARS Requirements (Safety-Critical)

> EARS = Easy Approach to Requirements Syntax. These requirements use When/While/If/Shall patterns for unambiguous, testable money-flow rules.

| ID | Type | Requirement |
|----|------|-------------|
| D-01 | Event | **When** a user clicks Donate, the system **shall** redirect to Stripe hosted checkout — never render a custom card form. |
| D-02 | Guard | **If** the case status is `closed` or any `closed_*` lifecycle stage, the system **shall** block the donation and display a "Case closed" message. |
| D-03 | Guard | **If** the case is `unverified` AND `riskLevel === "high"`, the system **shall** block the donation and display a risk warning. |
| D-04 | Event | **When** a Stripe webhook fires with `checkout.session.completed`, the system **shall** verify the Stripe signature before processing. |
| D-05 | Guard | **If** webhook signature verification fails, the system **shall** return HTTP 400 and **shall not** modify any donation record. |
| D-06 | Event | **When** a payment is confirmed via webhook, the system **shall** atomically update donation status to `completed`, increment `case.fundraising.current`, and generate a receipt — all within a single mutation. |
| D-07 | Guard | **If** a donation is already `completed`, the system **shall** skip duplicate webhook processing (idempotent). |
| D-08 | Guard | **If** `STRIPE_SECRET_KEY` is configured, the system **shall** reject calls to `confirmPreviewDonation` (no preview bypass in production). |
| D-09 | Ubiquitous | The system **shall** create an audit log entry for every donation state change (pending → completed, pending → failed, completed → refunded). |
| D-10 | Ubiquitous | The system **shall** require authentication for all donation mutations — no anonymous donation creation. |
| D-11 | Guard | **If** donation amount is ≤ 0, the system **shall** reject the mutation with a validation error. |
| D-12 | Event | **When** a payment fails via webhook, the system **shall** mark the donation as `failed` but **shall not** overwrite a `completed` status. |

---

## Open Questions

1. **5% platform fee implementation** — When and how to implement? Options: (a) Stripe Connect with application fees, (b) manual accounting with `platformFeeAmount` field, (c) defer until revenue is material. Recommendation: option (b) for MVP.

2. **Refund handling** — `status: "refunded"` exists in schema but no refund functions exist. Need: refund mutation (admin-only), Stripe refund API call, case `fundraising.current` decrement, audit logging.

3. **Recurring donations v1 follow-ups** — Subscription checkout + webhook ledger sync is shipped. Open: Stripe Customer Portal handoff for billing method updates, annual interval UI, and clearer cancellation/renewal UX.

4. **Campaign donation progress** — When a donation with `campaignRefId` completes, should `campaigns.current` be incremented (like case fundraising)? Currently not implemented. Need `campaigns.updateProgress` internal mutation.

5. **Donation message display** — Where are donor messages shown? Currently stored but not displayed on case detail. Decide: show in updates timeline, separate donor messages section, or keep private.

6. **Saved payment methods** — Decide whether `paymentMethods` remains an app-level placeholder (manual entries) or is replaced by Stripe-native payment method listing + Customer Portal for updates.

7. **Multi-case donations** — Can a donor donate to multiple cases at once? Currently no — each donation is to one case or one campaign. Decide if batch donations are needed.

8. **Minimum donation amount** — No minimum enforced beyond `amount > 0`. Stripe has minimums per currency (€0.50 for EUR). Should we enforce a platform minimum?

