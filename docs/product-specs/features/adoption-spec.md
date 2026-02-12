# Pet Adoption Spec

> **Owner:** Product
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** CASE OUTCOMES (adoption pathway)

## Purpose

Provide a dedicated surface for listing animals available for adoption — separate from rescue cases, which carry urgency and fundraising mechanics. Adoption listings serve animals that have completed treatment or were never in crisis, connecting them with potential adopters through a simple, low-friction browsing and discovery experience.

## User Stories

- As a **rescuer**, I want to create an adoption listing after a rescue case closes so the animal can find a permanent home.
- As a **shelter**, I want to list available animals for adoption independently of rescue cases so adopters can discover them.
- As an **adopter**, I want to browse adoption listings filtered by animal type and location so I can find a pet near me.
- As an **adopter**, I want to see an animal's vaccination/neuter status so I know their health readiness.
- As a **lister**, I want to update a listing's status (available → pending → adopted) to reflect the adoption lifecycle.

## Functional Requirements

1. **Adoption listing creation** — Authenticated user creates a listing with: animal type, name, age, description, photos, location (city + neighborhood), vaccination status, neutered status.
2. **Animal types** — `dog`, `cat`, `other`.
3. **Listing lifecycle** — Three statuses: `available` → `pending` → `adopted`. Lister can transition forward or backward. Adopted listings remain visible but clearly marked.
4. **Photo upload** — Array of storage IDs. At least one photo required. Max 10 photos per listing.
5. **Adoption listing page** — Individual detail page showing all listing data: photos, name, age, type, description, location, health status, lister info, creation date.
6. **Adoption browse/directory page** — Filterable list of available adoption listings. Filters: animal type, city. Sort: newest, nearest.
7. **Lister management** — Lister can edit listing details and update status. Ownership enforced.
8. **Separate from rescue cases** — Adoptions do not carry urgency levels, fundraising goals, or donation CTAs. They are discovery-only listings.

## Non-Functional Requirements

- **Privacy**: Lister's precise address is never shown. Location is city + neighborhood only.
- **Performance**: Browse page loads within 300ms for up to 200 listings per city.
- **Accessibility**: Photo carousel keyboard-navigable. All form inputs labeled. Status badges have accessible text.
- **i18n**: All labels and status values use i18n keys.

## Data Model

### `adoptions` table (schema.ts L305–L329)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | Lister's user ID |
| `animalType` | `union("dog", "cat", "other")` | Yes | Animal species |
| `name` | `string` | Yes | Animal's name |
| `age` | `string` | Yes | Approximate age (free text, e.g., "~2 years") |
| `description` | `string` | Yes | Description of the animal |
| `images` | `array(Id<"_storage">)` | Yes | Photo storage IDs |
| `location` | `object { city, neighborhood }` | Yes | Location (city + neighborhood strings) |
| `vaccinated` | `boolean` | Yes | Vaccination status |
| `neutered` | `boolean` | Yes | Neutered/spayed status |
| `status` | `union("available", "pending", "adopted")` | Yes | Listing lifecycle status |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:** `by_user` (userId), `by_status` (status)

## API Surface

### Existing

**No dedicated convex/adoptions.ts file exists.** The `activity.ts` file references adoptions only for feed aggregate purposes (`getRecentActivities` fetches recent adoptions with status "adopted").

### Needed

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `create` | mutation | Yes | Create adoption listing. Validates: at least 1 image, name ≤ 100 chars, description ≤ 2000 chars. Sets status to `available`. |
| `get` | query | No | Get single adoption listing by ID. Enriches with lister name/avatar. |
| `list` | query | No | List adoption listings. Filters: animalType, city, status (default: `available`). Sort: newest first. Pagination via cursor. |
| `listByUser` | query | Yes | List all adoption listings created by the current user (any status). For "my listings" management. |
| `update` | mutation | Yes (owner) | Update listing fields (name, age, description, location, vaccinated, neutered). Ownership check. |
| `updateStatus` | mutation | Yes (owner) | Transition listing status. Validates allowed transitions: available↔pending, pending→adopted, adopted→available (re-list). |
| `remove` | mutation | Yes (owner) | Soft-delete or hard-delete a listing. Ownership check. |

