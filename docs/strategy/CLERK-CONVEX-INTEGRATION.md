# 🔐 Clerk + Convex Full Integration Plan

> **Project:** PawsSafe Animal Welfare Platform  
> **Audit Date:** January 15, 2026  
> **Priority:** 🔴 CRITICAL - All user actions must flow through Convex/Clerk  
> **Estimated Effort:** 3-4 days for full integration

---

## 📋 Executive Summary

### Current State Analysis

| Component | Status | Issues |
|-----------|--------|--------|
| **Clerk Provider** | ✅ Integrated | `main.tsx` properly wraps app |
| **Convex Auth Config** | ✅ Configured | `auth.config.ts` has Clerk JWT |
| **Clerk Webhook** | ✅ Working | `http.ts` handles user.created/updated |
| **User Sync (Convex)** | ✅ Internal | `users.upsert` is internal mutation |
| **Auth Helper** | ✅ Created | `convex/lib/auth.ts` with `requireUser` |
| **Frontend Auth Guards** | 🟡 Partial | `AuthGuard` exists, no `RoleGuard` |
| **Mock Data Dependency** | 🔴 Critical | 80%+ pages use mock data, not Convex |
| **Community/Chat** | 🔴 Missing | No Convex tables or mutations |
| **Reviews/Ratings** | 🔴 Missing | No Convex tables or mutations |
| **Adoptions Backend** | 🟡 Partial | Schema exists, no queries/mutations |

### What's Working ✅
1. Clerk authentication in `main.tsx` with `ConvexProviderWithClerk`
2. Webhook-based user sync via `http.ts` → `internal.users.upsert`
3. `users.me` query properly uses `ctx.auth.getUserIdentity()`
4. Auth helper (`requireUser`, `assertOwnership`) in `convex/lib/auth.ts`
5. Cases, donations, notifications, settings, achievements - all use Clerk identity

### What's Broken 🔴
1. **Frontend uses mock data** - Pages like Profile, Donations, Community show hardcoded data
2. **Missing Community tables** - No `communityPosts`, `comments`, `likes` in schema
3. **Missing Reviews/Ratings** - No tables for clinic/volunteer ratings
4. **No adoption applications** - Schema has `adoptions` but no application flow
5. **RoleGuard component missing** - Auth doc describes it but not implemented
6. **User profile hook missing** - No `useCurrentUser` hook that combines Clerk + Convex

---

## 🎯 Integration Plan

### Phase 0: Demo Data Seeding (Day 0 - PREREQUISITE)

**Goal:** Seed Convex with realistic demo data so UI/UX can be developed against real backend

**Steps:**
1. Set environment variable: `npx convex env set DEV_SEED_SECRET "your-secret"`
2. Run seed: Call `api.devSeed.seedAll` with secret
3. Verify data in Convex Dashboard

**What Gets Seeded:**
- 6 demo users (admin, 3 volunteers, 2 regular users)
- 6 veterinary clinics across Bulgaria
- 4 animal cases (urgent, critical, adopted, recovering)
- 8 donation records with history
- 4 adoption listings
- 4 achievements
- 4 notifications
- User settings

**See:** Full seeding implementation at end of this document.

---

### Phase 1: Frontend-Backend Connection (Day 1)

**Goal:** Replace ALL mock data with real Convex queries

#### 1.1 Create `useCurrentUser` Hook

```typescript
// src/hooks/useCurrentUser.ts
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentUser() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(api.users.me);

  return {
    // Auth state
    isSignedIn: !!isSignedIn,
    isLoaded: authLoaded && convexUser !== undefined,
    
    // Clerk user data (for display)
    clerkUser,
    
    // Convex user data (for backend operations)
    user: convexUser,
    userId: convexUser?._id,
    role: convexUser?.role,
    
    // Convenience checks
    isAdmin: convexUser?.role === "admin",
    isVolunteer: convexUser?.role === "volunteer",
    isClinic: convexUser?.role === "clinic",
  };
}
```

#### 1.2 Create `RoleGuard` Component

```typescript
// src/components/auth/RoleGuard.tsx
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type UserRole = "user" | "volunteer" | "clinic" | "admin";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/" }: RoleGuardProps) {
  const { isLoaded, user, role } = useCurrentUser();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user || !role || !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
```

#### 1.3 Connect Profile Page to Convex

**File:** `src/pages/Profile.tsx`

Replace mock data:
```typescript
// REMOVE these:
const mockStats = { totalDonations: 12, totalAmount: 205, animalsHelped: 8 };
const achievementCount = 3;
const unreadNotifications = 2;

// ADD these:
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const stats = useQuery(api.donations.getMyStats) ?? { totalDonations: 0, totalAmount: 0, animalsHelped: 0 };
const achievements = useQuery(api.achievements.getMyAchievements) ?? [];
const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;
```

#### 1.4 Connect MyDonations Page

**File:** `src/pages/MyDonations.tsx`

```typescript
// REMOVE mock data
// ADD:
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const donations = useQuery(api.donations.getMyDonations) ?? [];
```

#### 1.5 Connect Notifications Page

**File:** `src/pages/Notifications.tsx`

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const notifications = useQuery(api.notifications.getMyNotifications) ?? [];
const markAsRead = useMutation(api.notifications.markAsRead);
const markAllAsRead = useMutation(api.notifications.markAllAsRead);
```

#### 1.6 Connect PaymentMethods Page

**File:** `src/pages/PaymentMethods.tsx`

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const methods = useQuery(api.paymentMethods.getMyPaymentMethods) ?? [];
const removeMethod = useMutation(api.paymentMethods.remove);
const setDefault = useMutation(api.paymentMethods.setDefault);
```

#### 1.7 Connect Settings Page

**File:** `src/pages/Settings.tsx`

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const settings = useQuery(api.settings.getMySettings);
const updateSettings = useMutation(api.settings.update);
```

---

### Phase 2: Missing Schema & APIs (Day 2)

**Goal:** Add missing tables for community features, reviews, adoption applications

#### 2.1 Add Community Tables to Schema

**File:** `convex/schema.ts`

```typescript
// Add to schema:

