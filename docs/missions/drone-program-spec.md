# Drone Support Program Spec

> **Owner:** Founders + Partnerships
> **Status:** draft
> **Last updated:** 2026-02-08

---

## Purpose

Faster detection of injured or lost animals in hard-to-access areas — forests, industrial zones, construction sites, and harsh-weather environments. When ground-level search fails or is too slow, aerial drone scouting with camera and thermal imaging gives rescuers a decisive speed advantage.

The drone program is Pawtreon's first moonshot initiative: a long-term, milestone-funded platform mission that demonstrates the platform is more than an app. It transforms donor contributions into tangible field operations and builds a narrative of real-world impact.

**Classification:** This is a **roadmap funding track**, not MVP feature scope (Decision 2026-02-06). It ships as a fundraising initiative first, with operational infrastructure developed progressively as milestones are hit and sponsors onboarded.

---

## User Stories

- As a **donor**, I want to contribute to the drone program campaign so I can fund technology that finds injured animals faster.
- As a **donor**, I want to watch a livestream of a drone scouting flight so I can see my money making a real difference.
- As a **rescuer**, I want to receive a drone scouting report with GPS coordinates and photos so I can locate and reach an injured animal quickly.
- As an **admin**, I want to create and manage drone initiative campaigns with milestone tracking and spend transparency so donors trust the program.
- As a **drone operator**, I want to log flight data (area covered, animals found, footage captured) so the program has auditable impact metrics.
- As a **first-time visitor**, I want to see the drone program featured on the home feed so I understand Pawtreon's mission goes beyond individual cases.

---

## Functional Requirements

### Operations

1. **Scouting flights** — Camera-equipped drones survey target areas to locate injured, lost, or stranded animals. Flights are planned around known stray population zones, reported sighting areas, and seasonal risk zones.
2. **Thermal imaging** — Winter rescue operations use thermal cameras to detect animals in hiding (under cars, in rubble, in snow cover). Thermal signatures distinguish live animals from debris.
3. **Feeding flights** — Deliver food/water to stray animals in remote or inaccessible areas where ground volunteers cannot safely reach (e.g., industrial ruins, steep terrain, flooded areas).
4. **Livestream** — Real-time video feed from drone flights, available to donors and community members. Livestream creates engagement, accountability, and a powerful fundraising narrative.
5. **Flight logging** — Every flight is recorded: date, time, area coordinates, operator, duration, footage captured, animals detected, outcomes (case created, animal rescued, no findings).
6. **Case creation from scouting** — When a drone detects an injured or stranded animal, the operator can initiate a new rescue case directly from the scouting data: GPS coordinates, aerial photos/video become case evidence.

### Operator Requirements

7. **Certified pilots** — All drone operators must hold valid drone pilot certification per Bulgarian/EU drone regulations (EU 2019/947, Open Category A1/A3 or Specific Category).
8. **Training program** — Operators complete a Pawtreon-specific training covering: animal detection protocols, emergency procedures, data handling, livestock/wildlife differentiation, no-fly zone awareness.
9. **Emergency protocols** — Defined procedures for: drone malfunction, animal in immediate danger during flight, bystander interference, equipment loss or crash, battery emergency.
10. **Legal compliance** — Full compliance with Bulgarian Civil Aviation Authority regulations, EU drone regulations, local municipal airspace restrictions, privacy laws (avoid filming private property/persons).

### Platform Integration

11. **Drone footage as case evidence** — Aerial photos and video clips from scouting flights can be attached to rescue cases as evidence, tagged with `evidence_type: "drone_footage"` and GPS metadata.
12. **Campaign-based fundraising** — Drone operations are funded through initiative campaigns (`initiativeCategory: "drone"`). Campaign progress tracks funding vs. operational milestones.
13. **Donation flow** — Standard Stripe checkout flow via `donations-spec.md`. Donations linked to drone campaign via `campaignRefId`.
14. **Impact metrics dashboard** — Track and display: total flights, total area covered, animals found per flight, cases created from drone data, total funding received vs. spent.

### Transparency Requirements

15. **Operational costs published** — Equipment costs, per-flight operational costs, maintenance, insurance — all published to campaign description/milestones.
16. **Flight logs accessible** — Summary flight logs (date, area, findings, duration) visible to donors on campaign detail page. No sensitive coordinates for animal nesting sites.
17. **Spend/use-of-funds summary** — How donations are allocated: equipment purchase (x%), operational costs (y%), maintenance (z%), insurance, training.
18. **Milestone status tracking** — Each milestone shows: description, target date, actual completion, evidence (photos, reports), funding allocated.

---

## Non-Functional Requirements

