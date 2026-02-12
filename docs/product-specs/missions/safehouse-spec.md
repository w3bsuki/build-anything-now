# Safehouse & Adoption Center Spec

> **Owner:** Founders + Partnerships
> **Status:** draft
> **Last updated:** 2026-02-08

---

## Purpose

Close the rescue loop. After clinic care, animals need a safe temporary place to recover, socialize, and be showcased for adoption. Today, there is a gap between "case closed — animal treated" and "animal adopted" — many animals end up back on the street because there is no structured post-treatment housing.

The safehouse program creates a physical facility (or network of partner facilities) that bridges this gap: animals leaving vet clinics are transferred to a safehouse for temporary housing, basic care, socialization, and active adoption promotion through the platform.

**Classification:** This is a **roadmap funding track**, not MVP feature scope (Decision 2026-02-06). It ships as a fundraising initiative first, with facility operations developed progressively as milestones are hit, sponsors committed, and governance established.

---

## User Stories

- As a **rescuer**, I want to transfer a treated animal to a safehouse so it has a safe place to recover and find a home instead of returning to the street.
- As a **donor**, I want to fund the safehouse campaign and see transparent milestones (facility secured, first intake, animals adopted) so I trust my money is creating real outcomes.
- As an **adopter**, I want to browse animals currently in the safehouse so I can visit and adopt one.
- As a **safehouse staff member**, I want to manage intake, track capacity, update animal profiles, and mark animals as adopted so operations run smoothly.
- As an **admin**, I want to create and manage safehouse initiative campaigns with milestone tracking and spend transparency.
- As a **clinic partner**, I want to refer post-treatment animals to the safehouse with medical records so continuity of care is maintained.
- As a **volunteer**, I want to sign up for safehouse shifts (feeding, walking, socialization) so I can help directly.

---

## Functional Requirements

### Facility Model

1. **Temporary housing** — Individual kennels/enclosures for dogs, cat rooms/condos, isolation area for new intakes and sick animals. Capacity planned per facility (e.g., 20 dogs + 15 cats for pilot).
2. **Basic care** — Daily feeding schedule, clean water, hygiene maintenance (cage cleaning 2x/day), basic grooming, outdoor exercise (dogs).
3. **Socialization** — Structured interaction time: staff/volunteer handling, play sessions, leash training for dogs, human socialization for cats. Goal: make animals adoption-ready.
4. **Adoption showcasing** — Each safehouse animal has a platform profile (adoption listing) with professional photos, personality description, health status, and safehouse attribution. Profiles are actively promoted on the platform.
5. **Intake workflow** — Animals enter safehouse from: (a) closed rescue cases (`lifecycleStage: "closed_success"` or `"closed_transferred"`), (b) clinic referrals post-treatment, (c) direct intake from field rescuers. Each intake records: source (case ID, clinic ID, or rescuer), animal details, medical records, behavioral notes.
6. **Capacity tracking** — Real-time occupancy: current residents by species, available spaces, waitlist if at capacity.
7. **Adoption handoff** — When an animal is adopted, update adoption listing status to `adopted`, record adopter info (consent-based), provide medical records and care instructions to adopter.

### Governance & Welfare

8. **Welfare standards** — Minimum space per animal (dogs: 4m² per kennel, cats: 1.5m² per condo), temperature control (15–25°C), daily veterinary check-in access, enrichment requirements (toys, scratching posts, outdoor access).
9. **Staffing model** — Minimum 2 paid staff on-site during operational hours. Volunteer shifts supplement for feeding, walking, socialization. Night security/monitoring.
10. **Veterinary oversight** — Partnership with one or more clinics for: intake health screening, ongoing medical needs, emergency care, pre-adoption health certificate. At least weekly vet visit for routine checks.
11. **Record keeping** — Per-animal intake log, daily care log, medical log, behavioral assessment log, adoption record. All records accessible via platform to authorized staff.

### Platform Integration

12. **Adoption listings** — Each safehouse animal has an adoption listing (see `adoption-spec.md`) with `source: "safehouse"` attribution. Listings auto-created on intake or manually created by staff.
13. **Case lifecycle link** — When a rescue case resolves with safehouse transfer, the case's `outcomeDetails` references the safehouse. The adoption listing optionally links back to the rescue case via `caseId` (see `adoption-spec.md` Open Question #1).
14. **Campaign-based fundraising** — Safehouse operations funded through initiative campaigns (`initiativeCategory: "safehouse"`). Campaign progress tracks milestones: facility secured, first intake, capacity targets, adoption counts.
15. **Donation flow** — Standard Stripe checkout via `donations-spec.md`. Donations linked to safehouse campaign via `campaignRefId`.
16. **Volunteer coordination** — Safehouse-specific volunteer shifts surfaced via volunteer directory/matching (see `volunteers-spec.md`). Shift types: feeding, walking, cleaning, socialization, adoption events.
17. **Impact metrics** — Track and display: total animals housed, average stay duration, adoption rate, current occupancy, total funding received vs. spent.

