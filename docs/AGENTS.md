# Pawtreon Docs Agent Contract (`docs/`)

> **Owner:** OPUS + Human  
> **Status:** final  
> **Last updated:** 2026-02-10  
> **Scope:** Applies to all files under `docs/`.

---

## 1) Authority and Precedence

1. Root governance remains canonical in `AGENTS.md` (repo root).
2. This file adds docs-specific rules only for the `docs/` subtree.
3. If conflicts appear, use this precedence:
   - System/developer/user instructions
   - Repo root `AGENTS.md`
   - This `docs/AGENTS.md`
4. Keep this file focused on writing workflow, not product policy duplication.

---

## 2) Canonical vs Supporting Truth

Canonical root docs are the only control plane:
- `PRD.md`
- `TASKS.md`
- `DESIGN.md`
- `RULES.md`
- `DECISIONS.md`
- `AGENTS.md`
- `README.md`

Everything in `docs/` is supporting depth.  
Rule: never create a second source of truth in `docs/` that contradicts a canonical root doc.

Feature status ownership:
- Implementation state (`[x]`, `[~]`, `[ ]`) is canonical in `PRD.md`.
- `docs/features/INDEX.md` is a generated mirror for visibility, not an authoritative status source.
- Spec `Status` (`draft/review/final`) tracks document maturity only.

---

## 3) Docs Map and Ownership

Use only these packs (unless human approves a structural change):

| Folder | Purpose |
|--------|---------|
| `docs/product/` | Product strategy, roadmap, and master plan (root `PRD.md` stays canonical) |
| `docs/features/` | Per-feature specs (profiles, cases, donations, etc.) |
| `docs/systems/` | Architecture, data model, API reference, auth, deployment, testing, analytics |
| `docs/design/` | UI/UX patterns, theming tokens, mobile-native, i18n |
| `docs/business/` | Revenue model, partner types, growth strategy |
| `docs/missions/` | Platform initiative specs (drones, safehouse, marketplace, insurance) |
| `docs/partners/` | Operational partner docs (seeding, claims, outreach) |
| `docs/investor/` | Investor-facing narrative assets |

Do not add planning docs to repo root.

---

## 4) Required Header for New Docs

Every new planning/spec/audit doc must start with:

```md
# [Title]

> **Owner:** [who maintains this]
> **Status:** draft | review | final
> **Last updated:** YYYY-MM-DD
> **PRD Ref:** [checklist item(s), if applicable]
```

### Status Lifecycle

| Status | Meaning | Allowed Edits |
|--------|---------|---------------|
| `draft` | Work in progress, incomplete | Any edits allowed |
| `review` | Under Codex/Human review | Only review-driven fixes |
| `final` | Approved and locked | Corrections only (typos, broken links, date updates). Content changes require re-opening to `draft` with DECISIONS.md entry. |

**Escape hatch:** A `final` doc can be reopened to `draft` when:
1. The underlying code/schema changes in a way that invalidates the spec.
2. A DECISIONS.md entry documents why the spec is being reopened.
3. The spec is re-promoted to `final` after updates are reviewed.

---

## 5) Spec Template (Decision-Complete)

Every feature spec follows this 10-section structure:

1. **Purpose** — Why this feature exists. One paragraph.
2. **User Stories** — As a [role], I want to [action] so that [outcome].
3. **Functional Requirements** — Numbered list of what the feature MUST do.
4. **Data Model** — Tables, fields, indexes, relationships (reference schema.ts).
5. **API Surface** — Convex queries, mutations, actions needed.
6. **UI Surfaces** — Pages, components, routes involved.
7. **Edge Cases & Abuse** — What can go wrong. How we handle it.
8. **Non-Functional Requirements** — Performance, security, accessibility, i18n.
9. **Acceptance Criteria** — Testable pass/fail assertions. Use `- [ ]` checkboxes.
10. **Open Questions** — Unresolved decisions (link to DECISIONS.md when resolved).

Rules:
- Prefer concrete bullets over long narrative.
- Keep claims falsifiable and tied to repo evidence.
- Use file references for technical claims (e.g. `src/pages/AnimalProfile.tsx:142`).
- Avoid "round history" sections; keep docs current-state.

---

## 6) Naming and Placement Rules

1. Use lowercase kebab-case file names.
2. Use meaningful suffixes:
   - `*-spec.md` — feature or system spec
   - `*-plan.md` — operational plan
   - `*-audit.md` — audit findings
3. Place each doc in the closest domain folder; do not create root-level `.md` files.

---

## 7) Visual Audit Artifacts

1. Store screenshots only when actively referenced by an open audit doc.
2. Delete screenshots once the audit findings are absorbed into specs.
3. No PNG accumulation — keep `docs/` clean and text-first.

---

## 8) Post-Edit Checklist

After updating any doc:
1. Verify no contradictions with root canonical docs.
2. Regenerate `docs/features/INDEX.md` when feature specs or PRD checklist links change (`pnpm docs:index`).
3. Run docs validation (`pnpm docs:check`) and fix any failures.
4. Update `Last updated` date in header.
