# Volunteer System Spec

> **Owner:** Product
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** VOLUNTEER: AVAILABILITY, VOLUNTEER: DIRECTORY, VOLUNTEER: TRANSPORT

## Purpose

Enable users who want to actively help animals — through transport, fostering, rescue ops, events, or social media outreach — to register their capabilities, signal availability, and be discovered by rescuers and case owners who need hands-on support. The volunteer system turns passive supporters into findable, coordinated helpers.

## User Stories

- As a **volunteer**, I want to list my capabilities (transport, fostering, etc.) so rescuers know what I can do.
- As a **volunteer**, I want to toggle my availability (available / busy / offline) so people only contact me when I'm ready to help.
- As a **volunteer**, I want a profile showing my impact stats and badges so I build trust in the community.
- As a **rescuer**, I want to search for nearby available volunteers so I can get help transporting an injured animal.
- As a **case owner**, I want to see top volunteers so I know who has a track record of helping.
- As a **platform admin**, I want to flag top volunteers for recognition so the community sees who contributes most.

## Functional Requirements

1. **Volunteer profile creation** — Any authenticated user can create a volunteer profile by selecting capabilities and providing a bio, city, and availability.
2. **Capability selection** — Six capabilities: `transport`, `fostering`, `rescue`, `events`, `social_media`, `general`. Users select one or more during onboarding or in settings.
3. **Availability toggle** — Three states: `available`, `busy`, `offline`. Default is `offline` (opt-in only, per RULES.md). Shown in directory only when not `offline`.
4. **Volunteer directory** — Searchable/filterable list of volunteers. Filters: city, capability, availability. Sort by: animals helped (default), rating, newest.
5. **Volunteer profile page** — Public page showing: name, avatar, bio, city, rating, badges, isTopVolunteer flag, stats grid, recent cases helped.
6. **Top volunteer recognition** — `isTopVolunteer` boolean flag, settable by admin. Top volunteers get a badge in directory and profile.
7. **Stats tracking** — Five metrics: `animalsHelped`, `adoptions`, `campaigns`, `donationsReceived`, `hoursVolunteered`. Updated via internal mutations when relevant events occur.
8. **Transport requests** (future) — "Who can help nearby" surface. Shows available volunteers with the `transport` capability in a given city. Privacy-safe: city-level only, no precise coordinates.
9. **City-based matching** — Volunteer city stored on `users.volunteerCity`. Directory filters by city. No GPS/precise location.

## Non-Functional Requirements

- **Privacy**: No precise home locations exposed. City-level only. Volunteer availability is opt-in — default `offline`. No PII (email/phone) in public queries (RULES.md).
- **Performance**: Directory query should return within 200ms for cities with up to 500 volunteers.
- **Accessibility**: All interactive elements meet WCAG AA. Touch targets ≥ 44×44px. Availability toggle has visible focus ring.
- **i18n**: All UI strings use i18n keys. Volunteer capability labels are translatable.

## Data Model

### `volunteers` table (schema.ts L519–L536)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | Link to user account |
| `bio` | `string` | Yes | Volunteer bio/description |
| `location` | `string` | Yes | City name (display) |
| `rating` | `number` | Yes | Rating 1–5 |
| `memberSince` | `string` | Yes | Year joined as volunteer |
| `isTopVolunteer` | `boolean` | Yes | Admin-flagged recognition |
| `badges` | `string[]` | Yes | Badge type strings |
| `stats` | `object` | Yes | See sub-object below |
| `createdAt` | `number` | Yes | Timestamp |

**Stats sub-object:**
```
{ animalsHelped: number, adoptions: number, campaigns: number,
  donationsReceived: number, hoursVolunteered: number }
```

**Indexes:** `by_user` (userId), `by_top` (isTopVolunteer)

### Volunteer fields on `users` table (schema.ts L34–L43)

| Field | Type | Description |
|-------|------|-------------|
| `volunteerCapabilities` | `optional(array(string))` | Values: transport, fostering, rescue, events, social_media, general |
| `volunteerAvailability` | `optional(union("available", "busy", "offline"))` | Opt-in. Default: offline |
| `volunteerCity` | `optional(string)` | City for matching |

**Index:** `by_volunteer_availability` (volunteerAvailability)

## API Surface

### Existing (convex/volunteers.ts)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list` | query | No | List all volunteers. Optional `topOnly` boolean filter. Enriches with user name/avatar. Sorts by `animalsHelped` desc. |
| `get` | query | No | Get single volunteer by `Id<"volunteers">`. Enriches with user name/avatar. Never exposes email. |

