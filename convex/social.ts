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

// Get followers of a user
export const getFollowers = query({
    args: { 
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;

        const followers = await ctx.db
            .query("follows")
            .withIndex("by_following", (q) => q.eq("followingId", args.userId))
            .order("desc")
            .take(limit);

        // Get user details
        const followerDetails = await Promise.all(
            followers.map(async (f) => {
                const user = await ctx.db.get(f.followerId);
                if (!user) return null;
                return {
                    id: user._id,
                    name: user.displayName || user.name,
                    avatar: user.avatar,
                    followedAt: f.createdAt,
                };
            })
        );

        return followerDetails.filter(Boolean);
    },
});

// Get users that a user is following
export const getFollowing = query({
    args: { 
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;

        const following = await ctx.db
            .query("follows")
            .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
            .order("desc")
            .take(limit);

        // Get user details
        const followingDetails = await Promise.all(
            following.map(async (f) => {
                const user = await ctx.db.get(f.followingId);
                if (!user) return null;
                return {
                    id: user._id,
                    name: user.displayName || user.name,
                    avatar: user.avatar,
                    followedAt: f.createdAt,
                };
            })
        );

        return followingDetails.filter(Boolean);
    },
});

// Get follow counts for a user
export const getFollowCounts = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const [followers, following] = await Promise.all([
            ctx.db
                .query("follows")
                .withIndex("by_following", (q) => q.eq("followingId", args.userId))
                .collect(),
            ctx.db
                .query("follows")
                .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
                .collect(),
        ]);

        return {
            followerCount: followers.length,
            followingCount: following.length,
        };
    },
});

// ============================================
// MESSAGING SYSTEM (Basic 1:1)
// ============================================

// Send a message
export const sendMessage = mutation({
    args: {
        receiverId: v.id("users"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const sender = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!sender) throw new Error("User not found");

        // Validate content
        const content = args.content.trim();
        if (!content) throw new Error("Message cannot be empty");
        if (content.length > 2000) throw new Error("Message too long (max 2000 characters)");

        // Can't message yourself
        if (sender._id === args.receiverId) {
            throw new Error("Cannot message yourself");
        }

        const messageId = await ctx.db.insert("messages", {
            senderId: sender._id,
            receiverId: args.receiverId,
            content,
            read: false,
            createdAt: Date.now(),
        });

        return messageId;
    },
});

// Get conversation between two users
export const getConversation = query({
    args: {
        otherUserId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        const limit = args.limit ?? 50;

        // Get messages where current user is sender or receiver
        const sentMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => 
                q.eq("senderId", currentUser._id).eq("receiverId", args.otherUserId)
            )
            .collect();

        const receivedMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => 
                q.eq("senderId", args.otherUserId).eq("receiverId", currentUser._id)
            )
            .collect();

        // Combine and sort by date
        const allMessages = [...sentMessages, ...receivedMessages]
            .sort((a, b) => a.createdAt - b.createdAt)
            .slice(-limit);

        return allMessages.map(m => ({
            id: m._id,
            content: m.content,
            senderId: m.senderId,
            receiverId: m.receiverId,
            read: m.read,
            createdAt: m.createdAt,
            isOwn: m.senderId === currentUser._id,
        }));
    },
});

// Get conversation list (recent chats)
export const getConversationList = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        // Get all messages involving current user
        const sentMessages = await ctx.db
            .query("messages")
            .withIndex("by_sender", (q) => q.eq("senderId", currentUser._id))
            .collect();

        const receivedMessages = await ctx.db
            .query("messages")
            .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
            .collect();

        // Find unique conversation partners with last message
        const conversationMap = new Map<string, { otherUserId: string; lastMessage: typeof sentMessages[0] }>();

        for (const msg of [...sentMessages, ...receivedMessages]) {
            const otherUserId = msg.senderId === currentUser._id 
                ? msg.receiverId 
                : msg.senderId;
            
            const existing = conversationMap.get(otherUserId.toString());
            if (!existing || msg.createdAt > existing.lastMessage.createdAt) {
                conversationMap.set(otherUserId.toString(), {
                    otherUserId: otherUserId.toString(),
                    lastMessage: msg,
                });
            }
        }

        // Sort by most recent and get user details
        const conversations = Array.from(conversationMap.values())
            .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

        const conversationDetails = await Promise.all(
            conversations.map(async (conv) => {
                const users = await ctx.db.query("users").collect();
                const otherUser = users.find(u => u._id.toString() === conv.otherUserId);
                
                if (!otherUser) return null;

                // Count unread messages from this user
                const unreadCount = receivedMessages.filter(
                    m => m.senderId.toString() === conv.otherUserId && !m.read
                ).length;

                return {
                    id: otherUser._id,
                    name: otherUser.displayName || otherUser.name,
                    avatar: otherUser.avatar,
                    lastMessage: conv.lastMessage.content,
                    lastMessageAt: conv.lastMessage.createdAt,
                    unreadCount,
                };
            })
        );

        return conversationDetails.filter(Boolean);
    },
});

// Mark messages as read
export const markMessagesRead = mutation({
    args: { senderId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Get unread messages from sender
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => 
                q.eq("senderId", args.senderId).eq("receiverId", currentUser._id)
            )
            .filter((q) => q.eq(q.field("read"), false))
            .collect();

        // Mark all as read
        await Promise.all(
            unreadMessages.map((m) => ctx.db.patch(m._id, { read: true }))
        );

        return { markedCount: unreadMessages.length };
    },
});

// Get unread message count
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return 0;

        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
            .filter((q) => q.eq(q.field("read"), false))
            .collect();

        return unreadMessages.length;
    },
});