# Home Feed & Landing Spec

> **Owner:** Product + OPUS
> **Status:** draft
> **Last updated:** 2026-02-10
> **PRD Ref:** HOME FEED

## Purpose

Define the primary landing surface (`/`) — a rescue-first feed that helps donors discover urgent cases and take action immediately. The home feed aggregates cases, campaigns, stories, and community signals into a single scroll-optimized surface with intent-based filtering, city-aware search, and trust-safe donation gating. This is the most important page in the app.

## User Stories

- As a **donor**, I want to land on a page showing urgent cases near me so I can donate immediately.
- As a **visitor**, I want to see active rescue cases with progress indicators so I know the platform is real and active.
- As a **rescuer**, I want my case to appear prominently when it's urgent and underfunded so it gets visibility.
- As a **returning user**, I want to see unread counts (notifications, community) so I know what's new since my last visit.

## Functional Requirements

### Feed Architecture

The home feed is powered by a single Convex query: `home.getLandingFeed`. It returns:

| Component | Description | Source |
|---|---|---|
| **Hero case** | Least-funded critical case. Auto-selected, not curated. | `cases` table |
| **Case grid** | Paginated case cards with intent-based filtering. | `cases` table |
| **Stories strip** | Urgent/new case activity circles. | `activity.getRecentActivities` |
| **Featured initiative** | One active campaign flagged as `featuredInitiative`. | `campaigns` table |
| **City counts** | Number of active cases per city (for city filter pills). | Computed from `cases` |
| **Unread counts** | Notification + community badge counts. | `notifications`, `communityPosts` |

### Intent-Based Filtering

| Filter Intent | Behavior |
|---|---|
| `all` | All active cases, newest first |
| `urgent` | Cases with `urgencyLevel: "urgent"` or `priority: "critical"` |
| `nearby` | Cases matching user's city (Bulgarian aliases supported: `София` ↔ `sofia`) |
| `success` | Cases with `status: "funded"` or `lifecycleStage` starting with `closed_success` |

### City Filter

- City dropdown shows unique cities from active cases.
- Bulgarian city name aliases are normalized (e.g., `София` matches `sofia`).
- City filter combines with intent filter (AND logic).

### Free-Text Search

- Matches against case `title` and `description`.
- Case-insensitive substring matching.
- Server-driven — no client-side filtering.

### Pagination

- Cursor-based via `continueCursor` parameter.
- Default page size determined by the query.
- Client passes cursor from previous response to load next page.

### Trust Rules (Donation Gating)

Each case card includes `isDonationAllowed` flag computed by:
- Case `status !== "closed"` AND no `closed_*` lifecycle stage.
- Not (`verificationStatus: "unverified"` AND `riskLevel: "high"`).
- When `isDonationAllowed: false`, the Donate button is disabled/hidden on the card.

### i18n Support

- `pickLocalizedFields()` resolves translated `title`, `description`, and `story` per user locale.
- Falls back to original content when no translation exists.

### Hero Case Selection

- Selects the case with `urgencyLevel: "urgent"` or `priority: "critical"` that has the lowest funding percentage (`fundraising.current / fundraising.goal`).
- If no urgent cases exist, no hero is shown.

### Featured Initiative

- Single campaign with `campaignType: "initiative"` and `featuredInitiative: true`.
- Displayed in a dedicated module after rescue content (never before).

### Unread Counts

| Count | Source | Logic |
|---|---|---|
| Notification badge | `notifications` table | Count where `userId === currentUser` AND `read === false` |
| Community badge | `communityPosts` table | Count of posts created in last 24 hours (heuristic) |

## Data Model

No dedicated tables. Reads from:
- `cases` (active cases with images, fundraising, verification)
- `campaigns` (featured initiatives)
- `notifications` (unread count for current user)
- `communityPosts` (recent activity count)
- `users` (case owner enrichment)
- `_storage` (image URL resolution)

## API Surface

### Existing (`convex/home.ts`)

| Function | Type | Purpose | Auth |
|---|---|---|---|
| `getLandingFeed` | query | Main feed query with all components | Optional (unread counts need auth) |
| `getUnreadCounts` | query | Lightweight badge count query | Optional |

### Known Scalability Concern

`getLandingFeed` loads ALL cases then filters in-memory. Acceptable for MVP (<500 cases), but needs index-based filtering and server-side pagination before reaching 1000+ cases.

## UI Surfaces

| Surface | Component | Layout |
|---|---|---|
| Hero card | Full-width urgent case card | Top of feed |
| Stories strip | Horizontal scrollable circles | Below hero |
| Filter rail | Intent pills + city dropdown | Below stories |
| Case grid | Responsive card grid | Main content |
| Featured initiative | Campaign card module | After case grid |
| Navigation badges | Notification + community counts | Bottom nav icons |

See [ui-patterns-spec.md](../design/ui-patterns-spec.md) for detailed first-fold structure and layout expectations.

## Edge Cases & Abuse

1. **Empty feed** — No cases exist. Show welcome state with CTA to create first case + system stories.
2. **No urgent cases** — Hero section is omitted; feed starts with stories strip.
3. **Single city** — City filter shows one option; consider hiding filter when only one city has cases.
4. **Locale without translations** — `pickLocalizedFields()` returns original content; no error, no empty fields.
5. **Unauthenticated user** — Unread counts return 0; no notification/community badge shown.
6. **Many funded cases in "success" filter** — Could be a long list; pagination handles this.

## Non-Functional Requirements

- **Performance:** Feed must render in <1 second on mobile (3G). Target: `getLandingFeed` returns in <500ms.
- **Freshness:** Convex reactive queries ensure new cases appear in feed within seconds of creation.
- **Responsiveness:** Layout adapts from 320px (iPhone SE) to 1440px (desktop). See ui-patterns-spec.md for breakpoints.
- **Accessibility:** Case cards have proper `alt` text on images, heading hierarchy, and keyboard navigation.

## Acceptance Criteria

- [ ] Home feed loads without client-side filtering — all filtering is server-driven via `getLandingFeed`.
- [ ] Hero case shows the least-funded urgent/critical case; hidden when no urgent cases exist.
- [ ] Intent filter pills (All/Urgent/Near me/Success) correctly filter the case grid.
- [ ] City filter narrows results to cases with matching `location.city` (alias-aware).
- [ ] Unread notification badge is powered by backend query — never hardcoded.
- [ ] `isDonationAllowed: false` cases have disabled/hidden Donate button.
- [ ] Featured initiative appears after rescue content — never above it.
- [ ] Pagination loads next page without re-fetching previous pages.
- [ ] Unauthenticated users see the full feed but no unread counts.

## Open Questions

1. **Performance at scale** — `getLandingFeed` loads all cases in-memory. At what case count does this become unacceptable? Recommendation: profile at 500 cases, plan index-based rewrite at 1000.
2. **Personalized feed** — Should returning users see cases they haven't interacted with first? Currently no personalization. Consider post-MVP.
3. **Community badge heuristic** — Using "posts in last 24h" as unread count is a rough proxy. Should we track actual unread per user? Would require a read-tracking table.
4. **Search UX** — Search is currently inline in the feed query. Should it move to a dedicated search overlay? See [ui-patterns-spec.md](../design/ui-patterns-spec.md#search-overlay).
