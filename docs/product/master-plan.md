# Pawtreon — Master Plan

> **Owner:** Founders + OPUS  
> **Status:** review  
> **Last updated:** 2026-02-08

---

## Product Thesis

It's winter. Stray animals are freezing, injured, starving. When someone finds a hurt animal on the street, they post on Facebook — but the post gets buried in algorithmic feeds, scammers copy it, donors don't trust it, and the animal doesn't get help fast enough.

**Pawtreon fixes this.**

Pawtreon is a trust-first rescue operating layer for street animals. It combines:

- An **Instagram-like feed** for discovering urgent animal rescue cases — fast, visual, alive
- **Patreon-like recurring support** for rescuers, clinics, and shelters — sustainable funding, not just one-off donations
- A **trust engine** (verification ladder, evidence-based updates, transparent receipts) that makes donors confident their money reaches the animal
- **Local infrastructure** (clinic directory, volunteer coordination, partner network) that turns a social media post into real, coordinated action

Anyone can start help. Verified partners can validate progress. Donors can fund instantly with transparent evidence. The rescue loop closes.

---

## Product North Star

> **When someone finds an injured animal, Pawtreon makes the best next action obvious and fundable within minutes.**

What "best next action" means operationally:

1. **Create a case** — Photos + location + story + urgency level, published in under 3 minutes from a phone on the street
2. **Find the nearest clinic** — Searchable directory with 24/7 filters, verified contact info, one-tap directions
3. **Coordinate volunteer help** — "Who can help nearby?" — transport, fostering, supplies, with privacy-safe approximate location
4. **Fund treatment instantly** — One-tap donation with Stripe, transparent receipts, real-time goal tracking
5. **Track progress with evidence** — Structured updates with medical records, clinic attribution, photos — donors see exactly where their money went
6. **Close the loop** — Case reaches adoption or resolution, success story surfaces for social proof, credibility compounds

Every product decision is measured against this north star: does it make the next action more obvious, faster, or more fundable?

---

## Founder Source Context

This plan is grounded in founder requirements:

- Rescue and fundraising are fragmented across Facebook and low-trust channels — honest helpers can't break through the noise.
- People without large social followings need a reliable way to raise urgent care funds for animals they find.
- Cases must support ongoing updates with evidence (photos, bills, clinic details) and lifecycle completion through adoption.
- Clinics, NGOs, volunteers, and stores need profile + verification pathways to participate in rescue coordination.
- Bulgaria-first operational network is required (clinics, NGOs, shelters, stores, partner onboarding) before scaling.
- Pawtreon mission initiatives (drone scouting, safehouse/shelter) must be visible and fundable as platform roadmap efforts — they're the long-term vision that makes Pawtreon a movement, not just an app.

---

## Launch Market

**Bulgaria first** — Sofia, Varna, Plovdiv.

Why Bulgaria:
- High stray animal population with active but fragmented rescue community
- Rescue coordination happens in Facebook groups — no purpose-built platform exists
- Small enough for quality-controlled launch with real clinic/NGO relationships
- Regulatory environment allows rapid testing of donation flows

**Then EU** — expansion criteria: active rescue community, partner interest, regulatory compatibility.

**Then global** — after trust primitives, partner network model, and monetization are validated.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 7 + TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 (CSS-first config) |
| Backend | Convex (realtime DB + serverless functions) |
| Auth | Clerk (multi-provider: email, Google, Apple, Facebook) |
| Payments | Stripe (hosted checkout + webhooks) |
| Mobile | Capacitor (iOS + Android native wrappers) |
| i18n | i18next (EN, BG, UK, RU, DE) |
| Font | Nunito (400–800) |

---

## Core Principles

### 1. Trust Before Growth
Every feature that touches money, identity, or credibility must earn trust before optimizing for distribution. Verification ladders, evidence requirements, report mechanisms, and audit trails ship before growth loops. We'd rather have 100 trusted cases than 10,000 unverified ones.

### 2. Mobile-First Rescue Speed
The primary user is standing on a street next to an injured animal, holding a phone. Every creation flow, donation flow, and coordination action must work one-handed on a phone screen. Desktop is a scale-up, not the design target.