// Community posts (like Facebook/Reddit posts)
communityPosts: defineTable({
    userId: v.id("users"),
    content: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
    caseId: v.optional(v.id("cases")),  // Link to a case if sharing
    isPinned: v.boolean(),
    isRules: v.boolean(),  // For community guidelines post
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
})
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

// Comments on posts
comments: defineTable({
    postId: v.id("communityPosts"),
    userId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),  // For nested replies
    createdAt: v.number(),
})
    .index("by_post", ["postId"])
    .index("by_user", ["userId"]),

// Likes on posts and comments
likes: defineTable({
    userId: v.id("users"),
    postId: v.optional(v.id("communityPosts")),
    commentId: v.optional(v.id("comments")),
    createdAt: v.number(),
})
    .index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_comment", ["commentId"]),

// Clinic reviews/ratings
clinicReviews: defineTable({
    clinicId: v.id("clinics"),
    userId: v.id("users"),
    rating: v.number(),  // 1-5 stars
    title: v.optional(v.string()),
    content: v.string(),
    visitDate: v.optional(v.number()),
    isVerified: v.boolean(),  // User actually visited
    createdAt: v.number(),
})
    .index("by_clinic", ["clinicId"])
    .index("by_user", ["userId"]),

// Adoption applications
adoptionApplications: defineTable({
    adoptionId: v.id("adoptions"),
    userId: v.id("users"),
    status: v.union(
        v.literal("pending"),
        v.literal("reviewing"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("withdrawn")
    ),
    message: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    hasOtherPets: v.boolean(),
    housingType: v.union(v.literal("house"), v.literal("apartment"), v.literal("other")),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
})
    .index("by_adoption", ["adoptionId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
```

#### 2.2 Create Community Module

**File:** `convex/community.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, optionalUser } from "./lib/auth";

// List community posts with author info and stats
export const listPosts = query({
    args: {
        limit: v.optional(v.number()),
        cursor: v.optional(v.id("communityPosts")),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;
        
        let postsQuery = ctx.db.query("communityPosts").order("desc");
        
        const posts = await postsQuery.take(limit);
        
        // Enrich with author data and counts
        return await Promise.all(posts.map(async (post) => {
            const author = await ctx.db.get(post.userId);
            const likesCount = (await ctx.db
                .query("likes")
                .withIndex("by_post", q => q.eq("postId", post._id))
                .collect()).length;
            const commentsCount = (await ctx.db
                .query("comments")
                .withIndex("by_post", q => q.eq("postId", post._id))
                .collect()).length;
            
            // Check if current user liked
            const currentUser = await optionalUser(ctx);
            let userLiked = false;
            if (currentUser) {
                const userLike = await ctx.db
                    .query("likes")
                    .withIndex("by_post", q => q.eq("postId", post._id))
                    .filter(q => q.eq(q.field("userId"), currentUser._id))
                    .first();
                userLiked = !!userLike;
            }
            
            return {
                ...post,
                author: author ? {
                    name: author.name,
                    avatar: author.avatar,
                    role: author.role,
                } : null,
                likes: likesCount,
                comments: commentsCount,
                userLiked,
            };
        }));
    },
});

// Create a new post
export const createPost = mutation({
    args: {
        content: v.string(),
        images: v.optional(v.array(v.id("_storage"))),
        caseId: v.optional(v.id("cases")),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        
        if (args.content.length > 5000) {
            throw new Error("Post content too long (max 5000 characters)");
        }
        
        return await ctx.db.insert("communityPosts", {
            userId: user._id,
            content: args.content,
            images: args.images,
            caseId: args.caseId,
            isPinned: false,
            isRules: false,
            createdAt: Date.now(),
        });
    },
});

// Like a post
export const likePost = mutation({
    args: { postId: v.id("communityPosts") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        
        // Check if already liked
        const existing = await ctx.db
            .query("likes")
            .withIndex("by_post", q => q.eq("postId", args.postId))
            .filter(q => q.eq(q.field("userId"), user._id))
            .first();
        
        if (existing) {
            // Unlike
            await ctx.db.delete(existing._id);
            return { action: "unliked" };
        }
        
        // Like
        await ctx.db.insert("likes", {
            userId: user._id,
            postId: args.postId,
            createdAt: Date.now(),
        });
        return { action: "liked" };
    },
});

// Add comment to post
export const addComment = mutation({
    args: {
        postId: v.id("communityPosts"),
        content: v.string(),
        parentId: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        
        if (args.content.length > 1000) {
            throw new Error("Comment too long (max 1000 characters)");
        }
        
        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");
        
        return await ctx.db.insert("comments", {
            postId: args.postId,
            userId: user._id,
            content: args.content,
            parentId: args.parentId,
            createdAt: Date.now(),
        });
    },
});

// Get comments for a post
export const getComments = query({
    args: { postId: v.id("communityPosts") },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", q => q.eq("postId", args.postId))
            .order("asc")
            .collect();
        
        return await Promise.all(comments.map(async (comment) => {
            const author = await ctx.db.get(comment.userId);
            return {
                ...comment,
                author: author ? {
                    name: author.name,
                    avatar: author.avatar,
                    role: author.role,
                } : null,
            };
        }));
    },
});
```

#### 2.3 Create Clinic Reviews Module

**File:** `convex/clinicReviews.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, optionalUser } from "./lib/auth";

// Get reviews for a clinic
export const getByClinic = query({
    args: { clinicId: v.id("clinics") },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("clinicReviews")
            .withIndex("by_clinic", q => q.eq("clinicId", args.clinicId))
            .order("desc")
            .collect();
        
        return await Promise.all(reviews.map(async (review) => {
            const author = await ctx.db.get(review.userId);
            return {
                ...review,
                author: author ? {
                    name: author.name,
                    avatar: author.avatar,
                } : null,
            };
        }));
    },
});

