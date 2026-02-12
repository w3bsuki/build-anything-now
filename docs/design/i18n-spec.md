# Internationalization Spec

> **Owner:** Frontend  
> **Status:** final  
> **Last updated:** 2026-02-09

---

## Purpose

Pawtreon serves a multilingual user base — launching in Bulgaria (BG) then expanding to EU and beyond. The platform handles two distinct i18n challenges:

1. **Static UI strings** — navigation labels, section headers, CTAs, form labels — translated via i18next with JSON locale files.
2. **Dynamic user-generated content (UGC)** — case titles, descriptions, stories — translated on-demand via server-side machine translation (DeepL API) with rate limiting and caching.

This spec documents the full i18n system: supported languages, i18next configuration, translation key conventions, fallback chain, missing key handling, UGC machine translation architecture, locale file organization, language detection, hardcoded string remediation, and RTL considerations.

Absorbs findings from:
- `docs/design/mobile-ux-audit-2026-02-07.md` (F2 — 60+ missing keys, language soup)
- `docs/design/localhost-8080-visual-audit.md` (P1 — CORS failures from language detection)

---

## User Stories

- As a **Bulgarian user**, I want the entire interface in Bulgarian — not a chaotic mix of BG and EN — so I trust the platform.
- As an **English-speaking donor**, I want case descriptions auto-translated to English so I can understand what I'm funding.
- As a **German volunteer**, I want the UI in German so I can navigate comfortably.
- As a **developer**, I want clear key naming conventions and a CI check so I never ship missing translations.
- As a **rescuer**, I want to write case descriptions in my native language and have them available to donors worldwide.

---

## Functional Requirements

1. The app MUST support 5 languages: EN (default), BG (launch market), UK, RU, DE.
2. The UI MUST render coherently in a single language — no mixed-language surfaces (F2 fix).
3. Missing translation keys MUST fall back to EN — never show raw key strings like `nav.home` to users.
4. UGC machine translation MUST be rate-limited to prevent abuse (20 requests/user/day default).
5. Translated UGC MUST be cached with source hash invalidation — retranslate only when source content changes.
6. Language detection MUST NOT cause CORS errors or block page rendering (P1 fix).
7. A key coverage check MUST be run in CI to catch missing translations before deployment.

---

## Supported Languages

| Code | Language | Status | Coverage | Notes |
|------|----------|--------|----------|-------|
| `en` | English | Default/fallback | 100% (baseline) | 936 keys |
| `bg` | Bulgarian | Launch market | ~99% | 925 keys (~11 keys short) |
| `de` | German | Supported | ~94% | 877 keys (~59 keys short) |
| `ru` | Russian | Supported | ~94% | 877 keys (~59 keys short) |
| `uk` | Ukrainian | Supported | ~94% | 877 keys (~59 keys short) |

**Gap analysis:** DE, RU, and UK are all missing the same ~59 keys — these are keys added to EN (and partially to BG) but never propagated. This must be remediated before launch.

---

## i18next Configuration

### Current Config (`src/i18n/index.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'bg', 'uk', 'ru', 'de'],
    defaultNS: 'translation',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,  // React already escapes
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
    },
  });
```

### Key Configuration Decisions

| Setting | Value | Rationale |
|---------|-------|-----------|
| `fallbackLng` | `'en'` | English is the most complete locale — always fall back to it |
| `supportedLngs` | `['en', 'bg', 'uk', 'ru', 'de']` | Limits to known translations — prevents loading nonexistent files |
| `defaultNS` | `'translation'` | Single namespace (see Namespace Strategy) |
| `debug` | `import.meta.env.DEV` | Shows missing key warnings in dev console only |
| `escapeValue` | `false` | React handles XSS escaping via JSX |
| Detection order | localStorage → querystring → navigator | Respects user's explicit choice, then URL param, then browser |
| Caching | `localStorage` | Persists language choice across sessions |

### Namespace Strategy

**Current:** Single `translation` namespace for all keys.

**Decision:** Keep single namespace for now. Benefits:
- Simple — one file per locale, one `t()` call pattern
- No namespace prefix overhead in component code
- All keys loaded on app init (acceptable at ~900 keys)

**Future consideration:** If keys exceed ~2000, consider splitting into:
- `common` — shared UI elements (nav, buttons, errors)
- `cases` — case-specific strings
- `community` — community/forum strings
- `admin` — admin-only strings (lazy-loaded)

---

## Translation Key Naming Conventions

### Structure

Keys use **dot-notation** organized by domain:

```
{domain}.{page/component}.{element}
```

### Examples

```json
{
  "nav.home": "Home",
  "nav.campaigns": "Campaigns",
  "nav.clinics": "Clinics",
  "cases.create.title": "Report an Animal",
  "cases.create.photoLabel": "Upload Photos",
  "cases.status.critical": "Critical",
  "cases.status.urgent": "Urgent",
  "donations.checkout.amount": "Donation Amount",
  "donations.checkout.success": "Thank you for your donation!",
  "common.loading": "Loading...",
  "common.error": "Something went wrong",
  "common.retry": "Try Again",
  "common.optional": "Optional"
}
```

### Naming Rules

1. **Lowercase, dot-separated** — `nav.home`, not `Nav.Home` or `nav-home`
2. **Domain-first** — group by feature domain (`cases.*`, `donations.*`, `community.*`)
3. **Action verbs for CTAs** — `cases.create.submit`, `donations.checkout.pay`
4. **Status labels** — `cases.status.critical`, `cases.status.urgent`
5. **No interpolation in keys** — keys are static identifiers, interpolation goes in values
6. **`common.*` for shared strings** — `common.loading`, `common.error`, `common.cancel`, `common.save`
7. **Fallback text in `t()` calls** — always provide a default: `t("nav.home", "Home")`

### Interpolation

Use i18next interpolation for dynamic values:
```typescript
t("donations.amount", { amount: "€50" })
// Key: "donations.amount": "Donate {{amount}}"
```

Plural forms:
```typescript
t("cases.count", { count: 5 })
// Keys: "cases.count_one": "{{count}} case", "cases.count_other": "{{count}} cases"
```

---

## Fallback Chain

```
User's selected language (e.g., "bg")
  └─→ Falls back to: English ("en")
       └─→ Falls back to: Key name (SHOULD NEVER HAPPEN)
