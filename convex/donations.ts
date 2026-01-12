import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all donations for current user
export const getMyDonations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const donations = await ctx.db
            .query("donations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        // Enrich with case data
        const enrichedDonations = await Promise.all(
            donations.map(async (donation) => {
                let caseName = null;
                let caseImage = null;

                if (donation.caseId) {
                    const caseData = await ctx.db.get(donation.caseId);
                    if (caseData) {
                        caseName = caseData.title;
                        if (caseData.images.length > 0) {
                            caseImage = await ctx.storage.getUrl(caseData.images[0]);
                        }
                    }
                }

                return {
                    ...donation,
                    caseName,
                    caseImage,
                };
            })
        );

        return enrichedDonations;
    },
});

// Get donation stats for current user
export const getMyStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalDonations: 0, totalAmount: 0, animalsHelped: 0 };

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return { totalDonations: 0, totalAmount: 0, animalsHelped: 0 };

        const donations = await ctx.db
            .query("donations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "completed"))
            .collect();

        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const uniqueCases = new Set(donations.filter(d => d.caseId).map(d => d.caseId));

        return {
            totalDonations: donations.length,
            totalAmount,
            animalsHelped: uniqueCases.size,
        };
    },
});

// Create a new donation
export const create = mutation({
    args: {
        caseId: v.optional(v.id("cases")),
        campaignId: v.optional(v.string()),
        amount: v.number(),
        currency: v.string(),
        message: v.optional(v.string()),
        anonymous: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        return await ctx.db.insert("donations", {
            userId: user._id,
            caseId: args.caseId,
            campaignId: args.campaignId,
            amount: args.amount,
            currency: args.currency,
            status: "pending",
            message: args.message,
            anonymous: args.anonymous,
            createdAt: Date.now(),
        });
    },
});
