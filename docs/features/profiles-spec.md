# User Profiles & Capabilities Spec

> **Owner:** Product + OPUS
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** PROFILES

---

## Purpose

Profiles are the identity layer of Pawtreon. Every user has **one account** that can hold **multiple capabilities** — a single signup, multi-role model. A donor can also be a volunteer, a professional can also rescue animals, and an organization representative can also donate. The profile system surfaces trust signals (verification ladder, badges, impact stats), enables social connections (follow, public profile), and gates permissions (what you can do depends on your capabilities and verification level).

---

## User Stories

- As a **new user**, I want to sign up once and configure my capabilities later so that onboarding is fast and I'm not locked into a role.
- As a **rescuer**, I want my public profile to show my cases, impact stats, and verification level so donors trust me.
- As a **donor**, I want to see my donation history, animals helped, and badges so I feel connected to the impact.
- As a **volunteer**, I want to set my availability and capabilities so I can be found when help is needed nearby.
- As a **professional** (vet/groomer/trainer), I want to link my profile to my practice so my expertise is visible.
- As a **business** (clinic/store/shelter), I want to claim my organization and manage it from my profile.
- As a **viewer**, I want to see someone's public profile with their cases, badges, and follow them.
- As a **privacy-conscious user**, I want to control what's public — city only, no PII, opt-in visibility.

---

## Functional Requirements

The profile system MUST support a single-account, multi-capability model with privacy-safe public profiles and trust-linked verification signals.

### Profile Types

Pawtreon recognizes 8 conceptual profile types, mapped to a `userType` selection during onboarding and a `capabilities[]` array for fine-grained multi-role control.

| Profile Type | `userType` Value | Default Role | Description |
|---|---|---|---|
| **Finder / Good Samaritan** | `pet_lover` | `user` | Finds animals, needs quick help. May create their first case. |
| **Rescuer** | `pet_lover` / `volunteer` | `user` / `volunteer` | Creates cases, coordinates help, posts updates. Earns trust through activity. |
| **Donor** | any | any | Funds cases/campaigns, tracks impact. Capability is universal — any user can donate. |
| **Volunteer** | `volunteer` | `volunteer` | Transport, fostering, rescue ops, events, social media. Opt-in availability. |
| **Professional** | `professional` | `user` | Individual vet, groomer, trainer, pet sitter. Links to pet service directory. |
| **Business** | `business` | `user` → `clinic` (on claim) | Clinic, pet store, shelter, hotel. Claims organization. Role upgrades on approval. |
| **Sponsor / Brand** | `business` / `exploring` | `user` | Corporate giving, campaign matching. Managed via partner system (future). |
| **Admin / Moderator** | — | `admin` | Staff-assigned. Not selectable during onboarding. Full ops access. |

### Role Field

The `role` field on `users` has 4 values: `user` (default), `volunteer`, `clinic`, `admin`. This is the **authorization role** used for permission checks, separate from the display-level `userType`.

- `user` → standard permissions (create cases, donate, comment)
- `volunteer` → standard + volunteer directory visibility
- `clinic` → standard + case verification updates, clinic profile management
- `admin` → full access (moderation, claim review, seed operations)

Role is auto-mapped from `userType` during onboarding (`volunteer` → `volunteer`, `business` + approved claim → `clinic`). Manual role assignment is admin-only.

---

### Multi-Capability Model

### Capabilities Array

The `capabilities` field is an `optional(array(string))` on the `users` table. It stores the user's self-declared capabilities.

**Constraints:**
- Maximum 12 capabilities per user (enforced in `updateCapabilities` mutation)
- Deduplicated on write
- Empty array = no explicit capabilities (Donor is implicit for all users)

### Volunteer Capabilities

Defined in `convex/users.ts` as `VOLUNTEER_CAPABILITIES`:
- `transport` — Can transport animals between locations
- `fostering` — Can temporarily house animals
- `rescue` — Field rescue operations
- `events` — Organizes community events
- `social_media` — Social media advocacy
- `general` — General assistance

### Professional Types

Defined in `convex/users.ts` as `PROFESSIONAL_TYPES`:
- `veterinarian`
- `groomer`
- `trainer`
- `pet_sitter`
- `other`

### Capability Acquisition Flow

1. **Onboarding** — User selects `userType`, system sets initial capabilities:
   - `volunteer` → prompted for `volunteerCapabilities[]` + `volunteerCity`
   - `professional` → prompted for `professionalType` + `professionalSpecialties[]`
   - `business` → prompted for org claim branch
   - `pet_lover` / `exploring` → no specific capability prompts
