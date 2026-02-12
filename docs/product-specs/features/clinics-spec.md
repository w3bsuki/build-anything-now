# Clinic Directory & Partnerships Spec

> **Owner:** Product + Partnerships
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** CLINIC ONBOARDING

---

## Purpose

The clinic directory is Pawtreon's trust infrastructure for the rescue ecosystem. Clinics verify cases, provide medical evidence, and enable the verification ladder that makes donors confident. The directory serves three audiences: **rescuers** finding nearby emergency vets, **donors** checking if a case's clinic is legitimate, and **clinic owners** managing their profile and verifying cases. The directory includes search, filtering, a claim/verification flow for ownership, and a seeding strategy for the Bulgaria launch market.

---

## User Stories

- As a **rescuer**, I want to find a 24h veterinary clinic near me so I can get emergency care for an animal I found.
- As a **donor**, I want to see that a case's clinic is verified so I trust the medical updates.
- As a **clinic owner**, I want to claim my clinic profile so I can manage it and verify cases.
- As a **first-time visitor**, I want to browse clinics by city with clear filtering so I can plan rescue actions.
- As an **admin**, I want to review clinic claims efficiently so ownership transfers are fast and fair.
- As a **data ops team**, I want to seed the clinic directory with verified data for launch cities.

---

## Functional Requirements

### Clinic Data Model

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | `string` | Yes | Clinic name |
| `city` | `string` | Yes | City location |
| `address` | `string` | Yes | Full street address |
| `phone` | `string` | Yes | Contact phone |
| `is24h` | `boolean` | Yes | 24-hour availability flag |
| `specializations` | `string[]` | Yes | Medical specialties (surgery, dermatology, etc.) |
| `verified` | `boolean` | Yes | Verification status (true = data confirmed) |
| `image` | `string?` | No | Hero/cover image URL |
| `rating` | `number?` | No | Average rating 0-5 |
| `reviewCount` | `number?` | No | Number of reviews |
| `distance` | `string?` | No | Distance from user (e.g., "0.8 km") |
| `featured` | `boolean?` | No | Featured placement flag |
| `ownerId` | `Id<"users">?` | No | Claiming owner reference |
| `claimedAt` | `number?` | No | Claim approval timestamp |

**Indexes:** `by_city`, `by_owner`, `by_verified`, `by_featured`

### Directory Search & Filtering

**Current implementation** (`clinics.list` query):
- Filter by `city` (case-insensitive match)
- Filter by `is24h` flag
- Returns all matching clinics (client-side scan — acceptable for Bulgaria scale)

**UI** (`Clinics.tsx`):
- City dropdown filter
- 24h toggle filter
- Grid/list view toggle
- `FeaturedClinicCard` for promoted clinics
- `ClinicGridCard` / `ClinicListCard` for standard display
- `EmergencyBanner` for urgent clinic needs

### Clinic Profile Page

**UI** (`ClinicProfile.tsx`):
- Full clinic details display
- Specializations as badges
- Contact information
- Share button
- (Future) Linked cases treated at this clinic
- (Future) Ratings and reviews

---

## Claim Flow

The claim flow allows clinic owners/staff to take ownership of their clinic profile, enabling them to verify cases and manage their listing.

### Flow Steps

```
1. User navigates to claim page (from onboarding or clinic profile)
   ↓
2. Search for clinic by name/city/address (clinics.searchForClaim)
   ↓
3. Select clinic → see if already claimed (isClaimed flag)
   ↓
4. Submit claim form: role, email, phone, additional info (clinics.submitClaim)
   ↓
5. Duplicate guard: check for existing pending claim by same user+clinic
   ↓
6. Claim enters admin review queue (clinics.listPendingClaims)
   ↓
7. Admin reviews: approve or reject with reason (clinics.reviewClaim)
   ↓
8. On APPROVE: clinic.ownerId set, clinic.verified=true, user.role→"clinic"
   ↓
9. On REJECT: rejectionReason stored, one appeal window (7 days)
```

