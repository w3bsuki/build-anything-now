# Business Model & Monetization

> **Owner:** Founders  
> **Status:** review  
> **Last updated:** 2026-02-09  
> Revenue model finalized — see `docs/business/monetization-spec.md` for full implementation details, data model additions, and open questions.

---

## Revenue Model Overview

Pawtreon generates revenue through **four primary streams**, designed to align platform growth with animal welfare outcomes. All core features remain free — monetization layers on top without gatekeeping rescue outcomes.

```
┌─────────────────────────────────────────────────┐
│              REVENUE STREAMS                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ Transaction  │    │  Shelter             │   │
│  │ Fees         │    │  Subscriptions       │   │
│  │ (5%)         │    │  (€49-199/mo)        │   │
│  └──────────────┘    └──────────────────────┘   │
│                                                  │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ Sponsored    │    │  Corporate           │   │
│  │ Campaigns    │    │  Programs            │   │
│  │ (€500-50K)   │    │  (Year 2+)           │   │
│  └──────────────┘    └──────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Revenue Stream #1: Transaction Fees

### How It Works
- **5% fee** on all donations processed through Stripe
- Donor pays full amount → Fee deducted before crediting case/campaign
- Example: Donor gives €100 → Case receives €95 → Pawtreon retains €5
- **Stripe's own processing fee (~2.9% + €0.25) is separate** — paid by the platform from the 5% margin
- Transparent fee disclosure at checkout: receipts include gross donation, platform fee, and net amount

> **Implementation note:** Stripe hosted checkout and webhook handling are implemented. Fee deduction logic (`platformFeeAmount` field) is designed but not yet live in production — currently the full donation amount is credited to cases. This will be activated before launch.

### Pricing Rationale
| Platform | Fee |
|----------|-----|
| GoFundMe | 2.9% + €0.30 |
| Facebook | 0% (but poor tools, no verification) |
| JustGiving | 5% |
| **Pawtreon** | **5%** (includes platform + Stripe fees) |

### Revenue Projection

| Year | Donation Volume | Fee Revenue |
|------|-----------------|-------------|
| Year 1 | €500,000 | €25,000 |
| Year 2 | €2,000,000 | €100,000 |
| Year 3 | €10,000,000 | €500,000 |
| Year 4 | €25,000,000 | €1,250,000 |
| Year 5 | €50,000,000 | €2,500,000 |

---

## Revenue Stream #2: Shelter Subscriptions

### Tiered Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | €0/mo | Basic profile, 3 cases, standard support |
| **Pro** | €49/mo | Unlimited cases, analytics, priority support |
| **Business** | €99/mo | + Campaigns, API access, custom branding |
| **Enterprise** | €199/mo | + Dedicated manager, multi-location, integrations |

### Feature Comparison

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| Active cases | 3 | Unlimited | Unlimited | Unlimited |
| Campaigns | ❌ | ❌ | ✅ | ✅ |
| Analytics dashboard | Basic | Full | Full | Custom |
| Donor CRM | ❌ | Basic | Full | Full |
| API access | ❌ | ❌ | ✅ | ✅ |
| Custom branding | ❌ | ❌ | ❌ | ✅ |
| Account manager | ❌ | ❌ | ❌ | ✅ |
| Transaction fee | 5% | 4% | 3% | 2% |

### Revenue Projection

| Year | Paid Shelters | Avg Revenue/Shelter | Subscription Revenue |
|------|---------------|---------------------|----------------------|
| Year 1 | 10 | €60/mo | €7,200 |
| Year 2 | 50 | €75/mo | €45,000 |
| Year 3 | 200 | €80/mo | €192,000 |
| Year 4 | 500 | €85/mo | €510,000 |
| Year 5 | 1,000 | €90/mo | €1,080,000 |

---

## Revenue Stream #3: Sponsored Campaigns

### How It Works
Brands pay to sponsor specific rescue cases or campaigns, getting:
- Logo placement on case/campaign page
- Social media mentions
- Impact report for CSR
- Press release opportunity

### Pricing Tiers

| Package | Price | Includes |
|---------|-------|----------|
| **Case Sponsor** | €500 | Sponsor 1 case, logo placement |
| **Campaign Sponsor** | €2,000 | Sponsor full campaign, social mentions |
| **Monthly Partner** | €5,000/mo | Multiple cases, featured placement, reports |
| **Annual Partner** | €50,000/yr | Premium placement, exclusive campaigns, events |

### Target Sponsors
- Pet food brands (Royal Canin, Pedigree, Whiskas)
- Pet insurance companies
- Vet clinic chains
- Pet retail (Fressnapf, Zooplus)
- General CSR-focused brands

### Revenue Projection

| Year | Sponsors | Avg Deal Size | Sponsorship Revenue |
|------|----------|---------------|---------------------|
| Year 1 | 5 | €1,000 | €5,000 |
| Year 2 | 20 | €2,000 | €40,000 |
| Year 3 | 50 | €3,000 | €150,000 |
| Year 4 | 100 | €5,000 | €500,000 |
| Year 5 | 200 | €7,500 | €1,500,000 |

---

## Revenue Stream #4: Corporate Giving Programs

### How It Works
B2B product for companies wanting employee giving programs:
- Branded giving portal
- Employee matching
- Team challenges
- Impact reporting
- Tax documentation

### Pricing

| Company Size | Setup Fee | Annual Fee |
|--------------|-----------|------------|
| Small (< 100 employees) | €1,000 | €5,000/yr |
| Medium (100-1000) | €2,500 | €15,000/yr |
| Large (1000+) | €5,000 | €50,000/yr |

### Revenue Projection

| Year | Corporate Clients | Avg Contract | Corporate Revenue |
|------|-------------------|--------------|-------------------|
| Year 1 | 0 | - | €0 |
| Year 2 | 2 | €10,000 | €20,000 |
| Year 3 | 10 | €15,000 | €150,000 |
| Year 4 | 25 | €20,000 | €500,000 |
| Year 5 | 50 | €25,000 | €1,250,000 |

---

## Total Revenue Projection

| Year | Transaction Fees | Subscriptions | Sponsorships | Corporate | **Total** |
|------|------------------|---------------|--------------|-----------|-----------|
| Year 1 | €25,000 | €7,200 | €5,000 | €0 | **€37,200** |
| Year 2 | €100,000 | €45,000 | €40,000 | €20,000 | **€205,000** |
| Year 3 | €500,000 | €192,000 | €150,000 | €150,000 | **€992,000** |
| Year 4 | €1,250,000 | €510,000 | €500,000 | €500,000 | **€2,760,000** |
| Year 5 | €2,500,000 | €1,080,000 | €1,500,000 | €1,250,000 | **€6,330,000** |

---

## Revenue Mix Evolution

```
Year 1:  [=========Transaction========][Sub][S]
         67%                           19%  14%

