# Animal Rescue Cases Spec

> **Owner:** OPUS (implementation), Codex (risk review)
> **Status:** draft
> **Last updated:** 2026-02-12
> **PRD Ref:** CASE PAGE, CASE CARDS, CREATE CASE, LIST WITH AI, CASE UPDATES, CASE OUTCOMES

---

## Purpose

Cases are the **core object** of Pawtreon — every rescue story, every donation, every trust signal revolves around a case. A case represents a single animal rescue event: from discovery on the street, through treatment and fundraising, to a closed outcome (adoption, transfer, or other resolution). Cases carry structured evidence, verification status, fundraising mechanics, social interactions, and multi-language support. The case system must be fast to create (< 3 minutes), transparent to follow, and resistant to fraud.

---

## User Stories

- As a **finder**, I want to create a case in minutes with photos, location, and a funding goal so the animal gets help fast.
- As a **rescuer**, I want to post structured updates with medical evidence so donors trust my case.
- As a **donor**, I want to see verification status, update history, and fundraising progress so I donate confidently.
- As a **clinic**, I want to add clinic-verified updates to cases I'm treating so the case gains trust.
- As a **moderator**, I want to flag and review risky cases so scams don't reach donors.
- As a **reader**, I want to browse cases by urgency and city, like/save/comment on them, and see translations in my language.

---

## Functional Requirements

### Case Types (Rescue Urgency)

The `type` field classifies urgency level:

| Type | Meaning | Feed Priority | Example |
|---|---|---|---|
| `critical` | Life-threatening, needs immediate vet care | Highest — hero card eligible | Hit by car, severe injury, hypothermia |
| `urgent` | Needs attention within hours/days | High — prominent in feed | Abandoned puppies, untreated infection |
| `recovering` | In treatment, needs ongoing funding | Medium | Post-surgery recovery, medications |
| `adopted` | Legacy display / outcome showcase | Low — success stories section | Successfully homed animal |

### Case Categories

The `category` field classifies the nature of help needed:

| Category | Description |
|---|---|
| `surgery` | Surgical intervention required |
| `shelter` | Needs temporary or permanent shelter |
| `food` | Feeding assistance |
| `medical` | General medical care (non-surgical) |
| `rescue` | Active rescue operation needed |

### Manual Creation Flow

Multi-step form (implemented in `CreateCase.tsx`):

1. **Photos** — Upload 1+ images → Convex storage via `storage.generateUploadUrl`
2. **Location** — City + neighborhood (+ optional coordinates)
3. **Urgency** — Select `type` (critical/urgent/recovering/adopted) + `category`
4. **Goal** — Fundraising goal amount + currency
5. **Story** — Title + description + optional extended story
6. **Publish** — Submit via `cases.create` mutation

**On create, system auto-sets:**
- `verificationStatus` = `"unverified"`
- `lifecycleStage` = `"active_treatment"`
- `riskLevel` = `"low"`
- `status` = `"active"`
- `fundraising.current` = `0`
- `updates` = `[]`
- `language` = current i18n locale
- `createdAt` = `Date.now()`

### AI-Assisted Creation ("List with AI")

**Status: Preview/future** — per Decision 2026-01-23 (AI preview honesty):

Intended flow:
1. User uploads photo(s)
2. AI extracts: species, urgency, suggested title, draft story
3. User reviews and edits structured draft
4. User publishes (same gates as manual)

**Constraints (from RULES.md):**
- Human-in-the-loop — never auto-publish
- AI confidence shown as hint, not shown to donors
- Same trust gates apply (new account + reused images + high goal = flagged)
- Preview/demo must be labeled as demo

---

## Case Lifecycle

### Lifecycle Stages

The `lifecycleStage` field tracks the rescue journey:

```
active_treatment ──→ seeking_adoption ──→ closed_success
                │                    ├──→ closed_transferred
                │                    └──→ closed_other
                ├──→ closed_success
                ├──→ closed_transferred
                └──→ closed_other
```

### Transition Rules (enforced in `updateLifecycleStage` mutation)

