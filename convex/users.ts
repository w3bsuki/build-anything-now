import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Volunteer capability options for frontend
export const VOLUNTEER_CAPABILITIES = [
    { value: "transport", label: "Transport / Driving", icon: "🚗", description: "Drive animals to vets, shelters, or foster homes" },
    { value: "fostering", label: "Fostering", icon: "🏠", description: "Temporarily care for animals in your home" },
    { value: "rescue", label: "Rescue Operations", icon: "🦸", description: "Help with on-ground rescue missions" },
    { value: "events", label: "Event Organization", icon: "🎪", description: "Organize adoption events and fundraisers" },
    { value: "social_media", label: "Social Media / Awareness", icon: "📱", description: "Help spread the word online" },
    { value: "medical", label: "Medical Support", icon: "💊", description: "Assist with medical care (vet students, etc.)" },
    { value: "general", label: "General Help", icon: "🤝", description: "Available for various tasks" },
] as const;

// Professional type options for frontend
export const PROFESSIONAL_TYPES = [
    { value: "veterinarian", label: "Veterinarian", icon: "🩺", badge: "verified_veterinarian" },
    { value: "groomer", label: "Pet Groomer", icon: "✂️", badge: "verified_groomer" },
    { value: "trainer", label: "Dog Trainer", icon: "🎓", badge: "verified_trainer" },
    { value: "pet_sitter", label: "Pet Sitter", icon: "🏨", badge: "verified_business" },
    { value: "other", label: "Other Professional", icon: "🐾", badge: "verified_business" },
] as const;

// List all users (dev only)
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

// Get current user by Clerk ID
export const getByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

// Create or update user (internal only - called from Clerk webhook, not directly from client)
export const upsert = internalMutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                avatar: args.avatar,
            });
            return existing._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            avatar: args.avatar,
            role: "user",
            createdAt: Date.now(),
        });
    },
});

// Get current user profile
export const me = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

// Complete onboarding - enhanced version with multiple user types
export const completeOnboarding = mutation({
    args: {
        // Legacy support
        userType: v.optional(v.union(v.literal("individual"), v.literal("organization"))),
        // Enhanced user types
        enhancedUserType: v.optional(v.union(
            v.literal("pet_lover"),
            v.literal("volunteer"),
            v.literal("professional"),
            v.literal("business"),
            v.literal("exploring"),
        )),
        // Volunteer-specific
        volunteerCapabilities: v.optional(v.array(v.string())),
        volunteerCity: v.optional(v.string()),
        // Professional-specific
        professionalType: v.optional(v.union(
            v.literal("veterinarian"),
            v.literal("groomer"),
            v.literal("trainer"),
            v.literal("pet_sitter"),
            v.literal("other"),
        )),
        // Pet owner info
        hasPets: v.optional(v.boolean()),
        petTypes: v.optional(v.array(v.string())),
        city: v.optional(v.string()),
        // Fallback
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        
        let user;
        
        if (identity) {
            user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .unique();

            // Auto-create user if they don't exist
            if (!user) {
                const userId = await ctx.db.insert("users", {
                    clerkId: identity.subject,
                    name: identity.name || identity.givenName || "User",
                    email: identity.email || "",
                    avatar: identity.pictureUrl,
                    role: "user",
                    createdAt: Date.now(),
                });
                user = await ctx.db.get(userId);
            }
        } else if (args.email) {
            user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), args.email))
                .unique();
            
            if (!user) {
                throw new Error("User not found with that email");
            }
        } else {
            throw new Error("Not authenticated and no email provided");
        }

        if (!user) throw new Error("User not found");

        // Determine the final user type
        const finalUserType = args.enhancedUserType || args.userType || "exploring";
        
        // Determine role based on user type
        let role: "user" | "volunteer" | "clinic" | "admin" = "user";
        if (finalUserType === "volunteer") {
            role = "volunteer";
        } else if (finalUserType === "business" || finalUserType === "professional" || finalUserType === "organization") {
            role = "clinic"; // Using clinic role for all business types
        }

        // Build update object
        const updateData: Record<string, unknown> = {
            userType: finalUserType,
            onboardingCompleted: true,
            onboardingCompletedAt: Date.now(),
            role,
        };

        // Add volunteer-specific data
        if (finalUserType === "volunteer" && args.volunteerCapabilities) {
            updateData.volunteerCapabilities = args.volunteerCapabilities;
            updateData.volunteerAvailability = "available";
            if (args.volunteerCity) {
                updateData.volunteerCity = args.volunteerCity;
                updateData.city = args.volunteerCity;
            }
        }

        // Add professional-specific data
        if (finalUserType === "professional" && args.professionalType) {
            updateData.professionalType = args.professionalType;
        }

        // Add pet owner data
        if (args.hasPets !== undefined) {
            updateData.hasPets = args.hasPets;
        }
        if (args.petTypes) {
            updateData.petTypes = args.petTypes;
        }
        if (args.city) {
            updateData.city = args.city;
        }

        await ctx.db.patch(user._id, updateData);

        // Award volunteer badge if they registered as volunteer
        if (finalUserType === "volunteer") {
            const existingBadge = await ctx.db
                .query("achievements")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .filter((q) => q.eq(q.field("type"), "verified_volunteer"))
                .first();
            
            if (!existingBadge) {
                await ctx.db.insert("achievements", {
                    userId: user._id,
                    type: "verified_volunteer",
                    unlockedAt: Date.now(),
                });
            }
        }

        return { success: true, userId: user._id };
    },
});

