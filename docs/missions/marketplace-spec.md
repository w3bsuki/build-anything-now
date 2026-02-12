# Pet Services Marketplace Spec

> **Owner:** Product + Partnerships
> **Status:** draft
> **Last updated:** 2026-02-08

---

## Purpose

Create a unified marketplace for pet services and supplies — connecting pet owners, rescuers, and shelters with grooming salons, training centers, pet stores, boarding facilities, pharmacies, and other pet service providers. The marketplace extends Pawtreon beyond rescue into everyday pet care, generating recurring platform revenue through commission on transactions while strengthening the partner ecosystem.

The marketplace builds on existing infrastructure: the `petServices` table in the schema already supports 9 service types with rich profile fields, and the partner ecosystem (`partners` table) already tracks contributing businesses. The marketplace connects these pieces into a consumer-facing directory with claim/verify flow and (future) transactional capability.

**Classification:** Post-MVP feature. Spec now for schema/architecture planning, build after core rescue + donation + trust loops are solid.

---

## User Stories

- As a **pet owner**, I want to search for nearby pet groomers with ratings and reviews so I can find a trusted groomer for my dog.
- As a **rescuer**, I want to find a pet store that donates supplies to shelter animals so I can source food and bedding for rescued animals.
- As a **pet store owner**, I want to claim my business listing on Pawtreon and update my profile with photos, hours, and services so pet owners can find me.
- As an **adopter**, I want to discover recommended services (vet, grooming, training) after adopting an animal so I can provide proper care from day one.
- As a **shelter**, I want to list my available services (boarding, daycare, grooming) so the community knows what we offer beyond rescue.
- As an **admin**, I want to review pending business claims and verify legitimate ownership before granting profile management access.
- As a **browser** (unauthenticated), I want to browse the service directory by category and city without signing up so I can evaluate the platform.

---

## Functional Requirements

### Service Directory

1. **Service categories** — Nine types currently in schema: clinic, grooming, training, pet_store, shelter, pet_sitting, pet_hotel, pharmacy, other. **Note:** The `clinic` type overlaps with the dedicated `clinics` table — see "Critical Dependency" section below.
2. **Business profiles** — Each listing includes: name, type, city, address, coordinates (lat/lng), phone, email, website, description, services offered (array), specializations, 24h flag, operating hours, logo, photos, rating, review count, verification status, owner.
3. **Search and discovery** — Browse by service type (grooming, training, etc.), filter by city, search by name/address. Server-driven queries (no client-side fetch-all). Sort: alphabetical, nearest (if location available), highest rated.
4. **Service profile page** — Full business details: photos gallery, services list, hours, contact info, location map (approximate), rating/reviews, linked Pawtreon partner page (if applicable), claim CTA (if unclaimed).
5. **Seeded listings** — Initial directory populated from data sourcing (similar to clinic seeding strategy in `clinics-spec.md`). Seeded listings are unverified and unclaimed until business owner claims them.

### Claim & Verification Flow

6. **Business claim** — Authenticated user submits a claim for an existing listing: role at business, email, phone, additional info. Duplicate guard: prevent claiming already-claimed businesses. Prevent multiple pending claims from same user for same business.
7. **Admin review queue** — Pending claims listed in admin dashboard with claimer info, business details, and action buttons (approve/reject with reason). Same SLA model as clinic claims: 24h first response, 72h resolution.
8. **Post-claim access** — Approved owner can: update business profile (description, hours, photos, services), respond to reviews (future), access analytics (future). Owner linked via `ownerId` on `petServices` record.
9. **Verification status** — `verified: false` (seeded/unclaimed) → `verified: true` (claimed + admin-approved). Verification badge displayed on listing.

### Product Categories (Future Transactional)

10. **Product listings** — Pet stores and pharmacies can list products: food, supplies, medication, toys, accessories. Each product: name, description, price, photos, category, availability status.
11. **Service listings** — Grooming salons, trainers, boarding facilities can list specific services with pricing: e.g., "Full groom - Medium dog - €35", "Basic obedience - 8 sessions - €200".
12. **Booking/ordering** — Future: users can book services or order products directly through the platform. Requires Stripe Connect for payouts to merchants.

### Supply Donation Integration

13. **Supply donation for rescued animals** — Pet stores can designate products as "available for rescue donation." Donors can purchase specific supplies (food bags, medication, bedding) directed to a specific rescue case or shelter. This creates a targeted, tangible giving experience beyond monetary donations.