// Get clinic rating summary
export const getClinicRating = query({
    args: { clinicId: v.id("clinics") },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("clinicReviews")
            .withIndex("by_clinic", q => q.eq("clinicId", args.clinicId))
            .collect();
        
        if (reviews.length === 0) {
            return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }
        
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => distribution[r.rating as 1|2|3|4|5]++);
        
        return {
            average: Math.round((total / reviews.length) * 10) / 10,
            count: reviews.length,
            distribution,
        };
    },
});

// Add a review
export const add = mutation({
    args: {
        clinicId: v.id("clinics"),
        rating: v.number(),
        title: v.optional(v.string()),
        content: v.string(),
        visitDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        
        // Validate rating
        if (args.rating < 1 || args.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }
        
        // Check for existing review
        const existing = await ctx.db
            .query("clinicReviews")
            .withIndex("by_clinic", q => q.eq("clinicId", args.clinicId))
            .filter(q => q.eq(q.field("userId"), user._id))
            .first();
        
        if (existing) {
            throw new Error("You have already reviewed this clinic");
        }
        
        // Verify clinic exists
        const clinic = await ctx.db.get(args.clinicId);
        if (!clinic) throw new Error("Clinic not found");
        
        return await ctx.db.insert("clinicReviews", {
            clinicId: args.clinicId,
            userId: user._id,
            rating: args.rating,
            title: args.title,
            content: args.content,
            visitDate: args.visitDate,
            isVerified: false,  // Could be verified via donation/case history
            createdAt: Date.now(),
        });
    },
});

// Get user's reviews
export const getMyReviews = query({
    args: {},
    handler: async (ctx) => {
        const user = await optionalUser(ctx);
        if (!user) return [];
        
        const reviews = await ctx.db
            .query("clinicReviews")
            .withIndex("by_user", q => q.eq("userId", user._id))
            .collect();
        
        return await Promise.all(reviews.map(async (review) => {
            const clinic = await ctx.db.get(review.clinicId);
            return {
                ...review,
                clinicName: clinic?.name ?? "Unknown Clinic",
            };
        }));
    },
});
```

#### 2.4 Create Adoption Applications Module

**File:** `convex/adoptionApplications.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, assertOwnership } from "./lib/auth";

// Apply for adoption
export const apply = mutation({
    args: {
        adoptionId: v.id("adoptions"),
        message: v.string(),
        phone: v.string(),
        address: v.optional(v.string()),
        hasOtherPets: v.boolean(),
        housingType: v.union(v.literal("house"), v.literal("apartment"), v.literal("other")),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        
        // Check adoption exists and is available
        const adoption = await ctx.db.get(args.adoptionId);
        if (!adoption) throw new Error("Adoption listing not found");
        if (adoption.status !== "available") {
            throw new Error("This animal is no longer available for adoption");
        }
        
        // Check for existing application
        const existing = await ctx.db
            .query("adoptionApplications")
            .withIndex("by_adoption", q => q.eq("adoptionId", args.adoptionId))
            .filter(q => q.eq(q.field("userId"), user._id))
            .first();
        
        if (existing && existing.status !== "rejected" && existing.status !== "withdrawn") {
            throw new Error("You already have an active application for this animal");
        }
        
        return await ctx.db.insert("adoptionApplications", {
            adoptionId: args.adoptionId,
            userId: user._id,
            status: "pending",
            message: args.message,
            phone: args.phone,
            address: args.address,
            hasOtherPets: args.hasOtherPets,
            housingType: args.housingType,
            createdAt: Date.now(),
        });
    },
});

// Get my applications
export const getMyApplications = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        
        const applications = await ctx.db
            .query("adoptionApplications")
            .withIndex("by_user", q => q.eq("userId", user._id))
            .order("desc")
            .collect();
        
        return await Promise.all(applications.map(async (app) => {
            const adoption = await ctx.db.get(app.adoptionId);
            let imageUrl = null;
            if (adoption?.images?.[0]) {
                imageUrl = await ctx.storage.getUrl(adoption.images[0]);
            }
            return {
                ...app,
                animalName: adoption?.name ?? "Unknown",
                animalImage: imageUrl,
            };
        }));
    },
});

// Get applications for my adoption listings (for listing owner)
export const getForMyListings = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        
        // Get user's adoption listings
        const myAdoptions = await ctx.db
            .query("adoptions")
            .withIndex("by_user", q => q.eq("userId", user._id))
            .collect();
        
        // Get all applications for these listings
        const allApplications = await Promise.all(
            myAdoptions.map(async (adoption) => {
                const apps = await ctx.db
                    .query("adoptionApplications")
                    .withIndex("by_adoption", q => q.eq("adoptionId", adoption._id))
                    .collect();
                return apps.map(app => ({ ...app, animalName: adoption.name }));
            })
        );
        
        return allApplications.flat().sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Withdraw application
export const withdraw = mutation({
    args: { id: v.id("adoptionApplications") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const app = await ctx.db.get(args.id);
        
        if (!app) throw new Error("Application not found");
        assertOwnership(user, app.userId, "application");
        
        if (app.status !== "pending" && app.status !== "reviewing") {
            throw new Error("Cannot withdraw application in current status");
        }
        
        await ctx.db.patch(args.id, { status: "withdrawn" });
    },
});

