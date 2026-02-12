# Fundraising Campaigns Spec

> **Owner:** Product + OPUS
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** MISSION INITIATIVES

---

## Purpose

Campaigns aggregate fundraising beyond individual cases. Pawtreon has **two campaign types**: **rescue campaigns** (tied to specific cases or groups of cases, short-term emergency funding) and **initiative campaigns** (platform-level missions like the drone program or safehouse — long-term, milestone-based). Campaigns provide transparency through progress tracking, milestone reporting, and spend summaries. Initiative campaigns are the vehicle for Pawtreon's "movement" narrative — they show the platform is more than an app.

---

## User Stories

- As a **rescuer**, I want to create a rescue campaign that groups multiple related cases so I can fund a larger rescue operation.
- As a **donor**, I want to browse campaigns with clear progress and goals so I know where my money goes.
- As a **first-time visitor**, I want to see featured initiatives on the home feed so I understand Pawtreon's mission.
- As an **admin**, I want to create and manage initiative campaigns with milestones and spend transparency.
- As a **partner/sponsor**, I want to contribute to named campaigns for visibility and impact.

---

## Functional Requirements

### Campaign Types

| Type | `campaignType` | Purpose | Creator | Lifespan |
|---|---|---|---|---|
| **Rescue** | `"rescue"` | Emergency funding for case(s) | Rescuers (future: any authenticated user with active case) | Short-term (weeks) |
| **Initiative** | `"initiative"` | Platform-level mission programs | Admin only | Long-term (months/years) |

### Initiative Classification

Initiative campaigns have an additional `initiativeCategory`:

| Category | Description | Example |
|---|---|---|
| `drone` | Drone support program | Animal detection flights, thermal imaging |
| `safehouse` | Safehouse & adoption center | Temporary housing, socialization, adoption |
| `platform` | Platform improvement | Feature development, infrastructure |
| `other` | Other initiative type | Community events, education |

### Campaign Fields

| Field | Type | Required | Purpose |
|---|---|---|---|
| `title` | `string` | Yes | Campaign name |
| `description` | `string` | Yes | What the campaign does |
| `image` | `string?` | No | Hero/cover image URL |
| `campaignType` | `"rescue" \| "initiative"` | No (optional) | Campaign classification |
| `initiativeKey` | `string?` | No | Unique key for initiative lookup |
| `initiativeCategory` | enum(4) | No | Initiative sub-type |
| `featuredInitiative` | `boolean?` | No | Featured placement flag |
| `goal` | `number` | Yes | Target amount/count |
| `current` | `number` | Yes | Current progress |
| `unit` | `string` | Yes | Unit label: `"EUR"`, `"homes"`, `"surgeries"`, `"meals"` |
| `endDate` | `string?` | No | ISO date string deadline |
| `status` | `"active" \| "completed" \| "cancelled"` | Yes | Campaign lifecycle |
| `createdAt` | `number` | Yes | Creation timestamp |

### Campaign Lifecycle

```
active ──→ completed  (goal reached or manually completed)
  │
  └──→ cancelled  (withdrawn)
```

- `active` — Accepts donations, visible in listings
- `completed` — Goal met or manually closed; shown as success story
- `cancelled` — Withdrawn; hidden from listings (admin only)

---

## Campaign Creation (Gap: needs implementation)

**Current state:** No `create` or `update` mutations exist in `convex/campaigns.ts`. Campaigns are seed-only data.

### Required Mutations

| Mutation | Auth | Purpose |
|---|---|---|
| `campaigns.create` | required (admin for initiatives, rescuer for rescue) | Create new campaign |
| `campaigns.update` | required (creator or admin) | Update title, description, image, goal, endDate |
| `campaigns.updateProgress` | internal | Increment `current` when donation completes |
| `campaigns.close` | required (creator or admin) | Set status to completed/cancelled |

### Creation Rules

- **Initiative campaigns:** Admin-only. Must set `campaignType: "initiative"`, `initiativeCategory`, and optionally `featuredInitiative`.
- **Rescue campaigns:** Authenticated rescuers with at least one active case. Must set `campaignType: "rescue"`. Linked to case(s) via donation `campaignRefId`.
- **Validation:** Title ≤ 100 chars, description ≤ 2000 chars, goal > 0.

---

## Featured Placement

Per Decision 2026-02-06 (Mission campaign placement in product UX):

### Home Feed Module

- Featured initiatives shown in a dedicated module on home feed
- **Always after rescue content** — initiatives never above urgent cases
- Maximum 3 featured initiatives displayed
- Each shows: image, title, progress bar, unit

### Account/Profile Hub

- Initiatives section on Account page (`Account.tsx`)
- `CampaignCard` component renders featured initiatives
- Links to full campaign detail

### Campaigns Listing Page

- Full campaigns directory at `/campaigns`
- Filter pills: All / Rescue / Initiative
- Switch toggle for "nearby" filter
- `CampaignCard` component with progress bar

---

## Donation Flow Integration

Campaign donations follow the same Stripe checkout flow as case donations (see `donations-spec.md`):

1. User clicks donate on campaign
2. `donations.createCheckoutSession` called with `campaignRefId` (instead of `caseId`)
3. Stripe checkout → webhook → `confirmPaymentFromWebhook`
4. Donation linked to campaign via `campaignRefId`
5. Campaign `current` incremented (implementation needed)

**Schema linkage in `donations` table:**
- `campaignId` — string identifier (legacy)
- `campaignRefId` — `Id<"campaigns">` reference (canonical)
- `by_campaign_ref` index for efficient lookups

