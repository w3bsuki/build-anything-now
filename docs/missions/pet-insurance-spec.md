# Pet Insurance Referrals Spec

> **Owner:** Product + Partnerships
> **Status:** draft
> **Last updated:** 2026-02-08

---

## Purpose

Generate recurring revenue and protect newly adopted/rescued animals through a partnership-based pet insurance referral program. Pawtreon's rescue-to-adoption pipeline creates a natural high-intent audience for pet insurance: people who have just adopted an animal or completed funding a rescue case already care deeply about animal welfare and are primed to invest in ongoing protection.

This is a lightweight partnership play — Pawtreon refers users to vetted insurance providers and earns a commission per signup, with no need to handle insurance products, claims, or underwriting.

**Classification:** Future revenue stream. Spec now for partnership planning and integration point design, build after core platform (rescue + donations + adoption) is established and generating adoption/case-closure volume.

---

## User Stories

- As an **adopter**, I want to receive an insurance offer after completing an adoption so I can protect my new pet from day one.
- As a **rescuer** whose case just closed successfully, I want to learn about pet insurance for the adopted animal so the rescue outcome is durable.
- As a **pet owner** browsing the platform, I want to discover insurance options through my vet clinic's profile so I can compare plans conveniently.
- As an **admin**, I want to onboard insurance partners with referral tracking so we can monitor conversion and commission revenue.
- As an **insurance partner**, I want to see how many referrals and conversions come from Pawtreon so I can evaluate the partnership ROI.

---

## Functional Requirements

### Partner Onboarding

1. **Insurance partner registration** — Admin adds insurance providers as partners. Each partner has: company name, logo, description, website, coverage types offered (accident, illness, wellness, comprehensive), markets served (country/region), referral commission terms, referral URL template, status (active/paused/retired).
2. **Referral link generation** — Each partner has a referral URL template with Pawtreon attribution parameters (e.g., `https://partner.com/signup?ref=pawtreon&campaign={campaignId}&user={userId}`). UTM parameters for tracking: `utm_source=pawtreon`, `utm_medium=referral`, `utm_campaign={context}`.
3. **Partner vetting** — Only legitimate, licensed insurance providers onboarded. Admin verifies: business registration, insurance license, customer reviews/reputation, coverage terms transparency. No predatory or deceptive insurance products.

### Integration Points

4. **Post-adoption offer** — After an adoption listing status changes to `adopted`, display an insurance suggestion card to the adopter. Content: "Protect [animal name] with pet insurance. Our partners offer coverage starting at €X/month." CTA: "Compare plans" → partner selection → referral link.
5. **Case completion suggestion** — When a rescue case reaches `closed_success` and the animal has been adopted (or is en route to adoption via safehouse), display an insurance suggestion to the case owner and any known adopter. Context: "The rescue is complete! Consider insurance to keep [animal name] protected."
6. **Clinic partnership bundles** — Partner clinics can display insurance partner offers on their clinic profile. Bundle concept: "Visit [Clinic Name] for health check + get 10% off first month of insurance." This is co-branded between clinic and insurance partner.
7. **General discovery** — Insurance partner cards in the marketplace/services directory (see `marketplace-spec.md`). Browse insurance options independently of a specific adoption or case event.
8. **Notification delivery** — Insurance suggestions delivered via the notification system (`system` type, see `notifications-spec.md`). In-app notification with link to insurance comparison/selection. Email notification (future) with same content.

### Referral Tracking

9. **Click tracking** — When a user clicks a referral link, log: userId, partnerId, context (post-adoption/case-completion/clinic-bundle/directory-browse), timestamp, referral URL.
10. **Conversion tracking** — Insurance partner reports successful signups back to Pawtreon via: (a) webhook callback with referral ID, or (b) monthly CSV report, or (c) affiliate network reporting (if using a network like Impact, CJ). Conversion record: referral ID, signup date, plan type, first premium amount.
11. **Commission calculation** — Per partner agreement. Common models: flat fee per signup (€10–€50), percentage of first year premium (10–30%), recurring percentage on renewals (5–15%). Commission logged per conversion.
12. **Reporting dashboard** — Admin view: total referrals, conversion rate, total commission earned, breakdown by partner, breakdown by context (where the referral originated).

