# Pawsy Onboarding System - Comprehensive Implementation Plan

> **Document Version:** 2.0 (Finalized)  
> **Created:** January 15, 2026  
> **Status:** ✅ APPROVED - Ready for Implementation  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Simplified User Flow](#3-simplified-user-flow)
4. [Onboarding Flow Design](#4-onboarding-flow-design)
5. [Clinic Claim & Verification System](#5-clinic-claim--verification-system)
6. [Product Tour Implementation](#6-product-tour-implementation)
7. [Technical Implementation](#7-technical-implementation)
8. [Database Schema Changes](#8-database-schema-changes)
9. [UI/UX Components](#9-uiux-components)
10. [Implementation Phases](#10-implementation-phases)
11. [Success Metrics](#11-success-metrics)
12. [Verification Checklist & Edge Cases](#12-verification-checklist--edge-cases)

---

## 1. Executive Summary

### The Problem
Currently, after sign up → sign in, users are redirected directly to the homepage without:
- Understanding what Pawsy does
- Knowing if they're a donor or organization
- Being guided through key features
- Organizations having a way to claim their clinic profile

### The Solution
Implement a **low-friction onboarding system**:
1. **Single Question Onboarding** - "What brings you to Pawsy?" (3 options only)
2. **Claim Flow for Organizations** - Search & claim pre-seeded Bulgarian clinics
3. **Interactive Product Tour** - Guide new users through key features

### Key Design Principles
- ⚡ **Speed for 90%** - Most users (donors) get through in 1 click
- 🏥 **Proper org onboarding** - Clinics/orgs get claim flow when needed
- ✅ **Verified badges** - Only claimed clinics show as verified
- 🎯 **Progressive disclosure** - Ask for more info only when needed

---

## 2. Current State Analysis

### Current Auth Flow
```
Sign Up (Clerk) → Sign In (Clerk) → Homepage (/)
                                     ↓
                              User exists in Convex
                              (basic profile only)
```

### Current User Schema (Convex)
```typescript
users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("volunteer"), v.literal("clinic"), v.literal("admin")),
    createdAt: v.number(),
})
```

### Current Clinics Schema
```typescript
clinics: defineTable({
    name: v.string(),
    city: v.string(),
    address: v.string(),
    phone: v.string(),
    is24h: v.boolean(),
    specializations: v.array(v.string()),
    verified: v.boolean(),  // Currently unused - will be used for claimed clinics
})
```

### Issues Identified
1. **No onboarding state** - Can't track if user completed onboarding
2. **Redirect goes to `/`** - No onboarding interception
3. **Clinics have no owner** - Pre-seeded clinics can't be claimed
4. **`verified` flag unused** - Should indicate claimed/verified clinics

---

## 3. Simplified User Flow

### Final Approved Flow: 3 Options Only

```
┌─────────────────────────────────────────────┐
│                                             │
│    🐾 What brings you to Pawsy?            │
│                                             │
│    ○ 💝  I want to help animals            │
│    ○ 🏢  I represent a clinic/organization │
│    ○ 👀  Just exploring                    │
│                                             │
│              [Continue →]                   │
└─────────────────────────────────────────────┘
```

### Why 3 Options?

| Option | User % | What Happens Next |
|--------|--------|-------------------|
| 💝 Help animals | ~70% | → Homepage + Product Tour |
| 🏢 Clinic/Organization | ~10% | → Claim Flow (search/register) |
| 👀 Just exploring | ~20% | → Homepage + Product Tour |

**Result:** 90% of users see only 1 screen before entering the app!

---

## 4. Onboarding Flow Design

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SIGN UP (Clerk)                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ONBOARDING: Single Question                        │
│                                                                      │
│  🐾 What brings you to Pawsy?                                       │
│                                                                      │
│    ○ 💝 I want to help animals                                      │
│    ○ 🏢 I represent a clinic/organization                           │
│    ○ 👀 Just exploring                                              │
│                                                                      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
     ┌──────────┐         ┌──────────┐         ┌──────────┐
     │  "Help"  │         │  "Org"   │         │"Exploring"│
     │    or    │         │          │         │          │
     │"Exploring"│        │          │         │          │
     └────┬─────┘         └────┬─────┘         └────┬─────┘
          │                    │                    │
          │                    ▼                    │
          │    ┌───────────────────────────────┐   │
          │    │     CLAIM FLOW                │   │
          │    │                               │   │
          │    │  Is your org already on       │   │
          │    │  Pawsy?                       │   │
          │    │                               │   │
          │    │  🔍 [Search clinics...]       │   │
          │    │                               │   │
          │    │  ─────── or ───────           │   │
          │    │                               │   │
          │    │  [➕ Register new org]        │   │
          │    └───────────────┬───────────────┘   │
          │                    │                    │
          │         ┌──────────┴──────────┐        │
          │         │                     │        │
          │         ▼                     ▼        │
          │  ┌────────────┐      ┌────────────┐   │
          │  │   CLAIM    │      │  REGISTER  │   │
          │  │  (Verify)  │      │  NEW ORG   │   │
          │  └─────┬──────┘      └─────┬──────┘   │
          │        │                   │          │
          │        └─────────┬─────────┘          │
          │                  │                    │
          └──────────────────┼────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REDIRECT TO HOMEPAGE (/)                         │
│                           +                                          │
│              PRODUCT TOUR (Interactive Highlights)                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Screen Designs

#### Screen 1: Single Onboarding Question

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              🐾 Welcome to Pawsy!                            │
│                                                              │
│            What brings you here today?                       │
│                                                              │
│    ┌────────────────────────────────────────────────────┐   │
│    │   💝                                                │   │
│    │   I want to help animals                           │   │
│    │   Donate, volunteer, or find a pet to adopt        │   │
│    └────────────────────────────────────────────────────┘   │
│                                                              │
│    ┌────────────────────────────────────────────────────┐   │
│    │   🏢                                                │   │
│    │   I represent a clinic or organization             │   │
│    │   Claim your profile or register your business     │   │
│    └────────────────────────────────────────────────────┘   │
│                                                              │
│    ┌────────────────────────────────────────────────────┐   │
│    │   👀                                                │   │
│    │   Just exploring                                   │   │
│    │   Browse around and see what Pawsy is about        │   │
│    └────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Screen 2: Claim Flow (Only for Organizations)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              🏥 Find Your Organization                       │
│                                                              │
│    Is your clinic or organization already on Pawsy?         │
│                                                              │
│    ┌────────────────────────────────────────────────────┐   │
│    │ 🔍  Search by name or city...                      │   │
│    └────────────────────────────────────────────────────┘   │
│                                                              │
│    Search Results:                                          │
│    ┌────────────────────────────────────────────────────┐   │
│    │  🏥 Vet Clinic Sofia Central                       │   │
│    │  Sofia, ul. Vitosha 45 • Not claimed               │   │
│    │                               [Claim This →]       │   │
│    ├────────────────────────────────────────────────────┤   │
│    │  🏥 Animal Hospital Plovdiv                        │   │
│    │  Plovdiv, bul. Maritza 12 • Not claimed            │   │
│    │                               [Claim This →]       │   │
│    └────────────────────────────────────────────────────┘   │
│                                                              │
│    ──────────────── or ────────────────                     │
│                                                              │
│    Can't find your organization?                            │
│    [➕ Register a new organization]                          │
│                                                              │
│                    [← Back]   [Skip for now →]              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Clinic Claim & Verification System

### Pre-seeded Bulgarian Clinics

We will pre-seed the Convex database with Bulgarian veterinary clinics. These clinics:
- Are visible to all users on `/clinics`
- Show as **unverified** (no badge) until claimed
- Can be claimed by their actual owners

### Claim Flow

```
User selects "I represent a clinic/organization"
                    │
                    ▼
        ┌───────────────────────┐
        │  Search for clinic    │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   Found Clinic            Not Found
        │                       │
        ▼                       ▼
   [Claim This]          [Register New]
        │                       │
        ▼                       ▼
┌───────────────────┐  ┌───────────────────┐
│ Verification Form │  │ New Org Form      │
│                   │  │                   │
│ • Your role       │  │ • Org name        │
│ • Contact email   │  │ • Type (clinic/   │
│ • Phone verify    │  │   store/shelter)  │
│                   │  │ • Address         │
│ [Submit Claim]    │  │ • Phone           │
└─────────┬─────────┘  │                   │
          │            │ [Submit]          │
          ▼            └─────────┬─────────┘
  Claim Created                  │
  (Pending Review)               ▼
          │              Org Created
          │              (Unverified)
          ▼                      │
   Admin Reviews                 │
          │                      │
          ▼                      │
   ✅ Approved                   │
   Clinic.verified = true        │
   Clinic.ownerId = userId       │
          │                      │
          └──────────────────────┘
                    │
                    ▼
            User redirected to
            homepage + tour
```

### Verified Badge Display

**On `/clinics` page:**
```tsx
// Clinic card shows verified badge only if claimed
<ClinicCard>
  <div className="flex items-center gap-2">
    <h3>{clinic.name}</h3>
    {clinic.verified && clinic.ownerId && (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <BadgeCheck className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    )}
  </div>
</ClinicCard>
```

**Badge States:**
| State | Display | Meaning |
|-------|---------|---------|
| `verified: false` | No badge | Pre-seeded, unclaimed |
| `verified: true` + `ownerId` | ✅ Verified | Claimed & approved |
| Pending claim | 🕐 "Claim pending" | Awaiting admin review |

---

## 6. Product Tour Implementation

### Library Choice: **react-joyride**

Reasons:
1. Built specifically for React - no wrapper needed
2. Better documentation for React patterns
3. Beacon feature for drawing attention to elements
4. Extensive styling options with shadcn/Tailwind
5. Better callback system for tracking progress

### Installation

```bash
pnpm add react-joyride
```

### Tour Steps Design

```typescript
// src/components/tour/tourSteps.ts
import { Step } from 'react-joyride';

export const homepageTourSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Pawsy! 🐾 Let me show you how to help animals in need.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="urgent-cases"]',
    content: 'Here you\'ll find animals that need immediate help. Each case shows their story and how much funding they need.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="donate-button"]',
    content: 'Click on any case to see details and make a donation. Every amount helps!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="navigation"]',
    content: 'Explore campaigns, partner clinics, and shelters working with us.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="profile-menu"]',
    content: 'Access your profile, donation history, and achievements here.',
    placement: 'left',
  },
  {
    target: 'body',
    content: 'You\'re all set! Start exploring and helping animals today. 🐾💝',
    placement: 'center',
  },
];
```

### Tour Trigger Logic

```typescript
// Tour should run when:
// 1. User just completed onboarding
// 2. User's productTourCompleted is false
// 3. User is on the homepage

const shouldShowTour = 
  user?.onboardingCompleted && 
  !user?.productTourCompleted &&
  location.pathname === '/';
```

---

## 7. Technical Implementation

### New Routes Structure

```typescript
// App.tsx routes
<Routes>
  {/* Auth routes */}
  <Route path="/sign-in/*" element={<SignInPage />} />
  <Route path="/sign-up/*" element={<SignUpPage />} />
  
  {/* Onboarding route */}
  <Route path="/onboarding" element={<OnboardingPage />} />
  <Route path="/onboarding/claim" element={<ClaimOrganizationPage />} />
  
  {/* Main app - with onboarding check */}
  <Route path="/" element={<Index />} />
  {/* ... rest of routes */}
</Routes>
```

### Onboarding Guard Logic

```typescript
// src/components/auth/OnboardingRedirect.tsx
// Used in App.tsx to redirect new users to onboarding

export function useOnboardingRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const user = useQuery(api.users.me);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!user) return; // Still loading
    
    // If user hasn't completed onboarding and not already on onboarding page
    if (!user.onboardingCompleted && !location.pathname.startsWith('/onboarding')) {
      navigate('/onboarding', { replace: true });
    }
  }, [isLoaded, isSignedIn, user, location.pathname, navigate]);
}

// NOTE: Consider suppressing the product tour for organization users
// to avoid showing donor-focused steps.
```

### Clerk Redirect Configuration

```typescript
// src/pages/SignUpPage.tsx - UPDATED
<SignUp
  routing="path"
  path="/sign-up"
  signInUrl="/sign-in"
  fallbackRedirectUrl="/onboarding"  // ← Changed from "/"
  forceRedirectUrl="/onboarding"     // ← Changed from "/"
/>

// src/pages/SignInPage.tsx - Keep as "/" for returning users
<SignIn
  routing="path"
  path="/sign-in"
  signUpUrl="/sign-up"
  fallbackRedirectUrl="/"  // Returning users go home
  forceRedirectUrl="/"
/>
```

### New Files to Create

```
src/
├── pages/
│   └── onboarding/
│       ├── OnboardingPage.tsx          # Main: 3-option selection
│       └── ClaimOrganizationPage.tsx   # Claim flow for orgs
├── components/
│   ├── onboarding/
│   │   ├── OnboardingOption.tsx        # Selectable option card
│   │   └── ClinicSearchResults.tsx     # Clinic search for claiming
│   └── tour/
│       ├── ProductTour.tsx             # react-joyride wrapper
│       └── tourSteps.ts                # Tour step definitions
├── hooks/
│   ├── useOnboardingRedirect.ts        # Redirect logic
│   └── useProductTour.ts               # Tour state management
```

---

## 8. Database Schema Changes

### Updated Users Table

```typescript
// convex/schema.ts - UPDATED users table
users: defineTable({
    // Existing fields
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
        v.literal("user"),
        v.literal("volunteer"),
        v.literal("clinic"),
        v.literal("admin")
    ),
    createdAt: v.number(),
    
    // NEW: Onboarding tracking
    onboardingCompleted: v.optional(v.boolean()),
    onboardingCompletedAt: v.optional(v.number()),
    
    // NEW: User type (simplified)
    userType: v.optional(v.union(
        v.literal("individual"),    // "I want to help" or "Just exploring"
        v.literal("organization"),  // "I represent a clinic/org"
    )),
    
    // NEW: Product tour tracking
    productTourCompleted: v.optional(v.boolean()),
    productTourCompletedAt: v.optional(v.number()),
})
    .index("by_clerk_id", ["clerkId"])
    .index("by_onboarding", ["onboardingCompleted"]),
```

### Updated Clinics Table

```typescript
// convex/schema.ts - UPDATED clinics table
clinics: defineTable({
    // Existing fields
    name: v.string(),
    city: v.string(),
    address: v.string(),
    phone: v.string(),
    is24h: v.boolean(),
    specializations: v.array(v.string()),
    verified: v.boolean(),  // NOW USED: true = claimed & approved
    
    // NEW: Ownership tracking
    ownerId: v.optional(v.id("users")),       // User who claimed this clinic
    claimedAt: v.optional(v.number()),        // When claimed
})
    .index("by_city", ["city"])
    .index("by_owner", ["ownerId"])           // NEW
    .index("by_verified", ["verified"]),      // NEW
```

### NEW: Clinic Claims Table

```typescript
// convex/schema.ts - NEW table for pending claims
clinicClaims: defineTable({
    clinicId: v.id("clinics"),
    userId: v.id("users"),
    status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
    ),
    // Verification info provided by claimer
    claimerRole: v.string(),        // "Owner", "Manager", "Staff"
    claimerEmail: v.string(),
    claimerPhone: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
    // Admin review
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
})
    .index("by_clinic", ["clinicId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
```

### New Convex Functions

```typescript
// convex/users.ts - NEW functions

// Complete onboarding
export const completeOnboarding = mutation({
    args: {
        userType: v.union(v.literal("individual"), v.literal("organization")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
            
        if (!user) throw new Error("User not found");
        
        await ctx.db.patch(user._id, {
            userType: args.userType,
            onboardingCompleted: true,
            onboardingCompletedAt: Date.now(),
        });
        
        return { success: true };
    },
});

// Complete product tour
export const completeProductTour = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
            
        if (!user) throw new Error("User not found");
        
        await ctx.db.patch(user._id, {
            productTourCompleted: true,
            productTourCompletedAt: Date.now(),
        });
    },
});
```

```typescript
// convex/clinics.ts - NEW functions

// Search clinics for claim flow
export const searchForClaim = query({
    args: { searchText: v.string() },
    handler: async (ctx, args) => {
        if (args.searchText.length < 2) return [];
        
        const searchLower = args.searchText.toLowerCase();
        
        // Get all clinics and filter (small dataset for Bulgaria)
        const clinics = await ctx.db.query("clinics").collect();
        
        return clinics
            .filter(c => 
                c.name.toLowerCase().includes(searchLower) ||
                c.city.toLowerCase().includes(searchLower)
            )
            .slice(0, 10)
            .map(c => ({
                ...c,
                isClaimed: !!c.ownerId,
            }));
    },
});

// Submit a claim for a clinic
export const submitClaim = mutation({
    args: {
        clinicId: v.id("clinics"),
        claimerRole: v.string(),
        claimerEmail: v.string(),
        claimerPhone: v.optional(v.string()),
        additionalInfo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
            
        if (!user) throw new Error("User not found");
        
        // Check if clinic exists and isn't already claimed
        const clinic = await ctx.db.get(args.clinicId);
        if (!clinic) throw new Error("Clinic not found");
        if (clinic.ownerId) throw new Error("Clinic already claimed");
        
        // Check for existing pending claim by this user
        const existingClaim = await ctx.db
            .query("clinicClaims")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("clinicId"), args.clinicId))
            .first();
            
        if (existingClaim) throw new Error("You already have a pending claim");
        
        // Create claim
        await ctx.db.insert("clinicClaims", {
            clinicId: args.clinicId,
            userId: user._id,
            status: "pending",
            claimerRole: args.claimerRole,
            claimerEmail: args.claimerEmail,
            claimerPhone: args.claimerPhone,
            additionalInfo: args.additionalInfo,
            createdAt: Date.now(),
        });
        
        return { success: true };
    },
});
```

---

## 9. UI/UX Components

### Onboarding Option Card

```tsx
// Component: OnboardingOption.tsx
interface OnboardingOptionProps {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const OnboardingOption = ({ icon, title, description, selected, onSelect }: OnboardingOptionProps) => (
  <Card 
    className={cn(
      "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
      selected && "border-primary bg-primary/5 ring-2 ring-primary"
    )}
    onClick={onSelect}
  >
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
```

### Clinic Search Results

```tsx
// Component: ClinicSearchResults.tsx
interface ClinicSearchResultsProps {
  clinics: ClinicWithClaimStatus[];
  onClaim: (clinicId: Id<"clinics">) => void;
}

const ClinicSearchResults = ({ clinics, onClaim }: ClinicSearchResultsProps) => (
  <div className="space-y-2">
    {clinics.map((clinic) => (
      <Card key={clinic._id} className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 text-primary" />
              <span className="font-medium">{clinic.name}</span>
              {clinic.isClaimed && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  Claimed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {clinic.city}, {clinic.address}
            </p>
          </div>
          {!clinic.isClaimed && (
            <Button variant="outline" size="sm" onClick={() => onClaim(clinic._id)}>
              Claim This
            </Button>
          )}
        </div>
      </Card>
    ))}
  </div>
);
```

### Product Tour Component

```tsx
// Component: ProductTour.tsx
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { homepageTourSteps } from './tourSteps';

export function ProductTour() {
  const user = useQuery(api.users.me);
  const completeProductTour = useMutation(api.users.completeProductTour);

  const shouldRun = user?.onboardingCompleted && !user?.productTourCompleted;

  const handleCallback = async (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      await completeProductTour();
    }
  };

  if (!shouldRun) return null;

  return (
    <Joyride
      steps={homepageTourSteps}
      run={true}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '0.75rem',
        },
        tooltip: {
          borderRadius: '1rem',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started! 🐾',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
```

---

## 10. Implementation Phases

### Phase 1: Schema & Foundation (Day 1-2)
**Priority: CRITICAL**

- [ ] Update Convex `users` schema (add `onboardingCompleted`, `userType`, `productTourCompleted`)
- [ ] Update Convex `clinics` schema (add `ownerId`, `claimedAt`)
- [ ] Create `clinicClaims` table
- [ ] Add Convex functions: `completeOnboarding`, `completeProductTour`
- [ ] Add Convex functions: `searchForClaim`, `submitClaim`
- [ ] Create migration script for existing users (set `onboardingCompleted: true`)

### Phase 2: Onboarding UI (Day 2-3)
**Priority: HIGH**

- [ ] Install `react-joyride`: `pnpm add react-joyride`
- [ ] Create `/onboarding` route and `OnboardingPage.tsx`
- [ ] Create `OnboardingOption` component (3 options)
- [ ] Update `SignUpPage.tsx` redirect to `/onboarding`
- [ ] Create `useOnboardingRedirect` hook

### Phase 3: Claim Flow (Day 3-4)
**Priority: HIGH**

- [ ] Create `/onboarding/claim` route and `ClaimOrganizationPage.tsx`
- [ ] Implement clinic search UI
- [ ] Create claim submission form
- [ ] Create `ClinicSearchResults` component
- [ ] Handle "Register new organization" flow

### Phase 4: Product Tour (Day 4-5)
**Priority: MEDIUM**

- [ ] Create `ProductTour` component with react-joyride
- [ ] Define tour steps in `tourSteps.ts`
- [ ] Add `data-tour` attributes to key homepage elements
- [ ] Integrate tour into `Index.tsx`
- [ ] Test tour completion tracking

### Phase 5: Verified Badge & Polish (Day 5-6)
**Priority: MEDIUM**

- [ ] Update `/clinics` page to show verified badge for claimed clinics
- [ ] Update clinic profile pages with verified status
- [ ] Pre-seed Bulgarian clinics data
- [ ] Mobile responsiveness testing
- [ ] Final QA

---

## 11. Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding Completion Rate | > 90% | Users who select an option |
| Tour Completion Rate | > 60% | Users who finish product tour |
| Clinic Claim Rate | 20+ clinics | Bulgarian clinics claimed |
| Time to First Action | < 2 min | From signup to first donation/browse |

### Analytics Events to Track

```typescript
const analyticsEvents = {
  // Onboarding
  onboarding_started: 'onboarding_started',
  onboarding_option_selected: 'onboarding_option_selected', // with userType
  onboarding_completed: 'onboarding_completed',
  
  // Claim flow
  claim_flow_started: 'claim_flow_started',
  clinic_search_performed: 'clinic_search_performed',
  claim_submitted: 'claim_submitted',
  
  // Product tour
  tour_started: 'tour_started',
  tour_step_viewed: 'tour_step_viewed', // with step index
  tour_completed: 'tour_completed',
  tour_skipped: 'tour_skipped',
};
```

---

## 12. Verification Checklist & Edge Cases

### Verification Checklist (Must Pass)

- [ ] **New user redirects**: After first sign-up, user lands on /onboarding (not /).
- [ ] **Returning user bypass**: If `onboardingCompleted=true`, user never sees onboarding.
- [ ] **Org flow**: Selecting organization always reaches claim UI or register form.
- [ ] **Claim duplication**: Same user cannot submit multiple pending claims for same clinic.
- [ ] **Verified badge**: Only shown when `verified=true` and `ownerId` exists.
- [ ] **Tour gating**: Runs only when `onboardingCompleted=true` and `productTourCompleted=false`.
- [ ] **Tour safety**: No step targets missing on the homepage (fallback to `body`).

### Edge Cases & Decisions

- **Existing users**: Migration should set `onboardingCompleted=true` to avoid forced onboarding.
- **Organization users**: Decide if product tour should be disabled or replaced with org-specific tour.
- **Skipped claim**: If user skips claim, still mark `onboardingCompleted=true` but keep `userType=organization`.
- **Multiple clinic claims**: Decide whether one user can claim multiple clinics (likely **no**).
- **Admin review**: Define who can approve claims and how (simple admin page or internal tool).
- **Search scale**: Current plan uses full scan; add indexed search if dataset grows.
- **Internationalization**: Ensure onboarding and claim copy is fully i18n-driven.

---

## Appendix A: Pre-seeded Bulgarian Clinics

Initial seed data for Bulgarian veterinary clinics:

```typescript
// convex/devSeed.ts - Add clinic seed data
const bulgarianClinics = [
  {
    name: "Ветеринарна клиника Софиявет",
    city: "София",
    address: "ул. Витоша 45",
    phone: "+359 2 123 4567",
    is24h: true,
    specializations: ["хирургия", "вътрешни болести", "дерматология"],
    verified: false,
  },
  {
    name: "Animal Hospital Plovdiv",
    city: "Пловдив",
    address: "бул. Марица 12",
    phone: "+359 32 987 6543",
    is24h: false,
    specializations: ["хирургия", "ортопедия"],
    verified: false,
  },
  {
    name: "Варна Вет Клиник",
    city: "Варна",
    address: "ул. Приморска 78",
    phone: "+359 52 456 7890",
    is24h: true,
    specializations: ["спешна помощ", "кардиология"],
    verified: false,
  },
  // ... more clinics
];
```

---

## Appendix B: Translation Keys

```json
{
  "onboarding": {
    "welcome": {
      "title": "Welcome to Pawsy!",
      "subtitle": "What brings you here today?"
    },
    "options": {
      "help": {
        "title": "I want to help animals",
        "description": "Donate, volunteer, or find a pet to adopt"
      },
      "organization": {
        "title": "I represent a clinic or organization",
        "description": "Claim your profile or register your business"
      },
      "exploring": {
        "title": "Just exploring",
        "description": "Browse around and see what Pawsy is about"
      }
    },
    "claim": {
      "title": "Find Your Organization",
      "subtitle": "Is your clinic or organization already on Pawsy?",
      "searchPlaceholder": "Search by name or city...",
      "notFound": "Can't find your organization?",
      "registerNew": "Register a new organization",
      "claimButton": "Claim This",
      "skipButton": "Skip for now"
    }
  },
  "tour": {
    "welcome": "Welcome to Pawsy! 🐾 Let me show you how to help animals in need.",
    "urgentCases": "Here you'll find animals that need immediate help.",
    "donate": "Click on any case to see details and make a donation.",
    "navigation": "Explore campaigns, partner clinics, and shelters.",
    "profile": "Access your profile, donation history, and achievements.",
    "complete": "You're all set! Start exploring and helping animals today. 🐾💝"
  },
  "clinic": {
    "verified": "Verified",
    "claimPending": "Claim pending"
  }
}
```

---

## Next Steps

1. ✅ **Plan approved** - Ready to implement
2. **Start Phase 1** - Update Convex schemas
3. **Pre-seed clinics** - Add Bulgarian veterinary clinics
4. **Build onboarding UI** - 3-option selection + claim flow
5. **Integrate product tour** - react-joyride on homepage

---

*Document finalized January 15, 2026*
