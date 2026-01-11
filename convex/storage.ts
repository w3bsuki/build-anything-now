import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for images
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.storage.generateUploadUrl();
    },
});

// Get image URL from storage ID
export const getUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

// Get multiple image URLs
export const getUrls = query({
    args: { storageIds: v.array(v.id("_storage")) },
    handler: async (ctx, args) => {
        const urls: (string | null)[] = [];
        for (const id of args.storageIds) {
            urls.push(await ctx.storage.getUrl(id));
        }
        return urls;
    },
});