```

### Missing Key Handling

**Current problem (F2):** When a key is missing from a locale file, i18next displays the raw key string (e.g., `cases.filter.nearMe`) in the UI. Console floods with 60+ `missingKey` warnings per page.

**Required behavior:**
1. Missing key → show EN fallback value (never the raw key)
2. Log missing key to console in dev mode (already configured with `debug: true` in dev)
3. CI check catches missing keys before they reach production

### CI Key Coverage Check

Create a script that compares all locale files against the EN baseline:

```bash
# scripts/check-i18n-coverage.sh
# For each locale: diff keys against en/translation.json
# Fail if any locale is missing keys
# Output: list of missing keys per locale
```

**Integration:**
- Run in CI on every PR that touches `public/locales/` or adds `t()` calls
- Fail the build if any locale file is missing keys present in EN
- Report coverage percentage per locale

---

## Locale File Organization

### Directory Structure

```
public/
  locales/
    en/
      translation.json    ← 936 keys (baseline)
    bg/
      translation.json    ← 925 keys (11 short)
    de/
      translation.json    ← 877 keys (59 short)
    ru/
      translation.json    ← 877 keys (59 short)
    uk/
      translation.json    ← 877 keys (59 short)
```

### File Format

Standard flat JSON with nested dot-notation expanded:
```json
{
  "nav": {
    "home": "Home",
    "campaigns": "Campaigns",
    "clinics": "Clinics",
    "partners": "Partners"
  },
  "cases": {
    "create": {
      "title": "Report an Animal",
      "submit": "Publish Case"
    }
  }
}
```

### Key Propagation Workflow

When adding new keys:
1. Add key + English value to `en/translation.json`
2. Add Bulgarian translation to `bg/translation.json`
3. Add placeholder entries to `de/`, `ru/`, `uk/` (can be EN value with `[NEEDS TRANSLATION]` prefix during dev)
4. CI check will flag any missing keys

---

## Hardcoded Strings (F2 Remediation)

### Current Problem

The mobile audit found a chaotic mix of languages on every page:
- **Nav labels:** Bulgarian (Начало, Кампании, Клиники, Партньори)
- **Section headers:** English ("Urgent Updates", "Cases Needing Help")
- **Filter pills:** Mixed ("Urgent" + "Near Me" in EN, "София" in BG)
- **CTAs:** Bulgarian ("Допринеси", "Подкрепи") on English cards
- **Stats labels:** Bulgarian ("Събрани", "Цел") inside English cards

Root cause: Many components use hardcoded English strings instead of `t()` calls.

### Remediation Priority

1. **Home page** — section headers, filter labels, CTAs
2. **Campaigns** — section headers, status labels
3. **Community** — thread labels, action labels
4. **Clinics** — filter labels, section headers
5. **Partners** — filter labels, stats labels
6. **All pages** — any remaining hardcoded strings

### Detection

Search for potential hardcoded strings:
```bash
# Find JSX string literals that should be translated
grep -rn '"[A-Z][a-z]' src/pages/ src/components/ --include='*.tsx' \
  | grep -v 'import\|from\|className\|src=\|href=\|alt=\|type='
