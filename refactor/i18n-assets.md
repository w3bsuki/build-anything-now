# Task 8: i18n + Assets Cleanup

> **Goal:** Audit internationalization setup, locale files, font loading, and public assets. Remove stale keys, consolidate font handling, clean the public folder.

---

## Your Process

1. **Audit the i18n pipeline** — config, locale files, translation usage in components.
2. **Audit font loading** — currently loaded via `@fontsource/nunito` in `main.tsx`.
3. **Audit `public/` folder** — check for unused assets.
4. **Verify** — `pnpm build` must pass.

---

## Files to Audit

### i18n Configuration

**`src/i18n/index.ts`**
Current setup: `i18next` + `LanguageDetector` + `HttpBackend` + `initReactI18next`
- Supported languages: `en`, `bg`, `uk`, `ru`, `de`
- Locale files loaded from `/locales/{{lng}}/{{ns}}.json`
- This is a clean setup — likely fine. Just verify the config options are appropriate.

**`i18next.config.ts`** (root — CLI config for key extraction)
- Used by `i18next-cli` for extracting translation keys.
- Check if this tool is actually used in the workflow. If nobody runs `i18next-cli`, this config file is dead weight.
- Check if `i18next-cli` is in devDependencies and if any npm script uses it.

### Locale Files (`public/locales/`)

Folders: `bg/`, `de/`, `en/`, `ru/`, `uk/`

For each locale:
1. Open the translation JSON file.
2. Check for stale keys that reference deleted components or pages.
3. Check for keys that are defined but never used in the codebase (search for the key in `src/`).
4. Check for inconsistency — keys present in `en` but missing in other locales.
5. Don't fix translations — just remove keys for deleted features and flag untranslated gaps.

### Font Loading

Currently in `src/main.tsx`:
```ts
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
```

**Check:**
1. Are all 5 weights actually used? Search the CSS/Tailwind config for `font-weight` values or Tailwind weight classes (`font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`).
   - 400 = `font-normal`
   - 500 = `font-medium`
   - 600 = `font-semibold`
   - 700 = `font-bold`
   - 800 = `font-extrabold`
2. If a weight is not used in any component or CSS, remove its import to reduce bundle size.
3. Each `@fontsource` weight adds ~20-30KB to the bundle. Removing unused weights is a real win.

### `src/fonts.css`

Should be deleted in Task 1 (dead file cleanup). If it wasn't, delete it here. It duplicates `--font-sans` from `index.css`. Also remove its import from `main.tsx`.

### `public/` folder

Current contents:
- `favicon.ico` — keep
- `placeholder.svg` — check if used anywhere in the app. If it's the default Vite/Lovable placeholder, delete.
- `robots.txt` — keep
- `locales/` — keep (translations)

Check for any other files that may have been added.

---

## Verification

```bash
pnpm build
pnpm dev  # verify translations still load, fonts render correctly
```

---

## Commit
```
refactor: clean i18n locale files, remove unused font weights, clean public assets
```