| From | To | Allowed |
|---|---|---|
| `active_treatment` | `seeking_adoption` | Yes |
| `active_treatment` | `closed_success` | Yes |
| `active_treatment` | `closed_transferred` | Yes |
| `active_treatment` | `closed_other` | Yes |
| `seeking_adoption` | `closed_success` | Yes |
| `seeking_adoption` | `closed_transferred` | Yes |
| `seeking_adoption` | `closed_other` | Yes |
| Any `closed_*` | Any | **No — terminal state** |

### On Lifecycle Transition

When `updateLifecycleStage` is called:
1. Validate transition is allowed (throw if not)
2. Set `lifecycleStage` to new value
3. Set `lifecycleUpdatedAt` to current timestamp
4. If closing: set `status` = `"closed"`, `closedAt`, `closedReason`, `closedNotes`
5. Auto-add a `milestone` update to the updates array describing the transition
6. Write audit log entry (`entityType: "case"`, `action: "lifecycle_transition"`)

### Funding Status (`status` field)

Separate from lifecycle, tracks the fundraising state:

| Status | Meaning |
|---|---|
| `active` | Accepts donations |
| `funded` | Goal reached (still active for updates) |
| `closed` | No more donations accepted |

---

## Structured Updates

Cases carry an embedded `updates[]` array — a timestamped evidence trail.

### Update Object Shape

```typescript
{
  id: string,              // UUID generated on creation
  date: number,            // Timestamp
  type: "medical" | "milestone" | "update" | "success",
  text: string,            // Update content (≤3000 chars)
  images?: Id<"_storage">[], // Optional photo evidence
  evidenceType?: "bill" | "lab_result" | "clinic_photo" | "receipt" | "prescription" | "other",
  clinicId?: Id<"clinics">,  // Clinic attribution
  clinicName?: string,       // Display snapshot of clinic name
  authorRole?: "owner" | "clinic" | "moderator"
}
```

### Update Types

| Type | Purpose | Typical Evidence |
|---|---|---|
| `medical` | Medical treatment progress | Bills, lab results, clinic photos |
| `milestone` | Lifecycle transitions (auto-generated) | None (system text) |
| `update` | General progress updates | Photos, narrative |
| `success` | Successful outcome celebration | Adoption photo, thank-you |

### Adding Updates (`addUpdate` mutation)

**Permissions:**
- Case owner (`authorRole: "owner"`)
- Clinic staff with clinic role (`authorRole: "clinic"`)
- Admin/moderator (`authorRole: "moderator"`)

**Validation:**
- `text` ≤ 3000 characters
- Auth required
- Ownership or role check
- Audit logged (`entityType: "case"`, `action: "add_update"`)

### UI Display

- Timeline component on case detail page (`UpdatesTimeline`)
- Each update shows: type icon, date, author role badge, text, evidence chips, clinic attribution
- Photos are resolvable via Convex storage URLs

---

## Fundraising Mechanics

### Data Shape

```typescript
fundraising: {
  goal: number,     // Target amount
  current: number,  // Amount raised so far
  currency: string  // "EUR" (primary), allows any string
}
```

### How `current` Increments

1. Donor initiates checkout via `donations.createCheckoutSession`
2. Stripe processes payment
3. Webhook fires `checkout.session.completed` or `payment_intent.succeeded`
4. `donations.confirmPaymentFromWebhook` or `confirmCheckoutSessionFromWebhook`:
   - Finds pending donation by Stripe session/payment intent ID
   - Updates donation `status` → `"completed"`
   - Patches case `fundraising.current` += donation amount
   - Generates `receiptId`

### Progress Display

- Progress bar on case card and detail page
- Percentage calculated: `(current / goal) * 100`
- Shows `current` / `goal` with currency symbol
- No fake amounts — only real completed donations count (RULES.md)

---

## Trust Signals

### Case Verification Status

The `verificationStatus` field is the primary trust indicator:

| Status | Badge | Meaning | Donation Gate |
|---|---|---|---|
| `unverified` | Gray shield | Default — not yet validated | Soft-gated: warning shown if also high-risk |
| `community` | Blue shield | Community members have vouched | Allowed |
| `clinic` | Green shield | Verified clinic confirms treatment | Allowed |