---

## Transparency Requirements

Each campaign must show (from `docs/mission/pawtreon-initiatives.md`):

1. **Funding goal and progress** — Progress bar with `current` / `goal` and percentage
2. **Milestone status** — For initiatives: what's been achieved, what's next
3. **Spend/use-of-funds summary** — How money is being used (initially manual text in `description`)
4. **Risks and next checkpoint date** — For initiatives: honest about challenges

**Note:** Milestone tracking is currently textual (in `description`). Structured milestone tracking (separate milestone objects with status) is a future enhancement.

---

## Discovery Surfaces

| Surface | Route | What's Shown |
|---|---|---|
| **Campaigns page** | `/campaigns` | All campaigns with filter pills (all/rescue/initiative) |
| **Campaign detail** | `/campaign/:id` | Full campaign info, progress, donate CTA, share |
| **Home feed** | `/` | Featured initiative module (max 3, below cases) |
| **Account page** | `/account` | Organization's campaigns / featured initiatives |
| **Partner pages** | `/partners`, `/partner/:id` | Cross-linked campaigns |

---

## Data Model

### `campaigns` Table (schema L450-L469)

See Campaign Fields above for full field listing.

**Indexes:**
- `by_status` — Filter active/completed/cancelled
- `by_campaign_type` — Filter rescue vs initiative
- `by_featured_initiative` — Featured initiative lookup

---

## API Surface

### Existing Functions

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `campaigns.list` | query | no | Filter by status, campaignType |
| `campaigns.get` | query | no | Single campaign by ID |
| `campaigns.getFeaturedInitiatives` | query | no | Active initiatives, featured first, with progress % |

### Required Functions (not yet implemented)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `campaigns.create` | mutation | required | Create campaign (admin for initiative, rescuer for rescue) |
| `campaigns.update` | mutation | required | Update campaign fields |
| `campaigns.updateProgress` | internalMutation | internal | Increment current on donation |
| `campaigns.close` | mutation | required | Complete or cancel campaign |

---

## UI Surfaces

| Page/Component | Route | Purpose |
|---|---|---|
| `Campaigns.tsx` | `/campaigns` | Campaign listing with filter pills |
| `CampaignProfile.tsx` | `/campaign/:id` | Campaign detail page |
| `CampaignCard` | component | Campaign card with progress bar |
| `FilterPills` | component | All / Rescue / Initiative toggle |
| Home feed initiative module | `/` | Featured initiatives section |
| Account initiatives section | `/account` | User's initiative CTA |

---

## Edge Cases & Abuse

1. **Campaign without donations** — Display progress at 0%, no special handling
2. **Overfunding** — `current > goal` is allowed; no auto-close. Show as "Exceeded goal" with surplus amount
3. **Orphaned rescue campaigns** — If all linked cases close, campaign should auto-complete or prompt creator
4. **Fake campaigns** — Initiative campaigns are admin-only. Rescue campaigns require active case ownership. Report button available.
5. **Campaign after cancel** — Cancelled campaigns are hidden from listings but data preserved for audit
6. **Currency mismatch** — Campaign `unit` may not be monetary (e.g., "meals", "surgeries"). Progress display adapts to unit type.

---

## Non-Functional Requirements

1. Campaign list and detail queries SHOULD remain performant for mobile usage (<500ms on typical MVP datasets).
2. Campaign progress values MUST be derived from server-confirmed donation completions, never client-side increments.
3. Initiative vs rescue campaign visibility rules MUST be deterministic and reviewable in admin flows.
4. Campaign interfaces MUST follow trust-surface accessibility and token-styling constraints.

---

## Acceptance Criteria

- [ ] Campaign creation for initiative type requires admin role; rescue type requires authenticated user with at least one active case.
- [ ] Campaign lifecycle allows only forward transitions: `active → completed` and `active → cancelled`; no revert to active.
- [ ] Featured initiatives appear on home feed after rescue content, max 3 displayed.
- [ ] `getFeaturedInitiatives` returns only active initiatives sorted by featured status first, with computed progress percentage.
- [ ] Campaign donations flow through the same Stripe checkout using `campaignRefId`, and campaign `current` is incremented on webhook confirmation.
- [ ] Overfunding (`current > goal`) is allowed with no auto-close; UI displays "Exceeded goal" with surplus amount.
- [ ] Cancelled campaigns are hidden from public listings but data is preserved for audit.
- [ ] Campaign listing page supports filter pills (All / Rescue / Initiative) and each card displays a progress bar.

## Open Questions

1. **Rescue campaign ↔ case linking** — How are rescue campaigns linked to specific cases? Currently `donations` have `campaignRefId`, but there's no explicit `campaignCases` junction table. Options: (a) campaign description references cases, (b) add `caseIds[]` to campaign, (c) link via donation `caseId` + `campaignRefId` overlap.

2. **Campaign creation permissions** — Currently seed-only. When rescue campaign creation ships, what's the minimum trust level? Require at least one `community`-verified case? Or any authenticated user with an active case?

3. **Structured milestones** — Initiative campaigns would benefit from a `milestones[]` embedded array (like case `updates[]`). Decide: add now or keep milestones in description text.

4. **Campaign updates/posts** — Should campaigns have their own update stream (like cases)? Or link to community posts?

5. **Recurring donations to campaigns** — PRD lists recurring support as Phase 2. Should campaigns support recurring donations? If so, what happens when campaign completes?
