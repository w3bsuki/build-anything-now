# ExecPlan — Batch 6-8 (Notification Channels, Production Hardening, Style Gate Expansion)

> **Owner:** Codex (GPT-5.2)  
> **Status:** review  
> **Last updated:** 2026-02-12  

This ExecPlan is a living document. Keep these sections up to date as work proceeds:
`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

This plan must follow: `docs/exec-plans/PLANS.md`.

---

## Purpose / Big Picture

Ship backlog batches 6, 7, and 8 in one coherent release:
- Batch 6: notification delivery channels (push token registration + email delivery) with hourly email throttling for case updates.
- Batch 7: production hardening (cookie consent + analytics gating, GDPR export endpoint, route error boundaries, robots/sitemap, additional lazy loading).
- Batch 8: residual token cleanup and style gate expansion to trust-critical flows (`case/create/donation/community`).

Success is observable in code paths and tests: notification data is persisted safely, channel delivery is preference-aware and throttled, analytics waits for consent, users can request GDPR export, route failures render a fallback surface, trust-style gates cover required flows, and validations pass.

---

## Progress

- [x] (2026-02-12 00:00Z) Audited batches 6/7/8 with explorer subagents and mapped code hotspots.
- [x] (2026-02-12 00:00Z) Add schema/API support for notification channels + throttling.
- [x] (2026-02-12 00:00Z) Wire frontend push registration and consent UX.
- [x] (2026-02-12 00:00Z) Implement production hardening endpoints/surfaces.
- [x] (2026-02-12 00:00Z) Expand style gate scope + clean residual token drift.
- [x] (2026-02-12 00:00Z) Validate (`typecheck`, `lint`, `test`, `docs:check`) and update canonical docs.

---

## Surprises & Discoveries

- Observation: `TASKS.md` already marks volunteer coordination, analytics, and recurring support complete; batches 6/7/8 are the remaining major backlog slice.
  Evidence: `TASKS.md` backlog section and sprint sections.

- Observation: `src/main.tsx` still initializes analytics unconditionally and includes a TODO for consent gating.
  Evidence: `src/main.tsx`.

- Observation: Notification inserts are currently scattered (`cases.ts`, `donations.ts`, `clinics.ts`, `volunteers.ts`) with no shared channel delivery layer.
  Evidence: repository search for `insert("notifications"`.

- Observation: Expanding palette scan to include `black/white/transparent` surfaced trust-surface drift in `src/components/CaseCard.tsx`.
  Evidence: style-gate failure during `pnpm -s lint` before token cleanup.

---

## Decision Log

- Decision: Implement channel delivery through a centralized internal notification mutation/action in `convex/notifications.ts` and migrate high-impact producer flows incrementally (starting with `cases.addUpdate`).
  Rationale: Minimizes risk and duplication while meeting batching/throttling acceptance for case updates first.
  Date/Author: 2026-02-12 / Codex

- Decision: Use Resend HTTP API via `fetch` for email delivery (`RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`) with graceful no-op when env vars are absent.
  Rationale: Keeps dependency surface minimal and avoids adding SDKs in high-risk batch.
  Date/Author: 2026-02-12 / Codex

- Decision: Use Capacitor `registerPlugin("PushNotifications")` at runtime to avoid hard coupling on plugin package in web build; persist tokens server-side and keep sending optional based on env configuration.
  Rationale: Enables mobile registration path now while preserving web/dev stability.
  Date/Author: 2026-02-12 / Codex

---

## Outcomes & Retrospective

- Shipped:
  - Batch 6 notification channels: push token registry (`pushTokens`), case-update channel fanout (`createCaseUpdateBatch`), hourly email throttle windows (`notificationEmailBatches`), provider-backed channel action.
  - Batch 7 hardening: cookie consent analytics gate, GDPR export APIs + settings download action, route error boundary, sitemap/robots baseline, increased route lazy-loading.
  - Batch 8 style cleanup: removed residual overlay token drift in settings and expanded style-gate scope to trust-critical flows.
- Deferred:
  - Manual iOS/Android runtime verification and camera/share permission walkthrough remain operational QA follow-ups.
- Result:
  - Required validation commands pass, including docs/index checks and Convex typecheck.

---

## Context and Orientation

Relevant current files:
- `convex/schema.ts` — needs channel/throttle tables for push tokens and email batching windows.
- `convex/notifications.ts` — currently user read/read/delete only; no channel dispatch.
- `convex/cases.ts` — case updates currently insert notifications directly; this is where hourly email throttle is required.
- `convex/http.ts` — contains webhook/share routes; GDPR export endpoint needs to be added here.
- `src/main.tsx` and `src/lib/analytics.ts` — analytics bootstrapping currently ungated by consent.
- `src/App.tsx` — route definitions and lazy-loading/error-boundary orchestration.
- `src/pages/Settings.tsx` — notification toggles and residual token drift (`bg-black/40` overlays).
- `scripts/style-scan.mjs` — style gate scanner to expand from scoped trust surfaces to required trust-critical flows.
- `TASKS.md`, `PRD.md`, `DECISIONS.md` — canonical docs to update when work ships.

Terms:
- “Trust-critical style scope” in this batch means `case/create/donation/community` user flows and shared components they depend on.
- “Email throttle window” means max one outbound email per `(user, case)` per hour for `case_update` channel events.

---

## Plan of Work

1) **Backend notification channels (Batch 6)**
- Edit `convex/schema.ts` to add `pushTokens` and `notificationEmailBatches` tables with deterministic indexes.
- Expand `convex/notifications.ts` with:
  - authenticated push token mutations,
  - internal batch notification creator for case updates,
  - internal channel sender action for push/email.
- Update `convex/cases.ts` (`addUpdate`) to delegate recipient fanout into the internal notifications batch mutation.
- Add/adjust tests in `convex/tests/` to cover push token upsert and hourly case-update email throttling semantics.

2) **Frontend notification channel wiring (Batch 6)**
- Add a top-level hook in `src/hooks/` to register Capacitor push tokens when enabled.
- Mount hook in `src/App.tsx` so authenticated users get registration flow.
- Keep all user-facing copy translated via `useTranslation`.

3) **Production hardening (Batch 7)**
- Add cookie consent state/provider and banner UI in `src/components/` and gate analytics init in `src/main.tsx` / `src/lib/analytics.ts`.
- Add authenticated GDPR export HTTP endpoint in `convex/http.ts`.
- Add route-level error boundary component and wrap route rendering in `src/App.tsx`.
- Add/update `public/robots.txt` and `public/sitemap.xml` generation/static coverage for core public routes.
- Increase lazy loading for non-critical routes in `src/App.tsx`.

4) **Styling cleanup + gate expansion (Batch 8)**
- Fix known non-critical token drift in `src/pages/Settings.tsx` overlays.
- Expand style scanner scope logic in `scripts/style-scan.mjs` and `package.json` scripts to include trust-critical flows.

5) **Canonical docs + validation**
- Update `TASKS.md` completion checkboxes.
- Update `PRD.md` feature checklist entries for shipped backlog/hardening where applicable.
- Append architecture/trust decisions to `DECISIONS.md`.
- Run required checks and fix regressions.

---

## Interfaces and Dependencies

Backend/API changes:
- `convex/schema.ts`
  - New table `pushTokens`.
  - New table `notificationEmailBatches`.
- `convex/notifications.ts`
  - New mutations: `createPushToken`, `deletePushToken`, `deleteAllPushTokens`.
  - New internal mutation: `createCaseUpdateBatch`.
  - New internal action: `sendChannelNotification`.
- `convex/cases.ts`
  - `addUpdate` schedules `internal.notifications.createCaseUpdateBatch` instead of direct insert loop.
- `convex/http.ts`
  - New `/gdpr/export` HTTP route.

Frontend/API consumers:
- `src/hooks/usePushRegistration.ts` calls new notifications mutations.
- `src/App.tsx` mounts push registration + error boundary/lazy-loading.
- `src/main.tsx` consumes cookie consent to gate analytics init.
- `src/lib/analytics.ts` exposes consent-aware initialization guard.

Compatibility notes:
- Existing notification read APIs remain unchanged.
- Channel send behavior is additive and best-effort; in-app notifications still persist regardless of channel provider configuration.

---

## Data changes (High-risk addendum)

- Add `pushTokens`:
  - `userId`, `token`, `platform`, `createdAt`, `updatedAt`.
  - Indexes: `by_user`, `by_token`, `by_user_token`.
- Add `notificationEmailBatches`:
  - `userId`, `caseId`, `windowStartedAt`, `notificationCount`, `createdAt`, `updatedAt`.
  - Index: `by_user_case_window`.

Migration/backfill:
- No historical backfill required; tables are append/update only and begin empty.

---

## API surface changes (High-risk addendum)

- New client-callable notification token mutations (authenticated).
- New internal mutation/action for notification fanout and channel delivery.
- New HTTP route for GDPR export requiring authenticated caller context.

---

## Abuse cases / trust risks / mitigations (High-risk addendum)

- Push token hijacking:
  - Mitigation: token mutations are auth-gated and scoped to current user; upsert by token with user binding update.
- Email spam from case update storms:
  - Mitigation: enforce one email per `(user, case)` per hour in DB-backed throttle window.
- GDPR export over-disclosure:
  - Mitigation: export only current user-owned records; redact other users’ PII; require auth.
- Analytics without consent:
  - Mitigation: analytics initialization hard-gated behind explicit consent state.

---

## Validation and Acceptance

Core commands (cwd `J:\pawsy\build-anything-now`):
- `pnpm -s lint`
- `pnpm -s typecheck`
- `pnpm -s test`
- `pnpm -s build`
- `pnpm -s docs:check`

Convex contract checks (because schema/API change):
- `npx convex dev` (or equivalent codegen flow in local environment)
- `pnpm -s convex:typecheck`

Acceptance checks:
- Push token registration stores/updates token for authenticated user.
- Case updates create in-app notifications and at most one email per hour per case/user.
- Settings toggles gate channel behavior (email/push disabled => no send attempt).
- Cookie banner controls analytics bootstrapping.
- Authenticated user can download their GDPR export payload.
- Route errors render fallback UI instead of blank/crash.
- Style gate runs against `case/create/donation/community` scope and passes.

---

## Idempotence and Recovery

- Schema additions are additive and safe to re-run in dev environments.
- Push token upsert is idempotent (`by_user_token`).
- Email throttle writes are deterministic per time window; repeated events increase `notificationCount` without duplicate sends.
- If channel delivery fails (provider/network), in-app notification remains persisted and retries are safe via re-scheduling action.
- Rollback path: revert modified files and redeploy; additive tables can remain unused safely.

---

## Concrete Steps

1. Write this ExecPlan in `docs/exec-plans/active/`.
2. Implement Batch 6 backend schema/APIs and tests.
3. Implement Batch 6 frontend push wiring.
4. Implement Batch 7 hardening (consent, GDPR export, error boundaries, SEO/lazy-load).
5. Implement Batch 8 style cleanup + scanner scope expansion.
6. Update canonical docs (`TASKS.md`, `PRD.md`, `DECISIONS.md`).
7. Run validations and fix failures.

---

## Artifacts and Notes

- `pnpm -s typecheck` ✅
- `pnpm -s lint` ✅ (existing non-blocking fast-refresh warnings only)
- `pnpm -s test` ✅ (22/22 files passing, 49/49 tests passing)
- `pnpm -s build` ✅
- `pnpm -s docs:index` ✅
- `pnpm -s docs:check` ✅
- `pnpm -s convex:typecheck` ✅

---

## Security / Privacy / Trust Notes

- Authn/Authz:
  - All new client mutations must call `getAuthUserId(ctx)`.
  - GDPR export endpoint requires authenticated identity context.
- PII:
  - No new public query exposes email/phone.
  - Export payload is user-owned data only; no third-party PII leakage.
- Money/webhook:
  - This plan does not change Stripe signature verification flow.
- Abuse mitigations:
  - Email throttle limits case-update outbound volume.
  - Token mutations remain authenticated and auditable via existing logs where relevant.
