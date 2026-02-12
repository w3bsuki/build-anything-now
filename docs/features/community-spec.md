# Community Forum — Feature Spec

> **Owner:** OPUS  
> **Status:** draft  
> **Last updated:** 2026-02-10  
> **PRD Ref:** COMMUNITY  
> **Tables:** `communityPosts`, `communityComments`, `communityReactions`, `communityReports`  
> **Functions:** `convex/community.ts`  
> **UI:** `Community.tsx`, `CommunityPost.tsx`, `CommunityMobileShellLayout.tsx`

---

## Purpose

The community forum is Pawtreon's social backbone — a two-board discussion space where rescuers, donors, clinics, and volunteers share updates, coordinate on cases, and build trust. The rescue board surfaces urgent needs alongside case updates; the community board hosts general discussion, advice, and announcements. Every thread and comment rolls up to a single real-time activity feed, sorted by a locality-aware algorithm that prioritises content from the viewer's city.

---

## User Stories

### 2.1 Rescue Board

| # | Actor | Story |
|---|-------|-------|
| R1 | Rescuer | I post an `urgent_help` thread linking a case and tagging my city so nearby volunteers see it first. |
| R2 | Volunteer | I filter the rescue board to `adoption` + my city and browse available animals. |
| R3 | Donor | I read a `case_update` thread, upvote it, and click through to the linked case to donate. |
| R4 | Clinic | I reply to an `advice` thread with medical guidance and my `clinic` badge displays next to my name. |

### 2.2 Community Board

| # | Actor | Story |
|---|-------|-------|
| C1 | Any user | I create a `general` thread to share a story about how Pawtreon helped me. |
| C2 | Admin | I pin an `announcements` thread with upcoming platform changes. |
| C3 | Visitor | I browse threads without logging in — I can read but not post or react. |

### 2.3 Moderation

| # | Actor | Story |
|---|-------|-------|
| M1 | Any user | I report a comment that contains misinformation, with optional details (max 2000 chars). |
| M2 | Admin | I lock a thread that's become combative; no new comments allowed. |
| M3 | Admin | I review open reports and mark them resolved or dismissed. |

---

## Functional Requirements

### 3.1 Forum Architecture: Two Boards

The forum has exactly **two boards**:

| Board | Slug | Categories | Purpose |
|-------|------|------------|---------|
| Rescue | `rescue` | `urgent_help`, `case_update`, `adoption`, `advice` | Animal rescue coordination |
| Community | `community` | `general`, `advice`, `announcements` | General discussion |

Categories are board-scoped — `normalizeCategoryByBoard()` enforces that a category belongs to its board and falls back to a default (`urgent_help` for rescue, `general` for community). This means a post cannot be `urgent_help` on the `community` board.

### 3.2 Thread (Post) Creation

**Mutation:** `createThread`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `board` | `"rescue" \| "community"` | Yes | — |
| `category` | 6 category literals | Yes | Normalized to board-valid categories |
| `title` | `string` | Yes | Auto-generated from content first 90 chars if empty; capped at 140 chars |
| `content` | `string` | Yes | Min 1 char, max 5000 chars |
| `cityTag` | `string?` | No | Sanitized, trimmed, capped at 80 chars; defaults to user's city |
| `caseId` | `string?` | No | Validated — case must exist |
| `image` | `string?` | No | URL (Convex storage) |

**Side effects:**
- Rate limit checked: max 3 threads per 15 minutes per user
- `lastActivityAt` set to `now`
- Counters initialised: `likes: 0`, `commentsCount: 0`
- Flags set: `isLocked: false`, `isDeleted: false`, `isPinned: false`, `isRules: false`
- `auditLogs` entry created: `community.thread.created`

### 3.3 Thread Listing & Filtering

**Query:** `listThreads`

| Arg | Type | Default | Notes |
|-----|------|---------|-------|
| `board` | `"rescue" \| "community"` | `"rescue"` | — |
| `category` | 6 literals + `"all"` | `"all"` | Filters by normalised category |
| `city` | `string?` | `"all"` | `"all"` = no filter; `"nearby"` = viewer's city; or an exact city string |
| `sort` | `"local_recent" \| "newest" \| "top"` | `"local_recent"` | — |
| `search` | `string?` | — | Case-insensitive substring match in title, content, cityTag |
| `limit` | `number?` | `40` | Clamped to `[1, 100]` |

**Scan strategy:** Reads the latest 300 posts from `by_created` index, filters in-memory. This is a known scalability ceiling — at >300 active posts the tail is invisible.

**Sort algorithms:**

