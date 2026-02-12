# Activity Feed & Stories Spec

> **Owner:** Product + OPUS
> **Status:** draft
> **Last updated:** 2026-02-10
> **PRD Ref:** HOME FEED (stories strip)

## Purpose

Aggregate cross-domain activity (donations, cases, adoptions, achievements) into unified timelines and Instagram-like story feeds. The activity system powers the stories strip on the home feed, per-user story feeds on profiles, and per-case timelines on case detail pages. It surfaces real proof of platform activity to build trust and engagement.

## User Stories

- As a **donor**, I want to see a stories strip showing recent urgent case activity so I can quickly understand what's happening now.
- As a **visitor**, I want to see a global activity feed showing donations, new cases, and adoptions so I know the platform is active and trustworthy.
- As a **profile viewer**, I want to see a user's story feed (their cases, donations, achievements) so I can evaluate their credibility.
- As a **case follower**, I want to see a case timeline (creation, updates, donations, milestones) so I can track the animal's journey.

## Functional Requirements

### Activity Types

| Activity Type | Source Table | Trigger |
|---|---|---|
| Donation | `donations` | Payment confirmed via webhook |
| New case | `cases` | Case published |
| Adoption | `adoptions` | Listing status → `adopted` |
| Achievement | `achievements` | Badge awarded |
| Case update | `cases.updates[]` | Rescuer/clinic posts update |
| Funding milestone | computed | `fundraising.current` crosses 50% or 100% of goal |

### Queries

| Function | Purpose | Auth | Caching |
|---|---|---|---|
| `getRecentActivities` | Global feed: recent donations + cases + adoptions merged by timestamp | Public | Convex reactive |
| `getUserStories` | Per-user story feed: their cases, updates, donations, achievements | Public | Convex reactive |
| `getCaseStories` | Per-case timeline: creation, updates, donations, milestones | Public | Convex reactive |
| `getSystemStories` | Static placeholder stories for empty states | Public | Static |

### Data Aggregation

- No dedicated `activities` table — computed on-the-fly from source tables.
- Each query collects recent records from 3-5 tables, normalizes into `ActivityItem` shape, sorts by timestamp descending.
- User enrichment: each activity includes actor `name` and `avatar` from `users` table.
- Image resolution: case photos resolved via `ctx.storage.getUrl()`.

### Stories Strip (Home Feed)

- Sources from urgent/new case activity only — not generic social activities.
- Appears as horizontal scrollable story circles.
- Each story circle shows one case with latest activity.
- Tapping a story opens the case detail page.

### Funding Milestones

- `getCaseStories` detects milestones by comparing `fundraising.current` to `fundraising.goal`.
- 50% milestone: `current >= goal * 0.5`.
- 100% milestone: `current >= goal`.
- Displayed as special timeline entries with celebration UI.

## Data Model

No dedicated tables. Reads from:
- `donations` (completed, most recent)
- `cases` (active, with `updates[]` array)
- `adoptions` (status = adopted)
- `achievements` (user badges)
- `users` (actor enrichment)
- `_storage` (image URLs)

## API Surface

### Existing (`convex/activity.ts`)

| Function | Type | Lines | Status |
|---|---|---|---|
| `getRecentActivities` | query | ~100 | Implemented |
| `getUserStories` | query | ~80 | Implemented |
| `getCaseStories` | query | ~100 | Implemented |
| `getSystemStories` | query | ~30 | Implemented (static) |

### Known Issues

- All queries load full table scans then filter in memory — acceptable for MVP (<1000 records), needs index-based filtering at scale.
- Achievement label mapping is hardcoded as a `Record` in the file.
- No pagination on global activity feed.

## UI Surfaces

| Surface | Component | Data Source |
|---|---|---|
| Home stories strip | Stories circles in home feed | `getRecentActivities` |
| Case detail timeline | Timeline section on case page | `getCaseStories` |
| Profile stories | Story feed on user profile | `getUserStories` |
| Empty state | Welcome/how-it-works placeholders | `getSystemStories` |

## Edge Cases & Abuse

1. **Empty feed** — No activity yet (fresh platform). `getSystemStories` provides static placeholder stories.
2. **Deleted case appears in feed** — Activity references a case that was hidden/deleted. Query should filter out deleted/hidden cases.
3. **Anonymous donor in activity** — Donor set `anonymous: true`. Activity should show "Anonymous" instead of user name.
4. **High-volume donations** — Popular case gets many donations quickly. Feed shows recent only (no infinite scroll yet).
5. **Stale stories** — Stories strip should reflect recent activity, not ancient history. Consider time-window filtering (e.g., last 7 days).

## Non-Functional Requirements

- **Performance:** Activity queries should return in <500ms for up to 1000 records per source table. At scale, move to index-based filtering or materialized views.
- **Freshness:** Convex reactive queries ensure real-time updates — no manual refresh needed.
- **Privacy:** Anonymous donations must never leak donor identity in activity feeds.

## Acceptance Criteria

- [ ] Global activity feed merges donations, cases, and adoptions sorted by timestamp descending.
- [ ] Each activity item includes actor name, avatar, and relevant case image.
- [ ] Anonymous donations show "Anonymous" as actor name — never the real user.
- [ ] Case timeline shows creation, updates, donations, and funding milestones (50%, 100%) in chronological order.
- [ ] Stories strip sources only from urgent/new case activity.
- [ ] Empty platform shows static system stories instead of blank feed.
- [ ] Activities for deleted/hidden cases are excluded from results.

## Open Questions

1. **Pagination** — Global activity feed has no pagination. Acceptable for MVP but needs cursor-based pagination for scale. Priority: post-launch.
2. **Materialized activities table** — Should we create a dedicated `activities` table that gets populated via triggers/hooks instead of computing on-the-fly? Would improve performance but adds write complexity. Decision: defer until performance becomes an issue.
3. **Activity notifications** — Should activities generate push/in-app notifications for followers? Currently no notification integration. See notifications-spec.md.
4. **Time windowing** — Should stories strip only show activity from last 7 days? Currently shows most recent N items regardless of age.
