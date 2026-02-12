# Signup & Onboarding Spec

> **Owner:** Product + OPUS
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** AUTH

---

## Purpose

Onboarding is the bridge between "anonymous visitor" and "productive Pawtreon user." The system must be **fast and low-friction** (rescue situations don't wait for lengthy wizards) while still capturing enough context to personalize the experience. Users sign up once via Clerk, then optionally complete a lightweight onboarding wizard that sets their `userType`, capabilities, and preferences. Organization representatives get a dedicated claim branch. The entire flow can be skipped and configured later.

---

## User Stories

- As a **new user**, I want to sign up in seconds with my Google/Apple/email account so I can start browsing immediately.
- As a **volunteer**, I want to select my capabilities during onboarding so I'm visible in the volunteer directory.
- As a **clinic owner**, I want to claim my organization during onboarding so I can start verifying cases.
- As a **casual browser**, I want to skip onboarding entirely and configure my profile later.
- As a **returning user**, I want onboarding to remember I've completed it and never show again.
- As a **non-English speaker**, I want to select my language during onboarding so the app speaks my language.

---

## Functional Requirements

### Auth Provider: Clerk

| Feature | Implementation |
|---|---|
| **Email/password** | Standard Clerk signup |
| **Google OAuth** | Social login |
| **Apple OAuth** | Social login (iOS priority) |
| **Facebook OAuth** | Social login (rescue community migration) |
| **Session management** | Clerk handles tokens, refresh, session persistence |
| **User sync** | `/clerk-webhook` → `users.upsert` internal mutation |

### Clerk → Convex User Sync

On `user.created` or `user.updated` Clerk webhook events:
1. Webhook fires to `/clerk-webhook` endpoint
2. Svix signature verified
3. `users.upsert` internal mutation called with: `clerkId`, `name`, `email`, `avatar`
4. If user exists (by `clerkId`): update name, email, avatar
5. If new: insert user with `role: "user"`, `createdAt: Date.now()`

---

### Onboarding Wizard

**Route:** `/onboarding` (`OnboardingPage.tsx`)

#### Step 1: User Type Selection

User selects one of 5 onboarding personas:

| Card | `userType` Value | Description | Icon |
|---|---|---|---|
| **Pet Lover** | `pet_lover` | Pet owner, animal supporter | Heart/Paw |
| **Volunteer** | `volunteer` | Active volunteer for rescue operations | Hands |
| **Professional** | `professional` | Individual vet, groomer, trainer | Stethoscope |
| **Business** | `business` | Clinic, pet store, shelter, hotel | Building |
| **Just Exploring** | `exploring` | Browsing, not committed yet | Compass |

#### Step 2: Type-Specific Configuration

**Varies by `userType`:**

| User Type | Additional Prompts | Fields Set |
|---|---|---|
| `pet_lover` | Optional: city, pet types | `city`, `hasPets`, `petTypes` |
| `volunteer` | Capabilities selection, city | `volunteerCapabilities[]`, `volunteerCity`, `volunteerAvailability: "offline"` |
| `professional` | Professional type, specialties | `professionalType`, `professionalSpecialties[]` |
| `business` | → Redirect to claim flow | See org claim branch below |
| `exploring` | None — fast path | Minimal data |

#### Step 3: Completion

On submit, `users.completeOnboarding` mutation fires.

### `completeOnboarding` Mutation

The most complex onboarding handler. It:

1. **Finds or creates user** — Looks up by Clerk ID. If not found (edge case: webhook delay), auto-creates the user record.
2. **Sets user type** — `userType` to selected value
3. **Maps role** — Auto-maps `userType` to `role`:
   - `volunteer` → `role: "volunteer"`
   - All others → keeps existing `role` (default `"user"`)
4. **Sets type-specific fields:**
   - `volunteer`: `volunteerCapabilities`, `volunteerCity`
   - `professional`: `professionalType`, `professionalSpecialties`
   - `pet_lover`: `hasPets`, `petTypes`
   - All: `city` (if provided)
5. **Awards volunteer badge** — If `userType === "volunteer"`, awards `verified_volunteer` achievement
6. **Marks complete** — Sets `onboardingCompleted: true`, `onboardingCompletedAt: Date.now()`
7. **Redirects** — Client navigates to home feed (`/`)

### Org Claim Branch

When `userType === "business"`:

1. Onboarding redirects to `/onboarding/claim` (`ClaimOrganizationPage.tsx`)
2. User searches for their clinic by name/city/address
3. `clinics.searchForClaim` returns matches with `isClaimed` flag
4. User selects clinic and fills claim form:
   - `claimerRole` — Owner, Manager, Staff
   - `claimerEmail` — verification email
   - `claimerPhone` — optional phone
   - `additionalInfo` — proof text
5. `clinics.submitClaim` creates the claim
6. Claim enters admin review queue (see `clinics-spec.md`)
7. User continues onboarding with `business` type set
8. Claim resolution happens async — user notified later (needs notification implementation)

**UI Components on ClaimOrganizationPage:**
- Search input with typeahead
- Clinic result cards with claimed status indicator
- Claim form with Input, Label, Textarea, Badge components

---

### Skip Flow

Users can skip onboarding entirely:
- Skip button available on onboarding page
- Navigates directly to home feed
- `onboardingCompleted` remains `false`/undefined
- User can configure everything later via Account/Settings pages
- No features are gated by onboarding completion (any authenticated user can create cases, donate, etc.)

---

### First-Use Experience

After onboarding completes (or is skipped), the user lands on the home feed:

| State | Experience |
|---|---|
| **Completed onboarding** | Home feed with personalized content (future: based on userType) |
| **Skipped onboarding** | Same home feed — no blocking prompts |
| **Returning user** | Home feed — onboarding never shown again |

Currently, home feed is the same for all users. Personalization based on `userType` is a future enhancement.

---

### Product Tour

**Status: Scaffolding exists, not actively wired.**

Fields on `users`:
- `productTourCompleted: boolean?`
- `productTourCompletedAt: number?`

Mutation: `users.completeProductTour` — flags tour as complete.

**Decision needed:** Keep scaffolding for future guided tour (tooltip-based walkthrough of key features) or remove dead code. Recommendation: keep fields, build actual tour when onboarding analytics show users need guidance.

---

### Language Selection

| Mechanism | Details |
|---|---|
| **Auto-detection** | i18next detects browser language |
| **Manual override** | Language picker in settings |
| **Supported languages** | EN (default), BG (launch), UK, RU, DE |
| **Fallback chain** | Requested → EN |
| **Known issue** | ipapi.co language detection has CORS issues — browser detection used as fallback |

Language selection is **not** part of the onboarding wizard. Users change language in settings or via browser locale.

---

## Completion Tracking

| Field | Type | Purpose |
|---|---|---|
| `onboardingCompleted` | `boolean?` | Whether user finished onboarding |
| `onboardingCompletedAt` | `number?` | Completion timestamp |
| `userType` | enum(7) | Selected persona |
| `productTourCompleted` | `boolean?` | Whether user finished product tour |
| `productTourCompletedAt` | `number?` | Tour completion timestamp |

**Index:** `by_onboarding` on `users` table — for querying onboarding completion rates.

---

## Data Model

Onboarding writes to the `users` table. No separate onboarding table exists. All onboarding-related fields are on the user record (see `profiles-spec.md` for full `users` table documentation).

Key fields set during onboarding:
- `userType` — persona selection
- `role` — authorization role (auto-mapped)
- `volunteerCapabilities`, `volunteerCity`, `volunteerAvailability` — volunteer config
- `professionalType`, `professionalSpecialties` — professional config
- `hasPets`, `petTypes` — pet owner config
- `city` — location
- `onboardingCompleted`, `onboardingCompletedAt` — completion tracking

---

## API Surface

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `users.completeOnboarding` | mutation | required | Multi-type onboarding handler |
| `users.completeProductTour` | mutation | required | Flag tour as complete |
| `users.upsert` | internalMutation | internal | Clerk webhook user sync |
| `clinics.searchForClaim` | query | no | Search clinics for claim flow |
| `clinics.submitClaim` | mutation | required | Submit clinic claim |

---

## UI Surfaces

| Page/Component | Route | Purpose |
|---|---|---|
| `OnboardingPage.tsx` | `/onboarding` | User type selection + configuration |
| `ClaimOrganizationPage.tsx` | `/onboarding/claim` | Clinic search + claim submission |
| Settings page | `/settings` | Post-onboarding configuration |
| Account page | `/account` | Profile management |

---

## Edge Cases & Abuse

1. **Webhook delay** — User completes onboarding before Clerk webhook fires. `completeOnboarding` auto-creates user if not found by Clerk ID. Race condition is handled.
2. **Double onboarding** — User re-visits `/onboarding` after completion. UI should check `onboardingCompleted` and redirect to home. Server-side: `completeOnboarding` overwrites previous values (idempotent).
3. **Invalid userType** — Convex validates against the union type. Invalid values throw.
4. **Business without claim** — Business user can complete onboarding without claiming a clinic. They can claim later from their profile or settings.
5. **Multiple claims** — Duplicate guard prevents multiple pending claims per user per clinic. User can claim different clinics.
6. **Social signup name** — Clerk webhook extracts `first_name + last_name`. If empty, defaults to "User". User can update `displayName` later.

---

## Non-Functional Requirements

### Performance
- Onboarding should complete in < 5 seconds (single mutation)
- Clinic search should return results in < 500ms (small dataset for Bulgaria)

### Accessibility
- User type cards must have keyboard navigation + focus rings
- Claim form must have proper labels and error states
- Skip button must be clearly visible and accessible

### Mobile
- Touch targets ≥ 44x44px for type selection cards
- Claim form inputs must not trigger iOS zoom (`text-base` font size)
- Responsive layout for all onboarding steps

## Acceptance Criteria

- [ ] Clerk webhook `user.created`/`user.updated` events verify Svix signature; failed verification returns HTTP 400 and does not modify any user record.
- [ ] `completeOnboarding` accepts only 5 valid `userType` values and rejects any other.
- [ ] `userType: "volunteer"` sets `role: "volunteer"`, stores capabilities/city, and awards `verified_volunteer` achievement.
- [ ] `userType: "business"` redirects to claim flow at `/onboarding/claim` with duplicate guard enforcement.
- [ ] Webhook race condition handled: if no user exists for Clerk ID, `completeOnboarding` auto-creates the user record.
- [ ] Skipping onboarding navigates to home without blocking prompts and does not gate any features.
- [ ] Re-visiting `/onboarding` after completion redirects to home; `completeOnboarding` is idempotent.
- [ ] Clinic search for claim returns results with `isClaimed` flag; `submitClaim` prevents duplicate pending claims per user per clinic.

---

## EARS Requirements (Safety-Critical)

> EARS = Easy Approach to Requirements Syntax. These requirements use When/While/If/Shall patterns for unambiguous, testable auth/security rules.

| ID | Type | Requirement |
|----|------|-------------|
| O-01 | Event | **When** a Clerk webhook fires (`user.created` / `user.updated`), the system **shall** verify the Svix signature before processing. |
| O-02 | Guard | **If** Svix signature verification fails, the system **shall** return HTTP 400 and **shall not** create or modify any user record. |
| O-03 | Event | **When** `completeOnboarding` is called and no user exists for the Clerk ID, the system **shall** auto-create the user record (handles webhook race condition). |
| O-04 | Ubiquitous | The system **shall** require Clerk authentication for all onboarding mutations — no anonymous profile creation. |
| O-05 | Guard | **If** `userType` is not one of the 5 valid values (`pet_lover`, `volunteer`, `professional`, `business`, `exploring`), the system **shall** reject the mutation. |
| O-06 | Event | **When** a user selects `userType: volunteer`, the system **shall** set `role: volunteer` and award the `verified_volunteer` achievement. |
| O-07 | Guard | **If** a user has already completed onboarding (`onboardingCompleted: true`), the UI **shall** redirect to home — `completeOnboarding` remains idempotent (overwrites safely). |
| O-08 | Event | **When** a business user submits a clinic claim during onboarding, the system **shall** enforce the duplicate guard (no claim if clinic already has `ownerId`). |
| O-09 | Ubiquitous | The system **shall** sanitize all user-provided text fields (displayName, city, clinic additional info) to prevent XSS and injection. |

---

## Open Questions

1. **Onboarding analytics** — What percentage of users complete onboarding vs. skip? Need event tracking to measure funnel. Consider adding `onboarding_started`, `onboarding_type_selected`, `onboarding_completed`, `onboarding_skipped` events.

2. **Re-onboarding** — Can a user change their `userType` after onboarding? Currently they can update capabilities in profile settings, but not re-run the wizard. Decide if re-onboarding flow is needed.

3. **Product tour implementation** — Build tooltip-based guided tour or remove scaffolding? Recommendation: keep scaffolding, build when analytics show need.

4. **Claim notification** — Business users who submit claims get no notification when claim is resolved. Need: push/in-app notification on claim approval/rejection.

5. **Pet service claim** — Currently only clinic claims are supported in onboarding. If `petServices` gets CRUD functions, should the claim flow expand to cover pet stores, shelters, etc.?

6. **Progressive profiling** — Instead of one onboarding wizard, should we collect profile data gradually (e.g., prompt for location when first creating a case, prompt for capabilities when first trying to volunteer)? Consider for post-MVP UX optimization.
