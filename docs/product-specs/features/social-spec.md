# Social Interactions Spec

> **Owner:** Product + OPUS
> **Status:** draft
> **Last updated:** 2026-02-12
> **PRD Ref:** FOLLOW (P2), PROFILES (social section)

## Purpose

Define the cross-cutting social interaction primitives that span multiple features: case comments (threaded), user follows, social signals (likes, saves), and external source attribution cards for social links. These are not standalone features — they enhance cases, profiles, and the feed. This spec documents the shared backend implementations and usage rules.

## User Stories

- As a **donor**, I want to comment on a case to ask the rescuer questions or express support.
- As a **donor**, I want to follow a rescuer so I see their future cases in my feed.
- As a **rescuer**, I want to see who follows me so I understand my audience.
- As a **user**, I want to save cases so I can find them later.
- As a **rescuer**, I want to attach a Facebook/Instagram source link so donors can verify where the story originated.

## Functional Requirements

### Case Comments (`convex/social.ts`)

| Rule | Detail |
|---|---|
| Auth required | Yes — `requireUser` guard |
| Content limit | ≤1000 characters |
| Threading | One level deep: top-level comments + replies to top-level |
| Parent validation | Reply's parent must belong to the same case |
| Pagination | Cursor-based by timestamp, descending |
| Enrichment | Each comment includes author `name` and `avatar` |

#### `addComment` Mutation

Input: `caseId`, `content`, optional `parentId` (for replies).
Validation: content ≤1000 chars, parent belongs to same case (if provided).
Output: new comment ID.

#### `getComments` Query

Input: `caseId`, optional `cursor` (timestamp), optional `limit` (default 20).
Returns: comments with user enrichment, ordered newest first.

### Follow System (`convex/social.ts`)

| Rule | Detail |
|---|---|
| Self-follow | Blocked — mutation rejects if `followingId === currentUserId` |
| Toggle | `toggleFollow` is a single endpoint: follow if not following, unfollow if already following |
| Uniqueness | Enforced by `by_follower_following` composite index |
| Return value | `{ following: boolean }` — new state after toggle |

#### `toggleFollow` Mutation

Input: `followingId` (user to follow/unfollow).
Auth: required.
Logic: Check if follow exists → delete (unfollow) or insert (follow).

#### `isFollowing` Query

Input: `followingId`.
Auth: optional — returns `false` if unauthenticated.
Use: UI conditional rendering of follow/unfollow button.

### Case Likes and Saves

Likes and saves are handled in `convex/cases.ts` (not `social.ts`) but are social primitives:

| Action | Mutation | Uniqueness Index | Auth |
|---|---|---|---|
| Like a case | `cases.toggleLike` | `by_user_case` on `caseLikes` | Required |
| Save a case | `cases.toggleSave` | `by_user_case` on `savedCases` | Required |

Both are toggle operations — first call adds, second call removes.

### External Source Link Cards (`externalSources` + case/community create flows)

| Rule | Detail |
|---|---|
| Input | Optional URL on case creation and community thread creation |
| URL policy | Public `http`/`https` only; normalized to canonical HTTPS |
| Tracking params | Query string + hash are stripped before storage |
| Privacy/safety | No scraping of private content; metadata is URL-derived only |
| Rendering | Case detail and community thread detail show title + thumbnail + domain attribution card |

#### Attachment flow

- `cases.create` accepts optional `externalSourceUrl` and stores normalized metadata in `externalSources`.
- `community.createThread` and legacy `community.create` accept optional `externalSourceUrl` and store normalized metadata in `externalSources`.
- Detail queries (`cases.getUiForLocale`, `community.getThread`) enrich payloads with `externalSource` preview fields.

## Data Model

### `comments` table

| Field | Type | Description |
|---|---|---|
| `caseId` | Id<"cases"> | Parent case |
| `userId` | Id<"users"> | Comment author |
| `content` | string | Comment text (≤1000 chars) |
| `parentId` | optional Id<"comments"> | For threaded replies |
| `createdAt` | number | Timestamp |

Indexes: `by_case` (caseId, createdAt).

### `follows` table

| Field | Type | Description |
|---|---|---|
| `followerId` | Id<"users"> | Who is following |
| `followingId` | Id<"users"> | Who is being followed |
| `createdAt` | number | Timestamp |

Indexes: `by_follower_following` (followerId, followingId).

### `caseLikes` table

| Field | Type |
|---|---|
| `userId` | Id<"users"> |
| `caseId` | Id<"cases"> |
| `createdAt` | number |

Index: `by_user_case` (userId, caseId).

### `savedCases` table

| Field | Type |
|---|---|
| `userId` | Id<"users"> |
| `caseId` | Id<"cases"> |
| `createdAt` | number |

Index: `by_user_case` (userId, caseId).

### `externalSources` table