### User Experience Guardrails

13. **No spam** — Insurance suggestions appear at contextually appropriate moments only (post-adoption, case completion). Never on case creation, donation flow, or browsing feed. Maximum 1 insurance suggestion per event per user.
14. **Opt-out** — Users can dismiss insurance suggestions permanently ("Don't show me insurance offers") or per-instance ("Not now"). Preference stored in `userSettings`.
15. **Transparency** — Clear disclosure: "Pawtreon earns a referral commission when you sign up for insurance through our partners. This doesn't affect your price." Required by consumer protection regulations.
16. **No pressure** — Insurance is always optional. No language implying the animal is at risk without insurance. No time-limited offers that create artificial urgency.

---

## Non-Functional Requirements

- **GDPR compliance:** No user PII shared with insurance partners without explicit consent. Referral links use anonymous attribution (hashed userId or referral code, not email/name). If partner requires user info for pre-filling signup: explicit opt-in consent dialog before redirect.
- **Privacy:** User's insurance interaction history (clicks, signups) is private. Not shown on public profile. Not used for other platform features without consent.
- **Accessibility:** Insurance suggestion cards meet WCAG AA. Dismissible via keyboard. Screen reader announces: "Insurance suggestion for [animal name]. Press Enter to learn more, Escape to dismiss."
- **i18n:** Insurance offer copy uses i18n keys. Partner-specific content (plan names, pricing) in partner's language with Pawtreon UI chrome translated.
- **Performance:** Insurance suggestion cards load asynchronously — never block adoption completion or case closure flow.

---

## Data Model

### Schema Changes Required

**Add `"insurance"` to `partners.type` union:**

```typescript
// convex/schema.ts — partners table (proposed change)
type: v.union(
    v.literal("pet-shop"),
    v.literal("food-brand"),
    v.literal("veterinary"),
    v.literal("sponsor"),
    v.literal("insurance"),  // ← new
),
```

### New Tables

| Table | Purpose | Fields |
|-------|---------|--------|
| `insurancePartners` | Extended partner data for insurance providers | `partnerId: Id<"partners">`, `coverageTypes[]` (accident/illness/wellness/comprehensive), `marketsServed[]` (country codes), `referralUrlTemplate: string`, `commissionModel` (flat/percentage/recurring), `commissionRate: number`, `commissionCurrency: string`, `status` (active/paused/retired), `contactEmail`, `contractStartDate`, `contractEndDate` |
| `insuranceReferrals` | Click and conversion tracking | `userId: Id<"users">`, `insurancePartnerId: Id<"insurancePartners">`, `context` (post-adoption/case-completion/clinic-bundle/directory/other), `sourceId` (adoptionId or caseId, optional), `referralCode: string`, `referralUrl: string`, `clickedAt: number`, `convertedAt: number?`, `planType: string?`, `premiumAmount: number?`, `commissionAmount: number?`, `status` (clicked/converted/expired) |
| `insurancePreferences` | User opt-out tracking | (Could be a field in `userSettings` instead) `userId: Id<"users">`, `showInsuranceOffers: boolean`, `dismissedAt: number?` |

**Alternative lightweight approach:** Skip `insurancePartners` table and use the existing `partners` table with `type: "insurance"` + store referral URL in `website` field and commission terms in `description`. Track referrals with just UTM parameters and external affiliate network reporting (no `insuranceReferrals` table). This is simpler but less auditable.

**Recommendation:** Start with the lightweight approach (partner + UTM tracking). Add dedicated tables when referral volume justifies the complexity.

---

## API Surface