- **Legal:** Full compliance with EU 2019/947 drone regulation. Open Category operations only (unless Specific Category authorization obtained). No flights over assemblies of people. Maintain visual line of sight (VLOS) unless authorized for BVLOS.
- **Safety:** Emergency landing procedures, geofencing for no-fly zones, battery level monitoring, weather minimum thresholds (no flights in >25 km/h winds, heavy rain, or fog).
- **Privacy:** Drone cameras must not intentionally capture identifiable persons or private property. Footage reviewed and redacted before public sharing. GPS coordinates of sensitive locations (animal nesting sites, endangered species) are redacted from public logs.
- **Insurance:** Liability insurance covering equipment damage, third-party property damage, and personal injury from drone operations.
- **Performance:** Livestream latency < 5 seconds. Flight log data synced within 1 hour of flight completion.

---

## Data Model

### Existing Schema Support

The campaigns table already supports drone initiatives:

```typescript
// convex/schema.ts — campaigns table (L450-L469)
campaignType: "initiative",
initiativeCategory: "drone",   // ← already in schema
featuredInitiative: true/false, // ← featured placement flag
goal: number,                   // funding target
current: number,                // current progress
unit: "EUR",                    // monetary unit
status: "active" | "completed" | "cancelled"
```

**Indexes:** `by_campaign_type`, `by_featured_initiative`, `by_status`

### Future Schema Additions (Post-Pilot)

When drone operations go live, these new tables would be needed:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `droneFlights` | Flight log records | `operatorId`, `campaignId`, `area` (name + coordinates), `startTime`, `endTime`, `duration`, `status` (planned/in-progress/completed/aborted), `animalsDetected`, `casesCreated[]`, `footageStorageIds[]`, `notes` |
| `dronePilots` | Certified operator registry | `userId`, `certificationNumber`, `certExpiry`, `trainingCompletedAt`, `status` (active/suspended/retired), `flightCount`, `animalsFound` |
| `droneEquipment` | Equipment inventory | `name`, `model`, `type` (camera/thermal/multirotor), `status` (operational/maintenance/retired), `purchaseCost`, `purchaseDate`, `lastMaintenanceDate` |

**Note:** These tables are specced for future reference. No schema changes are needed until the pilot program launches operations.

---

## API Surface

### Existing Functions (via campaigns.ts)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `campaigns.list` | query | no | Filter by `campaignType: "initiative"` |
| `campaigns.get` | query | no | Single campaign by ID |
| `campaigns.getFeaturedInitiatives` | query | no | Active initiatives, featured first, with progress % |

### Required Functions (shared with campaigns-spec.md)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `campaigns.create` | mutation | admin | Create drone initiative campaign |
| `campaigns.update` | mutation | admin | Update campaign details/milestones |
| `campaigns.updateProgress` | internalMutation | internal | Increment `current` on donation webhook |
| `campaigns.close` | mutation | admin | Complete or cancel campaign |

### Future Functions (Post-Pilot)

| Function | Type | Auth | Purpose |
|----------|------|------|---------|
| `droneFlights.log` | mutation | operator | Record a completed flight |
| `droneFlights.list` | query | no | Public flight log summaries (redacted) |
| `droneFlights.getByFlight` | query | operator/admin | Full flight details |
| `dronePilots.register` | mutation | admin | Register certified operator |
| `droneFlights.createCaseFromScouting` | mutation | operator | Create rescue case from drone findings |

---

## UI Surfaces

### Existing (Campaign Infrastructure)

| Surface | Route | Behavior |
|---------|-------|----------|
| **Home feed initiative module** | `/` | Featured drone campaign card below rescue cases (max 3 initiatives total). Shows: image, title, progress bar, unit. Source: `home.getLandingFeed` → `campaigns.getFeaturedInitiatives`. |
| **Campaigns listing** | `/campaigns` | Filter pill "Initiatives" shows all initiative campaigns including drone. `CampaignCard` with progress bar. |
| **Campaign detail** | `/campaign/:id` | Full drone campaign info: description (with milestones), progress, donate CTA, share. Badge: "Pawtreon Initiative". |
| **Account hub** | `/account` | Initiative section with featured campaigns. |

### Future (Post-Pilot Operations)

| Surface | Route | Purpose |
|---------|-------|---------|
| **Drone dashboard** | `/admin/drone-ops` | Flight scheduling, live map, operator management, equipment status |
| **Flight log viewer** | `/campaign/:id/flights` | Public summary of completed flights: date, area name, findings, duration |
| **Livestream viewer** | `/live/:flightId` | Real-time drone camera feed with chat/reactions |
| **Drone footage gallery** | on case detail | Aerial photos/video attached to cases as drone evidence |

---

## Pilot Program Phases

### Phase 1: Feasibility Study
- **Objective:** Validate technical, legal, and financial viability
- **Activities:** Bulgarian drone regulation research, equipment cost analysis, operational cost modeling, insurance options, pilot area identification (Sofia suburban/industrial zones)
- **Deliverable:** Feasibility report with go/no-go recommendation
- **Funding:** Covered by platform operations budget (no campaign needed)
- **Duration:** 4–6 weeks