### Claim Submission (`submitClaim` mutation)

**Input:**
- `clinicId` — clinic to claim
- `claimerRole` — "Owner", "Manager", "Staff"
- `claimerEmail` — contact email for verification
- `claimerPhone?` — optional phone
- `additionalInfo?` — proof of affiliation

**Validation:**
- Auth required
- Clinic must exist
- Clinic must not already have an owner (`ownerId` check)
- No existing pending claim by same user for same clinic (duplicate guard)

### Claim Review (`reviewClaim` mutation)

**Admin-only** (enforced via `requireAdmin`).

**Approve action:**
1. Check clinic doesn't have a different owner
2. Set `clinic.ownerId` = claimant
3. Set `clinic.claimedAt` = now
4. Set `clinic.verified` = true
5. Upgrade claimant's `role` to `"clinic"` (unless already admin)
6. Update claim status to `"approved"`
7. Write audit log

**Reject action:**
1. Set claim status to `"rejected"`
2. Store `rejectionReason` (default: "Not eligible")
3. Write audit log

### Admin Review Queue (`listPendingClaims` query)

Admin-only query returning pending claims enriched with:
- Clinic details (name, city, address, verified status, current owner)
- Claimant details (name, email, role)
- Sorted by newest first

---

## Claim SLAs (from `docs/references/partner-ideation/claim-verification-ops.md`)

| SLA | Target | Context |
|---|---|---|
| **First response** | 24 hours | Acknowledge claim received |
| **Resolution** | 72 hours | Approve or reject with reason |
| **Fast-track** | 12 hours | Critical clinic cases (emergency vet offering to verify urgent cases) |

### Approval Criteria

- Claimant has verifiable relationship to organization
- Contact details match public or direct-confirmed records
- No conflicting active owner claim

### Rejection Criteria

- Insufficient proof of affiliation
- Fraud indicators or contradictory ownership claims
- Non-responsive claimant after follow-up window

### Appeals

- One appeal window per rejected claim (7 days)
- Escalate unresolved disputes to human decider (founder)

---

## Post-Claim Experience

Once a clinic is claimed and owner approved:

| Capability | Description |
|---|---|
| **Profile management** | Owner can update clinic details (future — no edit mutation yet) |
| **Case verification** | Owner can add clinic-verified updates to cases linked to their clinic |
| **Trust signal** | Clinic appears as "Verified" in directory and on linked cases |
| **Role upgrade** | User's `role` becomes `"clinic"`, unlocking clinic-specific permissions |

---

## Seeding Strategy (from `docs/references/partner-ideation/bulgaria-clinic-seeding-plan.md`)

### Launch Cities

| City | Priority | Coverage Target |
|---|---|---|
| **Sofia** | Highest | Comprehensive |
| **Varna** | High | High-confidence |
| **Plovdiv** | High | High-confidence |

### Data Sourcing Strategy

1. **Public registries** — Veterinary registries, official clinic directories
2. **Direct outreach** — Phone/email verification of listed clinics
3. **Community corrections** — User-reported data corrections with moderation review

### Seeding Workflow

1. Prepare normalized import spreadsheet
2. Run import script into `clinics` table
3. Mark records as `verified=true` only after source validation
4. Open claim flow for ownership transfer

### Quality Controls

- Duplicate detection: normalized name + city + phone matching
- Manual QA spot checks per city
- SLA for reported data errors: 72h

### Exit Criteria

- High-confidence initial coverage in Sofia, Varna, Plovdiv
- City + 24h filtering works in app
- Claim submissions operational

---

## petServices vs clinics: Open Decision

### Current State

Two tables model overlapping concepts:

