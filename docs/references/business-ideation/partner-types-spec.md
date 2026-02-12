# Partner Types & Operations Spec

> **Owner:** Partnerships + Trust & Safety Ops
> **Status:** draft
> **Last updated:** 2026-02-12

> **Non-SSOT:** This document is ideation/reference context and does not override root canonical docs.

---

## Purpose

Partners are the supply side of Pawtreon — clinics, shelters, stores, and sponsors that make rescue operations possible. This spec defines partner categories, onboarding flows, verification operations, partnership tiers, and the outreach pipeline. It consolidates three existing operational docs (`outreach-pipeline.md`, `claim-verification-ops.md`, `bulgaria-clinic-seeding-plan.md`) into a single spec and extends them with structured data model and API requirements.

**Key principle:** Partners must be real, verified entities. Fake partners undermine the trust model that makes donations flow. Every partner type has a verification path and ongoing quality bar.

---

## User Stories

- As a **vet clinic owner**, I want to claim my clinic profile on Pawtreon so I can verify cases treated at my facility and attract rescuers.
- As an **NGO/shelter director**, I want to register my organization so I can create cases, run campaigns, and receive donations.
- As a **pet store owner**, I want to sponsor rescue operations through supply donations and get visibility for my business.
- As a **brand marketing manager**, I want to sponsor campaigns for CSR visibility and measurable animal welfare impact.
- As an **admin**, I want to review partner applications and claims efficiently with clear approval criteria and audit trails.
- As a **partnerships team member**, I want a structured outreach pipeline with weekly cadence so I can systematically grow the partner network.
- As a **data ops team**, I want to seed the clinic directory with verified data for Bulgaria launch cities.

---

## Functional Requirements

### Partner Categories

| Category | Schema Type | Primary Value | Revenue Relationship |
|---|---|---|---|
| **Veterinary Clinics** | `"veterinary"` | Case verification, medical evidence, emergency care | Subscription tier (Pro/Business) |
| **NGOs / Shelters** | `"ngo"` *(new — not in current schema)* | Case creation, adoption, ongoing rescue operations | Subscription tier + donation volume |
| **Pet Stores** | `"pet-shop"` | Supply sponsorship, drop-off points, community engagement | Sponsorship packages |
| **Sponsors / Brands** | `"sponsor"` | Campaign funding, matching, CSR visibility | Sponsorship + corporate programs |
| **Food Brands** | `"food-brand"` | Supply donations, co-branding, supply chain | Sponsorship packages |

> **Gap:** Current schema has 4 types (`pet-shop`, `food-brand`, `veterinary`, `sponsor`). NGOs/Shelters are missing as a partner type — they currently create cases as individual users. Adding `"ngo"` as a fifth type is recommended. See Open Questions.

### Onboarding Flow — Per Type

#### Veterinary Clinics

```
1. Clinic exists in seeded directory (or admin-created)
   ↓
2. Clinic representative submits claim
   ↓
3. Claim enters review queue (see Claim Verification below)
   ↓
4. Approved → ownerId set, dashboard access granted
   ↓
5. Clinic can now: verify cases, update profile, view analytics (if subscribed)
```

**Requirements:**
- Clinic must exist in directory before claiming (prevents phantom clinic creation).
- Claimant must provide proof of affiliation (business registration, professional ID).
- One owner per clinic (multi-staff support in Business/Enterprise tier).
- See [clinics-spec.md](../../product-specs/features/clinics-spec.md) for full claim flow details.

#### NGOs / Shelters

```
1. Shelter admin registers on Pawtreon (standard user signup)
   ↓
2. Submits organization registration form
   ↓
3. Admin reviews: legal entity check, website verification, mission alignment
   ↓
4. Approved → partner record created, shelter dashboard access
   ↓
5. Shelter can now: create unlimited cases (if subscribed), run campaigns, manage volunteers
```

**Requirements:**
- Legal entity verification: business registration number, official website, or government listing.
- Mission alignment check: must be animal welfare focused (no pet breeding, no exotic animal trade).
- Probation period: first 30 days, cases subject to enhanced moderation review.

#### Pet Stores

```
1. Outreach team identifies prospect (or store self-registers)
   ↓
2. Introductory call → partnership agreement
   ↓
3. Store profile created in partner directory
   ↓
4. Store can: sponsor local rescues, host donation drop-off, feature in directory
```

**Requirements:**
- Physical location verified (Google Maps / on-site visit for launch cities).
- Signed partnership agreement defining contribution terms.
- No puppy mill sourcing policy (verified or self-declared with audit right).

#### Sponsors / Brands

