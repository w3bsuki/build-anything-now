# Data Model Spec

> **Owner:** Backend engineering  
> **Status:** final  
> **Last updated:** 2026-02-08

## Purpose

Complete reference for Pawtreon's Convex data model. Documents all 27 tables, their fields, indexes, relationships, and usage patterns. This spec is the authoritative schema guide — `convex/schema.ts` is the source of truth for code, this document is the source of truth for intent and constraints.

Absorbs findings from `docs/systems/data-model-gap-audit.md` (now resolved).

---

## Schema Overview

Pawtreon uses **Convex** as its backend database. Convex provides:
- Automatic schema validation (all writes validate against the schema)
- Reactive queries (UI subscribes to live data changes)
- No manual migrations (schema changes are applied atomically on deploy)
- Built-in `_id` (document ID) and `_creationTime` fields on every table

### Table Count: 27 application tables + 1 built-in (`_storage`)

### Domain Grouping

| Domain | Tables | Purpose |
|--------|--------|---------|
| **Core User** | `users`, `userSettings`, `follows` | Identity, preferences, social graph |
| **Cases & Social** | `cases`, `likes`, `comments`, `savedCases`, `adoptions` | Rescue cases, engagement, bookmarks |
| **Donations & Payments** | `donations`, `paymentMethods` | Money flow, Stripe integration |
| **Campaigns & Partners** | `campaigns`, `partners` | Fundraising campaigns, partner directory |
| **Clinics & Services** | `clinics`, `clinicClaims`, `petServices`, `petServiceClaims` | Directory, verification, ownership |
| **Community** | `communityPosts`, `communityComments`, `communityReactions`, `communityReports` | Forum system |
| **Volunteers** | `volunteers` | Volunteer profiles and stats |
| **Notifications** | `notifications` | In-app notification delivery |
| **Achievements** | `achievements` | Badge/gamification system |
| **Trust & Moderation** | `reports`, `auditLogs` | Case reports, audit trail |
| **Messaging** | `messages` | 1:1 direct messaging (post-MVP) |
| **Translation** | `translationRateLimits` | UGC machine translation rate control |
| **Storage** | `_storage` (built-in) | File/image uploads |

---

## Entity Relationship Overview

```
users ──────┬──── donations ──────── cases
            │         │                │
            │         └──── campaigns  ├──── likes
            │                          ├──── comments
            ├──── follows              ├──── savedCases
            │     (follower↔following) ├──── reports
            │                          └──── adoptions
            ├──── userSettings
            ├──── paymentMethods
            ├──── achievements
            ├──── notifications
            ├──── volunteers
            ├──── messages (sender↔receiver)
            │
            ├──── clinics ←── clinicClaims
            ├──── petServices ←── petServiceClaims
            │
            ├──── communityPosts ──── communityComments
            │         │                    │
            │         ├──── communityReactions
            │         └──── communityReports
            │
            └──── auditLogs

cases ──── clinics (optional clinicId FK)
users ──── petServices (optional linkedPetServiceId FK)
```

---

## Table Definitions

### 1. `users`