## UI Surfaces

### Existing

- **CreateAdoption page** (`src/pages/CreateAdoption.tsx`, 201 lines) — Route: `/create-adoption` (AuthGuard). Full form with: animal type picker (dog/cat/other), name, age, description, city, neighborhood, vaccinated/neutered toggles, photo upload. **Submit handler is a TODO** (`console.log` only — no Convex mutation wired).

### Needed

- **Adoption Browse page** — Route: `/adoptions`. Grid of adoption cards. Filters: animal type pills (All / Dogs / Cats / Other), city dropdown. Each card: primary photo, name, age, type badge, city, vaccination/neuter icons. Click navigates to detail page. Empty state: "No animals currently listed for adoption in this area."
- **Adoption Detail page** — Route: `/adoptions/:id`. Photo gallery, name, age, type, description, location (city + neighborhood), health badges (vaccinated ✓, neutered ✓), lister info (avatar + name, link to profile), creation date. Contact CTA: initially a "Message" button (links to messaging when messaging ships, or shows placeholder). No donate button — adoptions don't fundraise.
- **My Listings management** — Section within user account/settings. Lists all user's adoption listings with status indicators. Actions: edit, update status, delete.
- **Wire CreateAdoption.tsx** — Connect existing form to `adoptions.create` mutation. Show success → navigate to listing detail.

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Same animal listed multiple times | No automatic dedup. Community reports handle obvious duplicates. Consider future image similarity check. |
| Stale "available" listing (months without activity) | No auto-archival in v1. Future: notify lister after 90 days, suggest update or removal. |
| Fake adoption listings | Report flow (same mechanism as case reports). Admin can remove. |
| Listing with no photos | Blocked at creation — at least 1 photo required. |
| Very long description | Max 2000 characters enforced in mutation. |
| Status abuse (back-and-forth toggling) | Status transitions are unrestricted for now. Audit log recommended for future tracking. |

## Acceptance Criteria

- [ ] Adoption listing creation requires auth, at least 1 photo (max 10), name ≤ 100 chars, description ≤ 2000 chars, valid `animalType`.
- [ ] Listing lifecycle supports: `available ↔ pending`, `pending → adopted`, and `adopted → available` (re-list).
- [ ] `update` and `updateStatus` enforce ownership — only listing creator can modify.
- [ ] Adoption listings do not carry urgency levels, fundraising goals, or donation CTAs.
- [ ] Browse page filters by `animalType` and `city`, defaults to `status: "available"`, with cursor-based pagination.
- [ ] Lister’s precise address is never shown — location displays city + neighborhood only.
- [ ] Adopted listings remain visible in directory but clearly marked with adopted status badge.

## Open Questions

1. **Link to rescue cases** — Should the adoptions table have an optional `caseId: Id<"cases">` field to link adoption listings that originate from a closed rescue case? Cases with `lifecycleStage: "seeking_adoption"` have no bridge to the adoptions table today. Adding `caseId` would enable "adopted from this case" attribution and close the rescue → adoption loop. **→ Needs DECISIONS.md entry.**

2. **Who can create** — Currently any authenticated user can create adoption listings. Should this be restricted to specific roles (rescuer, shelter, clinic) or user types? PRD says "rescuer/shelter creates listing after case closed or independently."

3. **Inquiry/contact flow** — How does an interested adopter contact the lister? Options: (a) built-in messaging (post-MVP, see messaging-spec.md), (b) show lister's public contact info (conflicts with PII rule), (c) "Express Interest" button that creates a notification for the lister. **→ Needs decision before build.**

4. **Clinic integration** — Should clinics be able to verify adoption readiness (e.g., confirm vaccinations, health check)? This would add a trust signal similar to clinic-verified cases. Post-MVP but worth designing for.

5. **Discovery surface placement** — Where do adoption listings appear? Options: dedicated `/adoptions` tab, section on home feed (below rescue cases), tab within campaigns page, or separate nav entry. **→ Needs UX decision.**
