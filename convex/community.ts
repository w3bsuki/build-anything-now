import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, optionalUser } from "./lib/auth";

// List community posts
export const list = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;

        // Get pinned posts first
        const pinnedPosts = await ctx.db
            .query("communityPosts")
            .withIndex("by_pinned", (q) => q.eq("isPinned", true))
            .collect();

        // Get regular posts
        const regularPosts = await ctx.db
            .query("communityPosts")
            .withIndex("by_created")
            .order("desc")
            .collect();

        // Combine: pinned first, then by date
        const allPosts = [
            ...pinnedPosts,
            ...regularPosts.filter(p => !p.isPinned),
        ].slice(0, limit);

        // Enrich with user data
        return await Promise.all(
            allPosts.map(async (post) => {
                const user = await ctx.db.get(post.userId);
                
                // Check if user is a volunteer
                const volunteer = user ? await ctx.db
                    .query("volunteers")
                    .withIndex("by_user", (q) => q.eq("userId", user._id))
                    .unique() : null;

                return {
                    ...post,
                    author: {
                        id: user?._id,
                        name: user?.name ?? "Unknown",
                        avatar: user?.avatar,
                        isVolunteer: !!volunteer,
                    },
                    timeAgo: getTimeAgo(post.createdAt),
                };
            })
        );
    },
});

// Get a single post by ID
export const get = query({
    args: { id: v.id("communityPosts") },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.id);
        if (!post) return null;

        const user = await ctx.db.get(post.userId);
        const volunteer = user ? await ctx.db
            .query("volunteers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique() : null;

        return {
            ...post,
            author: {
                id: user?._id,
                name: user?.name ?? "Unknown",
                avatar: user?.avatar,
                isVolunteer: !!volunteer,
            },
            timeAgo: getTimeAgo(post.createdAt),
        };
    },
});

// Create a new post
export const create = mutation({
    args: {
        content: v.string(),
        image: v.optional(v.string()),
        caseId: v.optional(v.id("cases")),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        if (args.content.length > 5000) {
            throw new Error("Post content too long (max 5000 characters)");
        }

        return await ctx.db.insert("communityPosts", {
            userId: user._id,
            content: args.content,
            image: args.image,
            caseId: args.caseId,
            isPinned: false,
            isRules: false,
            likes: 0,
            commentsCount: 0,
            createdAt: Date.now(),
        });
    },
});

// Like a post (increment likes count)
export const like = mutation({
    args: { id: v.id("communityPosts") },
    handler: async (ctx, args) => {
        await requireUser(ctx);
        
        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");

        await ctx.db.patch(args.id, { likes: post.likes + 1 });
    },
});

// Helper function for time ago
function getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}