**Purpose:** Core identity table, synced with Clerk via webhook. Stores profile data, onboarding state, capabilities, verification level, and role-specific fields.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clerkId` | `string` | Yes | Clerk identity subject ID |
| `name` | `string` | Yes | Full name from Clerk |
| `email` | `string` | Yes | Primary email from Clerk |
| `avatar` | `string` | No | Profile image URL from Clerk |
| `phone` | `string` | No | Phone number |
| `role` | `"user" \| "volunteer" \| "clinic" \| "admin"` | Yes | System role for authorization |
| `createdAt` | `number` | Yes | Unix timestamp |
| `displayName` | `string` | No | User-chosen display name |
| `bio` | `string` | No | Profile biography |
| `isPublic` | `boolean` | No | Whether profile is publicly visible |
| `onboardingCompleted` | `boolean` | No | Whether post-signup wizard was completed |
| `onboardingCompletedAt` | `number` | No | Timestamp of onboarding completion |
| `userType` | `"individual" \| "organization" \| "pet_lover" \| "volunteer" \| "professional" \| "business" \| "exploring"` | No | Selected during onboarding |
| `volunteerCapabilities` | `string[]` | No | `["transport", "fostering", "rescue", "events", "social_media", "general"]` |
| `volunteerAvailability` | `"available" \| "busy" \| "offline"` | No | Opt-in availability (default: offline) |
| `volunteerCity` | `string` | No | City for volunteer matching |
| `professionalType` | `"veterinarian" \| "groomer" \| "trainer" \| "pet_sitter" \| "other"` | No | For individual professionals |
| `professionalSpecialties` | `string[]` | No | Professional specializations |
| `linkedPetServiceId` | `Id<"petServices">` | No | FK → `petServices` for professionals/businesses |
| `hasPets` | `boolean` | No | Whether user has pets |
| `petTypes` | `string[]` | No | `["dog", "cat", "bird", "other"]` |
| `city` | `string` | No | User's city |
| `verifiedAt` | `number` | No | Verification timestamp |
| `verifiedBy` | `Id<"users">` | No | FK → `users` (admin who verified) |
| `capabilities` | `string[]` | No | Multi-capability model (finder, rescuer, donor, etc.) |
| `verificationLevel` | `"unverified" \| "community" \| "clinic" \| "partner"` | No | Trust ladder position |
| `productTourCompleted` | `boolean` | No | Whether product tour was dismissed |
| `productTourCompletedAt` | `number` | No | Tour completion timestamp |

**Indexes:**

| Index | Fields | Purpose |
|-------|--------|---------|
| `by_clerk_id` | `[clerkId]` | Clerk webhook user lookup |
| `by_onboarding` | `[onboardingCompleted]` | Onboarding funnel queries |
| `by_user_type` | `[userType]` | Filter by user type |
| `by_volunteer_availability` | `[volunteerAvailability]` | Volunteer matching |

**Relationships:** Referenced by almost every other table via `userId` FK. Self-references via `verifiedBy`.

**Usage:** `users.ts` (upsert from Clerk webhook, profile queries/updates, onboarding, capabilities), `lib/auth.ts` (auth helpers query by `clerkId`).

---

### 2. `donations`

**Purpose:** Tracks all monetary donations with full Stripe payment traceability. Links to cases and/or campaigns.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → donor |
| `caseId` | `Id<"cases">` | No | FK → case being funded |
| `campaignId` | `string` | No | Legacy campaign identifier string |
| `campaignRefId` | `Id<"campaigns">` | No | FK → campaigns table |
| `amount` | `number` | Yes | Donation amount (minor units for Stripe, major units for display) |
| `currency` | `string` | Yes | ISO currency code (e.g., `"EUR"`) |
| `status` | `"pending" \| "completed" \| "failed" \| "refunded"` | Yes | Payment lifecycle state |
| `paymentMethod` | `string` | No | Payment method descriptor |
| `paymentProvider` | `"stripe" \| "manual"` | No | Payment provider used |
| `stripeCheckoutSessionId` | `string` | No | Stripe Checkout Session ID |
| `stripePaymentIntentId` | `string` | No | Stripe PaymentIntent ID |
| `stripeChargeId` | `string` | No | Stripe Charge ID |
| `idempotencyKey` | `string` | No | Prevents double-processing |
| `receiptId` | `string` | No | Platform receipt identifier |
| `receiptUrl` | `string` | No | Stripe receipt URL |
| `transactionId` | `string` | No | Internal transaction reference |
| `message` | `string` | No | Donor message |
| `anonymous` | `boolean` | Yes | Whether donation is anonymous |
| `completedAt` | `number` | No | Payment completion timestamp |
| `failedAt` | `number` | No | Payment failure timestamp |
| `createdAt` | `number` | Yes | Record creation timestamp |

**Indexes:**

| Index | Fields | Purpose |
|-------|--------|---------|
| `by_user` | `[userId]` | Donor history |
| `by_case` | `[caseId]` | Case funding lookup |
| `by_campaign_ref` | `[campaignRefId]` | Campaign donation lookup |
| `by_stripe_checkout_session` | `[stripeCheckoutSessionId]` | Webhook correlation |
| `by_stripe_payment_intent` | `[stripePaymentIntentId]` | Webhook correlation |
| `by_idempotency_key` | `[idempotencyKey]` | Duplicate prevention |
| `by_status` | `[status]` | Status-based queries |

**Relationships:** FK to `users`, `cases`, `campaigns`.

**Usage:** `donations.ts` (checkout session creation, webhook confirmations, history queries), `http.ts` (Stripe webhook handler), `activity.ts` (activity feed stories).

---

### 3. `achievements`

**Purpose:** Badge/gamification records. Each row represents one unlocked badge for a user.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → badge holder |
| `type` | badge union (20 types) | Yes | Badge identifier |
| `unlockedAt` | `number` | Yes | Unlock timestamp |
| `metadata` | `{ description?, awardedBy? }` | No | Optional context |

**Badge Types (20):**
- **Donation:** `first_donation`, `monthly_donor`, `helped_10`, `helped_50`, `helped_100`, `big_heart`, `early_supporter`, `community_hero`
- **Verification:** `verified_volunteer`, `verified_veterinarian`, `verified_groomer`, `verified_trainer`, `verified_business`, `verified_shelter`
- **Volunteer:** `top_transporter`, `foster_hero`, `rescue_champion`, `event_organizer`
- **Special:** `founding_member`, `ambassador`

**Indexes:** `by_user` [userId], `by_type` [type]

**Usage:** `achievements.ts` (query user badges with details from `ACHIEVEMENT_DETAILS` constant).

---

### 4. `paymentMethods`

**Purpose:** Saved payment method references for users. Currently placeholder — Stripe hosted checkout doesn't require stored methods.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → owner |
| `type` | `"card" \| "paypal" \| "bank"` | Yes | Method type |
| `name` | `string` | Yes | Display name (e.g., "Visa ending in 4242") |
| `lastFour` | `string` | No | Last 4 digits |
| `expiryMonth` | `number` | No | Expiry month |
| `expiryYear` | `number` | No | Expiry year |
| `isDefault` | `boolean` | Yes | Default method flag |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:** `by_user` [userId]

**Usage:** `paymentMethods.ts` (list, remove, set default — all ownership-checked).

---

### 5. `notifications`

**Purpose:** In-app notification records delivered to users.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → recipient |
| `type` | `"donation_received" \| "case_update" \| "achievement_unlocked" \| "campaign_ended" \| "system"` | Yes | Notification category |
| `title` | `string` | Yes | Notification title |
| `message` | `string` | Yes | Notification body |
| `caseId` | `Id<"cases">` | No | FK → related case |
| `read` | `boolean` | Yes | Read/unread state |
| `createdAt` | `number` | Yes | Delivery timestamp |

**Indexes:** `by_user` [userId], `by_user_unread` [userId, read]

**Usage:** `notifications.ts` (list, unread count, mark read, remove — all ownership-checked).

---

### 6. `userSettings`

**Purpose:** Per-user preferences for notifications, language, and currency.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → owner |
| `emailNotifications` | `boolean` | Yes | Email notification preference |
| `pushNotifications` | `boolean` | Yes | Push notification preference |
| `donationReminders` | `boolean` | Yes | Donation reminder preference |
| `marketingEmails` | `boolean` | Yes | Marketing email preference |
| `language` | `string` | Yes | Preferred locale (e.g., `"en"`, `"bg"`) |
| `currency` | `string` | Yes | Preferred currency (e.g., `"EUR"`) |

**Indexes:** `by_user` [userId]

**Usage:** `settings.ts` (upsert settings — auth required).

---

### 7. `translationRateLimits`

**Purpose:** Per-user daily rate limiting for on-demand machine translation of user-generated content.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clerkId` | `string` | Yes | Clerk user identifier |
| `day` | `number` | Yes | Day number (e.g., days since epoch) |
| `count` | `number` | Yes | Translations requested today |
| `updatedAt` | `number` | Yes | Last update timestamp |

