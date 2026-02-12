# Growth Strategy Spec

> **Owner:** Product + Growth
> **Status:** draft
> **Last updated:** 2026-02-09
> **PRD Ref:** P2 — Growth Surface (FOLLOW, RECURRING, EXTERNAL LINKS, VOLUNTEERS, CLINIC ONBOARDING)

---

## Purpose

Pawtreon's growth strategy is driven by organic loops rooted in the rescue mission: every shared case is a growth channel, every new donor is a potential case creator. This spec covers the Bulgaria launch playbook, social media consolidation strategy, referral mechanics, content strategy, and EU expansion criteria. Growth is trust-dependent — virality only works if the platform is credible, which is why the verification system (clinics, partners) must be in place before aggressive growth pushes.

**Core growth thesis:** Rescue content is inherently shareable. A compelling case with transparent donations and visible progress generates organic reach that paid channels cannot match. The platform's job is to reduce friction between "I saw a rescue post on Facebook" and "I just donated €10 on Pawtreon."

---

## User Stories

- As a **rescuer**, I want to share a case link on Facebook so my existing community can donate through Pawtreon instead of fragmented DMs.
- As a **donor**, I want to share a case I donated to so my friends can see the impact and donate too.
- As a **Facebook group admin**, I want to migrate my rescue community's fundraising to Pawtreon so donations are tracked transparently instead of through bank transfers.
- As a **first-time visitor** who clicked a shared link, I want to understand the case and donate quickly without friction.
- As a **shelter in Sofia**, I want to be discoverable to local donors searching for rescue causes.
- As a **platform operator**, I want organic growth loops that reduce CAC over time.

---

## Functional Requirements

### 1. Bulgaria Launch Playbook

