# Testing Strategy Spec

> **Owner:** Engineering  
> **Status:** final  
> **Last updated:** 2026-02-08

---

## Purpose

Defines the testing strategy, framework choices, coverage targets, test data approach, and CI integration for Pawtreon. This is a greenfield spec — the project currently has **0% test coverage** with no test framework installed.

---

## Current State

| Metric | Value |
|--------|-------|
| Test framework | None |
| Test files | 0 |
| Test coverage | 0% |
| CI test gates | None |
| Test scripts in `package.json` | None |
| Dev seed data (`devSeed.ts`) | Empty (gutted during refactor) |

---

## Framework Selection

### Decision: Vitest

| Criterion | Vitest | Jest | Rationale |
|-----------|--------|------|-----------|
| Vite integration | Native | Requires config | Same build pipeline, shared config |
| TypeScript | Built-in via Vite | Requires `ts-jest` or SWC | Zero-config TS support |
| ESM support | Native | Experimental | Pawtreon uses `"type": "module"` |
| Speed | Fast (Vite transforms) | Slower (separate transform) | SWC-powered transforms |
| API compatibility | Jest-compatible | — | Easy migration if needed |
| Community | Growing fast | Mature | Both well-supported |

**Additional libraries:**

| Library | Purpose |
|---------|---------|
| `@testing-library/react` | React component testing |
| `@testing-library/jest-dom` | DOM assertion matchers |
| `@testing-library/user-event` | User interaction simulation |
| `jsdom` | DOM environment for Vitest |
| `convex-test` | Convex function testing utilities |
| `@playwright/test` | E2E browser testing (Phase 2) |

### Installation

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom convex-test
```

### Configuration

```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'convex/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'convex/**/*.ts'],
      exclude: [
        'convex/_generated/**',
        'src/vite-env.d.ts',
        '**/*.test.{ts,tsx}',
        'src/test/**',
      ],
    },
  },
}));
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## Test Types

### 1. Unit Tests — Convex Functions

Test Convex queries, mutations, and actions in isolation using `convex-test`.

**What to test:**
- Input validation (Zod schemas)
- Authorization checks (ownership, admin-only)
- Business logic (donation calculations, case status transitions)
- Edge cases (empty inputs, boundary values)
- Error handling (auth failures, not-found, validation errors)

**Example pattern:**

```typescript
// convex/cases.test.ts
import { convexTest } from 'convex-test';
import { expect, test } from 'vitest';
import { api } from './_generated/api';
import schema from './schema';

test('createCase requires authentication', async () => {
  const t = convexTest(schema);
  await expect(
    t.mutation(api.cases.createCase, { /* args */ })
  ).rejects.toThrow('Not authenticated');
});

test('createCase sets default status to active_treatment', async () => {
  const t = convexTest(schema);
  const asUser = t.withIdentity({ subject: 'user1' });
  // ... seed user, then create case, assert status
});
```

**Priority functions to test (critical paths):**

| File | Functions | Why Critical |
|------|-----------|-------------|
| `donations.ts` | `createCheckoutSession`, `handleStripeWebhook` | Money flow |
| `cases.ts` | `createCase`, `updateCase`, `closeCase` | Core product |
| `users.ts` | `completeOnboarding`, `updateProfile` | User lifecycle |
| `clinics.ts` | `submitClaim`, `approveClaim` | Trust/verification |
| `community.ts` | `createPost`, `reportPost` | Content moderation |
| `lib/auth.ts` | All 4 helpers | Auth foundation |

### 2. Unit Tests — Utility Functions

Test pure utility functions (formatters, validators, helpers).

**What to test:**
- Date formatting functions
- Currency formatting
- Validation helpers
- Translation key resolution
- URL generation

**File pattern:** `src/lib/*.test.ts`, `src/hooks/*.test.ts`

### 3. Component Tests — React Components

Test React components with Testing Library (render, interact, assert).

**What to test:**
- Component renders correctly with given props
- User interactions trigger expected callbacks
- Conditional rendering based on state/props
- Loading, error, and empty states
- Accessibility (roles, labels, keyboard navigation)

**Example pattern:**