**Indexes:** `by_clerk_day` [clerkId, day]

**Usage:** `translate.ts` (rate limit check before triggering DeepL translation).

---

### 8. `cases`

**Purpose:** The core platform object. Represents an animal rescue case with fundraising, lifecycle tracking, trust signals, structured updates, and translation support.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → case creator |
| `type` | `"critical" \| "urgent" \| "recovering" \| "adopted"` | Yes | Urgency classification |
| `category` | `"surgery" \| "shelter" \| "food" \| "medical" \| "rescue"` | Yes | Case category |
| `language` | `string` | No | ISO locale of original content |
| `title` | `string` | Yes | Case title |
| `description` | `string` | Yes | Case description |
| `story` | `string` | No | Extended story/narrative |
| `translations` | `Record<locale, TranslationPayload>` | No | Cached machine translations per locale |
| `translationStatus` | `Record<locale, StatusPayload>` | No | Per-locale translation status |
| `images` | `Id<"_storage">[]` | Yes | Array of storage file IDs |
| `location` | `{ city, neighborhood, coordinates? }` | Yes | Location with optional lat/lng |
| `clinicId` | `Id<"clinics">` | No | FK → treating clinic |
| `verificationStatus` | `"unverified" \| "community" \| "clinic"` | No | Trust ladder position |
| `foundAt` | `number` | Yes | When animal was found |
| `broughtToClinicAt` | `number` | No | When brought to clinic |
| `fundraising` | `{ goal, current, currency }` | Yes | Funding state |
| `status` | `"active" \| "funded" \| "closed"` | Yes | High-level status |
| `lifecycleStage` | `"active_treatment" \| "seeking_adoption" \| "closed_success" \| "closed_transferred" \| "closed_other"` | No | Detailed lifecycle position |
| `lifecycleUpdatedAt` | `number` | No | Last lifecycle transition |
| `closedAt` | `number` | No | Closure timestamp |
| `closedReason` | `"success" \| "transferred" \| "other"` | No | Why case was closed |
| `closedNotes` | `string` | No | Closure notes |
| `riskLevel` | `"low" \| "medium" \| "high"` | No | Trust risk assessment |
| `riskFlags` | `string[]` | No | Specific risk indicators |
| `updates` | `UpdateObject[]` | Yes | Embedded structured updates array |
| `createdAt` | `number` | Yes | Creation timestamp |

