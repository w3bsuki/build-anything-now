# Feature: <Feature Name>

> **Spec ID:** `<feature-slug>`  
> **Status:** 🟡 Draft | 🔵 In Review | 🟢 Locked | ✅ Complete  
> **Risk level:** High (2-gate) | Medium (1-gate) | Low (no spec needed)  
> **Created:** YYYY-MM-DD  
> **Last updated:** YYYY-MM-DD  
> **PRD reference:** `PRD.md` section X  
> **Roadmap phase:** P0 / P1 / P2 / P3

---

## Summary

<1-2 sentences describing what this feature does and why it matters>

---

## User stories

### US-1: <Title>
**As a** [user role]  
**I want to** [action]  
**So that** [benefit]

#### Acceptance criteria (EARS notation)

| ID | Requirement |
|----|-------------|
| AC-1.1 | WHEN [condition] THE SYSTEM SHALL [behavior] |
| AC-1.2 | WHILE [state] THE SYSTEM SHALL [behavior] |
| AC-1.3 | IF [error condition] THEN THE SYSTEM SHALL [error handling] |
| AC-1.4 | IF [abuse case] THEN THE SYSTEM SHALL NOT [unwanted behavior] |

> ⚠️ **Guideline:** 3–7 ACs per story. At least one negative/error case required.

---

### US-2: <Title>
**As a** [user role]  
**I want to** [action]  
**So that** [benefit]

#### Acceptance criteria (EARS notation)

| ID | Requirement |
|----|-------------|
| AC-2.1 | WHEN [condition] THE SYSTEM SHALL [behavior] |
| AC-2.2 | IF [error] THEN THE SYSTEM SHALL [handling] |

---

## Out of scope

- <Thing we're explicitly NOT building in this spec>
- <Future enhancement that's deferred>

---

## Dependencies

- [ ] Requires: `<other-spec-or-feature>`
- [ ] Blocked by: `<external-dependency>`

---

## Assumptions / Risks / Mitigations

| # | Assumption or Risk | Impact | Mitigation |
|---|-------------------|--------|------------|
| 1 | <We assume X is true> | <What breaks if wrong> | <How we'll handle it> |
| 2 | <Risk: Y could happen> | <Severity> | <Mitigation plan> |

---

## Non-functional requirements

| Category | Requirement | Notes |
|----------|-------------|-------|
| **Accessibility** | <WCAG level / screen reader> | N/A if not applicable |
| **Performance** | <Load time / bundle impact> | |
| **i18n** | <Which strings need translation> | |
| **Analytics** | <Events to track> | |
| **Offline/mobile** | <Capacitor constraints> | |
| **Permissions** | <Who can do what> | Reference TRUST-SAFETY.md |

---

## Permissions matrix (if applicable)

| Action | Anon | Donor | Rescuer | Clinic | Admin |
|--------|------|-------|---------|--------|-------|
| View | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create | ✗ | ✗ | ✓ | ✓ | ✓ |
| Edit own | ✗ | ✗ | ✓ | ✓ | ✓ |
| Edit any | ✗ | ✗ | ✗ | ✗ | ✓ |
| Delete | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## Trust & safety considerations

> Reference: `TRUST-SAFETY.md`

- <How does this feature interact with trust/safety?>
- <What abuse vectors exist?>
- <What mitigations are required?>

---

## Open questions

- [ ] Q1: <Question that needs answering before design>
- [ ] Q2: <Another question>

---

## Codex review

### Review 1 — YYYY-MM-DD
<Paste Codex feedback here>

### OPUS response
<How requirements were updated based on feedback>

### Review 2 — YYYY-MM-DD (if needed)
<Additional feedback>

---

## Sign-off

- [ ] Requirements reviewed by Codex
- [ ] Open questions resolved
- [ ] Assumptions/risks documented
- [ ] Non-functional requirements addressed (or marked N/A)
- [ ] Ready for design phase
