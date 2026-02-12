# Product Roadmap


> **Owner:** Founders
> **Status:** review
> **Last updated:** 2026-02-12

> **Non-SSOT:** This document is ideation/reference context and does not override root canonical docs.

---

## Current Status

**Overall Completion: ~60%**

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication (Clerk) | ✅ 100% | Fully integrated, multi-provider |
| Case Lifecycle + Updates | ✅ 100% | Create, update with evidence, lifecycle transitions |
| Donations (Stripe) | 🟡 80% | Hosted checkout + webhook done, receipt UX polish pending |
| Community Forum | ✅ 100% | Mobile shell, moderation, threading |
| Moderation + Audit | ✅ 100% | Report queue, admin review, audit logging |
| Mission Initiatives | ✅ 100% | Initiative campaigns with classification |
| Profiles + Capabilities | ✅ 100% | Multi-capability model, verification badges |
| I18n (5 languages) | ✅ 100% | EN, BG, UK, RU, DE with fallbacks |
| UI Components | ✅ 90% | shadcn/ui + Tailwind v4 |
| Clinic Directory | 🟡 60% | Directory + claim submit done, admin queue pending |
| Mobile Apps | 🟡 30% | Capacitor configured, builds pending |
| Notifications | 🔴 0% | Not started |
| Volunteer System | 🔴 0% | Not started |

---

## MVP Sprint: 8-Week Plan (Current — Jan–Feb 2026)

### Phase 0 (Week 1): Baseline & Governance Reset ✅ COMPLETE

- Canonical docs cleanup and decision log updates
- Baseline quality check and debt list capture
- All governance foundations locked

---

### Phase 1 (Weeks 2–3): Case Lifecycle Completion ✅ COMPLETE

| Deliverable | Status |
|-------------|--------|
| Owner/authorized update composer | ✅ Shipped |
| Structured updates with evidence metadata | ✅ Shipped |
| Lifecycle transitions (active → seeking_adoption → closed) | ✅ Shipped |
| Donation gating respects lifecycle/trust state | ✅ Shipped |

---

### Phase 2 (Weeks 3–5): Trust + Money 🟡 NEARLY COMPLETE

| Deliverable | Status |
|-------------|--------|
| Stripe hosted checkout flow | ✅ Shipped |
| Stripe webhook handler (payment confirmation) | ✅ Shipped |
| Post-checkout return UX (success/failure) | ✅ Shipped |
| Receipt display with case attribution | 🟡 Polish pending |
| Moderation queue + admin review | ✅ Shipped |
| Report flow (cases + community) | ✅ Shipped |
| Audit logging for high-risk actions | ✅ Shipped |

---

### Phase 3 (Weeks 5–7): Bulgaria Directory 🟡 IN PROGRESS

| Deliverable | Status |
|-------------|--------|
| Clinic directory page (search, filter, sort) | ✅ Shipped |
| Clinic profile page | ✅ Shipped |
| Claim submission flow with duplicate guard | ✅ Shipped |
| Admin claim review queue | 🔴 Pending |
| Claim SLAs (24h response, 72h resolution) | 🔴 Pending |

---

### Phase 4 (Weeks 6–7): Mission Campaigns ✅ COMPLETE

| Deliverable | Status |
|-------------|--------|
| Initiative campaign classification (drone/safehouse/platform/other) | ✅ Shipped |
| Featured initiative placement on home feed | ✅ Shipped |
| Campaign creation for initiatives | ✅ Shipped |
| Campaign progress tracking | ✅ Shipped |

---

## Post-MVP: Growth Phase (Months 3–6)

### Month 3: Launch & Feedback

| Feature | Description |
|---------|-------------|
| Bulgaria Launch | Sofia, Varna, Plovdiv — seed clinic data, onboard local rescuers |
| Notifications | Case updates, donation receipts, achievement unlocks |
| Social Sharing | OG meta tags, SSR share pages for case links |
| Feedback Collection | In-app feedback system |

---

### Month 4: Engagement

| Feature | Description |
|---------|-------------|
| Push Notifications | Capacitor-based native push (iOS + Android) |
| Recurring Donations | Monthly giving for rescuers/clinics |
| Follow System | Follow rescuers/clinics, "following" feed tab |
| Volunteer System | Availability, directory, transport requests |

---

### Month 5: Monetization

| Feature | Description |
|---------|-------------|
| Pro Tier Launch | Paid shelter subscriptions (€49–€199/mo) |
| Sponsor Portal | Self-service sponsorship dashboard |
| Analytics Dashboard | Shelter analytics (cases, donations, impact) |
| Verification Ladder | Unverified → community → clinic promotion flow |

---

