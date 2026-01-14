# 🔧 Backend Completion Plan - PawsSafe Production Launch

> **Project:** PawsSafe Animal Welfare Platform  
> **Backend:** Convex (Serverless Database + Functions)  
> **Audit Date:** January 13, 2026  
> **Status:** 42 Issues Identified

---

## 📋 Executive Summary

The Convex backend has a foundational schema but requires significant work for production readiness. This plan addresses **security vulnerabilities**, **missing tables**, **incomplete APIs**, and **performance optimizations**.

**Current Backend Completion: ~35%**  
**Target Backend Completion: 100%**

---

## 🚨 Security Remediation (CRITICAL - Week 1)

### 1. Authorization Bypass Vulnerabilities

#### 1.1 Fix notifications.markAsRead
**File:** `convex/notifications.ts`

```typescript
// CURRENT (VULNERABLE):
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true }); // Anyone can mark ANY notification!
  },
});

// FIXED:
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }
    
    await ctx.db.patch(args.id, { read: true });
  },
});
```

#### 1.2 Fix notifications.remove
**File:** `convex/notifications.ts`

```typescript
// ADD ownership check before delete
export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }
    
    await ctx.db.delete(args.id);
  },
});
```

#### 1.3 Fix paymentMethods.remove
**File:** `convex/paymentMethods.ts`

```typescript
export const remove = mutation({
  args: { id: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const method = await ctx.db.get(args.id);
    if (!method || method.userId !== user._id) {
      throw new Error("Payment method not found");
    }
    
    await ctx.db.delete(args.id);
  },
});
```

#### 1.4 Fix cases.addUpdate
**File:** `convex/cases.ts`

```typescript
export const addUpdate = mutation({
  args: {
    caseId: v.id("cases"),
    title: v.string(),
    description: v.string(),
    type: v.union(/*...*/),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const caseData = await ctx.db.get(args.caseId);
    if (!caseData) throw new Error("Case not found");
    
    // Only case creator or admin can add updates
    if (caseData.createdBy !== user._id && user.role !== 'admin') {
      throw new Error("Not authorized to update this case");
    }
    
    // ... rest of implementation
  },
});
```

#### 1.5 Secure clinics.seed (Admin Only)
**File:** `convex/clinics.ts`

```typescript
// Move to internal mutation OR add admin check
import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  // This can only be called from other server functions
  handler: async (ctx) => {
    // ... seeding logic
  },
});

// OR if needs to be callable:
export const seed = mutation({
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    if (user.role !== 'admin') {
      throw new Error("Admin access required");
    }
    // ... seeding logic
  },
});
```

#### 1.6 Secure notifications.create (Internal Only)
**File:** `convex/notifications.ts`

```typescript
// Should be internal - only server can create notifications
export const create = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});
```

#### 1.7 Secure users.upsert (Internal Only / Strict Identity Match)
**File:** `convex/users.ts`

**Risk:** Any caller can create/overwrite user records without an ownership/identity check  
**Fix:** Prefer internal-only (webhook) or enforce `identity.subject === args.clerkId`

```typescript
// Recommended: internal-only upsert called from a Clerk webhook action
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const upsert = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Upsert logic here (trusted caller only)
  },
});

// If you must expose a client-callable upsert:
// - require identity
// - block writing other users by enforcing identity match
```

---

### 2. Create Reusable Auth Helper

**New File:** `convex/lib/auth.ts`

```typescript
import { type MutationCtx, type QueryCtx } from "../_generated/server";
import { type Doc } from "../_generated/dataModel";

export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await requireAuth(ctx);
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}

export async function optionalAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}
```

---

### 3. Input Validation Schemas

**New File:** `convex/lib/validators.ts`

```typescript
import { v } from "convex/values";

// Reusable validators
export const emailValidator = v.string(); // Add runtime regex check in handler

export const phoneValidator = v.optional(v.string());

export const currencyValidator = v.union(
  v.literal("BGN"),
  v.literal("EUR"),
  v.literal("USD")
);

export const amountValidator = v.number(); // Validate positive in handler

export const paginationArgs = {
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

// String length limits (validate in handler)
export const LIMITS = {
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 5000,
  MESSAGE_MAX: 1000,
  CITY_MAX: 100,
};
```

---

## 📊 Schema Completion (Week 1-2)

### 4. Missing Tables

#### 4.1 Add campaigns table
**File:** `convex/schema.ts`

