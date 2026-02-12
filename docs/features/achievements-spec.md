# Badges & Achievements Spec

> **Owner:** Product
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** (P3 — not yet in PRD checklist)

## Purpose

Gamification that builds trust. Badges reward meaningful actions (donating, volunteering, verifying) and signal credibility to other users. When a donor sees a "Verified Veterinarian" badge on a case update or a "Helped 100" badge on a profile, it increases confidence that the platform and its users are legitimate. Achievements also drive retention — progress toward the next badge keeps users engaged.

## User Stories

- As a **donor**, I want to earn badges for my donations so I feel recognized for my contributions.
- As a **volunteer**, I want badges that reflect my transport/fostering activity so my profile shows credibility.
- As a **user**, I want to see verification badges on profiles and case cards so I know who's been vetted.
- As a **professional**, I want a "Verified Veterinarian" badge after admin verification so case owners trust my updates.
- As a **user**, I want a dedicated achievements page showing all badges (earned and locked) so I know what I can work toward.

## Functional Requirements

1. **20 badge types** across 4 categories (see Badge Catalog below).
2. **Automatic awards** — Donation and volunteer activity badges are triggered automatically when conditions are met (e.g., first_donation unlocks after first completed donation).
3. **Manual awards** — Verification and special badges are awarded by admin after review (e.g., verified_veterinarian after credential check).
4. **Badge display surfaces** — Profile page (all earned badges), case cards (verification badges only), achievements gallery page.
5. **Achievement metadata** — Each badge has: title, description, icon (emoji), and optional `awardedBy` reference for manual awards.
6. **One badge per type per user** — A user cannot earn the same badge twice. Uniqueness enforced by `by_user` index + type check.
7. **Unlock timestamp** — `unlockedAt` records when the badge was earned.

## Non-Functional Requirements

- **Performance**: Badge check on donation should add <50ms to the mutation. Use simple count queries, not full scans.
- **Consistency**: Badge awards must be idempotent — re-running a trigger for an already-awarded badge is a no-op.
- **i18n**: Badge titles and descriptions served from `ACHIEVEMENT_DETAILS` constant, which should be wrapped in i18n keys for translation.
- **Accessibility**: Badge icons are decorative (emoji) — title text provides the accessible label. Achievement gallery page is keyboard-navigable.

## Data Model

### `achievements` table (schema.ts L107–L145)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `Id<"users">` | Yes | Badge recipient |
| `type` | `union(20 types)` | Yes | Badge type identifier (see catalog) |
| `unlockedAt` | `number` | Yes | Award timestamp |
| `metadata` | `optional(object)` | No | `{ description?: string, awardedBy?: Id<"users"> }` |

**Indexes:** `by_user` (userId), `by_type` (type)

## Badge Catalog

### Donation Badges (8)

| Type | Title | Description | Unlock Condition | Award |
|------|-------|-------------|------------------|-------|
| `first_donation` | First Steps | Made your first donation | 1 completed donation | Auto |
| `monthly_donor` | Monthly Hero | Donated every month for 3 months | 3 consecutive calendar months with ≥1 donation each | Auto |
| `helped_10` | Helping Hand | Helped 10 animals | 10 completed donations to distinct cases | Auto |
| `helped_50` | Animal Guardian | Helped 50 animals | 50 completed donations to distinct cases | Auto |
| `helped_100` | Legend | Helped 100 animals | 100 completed donations to distinct cases | Auto |
| `big_heart` | Big Heart | Single donation over 100 BGN | 1 donation with amount ≥ 100 (in BGN equivalent) | Auto |
| `early_supporter` | Early Supporter | Joined during our first year | Account created before platform's first anniversary date | Auto |
| `community_hero` | Community Hero | Shared 10 cases with friends | 10 unique case shares (requires share tracking) | Auto |

### Verification Badges (6)

