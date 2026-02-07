# Case Lifecycle Spec

- Owner: OPUS (implementation), Codex (risk review)
- Update cadence: Weekly until Phase 2 complete
- Last updated: 2026-02-06

## Lifecycle Model
### Case Rescue Urgency (`type`)
- `critical`
- `urgent`
- `recovering`
- `adopted` (legacy display category)

### Case Funding Status (`status`)
- `active`
- `funded`
- `closed`

### Case Lifecycle Stage (`lifecycleStage`)
- `active_treatment` (default)
- `seeking_adoption`
- `closed_success`
- `closed_transferred`
- `closed_other`

## Transition Rules
- `active_treatment` -> `seeking_adoption`
- `active_treatment` -> `closed_*`
- `seeking_adoption` -> `closed_success`
- `seeking_adoption` -> `closed_transferred`
- `seeking_adoption` -> `closed_other`
- Any closed stage is terminal.

## Update Object Shape
Each update supports structured trust evidence:
- `id`
- `date`
- `type`: `medical` | `milestone` | `update` | `success`
- `text`
- `images[]` (optional)
- `evidenceType`: `bill` | `lab_result` | `clinic_photo` | `other` (optional)
- `clinicId` (optional)
- `clinicName` (optional display snapshot)
- `authorRole`: `owner` | `clinic` | `moderator`

## Permissions
- Case owner can post updates and move stage.
- Clinic/admin can post clinic-verified updates where applicable.
- Non-owner users cannot mutate lifecycle or updates.

## Donation Guardrail
- Closed lifecycle stages and `status=closed` must block new donations.

## UI Requirements
- Case detail displays stage label + transition controls for authorized users.
- Add Update flow: modal/drawer with text, type, optional evidence attachments.
- Timeline displays type icon, date, author role, and evidence chips.

## Abuse Mitigations
- Max update text length.
- Max attachment count per update.
- Ownership checks on every mutation.
- Audit logs for lifecycle transitions.
