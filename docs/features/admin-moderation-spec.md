# Admin & Moderation Spec

> **Owner:** Product / Trust & Safety
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** TRUST: MODERATION, TRUST: DUPLICATE DETECTION

## Purpose

Protect platform integrity and user trust through moderation tools, review queues, and audit logging. Admins and moderators need efficient workflows to handle case reports, community content reports, clinic claim reviews, and risk assessment — while maintaining transparent audit trails for every high-risk action. Moderation is the operational backbone of the "trust is the product" principle.

## User Stories

- As a **user**, I want to report a suspicious case so the platform can investigate potential scams.
- As a **user**, I want to report a harassing community post so moderators can take action.
- As a **moderator**, I want to see all pending case reports in a queue so I can review and resolve them efficiently.
- As a **moderator**, I want to see all pending community reports so I can enforce content policies.
- As an **admin**, I want to review clinic claim requests and approve/reject them with SLA targets.
- As an **admin**, I want to view audit logs for a specific entity to understand what actions were taken and by whom.
- As an **admin**, I want to flag high-risk cases and see risk levels in the moderation queue so I can prioritize reviews.

## Functional Requirements

### Case Report Moderation

1. **Report creation** — Any user can report a case. Reasons: `suspected_scam`, `duplicate_case`, `incorrect_information`, `animal_welfare`, `other`. Optional details (max 2000 chars). Creates audit log entry.
2. **Moderation queue** — Admin sees all open + reviewing reports, sorted by newest. Each item shows: case title, case status, verification status, reporter info, report reason, details, timestamps.
3. **Review workflow** — Two-step: (a) admin marks report as `reviewing` (claims it), (b) admin resolves with action + notes.
4. **Resolution actions** — `hide_case` (closes the case with `closed_other` lifecycle), `warn_user` (logged but no enforcement yet), `dismiss` (report invalid), `no_action` (report valid but no action needed).
5. **Case risk management** — Cases have `riskLevel` (low/medium/high) and `riskFlags` array. Risk affects: moderation priority (high-risk at top of queue), donation gating (unverified + high-risk → warning/block per RULES.md).

### Community Content Moderation

6. **Community report creation** — Users report posts or comments. Reasons: `spam`, `harassment`, `misinformation`, `scam`, `animal_welfare`, `other`. Optional details.
7. **Community moderation queue** — Admin sees all open community reports. Each item shows: content excerpt, target type (post/comment), reporter info, reason, timestamps.
8. **Community resolution actions** — Hide post/comment (soft delete via `isDeleted` flag), warn user, lock thread (set `isLocked` on post), dismiss, no action. Resolution notes + audit log.

### Clinic Claims Review

9. **Claims queue** — Admin sees all pending clinic claims. Each shows: clinic name, claimer info (role, email, phone), additional info, submission date.
10. **Claim review** — Approve (sets clinic `ownerId` + `claimedAt`, claim status to `approved`) or Reject (with reason, claim status to `rejected`).
11. **Duplicate guard** — Prevent claiming already-claimed clinics. If clinic has `ownerId`, new claims are rejected at creation with "This clinic has already been claimed."
12. **SLA targets** — 24h first response (admin views the claim), 72h resolution (approve/reject), 12h fast-track for critical claims. Currently no automated SLA tracking — manual ops.

### Admin Roles & Access

13. **Role hierarchy** — `moderator` (content review: case reports, community reports) vs. `admin` (full access: moderator abilities + clinic claims, user management, system settings). Per schema, `users.role` field: `admin` is the only elevated role currently.
14. **Admin functions** — All admin queries/mutations use `requireAdmin` guard from `convex/lib/auth.ts`. Admin endpoints are server-side only (not client-callable for sensitive operations — use `internalMutation` where appropriate).

### Audit Logging

15. **Audit log creation** — Every high-risk action creates an audit log entry: actor, entity type + ID, action name, details, optional metadata JSON, timestamp.
16. **Logged actions** — Report status changes, report resolution, clinic claim review, case closure via moderation, case status changes, donation refunds, user verification changes.

## Non-Functional Requirements

- **Security**: All moderation endpoints require admin role. No client-callable mutations for destructive actions. Ownership checks on every mutation.
- **Performance**: Moderation queue loads in <500ms for up to 200 pending reports. Audit log queries scoped by entity for efficiency.
- **Auditability**: Every moderation action is logged with actor identity, timestamp, and details. Logs are append-only (no deletion).
- **Privacy**: Report details visible only to admins. Reporter identity hidden from reported user (reporter sees their own report status).
- **i18n**: Moderation UI strings are translatable. Report reasons shown in user's language in the reporter's view.

## Data Model