2. **Profile settings** — User can add/remove capabilities at any time via `updateCapabilities` mutation
3. **Verification** — Some capabilities are enhanced by verification level (e.g., clinic-verified rescuer gets higher trust display)

---

### Verification Ladder

The `verificationLevel` field tracks the user's overall trust level. This is **separate** from per-case `verificationStatus`.

| Level | Meaning | How Acquired | What It Unlocks |
|---|---|---|---|
| `unverified` | Default | Account creation | Basic features: create cases (soft-gated donations), donate, comment, volunteer |
| `community` | Trusted community member | Multiple trusted members vouch / consistent positive activity | Higher trust display, reduced donation warnings on cases |
| `clinic` | Clinic-verified professional | Approved claim on a clinic + identity match | Can post clinic-verified updates on cases, manage clinic profile |
| `partner` | Official Pawtreon partner | Admin-granted after partnership agreement | Featured placement, partner badge, enhanced profile surfaces |

**Verification fields on `users`:**
- `verificationLevel` — current tier (`unverified` | `community` | `clinic` | `partner`)
- `verifiedAt` — timestamp of last verification event
- `verifiedBy` — `Id<"users">` of the admin/system that verified

**Rules (from RULES.md):**
- Verification status is displayed as a badge on profile and case cards
- Must include "What this means" explainer tooltip
- Never fake trust — badge must reflect real status

---

### Public Profile

### Data Contract (`getPublicProfile` query)

Returns for any user ID:
- `name`, `displayName`, `avatar`
- `bio` (≤280 chars)
- `role`, `userType`, `capabilities[]`
- `verificationLevel`
- `city` (city-level only — never precise coordinates)
- `isPublic` flag (gates visibility of detailed stats)
- `followerCount`, `followingCount`
- `achievements[]` (badges)
- `createdAt` (member since)

**Privacy gate:** If `isPublic` is false, detailed stats and activity are hidden. Core info (name, avatar, verification level, badges) remains visible.

### Profile Tabs

| Tab | Content | Data Source |
|---|---|---|
| **Cases** | User's rescue cases with images | `cases.listByUserWithImages` |
| **Donations** | Impact summary (if public) | `users.getProfileStats` |
| **Saved** | Bookmarked cases (own profile only) | `users.getSavedCases` |
| **Achievements** | Badge gallery | `achievements.getMyAchievements` |

### Profile Stats (`getProfileStats` query)

- Total donations made (count + amount)
- Total cases created
- Animals helped
- (Derived from `donations` and `cases` tables)

### Profile Edit

Via `updateProfile` mutation:
- `displayName` — max 50 characters
- `bio` — max 280 characters
- `isPublic` — boolean toggle

UI: `ProfileEditDrawer` component on Account and PublicProfile pages.

---

### Social Features

### Follow System

Table: `follows` (schema L664-L674)
- `followerId` → `Id<"users">`
- `followingId` → `Id<"users">`
- Unique constraint via `by_follower_following` index

**Functions:**
- `social.isFollowing` — check if current user follows target
- `social.toggleFollow` — follow/unfollow toggle
- Count derived from index scans

**UI:** `FollowButton` component on PublicProfile page.

### Achievements / Badges

Table: `achievements` (schema L106-L137)

**Badge Categories:**

| Category | Badges | Unlock |
|---|---|---|
| **Donation** | `first_donation`, `monthly_donor`, `helped_10`, `helped_50`, `helped_100`, `big_heart`, `early_supporter`, `community_hero` | Automatic (donation count/pattern triggers) |
| **Verification** | `verified_volunteer`, `verified_veterinarian`, `verified_groomer`, `verified_trainer`, `verified_business`, `verified_shelter` | Automatic on role verification approval |
| **Volunteer Activity** | `top_transporter`, `foster_hero`, `rescue_champion`, `event_organizer` | Manual (admin-awarded based on activity) |
| **Special** | `founding_member`, `ambassador` | Manual (admin-awarded) |

**Display surfaces:**
- Profile page — full badge gallery
- Case cards — verification badges only (trust signal)
- Achievement gallery page

**Award metadata:**
- `unlockedAt` — timestamp
- `metadata.description` — optional custom description
- `metadata.awardedBy` — `Id<"users">` for manual awards

---

### Privacy Defaults

From RULES.md — non-negotiable:

