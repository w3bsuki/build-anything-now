# ExecPlan — Recurring Donations (Stripe subscriptions + lifecycle management)

> **Owner:** Codex  
> **Status:** review  
> **Last updated:** 2026-02-12  

This ExecPlan is a living document. Keep these sections up to date as work proceeds:
`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

This plan must follow: `docs/exec-plans/PLANS.md`.

---

## Purpose / Big Picture

Users can start monthly support for a case owner (rescuer/clinic) using Stripe hosted checkout, see active subscriptions in account settings, and cancel from the app. Stripe webhooks keep subscription state in sync and record recurring donations as completed donation records so donation history clearly distinguishes one-time vs recurring support.

---

## Progress

Use checkboxes and timestamps. Every stopping point must be captured here.

- [x] (2026-02-12 16:17Z) Audited current donations schema/API/webhooks/frontend surfaces and extracted recurring-donation requirements from `docs/product-specs/features/donations-spec.md`.
- [x] (2026-02-12 16:22Z) Added `subscriptions` table + `donations` recurrence discriminator in `convex/schema.ts`.
- [x] (2026-02-12 16:25Z) Implemented `convex/subscriptions.ts` (`create`, `cancel`, `list`) with auth + ownership checks.
- [x] (2026-02-12 16:27Z) Extended `convex/http.ts` and backend internals to handle `invoice.paid`, `customer.subscription.deleted`, `customer.subscription.updated`.
- [x] (2026-02-12 16:30Z) Added UI CTAs and management surface (case/profile monthly CTA + settings management view) with EN/BG i18n.
- [x] (2026-02-12 16:31Z) Added Convex tests for subscription lifecycle and recurring invoice completion behavior.
- [x] (2026-02-12 16:34Z) Ran validation commands and updated `TASKS.md`, `PRD.md`, and `DECISIONS.md`.

---

## Surprises & Discoveries

Document unexpected behaviors, bugs, constraints, or insights (with evidence).

- Observation: `convex/lib/auth.ts` does not currently export `getAuthUserId(ctx)` even though backend guidance references it.
  Evidence: `convex/lib/auth.ts` only exports `requireUser`, `requireAdmin`, `optionalUser`, and `assertOwnership`.
- Observation: Current donation history does not have a type discriminator, so recurring charges cannot be identified without schema/API changes.
  Evidence: `src/pages/MyDonations.tsx` and `src/pages/DonationHistory.tsx` render rows from `api.donations.getMyDonations` with no recurrence field.
- Observation: `npx convex codegen` initially failed because Convex module analysis executes top-level code and cannot evaluate `import.meta.glob` in non-Vite runtime.
  Evidence: CLI error before compatibility attempt: `Uncaught Failed to analyze tests/testHelpers.js: (intermediate value).glob is not a function`.

---

## Decision Log

Record decisions made while executing the plan.

- Decision: Use Stripe Checkout in `mode: "subscription"` instead of custom card forms or custom recurring billing logic.
  Rationale: Meets EARS guardrails (`D-01`) and keeps PCI scope with Stripe.
  Date/Author: 2026-02-12 / Codex
- Decision: Record recurring charges in `donations` as `donationKind: "recurring"` while storing plan status in a dedicated `subscriptions` table.
  Rationale: Preserves existing donation-history and stats flows while enabling clear recurring-vs-one-time UI and analytics splits.
  Date/Author: 2026-02-12 / Codex
- Decision: Use `targetType` (`case` | `user`) + `targetId` on subscriptions to support case-level and profile-level monthly support without future schema rework.
  Rationale: Matches product ask ("case/profile pages") and avoids coupling subscriptions to one entity model.
  Date/Author: 2026-02-12 / Codex
- Decision: Keep a local preview path for recurring checkout when `STRIPE_SECRET_KEY` is absent by creating subscriptions with a synthetic `preview_sub_*` Stripe ID.
  Rationale: Preserves local/mobile development flow parity with existing one-time donation preview behavior.
  Date/Author: 2026-02-12 / Codex

---

## Outcomes & Retrospective

Summarize what shipped, what didn’t, and what we learned (compare to the Purpose).

- Shipped:
  - `subscriptions` backend domain (schema + public API + webhook sync + lifecycle tests).
  - Stripe webhook coverage for recurring events (`invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`).
  - Monthly support CTAs on case/profile surfaces and a dedicated `/subscriptions` management page linked from account/settings.
  - Donation history now visually distinguishes one-time vs recurring entries.
- Not shipped:
  - Stripe Customer Portal deep-link handoff for self-service billing-method updates.
  - Annual interval configuration in UI (backend supports `month`/`year`, UI currently drives monthly).
- Key learning:
  - Keeping recurring charge materialization in webhook-driven flow while reusing existing donation confirmation logic minimized risk and preserved trust-side effects (fundraising increments, receipts, notifications).

---

## Context and Orientation

Describe the current state relevant to this work as if the reader knows nothing.
- `convex/donations.ts` currently supports one-time Stripe checkout and webhook confirmation, but no recurring lifecycle.
- `convex/http.ts` verifies Stripe signatures and handles one-time events only (`payment_intent.*`, `checkout.session.completed`).
- `convex/schema.ts` contains `donations` and `paymentMethods` tables, but no `subscriptions` table.
- Frontend donation entrypoint is `src/components/donations/DonationFlowDrawer.tsx`; history screens are `src/pages/MyDonations.tsx` and `src/pages/DonationHistory.tsx`.
- Account/settings surfaces are `src/pages/Account.tsx` and `src/pages/Settings.tsx`; route registration is in `src/App.tsx`.

Non-obvious terms:
- `targetType/targetId`: polymorphic subscription target so recurring support can point to either a case or a profile owner.
- `donationKind`: one-time vs recurring discriminator on `donations` rows.

---

## Plan of Work

1) Backend data model updates  
- File: `convex/schema.ts`  
- Location: `donations` table + new `subscriptions` table  
- Changes:
  - Add `donationKind` (`one_time` | `recurring`) to `donations` with default assignment in writers.
  - Add `subscriptionId` optional foreign key-like field (`v.id("subscriptions")`) on donations so invoice charges can link to active subscription rows.
  - Add `subscriptions` table with fields: `userId`, `targetType`, `targetId`, `stripeSubscriptionId`, `stripeCheckoutSessionId?`, `status`, `amount`, `currency`, `interval`, `createdAt`, `updatedAt?`, `canceledAt?`.
  - Add indexes for user listing and Stripe webhook lookups (`by_user`, `by_stripe_subscription`, `by_target`).
- Why: needed for recurring state lifecycle and API lookups.

2) Backend API and webhook lifecycle  
- Files: `convex/subscriptions.ts`, `convex/http.ts`, `convex/donations.ts`, `convex/lib/auth.ts`  
- Location:
  - New subscription module for create/cancel/list.
  - HTTP Stripe webhook router for subscription events.
  - Donations webhook internals to support recurring charge materialization.
  - Auth helper to expose `getAuthUserId(ctx)` for mutation policy.
- Changes:
  - Add `getAuthUserId(ctx)` helper and use it in new mutations.
  - Implement `createSubscriptionCheckout` (Stripe Checkout `mode: "subscription"`), `cancelSubscription`, `listMySubscriptions`.
  - Add internal mutations for upsert/cancel subscription state and to materialize `invoice.paid` as completed recurring donation.
  - Extend webhook handler for `invoice.paid`, `customer.subscription.deleted`, `customer.subscription.updated`.
- Why: establishes end-to-end recurring flow with idempotent webhook updates.

3) Frontend recurring UX + management  
- Files: `src/components/donations/DonationFlowDrawer.tsx`, `src/pages/AnimalProfile.tsx`, `src/pages/Account.tsx`, `src/pages/Settings.tsx`, `src/pages/DonationHistory.tsx`, `src/pages/MyDonations.tsx`, `src/pages/Subscriptions.tsx`, `src/App.tsx`  
- Location:
  - Existing donation drawer and case/profile CTAs.
  - Account/settings navigation and new subscriptions page.
  - Donation history row presentation.
- Changes:
  - Add "Support Monthly" entrypoint and trigger subscription checkout mutation.
  - Add subscriptions management page using `PageShell`/`PageSection` primitives and route.
  - Display recurring vs one-time badges in donation history lists.
  - Add settings/account links to management surface.
- Why: satisfies user-visible monthly CTA and management requirements.

4) Tests + docs synchronization  
- Files: `convex/tests/subscriptions.lifecycle.test.ts`, `TASKS.md`, `PRD.md`, `DECISIONS.md`  
- Changes:
  - Add Convex lifecycle tests for create/list/cancel and webhook update behavior.
  - Mark completed checklist items in sprint + product checklist.
  - Append decision notes for schema/API architecture.
- Why: preserve quality gates and repository governance.

---

## Interfaces and Dependencies

Be prescriptive:
- New Convex exports in `convex/subscriptions.ts`:
  - Query: `listMySubscriptions`
  - Mutations: `createSubscriptionCheckout`, `cancelSubscription`
  - Internal mutations for webhook state sync (exact names to be finalized in implementation).
- Modified Convex exports:
  - `convex/donations.ts`: recurring donation write path used by webhook lifecycle.
  - `convex/http.ts`: additional Stripe event routing.
- New/updated data fields:
  - `donations.donationKind`
  - `donations.subscriptionId?`
  - `subscriptions.*` table fields listed above
- Compatibility notes:
  - Existing one-time donation flow remains unchanged.
  - Donation history consumers must tolerate new `donationKind` field and default to `one_time` for older rows.
  - Stripe webhook replay safety must preserve idempotence (no duplicate fundraising increments).

---

## Concrete Steps

From repo root (`J:\pawsy\build-anything-now`):

1. Implement schema + backend + frontend + test changes:
- `pnpm -s typecheck`
- `pnpm -s lint`
- `pnpm -s test`
- `pnpm -s build`
- `pnpm -s docs:check`

2. If Convex contracts change:
- `npx convex dev` (regenerate types)
- `pnpm -s convex:typecheck`

Expected outcomes:
- Typecheck/lint/test/build/docs all exit 0.
- New subscription lifecycle tests pass.
- No regression in existing donations tests.

---

## Validation and Acceptance

Observable acceptance checks:

1. Monthly CTA checkout
- Input: authenticated user opens case/profile donation flow and taps monthly support.
- Observe: app calls subscription checkout mutation and redirects to Stripe hosted checkout URL (or preview mode when Stripe secret is missing).

2. Subscription list management
- Input: user visits subscription settings page.
- Observe: active/canceled subscriptions appear with target, amount, interval, and status; cancel action updates status.

3. Webhook-driven recurring donation logging
- Input: Stripe sends `invoice.paid` for active subscription.
- Observe: subscription remains active/updated and a completed donation row with `donationKind: recurring` is created and shown in donation history.

4. Webhook cancellation/update sync
- Input: Stripe sends `customer.subscription.deleted` or `customer.subscription.updated`.
- Observe: local subscription status updates idempotently without duplicate records.

5. Regression checks
- Input: one-time donation flow through existing checkout.
- Observe: existing behavior and history views still work.

---

## Idempotence and Recovery

- Safe to repeat:
  - Replaying Stripe webhook events must be safe due to Stripe IDs + subscription/donation lookup guards.
  - Running validation commands is repeatable.
- Mid-flight failure recovery:
  - If schema compiles but webhook handling fails, disable new UI entrypoints (temporary guard) and re-run failing tests before exposing route.
  - If Stripe checkout creation fails, mutation returns error and no subscription should be marked active until webhook confirmation/update.
- Rollback:
  - Revert changed files in a single patch/cherry-pick.
  - Remove new route links if backend rollback occurs.
  - Keep old one-time donation path intact as fallback.

---

## Artifacts and Notes

Include the minimum proof artifacts:
- Command transcripts for `typecheck`, `lint`, `test`, `build`, `docs:check`.
- Test file additions under `convex/tests/` for subscription lifecycle.
- Updated docs references in `TASKS.md`, `PRD.md`, and `DECISIONS.md`.

---

## Security / Privacy / Trust Notes

- AuthN/AuthZ:
  - All new client-callable mutations require auth and enforce ownership checks on cancellable subscriptions.
- PII:
  - Subscription queries return no email/phone data; only IDs, statuses, amounts, and target metadata.
- Money/Webhook:
  - Stripe signatures stay mandatory in `convex/http.ts`.
  - Webhook handlers must be idempotent to prevent double-crediting.
- Abuse/Trust:
  - Prevent unauthorized cancellation by verifying `subscription.userId === currentUserId`.
  - Validate target resources exist and are donation-eligible before checkout session creation.