### `reports` table — Case Reports (schema.ts L641–L664)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `caseId` | `Id<"cases">` | Yes | Reported case |
| `reason` | `union(5 values)` | Yes | suspected_scam, duplicate_case, incorrect_information, animal_welfare, other |
| `details` | `optional(string)` | No | Free text details (max 2000 chars) |
| `reporterId` | `optional(Id<"users">)` | No | Reporter's user ID |
| `reporterClerkId` | `optional(string)` | No | Reporter's Clerk ID (fallback) |
| `status` | `union("open", "reviewing", "closed")` | Yes | Report lifecycle |
| `reviewedBy` | `optional(Id<"users">)` | No | Admin who reviewed |
| `reviewedAt` | `optional(number)` | No | Review timestamp |
| `resolutionAction` | `optional(union(4 values))` | No | hide_case, warn_user, dismiss, no_action |
| `resolutionNotes` | `optional(string)` | No | Admin resolution notes |
| `createdAt` | `number` | Yes | Report creation timestamp |

**Indexes:** `by_case` (caseId), `by_status` (status), `by_reporter` (reporterId), `by_reviewed_by` (reviewedBy)

### `communityReports` table — Content Reports (schema.ts L609–L623)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetType` | `union("post", "comment")` | Yes | Reported content type |
| `targetId` | `string` | Yes | ID of reported post/comment |
| `reason` | `union(6 values)` | Yes | spam, harassment, misinformation, scam, animal_welfare, other |
| `details` | `optional(string)` | No | Free text details |
| `reporterId` | `Id<"users">` | Yes | Reporter |
| `status` | `union("open", "reviewing", "closed", "dismissed")` | Yes | Report lifecycle (4 states vs. 3 for case reports) |
| `createdAt` | `number` | Yes | Timestamp |
| `reviewedAt` | `optional(number)` | No | Review timestamp |
| `reviewedBy` | `optional(Id<"users">)` | No | Admin reviewer |
| `resolutionNotes` | `optional(string)` | No | Admin notes |

**Indexes:** `by_target` (targetType, targetId), `by_status` (status), `by_reporter` (reporterId), `by_reviewed_by` (reviewedBy)

### `auditLogs` table (schema.ts L672–L682)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `actorId` | `optional(Id<"users">)` | No | User who performed action (null for system) |
| `entityType` | `string` | Yes | Entity category (e.g., "report", "case", "clinic_claim") |
| `entityId` | `string` | Yes | Entity ID |
| `action` | `string` | Yes | Action name (e.g., "report.resolved", "claim.approved") |
| `details` | `optional(string)` | No | Human-readable details |
| `metadataJson` | `optional(string)` | No | Structured JSON metadata |
| `createdAt` | `number` | Yes | Timestamp |

**Indexes:** `by_entity` (entityType, entityId), `by_actor` (actorId), `by_created_at` (createdAt)

### `clinicClaims` table (schema.ts L345–L365)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clinicId` | `Id<"clinics">` | Yes | Claimed clinic |
| `userId` | `Id<"users">` | Yes | Claimer |
| `status` | `union("pending", "approved", "rejected")` | Yes | Claim status |
| `claimerRole` | `string` | Yes | "Owner", "Manager", "Staff" |
| `claimerEmail` | `string` | Yes | Claimer's contact email |
| `claimerPhone` | `optional(string)` | No | Claimer's phone |
| `additionalInfo` | `optional(string)` | No | Supporting details |
| `reviewedBy` | `optional(Id<"users">)` | No | Admin reviewer |
| `reviewedAt` | `optional(number)` | No | Review timestamp |
| `rejectionReason` | `optional(string)` | No | Reason for rejection |
| `createdAt` | `number` | Yes | Submission timestamp |

**Indexes:** `by_clinic` (clinicId), `by_user` (userId), `by_status` (status)

### Case risk fields on `cases` table

| Field | Type | Description |
|-------|------|-------------|
| `riskLevel` | `optional(union("low", "medium", "high"))` | Case risk assessment |
| `riskFlags` | `optional(array(string))` | Specific risk indicators |

## API Surface

### Existing (convex/reports.ts) — Case Reports

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `create` | mutation | Any user | Create a report on a case. Validates: case exists, details ≤ 2000 chars. Creates audit log. |
| `getCasePendingReportStatus` | query | Admin/Clinic | Check if a case has open/reviewing reports. Returns count + aggregate status. |
| `listPending` | query | Admin | List all open + reviewing reports. Enriches with case data (title, status, verification, lifecycle) and reporter/reviewer info. Sorted by newest. |
| `setReviewing` | mutation | Admin | Mark report as "reviewing". Sets reviewedBy + reviewedAt. Audit log. |
| `resolve` | mutation | Admin | Resolve report. Sets resolutionAction + notes + status=closed. If hide_case → closes the case (status=closed, lifecycleStage=closed_other). Audit log. |