**Display:** Badge in case card header row + case detail header. Includes "What this means" explainer tooltip.

### Risk Assessment

| Field | Purpose |
|---|---|
| `riskLevel` | `"low"` / `"medium"` / `"high"` — set by moderation |
| `riskFlags` | `string[]` — specific risk indicators (e.g., `"new_account"`, `"high_goal"`, `"reused_images"`) |

### Donation Gating Logic (`isDonationAllowed`)

From `convex/cases.ts`:

```
IF case lifecycle is closed (closed_success | closed_transferred | closed_other)
   → BLOCK (case is resolved)

IF case status is "closed"
   → BLOCK

IF verificationStatus is "unverified" AND riskLevel is "high"
   → BLOCK (unverified + high-risk)

ELSE → ALLOW
```

The `getUiForLocale` query returns `isDonationAllowed` and `canManageCase` flags to the UI.

---

## Social Features (Case-Level)

### Likes

Table: `likes` (schema L600-L611)
- `userId` + `caseId` pair (unique via `by_user_case` index)
- Like count displayed on case cards

### Comments

Table: `comments` (schema L614-L626)
- `userId`, `caseId`, `content`, optional `parentId` for replies
- Threaded by `by_case_created` index
- Displayed via `CommentsSheet` component on case detail

### Saves / Bookmarks

Table: `savedCases` (schema L680-L688)
- `userId` + `caseId` pair (unique via `by_user_case` index)
- Displayed in user's profile "Saved" tab via `users.getSavedCases`

### Reports (Case-Level)

Table: `reports` (schema L629-L656)
- Case-specific trust & safety reports
- Reasons: `suspected_scam`, `duplicate_case`, `incorrect_information`, `animal_welfare`, `other`
- Status lifecycle: `open` → `reviewing` → `closed`
- Resolution actions: `hide_case`, `warn_user`, `dismiss`, `no_action`
- Includes `resolutionNotes` and audit trail
- Report button available on case card (`•••` menu) and case detail header

---

## Translation System

### How It Works

Cases support on-demand machine translation for multi-language audiences.

**Schema fields on `cases`:**

| Field | Type | Purpose |
|---|---|---|
| `language` | `string?` | Original content locale (e.g., `"bg"`, `"en"`) |
| `translations` | `Record<string, {...}>?` | Cached translations keyed by target locale |
| `translationStatus` | `Record<string, {...}>?` | Per-locale translation status |

**Translation record shape (per locale):**
```typescript
{
  title?: string,
  description?: string,
  story?: string,
  translatedAt: number,
  provider: string,       // e.g., "google" / "deepl"
  sourceHash: string       // Hash of source content — cache invalidation
}
```

**Translation status shape (per locale):**
```typescript
{
  status: "pending" | "done" | "error",
  updatedAt: number,
  error?: string
}
```

### Localized Display (`pickLocalizedFields`)

The `cases.listUiForLocale` and `cases.getUiForLocale` queries:
1. Accept viewer's locale
2. Check if a cached translation exists and `sourceHash` matches current content
3. If match → return translated fields
4. If no match → return original fields + `translationAvailable: false`
5. Translation is triggered separately (not inline with read)

### Rate Limiting

Table: `translationRateLimits` (schema L184-L190)
- Per-user, per-day request count
- Prevents abuse of translation API costs

---

## Permissions

| Action | Who Can Do It | Enforcement |
|---|---|---|
| Create case | Any authenticated user | Auth check in `cases.create` |
| View case | Anyone (public) | No auth required for `cases.get` |
| Add update | Owner, clinic (if linked), admin | Ownership + role check in `addUpdate` |
| Change lifecycle | Owner, admin | Ownership check in `updateLifecycleStage` |
| Close case | Owner, admin | Via `updateLifecycleStage` to `closed_*` |
| Like case | Any authenticated user | Auth check |
| Comment on case | Any authenticated user | Auth check |
| Save/bookmark case | Any authenticated user | Auth check |
| Report case | Any authenticated user | Auth check, rate limited |
| Donate to case | Any authenticated user (gated) | `isDonationAllowed` check |