Year 3:  [====Transaction====][==Sub==][==Spon==][==Corp==]
         50%                  19%      15%       15%

Year 5:  [===Transaction===][==Sub==][====Spon====][===Corp===]
         40%                17%      24%          20%
```

**Strategy:** Start transaction-heavy, diversify to recurring B2B revenue

---

## Unit Economics

### Per-Donor Economics

| Metric | Value |
|--------|-------|
| CAC (Customer Acquisition Cost) | €5 |
| Average Donation | €25 |
| Donations per Year | 4 |
| Revenue per Donor (5% fee) | €5/year |
| LTV (3-year retention) | €15 |
| **LTV:CAC Ratio** | **3:1** |

### Per-Shelter Economics

| Metric | Free | Pro |
|--------|------|-----|
| CAC | €50 | €200 |
| Monthly Revenue | €0 | €49 |
| Annual Revenue | €0 | €588 |
| Churn Rate | N/A | 5%/mo |
| LTV | €0 | €980 |
| **LTV:CAC** | N/A | **4.9:1** |

---

## Path to Profitability

| Milestone | When | Monthly Burn | Monthly Revenue |
|-----------|------|--------------|-----------------|
| Launch | Month 1 | €10,000 | €0 |
| First Revenue | Month 3 | €10,000 | €500 |
| Product-Market Fit | Month 12 | €15,000 | €3,000 |
| Break-even | Month 24 | €20,000 | €20,000 |
| Profitable | Month 30 | €25,000 | €40,000 |

---

## Future Monetization Opportunities

| Opportunity | Timeline | Potential |
|-------------|----------|-----------|
| **Pet Insurance Referrals** | Year 2 | €50-100 per lead |
| **Vet Appointment Booking** | Year 2 | Booking fees |
| **Pet Supplies Marketplace** | Year 3 | Commission on sales |
| **Data & Insights** | Year 3 | Anonymized market data |
| **White-Label Platform** | Year 4 | License to other verticals |

---

*Next: [06-Roadmap](./06-Roadmap.md)*
