import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";

// Activity types for the story feed
export const activityTypes = v.union(
    v.literal("donation"),
    v.literal("case_update"),
    v.literal("adoption"),
    v.literal("volunteer_signup"),
    v.literal("case_created"),
    v.literal("milestone"),
    v.literal("system_announcement")
);

export type ActivityType = 
    | "donation"
    | "case_update"
    | "adoption"
    | "volunteer_signup"
    | "case_created"
    | "milestone"
    | "system_announcement";

// Get recent activities for the story circles
export const getRecentActivities = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;
        
        // Fetch recent donations
        const recentDonations = await ctx.db
            .query("donations")
            .filter((q) => q.eq(q.field("status"), "completed"))
            .order("desc")
            .take(limit);

        // Fetch recent cases
        const recentCases = await ctx.db
            .query("cases")
            .order("desc")
            .take(limit);

        // Fetch recent adoptions
        const recentAdoptions = await ctx.db
            .query("adoptions")
            .filter((q) => q.eq(q.field("status"), "adopted"))
            .order("desc")
            .take(limit);

        // Combine and sort by date
        const activities: {
            id: string;
            type: ActivityType;
            userId?: Id<"users">;
            caseId?: Id<"cases">;
            adoptionId?: Id<"adoptions">;
            timestamp: number;
            data: Record<string, unknown>;
        }[] = [];

        // Add donations as activities
        for (const donation of recentDonations) {
            activities.push({
                id: `donation-${donation._id}`,
                type: "donation",
                userId: donation.userId,
                caseId: donation.caseId ?? undefined,
                timestamp: donation.createdAt,
                data: {
                    amount: donation.amount,
                    currency: donation.currency,
                    anonymous: donation.anonymous,
                },
            });
        }

        // Add new cases as activities
        for (const caseDoc of recentCases) {
            activities.push({
                id: `case-${caseDoc._id}`,
                type: "case_created",
                userId: caseDoc.userId,
                caseId: caseDoc._id,
                timestamp: caseDoc.createdAt,
                data: {
                    title: caseDoc.title,
                    caseType: caseDoc.type,
                },
            });

            // Add case updates as separate activities
            for (const update of caseDoc.updates || []) {
                activities.push({
                    id: `update-${caseDoc._id}-${update.date}`,
                    type: "case_update",
                    userId: caseDoc.userId,
                    caseId: caseDoc._id,
                    timestamp: update.date,
                    data: {
                        text: update.text,
                        caseTitle: caseDoc.title,
                        caseType: caseDoc.type,
                    },
                });
            }
        }

        // Add adoptions as activities
        for (const adoption of recentAdoptions) {
            activities.push({
                id: `adoption-${adoption._id}`,
                type: "adoption",
                userId: adoption.userId,
                adoptionId: adoption._id,
                timestamp: adoption.createdAt,
                data: {
                    name: adoption.name,
                    animalType: adoption.animalType,
                },
            });
        }

        // Sort by timestamp descending and take the limit
        activities.sort((a, b) => b.timestamp - a.timestamp);
        const limitedActivities = activities.slice(0, limit);

        // Enrich with user and case data
        const enrichedActivities = await Promise.all(
            limitedActivities.map(async (activity) => {
                let user: Doc<"users"> | null = null;
                let caseData: (Doc<"cases"> & { imageUrl?: string | null }) | null = null;

                if (activity.userId) {
                    user = await ctx.db.get(activity.userId);
                }

                if (activity.caseId) {
                    const caseDoc = await ctx.db.get(activity.caseId);
                    if (caseDoc) {
                        const imageUrl = caseDoc.images[0] 
                            ? await ctx.storage.getUrl(caseDoc.images[0])
                            : null;
                        caseData = { ...caseDoc, imageUrl };
                    }
                }

                return {
                    ...activity,
                    user: user ? {
                        id: user._id,
                        name: user.name,
                        avatar: user.avatar,
                    } : null,
                    case: caseData ? {
                        id: caseData._id,
                        title: caseData.title,
                        type: caseData.type,
                        imageUrl: caseData.imageUrl,
                    } : null,
                };
            })
        );

        return enrichedActivities;
    },
});

