# Pawtreon Trust & Safety (Single Source of Truth)

Pawtreon is a fundraising product. **Trust is the product.**

## Goals
1. **Stop scams before money flows** (risk signals + gating + human review).
2. **Make outcomes visible** (updates, receipts, verification).
3. **Keep users safe** (especially around medical “help” guidance).

## Verification ladder (user-facing)
Every case has a verification status shown in feed + detail:
1. **Unverified** — default for new cases.
2. **Community verified** — multiple trusted members corroborate evidence.
3. **Clinic verified** — a verified clinic confirms intake / treatment / updates.

Minimum UI: badge + “What this means” explainer.

## Money rules (MVP posture)
Before real checkout ships, we still model the rules:
- **No dead CTAs**: Donate always opens a flow (even if “preview”).
- **Donation gating (recommended):**
  - Unverified + high-risk → donations blocked (or soft-blocked) until reviewed.
  - Clinic verified → donations allowed immediately.

## Privacy & PII rules (MVP gate)
Pawtreon involves identity + location + money. Default posture: **share less**.

- **No PII in public APIs:** no public query returns user email/phone; public profile shapes must be explicit and minimal.
- **Volunteer availability is opt-in:** availability (`available/busy/offline`) must be user-controlled; default is `offline`.
- **Location safety:**
  - Public UI defaults to **city + neighborhood**, not precise coordinates.
  - If maps ship, show **approximate** location by default (privacy radius / grid snap).
  - Never display “home address” patterns; add reporting for doxxing.

## Anti-scam primitives (MVP minimum)
1. **Report button everywhere** (case, post, profile).
2. **Moderation queue** (manual ops is fine initially).
3. **Duplicate image detection** (pHash) + suspicious pattern scoring.
4. **External source attribution** (links as evidence, not scraped media).

## Social import / embeds (policy-safe approach)
We do **consolidation**, not scraping:
1. **Phase 0: Link cards** — user pastes a FB/IG URL, we render a preview and link out.
2. **Phase 1: Official embeds** — only where allowed and stable.
3. **Phase 2: Import into Pawtreon** — users upload media + we store the durable record with attribution.

Rule: avoid scraping/caching private media from FB/IG.

## AI features (safety constraints)
### “List with AI”
- Human-in-the-loop (never auto-publish).
- Show confidence as a hint; not visible to donors by default.
- Run the same trust gates (new account + reused images + high goal, etc.).

### “Need help now”
- Non-diagnostic guidance only.
- No dosing, no invasive procedures.
- Always include “if life-threatening, contact a vet/emergency now” escalation UX.

## Security posture (engineering)
### Current status
- Core ownership checks exist in multiple Convex mutations (see `convex/lib/auth.ts` + usage in `convex/*`).
- **MVP gate:** remove any “dev-only” public endpoints and any identity-less mutation paths (email/clerkId fallbacks) before real users.

### Ongoing rules
- Any mutation that accepts an `id` must enforce ownership/authorization (no IDOR).
- “Admin/seed” functions must be `internalMutation` or admin-gated.
- Never call AI providers from the client; use Convex actions/server only.
- Rate limit abuse-prone endpoints (AI, reporting, uploads).

## Reference docs (archived)
Full, older planning docs live in `docs/archive/legacy/` after the docs consolidation.
