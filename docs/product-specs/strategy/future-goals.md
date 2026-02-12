# Pawtreon — Future Goals

> **Owner:** Product (Human) + OPUS  
> **Status:** review  
> **Last updated:** 2026-02-12

## Purpose

Define forward-looking product direction beyond current sprint execution.  
Execution status remains in `TASKS.md` and shipped-state remains in `PRD.md`.

---

## Strategic Sequencing

Default sequencing (can be adjusted by validated learning):
1. Trust and money reliability
2. Local coordination and partner operations
3. Mission initiatives as differentiated growth surfaces
4. Retention/distribution loops
5. AI acceleration under strict safety constraints

---

## Horizon 1 (0-3 Months)

Primary goals:
- Mature notification delivery channels (in-app + push + email) with batching/throttling controls.
- Improve donor retention loops (followed feed depth, update relevance, repeat-support cues).
- Strengthen analytics for operator decision speed and trust-health monitoring.

Expected outcomes:
- Faster response to urgent cases.
- Better retention for repeat donors and active rescuers.
- Lower moderation blind spots.

---

## Horizon 2 (3-9 Months)

Primary goals:
- Expand volunteer coordination from matching to operational workflows (acceptance, handoff, closure history).
- Expand partner operations tooling for clinics/organizations with stronger SLA and verification workflows.
- Improve social consolidation (external-source attribution depth, share/SEO surfaces, trustworthy discovery ranking).

Expected outcomes:
- Higher real-world coordination throughput.
- Lower ops burden for partner verification and dispute handling.
- Stronger discovery-to-donation conversion.

---

## Horizon 3 (9-18 Months)

Primary goals:
- Launch mission initiatives as durable platform programs (safehouse, marketplace, insurance, and later drone operations).
- Add AI-assisted workflows for case creation, abuse triage, and operator tooling with explicit human-in-the-loop control.
- Expand beyond Bulgaria after trust, operations, and compliance readiness gates are met.

Expected outcomes:
- Differentiated platform narrative beyond one-off fundraising.
- Higher platform leverage per operator.
- Controlled expansion with preserved trust quality.

---

## Scope Guardrails

Must remain true:
- No erosion of trust-first controls for speed/growth.
- No PII exposure in public surfaces.
- No AI auto-publish or autonomous medical guidance.
- No platform pivot into generic crowdfunding.

---

## Dependencies

- Stable money/auth/webhook operations.
- Partner network quality in launch cities.
- Moderation capability and abuse-response SLAs.
- Analytics instrumentation quality and data correctness.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Growth outpaces trust controls | Donor trust regression | Keep trust gates as prerequisite for growth launches |
| Ops tooling lags partner volume | Queue backlog and lower quality | Prioritize admin/operator ergonomics and SLA instrumentation |
| AI scope creep into unsafe surfaces | Safety and liability risk | Keep hard constraints from `RULES.md`; human approval for high-risk actions |
| Expansion before launch-market maturity | Quality dilution | Define hard expansion gates tied to metrics, not timeline |

---

## Related Docs

- Canonical shipped state: `PRD.md`
- Current execution: `TASKS.md`
- Architecture constraints: `DESIGN.md`
- Trust and safety rules: `RULES.md`
- Product thesis: `docs/product-specs/strategy/master-plan.md`
