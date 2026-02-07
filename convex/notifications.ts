import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, assertOwnership } from "./lib/auth";

// Get all notifications for current user
export const getMyNotifications = query({
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
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

// Get unread notification count
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("read", false))
            .collect();

        return unread.length;
    },
});

// Mark notification as read
export const markAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const notification = await ctx.db.get(args.id);
        if (!notification) throw new Error("Notification not found");
        assertOwnership(user, notification.userId, "notification");
        await ctx.db.patch(args.id, { read: true });
    },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("read", false))
            .collect();

        for (const notification of unread) {
            await ctx.db.patch(notification._id, { read: true });
        }
    },
});

// Delete a notification
export const remove = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const notification = await ctx.db.get(args.id);
        if (!notification) throw new Error("Notification not found");
        assertOwnership(user, notification.userId, "notification");
        await ctx.db.delete(args.id);
    },
});