```

### Enforcement

Future lint rule (ESLint plugin) to flag JSX text nodes that aren't wrapped in `t()`:
- Scope: `src/pages/**/*.tsx`, `src/components/**/*.tsx` (excluding `components/ui/`)
- Severity: Warning (upgrade to error after full remediation)

---

## UGC Machine Translation System

### Architecture

Server-side translation via Convex actions, using DeepL API:

```
User views case in different locale
  └─→ Client calls: requestCaseTranslations({ caseId, targetLocales? })
       └─→ Mutation: checks rate limit (20/day per user)
            └─→ Scheduler: runs translateCase action per locale
                 └─→ DeepL API: translates title, description, story
                      └─→ Mutation: saves to case.translations[locale]
                           └─→ Mutation: updates case.translationStatus[locale]
```

### Data Model

**Cases table translation fields** (from `convex/schema.ts`):

```typescript
// Cached machine translations, keyed by target locale
translations: v.optional(v.record(v.string(), v.object({
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  story: v.optional(v.string()),
  translatedAt: v.number(),
  provider: v.string(),
  sourceHash: v.string(),      // FNV-1a hash of source text
}))),

// Per-locale status tracking
translationStatus: v.optional(v.record(v.string(), v.object({
  status: v.union(v.literal("pending"), v.literal("done"), v.literal("error")),
  updatedAt: v.number(),
  error: v.optional(v.string()),
}))),

// Source content language
language: v.optional(v.string()),  // ISO locale: "bg", "en", "de"
```

**Rate limiting table:**

```typescript
translationRateLimits: defineTable({
  clerkId: v.string(),
  day: v.number(),        // UTC day key (ms / 86400000)
  count: v.number(),
  updatedAt: v.number(),
}).index("by_clerk_day", ["clerkId", "day"])
```

### Caching Strategy

- **Source hash:** FNV-1a hash of `{ title, description, story }` JSON
- **Cache hit:** If existing translation has same `sourceHash`, skip retranslation
- **Cache invalidation:** When source content changes, hash changes → retranslation triggered
- **Dedup:** If status is already `pending`, skip scheduling

### Rate Limiting

| Parameter | Default | Env Var |
|-----------|---------|---------|
| Daily limit per user | 20 requests | `TRANSLATION_DAILY_LIMIT_PER_USER` |
| Allow anonymous | false | `TRANSLATION_ALLOW_ANON` (`"1"` or `"true"`) |
| Target locales | `["bg", "de", "en", "ru", "uk"]` | `TRANSLATION_TARGET_LOCALES` (comma-separated) |

### Translation Provider

| Provider | Status | Env Var |
|----------|--------|---------|
| DeepL | Active (only supported) | `DEEPL_AUTH_KEY` (required), `DEEPL_API_URL` (optional, defaults to free tier) |

### UX States

| State | UI Treatment |
|-------|-------------|
| No translation available | Show original language content with "Translate" button |
| Translation pending | Show "Translating..." indicator, original content visible |
| Translation complete | Show translated content, toggle to view original |
| Translation error | Show original content, "Translation unavailable" note |
| Quota exceeded | "Translation quota exceeded. Try again tomorrow." |

### Skip Conditions

Translation is skipped when:
- Source locale equals target locale
- Existing translation has matching source hash (up to date)
- Status is already `pending` (in progress)

---

## Language Detection

### Current Implementation

`LanguageDetectionBanner` component:
1. Mounted globally in `App.tsx`
2. Fetches `https://ipapi.co/json/` to detect user's country
3. Maps country to language suggestion
4. Shows banner: "Would you prefer [Language]?"
5. User can accept or dismiss

### P1 Problem: CORS Failures

**Issue:** `ipapi.co/json/` blocks cross-origin requests from the client. Every page load triggers a CORS error in console. The effect runs on all routes including `/presentation`, `/sign-in`, etc.

### Required Fix

| Option | Approach | Recommendation |
|--------|----------|----------------|
| **A: Remove IP detection** | Rely on browser language (`navigator.language`) only | **Recommended for MVP** — simpler, no CORS, no external dependency |
| B: Server-side proxy | Move IP lookup to a Convex HTTP action | Adds complexity, IP detection isn't critical |
| C: CORS-friendly API | Switch to a geo API that supports CORS or use a paid plan | Adds cost, still fragile |

### Recommended Detection Flow

```
1. Check localStorage for saved preference
2. Check URL querystring (?lng=bg)
3. Check navigator.language / navigator.languages
4. Default to 'en'
```

This is exactly what the i18next `LanguageDetector` already does (detection order: `localStorage → querystring → navigator`). The `LanguageDetectionBanner` adds an IP-based geo layer on top — this should be removed or deferred.

### Session Caching

If language detection banner is retained:
- Cache the detection result in `sessionStorage`
- Don't re-run detection on every page load
- Guard against running on non-user routes (`/presentation`, `/partner`, `/sign-in`, `/sign-up`)

