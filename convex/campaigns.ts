import { v } from "convex/values";
import { query } from "./_generated/server";

// List all campaigns with optional status filter
export const list = query({
    args: {
        status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled"))),
    },
    handler: async (ctx, args) => {
        let campaigns = await ctx.db.query("campaigns").collect();

        if (args.status) {
            campaigns = campaigns.filter(c => c.status === args.status);
        }

        // Sort by created date descending
        return campaigns.sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Get a single campaign by ID
export const get = query({
    args: { id: v.id("campaigns") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get featured/trending campaigns (highest progress %)
export const getTrending = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 3;
        const campaigns = await ctx.db
            .query("campaigns")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        // Sort by progress percentage
        return campaigns
            .map(c => ({ ...c, progress: c.goal > 0 ? (c.current / c.goal) * 100 : 0 }))
            .sort((a, b) => b.progress - a.progress)
            .slice(0, limit);
    },
});
