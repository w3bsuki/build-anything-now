import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// List all clinics with optional city filter
export const list = query({
    args: {
        city: v.optional(v.string()),
        is24h: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let clinics = await ctx.db.query("clinics").collect();

        if (args.city) {
            clinics = clinics.filter(c => c.city.toLowerCase() === args.city!.toLowerCase());
        }

        if (args.is24h !== undefined) {
            clinics = clinics.filter(c => c.is24h === args.is24h);
        }

        return clinics;
    },
});

// Get a single clinic by ID
export const get = query({
    args: { id: v.id("clinics") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Seed clinics from mock data (internal only - not callable from client)
export const seed = internalMutation({
    args: {
        clinics: v.array(v.object({
            name: v.string(),
            city: v.string(),
            address: v.string(),
            phone: v.string(),
            is24h: v.boolean(),
            specializations: v.array(v.string()),
            verified: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        for (const clinic of args.clinics) {
            await ctx.db.insert("clinics", clinic);
        }
        return { inserted: args.clinics.length };
    },
});
