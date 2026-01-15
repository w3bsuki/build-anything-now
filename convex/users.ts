import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// List all users (dev only)
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

// Get current user by Clerk ID
export const getByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

// Create or update user (internal only - called from Clerk webhook, not directly from client)
export const upsert = internalMutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                avatar: args.avatar,
            });
            return existing._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            avatar: args.avatar,
            role: "user",
            createdAt: Date.now(),
        });
    },
});

// Get current user profile
export const me = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

// Complete onboarding - sets user type and marks onboarding as complete
// Temporary: accepts email as fallback when auth isn't working
export const completeOnboarding = mutation({
    args: {
        userType: v.union(v.literal("individual"), v.literal("organization")),
        email: v.optional(v.string()), // Fallback for auth issues
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        
        let user;
        
        if (identity) {
            // Normal flow - auth is working
            user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .unique();

            // Auto-create user if they don't exist (webhook may have failed)
            if (!user) {
                const userId = await ctx.db.insert("users", {
                    clerkId: identity.subject,
                    name: identity.name || identity.givenName || "User",
                    email: identity.email || "",
                    avatar: identity.pictureUrl,
                    role: "user",
                    createdAt: Date.now(),
                    userType: args.userType,
                    onboardingCompleted: true,
                    onboardingCompletedAt: Date.now(),
                });
                return { success: true, userId };
            }
        } else if (args.email) {
            // Fallback - use email to find user (temporary workaround)
            user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), args.email))
                .unique();
            
            if (!user) {
                throw new Error("User not found with that email");
            }
        } else {
            throw new Error("Not authenticated and no email provided");
        }

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

        return { success: true };
    },
});

// Skip product tour (same as complete but allows distinction in analytics)
export const skipProductTour = mutation({
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

        return { success: true };
    },
});

// Get top heroes (users who helped most animals) for homepage
export const getTopHeroes = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;

        // Get all cases and count by userId
        const cases = await ctx.db.query("cases").collect();

        // Count cases per user
        const userCounts = new Map<string, number>();
        for (const c of cases) {
            const count = userCounts.get(c.userId.toString()) ?? 0;
            userCounts.set(c.userId.toString(), count + 1);
        }

        // Get user details for top helpers
        const topUserIds = Array.from(userCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);

        const heroes = await Promise.all(
            topUserIds.map(async ([userIdStr, count]) => {
                // Find user by iterating (since we have string ID)
                const users = await ctx.db.query("users").collect();
                const user = users.find(u => u._id.toString() === userIdStr);
                
                if (!user) return null;

                return {
                    id: user._id,
                    name: user.name,
                    avatar: user.avatar,
                    animalsHelped: count,
                };
            })
        );

        return heroes.filter(Boolean);
    },
});

// Reset onboarding for a user (dev only)
export const resetOnboarding = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique();
        
        if (!user) throw new Error("User not found");
        
        await ctx.db.patch(user._id, {
            onboardingCompleted: false,
            onboardingCompletedAt: undefined,
            userType: undefined,
            productTourCompleted: false,
            productTourCompletedAt: undefined,
        });
        
        return { success: true, user: user.email };
    },
});