```typescript
campaigns: defineTable({
  title: v.string(),
  description: v.string(),
  images: v.array(v.id("_storage")),
  targetAmount: v.number(),
  currentAmount: v.number(),
  currency: v.union(v.literal("BGN"), v.literal("EUR"), v.literal("USD")),
  startDate: v.number(),
  endDate: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  organizerId: v.id("users"),
  partnerIds: v.optional(v.array(v.id("users"))),
  caseIds: v.optional(v.array(v.id("cases"))),
  donorCount: v.number(),
  featured: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_status", ["status"])
  .index("by_organizer", ["organizerId"])
  .index("by_end_date", ["endDate"]),
```

#### 4.2 Add adoptionApplications table
```typescript
adoptionApplications: defineTable({
  adoptionId: v.id("adoptions"),
  applicantId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("reviewing"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("withdrawn")
  ),
  message: v.string(),
  contactPhone: v.string(),
  contactEmail: v.string(),
  livingConditions: v.optional(v.string()),
  hasOtherPets: v.optional(v.boolean()),
  hasChildren: v.optional(v.boolean()),
  experience: v.optional(v.string()),
  reviewNotes: v.optional(v.string()),
  reviewedBy: v.optional(v.id("users")),
  reviewedAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_adoption", ["adoptionId"])
  .index("by_applicant", ["applicantId"])
  .index("by_status", ["status"]),
```

#### 4.3 Add partners table
```typescript
partners: defineTable({
  name: v.string(),
  description: v.string(),
  type: v.union(
    v.literal("ngo"),
    v.literal("shelter"),
    v.literal("clinic"),
    v.literal("corporate"),
    v.literal("individual")
  ),
  logo: v.optional(v.id("_storage")),
  website: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  totalDonated: v.number(),
  casesSupported: v.number(),
  verified: v.boolean(),
  userId: v.optional(v.id("users")), // Linked user account
  createdAt: v.number(),
})
  .index("by_type", ["type"])
  .index("by_verified", ["verified"]),
```

#### 4.4 Add volunteers table
```typescript
volunteers: defineTable({
  userId: v.id("users"),
  bio: v.string(),
  skills: v.array(v.string()),
  availability: v.optional(v.object({
    weekdays: v.boolean(),
    weekends: v.boolean(),
    evenings: v.boolean(),
  })),
  location: v.optional(v.string()),
  hoursContributed: v.number(),
  casesHelped: v.number(),
  verified: v.boolean(),
  verifiedAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_verified", ["verified"]),
```

#### 4.5 Add recurringDonations table
```typescript
recurringDonations: defineTable({
  userId: v.id("users"),
  amount: v.number(),
  currency: v.union(v.literal("BGN"), v.literal("EUR"), v.literal("USD")),
  frequency: v.union(
    v.literal("weekly"),
    v.literal("monthly"),
    v.literal("yearly")
  ),
  targetType: v.union(
    v.literal("general"),
    v.literal("case"),
    v.literal("campaign"),
    v.literal("partner")
  ),
  targetId: v.optional(v.string()),
  paymentMethodId: v.id("paymentMethods"),
  stripeSubscriptionId: v.optional(v.string()),
  status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("cancelled"),
    v.literal("failed")
  ),
  nextChargeDate: v.number(),
  lastChargedAt: v.optional(v.number()),
  totalCharged: v.number(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_next_charge", ["nextChargeDate"]),
```

#### 4.6 Add comments table
```typescript
comments: defineTable({
  entityType: v.union(
    v.literal("case"),
    v.literal("adoption"),
    v.literal("community_post")
  ),
  entityId: v.string(),
  authorId: v.id("users"),
  content: v.string(),
  parentId: v.optional(v.id("comments")),
  likeCount: v.number(),
  replyCount: v.number(),
  isEdited: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_entity", ["entityType", "entityId"])
  .index("by_author", ["authorId"])
  .index("by_parent", ["parentId"]),
```

#### 4.7 Add reports table (Moderation)
```typescript
reports: defineTable({
  reporterId: v.id("users"),
  entityType: v.union(
    v.literal("case"),
    v.literal("comment"),
    v.literal("user"),
    v.literal("adoption")
  ),
  entityId: v.string(),
  reason: v.union(
    v.literal("spam"),
    v.literal("inappropriate"),
    v.literal("fraud"),
    v.literal("harassment"),
    v.literal("other")
  ),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("reviewing"),
    v.literal("resolved"),
    v.literal("dismissed")
  ),
  resolvedBy: v.optional(v.id("users")),
  resolution: v.optional(v.string()),
  createdAt: v.number(),
  resolvedAt: v.optional(v.number()),
})
  .index("by_status", ["status"])
  .index("by_entity", ["entityType", "entityId"]),
```