### 3. Human-Reviewed High-Risk Decisions
AI assists with drafting, triage hints, and pattern detection — but never auto-publishes cases, auto-diagnoses animals, or auto-resolves reports. Every high-risk action (publish, verify, moderate, move money) has a human in the loop.

### 4. Evidence-Rich Transparency
Donors don't just see "goal reached" — they see timestamped updates with photos, medical bills, clinic attribution, and outcome status. Transparency is the competitive moat: every update makes the next donation easier.

### 5. Single Account, Multi-Capability Profile
Users sign up once and acquire capabilities over time (donor + volunteer + rescuer in one account). No role-specific signup friction. Organization claims are an optional branch, not a gate.

---

## What Makes Pawtreon Different

| Competitor | Gap Pawtreon Fills |
|------------|-------------------|
| **GoFundMe / generic crowdfunding** | No urgency tiers, no verification ladder, no clinic integration, not built for rescue workflow |
| **CUDDLY** | US-only, no local clinic directory, no volunteer coordination, limited verification |
| **Facebook Groups** | Posts get buried, no structured updates, rampant scam reposts, no donation tracking, no accountability |
| **Instagram** | Algorithmic feed buries urgent content, no donation infrastructure, no case lifecycle management |
| **Local rescue orgs** | Fragmented, each with their own Facebook page, no unified discovery, no cross-org coordination |

Pawtreon's unique combination: **trust engine + local infrastructure + social feed + structured fundraising** — purpose-built for the rescue workflow that starts on the street and ends with adoption.

---

## Primary Outcomes

1. **Faster emergency treatment starts** — reduce time from "animal found" to "treatment funded" from days to minutes.
2. **Higher donor trust** via verifiable updates, clinic attribution, and transparent receipts.
3. **More complete rescue loops** — street → treatment → recovery → adoption, with every step tracked.
4. **Stronger local partner network** in Bulgaria — clinics, NGOs, stores, and volunteers coordinated through one platform.

---

## Scope Boundaries

### In Scope (Current Cycle)
- Docs system migration to spec-driven `docs/` structure
- Trust + money + case lifecycle completion
- Clinic directory seeding and claim operations for Bulgaria
- Mission campaign surfaces (home + account/profile hub)
- Post-checkout receipt UX polish
- Clinic claim admin review queue

### Not Now (Backlog)
- Drone scouting operations productization (mission initiative, milestone-funded)
- Shelter ERP/CRM
- In-app messaging system (spec now, build later)
- Framework migration away from Vite + React SPA
- Follow graph + following feed
- Recurring support model
- OG/share SSR surfaces

### Not Ever
- General-purpose crowdfunding platform (we are rescue-specific)
- Social media replacement (we consolidate from social, not compete with it)
- Veterinary diagnosis or treatment advice platform
- Mandatory location sharing / surveillance tool
- Scraping or caching private media from Facebook/Instagram

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Time to create case draft | < 3 min | Mobile-first rescue speed |
| Time to first case update after publish | Track | Evidence transparency |
| Case view → donation conversion | Track | Trust engine effectiveness |
| Repeat donor rate (D30/D90) | Track | Donor retention and trust |
| Verification rate (cases verified) | Track | Trust ladder adoption |
| Moderation throughput | < 24h first response | Safety and credibility |
| Claim approval cycle time | 24h response / 72h resolution | Partner onboarding speed |
| Share rate per case | Track downstream opens | Organic growth potential |

---

## Program Structure

| Document | Purpose | Location |
|----------|---------|----------|
| Product Roadmap | Phased timeline and gates | `docs/product/roadmap.md` |
| PRD | Product bible, feature checklist | `PRD.md` (root) |
| Feature Specs | Per-domain deep specs | `docs/features/` |
| Mission Specs | Drone, safehouse, marketplace | `docs/missions/` |
| System Specs | Data model, API, auth, deployment | `docs/systems/` |
| Design Specs | Theming, UI patterns, mobile, i18n | `docs/design/` |
| Business Specs | Monetization, partners, growth | `docs/business/` |
| Partner Ops | Directory seeding, claims, outreach | `docs/partners/` |
| Architecture + Patterns | Stack, conventions, security | `DESIGN.md` (root) |
| Trust/Safety Constraints | Non-negotiable rules | `RULES.md` (root) |
| Decision Log | Durable decisions with rationale | `DECISIONS.md` (root) |