### Commission Model

14. **Platform commission** — When transactional features ship, platform takes a commission on each transaction. Rate TBD (industry standard: 10–20% for service marketplaces, 5–15% for product marketplaces). This is **separate from** the 5% donation fee on rescue donations.
15. **Payment processing** — Stripe Connect for marketplace payouts. Each verified business connects a Stripe account for receiving payouts. Platform collects commission before payout.

---

## Critical Dependency: petServices vs Clinics Overlap

The `petServices` table includes `type: "clinic"` which overlaps with the dedicated `clinics` table. This must be resolved before the marketplace ships.

**Recommendation from `clinics-spec.md`:** Option A with cleanup.

| Table | Purpose | After Resolution |
|-------|---------|-----------------|
| `clinics` | Veterinary trust infrastructure — case verification, medical updates, claim flow | Remains the canonical vet clinic table |
| `petServices` | Non-clinic service directory — grooming, training, stores, boarding, etc. | Remove `type: "clinic"` from enum. All other types stay |

**Impact on this spec:**
- Marketplace directory shows non-clinic `petServices` only
- Vet clinics have their own dedicated directory (see `clinics-spec.md`)
- Cross-linking: clinic profile pages can link to associated pet services (e.g., a vet clinic that also offers grooming)
- The `type: "clinic"` removal is a **schema migration** that must be carefully coordinated

**Until resolved:** This spec covers the marketplace for all `petServices` types. If `type: "clinic"` remains, marketplace simply includes vet clinics alongside other services (with a note that the dedicated clinics directory exists for trust-verified vet interactions).

---

## Non-Functional Requirements