---

### 5. Existing Table Enhancements

#### 5.1 Enhance users table
```typescript
// Add these fields:
bio: v.optional(v.string()),
socialLinks: v.optional(v.object({
  facebook: v.optional(v.string()),
  instagram: v.optional(v.string()),
  twitter: v.optional(v.string()),
})),
totalDonated: v.optional(v.number()),
donationCount: v.optional(v.number()),
lastActiveAt: v.optional(v.number()),
isVerified: v.optional(v.boolean()),
deletedAt: v.optional(v.number()), // Soft delete

// Add indexes:
.index("by_email", ["email"])
.index("by_role", ["role"])
```

#### 5.2 Enhance cases table
```typescript
// Add these fields:
animalName: v.optional(v.string()),
animalBreed: v.optional(v.string()),
animalAge: v.optional(v.string()),
animalGender: v.optional(v.union(
  v.literal("male"),
  v.literal("female"),
  v.literal("unknown")
)),
urgencyLevel: v.optional(v.number()), // 1-5
viewCount: v.optional(v.number()),
shareCount: v.optional(v.number()),
donorCount: v.optional(v.number()),
featured: v.optional(v.boolean()),
verifiedBy: v.optional(v.id("users")),
verifiedAt: v.optional(v.number()),
updatedAt: v.optional(v.number()),

// Add indexes:
.index("by_status_type", ["status", "type"])
.index("by_created", ["createdAt"])
.index("by_clinic", ["clinicId"])
.index("by_featured", ["featured"])
```

#### 5.3 Enhance clinics table
```typescript
// Add these fields:
email: v.optional(v.string()),
website: v.optional(v.string()),
workingHours: v.optional(v.object({
  monday: v.optional(v.string()),
  tuesday: v.optional(v.string()),
  wednesday: v.optional(v.string()),
  thursday: v.optional(v.string()),
  friday: v.optional(v.string()),
  saturday: v.optional(v.string()),
  sunday: v.optional(v.string()),
})),
is24Hours: v.optional(v.boolean()),
coordinates: v.optional(v.object({
  lat: v.number(),
  lng: v.number(),
})),
images: v.optional(v.array(v.id("_storage"))),
rating: v.optional(v.number()),
reviewCount: v.optional(v.number()),
casesHandled: v.optional(v.number()),
createdAt: v.number(),

// Add indexes:
.index("by_city", ["city"])
.index("by_verified", ["verified"])
```

#### 5.4 Enhance adoptions table
```typescript
// Add these fields:
breed: v.optional(v.string()),
gender: v.union(v.literal("male"), v.literal("female"), v.literal("unknown")),
size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
goodWith: v.optional(v.object({
  children: v.boolean(),
  dogs: v.boolean(),
  cats: v.boolean(),
})),
specialNeeds: v.optional(v.string()),
adoptionFee: v.optional(v.number()),
contactPhone: v.optional(v.string()),
contactEmail: v.optional(v.string()),
applicationCount: v.optional(v.number()),
viewCount: v.optional(v.number()),
updatedAt: v.optional(v.number()),

// Add indexes:
.index("by_animal_type", ["animalType"])
.index("by_status", ["status"])
.index("by_created", ["createdAt"])
```

---

## 🔌 API Completion (Week 2-3)

### 6. Missing CRUD Operations

#### 6.1 Create `convex/adoptions.ts`
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, optionalAuth } from "./lib/auth";

export const list = query({
  args: {
    animalType: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("adoptions");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const adoptions = await query
      .order("desc")
      .take(args.limit ?? 20);
    
    // Enrich with images
    return Promise.all(adoptions.map(async (adoption) => ({
      ...adoption,
      imageUrls: await Promise.all(
        adoption.images.map((id) => ctx.storage.getUrl(id))
      ),
    })));
  },
});

export const get = query({
  args: { id: v.id("adoptions") },
  handler: async (ctx, args) => {
    const adoption = await ctx.db.get(args.id);
    if (!adoption) return null;
    
    return {
      ...adoption,
      imageUrls: await Promise.all(
        adoption.images.map((id) => ctx.storage.getUrl(id))
      ),
    };
  },
});