### Transparency Requirements

18. **Funding goal and progress** — Campaign progress bar with current vs. goal.
19. **Milestone status** — Facility model completed, pilot site secured, first intake, capacity milestones (25%, 50%, 75%, 100%), adoption milestones.
20. **Spend/use-of-funds summary** — Allocation breakdown: facility lease/build (x%), staff salaries (y%), animal care supplies (z%), veterinary costs, insurance, utilities.
21. **Risks and next checkpoint** — Honestly communicated: facility search difficulties, permitting delays, operational challenges.

---

## Non-Functional Requirements

- **Welfare compliance:** Facility must meet Bulgarian animal welfare regulations. Regular inspections. Zero-tolerance for abuse/neglect.
- **Accessibility:** Facility open for pre-arranged adoption visits during operating hours. Platform profiles accessible to all users (no auth required for browsing).
- **Privacy:** Adopter personal data (address, phone) stored securely, not exposed in public adoption records. Staff contact info via platform messaging only.
- **i18n:** All safehouse-related platform content (listings, campaign updates, status labels) uses i18n keys. Background: BG primary language for pilot.
- **Performance:** Capacity tracking updates reflected on platform within 5 minutes of staff action.

---

## Data Model

### Existing Schema Support

The campaigns table already supports safehouse initiatives:

```typescript
// convex/schema.ts — campaigns table (L450-L469)
campaignType: "initiative",
initiativeCategory: "safehouse",  // ← already in schema
featuredInitiative: true/false,
goal: number,
current: number,
unit: "EUR" | "homes",  // can track monetary or capacity unit
status: "active" | "completed" | "cancelled"
```

### Related Tables

| Table | Relationship | Notes |
|-------|-------------|-------|
| `adoptions` | Downstream — safehouse animals get adoption listings | Could add `source: "safehouse"` field or `safehouceId` reference |
| `cases` | Upstream — closed cases feed intake | `lifecycleStage: "closed_success"` or `"closed_transferred"` triggers intake offer |
| `clinics` | Upstream — clinic referrals | Clinic can refer post-treatment animals |
| `petServices` | Directory — `type: "shelter"` | Safehouse could be registered as a petService for directory visibility |
| `volunteers` | Operations — shift coordination | Volunteer capabilities include fostering, transport, events |

### Future Schema Additions (Post-Pilot)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `safehouses` | Facility registry | `name`, `location` (city + address), `capacity` (dogs, cats), `currentOccupancy`, `status` (planning/operational/paused/closed), `staffCount`, `partnerClinicIds[]`, `operatingHours`, `contactInfo` |
| `safehouseAnimals` | Per-animal stay record | `safehouseId`, `animalType`, `name`, `intakeDate`, `intakeSource` (caseId/clinicId/direct), `medicalRecords[]`, `behavioralNotes`, `adoptionListingId`, `status` (intake/resident/adoption-pending/adopted/transferred), `dischargeDate`, `dischargeReason` |
| `safehouseShifts` | Volunteer shift schedule | `safehouseId`, `volunteerId`, `date`, `shiftType` (feeding/walking/cleaning/socialization/event), `startTime`, `endTime`, `status` (scheduled/completed/cancelled) |

**Note:** These tables are specced for future reference. No schema changes needed until the pilot site is operational.

---

## API Surface

### Existing Functions (via campaigns.ts)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `campaigns.list` | query | no | Filter by `campaignType: "initiative"` |
| `campaigns.get` | query | no | Single campaign by ID |
| `campaigns.getFeaturedInitiatives` | query | no | Active initiatives, featured first |

### Required Functions (shared with campaigns-spec.md)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `campaigns.create` | mutation | admin | Create safehouse initiative campaign |
| `campaigns.update` | mutation | admin | Update campaign details/milestones |
| `campaigns.updateProgress` | internalMutation | internal | Increment `current` on donation webhook |
| `campaigns.close` | mutation | admin | Complete or cancel campaign |