### Lightweight Phase (Partner + UTM)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `partners.getInsurancePartners` | query | no | List active insurance partners. Returns name, logo, description, website, coverage types. |
| `partners.getInsuranceOffer` | query | no | Get contextual insurance offer for a specific adoption or case. Returns partner recommendation with referral URL. |

### Full Phase (Dedicated Tracking)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `insurancePartners.list` | query | admin | List all insurance partners with contract details |
| `insurancePartners.create` | mutation | admin | Onboard new insurance partner |
| `insurancePartners.update` | mutation | admin | Update partner terms, status |
| `insuranceReferrals.track` | mutation | yes | Log referral click (user, partner, context) |
| `insuranceReferrals.reportConversion` | internalMutation | internal | Partner webhook reports successful signup |
| `insuranceReferrals.getStats` | query | admin | Reporting dashboard: referrals, conversions, commission by partner/context |
| `insuranceReferrals.getUserHistory` | query | yes (self) | User's own referral/conversion history (settings, privacy) |

---

## UI Surfaces

### Insurance Suggestion Cards

Contextual cards that appear at natural decision points:

#### Post-Adoption Card
- **Trigger:** `adoption.status` changes to `adopted`
- **Placement:** Adoption success page, below "Congratulations" message
- **Content:** Icon (shield), "Protect [animal name]", partner logo(s), "Compare insurance plans from our partners", "Starting at €X/month"
- **Actions:** "Compare Plans" (primary CTA → partner selection), "Not now" (dismiss), "Don't show again" (permanent opt-out)

#### Case Completion Card
- **Trigger:** `case.lifecycleStage` changes to `closed_success`
- **Placement:** Case closure confirmation, in the success state
- **Content:** "The rescue is complete! Consider insurance for ongoing protection."
- **Actions:** Same as above
- **Note:** Only show if case has an associated adoption or known adopter

#### Clinic Profile Insurance Section
- **Trigger:** Clinic has partnered insurance provider
- **Placement:** Clinic profile page, below services/hours
- **Content:** "Insurance partners" section with 1–2 partner cards
- **Actions:** "Learn more" → partner referral link

#### Directory Listing
- **Trigger:** User browses marketplace/services directory
- **Placement:** Insurance category/tab in service directory (see `marketplace-spec.md`)
- **Content:** Insurance partner cards with coverage summary

### Admin Surfaces

| Surface | Route | Purpose |
|---------|-------|---------|
| **Insurance Partners** | `/admin/insurance-partners` | Manage insurance partners: add, edit, activate/deactivate |
| **Referral Dashboard** | `/admin/insurance-referrals` | Metrics: total clicks, conversions, conversion rate, commission earned, breakdown by partner and context |

---

## Revenue Model

### Commission Structures (Industry Benchmarks)

| Model | Commission | When Earned | Example |
|-------|-----------|-------------|---------|
| **Flat fee per signup** | €15–€50 | On confirmed signup | Partner pays €25 per new policyholder referred by Pawtreon |
| **First premium percentage** | 10–30% | On first payment | €20/month premium → €4–€6 commission |
| **Recurring percentage** | 5–15% | On each renewal | Ongoing €1–€3/month per active policyholder |
| **Hybrid** | Flat + recurring | Signup + renewals | €20 signup bonus + 10% recurring |

**Projected revenue (conservative):**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Monthly adoptions | 20 | 80 | 250 |
| Insurance offer impression rate | 80% | 85% | 90% |
| Conversion rate | 3% | 5% | 8% |
| Monthly signups | 0.5 | 3.4 | 18 |
| Avg commission per signup | €25 | €30 | €30 |
| Monthly commission | €12 | €102 | €540 |
| Annual commission | €150 | €1,224 | €6,480 |

**Note:** These are conservative estimates based on low adoption volume in Year 1 (Bulgaria launch). Revenue scales with adoption volume and conversion optimization. Recurring commission models provide compounding revenue as the policyholder base grows.

---