### Month 6: Expansion Prep

| Feature | Description |
|---------|-------------|
| Multi-currency | EUR (primary), GBP, USD support |
| Additional Languages | Expand beyond 5 launch languages |
| Partner API | Integration endpoints for shelters |
| App Store Release | iOS + Android native app submissions |

---

## Scale Phase (Months 7–12)

### Q3 Focus: Platform Maturity

| Feature | Timeline |
|---------|----------|
| Corporate Giving Portal | Month 7 |
| Advanced Campaign Tools | Month 8 |
| AI Case Creation (server-side) | Month 8 |
| Direct Messaging | Month 9 |

---

### Q4 Focus: Revenue Diversification

| Feature | Timeline |
|---------|----------|
| Pet Insurance Referrals | Month 10 |
| Adoption Marketplace | Month 11 |
| Marketplace MVP | Month 12 |
| Enterprise Tier | Month 12 |

---

## Feature Roadmap Visual

```
2026
────────────────────────────────────────────────────────
Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct
 │     │     │     │     │     │     │     │     │     │
 ├─────┤     │     │     │     │     │     │     │     │
 │ MVP │     │     │     │     │     │     │     │     │
 │Sprint│    │     │     │     │     │     │     │     │
 │ ✅   ├────┴─────┴─────┴─────┤     │     │     │     │
 │      │   Growth & Monetize  │     │     │     │     │
 │      │                      ├─────┴─────┴─────┤     │
 │      │                      │   Scale &        │     │
 │      │                      │   Expansion      │     │
 ▼      ▼                      ▼                  ▼     ▼
~60%   Launch     Pro Tier    Germany/UK     Series A
Built  Bulgaria   Live        Expansion      Ready
```

---

## Key Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|------------------|
| **MVP Sprint Complete** | Feb 2026 | ✅ Core features shipped (auth, payments, cases, moderation) |
| **Bulgaria Launch** | Mar 2026 | Live app with seeded clinic data + local partners |
| **100 Users** | Mar 2026 | Active donors on platform |
| **€10K Processed** | Apr 2026 | First significant donation volume |
| **20 Clinics/Shelters** | Apr 2026 | Partner network growing |
| **First Paid Tier** | May 2026 | Revenue beyond transaction fees |
| **€100K Processed** | Jun 2026 | Product-market fit signal |
| **Germany/UK Launch** | Jul 2026 | Geographic expansion |
| **First Sponsor** | Jul 2026 | B2B revenue stream validated |
| **€500K Processed** | Sep 2026 | Scaling validated |
| **Series A Ready** | Dec 2026 | Metrics for next round |

---

## Technical Roadmap

### Infrastructure Evolution

| Phase | Infrastructure |
|-------|----------------|
| MVP | Convex (managed), Vercel (web), Capacitor (mobile) |
| Growth | + CDN, monitoring, error tracking |
| Scale | + Data warehouse, ML infrastructure |

### Team Evolution

| Phase | Team Size | Roles |
|-------|-----------|-------|
| MVP | 1–2 | Founder + AI-augmented development (OPUS/Codex) |
| Growth | 4–5 | + Developer, Designer, Marketing |
| Scale | 8–12 | + Sales, Data, Mobile specialist, Support |

---

## Dependencies & Risks

| Dependency | Risk | Mitigation |
|------------|------|------------|
| Stripe approval | Medium | Applied early, hosted checkout reduces compliance burden |
| App store approval | Medium | Follow guidelines strictly, Capacitor-native |
| Shelter adoption | High | Free tier, manual onboarding, claim flow simplicity |
| Payment compliance | Medium | Legal review, Stripe handles PCI compliance |
| Single developer | High | Document everything, AI-augmented workflow, hire post-funding |

---

## Success Metrics by Phase

### MVP Success (Month 1–2) — In Progress
- [x] Authentication integrated (Clerk)
- [x] Payment processing live (Stripe checkout + webhook)
- [x] Case lifecycle complete (create, update, close)
- [x] Moderation + audit logging shipped
- [ ] 100+ registered users (post-launch)
- [ ] 10+ clinic/shelter partners (post-launch)

### Growth Success (Month 3–6)
- [ ] 5,000+ registered users
- [ ] 50+ active clinics/shelters
- [ ] €200,000+ donations processed
- [ ] 10%+ monthly growth
- [ ] First paid subscribers

### Scale Success (Month 7–12)
- [ ] 50,000+ registered users
- [ ] 200+ active clinics/shelters
- [ ] €2,000,000+ donations processed
- [ ] 3+ countries live
- [ ] €500K+ ARR

---

*Next: [07-Traction-Metrics](./07-Traction-Metrics.md)*



