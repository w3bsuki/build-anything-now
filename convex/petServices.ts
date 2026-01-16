import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Service type options for the frontend
export const SERVICE_TYPES = [
    { value: "clinic", label: "Veterinary Clinic", icon: "🩺", emoji: "🏥" },
    { value: "grooming", label: "Pet Grooming", icon: "✂️", emoji: "✂️" },
    { value: "training", label: "Dog Training", icon: "🎓", emoji: "🎓" },
    { value: "pet_store", label: "Pet Store", icon: "🏪", emoji: "🛒" },
    { value: "shelter", label: "Animal Shelter", icon: "🏠", emoji: "🐾" },
    { value: "pet_sitting", label: "Pet Sitting / Boarding", icon: "🛏️", emoji: "🏨" },
    { value: "pet_hotel", label: "Pet Hotel / Daycare", icon: "🏨", emoji: "🌟" },
    { value: "pharmacy", label: "Pet Pharmacy", icon: "💊", emoji: "💊" },
    { value: "other", label: "Other Services", icon: "📦", emoji: "🐕" },
] as const;

// List all pet services with optional filters
export const list = query({
    args: {
        type: v.optional(v.string()),
        city: v.optional(v.string()),
        verified: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let services = await ctx.db.query("petServices").collect();

        if (args.type) {
            services = services.filter(s => s.type === args.type);
        }

        if (args.city) {
            services = services.filter(s => 
                s.city.toLowerCase().includes(args.city!.toLowerCase())
            );
        }

        if (args.verified !== undefined) {
            services = services.filter(s => s.verified === args.verified);
        }

        // Sort by verified first, then by name
        services.sort((a, b) => {
            if (a.verified !== b.verified) return b.verified ? 1 : -1;
            return a.name.localeCompare(b.name);
        });

        if (args.limit) {
            services = services.slice(0, args.limit);
        }

        return services;
    },
});

// Get a single pet service by ID
export const get = query({
    args: { id: v.id("petServices") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Search pet services for claim flow (used during onboarding)
export const searchForClaim = query({
    args: { 
        searchText: v.string(),
        type: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.searchText.length < 2) return [];

        const searchLower = args.searchText.toLowerCase();

        let services = await ctx.db.query("petServices").collect();

        // Filter by type if specified
        if (args.type) {
            services = services.filter(s => s.type === args.type);
        }

        // Search in name, city, address
        return services
            .filter(s =>
                s.name.toLowerCase().includes(searchLower) ||
                s.city.toLowerCase().includes(searchLower) ||
                s.address.toLowerCase().includes(searchLower)
            )
            .slice(0, 15)
            .map(s => ({
                ...s,
                isClaimed: !!s.ownerId,
            }));
    },
});

// Register a new pet service (during onboarding or later)
export const register = mutation({
    args: {
        name: v.string(),
        type: v.union(
            v.literal("clinic"),
            v.literal("grooming"),
            v.literal("training"),
            v.literal("pet_store"),
            v.literal("shelter"),
            v.literal("pet_sitting"),
            v.literal("pet_hotel"),
            v.literal("pharmacy"),
            v.literal("other"),
        ),
        city: v.string(),
        address: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        website: v.optional(v.string()),
        description: v.optional(v.string()),
        services: v.array(v.string()),
        specializations: v.optional(v.array(v.string())),
        is24h: v.optional(v.boolean()),
        hours: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Create the pet service
        const serviceId = await ctx.db.insert("petServices", {
            ...args,
            verified: false, // Needs manual verification
            ownerId: user._id,
            claimedAt: Date.now(),
            createdAt: Date.now(),
        });

        // Link service to user
        await ctx.db.patch(user._id, {
            linkedPetServiceId: serviceId,
        });

        return { success: true, serviceId };
    },
});

// Submit a claim for an existing pet service
export const submitClaim = mutation({
    args: {
        petServiceId: v.id("petServices"),
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

        // Check if service exists and isn't already claimed
        const service = await ctx.db.get(args.petServiceId);
        if (!service) throw new Error("Pet service not found");
        if (service.ownerId) throw new Error("This business has already been claimed");

        // Check for existing pending claim
        const existingClaim = await ctx.db
            .query("petServiceClaims")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.and(
                q.eq(q.field("petServiceId"), args.petServiceId),
                q.eq(q.field("status"), "pending")
            ))
            .first();

        if (existingClaim) throw new Error("You already have a pending claim for this business");

        // Create claim
        await ctx.db.insert("petServiceClaims", {
            petServiceId: args.petServiceId,
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

// Get user's pet service claims
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
            .query("petServiceClaims")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Enrich with service details
        const enrichedClaims = await Promise.all(
            claims.map(async (claim) => {
                const service = await ctx.db.get(claim.petServiceId);
                return {
                    ...claim,
                    service: service ? { 
                        name: service.name, 
                        city: service.city,
                        type: service.type,
                    } : null,
                };
            })
        );

        return enrichedClaims;
    },
});

// Get stats for directory page
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const services = await ctx.db.query("petServices").collect();
        
        const byType = services.reduce((acc, s) => {
            acc[s.type] = (acc[s.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: services.length,
            verified: services.filter(s => s.verified).length,
            byType,
        };
    },
});
