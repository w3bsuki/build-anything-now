# Notification System Spec

> **Owner:** Product
> **Status:** draft
> **Last updated:** 2026-02-12
> **PRD Ref:** NOTIFICATIONS

## Purpose

Keep users informed about events that matter to them — donations they receive, updates on cases they follow, achievements they unlock, campaigns that end, and system-level announcements. The notification system is the connective tissue that turns passive browsing into active engagement and builds retention loops.

## User Stories

- As a **case owner**, I want to be notified when someone donates to my case so I can thank them and post an update.
- As a **donor**, I want to be notified when a case I donated to posts an update so I can see my impact.
- As a **user**, I want to see a badge count on the notification icon so I know when new notifications arrive.
- As a **user**, I want to mark notifications as read (individually or all) so I can manage my inbox.
- As a **user**, I want to click a notification and navigate to the relevant content (case, achievement, etc.).
- As a **user**, I want to control which notification channels are active (in-app, push, email) in settings.

## Functional Requirements

1. **Notification types** — Five types: `donation_received`, `case_update`, `achievement_unlocked`, `campaign_ended`, `system`.
2. **In-app notification center** — Dedicated page listing all notifications for the current user, sorted newest first. Each notification shows: type icon, title, message, timestamp (relative), read/unread indicator.
3. **Read/unread tracking** — Boolean `read` field per notification. Unread notifications are visually distinct (bold title, accent indicator).
4. **Mark as read** — Single notification via tap/click. Bulk "Mark all as read" button.
5. **Delete notification** — User can remove individual notifications.
6. **Badge count** — Unread count displayed on nav bell icon. Data-driven from `getUnreadCount` query — never hardcoded (RULES.md: no fake social proof).
7. **Deep linking** — Clicking a notification navigates to the relevant entity (e.g., `caseId` → case detail page, `achievement_unlocked` → achievements page).
8. **Notification generation** — Internal mutations triggered by platform events (see Trigger Map below).
9. **User preferences** — Per-channel toggles stored in `userSettings`: `emailNotifications`, `pushNotifications`, `donationReminders`, `marketingEmails`. Preferences checked before delivery.
10. **Push notifications** (future) — Capacitor Push Notifications plugin for iOS/Android. Spec the integration point but do not implement for MVP.
11. **Email notifications** (future) — Transactional email delivery via provider (Resend, SendGrid). Spec the architecture but do not implement for MVP.

## Non-Functional Requirements

- **Latency**: Notifications should appear within 5 seconds of the triggering event (Convex real-time subscription makes this near-instant for in-app).
- **Volume**: System must handle notification storms gracefully — if a case receives 50 donations in 1 hour, batch or throttle notifications to the case owner (e.g., "You received 12 donations in the last hour" summary).
- **Retention**: No auto-deletion policy for v1. Notifications persist indefinitely. Consider 90-day cleanup in future.
- **Privacy**: Notification content must not include PII of other users (no donor email in donation_received notification).
- **i18n**: Notification titles and messages must be generated using i18n keys, not hardcoded English strings.
- **Accessibility**: Notification list is keyboard-navigable. Screen readers announce new notification count.

## Data Model

### `notifications` table (schema.ts L157–L169)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | Recipient user ID |
| `type` | `union(5 types)` | Yes | See types: donation_received, case_update, achievement_unlocked, campaign_ended, system |
| `title` | `string` | Yes | Notification headline (translatable) |
| `message` | `string` | Yes | Notification body text (translatable) |
| `caseId` | `optional(Id<"cases">)` | No | Link to related case (for deep linking) |
| `read` | `boolean` | Yes | Read/unread status |
| `createdAt` | `number` | Yes | Timestamp |

**Indexes:** `by_user` (userId), `by_user_unread` (userId, read)

### `userSettings` table (schema.ts L172–L181)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | User ID |
| `emailNotifications` | `boolean` | Yes | Enable email delivery |
| `pushNotifications` | `boolean` | Yes | Enable push delivery |
| `donationReminders` | `boolean` | Yes | Enable donation reminder emails |
| `marketingEmails` | `boolean` | Yes | Enable marketing emails |
| `language` | `string` | Yes | Preferred language |
| `currency` | `string` | Yes | Preferred currency |

**Index:** `by_user` (userId)

## API Surface

### Existing (convex/notifications.ts)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getMyNotifications` | query | Yes | Get all notifications for current user, descending by createdAt |
| `getUnreadCount` | query | Yes | Count of unread notifications for current user |
| `markAsRead` | mutation | Yes (owner) | Mark single notification as read. Ownership check enforced. |
| `markAllAsRead` | mutation | Yes | Mark all of current user's unread notifications as read |
| `remove` | mutation | Yes (owner) | Delete a notification. Ownership check enforced. |

### Existing (convex/settings.ts)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `update` | mutation | Yes | Upsert user settings. Creates with defaults if missing. |

