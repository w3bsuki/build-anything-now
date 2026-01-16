import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Achievement definitions
export const ACHIEVEMENT_DETAILS: Record<string, { title: string; description: string; icon: string }> = {
    first_donation: {
        title: "First Steps",
        description: "Made your first donation",
        icon: "🎉",
    },
    monthly_donor: {
        title: "Monthly Hero",
        description: "Donated every month for 3 months",
        icon: "📅",
    },
    helped_10: {
        title: "Helping Hand",
        description: "Helped 10 animals",
        icon: "🐾",
    },
    helped_50: {
        title: "Animal Guardian",
        description: "Helped 50 animals",
        icon: "🛡️",
    },
    helped_100: {
        title: "Legend",
        description: "Helped 100 animals",
        icon: "👑",
    },
    big_heart: {
        title: "Big Heart",
        description: "Single donation over 100 BGN",
        icon: "💖",
    },
    early_supporter: {
        title: "Early Supporter",
        description: "Joined during our first year",
        icon: "⭐",
    },
    community_hero: {
        title: "Community Hero",
        description: "Shared 10 cases with friends",
        icon: "🦸",
    },
    // Role/verification badges
    verified_volunteer: {
        title: "Verified Volunteer",
        description: "Verified volunteer status",
        icon: "✅",
    },
    verified_veterinarian: {
        title: "Verified Veterinarian",
        description: "Licensed veterinarian",
        icon: "🏥",
    },
    verified_groomer: {
        title: "Verified Groomer",
        description: "Professional pet groomer",
        icon: "✂️",
    },
    verified_trainer: {
        title: "Verified Trainer",
        description: "Certified pet trainer",
        icon: "🎓",
    },
    verified_business: {
        title: "Verified Business",
        description: "Verified pet business",
        icon: "🏪",
    },
    verified_shelter: {
        title: "Verified Shelter",
        description: "Verified animal shelter",
        icon: "🏠",
    },
    // Volunteer activity badges
    top_transporter: {
        title: "Top Transporter",
        description: "Transported 10+ animals",
        icon: "🚗",
    },
    foster_hero: {
        title: "Foster Hero",
        description: "Fostered 5+ animals",
        icon: "🏡",
    },
    rescue_champion: {
        title: "Rescue Champion",
        description: "Participated in 10+ rescues",
        icon: "🦸‍♂️",
    },
    event_organizer: {
        title: "Event Organizer",
        description: "Organized community events",
        icon: "📋",
    },
    // Special badges
    founding_member: {
        title: "Founding Member",
        description: "Early platform supporter",
        icon: "🌟",
    },
    ambassador: {
        title: "Ambassador",
        description: "Community ambassador",
        icon: "🎖️",
    },
};

// Get all achievements for current user
export const getMyAchievements = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        return achievements.map((a) => ({
            ...a,
            ...ACHIEVEMENT_DETAILS[a.type],
        }));
    },
});

// Award achievement to user (internal use)
export const award = mutation({
    args: {
        type: v.union(
            v.literal("first_donation"),
            v.literal("monthly_donor"),
            v.literal("helped_10"),
            v.literal("helped_50"),
            v.literal("helped_100"),
            v.literal("big_heart"),
            v.literal("early_supporter"),
            v.literal("community_hero")
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Check if already has this achievement
        const existing = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("type"), args.type))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("achievements", {
            userId: user._id,
            type: args.type,
            unlockedAt: Date.now(),
        });
    },
});
