# Tasks: <Feature Name>

> **Spec ID:** `<feature-slug>`  
> **Status:** 🟡 Draft | 🔵 In Progress | ✅ Complete  
> **Requirements:** [requirements.md](./requirements.md)  
> **Design:** [design.md](./design.md)  
> **Started:** YYYY-MM-DD  
> **Completed:** YYYY-MM-DD

---

## Progress

| Total | Done | In Progress | Blocked | Dropped |
|-------|------|-------------|---------|---------|
| X | 0 | 0 | 0 | 0 |

---

## Task legend

| Symbol | State |
|--------|-------|
| `[ ]` | Not started |
| `[~]` | In-progress (prefer one at a time) |
| `[x]` | Done |
| `[!]` | Blocked |
| `[-]` | Dropped |

---

## Tasks

### Phase 1: Schema & backend

#### T-1: <Task title>
- **Requirement:** AC-1.1, AC-2.1
- **Files:** `convex/schema.ts`, `convex/<feature>.ts`
- **Description:** <What to do — 1–3 sentences>
- **Done when:**
  - [ ] `npx convex codegen` succeeds
  - [ ] Types are generated in `convex/_generated/`
- **Status:** [ ]

#### T-2: <Task title>
- **Requirement:** AC-1.2
- **Files:** `convex/<feature>.ts`
- **Description:** <What to do>
- **Done when:**
  - [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` passes
  - [ ] Manual test: <specific verification>
- **Status:** [ ]

---

### Phase 2: UI components

#### T-3: <Task title>
- **Requirement:** AC-1.1
- **Files:** `src/components/<Component>.tsx`
- **Description:** <What to do>
- **Done when:**
  - [ ] Component renders without errors
  - [ ] Follows STYLE.md tokens
  - [ ] <Specific behavior verified>
- **Status:** [ ]

#### T-4: <Task title>
- **Requirement:** AC-1.2, AC-1.3
- **Files:** `src/components/<Form>.tsx`
- **Description:** <What to do>
- **Done when:**
  - [ ] Form validates inputs
  - [ ] Error states display correctly
  - [ ] Submit triggers expected behavior
- **Status:** [ ]

---

### Phase 3: Integration & routing

#### T-5: <Task title>
- **Requirement:** (navigation)
- **Files:** `src/App.tsx`, `src/components/Navigation.tsx`
- **Description:** <What to do>
- **Done when:**
  - [ ] Route accessible at `/path`
  - [ ] Nav item visible and working
  - [ ] No 404s
- **Status:** [ ]

---

### Phase 4: Polish & verification

#### T-6: Add i18n strings
- **Requirement:** (UX)
- **Files:** `public/locales/en/translation.json` (and other locales as needed)
- **Description:** Add all user-facing strings with fallbacks
- **Done when:**
  - [ ] No raw i18n keys visible in UI
  - [ ] Strings make sense in context
- **Status:** [ ]

#### T-7: Error handling polish
- **Requirement:** AC-1.3, AC-2.2
- **Files:** Various
- **Description:** Ensure all error states have user-friendly handling
- **Done when:**
  - [ ] Network errors show toast
  - [ ] Validation errors show inline
  - [ ] Auth errors handled gracefully
- **Status:** [ ]

#### T-8: Final quality gates
- **Requirement:** (quality)
- **Files:** N/A
- **Description:** Run all quality checks and smoke test
- **Done when:**
  - [ ] `pnpm lint` — no errors (warnings OK)
  - [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` — passes
  - [ ] `pnpm build` — succeeds
  - [ ] Manual smoke test from design.md passes
- **Status:** [ ]

---

## Blocked tasks

| Task | Blocked by | Unblock action | Owner |
|------|------------|----------------|-------|
| — | — | — | — |

---

## Dropped tasks

| Task | Reason | Date |
|------|--------|------|
| — | — | — |

---

## Implementation notes

<Add notes during implementation that might be useful for future reference>

### T-X notes
- <What was learned>
- <Gotchas encountered>
- <Deviations from design (and why)>

---

## Completion checklist

- [ ] All tasks marked `[x]` or `[-]`
- [ ] Quality gates pass (`lint`, `tsc`, `build`)
- [ ] Manual smoke test complete
- [ ] No regressions in existing functionality
- [ ] Spec moved to `.specs/completed/`
- [ ] ROADMAP.md updated (checkbox marked)
- [ ] DECISIONS.md updated (if lasting decisions were made)
