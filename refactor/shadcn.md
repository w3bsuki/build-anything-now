# Task 4: shadcn/ui Alignment

> **Goal:** Audit shadcn/ui configuration, all UI primitives, and theming integration. Remove unused components, align with latest shadcn patterns.

---

## Your Process

1. **Read the latest shadcn/ui documentation** — focus on the Vite + Tailwind v4 installation guide, `components.json` schema, and theming system.
2. **Audit `components.json`** for correct configuration.
3. **Audit every file in `src/components/ui/`** — check if it's imported anywhere in the app.
4. **Remove unused primitives** — if a UI component is never imported outside `ui/`, delete it.
5. **Verify** — `pnpm build` must pass.

---

## Files to Audit

### `components.json`

Current:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@shadcn-studio": "https://shadcnstudio.com/r/{name}.json"
  }
}
```

**Issues to check:**
1. Verify `style: "default"` is still the recommended default in latest shadcn. There may be newer style variants now (e.g. "new-york" or "miami"). Check docs — keep `default` unless there's a clear upgrade.
2. `tailwind.config: ""` — in Tailwind v4 with CSS-first config, there's no `tailwind.config.js`. Verify this empty string is correct for shadcn + Tailwind v4.
3. `baseColor: "slate"` — verify this matches the actual CSS variables in `index.css`. The app uses `oklch` colors, not Tailwind's slate palette directly.
4. The `registries` entry for `@shadcn-studio` — check if this is used. If no components come from this registry, remove it.
5. Check for latest `components.json` schema changes in shadcn docs that should be applied.

### `src/components/ui/` — 49 files

Every file in this folder:
```
accordion.tsx, alert-dialog.tsx, alert.tsx, aspect-ratio.tsx, avatar.tsx,
badge.tsx, breadcrumb.tsx, button.tsx, calendar.tsx, card.tsx, carousel.tsx,
chart.tsx, checkbox.tsx, collapsible.tsx, command.tsx, context-menu.tsx,
dialog.tsx, drawer.tsx, dropdown-menu.tsx, form.tsx, hover-card.tsx,
input-otp.tsx, input.tsx, label.tsx, menubar.tsx, navigation-menu.tsx,
pagination.tsx, popover.tsx, progress.tsx, radio-group.tsx, resizable.tsx,
scroll-area.tsx, select.tsx, separator.tsx, sheet.tsx, sidebar.tsx,
skeleton.tsx, slider.tsx, sonner.tsx, switch.tsx, table.tsx, tabs.tsx,
textarea.tsx, toast.tsx, toaster.tsx, toggle-group.tsx, toggle.tsx,
tooltip.tsx, use-toast.ts
```

**For EACH file:**
1. Search the codebase for imports of this component (outside `ui/` itself).
2. If ZERO imports found → delete the file AND its corresponding Radix dependency from `package.json`.
3. If imported → keep it, but check if the component follows latest shadcn patterns.

**Likely candidates for removal** (commonly installed but rarely used):
- `accordion.tsx` — check usage
- `aspect-ratio.tsx` — check usage
- `breadcrumb.tsx` — check usage
- `collapsible.tsx` — check usage
- `context-menu.tsx` — check usage
- `hover-card.tsx` — check usage
- `input-otp.tsx` — check usage
- `menubar.tsx` — check usage
- `navigation-menu.tsx` — check usage
- `pagination.tsx` — check usage
- `resizable.tsx` — check usage
- `sidebar.tsx` — check usage (the app uses mobile bottom nav, not a sidebar)
- `slider.tsx` — check usage
- `table.tsx` — check usage
- `toggle.tsx` / `toggle-group.tsx` — check usage

### `use-toast.ts` duplication

There are TWO toast-related files:
- `src/components/ui/use-toast.ts`
- `src/hooks/use-toast.ts`

Check if they're the same file or different. Check which one is actually imported. Remove the duplicate.

### `src/lib/utils.ts`

This is the shadcn `cn()` utility. Verify it's the standard implementation:
```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
```

If it has extra utilities, audit them.

---

## Verification

```bash
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm build
```

After removing components and their Radix deps:
```bash
pnpm install  # to update lockfile
pnpm build    # verify nothing breaks
```

---

## Commit
```
refactor: remove unused shadcn/ui primitives, clean components.json
```