### Needed

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `createNotification` | internalMutation | System | Create a notification for a user. Input: userId, type, title, message, optional caseId. Called by event handlers, not by clients. |
| `createBatchNotifications` | internalMutation | System | Create notifications for multiple users (e.g., all followers of a case on case_update). Input: array of userIds + shared type/title/message/caseId. |
| `getSettings` | query | Yes | Get current user's settings (for preferences UI). Currently missing — Settings.tsx uses mock data. |

## Trigger Map

Every notification type maps to specific platform events. When the event occurs, the responsible mutation/action calls `createNotification` internally.

| Notification Type | Trigger Event | Source Function | Recipient |
|-------------------|---------------|-----------------|-----------|
| `donation_received` | Stripe webhook confirms payment | `http.ts` Stripe handler | Case/campaign owner |
| `case_update` | Case owner or clinic posts structured update | `cases.ts` update mutation | All donors to this case + followers |
| `achievement_unlocked` | Achievement awarded to user | `achievements` award mutation (to be built) | Achievement recipient |
| `campaign_ended` | Campaign reaches goal or end date | `campaigns.ts` status mutation | Campaign creator + donors |
| `system` | Admin broadcasts message | Admin tool (to be built) | Targeted users or all users |

## UI Surfaces

### Existing (implemented)

- **Notifications page** (`src/pages/Notifications.tsx`) — Route: `/notifications` (AuthGuard). Wired to Convex: `api.notifications.getMyNotifications`, `markAsRead`, `markAllAsRead`, and `remove`.
- **Settings page** (`src/pages/Settings.tsx`) — Route: `/settings` (AuthGuard). Wired to Convex: `api.settings.getSettings` and `api.settings.update` (also syncs language to i18next).

### Needed

- **Nav badge count** — Bell icon in navigation with unread count badge. Uses `api.notifications.getUnreadCount` via Convex subscription (real-time). Badge hidden when count is 0. Never show hardcoded numbers.
- **Notification deep linking** — Each notification row is clickable. Routing logic: `donation_received` with caseId → `/case/:caseId`, `case_update` with caseId → `/case/:caseId`, `achievement_unlocked` → `/achievements`, `campaign_ended` → `/campaigns`, `system` → no navigation (in-line content).
- **Empty state** — "No notifications yet. Follow cases or donate to start receiving updates."

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Notification storm (50 donations to one case in an hour) | Batch into summary notification: "You received 12 donations in the last hour totaling €340." Implementation: debounce window in createNotification — if >5 donation_received for same case in 60 min, replace with summary. |
| User with thousands of notifications | Pagination on `getMyNotifications` (cursor-based). Load 50 per page. |
| Notification for deleted case | Deep link gracefully handles missing case (show notification with "This case is no longer available" if case is null). |
| Spam via system notifications | `system` type only creatable via internalMutation (admin). Not client-callable. |
| User preference ignored | All delivery channels (in-app, push, email) must check `userSettings` before sending. In-app always delivers (no opt-out for in-app — user can clear manually). |
| Unread count desync | `getUnreadCount` is a live Convex query — always accurate. No client-side cache. |

## Acceptance Criteria

- [ ] Notification creation stores required fields: `userId`, `type`, `title`, `message`, `read: false`, `createdAt`.
- [ ] `getUnreadCount` returns accurate live count via Convex real-time subscription — never hardcoded or cached.
- [ ] `markAsRead` enforces ownership (only notification’s `userId` can mark it read); `markAllAsRead` bulk-updates all unread for current user.
- [ ] `remove` enforces ownership check — only notification’s owner can delete it.
- [ ] Deep linking routes correctly: `donation_received`/`case_update` with `caseId` → `/cases/:caseId`, `achievement_unlocked` → `/achievements`.
- [ ] Notification for a deleted case shows graceful fallback instead of broken link.
- [ ] System notification type is only creatable via `internalMutation` — never client-callable.
- [ ] Notification content never includes PII of other users.

## Open Questions

1. **Notification type expansion** — Current 5 types may not cover all engagement scenarios. Future candidates: `follow_activity` (someone you follow created a case), `volunteer_request` (transport help needed nearby), `community_mention` (someone replied to your post), `clinic_claim_approved` (your clinic claim was reviewed). Should the schema use a broader union or keep types tight and extend later? **→ Needs decision before scaling.**

2. **Batching/throttling implementation** — The trigger map assumes 1:1 event→notification. For high-volume events (popular case receiving many donations), what's the batching strategy? Options: (a) debounce window (1 summary per hour), (b) count threshold (summarize after 5 in 10 min), (c) always create individual notifications and let the UI group them. **→ Needs decision.**

3. **Push notification provider** — Capacitor supports FCM (Android) and APNs (iOS). Implementation requires: server-side push token storage, push sending service (Firebase Cloud Functions, Convex action + FCM API, or third-party like OneSignal). **→ Post-MVP but needs architecture decision early.**

4. **Email delivery provider** — Options: Resend (simple, React Email templates), SendGrid (mature, high volume), Convex HTTP action + SMTP. **→ Post-MVP decision.**

