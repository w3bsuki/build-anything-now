# Pawtreon — Rules

> **Purpose:** Trust/safety guardrails, UX rules, and non-negotiable constraints.  
> **Last updated:** 2026-01-23

---

## Core Principle

> **Trust is the product.** Every rule exists to prevent scams, protect users, and maintain credibility.

---

## Trust & Safety

### Verification Ladder
Every case has a verification status (shown in feed + detail):

| Status | Meaning | Donation Allowed |
|--------|---------|------------------|
| **Unverified** | Default for new cases | Soft-gated (warning) |
| **Community Verified** | Multiple trusted members corroborate | Yes |
| **Clinic Verified** | Verified clinic confirms treatment | Yes |

Minimum UI: badge + "What this means" explainer tooltip.

### Money Rules
1. **No dead CTAs** — Donate always opens a real flow
2. **Donation gating** — Unverified + high-risk → blocked/warned until reviewed
3. **Receipts required** — Every donation generates a receipt
4. **No fake amounts** — Never show inflated/fake donation counts

### Privacy & PII
1. **No PII in public APIs** — Never return email/phone in public queries
2. **Volunteer availability is opt-in** — Default status is `offline`
3. **Location safety** — Show city/neighborhood, not precise coordinates
4. **No "home address" patterns** — Report doxxing, blur exact locations

### Anti-Scam Primitives
1. **Report button everywhere** — Case, post, profile, comment
2. **Moderation queue** — Manual review (ops is fine for MVP)
3. **Duplicate detection** — pHash for images, pattern scoring
4. **External source attribution** — Links as evidence, not scraped media

---

## AI Safety Constraints

### "List with AI" (Case Creation)
- **Human-in-the-loop** — Never auto-publish
- **Confidence as hint** — Not shown to donors
- **Same trust gates** — New account + reused images + high goal = flagged

### "Need Help Now" (Triage Assistant)
- **Non-diagnostic only** — No diagnoses, no treatment plans
- **No dosing** — Never suggest medication amounts
- **No invasive procedures** — No surgery/wound care instructions
- **Emergency escalation** — Always show "if life-threatening, contact vet NOW"

---

## UX Rules

### No Dead Ends
- Every nav link lands on a real screen or clear "Coming Soon"
- Every CTA does something (no broken buttons)
- No 404s in normal user flows

### No Fake Trust
- Demo/preview content must be labeled
- Verification badges must reflect real status
- Don't show fake social proof (followers, donations, likes)

### Mobile-First
- Design for phone first, scale up
- Touch targets minimum 44x44px
- Inputs must be `text-base` (prevents iOS zoom)

### Accessibility
- Every interactive element needs:
  - Visible hover/active state
  - Focus ring (`focus:ring-2 focus:ring-ring`)
  - Accessible label (if icon-only)

---

## Security Rules

### Authentication
- All mutations require auth (no anonymous writes)
- No "dev-only" endpoints in production
- No identity-less mutation paths (email/clerkId fallbacks)

### Authorization
- Every mutation that accepts an `id` must enforce ownership
- Admin functions use `internalMutation` (not client-callable)
- Rate limit abuse-prone endpoints (reports, uploads, AI)

### Data
- Never call AI providers from client (use Convex actions)
- Webhook signatures must be verified
- Audit trail for money-related operations

---

## Social Import Policy

We do **consolidation**, not scraping:

| Phase | Approach |
|-------|----------|
| **Phase 0** | Link cards — paste URL, render preview, link out |
| **Phase 1** | Official embeds — only where platform allows |
| **Phase 2** | Import to Pawtreon — user uploads, we store with attribution |

**Rule:** Never scrape/cache private media from FB/IG.

---

## Enforcement

When in doubt:
1. **Block first, review later** — For money/safety issues
2. **Warn, don't block** — For low-risk edge cases
3. **Log everything** — Audit trail for disputes
4. **Escalate to human** — When automated signals conflict

---

## Checklist (Before Shipping)

Before any feature touches money, auth, or PII:

- [ ] Ownership checks on all mutations
- [ ] No PII in public query responses
- [ ] Rate limiting configured
- [ ] Admin endpoints are internal-only
- [ ] Audit logging for sensitive operations
- [ ] Emergency escalation paths exist
