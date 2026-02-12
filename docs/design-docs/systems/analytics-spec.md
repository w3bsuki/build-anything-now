# Analytics & Metrics Spec

> **Owner:** Engineering + Product  
> **Status:** final  
> **Last updated:** 2026-02-08

---

## Purpose

Defines the analytics strategy, KPI framework, event tracking schema, tooling selection, and dashboard requirements for Pawtreon. This is a greenfield spec — no analytics tracking currently exists in the platform.

---

## Current State

| Metric | Value |
|--------|-------|
| Analytics SDK | None |
| Event tracking | None |
| Product dashboards | None |
| KPI monitoring | None |
| Audit logs | Exists (moderation only — `auditLogs` table in Convex) |

The `auditLogs` table captures moderation actions but is not analytics. It records: `actor`, `entityType`, `entityId`, `action`, `details`, `createdAt`.

---

## Tooling Selection

### Decision: PostHog

| Criterion | PostHog | Mixpanel | Amplitude | Convex-Native |
|-----------|---------|----------|-----------|---------------|
| GDPR compliance | EU hosting available | US-based | US-based | Self-hosted |
| Self-host option | Yes | No | No | N/A |
| Open source | Yes | No | No | N/A |
| Free tier | Generous (1M events/mo) | Limited | Limited | N/A |
| Feature flags | Built-in | No | No | Build yourself |
| Session replay | Built-in | No | No | No |
| Funnels | Yes | Yes | Yes | Build yourself |
| Setup complexity | Low (JS SDK) | Low | Low | High |

**Rationale:**
- GDPR compliance is critical for EU launch (Bulgaria first)
- PostHog offers EU hosting and self-host options
- Open source aligns with trust-first product values
- Built-in feature flags useful for progressive rollout
- Session replay helps debug UX issues on trust surfaces
- Generous free tier covers MVP needs

### Installation

```bash
pnpm add posthog-js
```

### Integration

```typescript
// src/lib/analytics.ts
import posthog from 'posthog-js';

export function initAnalytics() {
  if (import.meta.env.PROD) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      // GDPR: respect Do Not Track
      respect_dnt: true,
      // No PII in autocapture
      autocapture: {
        dom_event_allowlist: ['click', 'submit'],
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea'],
      },
    });
  }
}

export function identifyUser(userId: string, traits: Record<string, unknown>) {
  posthog.identify(userId, {
    // Only non-PII traits
    role: traits.role,
    city: traits.city,
    onboardingCompleted: traits.onboardingCompleted,
    capabilities: traits.capabilities,
    // NEVER: email, name, phone, address
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}

export function resetAnalytics() {
  posthog.reset();
}
```

### Environment Variables (New)

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_POSTHOG_KEY` | Vite (client) | PostHog project API key |
| `VITE_POSTHOG_HOST` | Vite (client) | PostHog instance URL (`https://eu.posthog.com`) |

---

## KPI Framework

### North Star Metric

**Funded rescue cases per month** — cases that reach ≥50% of their funding goal.

### Primary KPIs (from PRD)

| KPI | Target | How Measured | Event Source |
|-----|--------|-------------|--------------|
| Time to case created | < 3 minutes | `case_created` timestamp – session start | Frontend |
| Case view → donate conversion | > 5% | `donation_started` / `case_viewed` | Frontend |
| Repeat donor rate (D30) | > 20% | Users with 2+ donations in 30 days | Backend |
| Repeat donor rate (D90) | > 35% | Users with 3+ donations in 90 days | Backend |
| Verification rate | > 30% of cases | Cases with `community` or `clinic` verification | Backend |
| Report resolution time | < 24h | Report `closed` timestamp – `created` timestamp | Backend |
| Share rate | > 10% of case views | `case_shared` / `case_viewed` | Frontend |

### Secondary KPIs

| KPI | Target | How Measured |
|-----|--------|-------------|
| Daily active users (DAU) | Growth trend | Unique sessions per day |
| Cases created per week | Growth trend | `case_created` events |
| Donation volume (EUR) | Growth trend | Sum of completed donations |
| Average donation amount | €15-25 | Mean of completed donation amounts |
| Onboarding completion rate | > 70% | `onboarding_completed` / `signup_completed` |
| Clinic claim rate | > 50% of seeded clinics | Claims submitted / total clinics |
| Community post rate | Growth trend | `community_post_created` per week |
| Volunteer signup rate | Growth trend | Users enabling volunteer capability |

---

## Event Tracking Schema

### Naming Convention

```
{object}_{action}
```

- Object: lowercase noun (`case`, `donation`, `clinic`, `community_post`, `volunteer`)
- Action: past tense verb (`created`, `viewed`, `started`, `completed`, `shared`)
- Properties: snake_case keys, no PII