```
1. Sponsor applies or is recruited via outreach
   ↓
2. Partnership team negotiates package (case, campaign, monthly, annual)
   ↓
3. Contract signed, payment processed
   ↓
4. Sponsorship activated: logo placement, social mentions, impact reporting
```

**Requirements:**
- Brand vetting: no tobacco, gambling, weapons, or animal testing companies.
- Sponsorship cannot influence case content or editorial decisions.
- See [monetization-spec.md](monetization-spec.md) for pricing packages.

---

### Partnership Tiers & Benefits

Partnership tiers align with subscription tiers from [monetization-spec.md](monetization-spec.md):

| Benefit | Free | Pro (€49/mo) | Business (€99/mo) | Enterprise (€199/mo) |
|---|---|---|---|---|
| Directory listing | ✅ | ✅ | ✅ (featured) | ✅ (featured) |
| Active cases | 3 | Unlimited | Unlimited | Unlimited |
| Analytics dashboard | Basic | Full | Full | Custom |
| Verified badge fast-track | ❌ | ✅ (48h SLA) | ✅ (24h SLA) | ✅ (12h SLA) |
| Campaign creation | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ | ✅ |
| Dedicated account manager | ❌ | ❌ | ❌ | ✅ |
| Transaction fee | 5% | 4% | 3% | 2% |
| Multi-user access | 1 | 1 | 5 | Unlimited |
| Custom branding | ❌ | ❌ | ❌ | ✅ |

---

### Outreach Pipeline

Consolidated from `docs/references/partner-ideation/outreach-pipeline.md`.

**Pipeline stages:**

```
Prospect → Contacted → Intro Call → Pilot → Claimed/Verified → Active Partner
```

| Stage | Definition | Exit Criteria |
|---|---|---|
| **Prospect** | Identified via research, referral, or directory scrape | Contact info obtained |
| **Contacted** | Initial outreach sent (email/call) | Response received |
| **Intro Call** | Scheduled introductory meeting | Call completed, interest confirmed |
| **Pilot** | Trial partnership (limited scope) | Positive feedback, no red flags |
| **Claimed** | Profile claimed, awaiting verification | Claim submitted with proof |
| **Active** | Fully verified and operational | Verified badge, active engagement |

**Target segments (priority order):**
1. Vet clinics — highest priority (case verification backbone)
2. NGOs / rescue organizations — case volume drivers
3. Pet stores and supply partners — community touchpoints
4. Shelters and foster networks — adoption pipeline

**Standard outreach pack:**
- 1-page value proposition (tailored per segment)
- Claim profile instructions (step-by-step with screenshots)
- Verification and trust FAQ
- Launch-city playbook and expected response SLA

**Messaging framework:**
- **Clinics:** "Faster funded intake + visibility + trust badges."
- **NGOs:** "Transparent case funding + update timeline + donor reach."
- **Stores:** "Sponsorship and supply-impact visibility + community goodwill."
- **Sponsors:** "Measurable CSR impact + brand visibility + dedicated reporting."

**Weekly cadence:**
- Mon: New prospect upload + pipeline review
- Tue–Thu: Outreach calls/emails (target 10 contacts/week)
- Fri: Conversion review + blocker resolution

**Metrics:**
| Metric | Target |
|---|---|
| Contact-to-call conversion | 30% |
| Call-to-pilot conversion | 50% |
| Claim completion rate | 80% |
| Active partner retention (monthly) | 95% |

---

### Claim Verification Operations

Consolidated from `docs/references/partner-ideation/claim-verification-ops.md`.

**Claim lifecycle:**
```
pending ──→ approved  (verification passed)
   │
   └──→ rejected  (insufficient proof or fraud)
           │
           └──→ appeal  (one chance, 7-day window)
                  │
                  ├──→ approved
                  └──→ final_rejected
```

**SLA targets:**

| Priority | First Response | Resolution |
|---|---|---|
| Standard | 24h | 72h |
| Fast-track (Pro+ tier) | 12h | 48h |
| Critical (emergency clinic) | 4h | 24h |

**Approval criteria:**
- Claimant has verifiable relationship to organization.
- Contact details match public or direct-confirmed records.
- No conflicting active owner claim.
- Organization exists in public registries or can be independently confirmed.

**Rejection criteria:**
- Insufficient proof of affiliation.
- Fraud indicators or contradictory ownership claims.
- Non-responsive claimant after follow-up window (48h).

**Audit logging (per decision):**
- Reviewer user ID
- Timestamp
- Action (`approved` / `rejected` / `escalated`)
- Reason code (enumerated list)
- Free-text notes

