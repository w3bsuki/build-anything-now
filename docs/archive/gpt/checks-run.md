# Checks run (audit evidence)
> Date: 2026-01-13  
> Note: Repo contains multiple lockfiles; commands below were run with the current environment and existing `node_modules`.

## 1) ESLint
Command:
```bash
npm run lint
```
Result: ❌ Failed (`9` errors, `12` warnings)

Top errors to fix:
- `src/components/ClinicCard.tsx` — `no-useless-escape` (unnecessary escape character)
- `src/components/ui/command.tsx` — `@typescript-eslint/no-empty-object-type`
- `src/components/ui/textarea.tsx` — `@typescript-eslint/no-empty-object-type`
- `src/components/ui/sidebar.tsx` — `react-hooks/purity` (`Math.random()` during render)
- `src/pages/Notifications.tsx` — `@typescript-eslint/no-explicit-any`
- `src/pages/Settings.tsx` — `@typescript-eslint/no-explicit-any` (multiple)

Warnings to address (or scope out):
- `convex/_generated/*` — unused eslint-disable directives (should be excluded from lint)
- multiple shadcn/ui files — `react-refresh/only-export-components` (consider scoping rule off for `src/components/ui/*`)

## 2) TypeScript typecheck
Command:
```bash
npx tsc -p tsconfig.app.json --noEmit
```
Result: ❌ Failed

Key failures:
- `src/components/ui/calendar.tsx` — `DayPicker` custom components typing mismatch (`IconLeft` etc)
- `src/components/ui/chart.tsx` — Recharts typing mismatches (`payload`, `label`, unknown types)
- `src/components/ui/resizable.tsx` — `react-resizable-panels` API mismatch (no `PanelGroup`, `PanelResizeHandle` on import)
- `src/pages/CommunityPost.tsx` — type mismatch (missing `image` on object type used)
- `src/pages/Partners.tsx` — missing `mockVolunteers` identifier

## 3) Production build
Command:
```bash
npm run build
```
Result: ✅ Success

Notes:
- Vite warns about chunks > 500kb after minification. Route-level lazy loading and manual chunking should be added.