| Aspect | `clinics` Table | `petServices` Table |
|---|---|---|
| **Schema lines** | L327-L353 | L380-L424 |
| **Fields** | Basic (name, city, address, phone, is24h, specializations) | Rich (+ coordinates, email, website, description, services[], hours, logo, photos[]) |
| **Types** | Clinics only | 9 types: clinic, grooming, training, pet_store, shelter, pet_sitting, pet_hotel, pharmacy, other |
| **CRUD functions** | Full (list, get, searchForClaim, submitClaim, listPendingClaims, reviewClaim) | **None** — zero Convex functions |
| **Claim flow** | Full (clinicClaims table + functions) | Schema only (petServiceClaims table exists, no functions) |
| **UI pages** | Clinics.tsx, ClinicProfile.tsx, ClaimOrganizationPage.tsx | No UI |
| **Data** | Seeded for Bulgaria | Empty |

### Option A: Keep Separate

- `clinics` = veterinary clinics (medical trust infrastructure)
- `petServices` = everything else (grooming, stores, shelters, hotels)
- Pros: clinics have special trust role (case verification); separation is semantically correct
- Cons: duplicate schema patterns, parallel claim flows needed, `petServices` type="clinic" creates confusion

### Option B: Merge into petServices

- Deprecate `clinics` table, migrate data to `petServices` where `type="clinic"`
- Build all CRUD + claim functions on `petServices`
- Pros: unified directory, richer field set, single claim flow
- Cons: migration effort, `petServices` is a generic name for a trust-critical concept, existing clinic functions + UI need rewrite

### Recommendation

**Option A with cleanup:** Keep `clinics` as the veterinary trust layer. Build `petServices` CRUD + claim functions for non-clinic businesses. Remove `type="clinic"` from `petServices` enum to eliminate overlap. Link users to relevant directory via `linkedPetServiceId` (professionals/businesses) or `ownerId` on clinics (clinic owners).

**Decision status:** Open — needs human decision before implementation.

---

## Data Model

### `clinics` Table (schema L327-L353)

See Clinic Data Model section above.

### `clinicClaims` Table (schema L356-L377)

| Field | Type | Purpose |
|---|---|---|
| `clinicId` | `Id<"clinics">` | Clinic being claimed |
| `userId` | `Id<"users">` | Claimant |
| `status` | `"pending" \| "approved" \| "rejected"` | Claim lifecycle |
| `claimerRole` | `string` | "Owner", "Manager", "Staff" |
| `claimerEmail` | `string` | Verification email |
| `claimerPhone` | `string?` | Verification phone |
| `additionalInfo` | `string?` | Proof of affiliation |
| `reviewedBy` | `Id<"users">?` | Admin reviewer |
| `reviewedAt` | `number?` | Review timestamp |
| `rejectionReason` | `string?` | Why rejected |
| `createdAt` | `number` | Submission timestamp |

**Indexes:** `by_clinic`, `by_user`, `by_status`

### `petServices` Table (schema L380-L424)

Rich unified directory table with 9 service types, coordinates, hours, photos, services array. See schema for full field listing.

**Indexes:** `by_type`, `by_city`, `by_verified`, `by_owner`

### `petServiceClaims` Table (schema L427-L447)

Parallel structure to `clinicClaims` but for pet services. **No functions exist.**

---

## API Surface

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `clinics.list` | query | no | Directory listing with city/24h filters |
| `clinics.get` | query | no | Single clinic by ID |
| `clinics.searchForClaim` | query | no | Text search for claim flow (name/city/address) |
| `clinics.submitClaim` | mutation | required | Submit ownership claim |
| `clinics.listPendingClaims` | query | admin | Admin claim review queue |
| `clinics.reviewClaim` | mutation | admin | Approve/reject claim |

### Missing Functions (needed)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `clinics.update` | mutation | owner/admin | Edit clinic details post-claim |
| `petServices.list` | query | no | Pet services directory listing |
| `petServices.get` | query | no | Single pet service by ID |
| `petServices.submitClaim` | mutation | required | Submit pet service claim |
| `petServices.listPendingClaims` | query | admin | Admin pet service claim queue |
| `petServices.reviewClaim` | mutation | admin | Approve/reject pet service claim |

