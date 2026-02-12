# Financial Projections

> **Owner:** Founders  
> **Status:** review  
> **Last updated:** 2026-02-09  
> Revenue model finalized — see `docs/business/monetization-spec.md` for implementation details, Stripe fee handling, and open questions.

---

## Summary

| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|--------|--------|
| **Revenue** | €37K | €205K | €992K | €2.76M | €6.33M |
| **Expenses** | €150K | €400K | €800K | €1.5M | €3M |
| **Net Income** | -€113K | -€195K | €192K | €1.26M | €3.33M |
| **Users** | 5K | 25K | 100K | 300K | 750K |
| **Clinics/Shelters** | 50 | 200 | 500 | 1K | 2K |

---

## Revenue Breakdown

### Year 1

| Stream | Q1 | Q2 | Q3 | Q4 | Total |
|--------|-----|-----|-----|-----|-------|
| Transaction Fees | €0 | €5K | €8K | €12K | €25K |
| Subscriptions | €0 | €1K | €2K | €4K | €7K |
| Sponsorships | €0 | €0 | €2K | €3K | €5K |
| Corporate | €0 | €0 | €0 | €0 | €0 |
| **Total** | €0 | €6K | €12K | €19K | **€37K** |

### Year 2

| Stream | Q1 | Q2 | Q3 | Q4 | Total |
|--------|-----|-----|-----|-----|-------|
| Transaction Fees | €15K | €20K | €28K | €37K | €100K |
| Subscriptions | €6K | €9K | €13K | €17K | €45K |
| Sponsorships | €5K | €8K | €12K | €15K | €40K |
| Corporate | €0 | €5K | €7K | €8K | €20K |
| **Total** | €26K | €42K | €60K | €77K | **€205K** |

### Year 3–5

| Stream | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|
| Transaction Fees | €500K | €1.25M | €2.5M |
| Subscriptions | €192K | €510K | €1.08M |
| Sponsorships | €150K | €500K | €1.5M |
| Corporate | €150K | €500K | €1.25M |
| **Total** | **€992K** | **€2.76M** | **€6.33M** |

---

## Expense Breakdown

### Year 1 (€150K Total)

| Category | Amount | % | Notes |
|----------|--------|---|-------|
| **Personnel** | €80K | 53% | Founder salary + 1 contractor |
| **Infrastructure** | €15K | 10% | Hosting (Vercel + Convex), services, tools |
| **Marketing** | €30K | 20% | Bulgaria launch campaigns, ads |
| **Operations** | €15K | 10% | Legal, accounting, misc |
| **Contingency** | €10K | 7% | Buffer |

### Year 2 (€400K Total)

| Category | Amount | % | Notes |
|----------|--------|---|-------|
| **Personnel** | €250K | 63% | Team of 4–5 |
| **Infrastructure** | €30K | 8% | Scaled services |
| **Marketing** | €80K | 20% | Growth campaigns, EU expansion |
| **Operations** | €30K | 7% | Expanded ops |
| **Contingency** | €10K | 2% | Buffer |

### Year 3–5

| Category | Year 3 | Year 4 | Year 5 |
|----------|--------|--------|--------|
| Personnel | €500K | €900K | €1.8M |
| Infrastructure | €60K | €120K | €240K |
| Marketing | €160K | €320K | €640K |
| Operations | €60K | €120K | €240K |
| Contingency | €20K | €40K | €80K |
| **Total** | **€800K** | **€1.5M** | **€3M** |

---

## Profitability Timeline

```
Revenue vs Expenses (€K)

        Year 1    Year 2    Year 3    Year 4    Year 5
        ──────    ──────    ──────    ──────    ──────
€7M     │                                         ▓▓▓
€6M     │                                         ▓▓▓
€5M     │                                         ▓▓▓
€4M     │                                         ▓▓▓
€3M     │                             ▓▓▓         ███
€2M     │                             ▓▓▓    
€1M     │                   ▓▓▓       ███         
€500K   │         ▓▓▓       ███                   
€200K   │         ███                              
€0      │ ▓▓▓ ███                                  
        └──────────────────────────────────────────

        ▓▓▓ Revenue    ███ Expenses
```

| Milestone | Timeline |
|-----------|----------|
| First Revenue | Month 3 |
| €10K MRR | Month 18 |
| Break-even | Month 24 |
| Profitable | Month 30 |
| €1M ARR | Month 36 |

---

## Unit Economics

### Per-Donor Economics

| Metric | Year 1 | Year 3 | Year 5 |
|--------|--------|--------|--------|
| CAC | €10 | €5 | €3 |
| Avg Annual Donation | €50 | €75 | €100 |
| Fee Revenue | €2.50 | €3.75 | €5 |
| Retention Rate | 40% | 50% | 60% |
| LTV | €4 | €12 | €25 |
| **LTV:CAC** | **0.4:1** | **2.4:1** | **8.3:1** |

*Note: Year 1 LTV:CAC is negative during growth investment phase*

