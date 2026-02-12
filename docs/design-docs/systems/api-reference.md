# API Reference

> **Owner:** Backend engineering  
> **Status:** final  
> **Last updated:** 2026-02-12

## Purpose

Complete reference for Pawtreon's Convex API surface. Documents queries, mutations, actions, and HTTP endpoints across the Convex function files. This spec describes the current callable API — what functions exist, what they accept, what they return, and what authorization they require.

---

## Conventions

### Naming (from DESIGN.md)
- **Queries:** `get*`, `list*` — read-only, reactive, no side effects
- **Mutations:** `create*`, `update*`, `delete*` — write operations, transactional
- **Actions:** Side-effect-capable (HTTP calls, Stripe, DeepL) — can call mutations/queries internally
- **Internal:** `internalMutation`, `internalQuery`, `internalAction` — not callable from client SDK

### Auth Levels
| Level | Description |
|-------|-------------|
| **None** | Public — guest-accessible |
| **Optional** | Works for guests and users — returns enriched data if authenticated |
| **Required** | Must be authenticated — throws "Not authenticated" otherwise |
| **Admin** | Must be authenticated with `role: "admin"` — throws "Admin access required" |
| **Internal** | Server-only — not callable from client SDK |

### Rate Limiting
Rate limits are enforced in-function using sliding window checks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `community.createThread` | 3 | 15 minutes |
| `community.createComment` | 15 | 5 minutes |
| `community.reportContent` | 6 | 10 minutes |
| `translate.requestCaseTranslations` | Configurable daily quota (default 20) | 24 hours |

---

## `convex/cases.ts` — Animal Rescue Cases

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | None | List cases with optional `type` and `status` filters |
| `get` | query | None | Get single case by `id` |
| `listUiForLocale` | query | None | UI-friendly list with translations resolved for `locale`, image URLs generated |
| `getUiForLocale` | query | Optional | UI-friendly case detail with translations, images, and `canManageCase` flag if authenticated |
| `listByUser` | query | None | List all cases by `userId` |
| `listByUserWithImages` | query | None | Cases by `userId` with first image URL resolved (for profile cards) |
| `create` | mutation | Required | Create a new rescue case with type, category, title, description, images, location, fundraising goal |
| `addUpdate` | mutation | Required | Add structured update to case. Permission-checked: owner, clinic (if linked), or admin only. Creates audit log entry |
| `updateLifecycleStage` | mutation | Required | Transition case lifecycle stage. Permission-checked: owner, clinic, or admin. Creates audit log entry |

### `list`
```
Args: { type?: CaseType, status?: CaseStatus }
Returns: Doc<"cases">[]
```

### `get`
```
Args: { id: Id<"cases"> }
Returns: Doc<"cases"> | null
```

### `listUiForLocale`
```
Args: { locale: string, type?: CaseType, status?: CaseStatus }
Returns: Array<{
  ...case fields,
  firstImageUrl: string | null,
  displayTitle: string,
  displayDescription: string,
  displayStory: string | null,
  translationStatus: TranslationStatus | null
}>
```

### `getUiForLocale`
```
Args: { id: Id<"cases">, locale: string }
Returns: {
  ...case fields,
  imageUrls: string[],
  displayTitle/Description/Story: string,
  canManageCase: boolean,
  creatorName: string,
  creatorAvatar: string | null
} | null
```

### `create`
```
Args: {
  type: CaseType,
  category: CaseCategory,
  language?: string,
  title: string,
  description: string,
  story?: string,
  images: Id<"_storage">[],
  location: { city: string, neighborhood: string, coordinates?: { lat, lng } },
  fundraisingGoal: number,
  fundraisingCurrency: string,
  clinicId?: Id<"clinics">,
  foundAt: number,
  broughtToClinicAt?: number
}
Returns: Id<"cases">
```