// Get stories for a specific user (their activity)
export const getUserStories = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;
        const user = await ctx.db.get(args.userId);
        if (!user) return [];

        const stories: {
            id: string;
            type: "case_update" | "donation" | "milestone" | "case_created";
            timestamp: number;
            imageUrl?: string | null;
            title: string;
            subtitle: string;
            caseId?: Id<"cases">;
        }[] = [];

        // Get user's cases and their updates
        const userCases = await ctx.db
            .query("cases")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(20);

        for (const caseDoc of userCases) {
            const imageUrl = caseDoc.images[0]
                ? await ctx.storage.getUrl(caseDoc.images[0])
                : null;

            // Case creation story
            stories.push({
                id: `case-created-${caseDoc._id}`,
                type: "case_created",
                timestamp: caseDoc.createdAt,
                imageUrl,
                title: caseDoc.title,
                subtitle: `Started a ${caseDoc.type} case`,
                caseId: caseDoc._id,
            });

            // Case updates
            for (const update of caseDoc.updates || []) {
                const updateImageUrl = update.images?.[0]
                    ? await ctx.storage.getUrl(update.images[0])
                    : imageUrl;
                
                stories.push({
                    id: `update-${caseDoc._id}-${update.date}`,
                    type: "case_update",
                    timestamp: update.date,
                    imageUrl: updateImageUrl,
                    title: caseDoc.title,
                    subtitle: update.text.slice(0, 100),
                    caseId: caseDoc._id,
                });
            }
        }

        // Get user's donations
        const userDonations = await ctx.db
            .query("donations")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("status"), "completed"))
            .order("desc")
            .take(10);

        for (const donation of userDonations) {
            if (donation.caseId) {
                const caseDoc = await ctx.db.get(donation.caseId);
                if (caseDoc) {
                    const imageUrl = caseDoc.images[0]
                        ? await ctx.storage.getUrl(caseDoc.images[0])
                        : null;
                    
                    stories.push({
                        id: `donation-${donation._id}`,
                        type: "donation",
                        timestamp: donation.createdAt,
                        imageUrl,
                        title: `Helped ${caseDoc.title}`,
                        subtitle: `Donated ${donation.currency}${donation.amount}`,
                        caseId: caseDoc._id,
                    });
                }
            }
        }

        // Get user achievements for milestones
        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(5);

        const achievementLabels: Record<string, string> = {
            first_donation: "Made first donation! 🎉",
            monthly_donor: "Became a monthly donor 💝",
            helped_10: "Helped 10 animals! 🌟",
            helped_50: "Helped 50 animals! ⭐",
            helped_100: "Helped 100 animals! 🏆",
            big_heart: "Big Heart award 💖",
            early_supporter: "Early supporter badge 🚀",
            community_hero: "Community Hero! 🦸",
        };

        for (const achievement of achievements) {
            stories.push({
                id: `achievement-${achievement._id}`,
                type: "milestone",
                timestamp: achievement.unlockedAt,
                title: "Achievement Unlocked!",
                subtitle: achievementLabels[achievement.type] || achievement.type,
            });
        }

        // Sort by timestamp and return limited
        stories.sort((a, b) => b.timestamp - a.timestamp);
        return stories.slice(0, limit);
    },
});