| Sort Mode | Logic |
|-----------|-------|
| `local_recent` | Pinned first → viewer's city first → 21-day stale penalty → `lastActivityAt` desc |
| `newest` | Pinned first → `createdAt` desc |
| `top` | Pinned first → score (`likes + commentsCount × 2`) desc → `lastActivityAt` desc |

**Return shape:**
```ts
{
  threads: ThreadView[],
  meta: {
    viewerCity: string | null,
    cityOptions: { city: string; count: number }[],  // top 8 cities
    total: number,
    board: ForumBoard,
    sort: ForumSort,
  }
}
```

`cityOptions` is derived from all non-deleted posts on the current board, capped at 8, sorted by count then alphabetically.

### 3.4 Thread Detail

**Query:** `getThread` — takes `id: Id<"communityPosts">`, returns full `ThreadView` or `null` if deleted. Viewer's reaction state included.

### 3.5 Thread Locking

**Mutation:** `lockThread` — admin-only.

| Arg | Type |
|-----|------|
| `id` | `Id<"communityPosts">` |
| `locked` | `boolean` |

Sets `isLocked` and updates `lastActivityAt`. Audit log: `community.thread.locked` / `community.thread.unlocked`.

When a thread is locked, `createComment` rejects with `"Thread is locked"`.

### 3.6 Comments (2-Level Threading)

**Schema constraint:** `parentCommentId` is optional. If present, the parent must be a top-level comment (cannot itself have a `parentCommentId`). This enforces exactly **1 nesting level** — top-level replies and responses to those replies, but no deeper.

**Mutation:** `createComment`

| Arg | Type | Required | Constraints |
|-----|------|----------|-------------|
| `postId` | `Id<"communityPosts">` | Yes | Thread must exist and not be deleted |
| `content` | `string` | Yes | Min 1 char, max 2000 chars |
| `parentCommentId` | `Id<"communityComments">?` | No | Parent must be top-level, same postId, not deleted |

**Side effects:**
- Rate limit: max 15 comments per 5 minutes
- If reply to a comment: parent's `replyCount` incremented
- Thread's `commentsCount` recalculated (count of non-deleted comments)
- Thread's `lastActivityAt` updated
- Audit log: `community.comment.created`

**Query:** `listComments` — returns all comments for a post, structured as:
```ts
CommentView {
  id, postId, parentCommentId,
  content,          // "[deleted]" if soft-deleted
  isDeleted,
  reactionCount, replyCount,
  createdAt, editedAt, timeAgo,
  viewerReacted,    // upvote toggle state
  author: { id, name, avatar, city, badge },
  replies: CommentView[]  // nested children (1 level only)
}
```

Comments sorted ascending by `createdAt` (chronological within a thread).

### 3.7 Soft Delete

**Mutation:** `deleteComment` — author or admin can delete.

| Behaviour | Detail |
|-----------|--------|
| Sets `isDeleted: true` | — |
| Replaces content with `"[deleted]"` | Content is destroyed, not preserved |
| Sets `editedAt` to now | — |
| Recalculates thread `commentsCount` | Excludes deleted comments |
| Audit log | `community.comment.deleted` |

The comment row is preserved (not physically deleted) so replies to it remain attached.

**GAP:** There is no `deleteThread`/soft-delete-thread mutation. Threads can currently only be soft-deleted via direct DB operations. A `deleteThread` mutation should be added (admin + author, with cascade to mark replies visible but thread hidden).

### 3.8 Reactions (Upvote Toggle)

**Mutation:** `toggleReaction`

| Arg | Type |
|-----|------|
| `targetType` | `"post" \| "comment"` |
| `targetId` | `string` (stringified Convex ID) |
| `reactionType` | `"upvote"` (default) |

**Logic:**
1. Verify target exists and is not deleted
2. Query `communityReactions.by_unique_reaction` for existing reaction
3. If exists → delete reaction, decrement counter (`likes` on post, `reactionCount` on comment)
4. If not exists → insert reaction, increment counter
5. Post reactions also update `lastActivityAt`
6. Returns `{ reacted: boolean, count: number }`

**Uniqueness:** Enforced by the composite index `by_unique_reaction: [targetType, targetId, userId, reactionType]` queried with `.unique()`.

**Currently only "upvote"** — the `reactionType` field is a union literal `v.literal("upvote")` in schema. Extensible to emoji reactions in the future by adding more literals.

### 3.9 Reporting / Moderation

**Mutation:** `reportContent`

| Arg | Type | Required |
|-----|------|----------|
| `targetType` | `"post" \| "comment"` | Yes |
| `targetId` | `string` | Yes |
| `reason` | 6 reason literals | Yes |
| `details` | `string?` | No (max 2000 chars) |