// Update application status (for listing owner)
export const updateStatus = mutation({
    args: {
        id: v.id("adoptionApplications"),
        status: v.union(v.literal("reviewing"), v.literal("approved"), v.literal("rejected")),
        reviewNotes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const app = await ctx.db.get(args.id);
        
        if (!app) throw new Error("Application not found");
        
        // Verify user owns the adoption listing
        const adoption = await ctx.db.get(app.adoptionId);
        if (!adoption) throw new Error("Adoption not found");
        assertOwnership(user, adoption.userId, "adoption listing");
        
        await ctx.db.patch(args.id, {
            status: args.status,
            reviewedAt: Date.now(),
            reviewNotes: args.reviewNotes,
        });
        
        // If approved, mark adoption as pending
        if (args.status === "approved") {
            await ctx.db.patch(app.adoptionId, { status: "pending" });
        }
    },
});
```

#### 2.5 Add Adoptions Queries/Mutations

**File:** `convex/adoptions.ts` (new file)

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, assertOwnership, optionalUser } from "./lib/auth";

// List all available adoptions
export const list = query({
    args: {
        status: v.optional(v.union(v.literal("available"), v.literal("pending"), v.literal("adopted"))),
        animalType: v.optional(v.union(v.literal("dog"), v.literal("cat"), v.literal("other"))),
    },
    handler: async (ctx, args) => {
        let adoptions = await ctx.db.query("adoptions").collect();
        
        if (args.status) {
            adoptions = adoptions.filter(a => a.status === args.status);
        }
        if (args.animalType) {
            adoptions = adoptions.filter(a => a.animalType === args.animalType);
        }
        
        return await Promise.all(adoptions.map(async (adoption) => {
            const imageUrls = await Promise.all(
                adoption.images.map(id => ctx.storage.getUrl(id))
            );
            const user = await ctx.db.get(adoption.userId);
            return {
                ...adoption,
                images: imageUrls.filter((u): u is string => !!u),
                ownerName: user?.name ?? "Anonymous",
            };
        }));
    },
});

// Get single adoption with details
export const get = query({
    args: { id: v.id("adoptions") },
    handler: async (ctx, args) => {
        const adoption = await ctx.db.get(args.id);
        if (!adoption) return null;
        
        const imageUrls = await Promise.all(
            adoption.images.map(id => ctx.storage.getUrl(id))
        );
        const user = await ctx.db.get(adoption.userId);
        
        // Check if current user has applied
        const currentUser = await optionalUser(ctx);
        let hasApplied = false;
        if (currentUser) {
            const app = await ctx.db
                .query("adoptionApplications")
                .withIndex("by_adoption", q => q.eq("adoptionId", args.id))
                .filter(q => q.eq(q.field("userId"), currentUser._id))
                .first();
            hasApplied = !!app && app.status !== "withdrawn" && app.status !== "rejected";
        }
        
        return {
            ...adoption,
            images: imageUrls.filter((u): u is string => !!u),
            ownerName: user?.name ?? "Anonymous",
            ownerAvatar: user?.avatar,
            hasApplied,
        };
    },
});

// Create adoption listing
export const create = mutation({
    args: {
        animalType: v.union(v.literal("dog"), v.literal("cat"), v.literal("other")),
        name: v.string(),
        age: v.string(),
        description: v.string(),
        images: v.array(v.id("_storage")),
        location: v.object({
            city: v.string(),
            neighborhood: v.string(),
        }),
        vaccinated: v.boolean(),
        neutered: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        
        return await ctx.db.insert("adoptions", {
            userId: user._id,
            animalType: args.animalType,
            name: args.name,
            age: args.age,
            description: args.description,
            images: args.images,
            location: args.location,
            vaccinated: args.vaccinated,
            neutered: args.neutered,
            status: "available",
            createdAt: Date.now(),
        });
    },
});

// Update adoption (owner only)
export const update = mutation({
    args: {
        id: v.id("adoptions"),
        name: v.optional(v.string()),
        age: v.optional(v.string()),
        description: v.optional(v.string()),
        vaccinated: v.optional(v.boolean()),
        neutered: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const adoption = await ctx.db.get(args.id);
        
        if (!adoption) throw new Error("Adoption not found");
        assertOwnership(user, adoption.userId, "adoption");
        
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Get my adoption listings
export const getMyListings = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        
        const adoptions = await ctx.db
            .query("adoptions")
            .withIndex("by_user", q => q.eq("userId", user._id))
            .collect();
        
        return await Promise.all(adoptions.map(async (adoption) => {
            const imageUrls = await Promise.all(
                adoption.images.map(id => ctx.storage.getUrl(id))
            );
            // Count applications
            const apps = await ctx.db
                .query("adoptionApplications")
                .withIndex("by_adoption", q => q.eq("adoptionId", adoption._id))
                .collect();
            const pendingApps = apps.filter(a => a.status === "pending").length;
            
            return {
                ...adoption,
                images: imageUrls.filter((u): u is string => !!u),
                applicationCount: apps.length,
                pendingApplications: pendingApps,
            };
        }));
    },
});
```

---

### Phase 3: Frontend Integration (Day 3)

**Goal:** Update all pages to use real Convex data

#### 3.1 Update Community Page

**File:** `src/pages/Community.tsx`

```typescript
// Replace useTranslatedMockData with:
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const posts = useQuery(api.community.listPosts, { limit: 20 }) ?? [];
const likePost = useMutation(api.community.likePost);
const createPost = useMutation(api.community.createPost);
```

#### 3.2 Update Clinic Profile Page

**File:** `src/pages/ClinicProfile.tsx`

```typescript
// Add reviews:
const reviews = useQuery(api.clinicReviews.getByClinic, { clinicId });
const rating = useQuery(api.clinicReviews.getClinicRating, { clinicId });
const addReview = useMutation(api.clinicReviews.add);
```

#### 3.3 Create Adoption Browse Page

Connect existing schema to UI with proper Convex queries.

#### 3.4 Add Loading States & Error Boundaries

Every Convex query should handle:
- `undefined` (loading)
- Empty array (no data)
- Error states

---

### Phase 4: Security Hardening (Day 4)

#### 4.1 Audit Checklist

| Mutation | Auth Check | Ownership Check | Input Validation |
|----------|------------|-----------------|------------------|
| `donations.create` | ✅ | N/A | ⚠️ Add amount validation |
| `cases.create` | ✅ | N/A | ⚠️ Add length limits |
| `cases.addUpdate` | ✅ | ✅ | ✅ |
| `notifications.markAsRead` | ✅ | ✅ | ✅ |
| `notifications.remove` | ✅ | ✅ | ✅ |
| `paymentMethods.add` | ✅ | N/A | ⚠️ Add validation |
| `paymentMethods.remove` | ✅ | ✅ | ✅ |
| `settings.update` | ✅ | N/A | ✅ |
| `achievements.award` | ✅ | N/A | ⚠️ Should be internal |