export const create = mutation({
  args: {
    animalType: v.union(v.literal("dog"), v.literal("cat"), v.literal("other")),
    title: v.string(),
    description: v.string(),
    age: v.string(),
    location: v.string(),
    images: v.array(v.id("_storage")),
    vaccinated: v.boolean(),
    neutered: v.boolean(),
    breed: v.optional(v.string()),
    gender: v.optional(v.string()),
    size: v.optional(v.string()),
    adoptionFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    return await ctx.db.insert("adoptions", {
      ...args,
      ownerId: user._id,
      status: "available",
      applicationCount: 0,
      viewCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("adoptions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    // ... other optional fields
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const adoption = await ctx.db.get(args.id);
    
    if (!adoption || adoption.ownerId !== user._id) {
      throw new Error("Not authorized");
    }
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("adoptions") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const adoption = await ctx.db.get(args.id);
    
    if (!adoption || adoption.ownerId !== user._id) {
      throw new Error("Not authorized");
    }
    
    await ctx.db.delete(args.id);
  },
});
```

#### 6.2 Create `convex/campaigns.ts`
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let campaigns = await ctx.db.query("campaigns").collect();
    
    if (args.status) {
      campaigns = campaigns.filter((c) => c.status === args.status);
    }
    
    return Promise.all(campaigns.slice(0, args.limit ?? 20).map(async (campaign) => ({
      ...campaign,
      imageUrls: await Promise.all(
        campaign.images.map((id) => ctx.storage.getUrl(id))
      ),
      progress: campaign.targetAmount > 0 
        ? (campaign.currentAmount / campaign.targetAmount) * 100 
        : 0,
    })));
  },
});

export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) return null;
    
    const organizer = await ctx.db.get(campaign.organizerId);
    
    return {
      ...campaign,
      imageUrls: await Promise.all(
        campaign.images.map((id) => ctx.storage.getUrl(id))
      ),
      organizer: organizer ? {
        name: organizer.name,
        avatar: organizer.avatarUrl,
      } : null,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    images: v.array(v.id("_storage")),
    targetAmount: v.number(),
    currency: v.union(v.literal("BGN"), v.literal("EUR"), v.literal("USD")),
    startDate: v.number(),
    endDate: v.number(),
    caseIds: v.optional(v.array(v.id("cases"))),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    return await ctx.db.insert("campaigns", {
      ...args,
      organizerId: user._id,
      currentAmount: 0,
      donorCount: 0,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const donate = mutation({
  args: {
    campaignId: v.id("campaigns"),
    amount: v.number(),
    currency: v.string(),
    anonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const campaign = await ctx.db.get(args.campaignId);
    
    if (!campaign || campaign.status !== "active") {
      throw new Error("Campaign not available");
    }
    
    // Create donation record
    const donationId = await ctx.db.insert("donations", {
      userId: user._id,
      campaignId: args.campaignId,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      anonymous: args.anonymous ?? false,
      createdAt: Date.now(),
    });
    
    // Update campaign totals (will be confirmed after payment)
    return { donationId };
  },
});
```

#### 6.3 Create `convex/adoptionApplications.ts`
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const apply = mutation({
  args: {
    adoptionId: v.id("adoptions"),
    message: v.string(),
    contactPhone: v.string(),
    contactEmail: v.string(),
    livingConditions: v.optional(v.string()),
    hasOtherPets: v.optional(v.boolean()),
    hasChildren: v.optional(v.boolean()),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Check if already applied
    const existing = await ctx.db
      .query("adoptionApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", user._id))
      .filter((q) => q.eq(q.field("adoptionId"), args.adoptionId))
      .first();
    
    if (existing) {
      throw new Error("You have already applied for this adoption");
    }
    
    const applicationId = await ctx.db.insert("adoptionApplications", {
      ...args,
      applicantId: user._id,
      status: "pending",
      createdAt: Date.now(),
    });
    
    // Increment application count on adoption
    const adoption = await ctx.db.get(args.adoptionId);
    if (adoption) {
      await ctx.db.patch(args.adoptionId, {
        applicationCount: (adoption.applicationCount ?? 0) + 1,
      });
    }
    
    return applicationId;
  },
});

export const getMyApplications = query({
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    
    const applications = await ctx.db
      .query("adoptionApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", user._id))
      .collect();
    
    return Promise.all(applications.map(async (app) => {
      const adoption = await ctx.db.get(app.adoptionId);
      return {
        ...app,
        adoption: adoption ? {
          title: adoption.title,
          animalType: adoption.animalType,
        } : null,
      };
    }));
  },
});

