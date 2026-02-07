import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        let user = await ctx.db
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

// ============================================
// PROFILE SYSTEM QUERIES & MUTATIONS
// ============================================

// Get public profile by user ID
export const getPublicProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;
        
        // Check if profile is public (or if viewing own profile)
        const identity = await ctx.auth.getUserIdentity();
        const isOwnProfile = identity && user.clerkId === identity.subject;
        
        if (!user.isPublic && !isOwnProfile) {
            return {
                id: user._id,
                displayName: user.displayName || user.name,
                avatar: user.avatar,
                isPublic: false,
                isOwnProfile: false,
            };
        }

        // Get follower/following counts
        const followers = await ctx.db
            .query("follows")
            .withIndex("by_following", (q) => q.eq("followingId", args.userId))
            .collect();
        
        const following = await ctx.db
            .query("follows")
            .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
            .collect();

        // Get achievements/badges
        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        return {
            id: user._id,
            displayName: user.displayName || user.name,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
            isPublic: user.isPublic ?? true,
            role: user.role,
            userType: user.userType,
            capabilities: user.capabilities ?? [],
            city: user.city || user.volunteerCity,
            memberSince: new Date(user.createdAt).getFullYear().toString(),
            followerCount: followers.length,
            followingCount: following.length,
            badges: achievements.map(a => a.type),
            isOwnProfile: !!isOwnProfile,
            // Volunteer-specific fields
            volunteerCapabilities: user.volunteerCapabilities,
            volunteerAvailability: user.volunteerAvailability,
        };
    },
});

// Get profile stats for a user
export const getProfileStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Get donations made by this user
        const donations = await ctx.db
            .query("donations")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("status"), "completed"))
            .collect();

        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const uniqueCases = new Set(donations.filter(d => d.caseId).map(d => d.caseId));

        // Get cases created by this user (for rescuers/volunteers)
        const cases = await ctx.db
            .query("cases")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const activeCases = cases.filter(c => c.status === "active").length;
        const fundedCases = cases.filter(c => c.status === "funded").length;

        return {
            totalDonations: donations.length,
            totalAmount,
            animalsHelped: uniqueCases.size,
            casesCreated: cases.length,
            activeCases,
            fundedCases,
        };
    },
});

// Update profile (bio, displayName, visibility)
export const updateProfile = mutation({
    args: {
        displayName: v.optional(v.string()),
        bio: v.optional(v.string()),
        isPublic: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Validate bio length
        if (args.bio && args.bio.length > 280) {
            throw new Error("Bio must be 280 characters or less");
        }

        // Validate display name
        if (args.displayName && args.displayName.length > 50) {
            throw new Error("Display name must be 50 characters or less");
        }

        const updateData: Record<string, unknown> = {};
        
        if (args.displayName !== undefined) {
            updateData.displayName = args.displayName.trim() || null;
        }
        if (args.bio !== undefined) {
            updateData.bio = args.bio.trim() || null;
        }
        if (args.isPublic !== undefined) {
            updateData.isPublic = args.isPublic;
        }

        await ctx.db.patch(user._id, updateData);
        return { success: true };
    },
});

// Update account capabilities (single signup -> multi-capability profile)
export const updateCapabilities = mutation({
    args: {
        capabilities: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Keep a safe bounded list of capabilities for profile and matching.
        const normalized = Array.from(
            new Set(
                args.capabilities
                    .map((cap) => cap.trim().toLowerCase())
                    .filter((cap) => cap.length > 0)
            )
        ).slice(0, 12);

        await ctx.db.patch(user._id, {
            capabilities: normalized,
        });

        return { success: true, capabilities: normalized };
    },
});

// Get profile by username/ID or "me"
export const getProfileByIdOrMe = query({
    args: { userId: v.union(v.id("users"), v.literal("me")) },
    handler: async (ctx, args) => {
        let targetUserId: typeof args.userId | null = args.userId;
        
        if (args.userId === "me") {
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) return null;

            const user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .unique();
            
            if (!user) return null;
            targetUserId = user._id;
        }

        // Now fetch the public profile
        const user = await ctx.db.get(targetUserId as Id<"users">);
        if (!user) return null;

        const identity = await ctx.auth.getUserIdentity();
        const isOwnProfile = identity && user.clerkId === identity.subject;

        // Get stats
        const donations = await ctx.db
            .query("donations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "completed"))
            .collect();

        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const uniqueCases = new Set(donations.filter(d => d.caseId).map(d => d.caseId));

        // Get followers/following
        const followers = await ctx.db
            .query("follows")
            .withIndex("by_following", (q) => q.eq("followingId", user._id))
            .collect();
        
        const following = await ctx.db
            .query("follows")
            .withIndex("by_follower", (q) => q.eq("followerId", user._id))
            .collect();

        // Get achievements
        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        return {
            id: user._id,
            displayName: user.displayName || user.name,
            name: user.name,
            email: isOwnProfile ? user.email : undefined,
            avatar: user.avatar,
            bio: user.bio,
            isPublic: user.isPublic ?? true,
            role: user.role,
            userType: user.userType,
            capabilities: user.capabilities ?? [],
            city: user.city || user.volunteerCity,
            memberSince: new Date(user.createdAt).getFullYear().toString(),
            followerCount: followers.length,
            followingCount: following.length,
            badges: achievements.map(a => a.type),
            isOwnProfile: !!isOwnProfile,
            stats: {
                totalDonations: donations.length,
                totalAmount,
                animalsHelped: uniqueCases.size,
            },
        };
    },
});

// Get saved cases for current user
export const getSavedCases = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const savedCases = await ctx.db
            .query("savedCases")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        // Fetch full case data
        const cases = await Promise.all(
            savedCases.map(async (saved) => {
                const caseData = await ctx.db.get(saved.caseId);
                if (!caseData) return null;

                // Get first image URL
                let imageUrl = null;
                if (caseData.images.length > 0) {
                    imageUrl = await ctx.storage.getUrl(caseData.images[0]);
                }

                return {
                    ...caseData,
                    imageUrl,
                    savedAt: saved.createdAt,
                };
            })
        );

        return cases.filter(Boolean);
    },
});
