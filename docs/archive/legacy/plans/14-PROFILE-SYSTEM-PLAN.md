# Profile System Plan

> **Status:** ✅ Implemented  
> **Priority:** High  
> **Completed:** January 16, 2026

---

## TL;DR

Current `/profile` is actually an account settings page. We need:
1. Rename it to `/account`
2. Create real public profiles at `/u/:userId`  
3. Add profile editing (bio, display name)
4. Wire up real stats from Convex

---

## Current Problems

| Problem | Impact |
|---------|--------|
| No public profiles | Users can't share their impact |
| `/profile` is actually account settings | Confusing UX |
| All stats are mock data | Not production ready |
| No profile editing | Users can't personalize |
| No saved cases feature | Missing engagement |

---

## Implementation Tasks

### Phase 1: Foundation (Day 1)

- [ ] **Rename routes**
  - `/profile` → `/account` (account settings hub)
  - Add `/u/:userId` for public profiles
  - Add `/profile` redirect → `/u/me` (own profile)

- [ ] **Schema updates** (`convex/schema.ts`)
  - Add to `users` table: `bio`, `displayName`, `isPublic`, `savedCases`
  - Add `savedItems` table for bookmarked cases

- [ ] **Convex queries** (`convex/users.ts`)
  - `getPublicProfile(userId)` - public profile data
  - `getProfileStats(userId)` - donation count, amount, animals helped
  - `updateProfile(data)` - update bio/displayName/visibility

### Phase 2: Public Profile Page (Day 2)

- [ ] **Create `PublicProfile.tsx`**
  - Avatar + display name + bio
  - Stats row (real data from Convex)
  - Badges/achievements showcase
  - Donation history (if public)
  - Share button (native share to socials)

- [ ] **Profile tabs**
  - Cases (for rescuers) - their active/past rescue cases
  - Impact (default for donors) - stats + recent donations
  - Badges - achievement showcase
  - Saved (own profile only) - bookmarked cases

### Phase 3: Profile Editing (Day 3)

- [ ] **Create `ProfileEditDrawer.tsx`**
  - Display name field
  - Bio textarea (280 char limit)
  - Public/private toggle
  - Uses Vaul drawer component

- [ ] **Wire up account page**
  - Replace mock stats with real queries
  - Add "Edit Profile" button that opens drawer

### Phase 4: Polish (Day 4)

- [ ] **Share functionality**
  - Generate share cards for profiles
  - Native share on mobile (Capacitor)
  - Copy link fallback on web

- [ ] **Saved cases feature**
  - Add bookmark button to case cards
  - Saved tab on profile
  - `toggleSaveCase` mutation

---

## Routes Summary

| Route | Purpose | Auth |
|-------|---------|------|
| `/u/:userId` | Public profile view | Optional |
| `/account` | Account settings hub | Required |
| `/account/donations` | Donation history | Required |
| `/account/settings` | App settings | Required |
| `/account/payments` | Payment methods | Required |

---

## NOT Building (Scope Control)

- ❌ Profile customization (themes, backgrounds)
- ❌ Feed algorithm (chronological is fine)

**Deferred (separate plan needed):**
- 💬 Full chat/messaging system → needs its own plan doc
- 📊 Activity feed → tied to notifications system

**Already exists:**
- Stories/circles on homepage ✅
- Cases as "posts" ✅

**Philosophy:** Keep this plan focused on profiles. Chat is important but deserves dedicated planning.

---

## Phase 5: Social Features (Day 5-6)

- [ ] **Follow system**
  - `follows` table in schema (followerId, followingId)
  - Follow button on profiles
  - "Following" tab on own profile
  - Notification when someone you follow posts a new case

- [ ] **Contact/Message flow**
  - "Message" button on profiles
  - Opens simple chat thread (1:1 only for now)
  - Basic: send text, see history
  - Push notification on new message
  - Future: group chats for case coordination (separate plan)

---

## Success Metrics

- Profile share rate > 5% of active users
- Profile completion rate > 60%
- Referral traffic from shared profiles

---

## Files to Create/Modify

**New files:**
- `src/pages/PublicProfile.tsx`
- `src/components/profile/ProfileEditDrawer.tsx`
- `src/components/profile/ProfileStats.tsx`
- `src/components/profile/ProfileBadges.tsx`
- `src/components/profile/ProfileCases.tsx`
- `src/components/chat/ChatThread.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/profile/FollowButton.tsx`

**Modify:**
- `convex/schema.ts` - add user fields + `follows` + `messages` tables
- `convex/users.ts` - add queries/mutations
- `convex/social.ts` - follow/unfollow logic
- `src/pages/Profile.tsx` → rename to `Account.tsx`
- `src/App.tsx` - update routes

---

## Reference

Existing patterns to follow:
- `/volunteers/:id` - similar profile structure
- `/clinics/:id` - public org pages
- `ProfileEditDrawer` - use Vaul like other drawers in app