**Decision (2026-02-06, DECISIONS.md #8):** Seed verified clinic directory first (Sofia, Varna, Plovdiv initial cohort). Progressive partner onboarding.

**Why Bulgaria first:**
- Founder's home market — deep local knowledge of the rescue ecosystem.
- Active rescue community on Facebook (100+ groups, 50K+ combined members).
- Less competition from incumbents (no GoFundMe or JustGiving presence in BG).
- Lower CAC for testing ($2-3/donor vs. $8-10 in Western Europe).
- EU payment infrastructure (Stripe, SEPA).

**City-by-city rollout:**

| Phase | City | Timeline | Targets |
|---|---|---|---|
| **Phase 0** | Sofia | Months 1–3 | 20 clinics seeded, 5 NGO partners, 500 donors, €10K donations |
| **Phase 1** | + Varna | Months 3–6 | 40 total clinics, 10 partners, 1K donors, €30K donations |
| **Phase 2** | + Plovdiv | Months 6–9 | 60 total clinics, 20 partners, 2K donors, €50K donations |
| **Phase 3** | National | Months 9–12 | 100+ clinics, 50 partners, 5K donors, €100K donations |

**Sofia launch sequence:**

```
Week 1-2:  Seed Sofia clinic directory (50+ clinics verified)
   ↓
Week 3-4:  Onboard 3-5 high-profile rescue NGOs
   ↓
Week 5-6:  NGOs create first cases on Pawtreon
   ↓
Week 7-8:  Launch community (Facebook posts, Instagram stories)
   ↓
Week 9-10: First donation milestone (€5K) — press release
   ↓
Week 11-12: Case study: "How [NGO] raised €X in 2 months on Pawtreon"
```

**Per-city entry criteria:**
- ≥ 15 verified clinics seeded in directory.
- ≥ 2 committed partner NGOs/shelters.
- i18n: Bulgarian language support live (see [i18n-spec.md](../design/i18n-spec.md)).
- Payment: BGN (лв) currency supported in checkout.

---

### 2. Social Consolidation: FB/IG → Pawtreon

**Problem:** Bulgaria's rescue community operates primarily through Facebook groups and Instagram posts. Fundraising happens via bank transfers shared in comments — no transparency, no receipt, no fraud protection. Pawtreon replaces this with structured, verified, trackable fundraising.

**Strategy:** Don't compete with Facebook for community — augment it. Rescuers continue posting on FB/IG but link to Pawtreon for donations and case tracking.

**Social consolidation flow:**

```
Rescuer posts on Facebook: "Found injured dog near [location]..."
   ↓
Rescuer creates case on Pawtreon with same story + photos
   ↓
Rescuer adds Pawtreon case link to FB post: "Donate here →"
   ↓
FB community clicks link → lands on Pawtreon case page
   ↓
First-time visitors: one-click donate (no signup required for Stripe checkout)
   ↓
Post-donation: "Sign up to track this case" CTA
```

**Source attribution (Phase 2 — per PRD.md):**

When a case originates from a social media post, track attribution:

| Field | Type | Purpose |
|---|---|---|
| `sourceUrl` | `v.optional(v.string())` | Original FB/IG post URL |
| `sourcePlatform` | `v.optional(v.string())` | "facebook" / "instagram" / "other" |
| `importedAt` | `v.optional(v.number())` | When the case was linked to the source |

**UI:** "Originally shared on Facebook" badge on case page with link to original post. Builds trust — donors can see the rescue is real because it exists in both places.

**Future (Phase 3): Semi-automated import:**
- Rescuer pastes FB post URL into Pawtreon.
- System extracts: text, images (with permission), location.
- Pre-fills case creation form. Rescuer reviews and publishes.
- Requires: Facebook Graph API access (limited), image download + re-upload, content parser.

---

### 3. Referral Mechanics

**Core loop:**

```
Case shared → Friend clicks link → Friend donates → Friend creates account
   → Friend discovers more cases → Friend shares another case → Cycle repeats
```

**Referral tracking:**

| Mechanism | How It Works |
|---|---|
| **Share link with UTM** | Every share generates a unique URL with `ref=userId` parameter |
| **Cookie attribution** | First-touch attribution: 30-day cookie window |
| **Referral record** | On signup: check for `ref` param → create referral record linking referrer and new user |

**Data model additions:**

| Table | Field | Type | Purpose |
|---|---|---|---|
| `users` | `referredBy` | `v.optional(v.id("users"))` | Who referred this user |
| `users` | `referralSource` | `v.optional(v.string())` | Channel: "share_link", "case_embed", "social" |
| New: `referrals` | `referrerId` | `v.id("users")` | The referring user |
| New: `referrals` | `referredId` | `v.id("users")` | The new user |
| New: `referrals` | `caseId` | `v.optional(v.id("cases"))` | Case that was shared |
| New: `referrals` | `channel` | `v.string()` | "whatsapp", "facebook", "copy_link", "email" |
| New: `referrals` | `convertedAt` | `v.optional(v.number())` | When the referred user donated |
| New: `referrals` | `createdAt` | `v.number()` | When the referral was created |

**Referral incentives:**

| Milestone | Reward | Type |
|---|---|---|
| 1st successful referral | "Connector" badge | Achievement badge |
| 5 referrals | "Community Builder" badge | Achievement badge |
| 10 referrals | Featured in monthly impact report | Social recognition |
| 25 referrals | "Pawtreon Ambassador" role | Status + early feature access |

> **Decision:** Incentives are recognition-based (badges, status), not monetary. Financial incentives on a donation platform risk abuse and undermine trust.

**Share surfaces:**
- Case page: share button with options (WhatsApp, Facebook, copy link, email).
- Post-donation: "Share this case to double the impact" CTA with pre-filled message.
- Impact summary: "You've helped raise €X. Share to reach more donors."
- Profile page: referral stats and badges earned.

---

### 4. Content Strategy

**Content pillars:**

| Pillar | Purpose | Frequency | Owner |
|---|---|---|---|
| **Rescue Spotlights** | Feature an active case with compelling story | 2x/week | Content + NGO partners |
| **Success Stories** | Completed cases showing full donation→recovery journey | 1x/week | Content team |
| **Impact Reports** | Monthly aggregated statistics: €X raised, Y animals helped | Monthly | Product + Data |
| **Behind the Scenes** | Clinic visits, volunteer stories, partner spotlights | 1x/week | Partnerships |
| **Community Highlights** | Top donors, volunteers, referrers of the month | Monthly | Community |

**Content distribution channels:**

| Channel | Content Type | Goal |
|---|---|---|
| **Facebook** (Bulgarian rescue groups) | Rescue spotlights, success stories | Drive donations, case awareness |
| **Instagram** | Visual stories (before/after), Reels | Brand awareness, emotional engagement |
| **Email newsletter** | Impact reports, curated cases | Donor retention, recurring giving |
| **Pawtreon feed** | All content types | On-platform engagement |
| **PR / local media** | Milestone announcements, partnership launches | Credibility, top-of-funnel |

**Content creation from platform data:**
- Auto-generate success story drafts when a case reaches 100% funding.
- Monthly impact email with personalized stats: "Your donations helped X animals this month."
- Shareable case cards with progress bar, photo, and donation CTA (Open Graph optimized).

---

### 5. Organic Growth Loops

```
┌─────────────────────────────────────────────────────────┐
│                    PRIMARY GROWTH LOOP                   │
│                                                         │
│  Case Created → Shared on Social → Donor Visits         │
│       ↑                                    ↓            │
│  Donor creates    ← Account Created ← Donates           │
│  their own case                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 SECONDARY GROWTH LOOP                    │
│                                                         │
│  Clinic Verified → Verifies Case → Donor Trusts More   │
│       ↑                                    ↓            │
│  More clinics     ← Platform Grows ← Donates More      │
│  join platform                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  PARTNER GROWTH LOOP                     │
│                                                         │
│  NGO Joins → Creates Cases → Cases Get Funded           │
│       ↑                                    ↓            │
│  More NGOs see  ← Success Stories ← NGO Shares Results  │
│  value                                                   │
└─────────────────────────────────────────────────────────┘
```

**Key metrics for loop health:**

| Metric | Target (Y1) | Measurement |
|---|---|---|
| Cases with ≥ 1 share | 60% | Share event tracking |
| Share → visit conversion | 15% | UTM + referral attribution |
| Visit → donation conversion | 8% | Funnel analytics |
| Donation → signup conversion | 40% | Post-donation CTA tracking |
| New users who create a case | 5% | Activation funnel |
| Viral coefficient (k-factor) | 0.3 | referrals per user |

---

### 6. EU Expansion Criteria

**Decision framework: When to enter a new market.**

| Criterion | Threshold | Rationale |
|---|---|---|
| Bulgaria proven | €100K donations, 50 active partners | Must validate model before expanding |
| Regulatory readiness | GDPR compliance, local payment methods | Legal foundation |
| i18n completeness | App fully localized in target language | UX requirement |
| Partner pipeline | ≥ 5 committed launch partners in target country | Supply-side readiness |
| Rescue community mapping | Active rescue groups identified, 3+ willing to pilot | Demand-side signal |

**Expansion sequence (from investor docs):**

| Priority | Country | Rationale | Est. Timeline |
|---|---|---|---|
| 1 | **Germany** | Largest EU pet market, high donation culture | Y2 Q1 |
| 2 | **UK** | English-speaking, high per-capita giving | Y2 Q2 |
| 3 | **Netherlands** | Strong animal welfare culture, tech-savvy | Y2 Q3 |
| 4 | **Poland** | Regional synergy with Bulgaria, growing market | Y2 Q4 |
| 5 | **Spain, Italy, France** | Large populations, growing pet markets | Y3 |

**Per-country launch template:**
1. Map rescue community (Facebook groups, NGOs, clinic directories).
2. Recruit 5 launch partners (2 clinics, 2 NGOs, 1 sponsor).
3. Seed clinic directory (top 3 cities).
4. Localize app (full translation + currency).
5. Soft launch: partners create cases, invite their donor base.
6. Public launch: PR, social, paid ads.
7. Measure: 90-day review against Bulgaria benchmarks.

---

## Non-Functional Requirements

- **Attribution accuracy:** Referral and source tracking must be reliable. First-touch attribution, 30-day window, no double-counting.
- **Share link performance:** Shared links must load case page in < 2s for first-time visitors (cold cache). Open Graph tags populated for rich social previews.
- **Privacy compliance (GDPR):** Referral tracking requires cookie consent. Source URLs stored for attribution only, not exposed to other users. Per-user opt-out of referral tracking.
- **i18n readiness:** Growth is gated on localization. No market entry without full app localization (see [i18n-spec.md](../design/i18n-spec.md)).
- **Analytics tooling:** PostHog selected (DECISIONS.md #10). Must implement before Bulgaria launch: event tracking for shares, referrals, conversions, funnel dropoffs. Cookie consent banner required for EU.

---

## Data Model

### Additions to `cases` table

| Field | Type | Purpose |
|---|---|---|
| `sourceUrl` | `v.optional(v.string())` | Original social media post URL (FB/IG) |
| `sourcePlatform` | `v.optional(v.string())` | "facebook" / "instagram" / "tiktok" / "other" |

### Additions to `users` table

| Field | Type | Purpose |
|---|---|---|
| `referredBy` | `v.optional(v.id("users"))` | Referring user ID |
| `referralSource` | `v.optional(v.string())` | Channel of referral |

### New: `referrals` table

| Field | Type | Purpose |
|---|---|---|
| `referrerId` | `v.id("users")` | Who referred |
| `referredId` | `v.id("users")` | Who was referred |
| `caseId` | `v.optional(v.id("cases"))` | Case that was shared (if applicable) |
| `channel` | `v.string()` | "whatsapp", "facebook", "copy_link", "email", "embed" |
| `convertedAt` | `v.optional(v.number())` | When referred user first donated |
| `createdAt` | `v.number()` | |

**Indexes:** `by_referrer`, `by_referred`, `by_case`, `by_channel`

### New: `shareEvents` table

| Field | Type | Purpose |
|---|---|---|
| `userId` | `v.id("users")` | Who shared |
| `caseId` | `v.optional(v.id("cases"))` | Case shared |
| `campaignId` | `v.optional(v.id("campaigns"))` | Campaign shared |
| `channel` | `v.string()` | Share destination |
| `createdAt` | `v.number()` | |

**Indexes:** `by_user`, `by_case`, `by_campaign`

---

## API Surface

### Sharing & Referrals

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `referrals.trackShare` | mutation | Authenticated | Record a share event |
| `referrals.resolveReferral` | mutation | System (at signup) | Link new user to referrer |
| `referrals.getMyStats` | query | Authenticated | Referral stats for profile |
| `referrals.getLeaderboard` | query | Public | Top referrers for community page |

### Source Attribution

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `cases.setSource` | mutation | Case owner | Set source URL and platform for a case |
| `cases.getBySource` | query | Public | Find cases linked to a social post |

### Growth Analytics (Admin)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `reports.growthFunnel` | query | Admin | Share → visit → donate → signup funnel |
| `reports.referralMetrics` | query | Admin | Referral conversion rates, top channels |
| `reports.cityMetrics` | query | Admin | Per-city donation volume, partner count |

---

## UI Surfaces

### Share Sheet (Case/Campaign Page)
- Triggered by share button on case or campaign.
- Options: WhatsApp, Facebook, Instagram story, Copy Link, Email.
- Pre-filled message: case title + progress + Pawtreon link with `ref` param.
- Share generates tracking event via `referrals.trackShare`.

### Post-Donation Share CTA
- After donation confirmation: "Share this case to double the impact."
- Show: case photo + progress bar + personalized message ("You just helped [animal name]!").
- One-tap share to WhatsApp (primary for Bulgaria market).

### "Imported from" Badge (Case Page)
- If `sourceUrl` exists: show "Originally shared on [Facebook/Instagram]" badge with link.
- Builds trust: case exists in original community + on Pawtreon.

### Referral Dashboard (Profile Page)
- "People you've brought to Pawtreon" count.
- Badges earned from referral milestones.
- "Share your referral link" CTA.

### Landing Page for Shared Links
- Case page must work for anonymous visitors (no login required to view).
- Clear CTA: "Donate Now" (primary), "Create Account" (secondary).
- Social proof: donation count, donor avatars, clinic verification badge.
- Fast load: < 2s first contentful paint.

---

## Edge Cases & Abuse

| Scenario | Handling |
|---|---|
| **Spam referrals** | Rate limit: max 100 share events per user per day. Referrals from the same IP/device within 1h de-duplicated. |
| **Self-referral** | Referrer cannot be the same as referred user. Email/device fingerprint check. |
| **Fake social imports** | Source URL validated for format (FB/IG URL pattern). Admin spot-check for fabricated sources. |
| **Referral gaming for badges** | Badge award requires referred user to complete a donation (not just signup). Prevents low-quality referrals. |
| **Attribution conflicts** | First-touch wins. If a user clicks referral links from two different users, first one gets credit. |
| **GDPR: user requests data deletion** | Referral records anonymized (referrerId set to null). Share events deleted. |
| **Expansion to market with no rescue community** | Entry criteria block premature expansion. Must have mapped rescue community + committed partners before launch. |

---

## Acceptance Criteria

- [ ] PRD growth-surface items link to concrete specs and rollout sequencing (follow, recurring support, external links, volunteer surfaces, clinic onboarding dependencies).
- [ ] Bulgaria-first rollout has explicit entry criteria and measurable city-level targets before expansion.
- [ ] Referral and attribution rules define one canonical conversion model (first-touch, window, dedup, anti-self-referral).
- [ ] Growth loops are mapped to measurable funnel metrics with event-level tracking expectations.
- [ ] Abuse controls exist for referral gaming, fake source attribution, and spam sharing.
- [ ] EU expansion criteria include readiness checks for localization, regulatory compliance, and partner supply.

---

## Open Questions

1. **Facebook API access:** How much FB Graph API access can we get for semi-automated case import? Meta's API restrictions are increasingly tight. May need to rely on manual URL paste + metadata scraping rather than authenticated API access.
2. **Referral incentive escalation:** Should Pawtreon Ambassadors (25+ referrals) get functional benefits (e.g., early access to features, reduced fees) or keep incentives purely social (badges, recognition)? Risk: functional incentives may create power users who game the system.
3. **WhatsApp Business API:** WhatsApp is the dominant messaging app in Bulgaria. Should we invest in WhatsApp Business API for structured case sharing, or rely on standard share links? Cost vs. conversion uplift to evaluate.
4. **Paid acquisition budget:** Bulgaria launch plan assumes organic-first growth. At what point do we introduce paid ads (Facebook, Instagram)? Recommendation: after 1K organic donors to have baseline metrics for ad targeting.
5. **Content moderation at scale:** As growth accelerates, user-generated cases and community content need moderation. When should we implement automated content moderation (AI/ML-based) vs. relying on community reporting + manual review?
6. **Market expansion sequencing:** Should Germany and UK launch happen sequentially or in parallel? Parallel reduces time-to-market but doubles localization and partnership effort. Recommendation: sequential (Germany first — larger market + €-denominated).