**Update Object Shape:**
```ts
{
  id?: string                    // Unique update identifier
  date: number                   // Update timestamp
  type?: "medical" | "milestone" | "update" | "success"
  text: string                   // Update content
  images?: Id<"_storage">[]      // Evidence photos
  evidenceType?: "bill" | "lab_result" | "clinic_photo" | "other"
  clinicId?: Id<"clinics">       // Attributing clinic
  clinicName?: string            // Clinic display name
  authorRole?: "owner" | "clinic" | "moderator"
}
```

**Translation Payload Shape:**
```ts
{
  title?: string
  description?: string
  story?: string
  translatedAt: number
  provider: string          // e.g., "deepl"
  sourceHash: string        // For cache invalidation
}
```

**Indexes:** `by_user` [userId], `by_type` [type], `by_status` [status], `by_lifecycle_stage` [lifecycleStage], `by_verification_status` [verificationStatus]

**Usage:** `cases.ts` (CRUD, lifecycle transitions, updates), `home.ts` (landing feed), `activity.ts` (story feed), `translate.ts` (translation pipeline).

---

### 9. `adoptions`

**Purpose:** Adoption listings separate from rescue cases. Different urgency, different flow.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → listing creator |
| `animalType` | `"dog" \| "cat" \| "other"` | Yes | Animal species |
| `name` | `string` | Yes | Animal name |
| `age` | `string` | Yes | Age description |
| `description` | `string` | Yes | Listing description |
| `images` | `Id<"_storage">[]` | Yes | Photos |
| `location` | `{ city, neighborhood }` | Yes | Location |
| `vaccinated` | `boolean` | Yes | Vaccination status |
| `neutered` | `boolean` | Yes | Neuter status |
| `status` | `"available" \| "pending" \| "adopted"` | Yes | Listing state |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:** `by_user` [userId], `by_status` [status]

**Usage:** `activity.ts` (adoption stories in activity feed).

---

### 10. `clinics`

**Purpose:** Veterinary clinic directory entries. Can be seeded (admin) or claimed (user).

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Clinic name |
| `city` | `string` | Yes | City |
| `address` | `string` | Yes | Street address |
| `phone` | `string` | Yes | Phone number |
| `is24h` | `boolean` | Yes | 24-hour availability |
| `specializations` | `string[]` | Yes | Medical specializations |
| `verified` | `boolean` | Yes | Admin verification flag |
| `image` | `string` | No | Cover image URL |
| `rating` | `number` | No | Average rating 0–5 |
| `reviewCount` | `number` | No | Number of reviews |
| `distance` | `string` | No | Computed distance (e.g., "0.8 km") |
| `featured` | `boolean` | No | Featured clinic flag |
| `ownerId` | `Id<"users">` | No | FK → claiming user |
| `claimedAt` | `number` | No | Claim approval timestamp |

**Indexes:** `by_city` [city], `by_owner` [ownerId], `by_verified` [verified], `by_featured` [featured]

**Usage:** `clinics.ts` (list, get, claim flow, admin review).

