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

// Search clinics for claim flow (used during onboarding)
export const searchForClaim = query({
    args: { searchText: v.string() },
    handler: async (ctx, args) => {
        if (args.searchText.length < 2) return [];

        const searchLower = args.searchText.toLowerCase();

        // Get all clinics and filter (small dataset for Bulgaria)
        const clinics = await ctx.db.query("clinics").collect();

        return clinics
            .filter(c =>
                c.name.toLowerCase().includes(searchLower) ||
                c.city.toLowerCase().includes(searchLower) ||
                c.address.toLowerCase().includes(searchLower)
            )
            .slice(0, 10)
            .map(c => ({
                ...c,
                isClaimed: !!c.ownerId,
            }));
    },
});

// Submit a claim for a clinic
export const submitClaim = mutation({
    args: {
        clinicId: v.id("clinics"),
        claimerRole: v.string(),
        claimerEmail: v.string(),
        claimerPhone: v.optional(v.string()),
        additionalInfo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Check if clinic exists and isn't already claimed
        const clinic = await ctx.db.get(args.clinicId);
        if (!clinic) throw new Error("Clinic not found");
        if (clinic.ownerId) throw new Error("Clinic already claimed");

        // Check for existing pending claim by this user for this clinic
        const existingClaim = await ctx.db
            .query("clinicClaims")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.and(
                q.eq(q.field("clinicId"), args.clinicId),
                q.eq(q.field("status"), "pending")
            ))
            .first();

        if (existingClaim) throw new Error("You already have a pending claim for this clinic");

        // Create claim
        await ctx.db.insert("clinicClaims", {
            clinicId: args.clinicId,
            userId: user._id,
            status: "pending",
            claimerRole: args.claimerRole,
            claimerEmail: args.claimerEmail,
            claimerPhone: args.claimerPhone,
            additionalInfo: args.additionalInfo,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

// Get user's clinic claims
export const getMyClaims = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const claims = await ctx.db
            .query("clinicClaims")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Enrich with clinic details
        const enrichedClaims = await Promise.all(
            claims.map(async (claim) => {
                const clinic = await ctx.db.get(claim.clinicId);
                return {
                    ...claim,
                    clinic: clinic ? { name: clinic.name, city: clinic.city } : null,
                };
            })
        );

        return enrichedClaims;
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
