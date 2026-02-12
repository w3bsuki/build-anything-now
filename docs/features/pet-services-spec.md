# Pet Services Directory Spec

> **Owner:** Product + Partnerships
> **Status:** draft
> **Last updated:** 2026-02-10
> **PRD Ref:** (related to CLINIC ONBOARDING — parallel directory for non-clinic services)

## Purpose

Provide a directory system for non-clinic pet service businesses — grooming, training, pet stores, shelters, pet hotels, pharmacies, and pet sitting services. Businesses can register new listings or claim existing seeded entries, similar to the clinic directory. This extends the platform's professional services layer beyond veterinary clinics.

## User Stories

- As a **pet service owner**, I want to register my business on the platform so potential customers can find me.
- As a **pet service owner**, I want to claim an existing directory listing so I can manage my business's profile.
- As a **pet lover**, I want to browse pet services near me (grooming, training, pet stores) so I can find trusted providers.
- As an **admin**, I want to review pet service claims to verify business ownership before granting management access.

## Functional Requirements

### Service Types

| Type | Label | Description |
|---|---|---|
| `clinic` | Clinic | Veterinary clinic (overlaps with clinics table for now) |
| `grooming` | Grooming | Pet grooming salon |
| `training` | Training | Dog/pet training services |
| `pet_store` | Pet Store | Pet supply store |
| `shelter` | Shelter | Animal shelter |
| `pet_sitting` | Pet Sitting | Pet sitting / dog walking |
| `pet_hotel` | Pet Hotel | Boarding / pet hotel |
| `pharmacy` | Pharmacy | Veterinary pharmacy |
| `other` | Other | Other pet service |

### Registration Flow

1. Authenticated user navigates to registration.
2. User provides: `name`, `type`, `city`, `address`, `phone`, optional `email`, `website`, `description`.
3. `petServices.register` mutation creates entry with `verified: false`, links to user via `linkedPetServiceId` on the user record.
4. Business appears in directory but marked as unverified.

### Claim Flow

1. User searches existing directory entries via `petServices.searchForClaim`.
2. Search matches by name, city, or address (case-insensitive substring, min 2 chars).
3. Results include `isClaimed` flag (true if `ownerId` is set).
4. User selects unclaimed entry and submits claim via `petServices.submitClaim`.
5. Claim validation: service exists, not already claimed, no existing pending claim by same user.
6. Claim goes to admin review queue.

### Search

- `searchForClaim` query collects all `petServices`, filters by name/city/address substring match.
- Optional `type` filter narrows to specific service category.
- Returns max 15 results with `isClaimed` flag.
- Brute-force search (full scan + JS filter) — acceptable for small dataset.

## Data Model

### `petServices` table

| Field | Type | Description |
|---|---|---|
| `name` | string | Business name |
| `type` | union (9 values) | Service category |
| `city` | string | City name |
| `address` | optional string | Street address |
| `phone` | optional string | Contact phone |
| `email` | optional string | Contact email |
| `website` | optional string | Website URL |
| `description` | optional string | Business description |
| `verified` | boolean | Admin-verified |
| `ownerId` | optional Id<"users"> | Claiming user |
| `claimedAt` | optional number | Claim approval timestamp |
| `createdAt` | number | Record creation timestamp |

### `petServiceClaims` table

| Field | Type | Description |
|---|---|---|
| `petServiceId` | Id<"petServices"> | Target service |
| `userId` | Id<"users"> | Claimant |
| `status` | `"pending"` \| `"approved"` \| `"rejected"` | Claim status |
| `additionalInfo` | optional string | Claimant's supporting info |
| `rejectionReason` | optional string | Admin rejection reason |
| `createdAt` | number | Submission timestamp |
| `reviewedAt` | optional number | Review timestamp |

## API Surface

### Existing (`convex/petServices.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `searchForClaim` | query | No | Search pet services for claiming |
| `register` | mutation | Yes | Register new pet service business |
| `submitClaim` | mutation | Yes | Claim existing unclaimed service |

### Needed

| Function | Type | Purpose |
|---|---|---|
| `list` | query | Public directory listing with filters (type, city) |
| `get` | query | Single service detail page |
| `reviewClaim` | mutation (admin) | Approve/reject pet service claim |
| `listPendingClaims` | query (admin) | Admin claim review queue |
| `update` | mutation | Owner updates their service details |

## UI Surfaces

| Surface | Route | Status |
|---|---|---|
| Service search (claim flow) | `/onboarding/claim` | Implemented (shared with clinic claim) |
| Service directory | `/services` | Not implemented |
| Service detail page | `/services/:id` | Not implemented |
| Admin claim queue | `/admin/pet-service-claims` | Not implemented |

## Edge Cases & Abuse

1. **Duplicate registration** — User registers a service that already exists in the directory. No dedup guard currently; consider name+city+type matching.
2. **Claim already-claimed service** — Blocked at `submitClaim` level; returns error.
3. **Self-registration + self-claim** — User registers then claims their own entry. Technically valid since `register` auto-links; `submitClaim` is for existing seeded entries.
4. **Service type overlap with clinics** — `type: "clinic"` exists in both `petServices` and `clinics` tables. Potential confusion. Consider constraining pet services to non-clinic types only.
5. **Spam registrations** — No rate limit on `register`. Consider max 3 registrations per user.

## Non-Functional Requirements

- **Performance:** Directory search returns in <500ms for up to 500 entries.
- **Security:** All write mutations require authentication. Claim approval requires admin role.
- **Data quality:** Seeded entries should be source-validated before marking `verified: true`.

## Acceptance Criteria

- [ ] `register` creates a new pet service with `verified: false` and links to the user.
- [ ] `searchForClaim` returns matching services with `isClaimed` flag, max 15 results, min 2 char query.
- [ ] `submitClaim` validates: auth required, service exists, not already claimed, no duplicate pending claim.
- [ ] Registered services appear in directory but marked as unverified.
- [ ] Service types are constrained to the 9 valid values — invalid types rejected.
- [ ] Claim approval sets `ownerId`, `claimedAt`, and `verified: true` on the service.

## Open Questions

1. **Clinics vs. pet services** — Should clinics be migrated into the `petServices` table, or kept separate? Currently separate with different schemas and claim flows. Keeping separate for now; revisit if directories are unified in the future.
2. **Directory UI priority** — Pet services directory UI is not yet built. What's the priority relative to other P2 features? Consider launching with claim flow only (already exists) and deferring public browsing UI.
3. **Review queue** — Should pet service claims share the clinic claims admin queue, or have their own? Recommendation: separate tab in the same admin moderation page.
4. **Verification** — What constitutes "verified" for a non-clinic service? Clinic verification involves professional credentials. For a grooming salon, is claim approval sufficient for `verified: true`?