```typescript
// src/components/CaseCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseCard } from './CaseCard';

test('renders case title and urgency badge', () => {
  render(<CaseCard case={mockCase} />);
  expect(screen.getByText('Injured dog in Sofia')).toBeInTheDocument();
  expect(screen.getByText('Critical')).toBeInTheDocument();
});

test('donate button calls onDonate', async () => {
  const onDonate = vi.fn();
  render(<CaseCard case={mockCase} onDonate={onDonate} />);
  await userEvent.click(screen.getByRole('button', { name: /donate/i }));
  expect(onDonate).toHaveBeenCalledWith(mockCase._id);
});
```

**Priority components (trust-critical surfaces):**

| Component | Why Critical |
|-----------|-------------|
| Case card | Core feed element, trust signals |
| Donation flow | Money UI |
| Case creation form | Data input integrity |
| Clinic directory | Trust/verification display |
| Auth gate | Access control UI |
| Report dialog | Trust/safety UX |

### 4. Integration Tests

Test multi-layer interactions: Convex functions + auth + external services.

**What to test:**
- Full donation flow (create checkout → webhook → donation record → notification)
- Case lifecycle (create → update → close)
- Clinic claim flow (submit → review → approve/reject)
- Auth flow (signup → onboarding → profile completion)

**Approach:** Use `convex-test` with identity injection for auth simulation. Mock Stripe and Clerk webhook payloads.

### 5. E2E Tests (Phase 2)

Browser-based tests with Playwright for critical user journeys.

**What to test:**
- Homepage loads, case feed visible
- Create case flow end-to-end
- Donation checkout redirect and return
- User signup and onboarding
- Clinic search and directory browsing
- Community post creation

**Configuration:**

```typescript
// playwright.config.ts (future)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    port: 8080,
    reuseExistingServer: true,
  },
});
```

---

## Coverage Targets

### Phase 1: Foundation (Target: 40% overall)

Focus on critical money + trust paths.

| Area | Target | Priority Functions |
|------|--------|-------------------|
| Convex mutations (money) | 90% | `donations.*`, `cases.createCase`, `cases.closeCase` |
| Convex auth helpers | 100% | `lib/auth.ts` (4 functions) |
| Convex mutations (trust) | 80% | `clinics.submitClaim`, `reports.*`, `community.reportPost` |
| React utility functions | 70% | `src/lib/*` |

### Phase 2: Growth (Target: 60% overall)

Expand to cover all mutations and key components.

| Area | Target |
|------|--------|
| All Convex mutations | 80% |
| All Convex queries | 60% |
| React components (trust surfaces) | 50% |
| E2E critical paths | 5 scenarios |

### Phase 3: Maturity (Target: 80% overall)

| Area | Target |
|------|--------|
| All Convex functions | 85% |
| React components | 70% |
| E2E scenarios | 15+ |
| Accessibility | All trust surfaces |

---

## Test Data Strategy

### Problem

`devSeed.ts` is currently empty (gutted during refactor). `scripts/seed.mjs` references the old seed functions and is broken.

### Solution: Test Fixtures

Create reusable test fixtures rather than relying on database seeding:

```typescript
// src/test/fixtures.ts
export const mockUser = {
  _id: 'user1' as Id<'users'>,
  clerkId: 'clerk_user1',
  name: 'Test User',
  email: 'test@pawtreon.com',
  role: 'user' as const,
  onboardingCompleted: true,
  // ...
};

export const mockCase = {
  _id: 'case1' as Id<'cases'>,
  title: 'Injured dog in Sofia',
  type: 'critical' as const,
  status: 'active_treatment' as const,
  goalAmount: 500,
  currentAmount: 150,
  currency: 'EUR',
  userId: 'user1' as Id<'users'>,
  // ...
};

export const mockDonation = {
  _id: 'donation1' as Id<'donations'>,
  amount: 25,
  currency: 'EUR',
  status: 'completed' as const,
  // ...
};
```

### Convex Test Data

For `convex-test`, seed data inline per test:

```typescript
test('getDonationsForCase returns donations', async () => {
  const t = convexTest(schema);
  // Seed directly in test
  await t.run(async (ctx) => {
    await ctx.db.insert('users', mockUser);
    await ctx.db.insert('cases', mockCase);
    await ctx.db.insert('donations', mockDonation);
  });
  
  const donations = await t.query(api.donations.getDonationsForCase, {
    caseId: mockCase._id,
  });
  expect(donations).toHaveLength(1);
});
```

