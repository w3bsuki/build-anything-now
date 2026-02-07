# Localhost 8080 Visual Audit

- Owner: Product + Frontend
- Auditor: Codex (Playwright MCP)
- Audit date: 2026-02-06
- Environment: `http://localhost:8080` (desktop + mobile viewports)

## Scope
This audit covers visual rendering and runtime stability of:
- `/`
- `/campaigns`
- `/clinics`
- `/partner`
- `/presentation`

## Capture Artifacts

| Route | Desktop | Mobile | Notes |
|---|---|---|---|
| `/` | `docs/design/visual-audit-home-desktop.png` | `docs/design/visual-audit-home-mobile.png` | Renders, but visual density and skeleton-heavy first fold reduce trust clarity. |
| `/campaigns` | `docs/design/visual-audit-campaigns-desktop.png` | `docs/design/visual-audit-campaigns-mobile.png` | Best visual consistency in current build. |
| `/clinics` | `docs/design/visual-audit-clinics-desktop.png` | `docs/design/visual-audit-clinics-mobile.png` | Renders well; cards are readable and compact. |
| `/partner` | `docs/design/visual-audit-partner-desktop.png` | `docs/design/visual-audit-partner-mobile.png` | Clean first slide; desktop has excessive whitespace above fold. |
| `/presentation` | `docs/design/visual-audit-presentation-desktop.png` | `docs/design/visual-audit-presentation-mobile.png` | Captured as white screen in this run; route is unstable. |

## Executive Summary
1. Core app routes render, but `/presentation` is unstable and can collapse into a white screen.
2. Runtime console is noisy with repeated CORS failures from IP geolocation requests.
3. A trust-component query mismatch is the most likely technical reason presentation slides crash.

## Findings (By Severity)

### P0 - Presentation deck can white-screen due to invalid report query input
- Impact: Investor/demo surface can fail during navigation and appear broken.
- Evidence:
  - White captures: `docs/design/visual-audit-presentation-desktop.png`, `docs/design/visual-audit-presentation-mobile.png`
  - Console log: `C:\Users\radev\AppData\Local\Temp\playwright-mcp-output\1770355160438\console-2026-02-06T05-42-08-415Z.log` includes `ArgumentValidationError` for `reports:getCasePendingReportStatus`.
  - `src/components/trust/ReportedBadge.tsx:24` always queries Convex with `caseId as Id<"cases">`.
  - `src/components/CaseCard.tsx:185` always renders `ReportedBadge`.
  - `src/data/presentationData.ts:12` uses mock IDs like `case-1` (not Convex document IDs).
- Recommendation:
  1. Add guard in `ReportedBadge` to skip query unless `caseId` matches Convex ID format.
  2. Add `showOpsBadges?: boolean` prop on `CaseCard` and disable it for presentation/mock data.
  3. Add local error boundary around deck "real UI" slides so one widget cannot blank the route.

### P1 - Global language detection call triggers repeated CORS failures
- Impact: Console noise on all pages, avoidable network failures, and debugging friction.
- Evidence:
  - Multiple logs report `Access to fetch at 'https://ipapi.co/json/' ... blocked by CORS policy`.
  - `src/components/LanguageDetectionBanner.tsx:66` fetches `https://ipapi.co/json/`.
  - `src/components/LanguageDetectionBanner.tsx:43` effect runs detection without route guard.
  - `src/App.tsx:59` mounts `LanguageDetectionBanner` globally.
- Recommendation:
  1. Early-return in effect when route is `/presentation`, `/partner`, `/sign-in`, `/sign-up`.
  2. Move geolocation lookup behind a server endpoint/proxy with CORS control.
  3. Cache detection result and avoid re-fetch during same session.

### P2 - Home feed hierarchy is visually heavy on first fold
- Impact: "Trust-first" message is diluted by high card density and repeated loading placeholders.
- Evidence:
  - `docs/design/visual-audit-home-mobile.png` shows dense stacked cards and many repeated skeleton zones.
  - `docs/design/visual-audit-home-desktop.png` uses a very narrow central content rail with large unused side space.
- Recommendation:
  1. Reduce initial card count and skeleton placeholders above fold.
  2. Promote one clear "primary urgent case" module before list density.
  3. Improve desktop width strategy (wider grid or two-column featured + list composition).

## Positive Notes
1. Campaign and clinic surfaces are the most visually stable and readable (`/campaigns`, `/clinics`).
2. Mobile bottom navigation remains clear and touch-friendly in captured states.
3. Partner pitch visual identity is clean and brand-consistent on mobile.

## Next Validation Pass (After Fixes)
1. Re-run screenshots on all five routes with desktop (`1440x900`) and mobile (`390x844`) viewports.
2. Confirm zero `ArgumentValidationError` from `reports:getCasePendingReportStatus`.
3. Confirm no frontend CORS errors from language detection flow.
4. Re-capture `/presentation` and ensure non-white, deterministic output.
