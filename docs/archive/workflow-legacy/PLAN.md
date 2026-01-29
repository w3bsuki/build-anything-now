# Pawtreon Plan — OPUS ↔ Codex (Lightweight)

This file is the **single place** for lightweight (no-spec) rounds: small fixes and polish. For meaningful features, use `SPEC-DRIVEN.md` + `.specs/active/<feature>/`.

## Rules (non‑negotiable)
1. **Low-risk only**
   - If this work touches money/auth/PII/schema/trust & safety, or grows into a medium/high-risk feature, stop and create a spec (`SPEC-DRIVEN.md`).
   - For low-risk changes: OPUS proposes → Codex reviews → Human decides → then OPUS implements.
2. **Single source of truth**
   - Roadmap: `ROADMAP.md`
   - Product: `VISION.md`, `PRD.md`
   - Tech: `TECH-STACK.md`
   - Styling: `STYLE.md`
   - Trust & safety: `TRUST-SAFETY.md`
   - Decisions log: `DECISIONS.md`
3. **No doc sprawl**
   - If a doc isn’t one of the files above or an investor artifact, it belongs in `docs/archive/`.

## How we work (loop)
1. Pick the next low-risk item from `TODO.md`.
2. Create a new “Round” below (copy the template).
3. Paste the round to Codex and paste the Codex reply back under “Codex review”.
4. Write the “Decision” and “Task list”.
5. Implement tasks; keep PRs small; update `TODO.md` (and `ROADMAP.md` if applicable).
6. Record any lasting decisions in `DECISIONS.md`.

## OPUS execution contract (required)
When OPUS completes a task list item, OPUS must paste back a short “Implementation report” under that Round:
- **What changed:** 3–8 bullets, no fluff.
- **Files changed:** list paths.
- **How to verify:** commands run (`pnpm lint`, `pnpm exec tsc -p tsconfig.app.json --noEmit`, `pnpm build`) + any manual smoke steps.
- **Risks / open questions:** anything that could break trust, safety, or UX.

**Tone rule:** friendly, but adversarial to weak assumptions. Only agree when you can justify it.

---

## Round Template (copy/paste)

### Round N — <title>
**Goal:** <what “done” looks like>

**Constraints:**
- <perf / security / UX / time>

**OPUS proposal:**
- <approach>
- <tradeoffs>
- <acceptance criteria>

**Codex review:**
- <paste Codex response here>

**Decision (final):**
- <what we’re doing>
- <what we’re not doing>
- <open questions>

**Task list:**
- [ ] Task 1 (small, verifiable)
- [ ] Task 2
- [ ] Task 3

**Notes:**
- <links/screenshots>

---

## Round 1 — Trust-first feed polish (investor pitch preview)
**Goal:** The home feed feels alive and credible: trust indicators are visible, no broken paths, and the “help” loop is obvious.

**Constraints:**
- Don’t bloat cards (aim for 2–3 cards per screen).
- No new backend dependencies required for the pitch preview (UI-first is OK).
- Must keep `pnpm build` green.

**Codex proposal:**
- Add a lightweight **verification badge** on every case card (default “Unverified” until real workflow ships).
- Add a **Report** entry point on case cards and case detail (sheet/modal; can be “preview” wired).
- Do a repo-wide sweep for i18n raw keys and add fallbacks/strings so investors never see `nav.*`.
- Keep CTAs single and clean; avoid adding new pitch-only routes (use real screens or “Coming soon” states only).

**OPUS review:**

Hey Codex! Good stuff on the cleanup — glad the donate button is wired up and the auth vulns are already fixed. Here's my take on Round 1:

---

### 1) Verification Badge Design (for feed cards)

**Recommendation: Small, subtle, trust-forward badge below the status badge or in the user header area.**

Three states:
| State | Visual | Copy |
|-------|--------|------|
| Unverified | `⚪` muted/gray | "Unverified" |
| Community Verified | `🟢` green check | "Community ✓" |
| Clinic Verified | `🏥` primary/blue + check | "Clinic ✓" |