export const getApplicationsForAdoption = query({
  args: { adoptionId: v.id("adoptions") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const adoption = await ctx.db.get(args.adoptionId);
    
    if (!adoption || adoption.ownerId !== user._id) {
      throw new Error("Not authorized");
    }
    
    return await ctx.db
      .query("adoptionApplications")
      .withIndex("by_adoption", (q) => q.eq("adoptionId", args.adoptionId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    applicationId: v.id("adoptionApplications"),
    status: v.union(
      v.literal("reviewing"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const application = await ctx.db.get(args.applicationId);
    
    if (!application) throw new Error("Application not found");
    
    const adoption = await ctx.db.get(application.adoptionId);
    if (!adoption || adoption.ownerId !== user._id) {
      throw new Error("Not authorized");
    }
    
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewNotes: args.reviewNotes,
      reviewedBy: user._id,
      reviewedAt: Date.now(),
    });
    
    // If approved, update adoption status
    if (args.status === "approved") {
      await ctx.db.patch(application.adoptionId, {
        status: "adopted",
      });
    }
  },
});
```

---

### 7. Payment Integration (Stripe)

#### 7.1 Create `convex/http.ts` (Webhook Handler)
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    const body = await request.text();
    
    // Verify webhook signature (implement Stripe verification)
    
    const event = JSON.parse(body);
    
    switch (event.type) {
      case "payment_intent.succeeded":
        await ctx.runMutation(internal.donations.complete, {
          paymentIntentId: event.data.object.id,
        });
        break;
      case "payment_intent.payment_failed":
        await ctx.runMutation(internal.donations.fail, {
          paymentIntentId: event.data.object.id,
        });
        break;
    }
    
    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

#### 7.2 Add donation completion mutations
**File:** `convex/donations.ts`

```typescript
import { internalMutation } from "./_generated/server";

export const complete = internalMutation({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .filter((q) => q.eq(q.field("stripePaymentIntentId"), args.paymentIntentId))
      .first();
    
    if (!donation) return;
    
    await ctx.db.patch(donation._id, { status: "completed" });
    
    // Update case totals
    if (donation.caseId) {
      const caseData = await ctx.db.get(donation.caseId);
      if (caseData) {
        await ctx.db.patch(donation.caseId, {
          currentAmount: caseData.currentAmount + donation.amount,
          donorCount: (caseData.donorCount ?? 0) + 1,
        });
      }
    }
    
    // Create notification
    // Award achievements
    // etc.
  },
});

export const fail = internalMutation({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .filter((q) => q.eq(q.field("stripePaymentIntentId"), args.paymentIntentId))
      .first();
    
    if (donation) {
      await ctx.db.patch(donation._id, { status: "failed" });
    }
  },
});
```

---

## ⚡ Performance Optimizations (Week 3)

### 8. Fix N+1 Query Issues

#### 8.1 Donations with Cases
**File:** `convex/donations.ts`

```typescript
// OPTIMIZED: Batch fetch instead of loop
export const getMyDonations = query({
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    
    // Collect unique case IDs
    const caseIds = [...new Set(donations.map((d) => d.caseId).filter(Boolean))];
    
    // Batch fetch all cases
    const cases = await Promise.all(caseIds.map((id) => ctx.db.get(id)));
    const caseMap = new Map(cases.filter(Boolean).map((c) => [c!._id, c]));
    
    // Batch fetch all images
    const imageIds = cases.filter(Boolean).flatMap((c) => c!.images.slice(0, 1));
    const imageUrls = await Promise.all(imageIds.map((id) => ctx.storage.getUrl(id)));
    const imageMap = new Map(imageIds.map((id, i) => [id, imageUrls[i]]));
    
    return donations.map((donation) => {
      const caseData = donation.caseId ? caseMap.get(donation.caseId) : null;
      return {
        ...donation,
        caseName: caseData?.title,
        caseImage: caseData?.images[0] ? imageMap.get(caseData.images[0]) : null,
      };
    });
  },
});
```

### 9. Add Pagination

#### 9.1 Cursor-based Pagination Pattern
```typescript
export const list = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("cases")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let query = ctx.db.query("cases").order("desc");
    
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor);
      if (cursorDoc) {
        query = query.filter((q) => 
          q.lt(q.field("_creationTime"), cursorDoc._creationTime)
        );
      }
    }
    
    const cases = await query.take(limit + 1);
    const hasMore = cases.length > limit;
    const items = cases.slice(0, limit);
    
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
      hasMore,
    };
  },
});
```

---

## 📋 Admin APIs (Week 3-4)

### 10. Create `convex/admin.ts`

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";

// Dashboard stats
export const getDashboardStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const [users, cases, donations, clinics] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("cases").collect(),
      ctx.db.query("donations").collect(),
      ctx.db.query("clinics").collect(),
    ]);
    
    const totalDonated = donations
      .filter((d) => d.status === "completed")
      .reduce((sum, d) => sum + d.amount, 0);
    
    return {
      totalUsers: users.length,
      totalCases: cases.length,
      activeCases: cases.filter((c) => c.status === "active").length,
      fundedCases: cases.filter((c) => c.status === "funded").length,
      totalDonations: donations.length,
      totalDonated,
      totalClinics: clinics.length,
      verifiedClinics: clinics.filter((c) => c.verified).length,
    };
  },
});

// User management
export const listUsers = query({
  args: {
    role: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    let users = await ctx.db.query("users").collect();
    
    if (args.role) {
      users = users.filter((u) => u.role === args.role);
    }
    
    const offset = args.offset ?? 0;
    const limit = args.limit ?? 50;
    
    return {
      users: users.slice(offset, offset + limit),
      total: users.length,
    };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("volunteer"),
      v.literal("clinic"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

// Case verification
export const verifyCase = mutation({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.patch(args.caseId, {
      verifiedBy: admin._id,
      verifiedAt: Date.now(),
    });
  },
});

// Clinic verification
export const verifyClinic = mutation({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.clinicId, { verified: true });
  },
});

// Reports management
export const getPendingReports = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    resolution: v.string(),
    action: v.union(v.literal("dismiss"), v.literal("warn"), v.literal("ban")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    await ctx.db.patch(args.reportId, {
      status: "resolved",
      resolution: args.resolution,
      resolvedBy: admin._id,
      resolvedAt: Date.now(),
    });
    
    // Implement action (warn user, ban, etc.)
  },
});
```

