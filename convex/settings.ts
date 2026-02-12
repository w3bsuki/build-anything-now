import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_SETTINGS = {
    emailNotifications: true,
    pushNotifications: true,
    donationReminders: true,
    marketingEmails: false,
    language: "en",
    currency: "BGN",
} as const;

export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return DEFAULT_SETTINGS;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return DEFAULT_SETTINGS;

        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique();

        if (!existing) {
            return {
                ...DEFAULT_SETTINGS,
                // Prefer an already-selected locale if present (i18next caches this in localStorage on the client).
                language: DEFAULT_SETTINGS.language,
            };
        }

        return {
            emailNotifications: existing.emailNotifications,
            pushNotifications: existing.pushNotifications,
            donationReminders: existing.donationReminders,
            marketingEmails: existing.marketingEmails,
            language: existing.language,
            currency: existing.currency,
        };
    },
});

// Update user settings
export const update = mutation({
    args: {
        emailNotifications: v.optional(v.boolean()),
        pushNotifications: v.optional(v.boolean()),
        donationReminders: v.optional(v.boolean()),
        marketingEmails: v.optional(v.boolean()),
        language: v.optional(v.string()),
        currency: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...(args.emailNotifications !== undefined && { emailNotifications: args.emailNotifications }),
                ...(args.pushNotifications !== undefined && { pushNotifications: args.pushNotifications }),
                ...(args.donationReminders !== undefined && { donationReminders: args.donationReminders }),
                ...(args.marketingEmails !== undefined && { marketingEmails: args.marketingEmails }),
                ...(args.language !== undefined && { language: args.language }),
                ...(args.currency !== undefined && { currency: args.currency }),
            });
            return existing._id;
        }

        return await ctx.db.insert("userSettings", {
            userId: user._id,
            emailNotifications: args.emailNotifications ?? true,
            pushNotifications: args.pushNotifications ?? true,
            donationReminders: args.donationReminders ?? true,
            marketingEmails: args.marketingEmails ?? false,
            language: args.language ?? "en",
            currency: args.currency ?? "BGN",
        });
    },
});
