# Task 3: Tailwind CSS v4 Alignment

> **Goal:** Audit and align the Tailwind CSS v4 configuration, token system, and utility classes with Tailwind v4 best practices. Remove redundancy, fix anti-patterns.

---

## Your Process

1. **Read the latest Tailwind CSS v4 documentation** — focus on the CSS-first configuration approach, `@theme`, `@layer`, `@custom-variant`, and token patterns.
2. **Audit `src/index.css`** line by line — it's a 419-line file serving as both Tailwind config and custom styles.
3. **Identify and fix** anti-patterns, redundancy, self-referencing variables.
4. **Verify** — `pnpm build` must pass, and visual output should be unchanged.

---

## Files to Audit

### `src/index.css` (419 lines — the main Tailwind config)

**Structure overview:**
- Lines 1-3: `@import "tailwindcss"`, `@import "tw-animate-css"`, `@custom-variant dark`
- Lines 5-100: `@layer base` + `@layer components` + `@layer utilities` — custom classes
- Lines 100-210: `@theme inline` block — token-to-CSS-variable mappings
- Lines 210-330: `:root` — light theme CSS custom properties
- Lines 330-419: `.dark` — dark theme CSS custom properties

**Issues to investigate and fix:**

#### 1. Self-referencing `@theme` variables
The `@theme inline` block has multiple self-referencing variables:
```css
--shadow-2xl: var(--shadow-2xl);
--shadow-xl: var(--shadow-xl);
--spacing: var(--spacing);
--tracking-normal: var(--letter-spacing);
--letter-spacing: var(--letter-spacing);
```
These reference themselves or create circular chains. Audit each one — either the `:root` block should set the actual value and `@theme` should reference it, or the value should be defined directly. Read Tailwind v4 docs to understand the correct pattern for overriding theme tokens.

#### 2. Duplicate font-family declarations
`--font-sans` is declared in:
- `@theme inline` block
- `:root` block
- `.dark` block
- `src/fonts.css` (separate file — should be deleted in Task 1)

After Task 1 removes `fonts.css`, ensure `--font-sans` is only declared ONCE in the correct location. The `.dark` block shouldn't need to redeclare font-related variables unless they actually change between themes.

#### 3. Redundant `.dark` declarations
Compare `:root` and `.dark` blocks. Any variable that has the SAME value in both should be removed from `.dark`. Currently `.dark` redeclares `--font-sans`, `--font-serif`, `--font-mono`, `--radius`, `--spacing` — these probably don't change between themes.

#### 4. `@custom-variant dark` pattern
Current: `@custom-variant dark (&:is(.dark *));`
Verify this is the correct Tailwind v4 pattern for class-based dark mode (used by `next-themes`). Read docs to confirm.

#### 5. Component layer classes
Review `@layer components` classes:
- `.card-hover`, `.progress-bar-track`, `.progress-bar-fill`, `.badge-urgent`, `.badge-critical`, `.badge-recovering`, `.badge-adopted`, `.nav-item`, `.nav-item-active`, `.sticky-donate`
- Check if each is actually used in the codebase. Search for usage of each class name.
- If unused, delete.
- If used, verify they follow Tailwind v4 `@layer components` patterns.

#### 6. Utility layer classes
Review `@layer utilities` classes:
- `.scrollbar-hide`, `.scroll-touch`, `.glass-ultra`, `.glass-subtle`, `.nav-shadow`
- Same drill — verify usage, delete if unused.

#### 7. `tw-animate-css` import
Verify this package is actually used. If animations are not used, remove the import and the dependency.

#### 8. Large token surface
The `@theme inline` block maps ~100 CSS variables. This is a LOT of custom tokens. Review whether all of these are necessary:
- Sidebar tokens (`--color-sidebar-*`) — is there a sidebar in the app? If not, remove.
- Chart tokens (`--color-chart-*`) — are charts used? If sparingly, consider if 5 chart colors are needed.
- Surface hierarchy tokens — verify these are all used.

---

## Verification

```bash
pnpm build
pnpm dev  # visual check — dark mode and light mode should look correct
pnpm styles:scan  # run the existing style scanner
```

---

## Commit
```
refactor: clean up Tailwind v4 config — remove self-references, redundancy, unused tokens
```
