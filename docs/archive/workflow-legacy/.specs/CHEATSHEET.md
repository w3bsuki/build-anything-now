# Spec-Driven Development — Quick Reference

## Roles

| Who | Does what |
|-----|-----------|
| **OPUS** (Claude) | Drafts specs, writes code, executes tasks |
| **Codex** | Reviews specs, challenges assumptions |
| **Human** | Locks specs, approves, decides |

---

## When to spec

| Risk | Examples | Review gates |
|------|----------|--------------|
| **High** | money, auth, schema, trust/safety | 2 gates (req + design) |
| **Medium** | multi-file, new pages, UI overhauls | 1 gate (combined) |
| **Low** | bug fixes, copy, style tweaks | No spec (TODO.md) |

**Always spec:** payments, auth, PII, schema, trust/safety — even if small.

---

## Workflow

```
1. PICK      → ROADMAP.md
2. CREATE    → .specs/active/<feature>/
3. DRAFT     → requirements.md (OPUS)
4. REVIEW    → Codex critiques
5. LOCK      → Human approves
6. DRAFT     → design.md (OPUS)
7. REVIEW    → Codex critiques
8. LOCK      → Human approves
9. GENERATE  → tasks.md (OPUS)
10. EXECUTE  → Prefer one task at a time
11. VERIFY   → lint, tsc, build
12. SHIP     → .specs/completed/
```

---

## EARS cheat sheet

| Type | Pattern |
|------|---------|
| Always | THE SYSTEM SHALL [behavior] |
| Event | WHEN [event] THE SYSTEM SHALL [behavior] |
| State | WHILE [state] THE SYSTEM SHALL [behavior] |
| Feature | WHERE [feature] THE SYSTEM SHALL [behavior] |
| Negative | IF [condition] THEN THE SYSTEM SHALL NOT [behavior] |

**Guidelines:** 3–7 ACs per story, at least one negative/error case.

---

## Task states

```
[ ] Not started
[~] In-progress (prefer one at a time)
[x] Done
[!] Blocked
[-] Dropped
```

---

## Spec status

| Status | Meaning |
|--------|---------|
| 🟡 Draft | Being written |
| 🔵 In Review | Sent to Codex |
| 🟢 Locked | Approved |
| ✅ Complete | Shipped |

---

## Quality gates

```powershell
pnpm lint
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

---

## Create a spec (PowerShell)

```powershell
New-Item -ItemType Directory -Path ".specs\active\<feature>" -Force
Copy-Item -Path ".specs\_TEMPLATE\*" -Destination ".specs\active\<feature>\" -Recurse
```

---

## Change control

| Change | Re-review? |
|--------|------------|
| Typo/clarification | No |
| New AC or story | Yes |
| Schema/architecture | Yes (full) |
| Task reorder/split | No |
| Task dropped | Document why, no review |

---

## Codex review tone

**Be adversarial:**
- "What edge case breaks this?"
- "What abuse vector exists?"
- "Is this the simplest approach?"
- "What's missing?"

Don't be a yes-man.