**Appeals:**
- One appeal window per rejected claim (7 calendar days).
- Appellant must provide new/additional evidence.
- Escalate unresolved disputes to human decider (product team).

---

### Directory Seeding Strategy (Bulgaria Launch)

Consolidated from `docs/references/partner-ideation/bulgaria-clinic-seeding-plan.md` and DECISIONS.md #8.

**Decision (2026-02-06):** Seed verified clinic directory first for Sofia, Varna, Plovdiv. Keep claim/verification flow active. Onboard stores and shelters progressively.

**Launch cities:**

| City | Priority | Est. Clinics | Est. Shelters/NGOs |
|---|---|---|---|
| Sofia | P0 | 50+ | 10+ |
| Varna | P1 | 20+ | 5+ |
| Plovdiv | P1 | 20+ | 5+ |

**Data schema per seeded record:**
- Name, city, address, phone
- 24/7 flag, specializations
- Verification source (registry, outreach, community)
- Seeded-by timestamp
- `verified` = true only after source validation

**Data sourcing strategy:**
1. Publicly listed veterinary registries and official directories.
2. Direct outreach verification by phone/email.
3. Community correction channel with moderation review.

**Seeding workflow:**
```
1. Prepare normalized import spreadsheet
   ↓
2. Run import script into `clinics` table
   ↓
3. Mark `verified=true` only after source validation
   ↓
4. Open claim flow for ownership transfer
   ↓
5. Monitor community corrections (reported errors → 72h SLA)
```

**Quality controls:**
- Duplicate detection: normalized name + city + phone.
- Manual QA spot checks per city (10% sample).
- SLA for reported data errors: 72h resolution.

**Exit criteria:**
- High-confidence coverage for Sofia, Varna, Plovdiv.
- City + 24/7 filtering functional in app.
- Claim submissions operational with review queue active.

---

## Non-Functional Requirements

- **Verification SLA adherence:** 95% of claims resolved within SLA. Monitor via admin dashboard.
- **Data accuracy:** Seeded clinics 95%+ accuracy on name/address/phone. Community-reported errors resolved within 72h.
- **Audit trail completeness:** Every claim decision, partner status change, and tier change logged with reviewer, timestamp, reason.
- **Partner privacy:** Partner contact emails visible only to admin. Public-facing profiles show business info only.
- **Scalability:** Pipeline and verification ops designed for the Bulgaria launch (< 200 partners). Will need automation tooling (auto-verify via business registries) when scaling to EU.

---

## Data Model

### Additions to `partners` table

| Field | Type | Purpose |
|---|---|---|
| `ownerId` | `v.optional(v.id("users"))` | Claiming owner user reference |
| `contactEmail` | `v.optional(v.string())` | Business contact (admin-only visible) |
| `contactPhone` | `v.optional(v.string())` | Business phone |
| `tier` | `v.optional(v.string())` | Subscription tier (free/pro/business/enterprise) |
| `subscriptionStatus` | `v.optional(v.string())` | Billing status shortcut |
| `onboardingStage` | `v.optional(v.string())` | Pipeline stage (prospect → active) |
| `verificationStatus` | `v.optional(v.string())` | Verification state |
| `claimedAt` | `v.optional(v.number())` | Claim approval timestamp |
| `location` | `v.optional(v.object({ city: v.string(), country: v.string() }))` | Structured location |

**Schema change needed:** Add `"ngo"` to the `type` union. Current types: `pet-shop`, `food-brand`, `veterinary`, `sponsor`. Proposed: add `"ngo"` for shelters/rescue organizations.

**New indexes needed:** `by_owner`, `by_onboarding_stage`, `by_verification_status`

### New: `partnerClaims` table

| Field | Type | Purpose |
|---|---|---|
| `partnerId` | `v.id("partners")` | Partner being claimed |
| `claimantId` | `v.id("users")` | User submitting claim |
| `status` | `v.union("pending", "approved", "rejected", "appealed", "final_rejected")` | Claim lifecycle |
| `proofDocuments` | `v.array(v.string())` | Storage IDs for uploaded proof |
| `reviewerId` | `v.optional(v.id("users"))` | Admin who reviewed |
| `reviewedAt` | `v.optional(v.number())` | Review timestamp |
| `reasonCode` | `v.optional(v.string())` | Enumerated reason for decision |
| `notes` | `v.optional(v.string())` | Reviewer notes |
| `appealDeadline` | `v.optional(v.number())` | Deadline for appeal submission |
| `createdAt` | `v.number()` | |

**Indexes:** `by_partner`, `by_claimant`, `by_status`, `by_created`

