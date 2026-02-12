# Product Overview


> **Owner:** Founders
> **Status:** review
> **Last updated:** 2026-02-12

> **Non-SSOT:** This document is ideation/reference context and does not override root canonical docs.

---

## Platform Summary

**Pawtreon** is a cross-platform application available on:

| Platform | Technology | Status |
|----------|------------|--------|
| 🌐 Web | React 19 + Vite 7 + TypeScript | ✅ In Development |
| 📱 iOS | Capacitor | ✅ Configured |
| 🤖 Android | Capacitor | ✅ Configured |

---

## Core Features

### 1. 🆘 Emergency Cases (Shipped ✅)

**Browse and donate to urgent animal rescue cases**

- Real-time case feed (Instagram-like, case-first discovery)
- Case cards with verification badges, urgency indicators, funding progress
- Full case lifecycle: `active_treatment` → `seeking_adoption` → `closed_success` / `closed_transferred` / `closed_other`
- Structured updates with evidence (medical bills, lab results, clinic photos)
- One-tap Stripe-powered donations
- Report menu + moderation queue + audit logging

**User Flow:**
```
Browse Feed → View Case → Donate (Stripe) → Track Updates → See Outcome
```

---

### 2. 📢 Campaigns & Initiatives (Shipped ✅)

**Support larger fundraising initiatives**

- **Rescue campaigns** — tied to specific cases or groups (short-term emergency funding)
- **Initiative campaigns** — platform-level missions (drone program, safehouse — long-term, milestone-based)
- Initiative classification: drone, safehouse, platform, other
- Featured initiatives on home feed (after rescue content, never above it)
- Campaign progress tracking with transparency requirements

**Examples:**
- "Emergency Surgery Fund for Luna" — €2,000 goal
- "Drone Rescue Program" — platform initiative
- "Safehouse & Adoption Center" — milestone-based campaign

---

### 3. 🏥 Clinic Directory (In Development 🟡)

**Find verified pet-friendly services**

- Clinic directory with search, filter by city/24h/specialization
- Clinic profiles with details, services, hours, contact
- Claim flow: submit claim → duplicate guard → admin review → verified badge
- Claimed clinics can verify cases and post clinic updates
- Bulgaria seed data (Sofia, Varna, Plovdiv)

---

### 4. 🤝 Community Forum (Shipped ✅)

**Mobile-first community with dedicated bottom nav**

- Two boards: rescue (case-linked, urgent) and community (general discussion)
- Post categories: urgent_help, case_update, adoption, advice, general, announcements
- 2-level threading, upvote reactions
- Moderation: report flow → admin review → resolution actions
- Content policies enforced

---

### 5. 👤 User Profiles & Capabilities (Shipped ✅)

**Single-account, multi-capability model**

- Profile types: Finder, Rescuer, Donor, Volunteer, Professional, Business, Sponsor, Admin
- Verification ladder: unverified → community → clinic → partner
- Public profile: impact stats, badges, linked cases
- Privacy defaults: city-level location, no PII in public APIs

---

### 6. 🏢 Mission Initiatives (Shipped ✅)

**Platform-level programs beyond individual rescue**

- Drone Support Program (faster detection of injured animals)
- Safehouse & Adoption Center (temporary housing until adoption)
- Dedicated campaign surfaces with milestone tracking
- Transparent operational cost reporting

---

## User Types

### 🙋 Donors (B2C)

| Feature | Description |
|---------|-------------|
| Browse & Donate | Find cases, donate via Stripe instantly |
| Track Impact | See where money went with evidence-based updates |
| Recurring Giving | Monthly support for rescuers/clinics (future) |
| Receipts | Post-checkout receipt with case attribution |
| Social Sharing | Share cases to social media (coming soon) |

### 🏠 Rescuers & Clinics (B2B)

| Feature | Description |
|---------|-------------|
| Case Management | Create cases, post structured updates with evidence |
| Campaign Builder | Launch rescue or initiative campaigns |
| Verification | Claim clinic profile → admin review → verified badge |
| Donor Transparency | Incoming donation summaries, transparent accounting |
| Trust Signals | Verification badges on all surfaces |

### 🏢 Sponsors (B2B)

| Feature | Description |
|---------|-------------|
| Sponsored Campaigns | Fund specific rescues or initiatives |
| Brand Visibility | Logo on campaigns, CSR reporting |
| Impact Reports | Measurable animal welfare outcomes |
| Employee Programs | Company-wide giving (Year 2+) |

---

## Screenshots

> [FILL: Add screenshots of Home Feed, Case Detail, Donation Flow, Community, Clinic Directory]

