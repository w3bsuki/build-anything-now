import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

// List all volunteers with optional filters
export const list = query({
    args: {
        topOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let volunteers: Doc<"volunteers">[];
        
        if (args.topOnly) {
            volunteers = await ctx.db
                .query("volunteers")
                .withIndex("by_top", (q) => q.eq("isTopVolunteer", true))
                .collect();
        } else {
            volunteers = await ctx.db.query("volunteers").collect();
        }

        // Enrich with user data
        const enriched = await Promise.all(
            volunteers.map(async (vol) => {
                const user = await ctx.db.get(vol.userId);
                return {
                    ...vol,
                    name: user?.name ?? "Unknown",
                    avatar: user?.avatar,
                };
            })
        );

        // Sort by animals helped descending
        return enriched.sort((a, b) => b.stats.animalsHelped - a.stats.animalsHelped);
    },
});

// Get a single volunteer by ID
export const get = query({
    args: { id: v.id("volunteers") },
    handler: async (ctx, args) => {
        const volunteer = await ctx.db.get(args.id);
        if (!volunteer) return null;

        const user = await ctx.db.get(volunteer.userId);
        return {
            ...volunteer,
            name: user?.name ?? "Unknown",
            avatar: user?.avatar,
            // Never expose user email on public volunteer endpoints.
        };
    },
});