// Complete product tour
export const completeProductTour = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            productTourCompleted: true,
            productTourCompletedAt: Date.now(),
        });

        return { success: true };
    },
});

// Skip product tour (same as complete but allows distinction in analytics)
export const skipProductTour = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            productTourCompleted: true,
            productTourCompletedAt: Date.now(),
        });

        return { success: true };
    },
});

// Get top heroes (users who helped most animals) for homepage
export const getTopHeroes = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;

        // Get all cases and count by userId
        const cases = await ctx.db.query("cases").collect();

        // Count cases per user
        const userCounts = new Map<string, number>();
        for (const c of cases) {
            const count = userCounts.get(c.userId.toString()) ?? 0;
            userCounts.set(c.userId.toString(), count + 1);
        }

        // Get user details for top helpers
        const topUserIds = Array.from(userCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);

        const heroes = await Promise.all(
            topUserIds.map(async ([userIdStr, count]) => {
                // Find user by iterating (since we have string ID)
                const users = await ctx.db.query("users").collect();
                const user = users.find(u => u._id.toString() === userIdStr);
                
                if (!user) return null;

                return {
                    id: user._id,
                    name: user.name,
                    avatar: user.avatar,
                    animalsHelped: count,
                };
            })
        );

        return heroes.filter(Boolean);
    },
});

// Reset onboarding for a user (dev only)
export const resetOnboarding = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique();
        
        if (!user) throw new Error("User not found");
        
        await ctx.db.patch(user._id, {
            onboardingCompleted: false,
            onboardingCompletedAt: undefined,
            userType: undefined,
            productTourCompleted: false,
            productTourCompletedAt: undefined,
            volunteerCapabilities: undefined,
            volunteerAvailability: undefined,
            volunteerCity: undefined,
            professionalType: undefined,
            professionalSpecialties: undefined,
            linkedPetServiceId: undefined,
            hasPets: undefined,
            petTypes: undefined,
            city: undefined,
        });
        
        return { success: true, user: user.email };
    },
});

// Get available volunteers (for emergency help feature)
export const getAvailableVolunteers = query({
    args: {
        city: v.optional(v.string()),
        capability: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let volunteers = await ctx.db
            .query("users")
            .filter((q) => q.and(
                q.eq(q.field("userType"), "volunteer"),
                q.eq(q.field("volunteerAvailability"), "available")
            ))
            .collect();

        if (args.city) {
            volunteers = volunteers.filter(v => 
                v.volunteerCity?.toLowerCase().includes(args.city!.toLowerCase()) ||
                v.city?.toLowerCase().includes(args.city!.toLowerCase())
            );
        }

        if (args.capability) {
            volunteers = volunteers.filter(v => 
                v.volunteerCapabilities?.includes(args.capability!)
            );
        }

        const limit = args.limit ?? 20;
        return volunteers.slice(0, limit).map(v => ({
            id: v._id,
            name: v.name,
            avatar: v.avatar,
            city: v.volunteerCity || v.city,
            capabilities: v.volunteerCapabilities || [],
        }));
    },
});

// Update volunteer availability
export const updateVolunteerAvailability = mutation({
    args: {
        availability: v.union(
            v.literal("available"),
            v.literal("busy"),
            v.literal("offline"),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");
        if (user.userType !== "volunteer") throw new Error("User is not a volunteer");

        await ctx.db.patch(user._id, {
            volunteerAvailability: args.availability,
        });

        return { success: true };
    },
});

// Get volunteers for community display
export const getVolunteers = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const volunteers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("userType"), "volunteer"))
            .collect();

        const limit = args.limit ?? 50;
        
        return volunteers.slice(0, limit).map(v => ({
            id: v._id,
            name: v.name,
            avatar: v.avatar,
            city: v.volunteerCity || v.city,
            capabilities: v.volunteerCapabilities || [],
            availability: v.volunteerAvailability || "offline",
            createdAt: v.createdAt,
        }));
    },
});