### Home Screen (Case-First Feed)
```
┌─────────────────────────────┐
│  🐾 Pawtreon               │
├─────────────────────────────┤
│  [🔍 Search...]  [Filters] │
│  [Urgent] [Near me] [City] │
├─────────────────────────────┤
│  🔥 Urgent Cases           │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 🐕  │ │ 🐱  │ │ 🐕  │  │
│  │Luna │ │Max  │ │Bella│  │
│  │€450 │ │€200 │ │€800 │  │
│  │[===]│ │[== ]│ │[=  ]│  │
│  │ ✅  │ │ ⚠️  │ │ ✅  │  │
│  └─────┘ └─────┘ └─────┘  │
│  (✅ = verified, ⚠️ = pending)│
├─────────────────────────────┤
│  📢 Initiative Campaigns   │
│  ┌───────────────────────┐ │
│  │ 🚁 Drone Program     │ │
│  │ €2,450 / €10,000     │ │
│  │ [======           ]   │ │
│  └───────────────────────┘ │
├─────────────────────────────┤
│  🏠  📢  ➕  💬  👤       │
└─────────────────────────────┘
```

---

## Technical Architecture

```
┌──────────────────────────────────────────────┐
│                   FRONTEND                    │
│  React 19 + TypeScript + Tailwind v4         │
│  shadcn/ui + Capacitor (iOS + Android)       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                   BACKEND                     │
│              Convex (Serverless)             │
│   Real-time sync • Auto-scaling • TypeSafe   │
└──────────────────────┬───────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌────────┐  ┌──────────┐  ┌────────┐
     │ Clerk  │  │  Stripe  │  │ i18next│
     │ (Auth) │  │(Payments)│  │ (i18n) │
     │   ✅   │  │    ✅    │  │   ✅   │
     └────────┘  └──────────┘  └────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | React 19 + TypeScript | Latest React with concurrent features |
| **Styling** | Tailwind CSS v4 + shadcn/ui | CSS-first config, consistent design system |
| **Backend** | Convex | Real-time, serverless, fully type-safe |
| **Auth** | Clerk | Secure, multi-provider (email, Google, Apple, Facebook) |
| **Payments** | Stripe | Global, trusted, hosted checkout |
| **Mobile** | Capacitor | One codebase → native iOS + Android |
| **i18n** | i18next | 5 languages from day one |
| **Build** | Vite 7 | Sub-second HMR, optimized builds |
| **Font** | Nunito (400–800) | Friendly, readable across weights |

---

## Internationalization

**Supported Languages:**
- 🇬🇧 English (default)
- 🇧🇬 Bulgarian (launch market)
- 🇩🇪 German
- 🇷🇺 Russian
- 🇺🇦 Ukrainian

**Locale Features:**
- Currency formatting (EUR primary)
- Date formatting per locale
- Machine translation for user-generated content (rate-limited)
- Fallback chain: requested → EN
- RTL support (future: Arabic, Hebrew)

---

## Current Development Status

| Feature | Status | Completion |
|---------|--------|------------|
| Authentication (Clerk) | ✅ Complete | 100% |
| Home Feed (case-first) | ✅ Complete | 100% |
| Case Lifecycle + Updates | ✅ Complete | 100% |
| Community Forum | ✅ Complete | 100% |
| Moderation + Audit Logging | ✅ Complete | 100% |
| Mission Initiatives | ✅ Complete | 100% |
| Profiles + Capabilities | ✅ Complete | 100% |
| I18n (5 languages) | ✅ Complete | 100% |
| UI Components (shadcn/ui) | ✅ Complete | 90% |
| Create Case (wired to Convex) | ✅ Complete | 100% |
| Donations (Stripe checkout) | 🟡 In Progress | 80% |
| Clinic Directory + Claim | 🟡 In Progress | 60% |
| Campaigns | 🟡 In Progress | 70% |
| Adoption Flow | 🔴 Backlog | 10% |
| Mobile Apps (Capacitor) | 🟡 Configured | 30% |
| Notifications | 🔴 Not Started | 0% |
| Volunteer System | 🔴 Not Started | 0% |

**Overall: ~60% Complete** — Auth, payments, case lifecycle, moderation, community, and initiatives are shipped. Remaining work: receipt UX polish, clinic claim admin queue, notifications, volunteer system, and mobile app store builds.

---

## Demo

📱 **Live Demo:** [FILL: Demo URL when available]

🎥 **Video Walkthrough:** [FILL: Video link when recorded]

---

*Next: [04-Market-Opportunity](./04-Market-Opportunity.md)*