---

## UI Surfaces

| Page/Component | Route | Purpose |
|---|---|---|
| `Clinics.tsx` | `/clinics` | Directory listing with filters |
| `ClinicProfile.tsx` | `/clinic/:id` | Clinic detail page |
| `ClaimOrganizationPage.tsx` | `/onboarding/claim` | Clinic search + claim submission |
| `FeaturedClinicCard` | component | Promoted clinic card |
| `ClinicGridCard` | component | Grid view card |
| `ClinicListCard` | component | List view card |
| `EmergencyBanner` | component | Urgent clinic need banner |
| Admin clinic claims queue | `/admin/clinic-claims` | Claim review dashboard |

---

## Edge Cases & Abuse

1. **Double claims** — Duplicate guard: one pending claim per user per clinic enforced server-side
2. **Claiming already-owned clinic** — Blocked if `ownerId` already set
3. **Conflicting claims** — Multiple users claiming same unclaimed clinic → first approved wins, others rejected
4. **Fake clinic data** — Community correction channel + moderation review + 72h error SLA
5. **Claim after rejection** — Currently no explicit cooldown. One appeal window (7 days) per rejection.
6. **Owner removal** — No mechanism to un-claim a clinic. Needs admin tool for ownership transfer/revocation.
7. **Clinic data staleness** — Seeded data may become outdated. Community reporting + owner updates are the correction path.

---

## Non-Functional Requirements

1. Directory search, filter, and claim flows SHOULD remain fast on mobile (<500ms for common queries on seed-to-MVP scale).
2. Claim review actions MUST be auditable and idempotent to prevent ownership race-condition corruption.
3. Public clinic payloads MUST not expose claimant PII outside authorized admin contexts.
4. Clinic surfaces MUST follow trust and accessibility rules (clear status labels, 44x44 touch targets, visible focus states).

---

## Acceptance Criteria

- [ ] Clinic directory search filters by city (case-insensitive) and `is24h` flag.
- [ ] `submitClaim` validates: auth required, clinic exists, clinic has no existing `ownerId`, no existing pending claim by same user for same clinic.
- [ ] `reviewClaim` with approve atomically sets `clinic.ownerId`, `clinic.claimedAt`, `clinic.verified: true`, upgrades claimant role to `"clinic"`, and sets claim to `"approved"` with audit log.
- [ ] `reviewClaim` with reject sets claim to `"rejected"`, stores `rejectionReason`, and creates audit log entry.
- [ ] `listPendingClaims` is admin-only and returns pending claims enriched with clinic and claimant details.
- [ ] Conflicting claims resolved by first-approved-wins: once `ownerId` is set, subsequent claims are rejected at submission.
- [ ] Seeded clinic data for launch cities is marked `verified: true` only after source validation.

## Open Questions

1. **petServices vs clinics resolution** — See detailed section above. Needs human decision.

2. **Clinic profile editing** — No `clinics.update` mutation exists. Claimed clinic owners cannot edit their listing. Need: edit mutation with ownership check and audit logging.

3. **Ratings & reviews** — `rating` and `reviewCount` fields exist on `clinics` but no review system is built. Decide: build review system or remove the fields.

4. **Distance calculation** — `distance` field exists on `clinics` but is not computed server-side. Currently a placeholder. Need: GPS-based distance when user shares location, or remove field.

5. **Pet service claim functions** — `petServiceClaims` table exists but has zero functions. If keeping `petServices` separate from `clinics`, need full claim CRUD mirroring `clinics` implementation.

6. **Clinic-case linking** — Cases have `clinicId` but there's no clinic-side view of "cases I'm treating." Need: query for clinic owner to see their linked cases.

7. **Notification on claim status change** — Claimants currently get no notification when their claim is approved/rejected. Need: notification trigger in `reviewClaim`.
