import { v } from "convex/values";
import { query } from "./_generated/server";

// List all partners with optional filters
export const list = query({
    args: {
        type: v.optional(v.union(
            v.literal("pet-shop"),
            v.literal("food-brand"),
            v.literal("veterinary"),
            v.literal("sponsor")
        )),
        featured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let partners = await ctx.db.query("partners").collect();

        if (args.type) {
            partners = partners.filter(p => p.type === args.type);
        }

        if (args.featured !== undefined) {
            partners = partners.filter(p => p.featured === args.featured);
        }

        // Sort by total contributed descending
        return partners.sort((a, b) => b.totalContributed - a.totalContributed);
    },
});

// Get a single partner by ID
export const get = query({
    args: { id: v.id("partners") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get featured partners
export const getFeatured = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 4;
        const partners = await ctx.db
            .query("partners")
            .withIndex("by_featured", (q) => q.eq("featured", true))
            .collect();

        return partners.slice(0, limit);
    },
});

// Get partner stats summary
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const partners = await ctx.db.query("partners").collect();
        
        return {
            totalPartners: partners.length,
            totalAnimalsHelped: partners.reduce((sum, p) => sum + p.animalsHelped, 0),
            totalContributed: partners.reduce((sum, p) => sum + p.totalContributed, 0),
        };
    },
});
