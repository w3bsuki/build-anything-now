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