### Existing (convex/clinics.ts) — Clinic Claims

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `listPendingClaims` | query | Admin | List all pending clinic claims with enriched clinic/user data. |
| `reviewClaim` | mutation | Admin | Approve or reject a claim. On approve: sets clinic ownerId/claimedAt. On reject: sets rejectionReason. Audit log. |

### Needed

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `communityReports.listPending` | query | Admin | List all open + reviewing community reports. Enrich with post/comment content excerpt, reporter info. Sorted by newest. |
| `communityReports.setReviewing` | mutation | Admin | Claim a community report for review. Sets reviewedBy + reviewedAt. Audit log. |
| `communityReports.resolve` | mutation | Admin | Resolve community report. Actions: hide_content (set isDeleted on post/comment), lock_thread (set isLocked on post), warn_user, dismiss, no_action. Resolution notes + audit log. |
| `auditLogs.listByEntity` | query | Admin | Get all audit logs for a specific entity (entityType + entityId). For investigating history of a case, user, or claim. |
| `auditLogs.listRecent` | query | Admin | Get recent audit logs across all entities. For ops dashboard / activity feed. Paginated by createdAt. |
| `cases.setRiskLevel` | internalMutation | Admin | Set riskLevel and riskFlags on a case. Audit log entry. |
| `users.warnUser` | internalMutation | Admin | Create a warning notification for a user (implement the "warn_user" action). Currently, warn_user is logged but has no effect on the user. This mutation should: create a system notification, optionally add a flag to the user record. |

## UI Surfaces

### Existing (fully wired)

- **ModerationQueue** (`src/pages/admin/ModerationQueue.tsx`) — Route: `/admin/moderation` (AuthGuard). Lists pending case reports. Actions: Set Reviewing, Resolve (with action dropdown + resolution notes). **Fully wired to Convex** — uses `api.reports.listPending`, `api.reports.setReviewing`, `api.reports.resolve`. Working in production.

- **ClinicClaimsQueue** (`src/pages/admin/ClinicClaimsQueue.tsx`) — Route: `/admin/clinic-claims` (AuthGuard). Lists pending clinic claims. Actions: Approve / Reject (with rejection reason text input). **Fully wired to Convex** — uses `api.clinics.listPendingClaims`, `api.clinics.reviewClaim`. Working in production.

### Needed

- **Community Moderation Queue** — Route: `/admin/community-reports`. Same pattern as ModerationQueue but for community reports. Shows: content excerpt, target type (post/comment), reporter, reason, timestamp. Actions: set reviewing, resolve with action (hide, lock, warn, dismiss, no_action) + notes. Wired to `communityReports.listPending`, `.setReviewing`, `.resolve`.

- **Audit Log Viewer** — Route: `/admin/audit-logs`. Filterable list of all audit log entries. Filters: entity type, actor, date range. Shows: timestamp, actor name, action, entity type + link, details. Useful for investigating specific cases or users ("show me everything that happened to case X").

- **SLA Dashboard** (future) — Visual indicator of claim/report age vs. SLA targets. Highlight overdue items (>24h without first response for claims, >72h without resolution). Could be a section within existing admin pages rather than a separate page.

- **Admin Nav Section** — Currently admin pages are reachable only by direct URL. Add an admin section to navigation (visible only to role=admin users): Moderation Queue (with pending count badge), Clinic Claims (with pending count badge), Community Reports (with pending count badge), Audit Logs.

- **Risk Badge on Case Cards** — In moderation queue, show risk level badge (🟢 low / 🟡 medium / 🔴 high) on case entries. High-risk cases sorted to top or visually highlighted.

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Multiple reports on same case | All reports appear in queue. Admin can view all reports for a case before resolving. Resolving one report doesn't auto-close others — each reviewed independently. |
| Reporter spam (filing many false reports) | Track report count per reporter. Future: auto-flag reporters with high dismiss rate. Rate limit: max 10 reports per user per day. |
| Admin resolves own case's report | No self-resolution guard currently. Recommendation: admin should not resolve reports on cases they own. Flag in UI if actorId matches case userId. |
| "warn_user" has no effect | Currently warn_user is logged but doesn't notify or restrict the user. Spec adds `users.warnUser` mutation to create a system notification. Future: warning count → temporary restriction. |
| Clinic claimed by wrong person | Rejection with reason. Claimant can submit a new claim with additional documentation. No automatic re-claim prevention (same user can try again). |
| Audit log grows very large | Audit logs are append-only. No retention policy for v1. Future: archive logs older than 1 year to cold storage. Query performance maintained via `by_created_at` index with cursor pagination. |
| Admin loses access (leaves team) | Admin role is a `users.role` field. Removing admin access = patching role to "user". All past actions remain in audit logs. |

## Data Model Inconsistency Note

DESIGN.md describes a unified `Report` model with `targetType: "case" | "user" | "post"`, but the actual implementation uses two separate tables:

- `reports` — Case-only reports (targetType is implicitly "case", stored as `caseId`)
- `communityReports` — Post/comment reports (has explicit `targetType: "post" | "comment"`)

**Current state documented as-is.** A potential future unification into a single `reports` table with `targetType` field would simplify the moderation queue but requires a migration. Not recommended for v1 — the separate tables work and have distinct status enums (reports has 3 statuses, communityReports has 4).

## SLA Reference

| Queue | First Response | Resolution | Fast-Track |
|-------|---------------|------------|------------|
| Case Reports | — | — | — |
| Clinic Claims | 24h | 72h | 12h (critical) |
| Community Reports | — | — | — |

Case reports and community reports do not have formal SLAs yet. Recommendation: 48h resolution target for case reports, 24h for community reports (content stays visible until resolved, so faster is better for harassment/scam).

## Acceptance Criteria

- [ ] All moderation mutations require `admin` role via `requireAdmin` guard.
- [ ] Case report resolution with `hide_case` closes the case with `lifecycleStage: closed_other`, sets `status: "closed"`, and records in audit log.
- [ ] Report review follows two-step workflow: `setReviewing` (claims report) → `resolve` (sets action + notes + status: "closed"), with audit log at each step.
- [ ] Clinic claim duplicate guard rejects new submissions when clinic already has `ownerId`.
- [ ] Clinic claim approval atomically sets `clinic.ownerId`, `clinic.claimedAt`, `clinic.verified: true`, upgrades user role to `"clinic"`, and updates claim to `"approved"`.
- [ ] Audit log entries are append-only and include `actorId`, `entityType`, `entityId`, `action`, `details`, and `createdAt`.
- [ ] Reporter identity is hidden from reported user — only admins see reporter details.
- [ ] Community content moderation soft-deletes (`isDeleted: true`) — records never physically removed.
- [ ] Case risk fields affect moderation queue priority (high-risk at top) and donation gating.

## EARS Requirements (Safety-Critical)

> EARS = Easy Approach to Requirements Syntax. These requirements use When/While/If/Shall patterns for unambiguous, testable trust/safety rules.

| ID | Type | Requirement |
|----|------|-------------|
| M-01 | Ubiquitous | The system **shall** require `admin` role for all moderation mutations — no client-callable destructive actions. |
| M-02 | Event | **When** an admin resolves a report, the system **shall** create an audit log entry with actor identity, action, entity, and timestamp. |
| M-03 | Event | **When** `hide_case` is selected as resolution action, the system **shall** close the case with `lifecycleStage: closed_other` and record the reason in the audit log. |
| M-04 | Guard | **If** a clinic already has an `ownerId`, the system **shall** reject new claim submissions with "This clinic has already been claimed." |
| M-05 | Event | **When** a clinic claim is approved, the system **shall** atomically set `clinic.ownerId`, `clinic.claimedAt`, and `claim.status: approved`. |
| M-06 | Ubiquitous | The system **shall** append-only to the audit log — no audit log entries may be modified or deleted. |
| M-07 | Guard | **If** a user has submitted ≥ 10 reports in 24 hours, the system **shall** reject additional reports (rate limit). |
| M-08 | Event | **When** community content is hidden via moderation, the system **shall** set `isDeleted: true` (soft delete) — not permanently remove the record. |
| M-09 | Guard | **If** a report is already `resolved`, the system **shall** reject further resolution attempts. |
| M-10 | Ubiquitous | The system **shall** hide reporter identity from the reported user — only admins can see reporter details. |

## Open Questions

1. **Unified reports table** — Should `reports` and `communityReports` be merged into a single table with a `targetType` discriminator? Pros: one moderation queue, simpler API. Cons: different status enums, different resolution actions, migration work. **→ Keep separate for now. Revisit if moderation volume grows.**

2. **warn_user enforcement** — Warning a user currently logs the action but has no platform effect. What should warnings do? Options: (a) notification only (awareness), (b) warning count → temporary posting restriction after 3 warnings, (c) warning count → account suspension after 5 warnings. **→ Needs policy decision.**

3. **Moderator role** — Currently only `admin` role exists. Should a separate `moderator` role be added with limited access (content review only, no clinic claim approval)? **→ Post-MVP. Admin-only is sufficient for small team.**

4. **Community report resolution actions** — Current spec proposes: hide_content, lock_thread, warn_user, dismiss, no_action. Should "ban user from community" be an option? (Remove posting ability but keep account active.) **→ Needs policy decision.**

5. **Automated risk scoring** — Cases are manually flagged for risk level. Should the system auto-calculate risk based on signals (new account, high goal, no photos, reused images)? PRD P3 lists "AI SCAM SIGNALS" as future work. **→ Post-MVP, see PRD Phase 3.**