1. **No PII in public APIs** — `getPublicProfile` never returns email, phone, or precise coordinates
2. **Location safety** — City/neighborhood only; never precise home location
3. **Volunteer availability is opt-in** — Default `volunteerAvailability` is undefined (treated as `offline`)
4. **`isPublic` default** — New accounts default to public profile; user can toggle off
5. **Anonymous donations** — Donation `anonymous` flag hides donor identity from case owner and public

---

### Org Claim Branch

When a `business` user completes onboarding, they are routed to the organization claim flow:

1. **Clinic search** — User searches by name/city/address via `clinics.searchForClaim`
2. **Claim submission** — User submits claim with: `claimerRole`, `claimerEmail`, `claimerPhone`, `additionalInfo`
3. **Admin review** — Appears in admin claim review queue
4. **Approval** — On approval: clinic `ownerId` set, `verified=true`, user `role` upgraded to `clinic`
5. **Rejection** — Rejection reason provided, one appeal window (7 days)

Full claim flow details in `clinics-spec.md`.

---

## Non-Functional Requirements

1. Public profile queries MUST not expose PII (email/phone/precise location).
2. Profile and follow interactions SHOULD render within standard feed latency budgets (<500ms for common queries on MVP data scale).
3. Capability and verification mutations MUST be auditable and permission-scoped.
4. Profile surfaces MUST remain mobile-first and accessible (44x44 touch targets, visible focus rings, clear labels).

---

## Data Model

### `users` Table (schema L6-L75)

| Field | Type | Purpose |
|---|---|---|
| `clerkId` | `string` | Clerk auth provider ID |
| `name` | `string` | Display name from auth |
| `email` | `string` | Email (never exposed publicly) |
| `avatar` | `string?` | Profile image URL |
| `phone` | `string?` | Phone (never exposed publicly) |
| `role` | `"user" \| "volunteer" \| "clinic" \| "admin"` | Authorization role |
| `displayName` | `string?` | User-set display name (≤50 chars) |
| `bio` | `string?` | User bio (≤280 chars) |
| `isPublic` | `boolean?` | Profile visibility toggle |
| `onboardingCompleted` | `boolean?` | Onboarding completion flag |
| `onboardingCompletedAt` | `number?` | Completion timestamp |
| `userType` | enum | Onboarding selection (7 values) |
| `volunteerCapabilities` | `string[]?` | Volunteer capability list |
| `volunteerAvailability` | `"available" \| "busy" \| "offline"` | Opt-in status |
| `volunteerCity` | `string?` | Volunteer location |
| `professionalType` | enum | Professional specialization (5 values) |
| `professionalSpecialties` | `string[]?` | Detailed specialties |
| `linkedPetServiceId` | `Id<"petServices">?` | Link to pet service directory |
| `hasPets` | `boolean?` | Pet owner flag |
| `petTypes` | `string[]?` | Pet types owned |
| `city` | `string?` | User city (display-level) |
| `verifiedAt` | `number?` | Last verification timestamp |
| `verifiedBy` | `Id<"users">?` | Verifier reference |
| `capabilities` | `string[]?` | Multi-capability list (max 12) |
| `verificationLevel` | enum | Trust tier (4 values) |
| `productTourCompleted` | `boolean?` | Tour completion flag |
| `productTourCompletedAt` | `number?` | Tour completion timestamp |

**Indexes:** `by_clerk_id`, `by_onboarding`, `by_user_type`, `by_volunteer_availability`

### `volunteers` Table (schema L491-L509)

Separate volunteer profile with stats. **Open question:** redundancy with `users` volunteer fields — see below.

| Field | Type | Purpose |
|---|---|---|
| `userId` | `Id<"users">` | Linked user |
| `bio` | `string` | Volunteer bio |
| `location` | `string` | City |
| `rating` | `number` | 1-5 rating |
| `memberSince` | `string` | Year joined |
| `isTopVolunteer` | `boolean` | Featured volunteer flag |
| `badges` | `string[]` | Badge slugs |
| `stats` | object | `{ animalsHelped, adoptions, campaigns, donationsReceived, hoursVolunteered }` |

**Indexes:** `by_user`, `by_top`

---

