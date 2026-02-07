# Pawtreon Docs Agent Contract (`docs/`)

> Purpose: Keep documentation decision-complete, consistent, and usable by humans and coding agents.  
> Scope: Applies to all files under `docs/`.  
> Last updated: 2026-02-06

---

## 1) Authority and Precedence

1. Root governance remains canonical in `AGENTS.md` (repo root).
2. This file adds docs-specific rules only for the `docs/` subtree.
3. If conflicts appear, use this precedence:
   - System/developer/user instructions
   - Repo root `AGENTS.md`
   - This `docs/AGENTS.md`
4. Keep this file focused on writing workflow, not product policy duplication.

Reference guidance:
- OpenAI AGENTS guide: `https://openai.github.io/codex/guides/agents/`
- AGENTS.md format notes: `https://agents.md/`

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

---

## 3) Docs Map and Ownership

Use only these packs (unless human approves a structural change):
- `docs/product/` - vision details, roadmap, behavior specs
- `docs/architecture/` - stack baseline, data-model audits
- `docs/design/` - UI audits, styling remediation plans
- `docs/partners/` - clinics/partners claim and outreach ops
- `docs/mission/` - platform initiatives (drones/safehouse roadmap)
- `docs/investor/` - investor-facing narrative assets

Do not add planning docs to repo root.

---

## 4) Required Header for New Docs

Every new planning/spec/audit doc must start with:
- Title (`# ...`)
- `Owner`
- `Update cadence`
- `Last updated` (YYYY-MM-DD)

Example:
```md
# Example Doc
- Owner: Product
- Update cadence: Weekly
- Last updated: 2026-02-06
```

---

## 5) Writing Standard (Decision-Complete)

For implementation-facing docs, include these sections:
1. `Summary`
2. `Scope` (in/out)
3. `Interfaces / Data / API impact` (when relevant)
4. `States / Flows / Edge cases` (when relevant)
5. `Acceptance criteria` (testable)
6. `Risks + mitigations`
7. `Open items` (only if truly unresolved)

Rules:
- Prefer concrete bullets over long narrative.
- Keep claims falsifiable and tied to repo evidence.
- Use file references for technical claims (e.g. `src/pages/AnimalProfile.tsx:142`).
- Avoid "round history" sections; keep docs current-state.

---

## 6) Naming and Placement Rules

1. Use lowercase kebab-case file names.
2. Use meaningful suffixes:
   - `*-plan.md`
   - `*-spec.md`
   - `*-audit.md`
   - `*-baseline.md`
3. Place each doc in the closest domain folder; do not create root-level `.md` files.
4. If content is obsolete, remove it (or merge the still-relevant parts into active docs) instead of leaving stale active docs.

---

## 7) Update Workflow (Required)

When changing product behavior:
1. Update canonical source first (`PRD.md`, `DESIGN.md`, `RULES.md`, `TASKS.md` as needed).
2. Sync supporting docs under `docs/`.
3. If a durable decision is made, append to `DECISIONS.md`.
4. If a doc is superseded, mark it clearly and point to the replacement.

---

## 8) Quality Gate Before Merging Docs

Checklist:
- [ ] No contradiction with root canonical docs.
- [ ] All linked paths exist.
- [ ] Dates updated.
- [ ] Acceptance criteria are testable.
- [ ] No archived process reintroduced (`.specs`, removed root docs, etc.).

Optional but recommended:
- [ ] Add or update screenshot artifacts for UI audits in `docs/design/`.

---

## 9) Visual Audit Convention

For UI audits:
1. Store images in `docs/design/`.
2. Store write-up as `docs/design/<surface>-visual-audit.md`.
3. Include:
   - route list
   - viewport coverage (desktop/mobile)
   - severity-ranked findings
   - concrete fix queue
4. Prefer evidence from runtime logs plus screenshot artifacts.

---

## 10) What Not To Do

- Do not duplicate canonical checklists from `PRD.md` inside random supporting docs.
- Do not add speculative features as "committed" scope without updating `PRD.md`.
- Do not keep stale investor/ops claims in active docs once product reality changes.
- Do not expand root doc count beyond the hard cap.