### Rebuild `devSeed.ts` (Future)

When ready, rebuild `devSeed.ts` with:
- 5 test users (different roles/capabilities)
- 10 cases (mix of statuses and urgencies)
- 20 donations (mix of amounts and statuses)
- 3 clinics (verified and unverified)
- 5 community posts
- Sample achievements

---

## CI Integration

### Test in CI Pipeline

```yaml
# Addition to .github/workflows/ci.yml
- run: pnpm test              # Run all tests
- run: pnpm test:coverage      # Generate coverage report
```

### CI Gates

| Gate | Blocks Merge | Rationale |
|------|-------------|-----------|
| All tests pass | Yes | No broken tests in main |
| Coverage ≥ threshold | Advisory (Phase 1), Yes (Phase 2+) | Progressive enforcement |
| No snapshot regressions | Yes (when snapshots exist) | UI consistency |

### PR Checks

- **Coverage comment:** Post coverage diff on PRs (via Vitest coverage reporter + GitHub Action)
- **Test summary:** Show pass/fail counts in PR status
- **Flaky test detection:** Flag tests that fail intermittently (future)

---

## File Organization

```
src/
├── test/
│   ├── setup.ts              # Test setup (jest-dom matchers)
│   ├── fixtures.ts           # Shared mock data
│   └── utils.ts              # Test helper utilities
├── components/
│   ├── CaseCard.tsx
│   └── CaseCard.test.tsx     # Co-located component tests
├── hooks/
│   ├── useDonation.ts
│   └── useDonation.test.ts   # Co-located hook tests
├── lib/
│   ├── utils.ts
│   └── utils.test.ts         # Co-located utility tests
convex/
├── cases.ts
├── cases.test.ts              # Co-located Convex tests
├── donations.ts
├── donations.test.ts
├── lib/
│   ├── auth.ts
│   └── auth.test.ts
e2e/                           # E2E tests (Phase 2)
├── donation-flow.spec.ts
├── case-creation.spec.ts
└── auth-flow.spec.ts
```

**Convention:** Test files co-located with source files using `.test.ts` / `.test.tsx` suffix.

---

## Mocking Strategy

### External Services

| Service | Mock Approach |
|---------|---------------|
| Clerk auth | `convex-test` identity injection for backend; mock `useUser` hook for frontend |
| Stripe | Mock webhook payloads; mock `stripe.checkout.sessions.create` in actions |
| DeepL | Mock API responses in translation action tests |
| Convex DB | `convex-test` provides in-memory DB |

### React Providers

```typescript
// src/test/utils.ts
import { render } from '@testing-library/react';
import { ConvexProvider } from 'convex/react';
import { ClerkProvider } from '@clerk/clerk-react';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    // Wrap with mocked providers as needed
    ui
  );
}
```

---

## Implementation Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| **0: Setup** | Week 1 | Install Vitest + Testing Library, config, first passing test |
| **1: Critical paths** | Weeks 2-4 | Donation flow tests, auth helper tests, case CRUD tests |
| **2: Expand** | Weeks 5-8 | All mutations tested, key component tests, E2E setup |
| **3: Mature** | Ongoing | 80% coverage, E2E scenarios, accessibility tests |

### Phase 0 Checklist

- [ ] `pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom convex-test`
- [ ] Create `vitest.config.ts`
- [ ] Create `src/test/setup.ts`
- [ ] Create `src/test/fixtures.ts`
- [ ] Add `test`, `test:watch`, `test:coverage` scripts to `package.json`
- [ ] Write first test: `convex/lib/auth.test.ts`
- [ ] Verify test runs in CI

---

## Open Questions

1. **Convex test isolation:** Does `convex-test` support parallel test execution, or do tests need to run serially?
2. **Snapshot testing:** Should we use Vitest snapshots for component output, or rely solely on assertion-based tests?
3. **Visual regression:** Should we add Chromatic or Percy for visual regression testing of trust-critical surfaces?
4. **Test data ownership:** Should `devSeed.ts` be rebuilt as a priority, or are test fixtures sufficient?
5. **Coverage enforcement:** At what coverage threshold should we block PRs? (Recommendation: 60% after Phase 1)