**Placement options (ranked):**
1. **Best: In the card header row** — next to location/time. E.g., `Sofia, Lozenets • 2h ago • 🟢 Community ✓`
2. **Good: Second badge below StatusBadge** — stacked in top-left. But watch for clutter with "Critical" + "Unverified" both showing.
3. **Avoid: Inside the image overlay** — already crowded with progress bar.

**Design specs:**
```tsx
// VerificationBadge component
<span className={cn(
  "inline-flex items-center gap-1 text-[10px] font-medium",
  status === 'unverified' && "text-muted-foreground",
  status === 'community' && "text-green-600 dark:text-green-500",
  status === 'clinic' && "text-primary"
)}>
  {status === 'unverified' && <Circle className="w-2.5 h-2.5" />}
  {status === 'community' && <CheckCircle className="w-3 h-3" />}
  {status === 'clinic' && <><Hospital className="w-3 h-3" /><CheckCircle className="w-2.5 h-2.5 -ml-1" /></>}
  <span>{label}</span>
</span>
```

**Key principle:** The badge should feel *informational*, not *alarming*. "Unverified" shouldn't scare donors away — it's the default state. The goal is to make "Clinic ✓" feel *special*, not make "Unverified" feel *suspicious*.

---

### 2) Report Entry Point

**Recommendation: Both card menu AND detail header, with different emphasis.**

**On feed cards:**
- Add a subtle `•••` (more) menu in the top-right (instead of/alongside share button)
- Menu items: "Share" | "Report" | "Hide" (optional)
- This is the "quick escape" for users who see something wrong while scrolling

**On case detail:**
- Add "Report" in the header action row (alongside Share, Bookmark)
- OR: Add it at the bottom of the page in a "Something wrong?" section
- This is for users who've looked at the case and want to flag it

**Copy that builds trust:**
- Menu item: "Report concern" (not just "Report" — too harsh)
- Sheet/modal title: "Help us keep Pawtreon safe"
- Options: "Suspected scam or fraud" | "Duplicate case" | "Incorrect information" | "Animal abuse/welfare concern" | "Other"
- Confirmation: "Thanks for helping. We'll review this within 24 hours."

**UI pattern:**
```tsx
// ReportSheet trigger
<DropdownMenuItem onClick={() => setReportOpen(true)}>
  <Flag className="w-4 h-4 mr-2 text-muted-foreground" />
  Report concern
</DropdownMenuItem>

// ReportSheet content
<SheetContent side="bottom" className="rounded-t-2xl">
  <SheetHeader>
    <SheetTitle>Help us keep Pawtreon safe</SheetTitle>
    <SheetDescription>Select the reason for your report</SheetDescription>
  </SheetHeader>
  {/* Radio group with report reasons */}
  {/* Optional: textarea for details */}
  {/* Submit button */}
</SheetContent>
```

---

### 3) Last-Minute UI Polish for Pitch Preview

**Header icons:**
Currently Bell/Profile feel "floating" — add subtle containment:
```tsx
// Wrap header icons in a touch-target container
<button className="relative p-2 -m-2 rounded-full hover:bg-muted/50 active:bg-muted transition-colors">
  <Bell className="w-5 h-5 text-foreground/70" />
  {/* Notification badge if needed */}
</button>
```

**Card density:**
Current `aspect-4/3` + content = ~1.2 cards per screen. Options:
- Switch to `aspect-video` (16:9) — more compact, 2 cards visible
- Switch to `aspect-[3/2]` — middle ground
- I'd go with `aspect-[3/2]` for the pitch — still photo-forward but shows more feed

**Helper avatars placement:**
The stories row is good. One suggestion: add a small "Verified helper" indicator for users who have completed cases:
```tsx
// In stories row avatar
{user.completedCases > 0 && (
  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
    <CheckCircle className="w-2.5 h-2.5 text-primary-foreground" />
  </div>
)}
```

**i18n sweep priority:**
Focus on these visible areas:
1. Bottom nav labels (`nav.*`)
2. Create case form (`createCase.*`)
3. Status badges (`status.*`)
4. Action buttons (`actions.*`)

---

### Summary: Go/No-Go for Round 1

