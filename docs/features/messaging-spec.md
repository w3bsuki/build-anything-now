# Direct Messaging Spec

> **Owner:** Product
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** MESSAGING

> **Implementation status: POST-MVP.** This spec defines the target design for when messaging ships. The schema table exists, a preview page exists, but zero backend functions are implemented. PRD explicitly lists MESSAGING as "Future (Not Now)."

## Purpose

Enable 1:1 private communication between platform users — donors following up with rescuers, volunteers coordinating on logistics, adopters inquiring about listings. Messaging transforms Pawtreon from a broadcast platform into a coordination tool, but it ships only after core trust and money primitives are solid.

## User Stories

- As a **donor**, I want to message a rescuer to ask how an animal is doing after I donated.
- As a **volunteer**, I want to coordinate with a case owner about transport logistics without sharing my phone number publicly.
- As an **adopter**, I want to inquire about an animal I'm interested in adopting.
- As a **user**, I want to see all my conversations in one inbox so I can manage my communications.
- As a **user**, I want to block someone who is harassing me in messages.
- As an **admin**, I want to review reported conversations to enforce community safety.

## Functional Requirements

1. **1:1 messaging only** — No group chats. Conversations are between exactly two users.
2. **Conversation view** — Messages between two users displayed in chronological order. Sender-receiver pair defines a conversation (both directions combined).
3. **Inbox / conversation list** — List of all conversations for current user, sorted by most recent message. Shows: other user's name/avatar, last message preview (truncated), timestamp, unread indicator.
4. **Message composition** — Text input with send button. No rich text, no file attachments in v1. Max 2000 characters per message.
5. **Read status** — Boolean `read` per message. Unread messages trigger badge count. Read status updates when conversation is opened.
6. **Real-time updates** — Convex subscriptions for live message delivery. New messages appear instantly without refresh.
7. **Unread count in nav** — Aggregate unread message count displayed on messages nav icon.
8. **Block user** — User can block another user, preventing further messages in either direction. Blocked user sees no error — messages silently fail to deliver.
9. **Report conversation** — User can report a conversation for review (spam, harassment, scam). Creates a moderation queue entry.
10. **Content safety** — No automatic PII detection in v1, but UI should discourage sharing phone/email in messages (guidance text: "Share contact details at your own discretion").

## Non-Functional Requirements

- **Real-time**: Messages must appear within 1 second via Convex subscription.
- **Privacy**: Message content is private between participants. Only admin can access reported conversations. No message content in notifications (only "You have a new message from [name]").
- **Performance**: Conversation list loads in <200ms. Message thread supports infinite scroll with cursor-based pagination.
- **i18n**: UI chrome is translatable. Message content is user-generated (no translation).
- **Security**: All mutations require auth. Ownership checks on read/delete. Block state enforced server-side.

## Data Model

### `messages` table (schema.ts L693–L701)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `senderId` | `Id<"users">` | Yes | Message sender |
| `receiverId` | `Id<"users">` | Yes | Message recipient |
| `content` | `string` | Yes | Message text (max 2000 chars) |
| `read` | `boolean` | Yes | Read by recipient |
| `createdAt` | `number` | Yes | Timestamp |

**Indexes:** `by_sender` (senderId), `by_receiver` (receiverId), `by_conversation` (senderId, receiverId)

### Needed schema additions (future)

| Table/Field | Type | Purpose |
|-------------|------|---------|
| `blockedUsers` table | `{ blockerId: Id<"users">, blockedId: Id<"users">, createdAt: number }` | Track block relationships |
| `messages.deletedBySender` | `optional(boolean)` | Soft-delete for sender side |
| `messages.deletedByReceiver` | `optional(boolean)` | Soft-delete for receiver side |

## API Surface

### Existing

**No convex/messages.ts file exists.** Zero backend functions.