---

## Data Model

### `cases` Table (schema L193-L303)

| Field | Type | Required | Purpose |
|---|---|---|---|
| `userId` | `Id<"users">` | Yes | Case creator |
| `type` | enum(4) | Yes | Urgency level |
| `category` | enum(5) | Yes | Help needed type |
| `language` | `string?` | No | Original content locale |
| `title` | `string` | Yes | Case title |
| `description` | `string` | Yes | Short description |
| `story` | `string?` | No | Extended narrative |
| `translations` | `Record?` | No | Cached translations |
| `translationStatus` | `Record?` | No | Per-locale status |
| `images` | `Id<"_storage">[]` | Yes | Photo evidence (1+) |
| `location` | object | Yes | `{ city, neighborhood, coordinates? }` |
| `clinicId` | `Id<"clinics">?` | No | Linked treating clinic |
| `verificationStatus` | enum(3) | No | Trust signal |
| `foundAt` | `number` | Yes | When animal was found |
| `broughtToClinicAt` | `number?` | No | When brought to clinic |
| `fundraising` | object | Yes | `{ goal, current, currency }` |
| `status` | enum(3) | Yes | Funding status |
| `lifecycleStage` | enum(5) | No | Rescue journey stage |
| `lifecycleUpdatedAt` | `number?` | No | Last stage change |
| `closedAt` | `number?` | No | Close timestamp |
| `closedReason` | enum(3) | No | Why closed |
| `closedNotes` | `string?` | No | Close details |
| `riskLevel` | enum(3) | No | Risk assessment |
| `riskFlags` | `string[]?` | No | Specific risk indicators |
| `updates` | `object[]` | Yes | Evidence trail (embedded) |
| `createdAt` | `number` | Yes | Creation timestamp |

**Indexes:** `by_user`, `by_type`, `by_status`, `by_lifecycle_stage`, `by_verification_status`

### Supporting Tables

| Table | Schema Lines | Purpose |
|---|---|---|
| `likes` | L600-L611 | Case likes (userId + caseId) |
| `comments` | L614-L626 | Case comments (threaded) |
| `reports` | L629-L656 | Case-level trust reports |
| `savedCases` | L680-L688 | User bookmarks |

---

## API Surface

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `cases.list` | query | no | Filter by type, status |
| `cases.get` | query | no | Single case by ID |
| `cases.listUiForLocale` | query | optional | Localized list with image URLs |
| `cases.getUiForLocale` | query | optional | Localized detail with viewer hints |
| `cases.listByUser` | query | no | Cases by user ID |
| `cases.listByUserWithImages` | query | no | Profile-friendly with first image |
| `cases.create` | mutation | required | Create new case |
| `cases.addUpdate` | mutation | required | Add structured update |
| `cases.updateLifecycleStage` | mutation | required | Transition lifecycle |

---

## UI Surfaces

| Page/Component | Route | Purpose |
|---|---|---|
| `AnimalProfile.tsx` | `/case/:id` | Case detail — gallery, status, progress, updates, donate |
| `CreateCase.tsx` | `/create-case` | Multi-step case creation form |
| `ImageGallery` | component | Photo carousel on case detail |
| `StatusBadge` | component | Urgency type badge |
| `VerificationBadge` | component | Trust signal badge |
| `ProgressBar` | component | Fundraising progress |
| `UpdatesTimeline` | component | Structured update history |
| `DonationFlowDrawer` | component | Donate CTA → amount → checkout |
| `CommentsSheet` | component | Case comments sheet |
| `ShareButton` | component | Share case link |
| Home feed cards | `/` | Case cards with type, verification, progress |

---

## Edge Cases & Abuse