---

## ✅ Implementation Checklist

### Week 1: Security & Schema
- [ ] Create `convex/lib/auth.ts` helper
- [ ] Fix all authorization vulnerabilities (7 confirmed issues)
- [ ] Add input validation
- [ ] Create new tables (7 tables)
- [ ] Enhance existing tables (4 tables)

### Week 2: Core APIs
- [ ] Create `convex/adoptions.ts`
- [ ] Create `convex/campaigns.ts`
- [ ] Create `convex/adoptionApplications.ts`
- [ ] Add missing CRUD to `cases.ts`, `clinics.ts`
- [ ] Add pagination to all list queries

### Week 3: Integration & Performance
- [ ] Create `convex/http.ts` for webhooks
- [ ] Add Stripe payment integration
- [ ] Fix N+1 queries
- [ ] Add denormalized counters
- [ ] Create `convex/admin.ts`

### Week 4: Polish & Testing
- [ ] Add error handling with ConvexError
- [ ] Add audit logging
- [ ] Write integration tests
- [ ] Load testing
- [ ] Security audit

---

## 📊 API Coverage Matrix

| Entity | List | Get | Create | Update | Delete | Notes |
|--------|------|-----|--------|--------|--------|-------|
| Users | ❌→✅ | ❌→✅ | ✅ | ⚠️→✅ | ❌→✅ | Admin ops |
| Cases | ✅ | ✅ | ✅ | ⚠️→✅ | ❌→✅ | Full CRUD |
| Clinics | ✅ | ✅ | ❌→✅ | ❌→✅ | ❌→✅ | Admin ops |
| Donations | ✅ | ❌→✅ | ✅ | ❌→✅ | N/A | Webhooks |
| Campaigns | ❌→✅ | ❌→✅ | ❌→✅ | ❌→✅ | ❌→✅ | New |
| Adoptions | ❌→✅ | ❌→✅ | ❌→✅ | ❌→✅ | ❌→✅ | New |
| Applications | ❌→✅ | ❌→✅ | ❌→✅ | ❌→✅ | ❌→✅ | New |
| Notifications | ✅ | N/A | 🔒→✅ | ✅ | ✅ | Secured |
| Payments | ✅ | N/A | ✅ | N/A | ✅ | Secured |
| Settings | ✅ | N/A | N/A | ✅ | N/A | OK |
| Achievements | ✅ | N/A | 🔒→✅ | N/A | N/A | Internal |

**Legend:** ✅ Done | ⚠️ Partial | ❌ Missing | 🔒 Needs Security | →✅ To Implement

---

*Document Version: 1.0*  
*Last Updated: January 13, 2026*
