import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all cases with optional filters
export const list = query({
    args: {
        type: v.optional(v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted"))),
        status: v.optional(v.union(v.literal("active"), v.literal("funded"), v.literal("closed"))),
    },
    handler: async (ctx, args) => {
        let cases;

        if (args.type) {
            cases = await ctx.db
                .query("cases")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .collect();
        } else {
            cases = await ctx.db.query("cases").collect();
        }

        // Filter by status if provided
        if (args.status) {
            return cases.filter(c => c.status === args.status);
        }

        return cases;
    },
});

// Get a single case by ID
export const get = query({
    args: { id: v.id("cases") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get cases by user
export const listByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cases")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

// Create a new case
export const create = mutation({
    args: {
        type: v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted")),
        category: v.union(v.literal("surgery"), v.literal("shelter"), v.literal("food"), v.literal("medical"), v.literal("rescue")),
        title: v.string(),
        description: v.string(),
        story: v.optional(v.string()),
        images: v.array(v.id("_storage")),
        location: v.object({
            city: v.string(),
            neighborhood: v.string(),
            coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
        }),
        clinicId: v.optional(v.id("clinics")),
        foundAt: v.number(),
        broughtToClinicAt: v.optional(v.number()),
        fundraisingGoal: v.number(),
        currency: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        return await ctx.db.insert("cases", {
            userId: user._id,
            type: args.type,
            category: args.category,
            title: args.title,
            description: args.description,
            story: args.story,
            images: args.images,
            location: args.location,
            clinicId: args.clinicId,
            foundAt: args.foundAt,
            broughtToClinicAt: args.broughtToClinicAt,
            fundraising: {
                goal: args.fundraisingGoal,
                current: 0,
                currency: args.currency,
            },
            status: "active",
            updates: [],
            createdAt: Date.now(),
        });
    },
});

// Add update to a case
export const addUpdate = mutation({
    args: {
        caseId: v.id("cases"),
        text: v.string(),
        images: v.optional(v.array(v.id("_storage"))),
    },
    handler: async (ctx, args) => {
        const caseData = await ctx.db.get(args.caseId);
        if (!caseData) throw new Error("Case not found");

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const updates = [...caseData.updates, {
            date: Date.now(),
            text: args.text,
            images: args.images,
        }];

        await ctx.db.patch(args.caseId, { updates });
    },
});