**Note:** See [petServices vs clinics overlap](#petservices-vs-clinics-overlap) section below.

---

### 11. `clinicClaims`

**Purpose:** Pending ownership claims on clinic directory entries.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clinicId` | `Id<"clinics">` | Yes | FK → clinic being claimed |
| `userId` | `Id<"users">` | Yes | FK → claimer |
| `status` | `"pending" \| "approved" \| "rejected"` | Yes | Claim state |
| `claimerRole` | `string` | Yes | Role at clinic ("Owner", "Manager", "Staff") |
| `claimerEmail` | `string` | Yes | Contact email |
| `claimerPhone` | `string` | No | Contact phone |
| `additionalInfo` | `string` | No | Supporting information |
| `reviewedBy` | `Id<"users">` | No | FK → reviewing admin |
| `reviewedAt` | `number` | No | Review timestamp |
| `rejectionReason` | `string` | No | Rejection reason |
| `createdAt` | `number` | Yes | Submission timestamp |

**Indexes:** `by_clinic` [clinicId], `by_user` [userId], `by_status` [status]

**Usage:** `clinics.ts` (submit claim, admin list pending, admin review/approve/reject with audit logging).

---

### 12. `petServices`

**Purpose:** Unified directory for all pet-related businesses and services. Superset of `clinics` — covers grooming, training, stores, shelters, hotels, pharmacies, and more.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Business name |
| `type` | `"clinic" \| "grooming" \| "training" \| "pet_store" \| "shelter" \| "pet_sitting" \| "pet_hotel" \| "pharmacy" \| "other"` | Yes | Service category |
| `city` | `string` | Yes | City |
| `address` | `string` | Yes | Street address |
| `coordinates` | `{ lat, lng }` | No | GPS coordinates |
| `phone` | `string` | Yes | Phone number |
| `email` | `string` | No | Contact email |
| `website` | `string` | No | Website URL |
| `description` | `string` | No | Business description |
| `services` | `string[]` | Yes | Specific services offered |
| `specializations` | `string[]` | No | Medical specializations (for clinics) |
| `is24h` | `boolean` | No | 24-hour availability |
| `hours` | `string` | No | Operating hours |
| `verified` | `boolean` | Yes | Verification status |
| `ownerId` | `Id<"users">` | No | FK → claiming user |
| `claimedAt` | `number` | No | Claim timestamp |
| `logo` | `string` | No | Logo URL |
| `photos` | `Id<"_storage">[]` | No | Photo gallery |
| `rating` | `number` | No | Average rating |
| `reviewCount` | `number` | No | Review count |
| `createdAt` | `number` | Yes | Creation timestamp |
| `updatedAt` | `number` | No | Last update timestamp |

**Indexes:** `by_type` [type], `by_city` [city], `by_verified` [verified], `by_owner` [ownerId]

**Usage:** `petServices.ts` (search for claim, register new service, submit claim).

---

### 13. `petServiceClaims`

**Purpose:** Pending ownership claims on pet service directory entries. Parallel structure to `clinicClaims`.

**Fields:** Same shape as `clinicClaims` but references `petServiceId: Id<"petServices">` instead of `clinicId`.

**Indexes:** `by_service` [petServiceId], `by_user` [userId], `by_status` [status]

**Usage:** `petServices.ts` (claim flow).

---

### 14. `campaigns`

**Purpose:** Fundraising campaigns. Two types: rescue campaigns (tied to cases) and initiative campaigns (platform missions like drone program, safehouse).

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Campaign title |
| `description` | `string` | Yes | Campaign description |
| `image` | `string` | No | Campaign image URL |
| `campaignType` | `"rescue" \| "initiative"` | No | Campaign classification |
| `initiativeKey` | `string` | No | Unique initiative identifier |
| `initiativeCategory` | `"drone" \| "safehouse" \| "platform" \| "other"` | No | Initiative classification |
| `featuredInitiative` | `boolean` | No | Featured on home feed |
| `goal` | `number` | Yes | Funding target |
| `current` | `number` | Yes | Current funding amount |
| `unit` | `string` | Yes | Unit of measure ("EUR", "meals", "surgeries", "homes") |
| `endDate` | `string` | No | ISO date string deadline |
| `status` | `"active" \| "completed" \| "cancelled"` | Yes | Campaign state |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:** `by_status` [status], `by_campaign_type` [campaignType], `by_featured_initiative` [featuredInitiative]

**Usage:** `campaigns.ts` (list, get, featured initiatives), `donations.ts` (campaign donation linkage).

---

### 15. `partners`

**Purpose:** Organizations that support Pawtreon through contributions, sponsorship, or partnership.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Partner name |
| `logo` | `string` | Yes | Logo URL |
| `type` | `"pet-shop" \| "food-brand" \| "veterinary" \| "sponsor"` | Yes | Partner category |
| `contribution` | `string` | Yes | What they contribute |
| `description` | `string` | Yes | Partner description |
| `website` | `string` | No | Website URL |
| `since` | `string` | Yes | Partnership start year |
| `animalsHelped` | `number` | Yes | Impact metric |
| `totalContributed` | `number` | Yes | Total contribution in EUR |
| `featured` | `boolean` | Yes | Featured partner flag |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:** `by_type` [type], `by_featured` [featured]

**Usage:** `partners.ts` (list, get, aggregate stats).

---

### 16. `volunteers`

**Purpose:** Extended volunteer profiles with bio, stats, and recognition. Links to the `users` table for identity.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → user identity |
| `bio` | `string` | Yes | Volunteer biography |
| `location` | `string` | Yes | City/area |
| `rating` | `number` | Yes | Rating 1–5 |
| `memberSince` | `string` | Yes | Membership year |
| `isTopVolunteer` | `boolean` | Yes | Recognition flag |
| `badges` | `string[]` | Yes | Earned badge names |
| `stats` | `object` | Yes | Activity metrics |

**Stats Object:**
```ts
{
  animalsHelped: number
  adoptions: number
  campaigns: number
  donationsReceived: number
  hoursVolunteered: number
}
```

**Indexes:** `by_user` [userId], `by_top` [isTopVolunteer]

**Usage:** `volunteers.ts` (list with user enrichment, get — no email exposed in public queries).

---

### 17. `communityPosts`

**Purpose:** Forum threads in the community system. Two boards: rescue (case-linked) and community (general discussion).

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → author |
| `title` | `string` | No | Optional thread title |
| `content` | `string` | Yes | Post body |
| `image` | `string` | No | Attached image URL |
| `caseId` | `Id<"cases">` | No | FK → linked case |
| `board` | `"rescue" \| "community"` | No | Board assignment |
| `category` | `"urgent_help" \| "case_update" \| "adoption" \| "advice" \| "general" \| "announcements"` | No | Thread category |
| `cityTag` | `string` | No | City filter tag |
| `lastActivityAt` | `number` | No | Bumped on new comments |
| `isLocked` | `boolean` | No | Admin-locked thread |
| `isDeleted` | `boolean` | No | Soft-deleted flag |
| `editedAt` | `number` | No | Last edit timestamp |
| `isPinned` | `boolean` | Yes | Pinned to top |
| `isRules` | `boolean` | Yes | Rules/sticky post |
| `likes` | `number` | Yes | Like count (denormalized) |
| `commentsCount` | `number` | Yes | Comment count (denormalized) |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:**

| Index | Fields | Purpose |
|-------|--------|---------|
| `by_user` | `[userId]` | User's posts |
| `by_created` | `[createdAt]` | Global chronological |
| `by_pinned` | `[isPinned]` | Pinned posts first |
| `by_board_created` | `[board, createdAt]` | Board feed (newest) |
| `by_board_activity` | `[board, lastActivityAt]` | Board feed (active) |
| `by_board_category` | `[board, category]` | Board + category filter |
| `by_board_city` | `[board, cityTag]` | Board + city filter |
| `by_deleted_created` | `[isDeleted, createdAt]` | Exclude soft-deleted posts |

**Usage:** `community.ts` (thread CRUD, locking, listing with pagination).

---

### 18. `communityComments`

**Purpose:** 2-level threaded comments on community posts. Top-level comments + one nested reply level.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `postId` | `Id<"communityPosts">` | Yes | FK → parent post |
| `authorId` | `Id<"users">` | Yes | FK → comment author |
| `parentCommentId` | `Id<"communityComments">` | No | FK → parent comment (for replies) |
| `content` | `string` | Yes | Comment text |
| `isDeleted` | `boolean` | Yes | Soft-deleted flag |
| `reactionCount` | `number` | Yes | Reaction count (denormalized) |
| `replyCount` | `number` | Yes | Reply count (denormalized) |
| `createdAt` | `number` | Yes | Creation timestamp |
| `editedAt` | `number` | No | Edit timestamp |

**Indexes:** `by_post_created` [postId, createdAt], `by_post_parent` [postId, parentCommentId], `by_parent` [parentCommentId], `by_author` [authorId]

**Usage:** `community.ts` (comment CRUD, threaded listing, soft delete).

---

### 19. `communityReactions`

**Purpose:** Upvote reactions on community posts and comments.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetType` | `"post" \| "comment"` | Yes | What is being reacted to |
| `targetId` | `string` | Yes | ID of target (stringified) |
| `userId` | `Id<"users">` | Yes | FK → reactor |
| `reactionType` | `"upvote"` | Yes | Reaction type (only upvote currently) |
| `createdAt` | `number` | Yes | Reaction timestamp |

**Indexes:** `by_target` [targetType, targetId], `by_user_target` [userId, targetType, targetId], `by_unique_reaction` [targetType, targetId, userId, reactionType]

**Usage:** `community.ts` (toggle reaction — idempotent via unique index check).

---

### 20. `communityReports`

**Purpose:** Moderation reports on community posts and comments.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetType` | `"post" \| "comment"` | Yes | What is being reported |
| `targetId` | `string` | Yes | ID of target |
| `reason` | `"spam" \| "harassment" \| "misinformation" \| "scam" \| "animal_welfare" \| "other"` | Yes | Report reason |
| `details` | `string` | No | Additional details |
| `reporterId` | `Id<"users">` | Yes | FK → reporter |
| `status` | `"open" \| "reviewing" \| "closed" \| "dismissed"` | Yes | Review state |
| `createdAt` | `number` | Yes | Report timestamp |
| `reviewedAt` | `number` | No | Review timestamp |
| `reviewedBy` | `Id<"users">` | No | FK → reviewing admin |
| `resolutionNotes` | `string` | No | Resolution details |

**Indexes:** `by_target` [targetType, targetId], `by_status` [status], `by_reporter` [reporterId], `by_reviewed_by` [reviewedBy]

**Usage:** `community.ts` (report submission with rate limiting).

---

### 21. `likes`

**Purpose:** Case likes/hearts from users.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → user |
| `caseId` | `Id<"cases">` | Yes | FK → case |
| `createdAt` | `number` | Yes | Like timestamp |

**Indexes:** `by_user` [userId], `by_case` [caseId], `by_user_case` [userId, caseId]

**Usage:** Activity feed queries, case engagement metrics.

---

### 22. `comments`

**Purpose:** Comments on rescue cases (distinct from community comments).

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → commenter |
| `caseId` | `Id<"cases">` | Yes | FK → case |
| `content` | `string` | Yes | Comment text |
| `parentId` | `Id<"comments">` | No | FK → parent (for replies) |
| `createdAt` | `number` | Yes | Comment timestamp |

**Indexes:** `by_user` [userId], `by_case` [caseId], `by_parent` [parentId], `by_case_created` [caseId, createdAt]

**Usage:** `social.ts` (add comment with max 1000 chars, paginated listing with user info).

---

### 23. `reports`

**Purpose:** Trust & safety reports on rescue cases. Supports authenticated and limited anonymous reporting.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `caseId` | `Id<"cases">` | Yes | FK → reported case |
| `reason` | `"suspected_scam" \| "duplicate_case" \| "incorrect_information" \| "animal_welfare" \| "other"` | Yes | Report reason |
| `details` | `string` | No | Additional details |
| `reporterId` | `Id<"users">` | No | FK → reporter (if authenticated) |
| `reporterClerkId` | `string` | No | Clerk ID fallback (for limited anonymous path) |
| `status` | `"open" \| "reviewing" \| "closed"` | Yes | Review state |
| `reviewedBy` | `Id<"users">` | No | FK → reviewing admin |
| `reviewedAt` | `number` | No | Review timestamp |
| `resolutionAction` | `"hide_case" \| "warn_user" \| "dismiss" \| "no_action"` | No | Action taken |
| `resolutionNotes` | `string` | No | Resolution details |
| `createdAt` | `number` | Yes | Report timestamp |

**Indexes:** `by_case` [caseId], `by_status` [status], `by_reporter` [reporterId], `by_reviewed_by` [reviewedBy]

**Usage:** `reports.ts` (create, admin queue listing, set reviewing, resolve with audit logging).

---

### 24. `auditLogs`

**Purpose:** Append-only audit trail for high-risk operations (moderation, money, lifecycle, verification, claims).

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `actorId` | `Id<"users">` | No | FK → user who performed action |
| `entityType` | `string` | Yes | Type of entity affected (e.g., "case", "report", "clinicClaim") |
| `entityId` | `string` | Yes | ID of affected entity |
| `action` | `string` | Yes | Action name (e.g., "lifecycle_transition", "report_resolved") |
| `details` | `string` | No | Human-readable description |
| `metadataJson` | `string` | No | JSON-serialized structured metadata |
| `createdAt` | `number` | Yes | Action timestamp |

**Indexes:** `by_entity` [entityType, entityId], `by_actor` [actorId], `by_created_at` [createdAt]

**Usage:** Written by `cases.ts` (lifecycle transitions, updates), `reports.ts` (resolutions), `clinics.ts` (claim reviews), `community.ts` (moderation actions).

---

### 25. `follows`

**Purpose:** Social follow relationships between users.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `followerId` | `Id<"users">` | Yes | FK → follower |
| `followingId` | `Id<"users">` | Yes | FK → user being followed |
| `createdAt` | `number` | Yes | Follow timestamp |

**Indexes:** `by_follower` [followerId], `by_following` [followingId], `by_follower_following` [followerId, followingId]

**Usage:** `social.ts` (toggle follow, check following status), `users.ts` (follower count in public profile).

---

### 26. `savedCases`

**Purpose:** User bookmarks/saves on rescue cases.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | FK → user |
| `caseId` | `Id<"cases">` | Yes | FK → case |
| `createdAt` | `number` | Yes | Save timestamp |

**Indexes:** `by_user` [userId], `by_user_case` [userId, caseId]

**Usage:** `users.ts` (get saved cases for current user).

---

### 27. `messages`

**Purpose:** 1:1 direct messages between users. Post-MVP feature — schema defined, implementation minimal.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `senderId` | `Id<"users">` | Yes | FK → sender |
| `receiverId` | `Id<"users">` | Yes | FK → receiver |
| `content` | `string` | Yes | Message text |
| `read` | `boolean` | Yes | Read status |
| `createdAt` | `number` | Yes | Send timestamp |

**Indexes:** `by_sender` [senderId], `by_receiver` [receiverId], `by_conversation` [senderId, receiverId]

**Usage:** No production functions yet. Schema only.

---

## Cross-Cutting Concerns

### petServices vs clinics Overlap

**Problem:** Both `clinics` and `petServices` store veterinary clinic data with overlapping shapes (name, city, address, phone, is24h, specializations, verified, ownerId, claimedAt). Both have parallel claim tables (`clinicClaims` / `petServiceClaims`).

**Current State:** Both tables co-exist. `clinics` was built first for the vet directory. `petServices` was added later as a broader unified directory that includes clinics as one type.

**Recommendation:** Keep both tables for now. The `clinics` table is tightly integrated with cases (`cases.clinicId`), case updates (`update.clinicId`), and clinic-specific verification flows. Merging would require migrating all case references and reworking the verification/claim flow. The `petServices` table serves a different product surface (pet services marketplace/directory). When the marketplace feature matures post-MVP, evaluate merging `clinics` into `petServices.type === "clinic"` with a migration.

**Decision:** Logged in `DECISIONS.md` — keep separate with clear domain boundaries.

### Gap Audit Resolution (from `docs/systems/data-model-gap-audit.md`)

| Gap | Status | Resolution |
|-----|--------|------------|
| Case lifecycle — explicit stage + closure metadata | **Resolved** | Added `lifecycleStage`, `lifecycleUpdatedAt`, `closedAt`, `closedReason`, `closedNotes` to `cases` |
| Case updates — typed + evidence + attribution | **Resolved** | Expanded update object with `type`, `evidenceType`, `clinicId`, `clinicName`, `authorRole` |
| Donations — Stripe IDs + idempotency + receipts | **Resolved** | Added `stripeCheckoutSessionId`, `stripePaymentIntentId`, `stripeChargeId`, `idempotencyKey`, `receiptId`, `receiptUrl` |
| Moderation — admin mutations + audit log | **Resolved** | Added `auditLogs` table, report resolution actions, admin review mutations |
| Campaigns — rescue vs initiative classification | **Resolved** | Added `campaignType`, `initiativeCategory`, `featuredInitiative` |
| Partner claims — SLA-driven review operations | **Partial** | Claim review exists but SLA dashboard not built yet |

### Schema Versioning

Convex handles schema migrations atomically:
- Schema changes are applied on `npx convex deploy`
- New required fields need backfill or defaults
- Removed fields are dropped
- No manual migration scripts needed
- **Constraint:** Adding a required field to an existing table requires either making it optional first or backfilling existing documents

### Index Strategy

All indexes follow Convex conventions:
- Single-field indexes for common lookups (e.g., `by_user`, `by_status`)
- Compound indexes for filtered queries (e.g., `by_board_created` for board + chronological ordering)
- Unique-like indexes for dedup (e.g., `by_user_case` on likes/savedCases, `by_unique_reaction` on community reactions)
- **No full-text search indexes** — text search is application-level

---

## Open Questions

1. **petServices type=clinic merge timeline** — When should clinics be absorbed into petServices? Blocked on marketplace maturity.
2. **Message threading** — Current `messages` table is flat (sender/receiver). Should it support group chats or threading? Deferred to messaging spec.
3. **Donation recurring support** — Schema doesn't yet support recurring/subscription donations. Will need Stripe subscription fields when implemented.
4. **Case image storage** — Cases use `Id<"_storage">[]` for images. No cleanup/orphan detection for deleted cases.
5. **Audit log retention** — No TTL or archival policy defined for `auditLogs`. Will grow unbounded.