#### 4.2 Make Achievement Award Internal

**File:** `convex/achievements.ts`

```typescript
// Change from mutation to internalMutation
import { internalMutation } from "./_generated/server";

export const award = internalMutation({
    // ... same logic, but only callable from server
});
```

#### 4.3 Add Input Validation

**File:** `convex/lib/validators.ts`

```typescript
export function validateAmount(amount: number): void {
    if (amount <= 0) throw new Error("Amount must be positive");
    if (amount > 100000) throw new Error("Amount exceeds maximum");
    if (!Number.isFinite(amount)) throw new Error("Invalid amount");
}

export function validateStringLength(str: string, field: string, max: number): void {
    if (str.length > max) {
        throw new Error(`${field} must be ${max} characters or less`);
    }
}

export function sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
}
```

---

## 📊 Migration Checklist

### Phase 0: Demo Data (Day 0)

- [ ] Set `DEV_SEED_SECRET` environment variable in Convex
- [ ] Run `seedAll` mutation to populate demo data
- [ ] Verify data in Convex Dashboard
- [ ] Test that `api.cases.list` returns seeded cases

### Backend (Convex)

- [ ] Add community tables to schema
- [ ] Add clinicReviews table to schema  
- [ ] Add adoptionApplications table to schema
- [ ] Create `convex/community.ts` module
- [ ] Create `convex/clinicReviews.ts` module
- [ ] Create `convex/adoptionApplications.ts` module
- [ ] Create `convex/adoptions.ts` module
- [ ] Make `achievements.award` internal
- [ ] Add input validation to all mutations
- [ ] Run `npx convex dev` to apply schema

### Frontend (React)

- [ ] Create `useCurrentUser` hook
- [ ] Create `RoleGuard` component
- [ ] Update `Profile.tsx` - remove mock data
- [ ] Update `MyDonations.tsx` - remove mock data
- [ ] Update `DonationHistory.tsx` - remove mock data
- [ ] Update `Notifications.tsx` - remove mock data
- [ ] Update `PaymentMethods.tsx` - remove mock data
- [ ] Update `Settings.tsx` - remove mock data
- [ ] Update `Achievements.tsx` - remove mock data
- [ ] Update `Community.tsx` - remove mock data
- [ ] Update `ClinicProfile.tsx` - add reviews
- [ ] Add loading states to all pages
- [ ] Add error boundaries

### Testing

- [ ] Test unauthenticated user flow
- [ ] Test authenticated user flow
- [ ] Test role-based access (admin features)
- [ ] Test donation creation
- [ ] Test case creation
- [ ] Test community posting
- [ ] Test clinic reviews
- [ ] Test adoption applications

---

## 🔧 Environment Variables Required

```env
# .env.local (frontend)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_CONVEX_URL=https://xxx.convex.cloud

# Convex Dashboard Environment Variables
CLERK_ISSUER_URL=https://xxx.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_xxx
```

---

## 📈 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Pages using mock data | 80% | 0% |
| Backend auth coverage | 70% | 100% |
| Community features | 0% | 100% |
| Review system | 0% | 100% |
| Adoption applications | 0% | 100% |

---

## ⚠️ Breaking Changes

None - this is additive. All existing functionality preserved while adding missing pieces.

---

## 🌱 Phase 0: Demo Data Seeding (PREREQUISITE)

**Goal:** Seed Convex with realistic demo data so UI/UX can be developed against real backend

### Why This Matters
- Frontend currently uses `useTranslatedMockData()` hook with hardcoded data
- Without seeded data, switching to Convex queries shows empty states
- Demo data lets us test real queries while developing

### Demo User Strategy

Create a special "demo" user that owns all seed data:
- `clerkId: "demo_pawssafe"` - Easy to identify
- `role: "admin"` - Can access all features
- `email: "demo@pawssafe.local"` - Clearly fake

All demo content tagged for easy cleanup later.

### Data to Seed (from `useTranslatedMockData.ts`)

| Entity | Count | Source |
|--------|-------|--------|
| **Demo Users** | 5 | Volunteers + regular users from mock |
| **Cases** | 4 | `mockCases` - urgent, critical, recovering, adopted |
| **Campaigns** | 6 | `mockCampaigns` - various goals/progress |
| **Partners** | 8 | `mockPartners` - pet shops, vets, sponsors |
| **Clinics** | 6 | Need to add to schema |
| **Community Posts** | 5 | `mockCommunityPosts` + rules post |
| **Donations** | 8 | Mock donation history |
| **Achievements** | 5 | Various achievement types |
| **Adoptions** | 4 | Sample animals for adoption |

### Implementation: Expanded `convex/devSeed.ts`