| Type | Title | Description | Unlock Condition | Award |
|------|-------|-------------|------------------|-------|
| `verified_volunteer` | Verified Volunteer | Verified volunteer status | Admin approves volunteer verification | Manual |
| `verified_veterinarian` | Verified Veterinarian | Licensed veterinarian | Admin verifies professional credentials | Manual |
| `verified_groomer` | Verified Groomer | Professional pet groomer | Admin verifies professional credentials | Manual |
| `verified_trainer` | Verified Trainer | Certified pet trainer | Admin verifies professional credentials | Manual |
| `verified_business` | Verified Business | Verified pet business | Admin verifies business registration | Manual |
| `verified_shelter` | Verified Shelter | Verified animal shelter | Admin verifies shelter registration | Manual |

### Volunteer Activity Badges (4)

| Type | Title | Description | Unlock Condition | Award |
|------|-------|-------------|------------------|-------|
| `top_transporter` | Top Transporter | Transported 10+ animals | 10 completed transport activities logged | Auto |
| `foster_hero` | Foster Hero | Fostered 5+ animals | 5 completed fostering activities logged | Auto |
| `rescue_champion` | Rescue Champion | Participated in 10+ rescues | 10 rescue case participations logged | Auto |
| `event_organizer` | Event Organizer | Organized community events | 3 events organized (logged by admin or system) | Manual |

### Special Badges (2)

| Type | Title | Description | Unlock Condition | Award |
|------|-------|-------------|------------------|-------|
| `founding_member` | Founding Member | Early platform supporter | Account created before public launch date | Auto |
| `ambassador` | Ambassador | Platform ambassador | Admin-awarded for exceptional community contribution | Manual |

## API Surface

### Existing (convex/achievements.ts)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getMyAchievements` | query | Yes | Get all achievements for current user. Merges with `ACHIEVEMENT_DETAILS` constant to add title, description, and icon emoji for each badge. |

**`ACHIEVEMENT_DETAILS` constant** — Maps all 20 badge types to `{ title, description, icon }`. Lives in achievements.ts.

