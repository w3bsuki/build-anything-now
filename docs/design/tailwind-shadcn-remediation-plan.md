# Tailwind + shadcn Remediation Plan

- Owner: Frontend engineering
- Update cadence: Weekly during Phases 0-4
- Last updated: 2026-02-06

## Objectives
1. Remove legacy starter styling artifacts.
2. Normalize semantic token usage.
3. Reduce palette utility sprawl in trust-critical surfaces.
4. Keep visual language consistent with Pawtreon brand (teal + coral accents).

## Rules
- Use semantic tokens (`bg-background`, `text-foreground`, etc.) for app surfaces.
- Restrict direct palette classes to approved marketing/presentation areas.
- Keep gradients minimal on trust-critical pages.
- Keep `components/ui/*` primitive and app-agnostic.

## Priority Migration Queue
1. Core trust flows:
   - `src/pages/AnimalProfile.tsx`
   - `src/pages/CreateCase.tsx`
   - `src/pages/Account.tsx`
2. Core browse surfaces:
   - `src/pages/IndexV2.tsx`
   - `src/components/CaseCard.tsx`
   - `src/components/UpdatesTimeline.tsx`
3. Directory and partner flows:
   - `src/pages/Clinics.tsx`
   - `src/pages/Partners.tsx`
4. Marketing/presentation review:
   - `src/pages/Presentation.tsx`
   - `src/pages/PartnerPresentation.tsx`

## Known Debt (Baseline)
- Legacy starter styles in `src/App.css`.
- Hardcoded palette utilities across partner/presentation/onboarding surfaces.
- Inconsistent font token references (`Open Sans` vs docs baseline).

## Definition of Done
- No active dependency on legacy Vite starter styles.
- Core app flows rely on semantic tokens.
- Lint/type/build pass after each migration batch.
