# Design: <Feature Name>

> **Spec ID:** `<feature-slug>`  
> **Status:** 🟡 Draft | 🔵 In Review | 🟢 Locked  
> **Requirements:** [requirements.md](./requirements.md)  
> **Last updated:** YYYY-MM-DD

---

## Overview

<High-level description of the technical approach>

---

## Architecture

### Component diagram

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Component A   │────▶│   Component B   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│                 │
│   Component C   │
│                 │
└─────────────────┘
```

### Components

| Component | Responsibility | Location |
|-----------|---------------|----------|
| ComponentA | <what it does> | `src/components/ComponentA.tsx` |
| ComponentB | <what it does> | `src/components/ComponentB.tsx` |
| backendFunction | <what it does> | `convex/feature.ts` |

---

## Data models

### New / modified schema

```typescript
// convex/schema.ts additions

export const newTable = defineTable({
  field1: v.string(),
  field2: v.number(),
  field3: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_field1", ["field1"])
  .index("by_created", ["createdAt"]);
```

### Type definitions

```typescript
// src/types/feature.ts

export interface FeatureData {
  id: string;
  field1: string;
  field2: number;
  field3?: string;
}

export type FeatureStatus = "draft" | "active" | "completed";
```

---

## API / Function signatures

### Convex mutations

```typescript
// convex/feature.ts

export const create = mutation({
  args: {
    field1: v.string(),
    field2: v.number(),
  },
  returns: v.id("newTable"),
  handler: async (ctx, args) => {
    // Implementation
  },
});

export const update = mutation({
  args: {
    id: v.id("newTable"),
    field1: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### Convex queries

```typescript
export const get = query({
  args: { id: v.id("newTable") },
  returns: v.union(v.object({...}), v.null()),
  handler: async (ctx, args) => {
    // Implementation
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({...})),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

---

## UI components

### New components

| Component | Props | Description |
|-----------|-------|-------------|
| `FeatureCard` | `data: FeatureData, onAction: () => void` | Displays feature item in list |
| `FeatureForm` | `onSubmit: (data) => void, initialData?: FeatureData` | Create/edit form |

### Component hierarchy

```
FeaturePage
├── FeatureHeader
├── FeatureList
│   └── FeatureCard (×n)
└── FeatureForm (modal/drawer)
```

---

## Data flow

### Sequence: Create new item

```
User          UI Component       Convex           Database
  │                │                │                │
  │─── fills form ─▶│                │                │
  │                │─── mutation ───▶│                │
  │                │                │─── insert ─────▶│
  │                │                │◀── id ─────────│
  │                │◀── success ────│                │
  │◀── toast ──────│                │                │
```

### State management

- **Server state:** Convex reactive queries (auto-refresh)
- **UI state:** React useState for form inputs, modals
- **Optimistic updates:** <Yes/No — describe if yes>

---

## Error handling

| Error case | User impact | Handling |
|------------|-------------|----------|
| Network failure | Action fails | Toast with retry option |
| Validation error | Form shows errors | Inline field errors |
| Auth required | Blocked action | Redirect to auth or show auth prompt |
| Rate limited | Temp blocked | Toast with "try again later" |

---

## Security considerations

> Reference: `TRUST-SAFETY.md`

| Concern | Mitigation |
|---------|------------|
| Unauthorized access | Auth check in mutation/query handler |
| Input validation | Convex validators + frontend validation |
| Data exposure | Return only necessary fields in queries |
| Rate abuse | <Rate limiting strategy if applicable> |

---

## Performance considerations

- **Query efficiency:** <Indexes used, pagination strategy>
- **Bundle size:** <New dependencies, lazy loading>
- **Render performance:** <Memoization, virtualization if needed>

---

## Testing strategy

> ⚠️ **Use current repo toolchain.** Don't list tools we don't have.

| Test type | What to test | Tools | Status |
|-----------|--------------|-------|--------|
| Manual smoke | Critical user flows | Checklist below | Required |
| Type checking | API contracts | `pnpm exec tsc` | Required |
| Lint | Code quality | `pnpm lint` | Required |
| Unit tests | Business logic | (add when toolchain exists) | Future |
| E2E tests | Full flows | (add when toolchain exists) | Future |

### Manual smoke test checklist

- [ ] <Step 1: specific action + expected result>
- [ ] <Step 2: specific action + expected result>
- [ ] <Step 3: error case + expected handling>

---

## Migration / rollout plan

- [ ] Schema changes backward compatible? <Yes/No>
- [ ] Feature flag needed? <Yes/No>
- [ ] Data migration required? <Yes/No — describe if yes>
- [ ] Rollback plan: <What to do if it breaks>

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| <What could go wrong> | Low/Med/High | Low/Med/High | <How we handle it> |

---

## Codex review

### Review 1 — YYYY-MM-DD
<Paste Codex technical review here>

### OPUS response
<How design was updated based on feedback>

---

## Sign-off

- [ ] Design reviewed by Codex
- [ ] Security concerns addressed
- [ ] Testing strategy is realistic (uses actual toolchain)
- [ ] Risks documented
- [ ] Ready for task generation