### Needed (not yet implemented)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `create` | mutation | Yes | Create volunteer profile. Input: bio, location. Reads capabilities/availability/city from users table. Creates volunteers row + links. |
| `update` | mutation | Yes (owner) | Update bio, location. Ownership check: `userId` must match current user. |
| `updateAvailability` | mutation | Yes (owner) | Set `volunteerAvailability` on users table. Only available/busy/offline. Audit log for state changes. |
| `updateCapabilities` | mutation | Yes (owner) | Set `volunteerCapabilities` on users table. Validates against allowed values. |
| `setTopVolunteer` | internalMutation | Admin | Set/unset `isTopVolunteer` on volunteers table. Creates audit log entry. |
| `incrementStats` | internalMutation | System | Increment specific stat counters. Called by case/donation/adoption event handlers. |
| `listDirectory` | query | No | Directory query with filters: city, capability, availability. Returns enriched volunteers sorted by animalsHelped. Excludes offline volunteers unless explicitly requested. |

## UI Surfaces

### Existing

- **VolunteerProfile page** (`src/pages/VolunteerProfile.tsx`, 297 lines) — Route: `/volunteers/:id`. Wired to `api.volunteers.get`. Shows: header with avatar/name/rating/isTopVolunteer badge, bio, stats grid, badges section, impact section (lives changed, EUR raised), recent cases helped, contact/message section.

### Needed

- **Volunteer Directory page** — Route: `/volunteers`. Uses `listDirectory` query. Grid/list of volunteer cards with filters (city dropdown, capability pills, availability toggle). Shows: avatar, name, city, top capabilities, animalsHelped stat, isTopVolunteer badge. Empty state: "No volunteers found — adjust filters or sign up to volunteer."
- **Availability Toggle component** — In settings or profile. Three-state toggle (available / busy / offline). State label + color indicator. Warning text: "Your city will be visible to other users when you're available."
- **Capability Selection component** — Multi-select pills for 6 capabilities. Used in onboarding wizard and settings page.

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| User creates volunteer profile but never helps | Stats show 0. Not surfaced in "top" filters. Natural ranking pushes them down. |
| Volunteer claims high stats fraudulently | Stats are system-incremented via internal mutations — not user-editable. |
| Harassment via transport requests | Block/report user flow. No direct location sharing. |
| Precise location exposure | City-level only. No coordinates on volunteer records. `volunteerCity` is a city name string, not GPS. |
| Spam volunteer accounts | Require auth. Rate limit volunteer creation. Only one volunteer profile per user (by_user index + unique check). |
| isTopVolunteer gaming | Admin-only flag. Not automated — human judgment required. |

## Acceptance Criteria

- [ ] User with `userType: volunteer` can set their availability status (available/busy/offline) from profile settings.
- [ ] Volunteer directory shows only volunteers with `availability !== "offline"` by default.
- [ ] Volunteer capabilities filter narrows results correctly (e.g., selecting "transport" shows only volunteers with that capability).
- [ ] Location-based search returns volunteers in the specified city.
- [ ] Changing availability status reflects in the directory within 5 seconds.
- [ ] Non-volunteer users cannot access volunteer-specific settings or appear in the directory.
- [ ] Volunteer profile card shows capabilities, city, and availability status.
- [ ] "Who can help nearby" request creates a notification to matching volunteers.

## Open Questions

1. **Volunteer data fragmentation** — Volunteer capabilities, availability, and city live on the `users` table, while bio, stats, badges, and rating live on the separate `volunteers` table. Should these be unified into a single source? Keeping the split means two queries to get a full volunteer picture. Merging means volunteers table becomes optional or folded into users. **→ Needs DECISIONS.md entry.**

2. **`volunteers.badges` vs. `achievements` table** — The volunteers table has a `badges: string[]` field, while the achievements table tracks badges like `verified_volunteer`, `top_transporter`, `foster_hero`, `rescue_champion`, `event_organizer`. Should volunteer badges be stored only in the achievements table for consistency? **→ Needs DECISIONS.md entry.**

3. **Rating system** — The volunteers table has a `rating: number` (1–5) field, but there is no review/rating submission mechanism. Is this admin-set, peer-rated, or algorithm-derived? **→ Needs decision.**

4. **Transport requests** — PRD lists "VOLUNTEER: TRANSPORT" as P2. The spec describes the intent, but the UX flow (how a rescuer requests transport help, how volunteers see/accept requests) needs its own design pass when implementation begins.
