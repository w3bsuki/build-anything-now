import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all payment methods for current user
export const getMyPaymentMethods = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        return await ctx.db
            .query("paymentMethods")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});

// Add a new payment method
export const add = mutation({
    args: {
        type: v.union(v.literal("card"), v.literal("paypal"), v.literal("bank")),
        name: v.string(),
        lastFour: v.optional(v.string()),
        expiryMonth: v.optional(v.number()),
        expiryYear: v.optional(v.number()),
        isDefault: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // If setting as default, unset other defaults
        if (args.isDefault) {
            const existingMethods = await ctx.db
                .query("paymentMethods")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .collect();

            for (const method of existingMethods) {
                if (method.isDefault) {
                    await ctx.db.patch(method._id, { isDefault: false });
                }
            }
        }

        return await ctx.db.insert("paymentMethods", {
            userId: user._id,
            type: args.type,
            name: args.name,
            lastFour: args.lastFour,
            expiryMonth: args.expiryMonth,
            expiryYear: args.expiryYear,
            isDefault: args.isDefault,
            createdAt: Date.now(),
        });
    },
});

// Remove a payment method
export const remove = mutation({
    args: { id: v.id("paymentMethods") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const method = await ctx.db.get(args.id);
        if (!method) throw new Error("Payment method not found");

        await ctx.db.delete(args.id);
    },
});

// Set payment method as default
export const setDefault = mutation({
    args: { id: v.id("paymentMethods") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Unset all defaults first
        const methods = await ctx.db
            .query("paymentMethods")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        for (const method of methods) {
            await ctx.db.patch(method._id, { isDefault: method._id === args.id });
        }
    },
});
