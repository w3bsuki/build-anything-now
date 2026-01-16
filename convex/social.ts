import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/auth";

// Toggle like on a case
export const toggleLike = mutation({
    args: {
        caseId: v.id("cases"),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Check if already liked
        const existingLike = await ctx.db
            .query("likes")
            .withIndex("by_user_case", (q) =>
                q.eq("userId", user._id).eq("caseId", args.caseId)
            )
            .unique();

        if (existingLike) {
            // Unlike - remove the like
            await ctx.db.delete(existingLike._id);
            return { liked: false };
        } else {
            // Like - create new like
            await ctx.db.insert("likes", {
                userId: user._id,
                caseId: args.caseId,
                createdAt: Date.now(),
            });
            return { liked: true };
        }
    },
});

// Check if user has liked a case
export const hasLiked = query({
    args: {
        caseId: v.id("cases"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return false;

        const like = await ctx.db
            .query("likes")
            .withIndex("by_user_case", (q) =>
                q.eq("userId", user._id).eq("caseId", args.caseId)
            )
            .unique();

        return !!like;
    },
});

// Get like count for a case
export const getLikeCount = query({
    args: {
        caseId: v.id("cases"),
    },
    handler: async (ctx, args) => {
        const likes = await ctx.db
            .query("likes")
            .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
            .collect();

        return likes.length;
    },
});

// Get like status and count for multiple cases (batch)
export const getLikesBatch = query({
    args: {
        caseIds: v.array(v.id("cases")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        let userId: string | null = null;

        if (identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .unique();
            userId = user?._id ?? null;
        }

        const results: Record<string, { count: number; liked: boolean }> = {};

        await Promise.all(
            args.caseIds.map(async (caseId) => {
                const likes = await ctx.db
                    .query("likes")
                    .withIndex("by_case", (q) => q.eq("caseId", caseId))
                    .collect();

                let liked = false;
                if (userId) {
                    liked = likes.some((l) => l.userId === userId);
                }

                results[caseId] = {
                    count: likes.length,
                    liked,
                };
            })
        );

        return results;
    },
});

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

// Delete a comment (owner only)
export const deleteComment = mutation({
    args: {
        commentId: v.id("comments"),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const comment = await ctx.db.get(args.commentId);

        if (!comment) {
            throw new Error("Comment not found");
        }

        if (comment.userId !== user._id && user.role !== "admin") {
            throw new Error("Not authorized to delete this comment");
        }

        await ctx.db.delete(args.commentId);
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

// Get comment count for a case
export const getCommentCount = query({
    args: {
        caseId: v.id("cases"),
    },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
            .collect();

        return comments.length;
    },
});

// Get comment counts for multiple cases (batch)
export const getCommentCountBatch = query({
    args: {
        caseIds: v.array(v.id("cases")),
    },
    handler: async (ctx, args) => {
        const results: Record<string, number> = {};

        await Promise.all(
            args.caseIds.map(async (caseId) => {
                const comments = await ctx.db
                    .query("comments")
                    .withIndex("by_case", (q) => q.eq("caseId", caseId))
                    .collect();
                results[caseId] = comments.length;
            })
        );

        return results;
    },
});

// Get social stats for multiple cases (likes + comments combined)
export const getSocialStats = query({
    args: {
        caseIds: v.array(v.id("cases")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        let userId: string | null = null;

        if (identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .unique();
            userId = user?._id ?? null;
        }

        const results: Record<string, { likeCount: number; commentCount: number; liked: boolean }> = {};

        await Promise.all(
            args.caseIds.map(async (caseId) => {
                const [likes, comments] = await Promise.all([
                    ctx.db
                        .query("likes")
                        .withIndex("by_case", (q) => q.eq("caseId", caseId))
                        .collect(),
                    ctx.db
                        .query("comments")
                        .withIndex("by_case", (q) => q.eq("caseId", caseId))
                        .collect(),
                ]);

                let liked = false;
                if (userId) {
                    liked = likes.some((l) => l.userId === userId);
                }

                results[caseId] = {
                    likeCount: likes.length,
                    commentCount: comments.length,
                    liked,
                };
            })
        );

        return results;
    },
});