### Phase 2: Sponsor Partnerships
- **Objective:** Secure funding and equipment partnerships
- **Activities:** Outreach to drone equipment manufacturers, corporate sponsors, animal welfare NGOs; launch first drone initiative campaign on platform
- **Deliverable:** Signed sponsor commitments, funded campaign reaching 50% of Phase 3 equipment budget
- **Funding:** Initiative campaign (`initiativeCategory: "drone"`)
- **Duration:** 8–12 weeks

### Phase 3: Pilot Deployment
- **Objective:** Conduct first operational flights and validate impact
- **Activities:** Equipment procurement, operator recruitment + training, pilot area mapping (3 zones in Sofia region), 10 test flights with documentation
- **Deliverable:** Pilot results report: flights conducted, animals found, cases created, costs per flight, safety incidents
- **Transparency:** Flight logs, spending breakdown, impact photos published to campaign page
- **Duration:** 8–12 weeks

### Phase 4: Safety Review & Scaling
- **Objective:** Validate safety record and plan scaling to additional cities
- **Activities:** Safety audit of pilot operations, regulatory compliance review, scaling cost model (Varna, Plovdiv), operational playbook documentation
- **Deliverable:** Go/no-go for scaled operations, updated campaign with Phase 5 milestones
- **Duration:** 4–6 weeks

### Phase 5: Scaled Operations
- **Objective:** Routine drone scouting as a platform service
- **Activities:** Multi-city operations, regular flight schedules, livestream infrastructure, automated flight logging, integration with case creation pipeline
- **Deliverable:** Operational drone program serving 3+ cities
- **Duration:** Ongoing

---

## Cost Model (Estimates)

| Category | Estimated Cost | Notes |
|----------|---------------|-------|
| Drone equipment (per unit) | €2,000–€5,000 | DJI Mavic 3 or similar with thermal camera |
| Thermal camera module | €1,000–€3,000 | FLIR or DJI thermal add-on |
| Operator training (per pilot) | €500–€1,000 | EU drone certification + Pawtreon-specific training |
| Insurance (annual, per drone) | €300–€800 | Third-party liability + equipment |
| Per-flight operational cost | €50–€150 | Battery, travel, operator time, data processing |
| Livestream infrastructure | €100–€300/month | Video streaming service, CDN |
| Maintenance (annual, per drone) | €200–€500 | Propellers, batteries, calibration |

**Pilot budget (Phase 3):** ~€8,000–€15,000 (2 drones, 2 operators, 10 flights, insurance)

---

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Drone crashes during flight | Emergency protocol: secure area, report incident, equipment insurance claim, incident report published to flight log |
| No-fly zone violation | Geofencing enforcement on drone firmware. Operator responsible for manual airspace verification. Violation → operator suspension + regulatory report |
| False animal detection | Operator verifies before creating case. Thermal false positives (warm objects) documented in training materials. Case created only on visual confirmation |
| Misuse of livestream (privacy violation) | Footage reviewed before public sharing. Real-time moderation of chat. Automatic blur/redaction of persons if detected. Kill switch for livestream |
| Equipment theft or loss | GPS tracking on equipment. Insurance coverage. Equipment serial numbers registered |
| Weather-related flight failure | Weather minimum thresholds enforced. Flight cancelled/aborted if conditions deteriorate. No penalty for weather cancellations |
| Donor expects immediate results | Campaign description clearly communicates milestone timeline. Progress updates at minimum monthly cadence |
| Scouted animal is wildlife (not stray) | Training covers wildlife vs domestic animal identification. Wildlife sightings reported to appropriate authorities, not created as Pawtreon cases |

---

## Open Questions

1. **Bulgarian drone regulations specifics** — What exact license category is needed for animal rescue scouting flights? Is BVLOS authorization feasible for search-area coverage? Any municipal airspace restrictions in Sofia suburbs?

2. **Insurance and liability framework** — What does drone operator liability insurance cost in Bulgaria? Is there specific animal rescue operation coverage? Who is liable if a drone injures a person or damages property?

3. **Equipment sponsorship model** — Do drone manufacturers (DJI, Autel) have NGO/charity partnership programs? Can equipment be sponsored rather than purchased?

4. **Livestream technical architecture** — WebRTC vs HLS for low-latency video? How does mobile phone livestream from drone controller work? What CDN costs for a few hundred concurrent viewers?

5. **Flight approval workflow** — Who authorizes individual flights? Is it operator-autonomous within approved zones, or does admin need to approve each flight?

6. **Data retention** — How long is raw drone footage stored? GDPR implications for aerial footage containing incidental personal data?

7. **Scaling economics** — At what point do operational costs per animal found make the program cost-effective vs. ground scouting? What's the break-even target?

8. **Integration with emergency services** — Can drone footage/coordinates be shared with municipal animal control or veterinary emergency services? Any data-sharing agreements needed?