### Needed

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `sendMessage` | mutation | Yes | Send message. Input: receiverId, content. Validates: content ≤ 2000 chars, receiver exists, sender ≠ receiver, not blocked. Sets read=false. |
| `getConversation` | query | Yes | Get messages between current user and another user. Both directions (sender=me OR receiver=me). Sorted by createdAt asc. Cursor-based pagination (load 50 at a time). |
| `listConversations` | query | Yes | Inbox: get all unique conversation partners for current user. For each: last message, other user's name/avatar, unread count. Sorted by most recent message desc. |
| `markConversationRead` | mutation | Yes | Mark all unread messages in a conversation as read. Input: otherUserId. Only marks messages where current user is receiver. |
| `getUnreadCount` | query | Yes | Total unread message count across all conversations. |
| `blockUser` | mutation | Yes | Block a user. Creates blockedUsers entry. |
| `unblockUser` | mutation | Yes | Remove block. |
| `reportConversation` | mutation | Yes | Report a conversation. Creates entry in reports or a dedicated messageReports table. |
| `deleteMessage` | mutation | Yes (sender) | Soft-delete a message for the sender. |

## UI Surfaces

### Existing (preview only)

- **Messages page** (`src/pages/Messages.tsx`) — Route: `/messages/:userId` (AuthGuard). Preview page with hardcoded demo messages. Shows "Preview — messaging ships after MVP" subtitle. Has a text composer but it's a no-op. References `api.users.getProfileByIdOrMe` for the target user's name only.
- **Community shell** has a `/community/messages` route rendering a `CommunityMessagesPreview` component.

### Target (when implemented)

- **Inbox page** — Route: `/messages`. Lists all conversations. Each row: avatar, name, last message excerpt, timestamp, unread dot. Tap navigates to conversation thread.
- **Conversation thread** — Route: `/messages/:userId`. Message bubbles (sent = right-aligned blue, received = left-aligned gray). Composer at bottom with text input + send button. Header: other user's name/avatar + back button + overflow menu (block, report). Auto-scroll to bottom on new message.
- **Nav badge** — Unread message count on messages nav icon. Uses `getUnreadCount` subscription.
- **Entry points** — "Message" button on: public profile page, case owner section, adoption listing, volunteer profile.

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| User sends messages to blocked user | Server-side check: if blocked, mutation throws or silently drops. No error leak to sender (prevents block detection). |
| Spam messaging (high volume) | Rate limit: max 60 messages per user per hour. Exceeding limit returns error. |
| Harassing content | Report conversation flow → admin moderation queue. Admin can view message thread for reported conversations only. |
| PII sharing in messages | Guidance text in UI. No automatic scanning in v1. Future: regex-based warning for phone/email patterns. |
| Message to non-existent user | Mutation validates receiver exists before inserting. |
| Self-messaging | Mutation blocks senderId === receiverId. |
| Very long conversation threads | Cursor-based pagination. Load 50 messages at a time. Scroll-to-load-more for older messages. |

## Acceptance Criteria

> **Note:** These criteria define the target behavior for when messaging ships (POST-MVP).

- [ ] Authenticated user can send a direct message to another user.
- [ ] Messages appear in both sender and recipient conversation views in real-time (<2 seconds).
- [ ] Blocking a user prevents message delivery in both directions.
- [ ] Blocked user does not receive an indication that they are blocked (messages fail silently).
- [ ] Conversation list shows most recent message preview, unread count, and timestamp.
- [ ] Message content is sanitized (no raw HTML/script injection).
- [ ] Unread message count appears in navigation badge (powered by backend query).
- [ ] Conversation history loads with cursor-based pagination (50 messages per page).
- [ ] Deleted messages show "This message was deleted" placeholder — not removed from thread.

## Open Questions

1. **Build timing** — PRD says "Future (Not Now)" and "we can add messaging later." When is the right time to build? After: (a) donations are live, (b) trust primitives are solid, (c) volunteer coordination needs messaging as a channel? **→ Human decision.**

2. **Typing indicators** — Should the UI show "User is typing..." in real time? Adds complexity (ephemeral state via Convex) but improves chat UX. **→ Post-v1 of messaging.**

3. **Message notifications** — When messaging ships, the notification system (see notifications-spec.md) needs a new type: `new_message`. Should this be in-app only, or also push? Volume could be high for active conversations. **→ Decide with notification batching strategy.**

4. **Admin access scope** — Can admins read any conversation, or only reported ones? Recommendation: reported conversations only, with audit log of admin access. **→ Needs policy decision.**

5. **Media attachments** — v1 is text-only. Should v2 support image attachments (useful for sharing photos of animals in coordination)? Would require storage integration similar to case photos. **→ Post-v1 enhancement.**
