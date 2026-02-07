# Data Model Gap Audit

- Owner: Backend engineering
- Update cadence: Weekly during Phases 1-3
- Last updated: 2026-02-06

## Summary
Current schema has broad coverage (cases, donations, clinics, pet services, claims, campaigns, reports) but gaps remain in lifecycle richness, payment traceability, and moderation operations.

## Gap Table
| Domain | Current | Target | Gap |
|---|---|---|---|
| Case lifecycle | `status` + basic `updates[]` | explicit lifecycle stage + closure metadata | add stage/transition fields and close metadata |
| Case updates | `date/text/images` | typed update + evidence metadata + attribution | expand update object and API contract |
| Donations | pending/completed status and basic fields | Stripe idempotency + receipt metadata + webhook trace | add Stripe IDs, idempotency key, receipt fields |
| Moderation | report creation + pending status view | queue actions + audit log + report resolution reasons | add admin mutations + audit table |
| Campaigns | active/completed/cancelled | rescue vs initiative classification | add campaign type and initiative metadata |
| Partner claims | clinic/pet service claim basics | SLA-driven review operations + logging | add operational query/mutation/reporting views |

## Immediate Schema Priorities
1. Extend `cases` lifecycle and updates shape.
2. Extend `donations` payment traceability fields.
3. Add `auditLogs` table for high-risk actions.
4. Add campaign classification fields.

## Compatibility Strategy
- Keep fallback mapping for legacy case updates.
- Migrate incrementally in query mappers.
- Regenerate Convex bindings after schema changes.