**6 Report Reasons:**

| Reason | Slug |
|--------|------|
| Spam | `spam` |
| Harassment | `harassment` |
| Misinformation | `misinformation` |
| Scam | `scam` |
| Animal welfare concern | `animal_welfare` |
| Other | `other` |

**Behaviour:**
- Duplicate guard: if the same user already has an `open` report on the same target, returns existing report ID
- Rate limit: max 6 reports per 10 minutes per user
- Creates audit log: `community.report.created`

**Report Lifecycle:**

```
open → reviewing → resolved
                  → dismissed
```

Schema stores `reviewedAt`, `reviewedBy` (admin ID), and `resolutionNotes`.

**GAP:** No `resolveReport` / `dismissReport` mutation exists. Admin moderation tools must be built:
- `listReports(status?)` — query open/reviewing reports
- `reviewReport(id, action, notes)` — transition to resolved/dismissed
- Optionally: auto-lock thread or soft-delete content upon resolution

---

### Rate Limits

| Action | Window | Max | Error Message |
|--------|--------|-----|---------------|
| Create thread | 15 min | 3 | "You're posting too quickly. Please wait a few minutes before creating another thread." |
| Create comment | 5 min | 15 | "You're replying too quickly. Please wait a moment and try again." |
| Submit report | 10 min | 6 | "Too many reports in a short time. Please wait before submitting another report." |

**Implementation:** Each rate limit function queries all user records in the relevant table, filters by `!isDeleted` (for threads/comments) and `now - createdAt <= window`, and counts. This is a full-scan-and-filter approach — adequate at current scale but should migrate to a dedicated rate-limit table or counter at high volume.

---

## Data Model

### 5.1 `communityPosts`

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `Id<"users">` | Author |
| `title` | `string?` | Optional; auto-generated from content if absent |
| `content` | `string` | 1–5000 chars |
| `image` | `string?` | URL (Convex storage) |
| `caseId` | `Id<"cases">?` | Linked rescue case |
| `board` | `"rescue" \| "community"?` | Normalised at read time if missing |
| `category` | 6-literal union? | Normalised at read time if missing |
| `cityTag` | `string?` | Free-text city label (max 80 chars) |
| `lastActivityAt` | `number?` | Updated on reactions, comments, lock toggle |
| `isLocked` | `boolean?` | Admin-controlled |
| `isDeleted` | `boolean?` | Soft delete |
| `editedAt` | `number?` | — |
| `isPinned` | `boolean` | Required |
| `isRules` | `boolean` | Special rules/announcement flag |
| `likes` | `number` | Denormalised upvote count |
| `commentsCount` | `number` | Denormalised non-deleted comment count |
| `createdAt` | `number` | — |

**Indexes:** `by_user`, `by_created`, `by_pinned`, `by_board_created`, `by_board_activity`, `by_board_category`, `by_board_city`, `by_deleted_created`

### 5.2 `communityComments`

| Field | Type | Notes |
|-------|------|-------|
| `postId` | `Id<"communityPosts">` | Parent thread |
| `authorId` | `Id<"users">` | — |
| `parentCommentId` | `Id<"communityComments">?` | Top-level if absent; max 1 nesting level |
| `content` | `string` | 1–2000 chars; becomes `"[deleted]"` on soft delete |
| `isDeleted` | `boolean` | — |
| `reactionCount` | `number` | Denormalised upvote count |
| `replyCount` | `number` | Denormalised child count |
| `createdAt` | `number` | — |
| `editedAt` | `number?` | — |

**Indexes:** `by_post_created`, `by_post_parent`, `by_parent`, `by_author`

### 5.3 `communityReactions`

| Field | Type | Notes |
|-------|------|-------|
| `targetType` | `"post" \| "comment"` | — |
| `targetId` | `string` | Stringified Convex ID |
| `userId` | `Id<"users">` | — |
| `reactionType` | `"upvote"` | Only upvote for now |
| `createdAt` | `number` | — |

**Indexes:** `by_target`, `by_user_target`, `by_unique_reaction`

**Design note:** `targetId` is `string` rather than a typed ID because the same table serves both posts and comments — Convex doesn't support union IDs in a single field, so it's stringified and cast at query time.

### 5.4 `communityReports`

