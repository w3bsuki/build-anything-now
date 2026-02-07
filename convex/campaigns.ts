import { v } from "convex/values";
import { query } from "./_generated/server";

function normalizeCampaignType(type: string | undefined): "rescue" | "initiative" {
  return type === "initiative" ? "initiative" : "rescue";
}

// List campaigns with optional status/type filters
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled"))),
    campaignType: v.optional(v.union(v.literal("rescue"), v.literal("initiative"))),
  },
  handler: async (ctx, args) => {
    let campaigns = await ctx.db.query("campaigns").collect();

    if (args.status) {
      campaigns = campaigns.filter((c) => c.status === args.status);
    }

    if (args.campaignType) {
      campaigns = campaigns.filter((c) => normalizeCampaignType(c.campaignType) === args.campaignType);
    }

    return campaigns
      .map((c) => ({
        ...c,
        campaignType: normalizeCampaignType(c.campaignType),
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get a single campaign by ID
export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) return null;

    return {
      ...campaign,
      campaignType: normalizeCampaignType(campaign.campaignType),
    };
  },
});

// Get featured platform initiatives for home/account surfaces
export const getFeaturedInitiatives = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 2;
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return campaigns
      .filter((c) => normalizeCampaignType(c.campaignType) === "initiative")
      .sort((a, b) => {
        const aFeatured = a.featuredInitiative ? 1 : 0;
        const bFeatured = b.featuredInitiative ? 1 : 0;
        if (aFeatured !== bFeatured) return bFeatured - aFeatured;
        return b.createdAt - a.createdAt;
      })
      .slice(0, limit)
      .map((c) => ({
        ...c,
        campaignType: "initiative" as const,
        progress: c.goal > 0 ? (c.current / c.goal) * 100 : 0,
      }));
  },
});