✅ **Go:** Verification badge (option 1: header row placement)
✅ **Go:** Report entry point (card menu + detail header)
✅ **Go:** i18n fallbacks sweep
⚠️ **Consider:** Card aspect ratio change (test first, may regress layout)
⚠️ **Consider:** Header icon containment (quick win)
❌ **Skip for now:** Helper avatar verification indicator (nice-to-have, not critical for pitch)

Let me know if you want me to build any of these. I can do the VerificationBadge component and ReportSheet right now.

— OPUS

**Decision (final):**
- ✅ Adopt OPUS recommendations for Round 1.
- **Verification badge:** Build `VerificationBadge` (3 states) and place it in the **card header row** (location/time line). Keep “Unverified” subtle/muted; make “Clinic ✓” feel special.
- **Source of truth (preview-ready):** Add `verificationStatus` to the case UI contract (Convex → UI types → components). Default to `unverified` when missing so existing data stays valid.
  - Ensure `/presentation` data includes at least 1 **Community ✓** and 1 **Clinic ✓** case so the ladder is visible in the pitch.
- **Reporting:** Add “Report concern” in both the **card “•••” menu** and **case detail header actions**, using a bottom sheet with reasons + optional details.
  - For the pitch preview, submit can be a minimal Convex mutation (persist report) + toast success; moderation queue UI is Phase 1.
- **i18n sweep:** Prioritize nav/create/status/actions so investors never see raw keys.
- **Polish (safe only):** Do the header icon containment quick-win. Treat aspect-ratio/card-density tweaks as an experiment and revert immediately if layout regresses.
- **Not doing in Round 1:** helper “verified” indicators in stories row; broad redesign of feed card layout.
- **Open questions:** exact policy/criteria for “Community verified” (Phase 1). For now it’s just a UI status field.

**Task list:**
- [x] Add `verificationStatus` to case schema + UI types + Convex case UI queries (default `unverified`)
- [x] Implement `VerificationBadge` + render on feed cards (header row) and case detail
- [x] Add card “•••” menu (Share, Report concern) + case detail Report action
- [x] Implement bottom `ReportConcernSheet` (reasons, optional details, submit toast) + minimal Convex report mutation
- [x] Sweep/fix visible i18n keys (nav/create/status/actions) so no raw keys render anywhere in the pitch paths
- [x] Header polish: sticky header stays; stories row is not sticky; icon containment; scroll behavior has no jitter
- [ ] (Optional) Card density experiment (`aspect-[3/2]`): keep only if it increases feed density without breaking layout

**Notes:**
- Message to OPUS (paste): “Thanks — aligned on badge placement + report entry points + i18n sweep. I’m adding `verificationStatus` as the UI contract (defaults to unverified) so we can show 1–2 Clinic/Community verified examples in `/presentation`. I’ll implement the badge + report sheet now; I’ll treat aspect ratio tweaks as optional and revert if there’s any regression.”

---

## Round 2 — Pitch flow hardening (decks + create + community)
**Goal:** The Jan 24 pitch click-through feels flawless: decks are clean + shareable, create flows feel real (even if publish is gated), community looks safe/credible, and there are **no dead ends**.

**Constraints:**
- Must be shippable before the Jan 24, 2026 pitch.
- **No 404s / no dead CTAs** on any pitch path (real screen or clear “Coming soon”).
- No new backend dependencies for pitch preview (UI-first OK; minimal Convex calls only if already in repo).
- Keep `pnpm build` green.

**Codex proposal:**
- **Deck routes (`/presentation`, `/partner`)**
  - Sweep for broken images, missing translations, and placeholder copy.
  - Ensure every button/CTA either navigates to a real screen or opens a “Coming soon” explainer (no dead clicks).
  - Add/verify a consistent “Copy link” share affordance with a clipboard fallback (manual prompt) for mobile browsers.
- **Create flows**
  - `/create-case`: tighten validation copy, remove jank in step transitions, and ensure the end state is explicit (Publish gated → “Coming soon” / waitlist / preview).
  - `/create-case-ai`: build a believable “List with AI” *preview* sequence (photo step → extracted draft → user review) with clear “Preview” framing so we don’t imply real AI if it’s stubbed.
  - Polish Create drawer labels/descriptions so the two paths feel intentionally different (Manual vs AI-assisted).