### `addUpdate`
```
Args: {
  caseId: Id<"cases">,
  text: string,
  type?: "medical" | "milestone" | "update" | "success",
  images?: Id<"_storage">[],
  evidenceType?: "bill" | "lab_result" | "clinic_photo" | "other",
  clinicId?: Id<"clinics">,
  clinicName?: string,
  authorRole?: "owner" | "clinic" | "moderator"
}
Returns: void
Errors: "Not authorized to update this case" if not owner/clinic/admin
```

### `updateLifecycleStage`
```
Args: {
  caseId: Id<"cases">,
  stage: LifecycleStage,
  notes?: string
}
Returns: void
Errors: "Not authorized to update this case" if not owner/clinic/admin
```

---

## `convex/donations.ts` — Donations & Payments

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getMyDonations` | query | Required | All donations for current user with case title/image enrichment |
| `getMyStats` | query | Required | Aggregated stats: totalDonations, totalAmount, animalsHelped |
| `create` | mutation | Required | Legacy/preview donation creation (manual provider) |
| `createCheckoutSession` | mutation | Required | Create Stripe hosted checkout session — returns `checkoutUrl` |
| `confirmPaymentFromWebhook` | internalMutation | Internal | Confirm donation from `payment_intent.succeeded` webhook |
| `confirmCheckoutSessionFromWebhook` | internalMutation | Internal | Confirm donation from `checkout.session.completed` webhook |
| `markPaymentFailedFromWebhook` | internalMutation | Internal | Mark donation failed from `payment_intent.payment_failed` webhook |
| `confirmPreviewDonation` | mutation | Required | Dev/preview confirmation when Stripe is not configured |

### `createCheckoutSession`
```
Args: {
  caseId?: Id<"cases">,
  campaignRefId?: Id<"campaigns">,
  amount: number,
  currency: string,
  message?: string,
  anonymous: boolean,
  successUrl: string,
  cancelUrl: string
}
Returns: { mode: "stripe" | "preview", donationId: Id<"donations">, checkoutUrl: string | null }
Errors: Validation errors (amount/URLs/case gating). Preview mode is returned when Stripe secret is not configured.
Side effects: Creates pending donation record; creates Stripe Checkout Session when in Stripe mode
```

### `confirmPaymentFromWebhook`
```
Args: {
  paymentIntentId: string,
  chargeId?: string,
  receiptUrl?: string,
  amountReceivedMinor?: number,
  currency?: string,
  eventId?: string
}
Returns: { ok: boolean, reason: string }
Side effects: Updates donation status to "completed", sets completedAt, updates case fundraising.current
```

---

## `convex/subscriptions.ts` — Recurring Subscriptions

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | Required | List subscriptions for current user with target enrichment |
| `create` | mutation | Required | Create subscription checkout (Stripe Checkout `mode: "subscription"` or preview) |
| `cancel` | mutation | Required | Cancel a subscription (ownership-checked; cancels in Stripe when configured) |
| `confirmCheckoutSessionFromWebhook` | internalMutation | Internal | Confirm subscription from `checkout.session.completed` (subscription mode) |
| `syncStatusFromWebhook` | internalMutation | Internal | Sync status from `customer.subscription.updated/deleted` webhooks |
| `ensureRecurringDonationFromInvoice` | internalMutation | Internal | Materialize `invoice.paid` as a completed recurring donation row |

### `create`
```
Args: {
  targetType: "case" | "user",
  targetId: string,
  amount: number,
  currency: string,
  interval?: "month" | "year",
  successUrl: string,
  cancelUrl: string
}
Returns: { mode: "stripe" | "preview", subscriptionId: Id<"subscriptions">, checkoutUrl: string | null }
Side effects: Creates pending subscription record; creates Stripe Checkout Session when in Stripe mode
```

---

## `convex/users.ts` — User Profiles & Identity

**Exported Constants:**
- `VOLUNTEER_CAPABILITIES` — `["transport", "fostering", "rescue", "events", "social_media", "general"]`
- `PROFESSIONAL_TYPES` — `["veterinarian", "groomer", "trainer", "pet_sitter", "other"]`

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `upsert` | internalMutation | Internal | Create or update user from Clerk webhook data |
| `me` | query | Required | Get current authenticated user profile |
| `completeOnboarding` | mutation | Required | Complete post-signup wizard with userType, capabilities, location, etc. |
| `completeProductTour` | mutation | Required | Mark product tour as completed |
| `getPublicProfile` | query | Optional | Public profile with followers count, achievements, badges |
| `getProfileStats` | query | None | Donation and case stats for a given userId |
| `updateProfile` | mutation | Required | Update displayName, bio, isPublic |
| `updateCapabilities` | mutation | Required | Update multi-capability profile (capabilities array + volunteerCapabilities) |
| `getProfileByIdOrMe` | query | Optional | Profile by document ID or literal `"me"` with full stats enrichment |
| `getSavedCases` | query | Required | Get bookmarked/saved cases for current user with case data |

### `upsert`
```
Args: { clerkId: string, name: string, email: string, avatar?: string }
Returns: void
Side effects: Creates user if not exists, updates name/email/avatar if exists
```

### `completeOnboarding`
```
Args: {
  userType: UserType,
  capabilities?: string[],
  volunteerCapabilities?: string[],
  volunteerCity?: string,
  professionalType?: ProfessionalType,
  professionalSpecialties?: string[],
  hasPets?: boolean,
  petTypes?: string[],
  city?: string
}
Returns: void
```

---

## `convex/clinics.ts` — Clinic Directory

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | None | List clinics with optional `city` and `is24h` filters |
| `get` | query | None | Get single clinic by `id` |
| `searchForClaim` | query | None | Search clinics by name substring for claim flow |
| `submitClaim` | mutation | Required | Submit ownership claim (with duplicate guard — rejects if already claimed or pending claim exists) |
| `listPendingClaims` | query | Admin | List pending clinic claims for admin review queue |
| `reviewClaim` | mutation | Admin | Approve or reject a claim. On approve: sets clinic `ownerId`/`claimedAt`. Creates audit log entry |

### `submitClaim`
```
Args: {
  clinicId: Id<"clinics">,
  claimerRole: string,
  claimerEmail: string,
  claimerPhone?: string,
  additionalInfo?: string
}
Returns: Id<"clinicClaims">
Errors: "This clinic has already been claimed" | "You already have a pending claim"
```

### `reviewClaim`
```
Args: {
  claimId: Id<"clinicClaims">,
  decision: "approved" | "rejected",
  rejectionReason?: string
}
Returns: void
Side effects: Updates clinic ownership on approval, creates audit log entry
```

---

## `convex/campaigns.ts` — Fundraising Campaigns

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | None | List campaigns with optional `status` and `campaignType` filters |
| `get` | query | None | Get single campaign by `id` |
| `getFeaturedInitiatives` | query | None | Get active initiative campaigns where `featuredInitiative` is true |

---

## `convex/community.ts` — Community Forum

### Current API (Forum System)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `listThreads` | query | Optional | Full forum query: board, category, city, sort (newest/active), search, cursor pagination |
| `getThread` | query | Optional | Get single thread with author info |
| `createThread` | mutation | Required | Create forum thread. **Rate limited: 3 per 15 min**. Auto-sets board, category, lastActivityAt |
| `lockThread` | mutation | Admin | Lock/unlock a thread. Creates audit log entry |
| `listComments` | query | Optional | Threaded comments for a post (2-level: top-level + replies). Includes user reaction state |
| `createComment` | mutation | Required | Create comment or reply. **Rate limited: 15 per 5 min**. Updates parent reply count and post comment count |
| `deleteComment` | mutation | Required | Soft-delete comment. Owner or admin only |
| `toggleReaction` | mutation | Required | Toggle upvote on post or comment. Updates denormalized reaction/like counts |
| `reportContent` | mutation | Required | Report post or comment. **Rate limited: 6 per 10 min**. Creates `communityReports` record |

### Legacy API (Backward-Compatible)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | Optional | List community posts (legacy format) |
| `get` | query | Optional | Get single post (legacy format) |
| `create` | mutation | Required | Create post (legacy format) |
| `like` | mutation | Required | Toggle like on post (legacy format) |

> **Note:** Legacy functions maintain backward compatibility with older UI components. They should be migrated to the forum API (`listThreads`, `getThread`, `createThread`, etc.) and then removed.

### `listThreads`
```
Args: {
  board?: "rescue" | "community",
  category?: PostCategory,
  cityTag?: string,
  sort?: "newest" | "active",
  search?: string,
  cursor?: string,
  limit?: number
}
Returns: {
  threads: Array<{ ...post, author: { name, avatar, role }, userReaction?: "upvote" }>,
  nextCursor: string | null,
  hasMore: boolean
}
```

### `createThread`
```
Args: {
  title?: string,
  content: string,
  image?: string,
  caseId?: Id<"cases">,
  board?: "rescue" | "community",
  category?: PostCategory,
  cityTag?: string
}
Returns: Id<"communityPosts">
Errors: Rate limit exceeded (3 threads per 15 minutes)
```

---

## `convex/volunteers.ts` — Volunteer Directory

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | None | List all volunteers (optional `topOnly` filter). Enriched with user name, avatar, role. **No email exposed** |
| `get` | query | None | Get single volunteer by `id` with user enrichment. **No email exposed** |
| `listDirectory` | query | None | Directory query with filters (city/capability/availability). Excludes offline by default |
| `listTransportMatches` | query | None | Return available transport-capable volunteers for a case's city |
| `create` | mutation | Required | Create volunteer profile for current user (idempotent) |
| `update` | mutation | Required (owner) | Update volunteer bio/location (ownership-checked) |
| `updateAvailability` | mutation | Required (owner) | Update volunteer availability (available/busy/offline) |
| `updateCapabilities` | mutation | Required (owner) | Update volunteer capabilities list |
| `createTransportRequest` | mutation | Required | Create a transport request and notify matching volunteers |
| `setTopVolunteer` | internalMutation | Admin | Set/unset `isTopVolunteer` for a volunteer |
| `incrementStats` | internalMutation | Internal | Increment volunteer stats counters |

---

## `convex/reports.ts` — Case Moderation

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getCasePendingReportStatus` | query | Admin | Check if a case has pending/reviewing reports |
| `listPending` | query | Admin | List open + reviewing reports for moderation queue. Enriched with case and reporter info |
| `setReviewing` | mutation | Admin | Mark a report status as "reviewing" |
| `resolve` | mutation | Admin | Resolve report with action (`hide_case`, `warn_user`, `dismiss`, `no_action`). Creates audit log entry |
| `create` | mutation | Required | Submit a report (auth required). Enforces a per-identity daily quota |