### Core Events

#### Case Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `case_viewed` | User opens case detail | `case_id`, `case_type`, `verification_status`, `source` (feed/search/share/direct) |
| `case_created` | Case published | `case_id`, `case_type`, `category`, `has_photos`, `city`, `goal_amount`, `currency` |
| `case_updated` | Case update posted | `case_id`, `update_type` (medical/milestone/update/success), `has_evidence` |
| `case_closed` | Case closed by owner | `case_id`, `close_reason`, `final_amount`, `goal_amount`, `funded_percentage` |
| `case_shared` | Share button tapped | `case_id`, `share_method` (native/copy_link) |
| `case_saved` | User bookmarks case | `case_id` |
| `case_reported` | User reports case | `case_id`, `report_reason` |

#### Donation Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `donation_started` | Donate button tapped | `case_id`, `source` (case_detail/feed_card/campaign) |
| `donation_amount_selected` | Amount chosen | `amount`, `currency`, `is_custom_amount` |
| `donation_checkout_started` | Stripe redirect initiated | `case_id`, `amount`, `currency`, `is_anonymous` |
| `donation_completed` | Stripe webhook confirms | `case_id`, `amount`, `currency`, `is_first_donation` |
| `donation_failed` | Stripe webhook fails | `case_id`, `failure_reason` |

#### User Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `signup_completed` | Clerk signup success | `auth_method` (email/google/apple/facebook) |
| `onboarding_started` | Onboarding wizard opens | — |
| `onboarding_step_completed` | Each wizard step | `step_name`, `step_number` |
| `onboarding_completed` | Wizard finished | `user_type`, `capabilities_selected`, `city` |
| `onboarding_skipped` | User skips onboarding | `skipped_at_step` |
| `profile_updated` | Profile save | `fields_changed` (array of field names, no values) |

#### Clinic Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `clinic_viewed` | Clinic detail opened | `clinic_id`, `city`, `is_verified`, `source` |
| `clinic_searched` | Search/filter used | `search_query` (if text), `filters` (city/24h/specialization) |
| `clinic_claim_started` | Claim form opened | `clinic_id` |
| `clinic_claim_submitted` | Claim submitted | `clinic_id` |

#### Community Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `community_post_created` | Post published | `board` (rescue/community), `category`, `has_image`, `has_case_link` |
| `community_post_viewed` | Post detail opened | `post_id`, `board` |
| `community_comment_created` | Comment posted | `post_id` |
| `community_post_reported` | Post reported | `post_id`, `report_reason` |

#### Campaign Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `campaign_viewed` | Campaign detail opened | `campaign_id`, `campaign_type` (rescue/initiative) |
| `campaign_donated` | Donation to campaign | `campaign_id`, `amount` |

#### Navigation Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `page_viewed` | Route change | `page_name`, `referrer` (auto-captured by PostHog) |
| `search_performed` | Search submitted | `query_length`, `filter_count`, `result_count` |
| `filter_applied` | Filter changed | `filter_name`, `filter_value` |
| `language_changed` | Language switched | `from_language`, `to_language` |

---

## Privacy Rules

### Hard Rules (Non-Negotiable)

| Rule | Implementation |
|------|---------------|
| No PII in events | Never track: email, name, phone, address, IP (hash) |
| No event values in URLs | Don't embed user data in `page_viewed` URLs |
| Respect DNT | `respect_dnt: true` in PostHog config |
| No tracking before consent | Implement cookie consent banner for EU (future) |
| Identify by anonymous ID | Use PostHog anonymous ID until user explicitly opts in |
| No cross-device tracking | Don't link anonymous sessions across devices without consent |

### Allowed Properties

| Category | Examples |
|----------|----------|
| Behavioral | Page views, clicks, form submissions |
| Product | Case type, donation amount, filter selections |
| Aggregate | City (not address), role (not name), capability (not identity) |
| Technical | Browser, OS, screen size (auto-captured) |

### GDPR Compliance

| Requirement | Implementation |
|-------------|---------------|
| Right to access | PostHog data export API |
| Right to deletion | PostHog data deletion API |
| Data processing agreement | PostHog EU DPA |
| Cookie consent | Banner before tracking init (Phase 2) |
| Data retention | 12 months default, configurable |

---

## Dashboard Requirements

### Admin Analytics Dashboard (`/admin/analytics` — future)

#### Overview Panel

| Metric | Display | Period |
|--------|---------|--------|
| Total cases created | Counter + trend | 7d / 30d / all time |
| Total donations | Counter + sum | 7d / 30d / all time |
| Active users (DAU/WAU/MAU) | Line chart | 30d |
| Funded cases (≥50% goal) | Counter + trend | 30d |