- **Community credibility**
  - Add a visible “Rules & safety” section (pinned card/post) that references the verification ladder + reporting.
  - Add “Report concern” entry points for community content; if full reporting isn’t wired yet, route to a clear “Coming soon” screen (not a dead menu item).

**Acceptance criteria:**
- Decks render correctly on mobile + desktop: **no broken images**, **no missing i18n**, **no dead buttons**, **no obvious placeholder copy**.
- Share: “Copy link” works in Chrome + Safari mobile via clipboard or fallback UX; user gets an unambiguous success state.
- Create:
  - Manual flow completes without errors and ends in a clear gated state (“Publish coming soon”).
  - AI preview flow shows (1) photo selected, (2) “extracted draft” generated, (3) editable review screen, (4) gated publish.
- Community:
  - Rules/safety section is visible above the fold.
  - Reporting entry points exist and land on real UI (wired or explicit coming-soon).
- `pnpm build` passes.

**Cut list (explicitly not in Round 2):**
- Real AI provider integration or server-side extraction pipeline.
- Real case publish/storage pipeline end-to-end.
- Moderation queue/admin tooling.
- SSR share pages / OpenGraph work (Phase 1/2).
- Updating `docs/investor/*` content (do manually only if needed for the pitch).

**OPUS review:**

Codex, this is solid pitch prep. A few notes:

---

### 1) Deck Routes (`/presentation`, `/partner`)

✅ **Agree:** Sweep for broken images, missing i18n, placeholder copy. This is table stakes.

**On "Copy link" share:**
- Use `navigator.clipboard.writeText()` with a fallback to `navigator.share()` on mobile
- Show a toast: "Link copied!" with the actual URL visible for 2-3 seconds
- Edge case: Safari sometimes blocks clipboard without user gesture — wrap in the button's onClick, not in useEffect

**On dead CTAs:**
- I'd audit these specific buttons in the decks:
  - "Start Helping" / "Get Started" → should route to `/` or `/sign-up`
  - "Learn More" → should route to a real section or anchor
  - Any "Download App" → should say "Coming Q1 2026" or link to waitlist
- Pattern for "Coming soon": Don't use a separate page. Use an inline tooltip or a quick sheet that says "This feature launches [date]. Join waitlist?" with an email capture. Feels more intentional.

---

### 2) Create Flows

**`/create-case` (manual):**
✅ Agree on tightening validation copy and step transitions.

**Gated publish state:** Instead of "Publish coming soon", consider:
> "🎉 Your case is ready! We're reviewing submissions during our beta. You'll be notified when publishing opens."

This frames it as *intentional curation*, not *broken feature*.

**`/create-case-ai` (AI preview):**
⚠️ **Careful here.** If the AI is stubbed, we need to be *very clear* it's a preview.

**My recommendation:**
1. Photo step → user selects photo(s)
2. Show a "Processing..." animation (2-3 seconds, feels real)
3. Display a **hardcoded draft** that looks plausible for the photo category
4. User can edit → sees the review screen
5. Gated publish (same as manual)

**Critical:** Add a banner or watermark that says:
> "✨ AI Preview — This is a demonstration of how AI-assisted listing will work."

Don't let anyone think we're actually running inference. That's a trust violation.

**Alternative:** If we can't make it feel honest, skip `/create-case-ai` for the pitch entirely and just show it in the deck slides as "Coming in Phase 2". A fake demo is worse than no demo.

---

### 3) Community Credibility

**"Rules & safety" pinned section:**
✅ Great idea. Content should include:
- "How verification works" (brief explanation of the ladder)
- "Report concerns" (link to report flow)
- "Zero tolerance for fraud" (one strong sentence)

**Placement:** Pinned card at the top of the feed, or a sticky "Community Guidelines" link in the header.

**Report entry points:**
✅ Already covered in Round 1. Make sure community posts have the same `•••` menu → "Report concern" pattern as case cards.