1. **Max text lengths** — Title and description validated (Convex string limits); update text ≤ 3000 chars enforced server-side
2. **Max attachments** — Image array enforced per case; update images validated
3. **Ownership checks** — Every mutation validates `userId` matches authenticated user (or admin role)
4. **Audit logging** — Lifecycle transitions, updates, and moderation actions logged to `auditLogs`
5. **Risk flagging** — New accounts with high goals + no history → auto-flag `riskLevel: "medium"` (implementation needed)
6. **Duplicate detection** — Implemented: optional client-provided perceptual hashes (`pHash`/`dHash`) are stored per image, bucketed, and similarity-matched server-side on create; likely duplicates are risk-flagged and a moderation report + audit log are created.
7. **Reposted cases** — External source attribution planned (Phase 2 in PRD)
8. **Translation abuse** — Rate limited per user per day via `translationRateLimits`
9. **Donation to closed cases** — Hard-blocked by `isDonationAllowed` (lifecycle + status + verification + risk check)
10. **Orphaned images** — If case creation fails after upload, storage IDs may be orphaned. Consider cleanup job.

---

## Non-Functional Requirements

1. Case detail and feed query responses SHOULD meet MVP latency targets (<500ms for common paths).
2. Case creation and update mutations MUST enforce auth/ownership checks and produce auditable events for lifecycle-critical changes.
3. Public case payloads MUST avoid exposing private user contact information.
4. Case creation and update flows MUST remain mobile-first with accessible controls and explicit error handling.

---

## Acceptance Criteria

- [ ] Creating a case with all required fields results in a case record with `verificationStatus: "unverified"`, `lifecycleStage: "active_treatment"`, `riskLevel: "low"`, `status: "active"`, `fundraising.current: 0`, and empty `updates` array.
- [ ] Lifecycle transitions follow the allowed matrix: `active_treatment` can move to `seeking_adoption`, `closed_success`, `closed_transferred`, or `closed_other`; any `closed_*` stage rejects further transitions.
- [ ] When a lifecycle transition to any `closed_*` stage occurs, `status` is set to `"closed"`, `closedAt` and `closedReason` are populated, a `milestone` update is auto-appended, and an audit log entry is created.
- [ ] `addUpdate` mutation enforces permissions (owner, linked clinic staff, or admin only), rejects text exceeding 3000 characters, and logs to `auditLogs`.
- [ ] Donation gating blocks donations when lifecycle is any `closed_*` stage, when `status` is `"closed"`, or when `verificationStatus` is `"unverified"` AND `riskLevel` is `"high"`.
- [ ] Case fundraising `current` increments only from completed Stripe webhook confirmations — never from client-submitted values or preview mode in production.
- [ ] Likes, comments, saves, and reports each enforce uniqueness constraints via their respective indexes and require authentication.
- [ ] AI-assisted creation never auto-publishes — the user must review and explicitly submit, and AI confidence scores are never shown to donors.
- [ ] Case report creation validates reason is one of the 5 allowed values, enforces detail text ≤ 2000 characters, and follows the `open → reviewing → closed` lifecycle.

## Open Questions

1. **AI case creation pipeline** — Server-side extraction is specced as P3 in PRD. The preview flow exists but uses hardcoded/plausible drafts. Real implementation needs: model selection, structured output schema, confidence scoring, image analysis. Defer to Phase 3 spec.

2. **Duplicate detection v1 follow-ups** — Perceptual matching is shipped (client hash input + server similarity checks + moderation report/audit evidence). Open: threshold tuning, moderator UX surfacing, and optional server-side hash computation for uploads (future).

3. **Case verification promotion** — How does a case move from `unverified` to `community` or `clinic`? Community verification criteria and clinic verification flow need operational definition. Currently only admin can set `verificationStatus`.

4. **`admin_verified`** — The `verificationStatus` field in DESIGN.md mentions `admin_verified` but schema only allows `unverified | community | clinic`. Decide whether to add `admin_verified` as a fourth status.

5. **Fundraising overfunding** — What happens when `current > goal`? Currently no cap. Options: auto-close, display surplus, allow continued donations.

6. **Case edit** — No edit mutation exists. Case creator cannot modify title/description/goal after creation. Decide: allow edits (with audit trail) or keep immutable-after-publish.

7. **Update deletion** — No mechanism to remove an update from the embedded array. Decide: allow owner/admin to retract updates (soft delete within array) or keep as immutable evidence trail.

8. **Image moderation** — No automated image screening. Rely on reports + manual review for now. Consider adding automated NSFW/abuse detection when scaling.