| Field | Type | Notes |
|-------|------|-------|
| `targetType` | `"post" \| "comment"` | — |
| `targetId` | `string` | Stringified ID |
| `reason` | 6-literal union | `spam \| harassment \| misinformation \| scam \| animal_welfare \| other` |
| `details` | `string?` | Reporter's explanation (max 2000 chars) |
| `reporterId` | `Id<"users">` | — |
| `status` | `"open" \| "reviewing" \| "closed" \| "dismissed"` | Note: schema says `closed`, code uses `resolved` — **mismatch** |
| `createdAt` | `number` | — |
| `reviewedAt` | `number?` | — |
| `reviewedBy` | `Id<"users">?` | Admin who reviewed |
| `resolutionNotes` | `string?` | — |

**Indexes:** `by_target`, `by_status`, `by_reporter`, `by_reviewed_by`

**Schema Bug:** The schema defines status as `v.literal("closed")` but the report lifecycle should use `"resolved"`. Either the schema or the lifecycle description should be unified — recommend changing schema to `"resolved"`.

---

## API Surface

### 6.1 Queries

| Function | Auth | Args | Returns |
|----------|------|------|---------|
| `listThreads` | Optional | `board?, category?, city?, sort?, search?, limit?` | `{ threads, meta }` |
| `getThread` | Optional | `id` | `ThreadView \| null` |
| `listComments` | Optional | `postId` | `CommentView[]` (nested) |

### 6.2 Mutations

| Function | Auth | Args | Side Effects |
|----------|------|------|-------------|
| `createThread` | Required | `board, category, title, content, cityTag?, caseId?, image?` | Rate limit, audit log |
| `lockThread` | Admin | `id, locked` | Audit log |
| `createComment` | Required | `postId, content, parentCommentId?` | Rate limit, counter update, audit log |
| `deleteComment` | Author/Admin | `commentId` | Soft delete, counter update, audit log |
| `toggleReaction` | Required | `targetType, targetId, reactionType?` | Counter update |
| `reportContent` | Required | `targetType, targetId, reason, details?` | Rate limit, dedup, audit log |

### 6.3 Legacy Wrappers

| Function | Purpose |
|----------|---------|
| `list` | Old community feed — returns community board only, uses `toLegacyPost()` mapper |
| `get` | Old single-post fetch — returns legacy shape |
| `create` | Old create — auto-assigns board from `caseId`, no category/title args |
| `like` | Old like — no toggle (only adds, never removes) |

These wrappers exist for backward compatibility with older route code. They should be deprecated once all UI is migrated to the new `listThreads`/`createThread`/`toggleReaction` API.

---

### Author View Shape

Every thread and comment includes an author object:

```ts
{
  id: Id<"users"> | null,
  name: string,         // displayName || name || "Unknown"
  avatar: string | null,
  city: string | null,  // volunteerCity || city
  badge: "mod" | "clinic" | "partner" | "volunteer" | null
}
```

**Badge resolution:**

| Condition | Badge |
|-----------|-------|
| `user.role === "admin"` | `mod` |
| `user.role === "clinic"` | `clinic` |
| `user.verificationLevel === "partner"` | `partner` |
| `user.role === "volunteer"` | `volunteer` |
| Otherwise | `null` |

---

## UI Surfaces

### 8.1 Mobile Forum Shell

**Decision (2026-02-07):** Community gets a dedicated mobile shell layout (`CommunityMobileShellLayout`) with its own bottom navigation bar. This separates the forum experience from the main app shell.

**Layout:**
- Board tab bar at top: **Rescue** | **Community**
- Filter bar: category picker + city dropdown + sort mode
- Thread list (card-style, infinite scroll up to limit)
- FAB (floating action button) for new thread
- Thread detail → comment list with reply affordance

### 8.2 Thread Card

Displays: category badge, title, content preview (single-line), author (name + avatar + badge), city tag, reaction count, reply count, timeAgo, pinned indicator, locked indicator.

### 8.3 Thread Detail Page

Full content + image, linked case card (if `caseId`), author info, reactions, comment list. Reply input at bottom. Lock indicator with disabled input if locked.

### 8.4 City Filtering

Top-8 cities shown as quick-filter chips. "All" and "Nearby" as special options. "Nearby" matches viewer's city (`volunteerCity || city` from user doc).

---

## Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| **Scalability** | Current 300-post scan ceiling is acceptable for MVP (<1000 active posts). Must add cursor-based pagination before exceeding this. |
| **Latency** | `listThreads` should complete <500ms including author lookups (300 posts × N author reads). Consider batch author cache. |
| **Content limits** | Thread: 5000 chars; Comment: 2000 chars; Title: 140 chars; City tag: 80 chars; Report details: 2000 chars |
| **Real-time** | Convex provides automatic reactivity — thread list and comments update in real-time for all connected viewers. |
| **Accessibility** | Forum must be navigable by keyboard and screen reader. Thread cards must have proper heading hierarchy. |
| **i18n** | UI chrome localised via i18next. User-generated content is not translated (no per-post translation like cases). |