## Integration Flow: Post-Adoption Insurance Offer

```
Adopter completes adoption on Pawtreon
  ↓
adoption.status → "adopted" (mutation triggers)
  ↓
System generates notification (type: "system", subtype: "insurance_offer")
  ↓
Adopter sees insurance card on:
  - Adoption success page (inline)
  - Notification center (in-app)
  - Email (future)
  ↓
Adopter clicks "Compare Plans"
  ↓
Partner selection modal / page (if multiple partners)
  ↓
User selects partner → consent dialog ("You'll be redirected to [Partner]. Pawtreon earns a commission.")
  ↓
Redirect to partner referral URL with attribution params
  ↓
(External) User completes insurance signup on partner site
  ↓
Partner reports conversion (webhook or monthly report)
  ↓
Pawtreon logs conversion + commission
```

---

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Insurance offer feels spammy | Max 1 offer per adoption event. Dismissible. Permanent opt-out available. Never shown during donation or rescue flows. |
| Partner goes offline/stops coverage | Admin marks partner as `paused`. Referral links redirect to Pawtreon error page with "This offer is no longer available." |
| Self-referral for commission | Commission goes to platform, not to users. No user-visible referral bonus. Referral attribution is Pawtreon-level, not user-level. |
| GDPR consent withdrawal | User opts out of insurance offers → preference stored. Any tracked referral data subject to GDPR deletion request. No PII in referral URLs. |
| Insurance partner charges more via Pawtreon | Contractual requirement: referral price ≤ partner's direct price. Disclosure: "This doesn't affect your price." |
| User clicks referral but doesn't sign up | Logged as click-only (no conversion). No commission earned. Referral expires after 30 days. |
| Insurance becomes mandatory-feeling | UX review: words like "recommended" or "essential" avoided. Use "consider" or "explore." No urgency language. |
| Partner in Bulgaria doesn't exist yet | Bulgaria's pet insurance market is small. May need to launch with EU-level partners or delay until adoption volume justifies partner outreach. Start with research phase. |

---

## Open Questions

1. **Bulgaria pet insurance market** — Do pet insurance providers operate in Bulgaria? If not, is this a wider EU play that only activates when the platform expands to Western Europe? Research needed: Petplan, Figo, Lemonade Pet, local Bulgarian providers.

2. **Affiliate link vs. deeper integration** — Simple UTM referral links (lightweight, fast to implement) vs. API integration (pre-fill user data with consent, real-time conversion tracking, embedded quote engine). **Recommendation:** Start with affiliate links. Add API integration if a major partner offers it and volume justifies the development.

3. **Commission negotiation leverage** — Pawtreon's early adoption volume is very low. Do insurance partners care about a referral channel with <20 conversions/month? May need to bundle with other partnership benefits (brand visibility on platform, co-branded content, access to rescue community demographic data).

4. **Offer frequency capping** — If a user adopts multiple animals, do they get an insurance offer each time? Probably yes (each pet needs its own policy). But if they dismiss, how long before offering again?

5. **Coverage scope** — Should Pawtreon recommend specific coverage types? (e.g., accident-only for outdoor cats, comprehensive for purebreds?) Or stay neutral and let partner handle coverage selection? **Recommendation:** Stay neutral. Pawtreon is a referral channel, not an insurance advisor.

6. **Post-case insurance for non-adopted animals** — If a donor funds a rescue but the animal isn't adopted (stays with rescuer or returns to semi-wild), is insurance relevant? Probably not — insurance typically requires an owner/policyholder.

7. **Regulatory requirements** — Does referring insurance in Bulgaria/EU require Pawtreon to hold an insurance intermediary license? Research needed on Insurance Distribution Directive (IDD) exemptions for referral-only models.

8. **Analytics for partners** — What data do insurance partners need to evaluate the partnership? Clicks, impressions, conversions, demographics (age of adopters, species adopted, location)? What can we share while respecting GDPR?
