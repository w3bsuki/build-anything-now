# Claim Verification Operations

> **Owner:** Trust & Safety Ops
> **Status:** final
> **Last updated:** 2026-02-12

> **Non-SSOT:** This document is ideation/reference context and does not override root canonical docs.

---

## Objective

Ensure organization claim approvals are fast, fair, and auditable.

## Claim Lifecycle

- `pending` → `approved`
- `pending` → `rejected`

## SLA Targets

| Metric | Target |
|--------|--------|
| First response | 24h |
| Resolution target | 72h |
| Priority fast-track (critical clinic cases) | 12h |

## Approval Criteria

- Claimant has verifiable relationship to organization.
- Contact details match public or direct-confirmed records.
- No conflicting active owner claim.

## Rejection Criteria

- Insufficient proof of affiliation.
- Fraud indicators or contradictory ownership claims.
- Non-responsive claimant after follow-up window.

## Audit Logging

For each decision, store:
- Reviewer user ID
- Timestamp
- Action (`approved` / `rejected`)
- Reason code and notes



