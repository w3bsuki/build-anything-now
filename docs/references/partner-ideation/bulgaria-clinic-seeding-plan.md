# Bulgaria Clinic Seeding Plan

> **Owner:** Partnerships + Data Ops
> **Status:** final
> **Last updated:** 2026-02-12

> **Non-SSOT:** This document is ideation/reference context and does not override root canonical docs.

---

## Rollout Scope

Initial launch cities:
- Sofia
- Varna
- Plovdiv

## Data Schema Requirements

Each clinic record should include:
- Name
- City
- Address
- Phone
- 24/7 flag
- Specializations
- Verification source
- Seeded-by timestamp

## Data Sourcing Strategy

1. Publicly listed veterinary registries and official clinic directories.
2. Direct outreach verification by phone/email.
3. Community correction channel with moderation review.

## Seeding Workflow

1. Prepare normalized import spreadsheet.
2. Run import script into `clinics`.
3. Mark records as `verified=true` only after source validation.
4. Open claim flow for ownership transfer.

## Quality Controls

- Duplicate detection by normalized name + city + phone.
- Manual QA spot checks per city.
- SLA for reported data errors: 72h.

## Exit Criteria (Phase 3)

- Minimum 20 clinics per launch city seeded and verified.
- Claim flow tested end-to-end with at least 3 real claims.
- Error correction SLA met for all reported data issues.