---

## Language Switching

### User Flow

1. User navigates to Settings (`/settings`)
2. Language selector shows 5 supported languages
3. User selects new language
4. i18next switches locale
5. UI re-renders with new locale strings
6. Choice saved to `localStorage` (key: `i18nextLng`)
7. Language persists across sessions

### URL-Based Override

Adding `?lng=bg` to any URL forces that locale for the session. Useful for:
- Sharing links in a specific language
- Testing translations
- Customer support

---

## Date, Number, and Currency Formatting

### Current State

No locale-aware formatting is implemented. Numbers and dates use JavaScript defaults.

### Target

| Type | Format | Implementation |
|------|--------|----------------|
| Dates | Locale-aware (`Intl.DateTimeFormat`) | `new Intl.DateTimeFormat(i18n.language)` |
| Numbers | Locale-aware (`Intl.NumberFormat`) | `new Intl.NumberFormat(i18n.language)` |
| Currency | EUR primary, locale-formatted | `new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })` |
| Relative time | "2 hours ago", "yesterday" | `Intl.RelativeTimeFormat` or i18next `formatDistance` |

---

## RTL Considerations

### Current State

All 5 supported languages are LTR. No RTL support exists.

### Future Languages

If Arabic, Hebrew, or other RTL languages are added:

| Requirement | Implementation |
|-------------|----------------|
| `dir="rtl"` on `<html>` | Set dynamically based on current locale |
| CSS logical properties | Replace `ml-4` with `ms-4`, `pl-4` with `ps-4` |
| Icon mirroring | Directional icons (arrows, chevrons) need mirroring |
| Layout mirroring | Flexbox `flex-row` → `flex-row-reverse` via `[dir=rtl]` |
| Text alignment | `text-left` → `text-start` |

**Decision:** RTL is out of scope for launch. Document requirements for future implementation.

---

## Accessibility

### Language Attribute

The `<html>` element MUST have a `lang` attribute matching the active locale:
```html
<html lang="bg">
```

This should update dynamically when the language changes. i18next-browser-languageDetector can handle this via the `htmlTag` detection option.

### Screen Reader Language

Assistive technologies use the `lang` attribute to select the correct speech synthesis voice. Incorrect `lang` causes garbled pronunciation.

### Language Switcher

The language selector MUST:
- Show language names in their native script: "English", "Български", "Українська", "Русский", "Deutsch"
- Be accessible via keyboard navigation
- Announce the selected language to screen readers

---

## Non-Functional Requirements

- **Performance:** Locale files are loaded asynchronously via HTTP backend. EN is ~936 lines (~30KB uncompressed, ~8KB gzipped). Acceptable for initial load.
- **Caching:** Locale files should be cached with appropriate `Cache-Control` headers. i18next HTTP backend supports `cacheHitMode`.
- **Translation latency:** DeepL API calls take ~500ms–2s per text. Multiple fields (title, description, story) are translated in parallel via `Promise.all`.
- **Rate limit cost:** With 20 requests/user/day, max DeepL cost per user is ~$0.01/day on the free tier.
- **Bundle size:** i18next + react-i18next + http-backend + browser-languagedetector adds ~20KB gzipped.

---

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| User rapidly switches languages | i18next handles this gracefully — last selection wins |
| Translation quota exhausted | Error: "Translation quota exceeded. Try again tomorrow." |
| DeepL API down | Translation status set to `error`, original content shown, retry available |
| Malicious content in translations | DeepL doesn't inject content — output is a translation of input. Content moderation handles source text. |
| Very long text (>5000 chars) | DeepL handles up to 128KB per request — not a practical concern |
| Locale file corruption | Fallback to EN catches any single-locale corruption |
| `navigator.language` returns unsupported locale (e.g., "fr") | Falls back to EN via `fallbackLng: 'en'` |
| Concurrent translation requests for same case | `pending` status check prevents duplicate scheduling |

---

## Open Questions

1. **Namespace splitting:** Keep single `translation` namespace or split by domain? Monitor key count — split if it exceeds ~2000 keys.
2. **Machine translation for community posts:** Currently only cases are translated. Should community posts also support machine translation?
3. **Translation review:** Should verified clinics or moderators be able to review/correct machine translations?
4. **`LanguageDetectionBanner`:** Remove entirely (rely on browser detection) or fix with server-side proxy?
5. **Locale-aware formatting:** Implement `Intl.DateTimeFormat` / `Intl.NumberFormat` globally or per-component?
6. **Missing key CI enforcement:** Should CI fail the build on missing keys, or only warn? Recommend: warn during remediation, fail after full coverage is achieved.
7. **Translation cost at scale:** Monitor DeepL free tier limits (500K chars/month). Plan upgrade path to paid tier when needed.