// Get stories for a specific case
export const getCaseStories = query({
    args: {
        caseId: v.id("cases"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;
        const caseDoc = await ctx.db.get(args.caseId);
        if (!caseDoc) return [];

        const owner = await ctx.db.get(caseDoc.userId);
        const stories: {
            id: string;
            type: "case_update" | "donation" | "milestone" | "case_created";
            timestamp: number;
            imageUrl?: string | null;
            title: string;
            subtitle: string;
            user?: { name: string; avatar?: string };
        }[] = [];

        const caseImageUrl = caseDoc.images[0]
            ? await ctx.storage.getUrl(caseDoc.images[0])
            : null;

        // Case creation
        stories.push({
            id: `case-created-${caseDoc._id}`,
            type: "case_created",
            timestamp: caseDoc.createdAt,
            imageUrl: caseImageUrl,
            title: caseDoc.title,
            subtitle: caseDoc.description.slice(0, 100),
            user: owner ? { name: owner.name, avatar: owner.avatar } : undefined,
        });

        // All updates
        for (const update of caseDoc.updates || []) {
            const updateImageUrl = update.images?.[0]
                ? await ctx.storage.getUrl(update.images[0])
                : caseImageUrl;
            
            stories.push({
                id: `update-${caseDoc._id}-${update.date}`,
                type: "case_update",
                timestamp: update.date,
                imageUrl: updateImageUrl,
                title: "Update",
                subtitle: update.text,
                user: owner ? { name: owner.name, avatar: owner.avatar } : undefined,
            });
        }

        // Donations to this case
        const donations = await ctx.db
            .query("donations")
            .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
            .filter((q) => q.eq(q.field("status"), "completed"))
            .order("desc")
            .take(20);

        for (const donation of donations) {
            const donor = await ctx.db.get(donation.userId);
            stories.push({
                id: `donation-${donation._id}`,
                type: "donation",
                timestamp: donation.createdAt,
                imageUrl: caseImageUrl,
                title: donation.anonymous ? "Anonymous donor" : (donor?.name || "Someone"),
                subtitle: `Donated ${donation.currency}${donation.amount}`,
                user: donation.anonymous ? undefined : (donor ? { name: donor.name, avatar: donor.avatar } : undefined),
            });
        }

        // Check for milestones (funding goals)
        const fundingPercent = (caseDoc.fundraising.current / caseDoc.fundraising.goal) * 100;
        if (fundingPercent >= 100) {
            stories.push({
                id: `milestone-funded-${caseDoc._id}`,
                type: "milestone",
                timestamp: caseDoc.createdAt + 1, // Slightly after creation
                imageUrl: caseImageUrl,
                title: "Fully Funded! 🎉",
                subtitle: `Goal of ${caseDoc.fundraising.currency}${caseDoc.fundraising.goal} reached!`,
            });
        } else if (fundingPercent >= 50) {
            stories.push({
                id: `milestone-half-${caseDoc._id}`,
                type: "milestone",
                timestamp: caseDoc.createdAt + 1,
                imageUrl: caseImageUrl,
                title: "Halfway There! 🌟",
                subtitle: `50% of ${caseDoc.fundraising.currency}${caseDoc.fundraising.goal} raised!`,
            });
        }

        // Sort by timestamp
        stories.sort((a, b) => b.timestamp - a.timestamp);
        return stories.slice(0, limit);
    },
});

// Get placeholder/system stories for empty states
export const getSystemStories = query({
    args: {},
    handler: async () => {
        return [
            {
                id: "welcome",
                type: "system_announcement" as const,
                timestamp: Date.now(),
                title: "Welcome to Pawtreon! 🎉",
                subtitle: "Join our community of animal lovers",
                imageUrl: null,
                emoji: "🎉",
            },
            {
                id: "how-it-works",
                type: "system_announcement" as const,
                timestamp: Date.now() - 1000,
                title: "How It Works",
                subtitle: "Learn how you can help animals in need",
                imageUrl: null,
                emoji: "📖",
            },
            {
                id: "mission",
                type: "system_announcement" as const,
                timestamp: Date.now() - 2000,
                title: "Our Mission",
                subtitle: "Connecting rescuers with supporters",
                imageUrl: null,
                emoji: "🐾",
            },
        ];
    },
});
