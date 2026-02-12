# ExecPlan — <Short, action-oriented description>

> **Owner:** <name/role>  
> **Status:** draft  
> **Last updated:** 2026-02-12  

This ExecPlan is a living document. Keep these sections up to date as work proceeds:
`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

This plan must follow: `docs/exec-plans/PLANS.md`.

---

## Purpose / Big Picture

Explain what someone gains after this change and how they can see it working.

---

## Progress

Use checkboxes and timestamps. Every stopping point must be captured here.

- [ ] (YYYY-MM-DD HH:MMZ) Step 1…
- [ ] (YYYY-MM-DD HH:MMZ) Step 2…

---

## Surprises & Discoveries

Document unexpected behaviors, bugs, constraints, or insights (with evidence).

- Observation:
  Evidence:

---

## Decision Log

Record decisions made while executing the plan.

- Decision:
  Rationale:
  Date/Author:

---

## Outcomes & Retrospective

Summarize what shipped, what didn’t, and what we learned (compare to the Purpose).

---

## Context and Orientation

Describe the current state relevant to this work as if the reader knows nothing.
- Name key files by full repo-relative path.
- Define any non-obvious terms you use.
- Do not reference prior chats or “as discussed”.

---

## Plan of Work

Describe, in prose, the sequence of edits and additions.
For each edit:
- File path
- Location (function/component/module)
- What to change/add/remove
- Why it matters

---

## Interfaces and Dependencies

Be prescriptive:
- Which modules/APIs change?
- New types/interfaces (name them exactly)
- Compatibility notes (who calls what; what breaks if not updated)

---

## Concrete Steps

State the exact commands to run and where to run them (cwd).
Include short expected outputs when that helps validate progress.

Default commands to include unless explicitly not relevant:

- `pnpm -s lint`
- `pnpm -s typecheck`
- `pnpm -s test`
- `pnpm -s build`
- `pnpm -s docs:check` (when docs are touched)

If Convex contracts change:
- Run `npx convex dev` locally to regenerate types
- `pnpm -s convex:typecheck`

---

## Validation and Acceptance

Phrase acceptance as observable behavior:
- What to do (inputs)
- What to observe (outputs)

If tests are involved:
- Say which test(s) fail before and pass after.
- Include the exact command(s) to run.

---

## Idempotence and Recovery

- Which steps are safe to repeat?
- If something fails halfway, what’s the safe retry?
- If rollback is needed, how do we revert safely?

---

## Artifacts and Notes

Include the minimum proof artifacts:
- Short command transcripts
- Links to PRs/issues (if any)
- Small diffs/snippets (avoid big paste blobs)

---

## Security / Privacy / Trust Notes

Always present. If not applicable, write “N/A (reason)”.

Cover:
- authn/authz changes
- PII exposure risks
- money/webhook risks
- abuse cases + mitigations