### `resolve`
```
Args: {
  reportId: Id<"reports">,
  resolutionAction: "hide_case" | "warn_user" | "dismiss" | "no_action",
  resolutionNotes?: string
}
Returns: void
Side effects: Updates report status to "closed", creates audit log entry
```

---

## `convex/notifications.ts` — Notifications

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getMyNotifications` | query | Required | All notifications for current user, ordered by creation time |
| `getUnreadCount` | query | Required | Count of unread notifications |
| `markAsRead` | mutation | Required | Mark single notification as read. Ownership-checked |
| `markAllAsRead` | mutation | Required | Mark all user's notifications as read |
| `remove` | mutation | Required | Delete a notification. Ownership-checked |

---

## `convex/achievements.ts` — Badges

**Exported Constant:** `ACHIEVEMENT_DETAILS` — Map of 20 badge types to `{ title, description, icon }`.

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getMyAchievements` | query | Required | All achievements for current user with display details from `ACHIEVEMENT_DETAILS` |

---

## `convex/activity.ts` — Activity Feed

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getRecentActivities` | query | None | Combined activity feed: recent donations + cases + adoptions, formatted as story objects |
| `getUserStories` | query | None | Activity stories for a specific user by `userId` |
| `getCaseStories` | query | None | Activity stories for a specific case by `caseId` |
| `getSystemStories` | query | None | Placeholder/welcome stories for empty states |

---

## `convex/home.ts` — Landing Page

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getLandingFeed` | query | Optional | Server-driven landing page data: hero case, story circles, city case counts, paginated cases, featured initiative, unread counts |
| `getUnreadCounts` | query | Optional | Notification + community unread counts for nav badges |