### Per-Shelter Economics

| Metric | Free Tier | Pro Tier |
|--------|-----------|----------|
| CAC | €100 | €300 |
| Monthly Revenue | €0 | €70 avg |
| Annual Revenue | €0 | €840 |
| Churn Rate | N/A | 5%/month |
| LTV | €0 | €1,400 |
| **LTV:CAC** | N/A | **4.7:1** |

---

## Cash Flow Projection

### Year 1 (Monthly)

| Month | Revenue | Expenses | Net | Cumulative |
|-------|---------|----------|-----|------------|
| 1 | €0 | €12K | -€12K | -€12K |
| 2 | €0 | €12K | -€12K | -€24K |
| 3 | €500 | €12K | -€11.5K | -€35.5K |
| 4 | €1K | €12K | -€11K | -€46.5K |
| 5 | €2K | €12K | -€10K | -€56.5K |
| 6 | €3K | €13K | -€10K | -€66.5K |
| 7 | €4K | €13K | -€9K | -€75.5K |
| 8 | €5K | €13K | -€8K | -€83.5K |
| 9 | €5K | €13K | -€8K | -€91.5K |
| 10 | €6K | €13K | -€7K | -€98.5K |
| 11 | €6K | €13K | -€7K | -€105.5K |
| 12 | €7K | €13K | -€6K | -€111.5K |

**Runway needed: ~€120K for Year 1**

---

## Funding Requirements

### Current Round: Seed

| Use of Funds | Amount | % |
|--------------|--------|---|
| Product Development | €75K | 50% |
| Marketing & Growth | €45K | 30% |
| Operations & Legal | €20K | 13% |
| Buffer | €10K | 7% |
| **Total Ask** | **€150K** | 100% |

### Runway
- **With €150K:** 18 months to profitability
- **Break-even:** Month 24
- **Next Round:** Series A at Month 18–24 (if scaling aggressively)

---

## Funding Milestones

| Milestone | Funding | Timeline | Goal |
|-----------|---------|----------|------|
| **Pre-Seed** | €50K | Now | MVP launch |
| **Seed** | €150K | Month 3–6 | Market validation, Bulgaria traction |
| **Series A** | €1–2M | Month 24 | European expansion |
| **Series B** | €5–10M | Month 48 | Global scale |

---

## Valuation Rationale

### Current Stage: Pre-Revenue, Product ~60% Built

| Method | Valuation |
|--------|-----------|
| Comparable seed rounds | €500K – €1M |
| Revenue multiple (projected Y2) | €1M – €2M |
| **Proposed Pre-Money** | **€750K** |

### Seed Round Terms (Example)

| Term | Value |
|------|-------|
| Pre-money valuation | €750K |
| Amount raised | €150K |
| Post-money valuation | €900K |
| Investor ownership | 16.7% |
| Instrument | SAFE / Convertible Note |

> **Note:** Valuation comparables are early-stage estimates. [FILL: Verify and update comparable companies with current data if available.]

---

## Sensitivity Analysis

### Best Case (2x Growth)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue | €60K | €400K | €2M |
| Users | 10K | 50K | 200K |
| Profitability | Month 18 | - | - |

### Base Case (Plan)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue | €37K | €205K | €992K |
| Users | 5K | 25K | 100K |
| Profitability | Month 24 | - | - |

### Worst Case (0.5x Growth)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue | €20K | €100K | €400K |
| Users | 2.5K | 12K | 50K |
| Profitability | Month 36 | - | - |

---

## Key Assumptions

| Assumption | Value | Rationale |
|------------|-------|-----------|
| Avg donation size | €50 | Industry benchmark |
| Transaction fee | 5% | Competitive rate (matches JustGiving) |
| Stripe processing fee | 2.9% + €0.25 | Standard Stripe rate, paid from 5% margin |
| Shelter conversion to paid | 20% | Conservative SaaS benchmark |
| Monthly churn (paid) | 5% | B2B SaaS average |
| CAC payback | 12 months | Target for sustainability |
| Viral coefficient | 0.3 | Conservative organic growth |

> **Implementation note:** The 5% platform fee is designed but not yet deducted in production. Currently, Stripe checkout and webhook handling are implemented and the full donation amount is credited to cases. Fee deduction will be activated before launch.

---

## Exit Scenarios

| Scenario | Timeline | Valuation | Multiple |
|----------|----------|-----------|----------|
| **Acqui-hire** | Year 2 | €2–5M | 2–5x |
| **Strategic Acquisition** | Year 4 | €20–50M | 3–5x revenue |
| **PE/Growth Equity** | Year 5 | €50–100M | 8–15x revenue |
| **IPO** | Year 7+ | €200M+ | 10–20x revenue |

**Most Likely Exit:** Strategic acquisition by pet industry player (Chewy, Fressnapf, pet insurance company) at Year 4–5.

---

*Next: [10-The-Ask](./10-The-Ask.md)*
