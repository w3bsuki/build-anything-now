# Monetization & Revenue Model Spec

> **Owner:** Product + Business
> **Status:** draft
> **Last updated:** 2026-02-09

---

## Purpose

Pawtreon generates revenue through four streams designed to align platform growth with animal welfare outcomes. The model starts transaction-heavy (low friction, immediate revenue) and diversifies toward recurring B2B revenue as the partner network scales. All core features remain free — monetization layers on top of a healthy free tier to avoid gatekeeping rescue outcomes.

> **Note:** Financial projections in this spec are aspirational targets from early-stage modeling. They are directionally valid but will be revised as real transaction data becomes available. See `docs/investor/09-Financial-Projections.md` for the full 5-year model.

---

## User Stories

- As a **donor**, I want to know exactly what fees apply to my donation so I trust the platform.
- As a **shelter admin**, I want to understand free vs. paid features so I can decide if upgrading is worth it.
- As a **shelter admin on Pro tier**, I want analytics and priority support so I can run my rescue ops more effectively.
- As a **brand sponsor**, I want to attach my logo to rescue campaigns so I get CSR visibility with measurable impact.
- As a **corporate HR manager**, I want to set up employee matching through Pawtreon so my company's giving program is streamlined.
- As a **platform operator**, I want revenue to grow with usage so unit economics improve at scale.

---

## Functional Requirements

### Revenue Stream #1: Transaction Fee (5% on Donations)

**How it works:**
- Platform takes 5% of every donation processed through Stripe.
- Donor pays full amount. Fee is deducted before crediting the case/campaign.
- Example: Donor gives €100 → Case receives €95 → Pawtreon retains €5.
- Stripe's own processing fee (~2.9% + €0.25) is separate and paid by the platform from the 5%.

**Competitive benchmark:**

| Platform | Fee |
|---|---|
| GoFundMe | 2.9% + $0.30 |
| JustGiving | 5% |
| Facebook Fundraisers | 0% (poor tools) |
| **Pawtreon** | **5%** |