### `getLandingFeed`
```
Args: {
  locale?: string,
  type?: CaseType,
  city?: string,
  cursor?: string,
  limit?: number
}
Returns: {
  heroCase: Case | null,
  stories: StoryCircle[],
  cityCounts: Record<string, number>,
  cases: Case[],
  nextCursor: string | null,
  hasMore: boolean,
  featuredInitiative: Campaign | null,
  unreadCounts: { notifications: number, community: number }
}
```

---

## `convex/social.ts` — Case Social Features

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `addComment` | mutation | Required | Add comment to case. Max 1000 chars. Optional `parentId` for replies (validates parent exists and belongs to same case) |
| `getComments` | query | None | Paginated case comments with user info (name, avatar). Ordered by creation time |
| `toggleFollow` | mutation | Required | Follow/unfollow a user. Prevents self-follow |
| `isFollowing` | query | Required | Check if current user follows a given `userId` |

---

## `convex/storage.ts` — File Uploads

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `generateUploadUrl` | mutation | Required | Generate a Convex storage upload URL for file uploads |

---

## `convex/translate.ts` — Machine Translation

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getCaseForTranslation` | internalQuery | Internal | Get case document for translation pipeline |
| `setCaseTranslationStatus` | internalMutation | Internal | Update per-locale translation status (pending/done/error) |
| `saveCaseTranslation` | internalMutation | Internal | Save translated fields with provider info and source hash |
| `translateCase` | internalAction | Internal | Full DeepL translation pipeline — translates title, description, story for target locale |
| `requestCaseTranslations` | mutation | Required | Trigger translations for all/specified locales. **Rate limited** via `translationRateLimits` table (daily quota per user, configurable via `TRANSLATION_RATE_LIMIT` env var, default 20) |

### `requestCaseTranslations`
```
Args: {
  caseId: Id<"cases">,
  targetLocales?: string[]
}
Returns: { requested: string[], skipped: string[] }
Errors: "Translation rate limit exceeded" if daily quota reached
Side effects: Schedules translateCase internal actions for each locale
```

---

## `convex/partners.ts` — Partner Directory

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | None | List partners with optional `type` and `featured` filters |
| `get` | query | None | Get single partner by `id` |
| `getStats` | query | None | Aggregate partner stats: total partners, total animals helped, total contributed |

---

## `convex/paymentMethods.ts` — Saved Payment Methods

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getMyPaymentMethods` | query | Optional | List saved payment methods for current user (returns empty array when unauthenticated) |
| `remove` | mutation | Required | Remove a payment method. Ownership-checked |
| `setDefault` | mutation | Required | Set a payment method as default. Ownership-checked. Unsets previous default |