> **Note:** The `clinics` table already has a claim flow (see [clinics-spec.md](../../product-specs/features/clinics-spec.md)). The `partnerClaims` table extends this pattern to all partner types, not just clinics.

---

## API Surface

### Partner Onboarding

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `partners.register` | mutation | Authenticated | Submit new partner registration |
| `partners.submitClaim` | mutation | Authenticated | Claim an existing partner profile |
| `partners.updateProfile` | mutation | Partner owner | Update partner details |

### Claim Review (Admin)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `partners.listClaims` | query | Admin | List pending claims with filters |
| `partners.reviewClaim` | mutation | Admin | Approve or reject a claim |
| `partners.escalateClaim` | mutation | Admin | Escalate to senior reviewer |

### Pipeline Management (Admin)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `partners.updateOnboardingStage` | mutation | Admin | Move partner through pipeline stages |
| `partners.listByStage` | query | Admin | Filter partners by pipeline stage |
| `partners.getPipelineMetrics` | query | Admin | Conversion rates, stage durations |

### Directory (Public)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `partners.list` | query | Public | List partners with type/featured/location filters |
| `partners.get` | query | Public | Get single partner details |
| `partners.getStats` | query | Public | Aggregate partner statistics |

---

## UI Surfaces

### Partner Registration Wizard (`/partners/register`)
- Step 1: Select partner type (clinic, NGO, store, sponsor).
- Step 2: Organization details (name, address, contact, website).
- Step 3: Verification documents upload.
- Step 4: Review and submit.
- Confirmation screen with expected review timeline.

### Partner Dashboard (`/partners/dashboard`)
- Overview: cases, donations received, analytics (if subscribed).
- Profile management: edit business info, logo, description.
- Subscription tier + upgrade CTA.
- Claim status (if pending).

### Admin: Claim Review Queue (`/admin/partner-claims`)
- Filterable list: status, type, date, priority.
- Claim detail view: claimant info, proof documents, partner profile side-by-side.
- Approve / Reject / Escalate actions with required reason selection.
- SLA countdown indicator per claim.

### Admin: Partner Pipeline (`/admin/partner-pipeline`)
- Kanban or table view of partners by onboarding stage.
- Drag to advance stage (or explicit action buttons).
- Weekly metrics: conversion rates, time-in-stage, blockers.

### Partners Directory Page (`/partners`)
- Existing page — currently has hardcoded mock data for pet sitters (`Partners.tsx`). Needs migration to real Convex data.
- Filter by type, location, featured status.
- Partner cards with logo, type badge, contribution summary.

---

## Edge Cases & Abuse

| Scenario | Handling |
|---|---|
| **Duplicate claims** | Only one active claim per partner. New claim auto-rejected if active claim exists. After rejection + appeal exhaustion, new claim allowed after 30 days. |
| **Fake clinic/NGO registration** | Verification documents checked manually. Probation period with enhanced moderation. Community reporting mechanism. |
| **Partner churns mid-subscription** | Cases remain visible but read-only. Donation flows to cases continue (funds held in platform account). Profile marked as inactive. |
| **Partner changes type** | Not self-service. Admin-only operation with re-verification required. |
| **Hostile claim (someone claims competitor's clinic)** | Approval requires document proof matching public records. Appeals escalate to human decider. |
| **Seeded data incorrect** | Community correction channel. 72h SLA on reported errors. Data ops spot checks. |
| **Mock data in production** | Hardcoded pet sitter data in `Partners.tsx` must be removed before production launch. Replace with real Convex queries. |

---

## Open Questions

1. **Should NGOs/Shelters be a new partner type (`"ngo"`) or remain non-partner users?** Current schema has 4 types. Adding `"ngo"` unifies the organization model but changes how shelters create cases. Recommendation: add `"ngo"` — all organizational entities should be in the partners system.
2. **Multi-owner support:** Business/Enterprise tiers promise multi-user access (5/unlimited). How is team membership modeled? Separate `partnerMembers` table or role field on users?
3. **Clinic vs. partner claim flow:** Clinics currently have their own claim flow in the `clinics` table (see clinics-spec.md). Should this be migrated to the unified `partnerClaims` table, or kept separate? Recommendation: unified, with `entityType` field to distinguish.
4. **Store verification:** Physical location verification for stores in Bulgaria — is Google Maps listing sufficient, or do we require on-site photos?
5. **Brand vetting automation:** At scale (EU expansion), manual brand vetting won't scale. When should we implement automated checks (domain verification, business registry APIs)?
6. **Partner removal:** What's the process for deactivating a bad partner? Impact on their active cases and donation flows?




