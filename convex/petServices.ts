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

// Public directory listing for partner-integrated services surfaces.
export const list = query({
    args: {
        type: v.optional(v.union(
            v.literal("clinic"),
            v.literal("grooming"),
            v.literal("training"),
            v.literal("pet_store"),
            v.literal("shelter"),
            v.literal("pet_sitting"),
            v.literal("pet_hotel"),
            v.literal("pharmacy"),
            v.literal("other"),
        )),
        city: v.optional(v.string()),
        search: v.optional(v.string()),
        verifiedOnly: v.optional(v.boolean()),
        excludeClinics: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let services = await ctx.db.query("petServices").collect();

        if (args.excludeClinics) {
            services = services.filter((service) => service.type !== "clinic");
        }

        if (args.type) {
            services = services.filter((service) => service.type === args.type);
        }

        if (args.city) {
            const city = args.city.trim().toLowerCase();
            services = services.filter((service) => service.city.trim().toLowerCase() === city);
        }

        if (args.verifiedOnly) {
            services = services.filter((service) => service.verified);
        }

        if (args.search?.trim()) {
            const query = args.search.trim().toLowerCase();
            services = services.filter((service) =>
                service.name.toLowerCase().includes(query) ||
                service.city.toLowerCase().includes(query) ||
                service.address.toLowerCase().includes(query) ||
                service.services.some((entry) => entry.toLowerCase().includes(query))
            );
        }

        const take = Math.max(1, Math.min(args.limit ?? 60, 120));

        return services
            .sort((a, b) => {
                if (a.verified !== b.verified) return a.verified ? -1 : 1;
                if (!!a.ownerId !== !!b.ownerId) return a.ownerId ? -1 : 1;
                return a.name.localeCompare(b.name);
            })
            .slice(0, take)
            .map((service) => ({
                ...service,
                isClaimed: !!service.ownerId,
            }));
    },
});

export const get = query({
    args: { id: v.id("petServices") },
    handler: async (ctx, args) => {
        const service = await ctx.db.get(args.id);
        if (!service) return null;

        return {
            ...service,
            isClaimed: !!service.ownerId,
        };
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
