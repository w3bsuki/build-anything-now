import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "./lib/auth";

async function collectUserDataExport(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  const [
    userSettings,
    donations,
    subscriptions,
    cases,
    achievements,
    paymentMethods,
    notifications,
    savedCases,
    followsAsFollower,
    followsAsFollowing,
    messagesSent,
    messagesReceived,
    comments,
    reports,
    communityPosts,
    communityComments,
    communityReports,
    volunteerProfile,
    pushTokens,
    auditLogs,
  ] = await Promise.all([
    ctx.db.query("userSettings").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
    ctx.db.query("donations").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("cases").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("achievements").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("paymentMethods").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("savedCases").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("follows").withIndex("by_follower", (q) => q.eq("followerId", userId)).collect(),
    ctx.db.query("follows").withIndex("by_following", (q) => q.eq("followingId", userId)).collect(),
    ctx.db.query("messages").withIndex("by_sender", (q) => q.eq("senderId", userId)).collect(),
    ctx.db.query("messages").withIndex("by_receiver", (q) => q.eq("receiverId", userId)).collect(),
    ctx.db.query("comments").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("reports").withIndex("by_reporter", (q) => q.eq("reporterId", userId)).collect(),
    ctx.db.query("communityPosts").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("communityComments").withIndex("by_author", (q) => q.eq("authorId", userId)).collect(),
    ctx.db.query("communityReports").withIndex("by_reporter", (q) => q.eq("reporterId", userId)).collect(),
    ctx.db.query("volunteers").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
    ctx.db.query("pushTokens").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("auditLogs").withIndex("by_actor", (q) => q.eq("actorId", userId)).collect(),
  ]);

  return {
    generatedAt: Date.now(),
    user,
    settings: userSettings,
    donations,
    subscriptions,
    cases,
    achievements,
    paymentMethods,
    notifications,
    savedCases,
    follows: {
      following: followsAsFollower,
      followers: followsAsFollowing,
    },
    messages: {
      sent: messagesSent,
      received: messagesReceived,
    },
    comments,
    reports,
    community: {
      posts: communityPosts,
      comments: communityComments,
      reports: communityReports,
    },
    volunteerProfile,
    pushTokens,
    auditLogs,
  };
}

export const createDataExport = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const payload = await collectUserDataExport(ctx, userId);
    if (!payload) throw new Error("User not found");

    await ctx.db.insert("auditLogs", {
      actorId: userId,
      entityType: "user",
      entityId: String(userId),
      action: "user.gdpr_export_requested",
      createdAt: Date.now(),
    });

    return payload;
  },
});

export const getUserIdByClerkId = internalQuery({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user?._id ?? null;
  },
});

export const getUserDataExport = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return collectUserDataExport(ctx, args.userId);
  },
});

export const logDataExportRequest = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      actorId: args.userId,
      entityType: "user",
      entityId: String(args.userId),
      action: "user.gdpr_export_requested",
      createdAt: Date.now(),
    });
  },
});