---

## `convex/petServices.ts` — Pet Services Directory

**Exported Constant:** `SERVICE_TYPES` — List of all pet service type values.

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `searchForClaim` | query | None | Search pet services by name substring with optional `type` filter |
| `register` | mutation | Required | Register new pet service. Auto-claims for the user and links via `linkedPetServiceId` on user record |
| `submitClaim` | mutation | Required | Submit ownership claim for existing pet service (with duplicate guard) |

---

## `convex/settings.ts` — User Settings

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `update` | mutation | Required | Upsert user settings (notification prefs, language, currency). Creates new record or updates existing |

---

## `convex/devSeed.ts` — Development Seed Data

**Status:** Empty placeholder (`export {};`). Seed endpoints were removed during refactor cleanup. The `scripts/seed.mjs` script depends on this file but is currently non-functional.

---

## `convex/http.ts` — HTTP Endpoints

### `POST /stripe-webhook`
- **Authentication:** Stripe signature verification (`stripe.webhooks.constructEvent`)
- **Handled events:**
  - `payment_intent.succeeded` → calls `internal.donations.confirmPaymentFromWebhook`
  - `payment_intent.payment_failed` → calls `internal.donations.markPaymentFailedFromWebhook`
  - `checkout.session.completed` → calls:
    - `internal.donations.confirmCheckoutSessionFromWebhook` (one-time checkout, `mode: "payment"`)
    - `internal.subscriptions.confirmCheckoutSessionFromWebhook` (recurring checkout, `mode: "subscription"`)
  - `invoice.paid` → calls `internal.subscriptions.ensureRecurringDonationFromInvoice`
  - `customer.subscription.updated` → calls `internal.subscriptions.syncStatusFromWebhook`
  - `customer.subscription.deleted` → calls `internal.subscriptions.syncStatusFromWebhook`
