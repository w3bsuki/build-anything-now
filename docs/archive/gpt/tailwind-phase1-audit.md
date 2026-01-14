## Tailwind Lane Phase 1 Audit — 2026-01-13

### Critical (blocks Phase 2)
- [ ] Mixed/duplicated theme tokens → `src/index.css` → Consolidate to a single token system (prefer OKLCH in Tailwind v4), remove duplicate `:root` definitions, and ensure semantic status tokens (`success/warning/urgent/recovering/adopted`) have both light + dark values.
- [ ] Inconsistent token mapping functions → `src/index.css` (`@theme inline`) → Ensure `--color-*` mappings match the actual token format (don’t `hsl(var(--x))` if `--x` is `oklch(...)`; either keep those tokens in numeric HSL form or convert mappings to plain `var(--x)`).
- [ ] Shadcn animation utilities appear unconfigured → `src/components/ui/*` (usage: `animate-in`, `fade-in-*`, `slide-in-*`) + `src/index.css` → Add `tailwindcss-animate` (or remove the animation utility usage). In Tailwind v4, prefer `@plugin "tailwindcss-animate";` in `src/index.css` once the package is installed.
- [ ] Font tokens conflict (Nunito vs Montserrat vs Geist) → `src/main.tsx`, `src/fonts.css`, `src/index.css` → Pick one body font (recommend: keep Nunito since it’s already imported) and make `--font-sans` consistent across light/dark.

### High (do in Phase 2)
- [ ] Gradients used in UI surfaces → `src/index.css` (`.text-gradient`, `.sticky-donate`) and pages (`src/pages/Profile.tsx`, `src/pages/MyDonations.tsx`, `src/pages/Community.tsx`, `src/pages/CampaignProfile.tsx`, `src/pages/VolunteerProfile.tsx`) → Decide “no gradients” vs “allowed”. If “no gradients”, replace with token-based solid/alpha surfaces.
- [ ] Excessive arbitrary sizing → multiple files (examples: `w-[260px]`, `text-[10px]`, `z-[70]`, `top-[6.5rem]`, `w-[18px]`) → Replace with Tailwind scale utilities where possible; keep only the few necessary for Radix positioning.
- [ ] Hardcoded colors in UI → `src/App.css`, `src/components/ui/chart.tsx` (e.g. `#ccc`, `#fff`) → Replace with token-driven colors or CSS variables.

### Deferred (Phase 3 or backlog)
- [ ] Normalize custom component classes → `src/index.css` (`.btn-donate`, `.badge-*`, `.card-hover`) → Consider moving to component variants (CVA) only if it reduces duplication; otherwise keep minimal.
- [ ] Define a single spacing + typography system and document it → `gpt/plan/04-COMPONENT-STANDARDS-GUIDE.md` → Use this to systematically remove leftover arbitrary text sizes.