### Future Functions (Post-Pilot)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `safehouses.get` | query | no | Safehouse facility details + current occupancy |
| `safehouseAnimals.list` | query | no | Animals currently in safehouse (public browsing) |
| `safehouseAnimals.intake` | mutation | staff | Record new animal intake |
| `safehouseAnimals.updateStatus` | mutation | staff | Update animal status (resident → adoption-pending → adopted) |
| `safehouseAnimals.discharge` | mutation | staff | Record discharge (adopted, transferred, other) |
| `safehouseShifts.list` | query | volunteer | Available shifts for sign-up |
| `safehouseShifts.signup` | mutation | volunteer | Volunteer claims a shift |

---

## UI Surfaces

### Existing (Campaign Infrastructure)

| Surface | Route | Behavior |
|---------|-------|----------|
| **Home feed initiative module** | `/` | Featured safehouse campaign card below rescue cases. Shows: image, title, progress bar, unit. |
| **Campaigns listing** | `/campaigns` | Filter pill "Initiatives" shows safehouse campaign alongside drone and other initiatives. |
| **Campaign detail** | `/campaign/:id` | Full safehouse campaign info: description with milestones, progress, donate CTA, share. Badge: "Pawtreon Initiative". |
| **Account hub** | `/account` | Initiative section with featured campaigns. |

### Future (Post-Pilot Operations)

| Surface | Route | Purpose |
|---------|-------|---------|
| **Safehouse profile page** | `/safehouse/:id` | Facility details, current residents gallery, capacity indicator, visit scheduling, volunteer shift sign-up |
| **Safehouse animal profiles** | via adoption listings | Individual animal cards with safehouse attribution, enriched with behavioral notes and stay history |
| **Staff dashboard** | `/admin/safehouse/:id` | Intake management, daily care logging, capacity overview, discharge workflow |
| **Volunteer shift board** | `/safehouse/:id/volunteer` | Available shifts, sign-up, shift history |

### Integration with Adoption Listings

- Each safehouse animal appears as an adoption listing (see `adoption-spec.md`)
- Adoption listings from safehouses display: "At [Safehouse Name] since [date]", safehouse badge, behavioral assessment summary
- Clicking "Visit" link (future) shows safehouse visiting hours and location

---

## Rescue Loop: End-to-End Flow

```
Street → Rescue Case Created
  ↓
Case funded via donations
  ↓
Animal taken to partner clinic (treatment)
  ↓
Case updated with medical evidence (clinic-verified)
  ↓
Treatment complete → Case closed (closed_success / closed_transferred)
  ↓
Safehouse intake offered (if capacity available)
  ↓
Animal transferred to safehouse
  ↓
Recovery, socialization, photo/profile creation
  ↓
Adoption listing published on platform
  ↓
Adopter discovers animal → visit → adoption
  ↓
Adoption complete → discharge from safehouse
```

This flow closes the gap that currently exists between case closure and adoption. Without the safehouse, many animals return to the street after treatment.

---

## Pilot Program Phases

### Phase 1: Facility Model & Cost Study
- **Objective:** Define facility requirements, identify candidate locations, model operating costs
- **Activities:** Space requirements analysis, location scouting (Sofia area), rental/lease cost estimates, renovation estimates, staffing cost model, supply chain (food, bedding, cleaning)
- **Deliverable:** Facility requirements document, 3 candidate location assessments, monthly operating cost model
- **Duration:** 6–8 weeks

### Phase 2: Sponsor & Partner Commitments
- **Objective:** Secure funding and operational partnerships
- **Activities:** Launch safehouse initiative campaign on platform, outreach to corporate sponsors, partnership agreements with 2+ clinics for intake/veterinary support, volunteer recruitment for pilot operations
- **Deliverable:** Signed sponsor commitments, clinic partnership agreements, funded campaign reaching 60% of Phase 3 setup budget
- **Duration:** 8–12 weeks

### Phase 3: Pilot Site Setup
- **Objective:** Build and launch pilot safehouse
- **Activities:** Lease signed, renovation/setup (kennels, cat rooms, isolation, storage, outdoor area), equipment procurement, staff hiring (2 FTE), health/safety inspection, volunteer training, opening ceremony
- **Deliverable:** Operational safehouse with capacity for 10 dogs + 8 cats
- **Duration:** 10–14 weeks