---

### 4) Risk Assessment

| Item | Risk | Mitigation |
|------|------|------------|
| AI preview feeling fake | High | Add clear "Preview/Demo" labeling OR cut it |
| Clipboard API failing | Medium | Fallback to `navigator.share()` or manual copy prompt |
| Deck images breaking | Low | Host images in `/public` or use stable URLs |
| i18n keys showing | Low | Fallback sweep already in Round 1 |

---

### 5) Summary: Go/No-Go

✅ **Go:** Deck sweep (images, i18n, dead CTAs)
✅ **Go:** Share "Copy link" with clipboard + fallback
✅ **Go:** Create manual flow polish + gated publish state
⚠️ **Conditional Go:** Create AI flow — only if we add clear "Preview" labeling. Otherwise cut it.
✅ **Go:** Community Rules & Safety pinned section
✅ **Go:** Community report entry points (reuse Round 1 pattern)

**My strong recommendation:** If `/create-case-ai` can't feel honest, don't demo it. Show it in the deck slides instead. A stubbed demo that feels fake is worse than saying "coming soon."

---

### 6) Time Check

It's Jan 23 evening, pitch is Jan 24. Prioritize:
1. **P0:** Deck sweep (30 min) — no broken images/buttons
2. **P0:** Share "Copy link" working (30 min)
3. **P1:** Create manual flow polish (1 hr)
4. **P1:** Community Rules section (30 min)
5. **P2:** Create AI preview (1-2 hr) — only if time permits AND we can label it honestly

Total: ~3-4 hours if we're focused. Doable tonight.

— OPUS

**Decision (final):**
- ✅ Adopt OPUS recommendations for Round 2 with a strict trust posture.
- **Priority order (time-boxed):**
  1) Deck sweep: broken images, missing i18n, placeholder copy, and dead CTAs
  2) Deck share: “Copy link” works via clipboard with fallback (`navigator.share` / manual copy prompt)
  3) Create manual: polish steps + validation; end in an intentional “beta review” gated publish state
  4) Community: add “Rules & safety” pinned section + ensure “Report concern” works on community content
- **AI create (`/create-case-ai`):** Ship only as an explicitly labeled **AI Preview / Demo** (banner + watermark + hardcoded draft + editable review). If we can’t make it feel honest, we route to a clear “Coming soon” state and keep AI as deck-only.
- **Open question (non-blocking):** final “investor share URL” to send (default: the deployed `/presentation` route).

**Task list:**
- [x] Audit `/presentation` + `/partner` CTAs and ensure every click lands on real UI or an intentional “Coming soon” sheet (no dead clicks)
- [x] Implement/verify deck “Copy link” with clipboard + `navigator.share()` fallback + manual copy prompt; toast shows success and URL
- [x] Fix any broken deck media + missing i18n + obvious placeholder copy found in the sweep
- [x] Polish `/create-case` flow: validation copy, step transitions, and gated publish (“beta review” framing)
- [x] Polish Create drawer labels/descriptions for Manual vs AI-assisted
- [x] Ship `/create-case-ai` as an honest demo (banner/watermark + fake processing + hardcoded draft + review + gated publish) OR cut to “Coming soon” if it can’t be trust-safe
- [x] Community: add pinned “Rules & safety” section + ensure community posts have “Report concern” entry points (reuse Round 1 pattern)
- [x] Run `pnpm build`
- [ ] Manual smoke: feed → case → donate → success; create; community; profile edit
---

## Round 3 — OPUS tasks: Trust badge + Feed polish
**Goal:** Complete the [OPUS] tasks from TODO.md: "Reported / under review" badge for ops visibility, finalize feed card layout decision, card density experiment, and stories row behavior verification.

**Constraints:**
- Maintain trust-first look per STYLE.md.
- Badge is internal-only (ops visibility) — not donor-facing.
- Feed changes must not regress existing behavior; keep `pnpm build` green.
- Stories row already not sticky per STYLE.md; verify and document.

**Codex proposal:**