## API Surface

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `users.me` | query | required | Current user profile |
| `users.getPublicProfile` | query | optional | Public profile by user ID |
| `users.getProfileStats` | query | optional | Donation + case stats |
| `users.getProfileByIdOrMe` | query | required | Combined profile + stats |
| `users.updateProfile` | mutation | required | Edit displayName, bio, isPublic |
| `users.updateCapabilities` | mutation | required | Set capabilities array |
| `users.completeOnboarding` | mutation | required | Multi-type onboarding handler |
| `users.completeProductTour` | mutation | required | Flag tour complete |
| `users.getSavedCases` | query | required | Bookmarked cases |
| `users.upsert` | internalMutation | internal | Clerk webhook sync |
| `social.isFollowing` | query | required | Check follow status |
| `social.toggleFollow` | mutation | required | Follow/unfollow |
| `achievements.getMyAchievements` | query | required | User's badges |

---

## UI Surfaces

| Page/Component | Route | Purpose |
|---|---|---|
| `Account.tsx` | `/account` | Own profile hub — stats, initiatives, menu |
| `PublicProfile.tsx` | `/profile/:id` | Public profile — tabs, follow, badges |
| `ProfileEditDrawer` | drawer | Edit name, bio, public toggle |
| `ProfileBadges` | component | Badge display grid |
| `ProfileCases` | component | User's case list |
| `FollowButton` | component | Follow/unfollow toggle |
| `OnboardingPage.tsx` | `/onboarding` | User type selection |
| `ClaimOrganizationPage.tsx` | `/onboarding/claim` | Org claim search + submit |

---

## Edge Cases & Abuse

1. **Display name abuse** — Max 50 chars, no HTML/script injection (Convex handles this)
2. **Bio spam** — Max 280 chars, report button on profile
3. **Capability hoarding** — Max 12 capabilities enforced server-side
4. **Fake verification** — `verificationLevel` is only set by approved claim workflow or admin; never self-assignable
5. **Follow spam** — Unique constraint on `by_follower_following` prevents duplicates; rate limiting recommended
6. **PII exposure** — `getPublicProfile` explicitly excludes email, phone; audit logged if pattern changes
7. **Ghost accounts** — Clerk webhook syncs user creation; accounts without Clerk ID cannot exist

---

## Acceptance Criteria

- [ ] `getPublicProfile` never returns `email`, `phone`, or precise coordinates — only city-level location.
- [ ] `updateProfile` enforces `displayName` ≤ 50 characters and `bio` ≤ 280 characters.
- [ ] `updateCapabilities` enforces a maximum of 12 capabilities per user and deduplicates entries.
- [ ] `verificationLevel` is only modifiable through the approved claim workflow or by admin action.
- [ ] Follow system enforces uniqueness via `by_follower_following` index; `toggleFollow` acts as follow/unfollow toggle.
- [ ] Profile tabs correctly render: Cases, Donations impact, Saved cases (own profile only), Achievements.
- [ ] Volunteer availability defaults to undefined (treated as `"offline"`) and is opt-in.
- [ ] Private profile (`isPublic: false`) hides detailed stats and activity from public viewers.

## Open Questions

1. **`volunteers` table redundancy** — The `volunteers` table stores bio, location, rating, stats, badges separately from the `users` table which has `volunteerCapabilities`, `volunteerAvailability`, `volunteerCity`. **Recommendation:** Consolidate into `users` table + computed stats queries, or treat `volunteers` as a denormalized "volunteer profile card" that's created on demand. Decision needed before volunteer directory ships.

2. **Product tour** — `productTourCompleted` / `productTourCompletedAt` fields exist on `users`, and `completeProductTour` mutation works, but no tour UI is actively wired. **Decision:** keep scaffolding for future use, remove from onboarding critical path.

---

## Appendix: User Settings (`convex/settings.ts`)

User preferences are managed via a separate `userSettings` table linked to the user record.

**Mutation:** `settings.update` — Upserts notification preferences (email, push, donation reminders, marketing opt-in), language, and currency.

**Defaults:** email/push/donation reminders ON, marketing OFF, language `"en"`, currency `"BGN"`.

**Note:** No query to read settings exists in `settings.ts` — settings are likely served via the users query or read client-side. Consider adding a `settings.get` query if settings grow in complexity.

3. **`linkedPetServiceId`** — Field exists to link professionals/businesses to the pet service directory, but `petServices` table has no CRUD functions yet. Depends on petServices vs clinics resolution (see `clinics-spec.md`).

4. **Follower count display** — Currently computed via index scans. At scale, may need denormalized counters. Acceptable for MVP.

5. **Profile image upload** — Currently uses Clerk avatar URL. Native avatar upload (via Convex storage) is not implemented. Decision: defer to post-MVP.
