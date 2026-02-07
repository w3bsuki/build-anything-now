import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/auth";

// Add a comment to a case
export const addComment = mutation({
    args: {
        caseId: v.id("cases"),
        content: v.string(),
        parentId: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Validate content
        const content = args.content.trim();
        if (!content) {
            throw new Error("Comment cannot be empty");
        }
        if (content.length > 1000) {
            throw new Error("Comment is too long (max 1000 characters)");
        }

        // Validate parent if provided
        if (args.parentId) {
            const parent = await ctx.db.get(args.parentId);
            if (!parent || parent.caseId !== args.caseId) {
                throw new Error("Invalid parent comment");
            }
        }

        const commentId = await ctx.db.insert("comments", {
            userId: user._id,
            caseId: args.caseId,
            content,
            parentId: args.parentId,
            createdAt: Date.now(),
        });

        return commentId;
    },
});

// Get comments for a case with user info
export const getComments = query({
    args: {
        caseId: v.id("cases"),
        limit: v.optional(v.number()),
        cursor: v.optional(v.number()), // timestamp for pagination
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;

        const commentsQuery = ctx.db
            .query("comments")
            .withIndex("by_case_created", (q) => q.eq("caseId", args.caseId));

        // Apply cursor (get comments older than cursor)
        const comments = await commentsQuery.order("desc").collect();

        // Apply cursor filter manually (since we need descending order)
        let filteredComments = comments;
        if (args.cursor) {
            filteredComments = comments.filter((c) => c.createdAt < args.cursor!);
        }

        // Apply limit
        const paginatedComments = filteredComments.slice(0, limit);

        // Get user info for each comment
        const commentsWithUser = await Promise.all(
            paginatedComments.map(async (comment) => {
                const user = await ctx.db.get(comment.userId);
                return {
                    id: comment._id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    parentId: comment.parentId ?? null,
                    user: user
                        ? {
                              id: user._id,
                              name: user.name,
                              avatar: user.avatar ?? null,
                          }
                        : {
                              id: comment.userId,
                              name: "Unknown",
                              avatar: null,
                          },
                };
            })
        );

        // Calculate next cursor
        const hasMore = filteredComments.length > limit;
        const nextCursor = paginatedComments.length > 0
            ? paginatedComments[paginatedComments.length - 1].createdAt
            : null;

        return {
            comments: commentsWithUser,
            nextCursor: hasMore ? nextCursor : null,
        };
    },
});

// ============================================
// FOLLOW SYSTEM
// ============================================

// Toggle follow a user
export const toggleFollow = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Can't follow yourself
        if (currentUser._id === args.userId) {
            throw new Error("Cannot follow yourself");
        }

        // Check if already following
        const existing = await ctx.db
            .query("follows")
            .withIndex("by_follower_following", (q) => 
                q.eq("followerId", currentUser._id).eq("followingId", args.userId)
            )
            .unique();

        if (existing) {
            // Unfollow
            await ctx.db.delete(existing._id);
            return { following: false };
        } else {
            // Follow
            await ctx.db.insert("follows", {
                followerId: currentUser._id,
                followingId: args.userId,
                createdAt: Date.now(),
            });
            return { following: true };
        }
    },
});

// Check if current user is following a user
export const isFollowing = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return false;

        const follow = await ctx.db
            .query("follows")
            .withIndex("by_follower_following", (q) => 
                q.eq("followerId", currentUser._id).eq("followingId", args.userId)
            )
            .unique();

        return !!follow;
    },
});