### Phase 4: Intake-to-Adoption Operational Launch
- **Objective:** Begin live operations and validate the rescue loop
- **Activities:** First intake from closed rescue cases and clinic referrals, daily operations, adoption listing creation, adoption events, metrics tracking
- **Deliverable:** First 3 months operational report: animals housed, average stay duration, adoption rate, costs per animal, volunteer satisfaction
- **Transparency:** Monthly spend reports, adoption success stories, capacity utilization published to campaign page
- **Duration:** 12 weeks (then ongoing)

---

## Cost Model (Pilot Estimates — Sofia)

| Category | Monthly Estimate | Notes |
|----------|-----------------|-------|
| Facility lease | €800–€1,500 | Suburban Sofia, 150–250m² with outdoor access |
| Renovation (one-time) | €3,000–€8,000 | Kennels, flooring, ventilation, cat condos, fencing |
| Staff (2 FTE) | €1,200–€2,000 | Bulgarian salary levels, animal care experience |
| Animal care supplies | €400–€800 | Food, bedding, cleaning, toys, litter |
| Veterinary costs | €300–€600 | Weekly check-ups, emergency care, medications |
| Insurance | €100–€200 | Premises liability, animal care liability |
| Utilities | €150–€300 | Electricity, water, heating, internet |
| **Monthly operating total** | **€2,950–€5,400** | |
| **Pilot setup (one-time)** | **€5,000–€12,000** | Renovation + equipment + first month supplies |

---

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Facility at capacity, new intake needed | Waitlist system. Priority: critical medical cases, young animals, animals from funded cases. Overflow: foster volunteer network as temporary housing |
| Animal with severe behavioral issues | Behavioral assessment on intake. If dangerous (aggression toward humans/animals), specialized handling required. Transfer to behavioral rehabilitation facility if beyond safehouse capability |
| Long-stay animals (no adoption interest) | After 90 days: featured promotion on platform, adoption events, social media campaigns. After 180 days: transfer to partner shelter network. No euthanasia policy |
| Failed adoption return | Animal re-enters safehouse. Adoption listing reopened with "returned" note and behavioral re-assessment. 2-week settling period before re-listing |
| Welfare complaint | Immediate investigation by admin + veterinary partner. If substantiated: corrective action, staff retraining, public transparency report. Severe: temporary closure for remediation |
| Donor expects instant facility | Campaign description clearly communicates milestone timeline (months, not weeks). Progress updates at minimum monthly cadence. No promises of specific opening dates until lease signed |
| Volunteer no-show for shift | Backup shift coverage protocol. Chronic no-shows → availability status changed. Core care always covered by paid staff (volunteers supplement, not replace) |
| Animal health crisis in safehouse | Immediate veterinary contact via partner clinic. Isolation of affected animal. If contagious: intake pause, facility sanitization, transparent reporting |

---

## Acceptance Criteria

- [ ] Mission campaign has explicit milestones and transparent use-of-funds narrative.
- [ ] Users can discover this initiative through campaign surfaces without breaking trust flows.
- [ ] Risks, dependencies, and operational constraints are documented and reviewable.
- [ ] Scope remains outside MVP unless explicitly promoted via DECISIONS.md + ExecPlan.

## Open Questions
1. **Owned vs. partner facility** — Does Pawtreon lease/operate its own safehouse, or partner with an existing shelter that operates under Pawtreon branding? Own facility = more control + branding, partner facility = lower cost + faster launch. Could start with partner and transition.

2. **Staffing model balance** — What ratio of paid staff to volunteers is sustainable? Can the safehouse operate with 1 FTE + volunteer network, or does animal welfare require minimum 2 FTE on-site?

3. **Intake criteria** — Which animals qualify for safehouse placement? Only from platform rescue cases? Also from clinic referrals without a case? Direct found-on-street intake? Priority scoring needed?

4. **Capacity limits and waitlist** — How is priority determined when facility is full? Medical urgency? Time waiting? Species balance? Should there be a hard cap or flexible overflow to foster network?

5. **Veterinary oversight contractual model** — Retainer agreement with partner clinic? Per-visit billing? On-site vet hours (expensive but higher care quality)?

6. **Adopter screening** — Any screening process for adopters? Home check? Reference check? Or trust-based with minimal friction? How does this interact with GDPR?

7. **Occupancy data in app** — How detailed should public-facing capacity data be? "X animals currently in safehouse" or full breakdown by species/availability? Real-time or daily snapshot?

8. **Multi-city scaling** — When pilot succeeds, is the model replicated (new facilities in Varna, Plovdiv) or franchised (partners operate under Pawtreon standards)?