**Fee transparency:**
- Checkout UI shows fee breakdown before payment confirmation.
- Receipts include gross donation, platform fee, and net amount to case.
- Fee % may vary by subscription tier (see Stream #2).

**Implementation status:** NOT implemented. The `confirmPaymentFromWebhook` mutations currently credit the full donation amount to `fundraising.current`. See [donations-spec.md](../features/donations-spec.md) Open Questions for implementation options.

**Recommended approach (from donations-spec):**
1. Add `platformFeeAmount` field to donation record.
2. Compute at webhook confirmation time: `platformFeeAmount = amount * 0.05`.
3. Credit full amount to case `fundraising.current` (donors see their full contribution).
4. Track fee revenue separately for accounting/reporting.
5. Defer Stripe Connect until shelter payouts are needed.

**Revenue projection:**

| Year | Donation Volume | Fee Revenue (5%) |
|---|---|---|
| Y1 | €500K | €25K |
| Y2 | €2M | €100K |
| Y3 | €10M | €500K |
| Y4 | €25M | €1.25M |
| Y5 | €50M | €2.5M |

---

### Revenue Stream #2: Shelter/Clinic Subscriptions

**Tiered pricing:**

| Tier | Price | Target |
|---|---|---|
| **Free** | €0/mo | Individual rescuers, small orgs |
| **Pro** | €49/mo | Active shelters, clinics |
| **Business** | €99/mo | Multi-staff orgs, NGOs |
| **Enterprise** | €199/mo | Multi-location networks |

**Feature matrix:**

| Feature | Free | Pro | Business | Enterprise |
|---|---|---|---|---|
| Active cases | 3 | Unlimited | Unlimited | Unlimited |
| Campaign creation | ❌ | ❌ | ✅ | ✅ |
| Analytics dashboard | Basic | Full | Full | Custom |
| Donor CRM | ❌ | Basic | Full | Full |
| API access | ❌ | ❌ | ✅ | ✅ |
| Custom branding | ❌ | ❌ | ❌ | ✅ |
| Account manager | ❌ | ❌ | ❌ | ✅ |
| Transaction fee | 5% | 4% | 3% | 2% |
| Priority support | ❌ | ✅ | ✅ | ✅ (dedicated) |
| Verified badge fast-track | ❌ | ✅ | ✅ | ✅ |
| Featured placement | ❌ | ❌ | ✅ | ✅ |

**Free tier philosophy:**
- All core rescue functionality is free: create cases, receive donations, volunteer, browse directory.
- Free tier is not time-limited. Pawtreon never gates animal welfare outcomes behind a paywall.
- Paid tiers add **operational efficiency** (analytics, CRM, branding) and **reduced fees**, not rescue access.

**Revenue projection:**

| Year | Paid Orgs | Avg Revenue/Org | Subscription Revenue |
|---|---|---|---|
| Y1 | 10 | €60/mo | €7.2K |
| Y2 | 50 | €75/mo | €45K |
| Y3 | 200 | €80/mo | €192K |
| Y4 | 500 | €85/mo | €510K |
| Y5 | 1,000 | €90/mo | €1.08M |

---

### Revenue Stream #3: Sponsored Campaigns

**How it works:**
- Brands pay to sponsor rescue cases or campaigns.
- Sponsors get: logo placement on case/campaign page, social media mentions, impact report for CSR, press release opportunity.
- Sponsored content is always labeled `Sponsored by [Brand]` — never hidden.

**Pricing packages:**

| Package | Price | Includes |
|---|---|---|
| **Case Sponsor** | €500 | Sponsor 1 case, logo placement |
| **Campaign Sponsor** | €2,000 | Full campaign sponsorship, social mentions |
| **Monthly Partner** | €5,000/mo | Multiple cases, featured placement, impact reports |
| **Annual Partner** | €50,000/yr | Premium placement, exclusive campaigns, events |

**Target sponsors:** Pet food brands, pet insurance companies, vet clinic chains, pet retail (Fressnapf, Zooplus), CSR-focused corporates.

**Sponsorship surfaces (cross-ref [campaigns-spec.md](../features/campaigns-spec.md)):**
- Campaign page: sponsor logo + "Sponsored by" badge.
- Case cards in feed: subtle sponsor attribution.
- Impact reports: sponsor branding on downloadable PDFs.
- Social share cards: sponsor included in share image.

**Revenue projection:**

| Year | Sponsors | Avg Deal Size | Sponsorship Revenue |
|---|---|---|---|
| Y1 | 5 | €1K | €5K |
| Y2 | 20 | €2K | €40K |
| Y3 | 50 | €3K | €150K |
| Y4 | 100 | €5K | €500K |
| Y5 | 200 | €7.5K | €1.5M |

---

### Revenue Stream #4: Corporate Giving Programs

**How it works:**
- B2B product for companies wanting structured employee giving.
- Branded giving portal with company logo and curated cause selection.
- Employee matching: company matches employee donations (configurable ratio).
- Team challenges: departments compete on impact metrics.
- Impact reporting: quarterly CSR reports with tax documentation.

**Pricing:**

| Company Size | Setup Fee | Annual Fee |
|---|---|---|
| Small (< 100 employees) | €1,000 | €5,000/yr |
| Medium (100–1,000) | €2,500 | €15,000/yr |
| Large (1,000+) | €5,000 | €50,000/yr |

**Timeline:** Corporate giving launches Y2 — requires subscription infrastructure, admin tools, and dedicated account management. Not in MVP scope.

**Revenue projection:**

| Year | Corporate Clients | Avg Contract | Corporate Revenue |
|---|---|---|---|
| Y1 | 0 | — | €0 |
| Y2 | 2 | €10K | €20K |
| Y3 | 10 | €15K | €150K |
| Y4 | 25 | €20K | €500K |
| Y5 | 50 | €25K | €1.25M |

---

### Total Revenue Projection

| Year | Fees | Subscriptions | Sponsorships | Corporate | **Total** |
|---|---|---|---|---|---|
| Y1 | €25K | €7.2K | €5K | €0 | **€37.2K** |
| Y2 | €100K | €45K | €40K | €20K | **€205K** |
| Y3 | €500K | €192K | €150K | €150K | **€992K** |
| Y4 | €1.25M | €510K | €500K | €500K | **€2.76M** |
| Y5 | €2.5M | €1.08M | €1.5M | €1.25M | **€6.33M** |

**Revenue mix strategy:** Start transaction-heavy (67% Y1), diversify to recurring B2B (41% B2B by Y5).

---

## Non-Functional Requirements

- **PCI compliance:** No card data touches Pawtreon servers. All payment via Stripe hosted checkout.
- **Fee accuracy:** Platform fee calculation must be exact to the cent. No rounding errors that accumulate.
- **Transparency:** Donors see fee breakdown at checkout. Case owners see net received vs. gross donated.
- **Billing reliability:** Subscription billing failures must retry (Stripe's built-in dunning). Failed payments trigger grace period, not instant downgrade.
- **GDPR:** Financial data retention per EU law. Donor data anonymizable on request (donation records stay, PII stripped).
- **Auditability:** Every fee, subscription change, and sponsorship payment logged with timestamp, actor, and amount.

---

## Data Model

### Additions to `donations` table

| Field | Type | Purpose |
|---|---|---|
| `platformFeeAmount` | `v.optional(v.number())` | Computed 5% fee, stored at confirmation |
| `platformFeePercent` | `v.optional(v.number())` | Fee % applied (varies by tier: 2-5%) |
| `netAmount` | `v.optional(v.number())` | Amount after fee deduction |

### New: `subscriptions` table

| Field | Type | Purpose |
|---|---|---|
| `organizationId` | `v.id("partners")` | Partner org this subscription belongs to |
| `tier` | `v.union("free", "pro", "business", "enterprise")` | Subscription tier |
| `stripeCustomerId` | `v.string()` | Stripe Customer ID |
| `stripeSubscriptionId` | `v.optional(v.string())` | Stripe Subscription ID (null for free) |
| `status` | `v.union("active", "past_due", "cancelled", "trialing")` | Billing status |
| `currentPeriodEnd` | `v.number()` | Current billing period end timestamp |
| `cancelAtPeriodEnd` | `v.boolean()` | Pending cancellation flag |
| `createdAt` | `v.number()` | Creation timestamp |

**Indexes:** `by_organization`, `by_status`, `by_stripe_customer`

### Additions to `partners` table

| Field | Type | Purpose |
|---|---|---|
| `tier` | `v.optional(v.string())` | Current subscription tier |
| `subscriptionStatus` | `v.optional(v.string())` | Billing status shortcut |
| `stripeCustomerId` | `v.optional(v.string())` | Stripe Customer reference |

### New: `sponsorships` table

| Field | Type | Purpose |
|---|---|---|
| `partnerId` | `v.id("partners")` | Sponsor partner |
| `campaignId` | `v.optional(v.id("campaigns"))` | Linked campaign (if campaign-level) |
| `caseId` | `v.optional(v.id("cases"))` | Linked case (if case-level) |
| `package` | `v.union("case", "campaign", "monthly", "annual")` | Sponsorship package |
| `amount` | `v.number()` | Payment amount |
| `startDate` | `v.number()` | Sponsorship start |
| `endDate` | `v.optional(v.number())` | Sponsorship end (null for one-time) |
| `status` | `v.union("active", "expired", "cancelled")` | |
| `createdAt` | `v.number()` | |

**Indexes:** `by_partner`, `by_campaign`, `by_case`, `by_status`

### New: `corporatePrograms` table

| Field | Type | Purpose |
|---|---|---|
| `companyName` | `v.string()` | Company name |
| `contactEmail` | `v.string()` | Primary contact |
| `sizeCategory` | `v.union("small", "medium", "large")` | Pricing tier selector |
| `matchRatio` | `v.number()` | e.g. 1.0 = 100% match |
| `annualBudget` | `v.number()` | Annual giving budget |
| `status` | `v.union("setup", "active", "paused", "cancelled")` | |
| `stripeCustomerId` | `v.string()` | |
| `createdAt` | `v.number()` | |

**Indexes:** `by_status`, `by_company_name`

---

## API Surface

### Subscription Management

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `subscriptions.createCheckout` | action | Partner owner | Create Stripe checkout for subscription upgrade |
| `subscriptions.handleWebhook` | httpAction | Stripe webhook | Process subscription lifecycle events |
| `subscriptions.get` | query | Partner owner | Get current subscription details |
| `subscriptions.cancel` | mutation | Partner owner | Cancel at period end |
| `subscriptions.reactivate` | mutation | Partner owner | Undo pending cancellation |

### Sponsorship Management

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `sponsorships.create` | mutation | Admin | Create new sponsorship deal |
| `sponsorships.list` | query | Admin | List all sponsorships |
| `sponsorships.getForCampaign` | query | Public | Get active sponsor for campaign |
| `sponsorships.getForCase` | query | Public | Get active sponsor for case |

### Platform Fee

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `donations.applyPlatformFee` | internal mutation | System | Calculate and store fee at confirmation |
| `reports.feeRevenue` | query | Admin | Aggregate fee revenue reporting |

---

## UI Surfaces

### Pricing Page (`/pricing`)
- Tier comparison table (feature matrix above).
- CTA per tier: Free = "Get Started", Pro = "Upgrade", Business/Enterprise = "Contact Us".
- FAQ: "What happens if I downgrade?", "Is there a free trial?", "How is the transaction fee calculated?"

### Subscription Management (Partner Dashboard)
- Current tier badge + next billing date.
- Usage summary: cases, donations received, analytics access.
- Upgrade/downgrade flow via Stripe checkout.
- Cancel with confirmation modal.

### Sponsor Badge (Case/Campaign Pages)
- "Sponsored by [Brand]" badge with logo.
- Tap to view sponsor profile.
- Only visible when active sponsorship exists.

### Fee Transparency (Donation Checkout)
- Before payment: "€X.XX goes to [Case Name], €X.XX platform fee."
- Receipt: full breakdown with gross, fee, net.

---

## Edge Cases & Abuse

| Scenario | Handling |
|---|---|
| **Subscription payment fails** | Stripe dunning (3 retries over 2 weeks). After final failure → downgrade to Free. Cases beyond limit 3 become read-only, not deleted. |
| **Mid-cycle tier downgrade** | Active until period end. On renewal, apply lower tier. Cases above new limit frozen (not deleted). |
| **Sponsor tries to influence case content** | Sponsor logo placement only. No editorial control. Violation = sponsorship termination. Clear in sponsor agreement. |
| **Fake donations to inflate fee** | Self-donations blocked (donor === case owner check). Anomaly detection on repeated small donations. |
| **Fee dispute from donor** | Display fee at checkout + receipt. Refund policy: full refund within 14 days, platform fee also refunded. |
| **Free-tier gaming** | 3-case limit enforced server-side. Rotating cases (close and reopen) counted against total. |

---

## Open Questions

1. **Stripe Connect timing:** When do we implement actual money splits to shelter bank accounts? Currently all donations stay in the platform Stripe account. Shelters don't receive payouts — this needs resolution before scaling.
2. **Free trial for Pro tier:** Should there be a 14-day free trial? Risk: conversion optimization vs. trial abuse.
3. **Transaction fee transparency:** Do we show the fee before or after Stripe's processing fee? Recommendation: show only platform fee (5%); Stripe fees are cost-of-goods.
4. **Enterprise custom pricing:** At what scale does Enterprise need custom negotiation vs. fixed €199/mo?
5. **Fee % by tier — sustainable?** Reducing from 5% → 2% for Enterprise means high-volume orgs pay less per transaction. Validate that subscription revenue offsets the fee reduction.
6. **Corporate program MVP scope:** Is there enough B2B demand in Bulgaria launch to justify building corporate features in Y1? Current plan says no (Y2 launch).