- **Performance:** Directory browse page loads within 300ms for up to 500 listings per city. Search results return within 200ms. Server-driven filtering via Convex queries — no client-side fetch-all-then-filter.
- **Privacy:** Business address shown in listing (it's a business, not personal). Coordinates shown at street level for map placement. Business owner personal email/phone not exposed — only business contact info.
- **Accessibility:** All listing cards keyboard-navigable. Service type icons have accessible labels. Rating display includes text alternative ("4.2 out of 5 stars").
- **i18n:** Service type labels, category names, filter labels use i18n keys. Business descriptions are user-entered and not auto-translated (unlike rescue case content). Service names in original language with type label translated.
- **SEO:** Marketplace listings should be indexable (future: SSR share pages for service profiles, similar to case share pages).
- **Moderation:** Automated checks for: phone number format validation, URL format validation, suspicious service descriptions (spam keywords). Admin review for flagged/reported listings.

---

## Data Model

### Existing: `petServices` Table (schema.ts L370-L424)

```typescript
petServices: defineTable({
    name: v.string(),
    type: v.union(
        v.literal("clinic"),       // ← overlap with clinics table (see Critical Dependency)
        v.literal("grooming"),
        v.literal("training"),
        v.literal("pet_store"),
        v.literal("shelter"),
        v.literal("pet_sitting"),
        v.literal("pet_hotel"),
        v.literal("pharmacy"),
        v.literal("other"),
    ),
    city: v.string(),
    address: v.string(),
    coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    phone: v.string(),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    services: v.array(v.string()),
    specializations: v.optional(v.array(v.string())),
    is24h: v.optional(v.boolean()),
    hours: v.optional(v.string()),
    verified: v.boolean(),
    ownerId: v.optional(v.id("users")),
    claimedAt: v.optional(v.number()),
    logo: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
})
    .index("by_type", ["type"])
    .index("by_city", ["city"])
    .index("by_verified", ["verified"])
    .index("by_owner", ["ownerId"])
```

### Existing: `petServiceClaims` Table (schema.ts L427-L447)

```typescript
petServiceClaims: defineTable({
    petServiceId: v.id("petServices"),
    userId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    claimerRole: v.string(),
    claimerEmail: v.string(),
    claimerPhone: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
})
    .index("by_service", ["petServiceId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
```

### Existing: `partners` Table (schema.ts L471-L489)

```typescript
partners: defineTable({
    name: v.string(),
    logo: v.string(),
    type: v.union(v.literal("pet-shop"), v.literal("food-brand"), v.literal("veterinary"), v.literal("sponsor")),
    contribution: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    since: v.string(),
    animalsHelped: v.number(),
    totalContributed: v.number(),
    featured: v.boolean(),
    createdAt: v.number(),
})
```

**Boundary:** `partners` = organizations that contribute to Pawtreon (sponsorship, donations, in-kind). `petServices` = businesses that serve pet owners directly. A business can be both (e.g., a pet store that sponsors Pawtreon AND lists products in the marketplace). Linkage: `petServices` listing can reference a `partners` record for cross-promotion.

### Future Schema Additions (Transactional Marketplace)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `products` | Product catalog for stores/pharmacies | `petServiceId`, `name`, `description`, `price`, `currency`, `category` (food/supplies/medication/toys/accessories), `photos[]`, `inStock`, `rescueDonatable` (flag for supply donation program) |
| `serviceOfferings` | Priced service packages | `petServiceId`, `name`, `description`, `price`, `currency`, `duration`, `category` (grooming/training/boarding/sitting) |
| `orders` | Purchase/booking records | `userId`, `petServiceId`, `items[]`, `total`, `currency`, `stripePaymentId`, `commission`, `status` (pending/completed/refunded), `type` (product/service/supply-donation) |
| `reviews` | User reviews for services | `userId`, `petServiceId`, `rating` (1-5), `content`, `orderId` (optional), `createdAt` |

---

## API Surface

### Existing Functions (petServices.ts)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `petServices.searchForClaim` | query | no | Search by name/city/address for claim flow (min 2 chars). Returns `isClaimed` flag. Max 15 results. |
| `petServices.register` | mutation | yes | Create new pet service. Sets `verified: false`, links to user as owner. |
| `petServices.submitClaim` | mutation | yes | Claim existing service. Duplicate guard (already claimed, pending claim exists). |

### Existing Functions (partners.ts)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `partners.list` | query | no | List partners with type/featured filters |
| `partners.get` | query | no | Single partner by ID |
| `partners.getStats` | query | no | Aggregate stats (total partners, animals helped, contributed) |

### Required Functions — Directory (Core Marketplace)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `petServices.list` | query | no | General directory browse. Filters: type, city, verified. Sort: alphabetical, rating. Pagination via cursor. |
| `petServices.get` | query | no | Single service profile by ID. Enriches with owner name/avatar if claimed. |
| `petServices.listByType` | query | no | Optimized type-specific listing using `by_type` index. |
| `petServices.listByCity` | query | no | Optimized city-specific listing using `by_city` index. |
| `petServices.update` | mutation | owner | Update business profile (name, description, hours, photos, services etc). Ownership check. |
| `petServices.search` | query | no | Full-text search across name, city, address, services. Server-side. Max 30 results. |

### Required Functions — Admin Review

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `petServiceClaims.listPending` | query | admin | All pending claims for admin review queue. Includes claimer info and service details. |
| `petServiceClaims.review` | mutation | admin | Approve or reject a claim. On approve: set `petService.ownerId`, `verified: true`, `claimedAt`. On reject: set `rejectionReason`. Audit log entry. |

### Future Functions (Transactional)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `products.list` | query | no | Product catalog for a service |
| `products.create` | mutation | owner | Add product to catalog |
| `orders.create` | mutation | yes | Place order / book service |
| `orders.confirmPayment` | internalMutation | internal | Stripe webhook confirms marketplace payment |
| `reviews.create` | mutation | yes | Submit review (with optional order reference) |
| `reviews.list` | query | no | Reviews for a service |

---

## UI Surfaces

### Required (Directory Phase)

| Page/Component | Route | Purpose |
|----------------|-------|---------|
| **Marketplace Directory** | `/services` | Grid of service cards grouped by category. Filter by type (pills: All / Grooming / Training / Stores / Boarding / More), filter by city. Each card: logo/photo, name, type badge, city, rating stars, verified badge. |
| **Service Profile** | `/service/:id` | Full business details: photo gallery, services list, hours, contact (phone, website), location map, rating/review count, verification badge. If unclaimed: "Is this your business? Claim it" CTA. If claimed: owner info, partner badge (if applicable). |
| **Claim Flow** | modal on `/service/:id` | Same pattern as clinic claim (see `clinics-spec.md`): form with role, email, phone, additional info. Success → "Claim submitted, we'll review within 72 hours." |
| **Admin Claims Queue** | `/admin/service-claims` | Pending claims list with service name, claimer details, action buttons (Approve / Reject). Same pattern as clinic claims queue. |
| **Registration Flow** | `/register-service` or modal | For businesses not yet in the directory: create new listing form. Name, type, city, address, phone, services, hours, description, photos. |

### Future (Transactional Phase)

| Page/Component | Route | Purpose |
|----------------|-------|---------|
| **Product Catalog** | `/service/:id/products` | Product grid within service profile |
| **Service Booking** | `/service/:id/book` | Select service type, date/time, pay |
| **Order History** | `/account/orders` | User's marketplace orders |
| **Supply Donation** | on case detail | "Donate supplies" → select from partnered store's available items |
| **Merchant Dashboard** | `/account/merchant` | Owner's view: orders, reviews, analytics, payouts |

---

## Discovery & Cross-Linking

| From | To | How |
|------|----|-----|
| Home feed | Marketplace | "Find pet services near you" card/banner in feed (below rescue content) |
| Case detail | Marketplace | After case closed → "Find care services" suggestion |
| Adoption detail | Marketplace | Post-adoption → recommended services (vet, grooming, training) |
| Partner profile | Service profile | Partner with marketplace listing gets cross-link |
| Clinic profile | Related services | Clinic that also offers grooming/boarding gets linked |
| Onboarding | Registration | "Register your pet business" option for business user type |
| Safehouse profile | Marketplace | "Supplies needed" → linked pet store supply donation |

---

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Fake business listing | Admin review on claim. Seeded listings from verified sources only. Community report button on unclaimed listings. |
| Competitor claiming another's business | Claim verification: admin checks email domain match, phone verification, may request proof of ownership (business license photo). Dispute resolution process for conflicting claims. |
| Stale seeded listings (business closed) | Community report: "This business is permanently closed." Admin removes. Future: automated stale check (no owner activity + multiple closure reports). |
| Price gouging in product listings | No price regulation in v1 (marketplace, not a retailer). Future: community flagging for egregious pricing. |
| Spam reviews | Reviews require verified purchase/booking (when transactional). Until then, reviews seeded or admin-moderated. |
| Unlicensed services (e.g., unqualified trainers) | Platform disclaimer: "Pawtreon does not verify professional credentials." Verification badge only confirms business ownership, not service quality. |
| Service type miscategorization | Admin can recategorize. Community reports for wrong type. |
| Duplicate listings (same business, different entries) | Duplicate detection on registration: name + city + address similarity check. Admin merge capability for discovered duplicates. |
| Business owner wants listing removed | Owner can "unpublish" their listing. Unclaimed seeded listings: admin removes on request with identity verification. |

---

## Open Questions

1. **Transactional vs. directory-only** — The biggest scope decision. Directory-only is much simpler (listing + contact info, no payments). Transactional adds revenue but requires: Stripe Connect, order management, refunds, dispute resolution, merchant onboarding. **Recommendation:** Launch as directory-only. Add transactional capability as a distinct milestone after directory traction is proven.

2. **Commission rate** — If/when transactional: what commission? Industry benchmarks: Thumbtack 15–20% on services, Chewy 0% (retail margin), Rover 15–20% on bookings. Recommend starting at 10–15% for services, 5–10% for products.

3. **petServices vs clinics resolution** — Must be decided before marketplace ships. If `type: "clinic"` stays in `petServices`, marketplace shows clinics in mixed results (confusing UX — users expect clinic directory for vet needs). If removed, clean separation. → **Needs DECISIONS.md entry.**

4. **Review system** — When do reviews ship? Directory-only phase or only after transactional? Anonymous reviews or linked to verified purchases? How to handle fake reviews?

5. **Supply donation mechanics** — Is this a donation (funds go to Pawtreon, then Pawtreon buys supplies) or a direct store purchase (donor pays store, store delivers to shelter)? What about logistics/delivery?

6. **Seeding strategy** — How are non-clinic businesses seeded? Same data sourcing approach as clinics (Google Maps, local directories)? Which types first? Grooming is the largest market — start there?

7. **Partner table boundary** — Some businesses are both partners (contribute to Pawtreon) and marketplace listings (serve pet owners). How is this modeled? `petService.partnerId` reference? Or keep them independent with name-based matching?

8. **Inventory management** — If transactional: do stores manage real-time inventory on Pawtreon? Or just catalog presence with "contact to confirm availability"?

9. **Marketplace route placement** — Where does the marketplace live in navigation? Dedicated nav entry? Under "More"? Tab within community? Needs IA decision consistent with `ui-patterns-spec.md`.