- **Required env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Error responses:** 500 (missing config), 400 (missing/invalid signature), 200 (success)

### `POST /clerk-webhook`
- **Authentication:** Svix signature verification (`new Webhook(secret).verify(...)`)
- **Handled events:**
  - `user.created` → calls `internal.users.upsert`
  - `user.updated` → calls `internal.users.upsert`
  - `user.deleted` → logged only (no deletion implemented)
- **Required env vars:** `CLERK_WEBHOOK_SECRET`
- **Error responses:** 500 (missing config), 400 (missing/invalid headers), 200 (success)

---

## `convex/lib/auth.ts` — Auth Helpers

These are internal utility functions, not part of the API surface, but used by most functions.

| Function | Signature | Description |
|----------|-----------|-------------|
| `requireUser` | `(ctx: QueryCtx \| MutationCtx) → Promise<Doc<"users">>` | Require auth + return user doc. Throws "Not authenticated" or "User not found" |
| `requireAdmin` | `(ctx: QueryCtx \| MutationCtx) → Promise<Doc<"users">>` | Require auth + admin role. Throws "Admin access required" |
| `optionalUser` | `(ctx: QueryCtx \| MutationCtx) → Promise<Doc<"users"> \| null>` | Return user if authenticated, null otherwise |
| `assertOwnership` | `(user, resourceUserId, resourceName?) → void` | Verify user owns resource. Throws "You don't have permission" |

---

## API Summary

### By Auth Level

| Auth Level | Examples |
|------------|----------|
| **None (public)** | Most `list`/`get` queries across cases, clinics, campaigns, partners, volunteers, activity, comments |
| **Optional** | `cases.getUiForLocale`, `home.getLandingFeed`, `community.listThreads/getThread/listComments`, `users.getPublicProfile/getProfileByIdOrMe`, `paymentMethods.getMyPaymentMethods` |
| **Required** | All user mutations (create/update/toggle/submit), including `reports.create`, `donations.createCheckoutSession`, `subscriptions.create/cancel` |
| **Admin** | `clinics.listPendingClaims/reviewClaim`, `reports.listPending/setReviewing/resolve`, `community.lockThread`, `volunteers.setTopVolunteer` |
| **Internal** | Webhook handlers and background actions: `users.upsert`, `donations.*FromWebhook`, `subscriptions.*FromWebhook`, `translate.*` |

### Notes

- For the full list, use `convex/_generated/api` (code) and the per-file sections above.

---

## Open Questions

1. **Legacy community API removal timeline** — 4 legacy functions in `community.ts` need migration path and deprecation schedule.
2. **User deletion** — Clerk `user.deleted` webhook is logged but not acted on. Need soft-delete or anonymization implementation.
3. **Donation refund API** — No refund mutation exists. Currently manual via Stripe dashboard.
4. **Achievement awarding** — No public or internal mutation for awarding badges. Only query exists. Need award/revoke mutations.
5. **Adoption CRUD** — Adoption table exists but no dedicated query/mutation file. Activity feed reads directly from table.
6. **Missing admin mutations** — No admin CRUD for campaigns, partners, clinics (seeding). Currently seed-only.