#### Donation Funnel

```
Case Viewed → Donate Clicked → Amount Selected → Checkout Started → Completed
```

Show conversion rates between each step, with ability to filter by:
- Case type (critical/urgent/recovering)
- Verification status
- City
- Time period

#### Case Performance

| Metric | Display |
|--------|---------|
| Cases by status | Pie chart |
| Cases by type/urgency | Bar chart |
| Average time to funding goal | Trend line |
| Average funding percentage at close | Histogram |
| Top performing cases | Table (title, funded %, donors) |

#### Trust Metrics

| Metric | Display |
|--------|---------|
| Verification rate | Gauge (% of cases verified) |
| Reports filed | Counter + trend |
| Report resolution time | Average + P90 |
| Repeat donor rate | D30 / D90 trend |

#### Geographic

| Metric | Display |
|--------|---------|
| Users by city | Bar chart / map |
| Cases by city | Bar chart |
| Donations by city | Bar chart |

### PostHog Dashboards (Ops Team)

Use PostHog's built-in dashboard builder for:
- Real-time event stream
- Funnel analysis (ad hoc)
- Retention cohorts
- Session recordings (trust surface debugging)
- Feature flag analytics

---

## Server-Side Analytics

Some KPIs require backend computation (not frontend events):

### Convex Scheduled Functions (Future)

```typescript
// convex/analytics.ts (future)
export const computeDailyKPIs = internalAction({
  handler: async (ctx) => {
    // Compute:
    // - repeat donor rate (D30/D90)
    // - verification rate
    // - report resolution time
    // - funded case count
    // Store in analytics table for dashboard queries
  },
});
```

### Analytics Table (Future)

```typescript
// Addition to schema.ts (future)
analyticsSnapshots: defineTable({
  date: v.string(),          // YYYY-MM-DD
  metric: v.string(),        // KPI name
  value: v.number(),         // Computed value
  dimensions: v.optional(v.object({
    city: v.optional(v.string()),
    caseType: v.optional(v.string()),
  })),
}).index("by_metric_date", ["metric", "date"]),
```

---

## Implementation Roadmap

### Phase 0: Foundation (Week 1)

- [ ] Install PostHog SDK (`posthog-js`)
- [ ] Create `src/lib/analytics.ts` with init, identify, track, reset
- [ ] Add `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` env vars
- [ ] Initialize PostHog in `App.tsx` (production only)
- [ ] Verify pageview auto-capture works

### Phase 1: Core Events (Weeks 2-3)

- [ ] Implement case events (viewed, created, closed, shared)
- [ ] Implement donation events (started, checkout, completed, failed)
- [ ] Implement signup/onboarding events
- [ ] Identify users on login (anonymous traits only)
- [ ] Build first PostHog dashboard (overview metrics)

### Phase 2: Full Coverage (Weeks 4-6)

- [ ] Implement clinic events
- [ ] Implement community events
- [ ] Implement campaign events
- [ ] Implement navigation events
- [ ] Build donation funnel in PostHog
- [ ] GDPR cookie consent banner

### Phase 3: Advanced (Weeks 7+)

- [ ] Server-side KPI computation (`convex/analytics.ts`)
- [ ] Admin analytics dashboard page
- [ ] Retention cohort analysis
- [ ] Session replay on trust surfaces
- [ ] Feature flags for A/B testing
- [ ] Alert rules (donation drop, error spike)

---

## Event Inventory Summary

| Category | Event Count |
|----------|------------|
| Case | 7 |
| Donation | 5 |
| User | 6 |
| Clinic | 4 |
| Community | 4 |
| Campaign | 2 |
| Navigation | 4 |
| **Total** | **32** |

---

## Open Questions

1. **PostHog hosting:** Self-host or use PostHog Cloud EU? (Recommendation: Cloud EU for now, self-host when scale requires it)
2. **Cookie consent:** When should the GDPR cookie consent banner be implemented? (Recommendation: before Bulgaria launch)
3. **Revenue tracking:** Should donation amounts be tracked in PostHog for revenue analytics, or only in Stripe? (Recommendation: track amounts in PostHog for funnel analysis, Stripe is source of truth)
4. **Feature flags:** Should PostHog feature flags replace or complement any existing conditional rendering? (Recommendation: use for new feature rollout only)
5. **Data warehouse:** Should PostHog data be exported to a data warehouse for cross-referencing with Convex data? (Future consideration)
6. **Mobile analytics:** Should Capacitor mobile builds use the same PostHog web SDK, or a native mobile SDK? (Recommendation: web SDK via Capacitor webview is sufficient for MVP)