| Field | Type | Description |
|---|---|---|
| `targetType` | `"case" \| "community_post"` | Target surface kind |
| `targetId` | string | Linked case/post id |
| `url` | string | Normalized canonical source URL |
| `platform` | `"facebook" \| "instagram" \| "x" \| "youtube" \| "tiktok" \| "other"` | Inferred platform |
| `title` | string | URL-derived preview title |
| `thumbnailUrl` | optional string | Lightweight preview image URL |
| `createdAt` | number | Timestamp |

Indexes: `by_target_created` (targetType, targetId, createdAt), `by_target_url` (targetType, targetId, url).

## API Surface

### Existing

| Function | File | Type | Auth |
|---|---|---|---|
| `addComment` | `social.ts` | mutation | Yes |
| `getComments` | `social.ts` | query | No |
| `toggleFollow` | `social.ts` | mutation | Yes |
| `isFollowing` | `social.ts` | query | Optional |
| `toggleLike` | `cases.ts` | mutation | Yes |
| `toggleSave` | `cases.ts` | mutation | Yes |
| `cases.create` (`externalSourceUrl`) | `cases.ts` | mutation | Yes |
| `community.createThread` (`externalSourceUrl`) | `community.ts` | mutation | Yes |
| `community.create` (`externalSourceUrl`) | `community.ts` | mutation | Yes |
| `cases.getUiForLocale` (`externalSource`) | `cases.ts` | query | No |
| `community.getThread` (`externalSource`) | `community.ts` | query | Optional |

### Needed

| Function | Purpose |
|---|---|
| `getFollowers` | List users who follow a given user (for profile) |
| `getFollowing` | List users a given user follows (for "following" feed) |
| `getFollowCounts` | Follower + following counts for profile display |

## UI Surfaces

| Surface | Components | Data Source |
|---|---|---|
| Case detail comments | Comment list + reply input | `social.getComments` |
| Case card actions | Like/Save toggle buttons | `cases.toggleLike/Save` |
| Profile follow button | Follow/Unfollow toggle | `social.toggleFollow` |
| Profile stats | Follower/following counts | Computed (needs `getFollowCounts`) |
| Saved cases tab | List of saved cases | `users.getSavedCases` |
| Case create flow | Optional source URL field | `cases.create` |
| Community composer | Optional source URL field | `community.createThread` / `community.create` |
| Case detail | External source attribution card | `cases.getUiForLocale` |
| Community thread detail | External source attribution card | `community.getThread` |

## Edge Cases & Abuse

1. **Comment spam** — No rate limit on `addComment`. Consider max 10 comments per user per 5 minutes.
2. **Deep threading** — Only one level of nesting. Reply to a reply should be rejected or flattened.
3. **Follow spam** — No rate limit on `toggleFollow`. Consider max 50 follows per day.
4. **Deleted case comments** — Comments on a deleted/hidden case should not be accessible. Query should check case status.
5. **Self-like** — Currently a user can like their own case. Consider blocking self-likes.
6. **Comment content** — No content moderation on comments. Should integrate with community report system.
7. **Source URL abuse** — Links with private/tracking params must be normalized or rejected.
8. **Broken previews** — Thumbnail URLs may fail; UI must fall back to domain/avatar card.

## Non-Functional Requirements

- **Performance:** `getComments` should return in <300ms for up to 100 comments with user enrichment.
- **Real-time:** Follow counts and like counts should update reactively via Convex subscriptions.
- **Privacy:** Following relationships are public. Consider adding privacy controls in future.

## Acceptance Criteria

- [ ] `addComment` validates content ≤1000 chars and parent belongs to same case.
- [ ] `getComments` returns paginated comments with user name and avatar, newest first.
- [ ] `toggleFollow` prevents self-follow and returns new following state.
- [ ] `isFollowing` returns `false` for unauthenticated users without error.
- [ ] `toggleLike` and `toggleSave` enforce uniqueness — no duplicate likes/saves.
- [ ] Comment replies are exactly one level deep — deeper nesting is rejected.
- [ ] Case/community create flows accept optional social URL and persist normalized `externalSources` metadata.
- [ ] Case detail and community thread detail render source attribution cards without scraping external/private content.

## Open Questions

1. **Comment editing** — No edit functionality exists. Should comments be editable within a time window (e.g., 15 minutes)? `editedAt` field doesn't exist in schema.
2. **Comment deletion** — No delete functionality exists. Who can delete: author + admin? Soft delete (replace content) or hard delete?
3. **Following feed** — PRD lists "following feed tab" as P2. This requires `getFollowing` + a feed query filtered to followed users' cases. Not yet designed.
4. **Notifications for social actions** — Should follows, likes, and comments trigger notifications? Currently no integration with notification system.
5. **Comment performance** — `getComments` pagination is manual (load all, filter by cursor). Consider index-based cursor pagination for scale.
6. **Multiple sources per target** — Should cases/posts support multiple source cards instead of one primary link?