### Needed

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getUserAchievements` | query | No | Get achievements for any user by userId. For public profile display. Returns only type + unlockedAt (no internal metadata). |
| `awardAchievement` | internalMutation | System | Award a badge. Input: userId, type, optional metadata. Checks uniqueness (no duplicate awards). Inserts achievement row. Triggers `notification.createNotification` with type `achievement_unlocked`. |
| `checkDonationBadges` | internalMutation | System | Called after every completed donation. Checks: first_donation (count=1), helped_10/50/100 (distinct cases), big_heart (amount≥100), monthly_donor (3 consecutive months). Awards any newly qualified badges. |
| `checkVolunteerBadges` | internalMutation | System | Called after volunteer activity is logged. Checks: top_transporter (10 transports), foster_hero (5 fosters), rescue_champion (10 rescues). Awards any newly qualified. |
| `awardVerificationBadge` | internalMutation | Admin | Admin awards a verification badge. Input: userId, verification type. Creates achievement + updates user's `verificationLevel`. Audit log entry. |
| `awardSpecialBadge` | internalMutation | Admin | Admin awards founding_member, ambassador, or event_organizer. Input: userId, type, optional description. Audit log entry. |
| `revokeAchievement` | internalMutation | Admin | Remove a badge (e.g., if verification is revoked). Deletes achievement row. Audit log entry. |

### Trigger Integration Points

| Event | Source | Badge Check |
|-------|--------|-------------|
| Donation completed | `donations.ts` / Stripe webhook | `checkDonationBadges(userId)` |
| Volunteer activity logged | `volunteers.ts` (future) | `checkVolunteerBadges(userId)` |
| Admin verifies professional | Admin tool | `awardVerificationBadge(userId, type)` |
| User account created | `users.ts` / Clerk webhook | Check `early_supporter` / `founding_member` eligibility |
| Case shared | Share tracking (future) | Check `community_hero` (10 shares) |

## UI Surfaces

### Existing (needs rewiring)

- **Achievements page** (`src/pages/Achievements.tsx`, 311 lines) — Route: `/achievements` (AuthGuard). Currently uses **hardcoded mock data** — 8 mock achievements with XP values and tier system (bronze/silver/gold/platinum). **Needs:** Replace mock data with `api.achievements.getMyAchievements`. Remove XP/tier UI (not in data model — see note below). Show all 20 badge types: earned badges in "Unlocked" section, remaining in "Locked" section.

### Needed changes to existing page

- Remove XP point values and tier system (the current UI shows XP totals, progress bars toward tiers, and tier badges — none of which have backend support, and are excluded from this spec)
- Wire to `api.achievements.getMyAchievements` query
- Show locked badges with descriptions of how to earn them
- Add unlock animation or highlight for recently earned badges (within last 24h)

### Other display surfaces

- **Profile page** — Show earned badges in a horizontal badge strip. Verification badges prominently displayed near name. Click any badge to see title + description + unlock date.
- **Case cards** — Show only verification badges (verified_volunteer, verified_veterinarian, etc.) next to the case creator's name. This is a trust signal — donors see at a glance that a clinic-verified vet is behind a case update.
- **Notification** — When a badge is earned, in-app notification: "🎉 You earned the [badge title] badge!"

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Double award attempt | `awardAchievement` checks for existing badge of same type for user. If exists, no-op (idempotent). |
| Badge revocation (verification revoked) | `revokeAchievement` deletes achievement row. Badge disappears from profile. No notification for revocation (avoid confusion). |
| Badge for deleted account | Achievements are orphaned but harmless. Cleanup via scheduled job or on account deletion. |
| Gaming donation badges | `helped_10` counts distinct cases, not total donations. Donating €1 to 10 different cases earns the badge. This is acceptable — it's still 10 animals helped. |
| monthly_donor edge cases | "3 consecutive months" means calendar months. If user donates Jan 15, Feb 28, Mar 1 → qualifies. Gap of a full calendar month resets the streak. |
| community_hero without share tracking | `community_hero` requires share event tracking which doesn't exist yet. Badge cannot be auto-awarded until share tracking is implemented. Mark as "coming soon" in locked badges UI. |

## Excluded from this Spec

- **XP points and tier system** — The current `Achievements.tsx` UI shows an XP gamification layer (bronze/silver/gold/platinum tiers with XP thresholds). This has **no backend support** (no XP field in schema, no tier calculation in queries). Per product decision, XP/tiers are excluded from this spec. If desired in the future, it would require schema changes and a new DECISIONS.md entry.

## Acceptance Criteria

- [ ] User with 10 distinct-case donations sees `helped_10` badge on their profile within 5 seconds of the 10th donation confirming.
- [ ] `verified_volunteer` badge is awarded automatically when a user completes onboarding with `userType: volunteer`.
- [ ] Duplicate badge awards are silently skipped — no error, no duplicate record.
- [ ] Badge catalog is read-only — defined in code/config, not user-editable.
- [ ] Profile badge display shows max 6 badges with "View All" for overflow.
- [ ] Achievement notifications appear in the notification feed within 10 seconds of award.
- [ ] Un-earned badges do not leak in any API response — no "locked badge" UI that reveals future gamification.
- [ ] `listUserAchievements` returns badges sorted by award date, newest first.

## Open Questions

1. **`volunteers.badges` overlap** — The `volunteers` table has a `badges: string[]` field that stores badge identifiers. The `achievements` table also tracks volunteer-related badges (`verified_volunteer`, `top_transporter`, etc.). Should volunteer badges be stored only in the `achievements` table and the `volunteers.badges` field removed? **→ Needs DECISIONS.md entry. See also volunteers-spec.md Open Question #2.**

2. **Share tracking for community_hero** — The `community_hero` badge requires tracking case shares. No share event logging exists today. Options: (a) Log shares via a `shares` table, (b) use Capacitor/Web Share API callback, (c) defer this badge until share analytics are built. **→ Needs implementation decision.**

3. **Badge icon rendering** — Current spec uses emoji for badge icons (🎉, 🐾, 🛡️, etc.). Should this evolve to custom SVG icons for a more polished look? Emoji works cross-platform but limits design control. **→ Design decision.**

4. **Public badge API privacy** — `getUserAchievements` is public (for profile display). Should any badge types be hidden from public view? Recommendation: all badges are public — they're trust signals, not private data. But confirm.