---

## Edge Cases & Abuse

| Scenario | Mitigation |
|----------|------------|
| Spam thread flood | Rate limit: 3 threads / 15 min; report → admin action |
| Comment spam | Rate limit: 15 comments / 5 min |
| Report abuse (mass false reports) | Rate limit: 6 reports / 10 min; duplicate guard per reporter per target |
| Self-upvote farming | Toggle semantics prevent double-counting; however, no explicit self-vote block exists. **Consider adding.** |
| Deleted content visibility | Soft delete replaces content with `"[deleted]"` — original content is destroyed in DB, not recoverable |
| Orphaned replies | When a comment is deleted, replies remain attached to a `"[deleted]"` parent — intentional Reddit-style behaviour |
| Locked thread bypass | `createComment` checks `isLocked` before inserting |
| Linked case deleted | Thread still displays but case link may 404 — **consider checking case existence at read time** |
| Very long city tags | Sanitised to 80 chars max; case-insensitive matching normalises duplicates |
| HTML/XSS in content | Content is treated as plain text in React (no `dangerouslySetInnerHTML`); image is just a `src` URL |
| Stale content in local_recent | 21-day stale penalty pushes old threads down |

---

### Audit Logging

All mutations log to `auditLogs`:

| Action | Entity Type |
|--------|-------------|
| `community.thread.created` | `community_post` |
| `community.thread.locked` | `community_post` |
| `community.thread.unlocked` | `community_post` |
| `community.comment.created` | `community_comment` |
| `community.comment.deleted` | `community_comment` |
| `community.report.created` | `community_report` |

---

## Acceptance Criteria

- [ ] Thread creation enforces category-board normalization — invalid category for selected board falls back to default.
- [ ] Thread creation rate limit rejects when user attempts >3 threads within 15 minutes.
- [ ] Comment on a locked thread (`isLocked: true`) is rejected with "Thread is locked."
- [ ] `toggleReaction` is a true toggle: first call inserts, second call removes; uniqueness enforced by composite index.
- [ ] `deleteComment` soft-deletes (`isDeleted: true`, content replaced with `"[deleted]"`), recalculates `commentsCount` excluding deleted.
- [ ] `reportContent` enforces duplicate guard and rate limit of max 6 reports per 10 minutes.
- [ ] `listThreads` with `sort: "local_recent"` orders pinned threads first, then viewer's city threads first.
- [ ] Comment nesting is exactly one level deep — a reply to a reply (depth > 1) is rejected.

---

## Open Questions

1. **Thread deletion** — No `deleteThread` mutation exists. Who can delete (author + admin)? Should it cascade-hide comments or just the thread body? Recommend: soft delete thread (same pattern as comments), comments remain visible under "[deleted thread]" header.

2. **Thread editing** — No `editThread` mutation. `editedAt` field exists in schema but is never written. Should threads be editable? Recommend: allow author to edit content/title within 30 minutes of creation, set `editedAt`, log to audit.

3. **Comment editing** — Same gap. `editedAt` field exists but editing is not implemented. Recommend: same 30-minute window.

4. **Report resolution** — No admin mutation to resolve/dismiss reports. Critical gap for moderation. Need `resolveReport(id, action: "resolved"|"dismissed", notes?)` mutation.

5. **Pinning** — `isPinned` field exists and is respected in sort, but no `pinThread` mutation exists (can only be set via seed or direct DB). Need admin mutation.

6. **300-post scan ceiling** — At scale, `listThreads` will miss older content. Cursor-based pagination with the `by_board_activity` or `by_board_created` index is the fix. Should be addressed before launch if >200 active threads expected.

7. **Schema status mismatch** — `communityReports.status` includes `"closed"` in schema but the lifecycle implies `"resolved"`. Should align — recommend changing schema to `"resolved"` with a migration.

8. **Notification integration** — Replying to a thread or comment does not currently trigger notifications. Should create notification for: thread author when replied to, comment author when sub-replied to, thread author when upvoted (optional).

9. **Image moderation** — Threads support image URLs but there is no image moderation pipeline. At minimum, images uploaded via Convex storage should be scanned or manually reviewable.

10. **Self-vote** — Currently a user can upvote their own threads and comments. Consider blocking self-reactions.

11. **Legacy API deprecation timeline** — `list`, `get`, `create`, `like` wrappers should be deprecated. Timeline depends on UI migration completion.

12. **Board-specific permissions** — Currently any authenticated user can post to any board. Should `announcements` category require admin? Currently it doesn't.
