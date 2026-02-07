import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, assertOwnership } from "./lib/auth";

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

// Remove a payment method
export const remove = mutation({
    args: { id: v.id("paymentMethods") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const method = await ctx.db.get(args.id);
        if (!method) throw new Error("Payment method not found");
        assertOwnership(user, method.userId, "payment method");
        await ctx.db.delete(args.id);
    },
});

// Set payment method as default
export const setDefault = mutation({
    args: { id: v.id("paymentMethods") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const target = await ctx.db.get(args.id);
        if (!target) throw new Error("Payment method not found");
        assertOwnership(user, target.userId, "payment method");

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