```typescript
import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Security: require secret to run seed
function requireDevSecret(secret: string) {
  const expected = process.env.DEV_SEED_SECRET;
  if (!expected) {
    throw new Error("DEV_SEED_SECRET not set. Run: npx convex env set DEV_SEED_SECRET <secret>");
  }
  if (secret !== expected) throw new Error("Invalid DEV_SEED_SECRET");
}

// Demo user IDs (predictable for cleanup)
const DEMO_CLERK_IDS = {
  admin: "demo_admin_pawssafe",
  volunteer1: "demo_volunteer_maria",
  volunteer2: "demo_volunteer_georgi", 
  volunteer3: "demo_volunteer_elena",
  user1: "demo_user_ivan",
  user2: "demo_user_peter",
};

export const seedAll = mutation({
  args: { secret: v.string(), reset: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    requireDevSecret(args.secret);
    const now = Date.now();
    
    // If reset, delete all demo data first
    if (args.reset) {
      await ctx.runMutation(internal.devSeed.cleanupDemoData, {});
    }

    // 1. Create demo users
    const users = await ctx.runMutation(internal.devSeed.seedUsers, { now });
    
    // 2. Seed clinics
    const clinics = await ctx.runMutation(internal.devSeed.seedClinics, {});
    
    // 3. Seed cases (owned by demo volunteer)
    const cases = await ctx.runMutation(internal.devSeed.seedCases, { 
      userId: users.volunteer1, 
      clinicId: clinics[0],
      now 
    });
    
    // 4. Seed donations (from demo users to cases)
    const donations = await ctx.runMutation(internal.devSeed.seedDonations, {
      userIds: [users.user1, users.user2],
      caseIds: cases,
      now,
    });
    
    // 5. Seed community posts
    const posts = await ctx.runMutation(internal.devSeed.seedCommunityPosts, {
      userIds: [users.volunteer1, users.volunteer2, users.user1],
      now,
    });
    
    // 6. Seed achievements
    await ctx.runMutation(internal.devSeed.seedAchievements, {
      userId: users.user1,
      now,
    });
    
    // 7. Seed adoptions
    const adoptions = await ctx.runMutation(internal.devSeed.seedAdoptions, {
      userId: users.volunteer1,
      now,
    });

    return {
      users: Object.keys(users).length,
      clinics: clinics.length,
      cases: cases.length,
      donations: donations.length,
      posts: posts.length,
      adoptions: adoptions.length,
    };
  },
});

// Internal: Seed demo users
export const seedUsers = internalMutation({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const usersData = [
      {
        clerkId: DEMO_CLERK_IDS.admin,
        name: "PawsSafe Admin",
        email: "admin@pawssafe.local",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
        role: "admin" as const,
      },
      {
        clerkId: DEMO_CLERK_IDS.volunteer1,
        name: "Maria Petrova",
        email: "maria@pawssafe.local",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        role: "volunteer" as const,
      },
      {
        clerkId: DEMO_CLERK_IDS.volunteer2,
        name: "Georgi Ivanov",
        email: "georgi@pawssafe.local",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        role: "volunteer" as const,
      },
      {
        clerkId: DEMO_CLERK_IDS.volunteer3,
        name: "Elena Dimitrova",
        email: "elena@pawssafe.local",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
        role: "volunteer" as const,
      },
      {
        clerkId: DEMO_CLERK_IDS.user1,
        name: "Ivan Georgiev",
        email: "ivan@pawssafe.local",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        role: "user" as const,
      },
      {
        clerkId: DEMO_CLERK_IDS.user2,
        name: "Peter Todorov",
        email: "peter@pawssafe.local",
        avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200",
        role: "user" as const,
      },
    ];

    const userIds: Record<string, string> = {};

    for (const userData of usersData) {
      // Check if exists
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userData.clerkId))
        .unique();

      if (existing) {
        const key = Object.entries(DEMO_CLERK_IDS).find(([_, v]) => v === userData.clerkId)?.[0];
        if (key) userIds[key] = existing._id;
        continue;
      }

      const id = await ctx.db.insert("users", {
        ...userData,
        createdAt: args.now,
      });
      
      const key = Object.entries(DEMO_CLERK_IDS).find(([_, v]) => v === userData.clerkId)?.[0];
      if (key) userIds[key] = id;
    }

    return userIds;
  },
});

// Internal: Seed clinics
export const seedClinics = internalMutation({
  args: {},
  handler: async (ctx) => {
    const clinicsData = [
      {
        name: "VetCare Sofia",
        city: "Sofia",
        address: "ul. Vitosha 45",
        phone: "+359 2 987 6543",
        is24h: true,
        specializations: ["Emergency", "Surgery", "Orthopedics"],
        verified: true,
      },
      {
        name: "Animal Hospital Plovdiv",
        city: "Plovdiv",
        address: "bul. Bulgaria 123",
        phone: "+359 32 654 321",
        is24h: true,
        specializations: ["Emergency", "Internal Medicine", "Oncology"],
        verified: true,
      },
      {
        name: "Pet Clinic Varna",
        city: "Varna",
        address: "ul. Primorski 78",
        phone: "+359 52 123 456",
        is24h: false,
        specializations: ["General Practice", "Dentistry"],
        verified: true,
      },
      {
        name: "Dr. Petrov Veterinary",
        city: "Sofia",
        address: "ul. Rakovski 156",
        phone: "+359 2 456 7890",
        is24h: false,
        specializations: ["Surgery", "Dermatology", "Cardiology"],
        verified: true,
      },
      {
        name: "Happy Paws Clinic",
        city: "Burgas",
        address: "ul. Aleksandrovska 34",
        phone: "+359 56 789 012",
        is24h: false,
        specializations: ["General Practice", "Vaccination"],
        verified: false,
      },
      {
        name: "24/7 Emergency Vet",
        city: "Sofia",
        address: "bul. Tsarigradsko Shose 115",
        phone: "+359 2 999 8888",
        is24h: true,
        specializations: ["Emergency", "Critical Care", "Surgery"],
        verified: true,
      },
    ];

    const ids: string[] = [];
    for (const clinic of clinicsData) {
      // Check if exists by name + city
      const existing = await ctx.db
        .query("clinics")
        .filter((q) => 
          q.and(
            q.eq(q.field("name"), clinic.name),
            q.eq(q.field("city"), clinic.city)
          )
        )
        .first();

      if (existing) {
        ids.push(existing._id);
        continue;
      }

      const id = await ctx.db.insert("clinics", clinic);
      ids.push(id);
    }

    return ids;
  },
});

// Internal: Seed cases
export const seedCases = internalMutation({
  args: { 
    userId: v.string(),
    clinicId: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const casesData = [
      {
        type: "urgent" as const,
        category: "medical" as const,
        language: "en",
        title: "Luna - Emergency Surgery Needed",
        description: "Luna was found injured on the street and needs immediate surgery for a broken leg.",
        story: "Luna is a sweet 2-year-old dog found by a kind passerby near Borisova Gradina park. She was limping badly and clearly in pain. X-rays revealed a complex fracture that requires surgical intervention.\n\nThe surgery is estimated at 500 EUR including post-operative care. Luna is currently stable but needs help urgently.",
        location: { city: "Sofia", neighborhood: "Center" },
        fundraising: { goal: 500, current: 320, currency: "EUR" },
        status: "active" as const,
      },
      {
        type: "critical" as const,
        category: "surgery" as const,
        language: "en",
        title: "Max - Critical Care After Accident",
        description: "Max was hit by a car and needs emergency surgery and intensive care.",
        story: "Max is a brave 4-year-old mixed breed who was struck by a vehicle in Plovdiv's Kapana district. He sustained multiple injuries including internal bleeding.\n\nThe veterinary team has stabilized him but he needs surgery within 48 hours. Every contribution can help save Max's life.",
        location: { city: "Plovdiv", neighborhood: "Kapana" },
        fundraising: { goal: 800, current: 450, currency: "EUR" },
        status: "active" as const,
      },
      {
        type: "adopted" as const,
        category: "rescue" as const,
        language: "en",
        title: "Bella - Success Story!",
        description: "Bella has found her forever home after a full recovery.",
        story: "Bella's journey started when she was found abandoned in Burgas. Thanks to the generosity of donors, she received full medical treatment, was vaccinated, and neutered.\n\nAfter 3 months of rehabilitation, Bella was adopted by a loving family in January 2024. She now lives happily with her new family and two kids!",
        location: { city: "Burgas", neighborhood: "Sea Garden" },
        fundraising: { goal: 600, current: 600, currency: "EUR" },
        status: "closed" as const,
      },
      {
        type: "recovering" as const,
        category: "shelter" as const,
        language: "en",
        title: "Charlie - Recovering Well",
        description: "Charlie is recovering from surgery and needs continued care and food.",
        story: "Charlie underwent successful surgery last week and is now in recovery. He's responding well to treatment but still needs 2 more weeks of special care, medication, and quality food.\n\nYour support helps us provide Charlie with everything he needs to make a full recovery and find his forever home.",
        location: { city: "Varna", neighborhood: "Asparuhovo" },
        fundraising: { goal: 1000, current: 180, currency: "EUR" },
        status: "active" as const,
      },
    ];

    const ids: string[] = [];
    const userIdTyped = args.userId as any; // Will be Id<"users">
    const clinicIdTyped = args.clinicId as any;

    for (const caseData of casesData) {
      const id = await ctx.db.insert("cases", {
        userId: userIdTyped,
        type: caseData.type,
        category: caseData.category,
        language: caseData.language,
        title: caseData.title,
        description: caseData.description,
        story: caseData.story,
        images: [], // No images for demo (would need storage upload)
        location: {
          city: caseData.location.city,
          neighborhood: caseData.location.neighborhood,
        },
        clinicId: clinicIdTyped,
        foundAt: args.now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        fundraising: caseData.fundraising,
        status: caseData.status,
        updates: [
          {
            date: args.now - 5 * 24 * 60 * 60 * 1000,
            text: "Initial assessment completed. Treatment plan established.",
          },
          {
            date: args.now - 2 * 24 * 60 * 60 * 1000,
            text: "Progress update: Patient is responding well to treatment.",
          },
        ],
        createdAt: args.now - 7 * 24 * 60 * 60 * 1000,
      });
      ids.push(id);
    }

    return ids;
  },
});

// Internal: Seed donations
export const seedDonations = internalMutation({
  args: {
    userIds: v.array(v.string()),
    caseIds: v.array(v.string()),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const donationsData = [
      { amount: 50, currency: "EUR", daysAgo: 2, message: "Get well soon!" },
      { amount: 30, currency: "EUR", daysAgo: 7, message: "Hope this helps" },
      { amount: 25, currency: "EUR", daysAgo: 14, message: null },
      { amount: 100, currency: "EUR", daysAgo: 30, message: "Supporting the cause" },
      { amount: 15, currency: "EUR", daysAgo: 3, message: null },
      { amount: 75, currency: "EUR", daysAgo: 10, message: "For Luna's surgery" },
      { amount: 20, currency: "EUR", daysAgo: 5, message: null },
      { amount: 40, currency: "EUR", daysAgo: 1, message: "Keep up the great work!" },
    ];

    const ids: string[] = [];

    for (let i = 0; i < donationsData.length; i++) {
      const donation = donationsData[i];
      const userId = args.userIds[i % args.userIds.length] as any;
      const caseId = args.caseIds[i % args.caseIds.length] as any;

      const id = await ctx.db.insert("donations", {
        userId,
        caseId,
        amount: donation.amount,
        currency: donation.currency,
        status: "completed",
        message: donation.message ?? undefined,
        anonymous: i % 3 === 0, // Every 3rd is anonymous
        createdAt: args.now - donation.daysAgo * 24 * 60 * 60 * 1000,
      });
      ids.push(id);
    }

    return ids;
  },
});

// Internal: Seed community posts
export const seedCommunityPosts = internalMutation({
  args: {
    userIds: v.array(v.string()),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const postsData = [
      {
        content: "📋 Welcome to the PawsSafe Community!\n\n🐾 Be respectful and kind to all members\n🐾 Share positive stories and updates\n🐾 No spam or self-promotion\n🐾 Report any animal abuse immediately\n🐾 Help each other - we're all here for the animals!",
        isPinned: true,
        isRules: true,
        hoursAgo: 720, // 30 days
      },
      {
        content: "Just picked up Luna from the vet clinic! 🎉 Her surgery went perfectly and she's already wagging her tail. Thank you SO much to everyone who donated - you literally saved her life! Will post more updates as she recovers. ❤️🐕",
        isPinned: false,
        isRules: false,
        hoursAgo: 2,
      },
      {
        content: "Looking for volunteers this Saturday for our monthly shelter cleanup! We'll be at Happy Paws Shelter in Sofia from 10am-2pm. Lunch provided! 🧹🐱\n\nComment below if you can make it!",
        isPinned: false,
        isRules: false,
        hoursAgo: 5,
      },
      {
        content: "Has anyone had experience with the VetCare Sofia clinic? Thinking of taking my rescue there for a checkup. Would love to hear recommendations! 🏥",
        isPinned: false,
        isRules: false,
        hoursAgo: 24,
      },
      {
        content: "URGENT: Found a small kitten near NDK, looks about 4-5 weeks old. Currently keeping it warm but need advice on what to feed it. Any foster volunteers available? 🆘🐱",
        isPinned: false,
        isRules: false,
        hoursAgo: 1,
      },
    ];

    const ids: string[] = [];

    for (let i = 0; i < postsData.length; i++) {
      const post = postsData[i];
      const userId = args.userIds[i % args.userIds.length] as any;

      const id = await ctx.db.insert("communityPosts", {
        userId,
        content: post.content,
        isPinned: post.isPinned,
        isRules: post.isRules,
        createdAt: args.now - post.hoursAgo * 60 * 60 * 1000,
      });
      ids.push(id);
    }

    return ids;
  },
});

// Internal: Seed achievements
export const seedAchievements = internalMutation({
  args: {
    userId: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const achievementTypes = [
      "first_donation",
      "helped_10",
      "big_heart",
      "early_supporter",
      "community_hero",
    ] as const;

    for (const type of achievementTypes) {
      await ctx.db.insert("achievements", {
        userId: args.userId as any,
        type,
        unlockedAt: args.now - Math.random() * 30 * 24 * 60 * 60 * 1000,
      });
    }

    return achievementTypes.length;
  },
});

// Internal: Seed adoptions
export const seedAdoptions = internalMutation({
  args: {
    userId: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const adoptionsData = [
      {
        animalType: "dog" as const,
        name: "Rocky",
        age: "2 years",
        description: "Rocky is an energetic and friendly dog who loves to play fetch. He's great with kids and other dogs. Fully vaccinated and neutered.",
        vaccinated: true,
        neutered: true,
        status: "available" as const,
        location: { city: "Sofia", neighborhood: "Mladost" },
      },
      {
        animalType: "cat" as const,
        name: "Whiskers",
        age: "1 year",
        description: "Whiskers is a calm and affectionate cat who enjoys lounging in sunny spots. Perfect for apartment living.",
        vaccinated: true,
        neutered: true,
        status: "available" as const,
        location: { city: "Plovdiv", neighborhood: "Center" },
      },
      {
        animalType: "dog" as const,
        name: "Buddy",
        age: "4 years",
        description: "Buddy is a gentle giant who loves cuddles. He's well-trained and walks great on a leash.",
        vaccinated: true,
        neutered: false,
        status: "pending" as const,
        location: { city: "Varna", neighborhood: "Levski" },
      },
      {
        animalType: "cat" as const,
        name: "Luna",
        age: "6 months",
        description: "Luna is a playful kitten full of energy! She loves toys and will keep you entertained for hours.",
        vaccinated: true,
        neutered: false,
        status: "available" as const,
        location: { city: "Sofia", neighborhood: "Lozenets" },
      },
    ];

    const ids: string[] = [];

    for (const adoption of adoptionsData) {
      const id = await ctx.db.insert("adoptions", {
        userId: args.userId as any,
        animalType: adoption.animalType,
        name: adoption.name,
        age: adoption.age,
        description: adoption.description,
        images: [],
        location: adoption.location,
        vaccinated: adoption.vaccinated,
        neutered: adoption.neutered,
        status: adoption.status,
        createdAt: args.now - Math.random() * 14 * 24 * 60 * 60 * 1000,
      });
      ids.push(id);
    }

    return ids;
  },
});

// Internal: Cleanup all demo data
export const cleanupDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const demoClerkIds = Object.values(DEMO_CLERK_IDS);
    
    // Find all demo users
    const demoUsers = await Promise.all(
      demoClerkIds.map((clerkId) =>
        ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)).unique()
      )
    );

    const demoUserIds = demoUsers.filter(Boolean).map((u) => u!._id);

    // Delete all data owned by demo users
    for (const userId of demoUserIds) {
      // Cases
      const cases = await ctx.db.query("cases").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      for (const c of cases) await ctx.db.delete(c._id);

      // Donations
      const donations = await ctx.db.query("donations").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      for (const d of donations) await ctx.db.delete(d._id);

      // Notifications
      const notifications = await ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      for (const n of notifications) await ctx.db.delete(n._id);

      // Achievements
      const achievements = await ctx.db.query("achievements").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      for (const a of achievements) await ctx.db.delete(a._id);

      // Adoptions
      const adoptions = await ctx.db.query("adoptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      for (const a of adoptions) await ctx.db.delete(a._id);

      // Community posts (after schema update)
      // const posts = await ctx.db.query("communityPosts").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      // for (const p of posts) await ctx.db.delete(p._id);

      // Delete user
      await ctx.db.delete(userId);
    }

    return { deleted: demoUserIds.length };
  },
});
```

### How to Run Seed

```bash
# 1. Set the secret (one time)
npx convex env set DEV_SEED_SECRET "your-secret-here"

# 2. Run seed via Convex dashboard or:
# In browser console when running `npx convex dev`:
# await ctx.runMutation(api.devSeed.seedAll, { secret: "your-secret-here" })

# 3. To reset and reseed:
# await ctx.runMutation(api.devSeed.seedAll, { secret: "your-secret-here", reset: true })
```

### Cleanup Before Production

```bash
# Delete all demo data
npx convex run devSeed:cleanupDemoData
# Or via dashboard
```

---

## 📝 Notes

1. **No over-engineering** - Simple queries/mutations, no complex caching
2. **Convex handles reactivity** - No need for manual cache invalidation
3. **Clerk handles auth state** - Use `useAuth` for UI, `ctx.auth` for backend
4. **Type safety** - Convex provides full TypeScript types automatically
5. **Demo data is tagged** - All demo users have `clerkId` starting with `demo_` for easy identification