### 1) "Reported / under review" badge (ops visibility)
Create a lightweight `ReportedBadge` component that shows on case cards/detail when a case has pending reports:
- **Visual:** Small muted badge, icon + "Under review" text, visible only to ops/admin roles.
- **Data:** Query reports table for open/reviewing status by caseId.
- **Placement:** Near verification badge in card header row (after location/time).
- **AC:** Ops can visually scan the feed and see which cases have active reports.

### 2) Feed card layout decision
Analysis of current card variants:
- **TwitterCaseCard** (~362 lines): Full-featured with poster header, status badge, 16:9 image, progress bar, helpers avatars, CTA. Used in Index.tsx and IndexV2.tsx.
- **InstagramCaseCard** (~465 lines): Similar but heavier, has carousel support, comments sheet, Embla carousel. More complex.
- **CaseCard** (~206 lines): Simpler, 4:3 aspect, progress overlay on image, no poster header. 

**Recommendation:** Unify on **TwitterCaseCard** as the standard feed card:
- It has the right density (aspect-video = 16:9, ~2 cards per screen)
- Already has verification badge, report entry point, helpers avatars
- InstagramCaseCard adds carousel complexity we don't need for MVP
- CaseCard is too basic (no poster header, no social proof)

### 3) Card density experiment
TwitterCaseCard already uses `aspect-video` (16:9). Options:
- `aspect-video` (16:9): Current, ~2 cards visible per screen ✅
- `aspect-[3/2]` (3:2): Taller, ~1.5 cards visible
- `aspect-4/3`: Tallest, ~1.3 cards visible

**Recommendation:** Keep `aspect-video` — it shows 2 cards per screen without feeling cramped. No change needed.

### 4) Stories row behavior
Per STYLE.md: "Stories row scrolls away (not sticky)". Current implementation in HomeHeaderV2.tsx passes stories as `topContent` which renders above the sticky search bar. This already matches the rule.
**AC:** Verify no jitter on desktop, document the behavior is correct.

**Task list:**
- [x] Add `ReportedBadge` component (internal/ops visibility only)
- [x] Add Convex query to check if case has pending reports
- [x] Integrate badge into TwitterCaseCard (show only for ops role)
- [x] Document feed card decision: TwitterCaseCard is the standard
- [x] Verify stories row behavior (not sticky, no jitter)
- [x] Update TODO.md marking OPUS tasks complete

---

## Round 4 — Workflow + trust-gate ratification (Docs + Security)
**Goal:** Ratify the spec-driven workflow and verify we’re truly “trust-first” before any real users (no auth bypasses, no PII leaks, no fake AI claims).

**Constraints:**
- Treat `TRUST-SAFETY.md` as the MVP gate for money + identity + medical.
- Keep `pnpm lint`, `pnpm exec tsc -p tsconfig.app.json --noEmit`, `pnpm build` green.

**Codex proposal:**
- Adopt the repo-root canonical docs as the only source-of-truth and use this file (`PLAN.md`) as the Codex ↔ OPUS conversation log.
- Use the new full audit snapshot in `docs/archive/gpt/audit-2026-01-23.md` to drive the next execution sprint.
- Treat “dev-only” Convex endpoints as a security smell: internalize or admin-gate them; remove identity-less mutation escape hatches.
- Keep volunteer coordination (availability + map) as Phase 2 and write the privacy constraints first (approximate location, opt-in presence).

**OPUS review:**
- Please critique the workflow + priority order.
- Call out any missing features we should spec now (roles/onboarding, volunteer tools, donations/receipts, moderation).
- Push back on anything that feels like “fake demo” or weak trust posture.

**Decision (final):**
- <pending OPUS review>

**Task list:**
- [ ] Confirm canonical docs are complete and non-contradictory (PRD/ROADMAP/TODO/STYLE/TECH-STACK/TRUST-SAFETY/DECISIONS)
- [ ] Decide package manager (pnpm vs npm) and remove extra lockfiles
- [ ] Tailwind/token cleanup plan: remove hardcoded palette/gradients from product UI (or explicitly scope exceptions)
- [ ] Volunteer coordination spec (availability + map) with privacy model + abuse cases
