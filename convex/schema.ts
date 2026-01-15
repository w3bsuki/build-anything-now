import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users table - synced with Clerk
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.union(v.literal("user"), v.literal("volunteer"), v.literal("clinic"), v.literal("admin")),
        createdAt: v.number(),
    }).index("by_clerk_id", ["clerkId"]),

    // Donations table - tracks all user donations
    donations: defineTable({
        userId: v.id("users"),
        caseId: v.optional(v.id("cases")),
        campaignId: v.optional(v.string()), // For campaign donations
        amount: v.number(),
        currency: v.string(),
        status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded")),
        paymentMethod: v.optional(v.string()),
        transactionId: v.optional(v.string()),
        message: v.optional(v.string()),
        anonymous: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_case", ["caseId"])
        .index("by_status", ["status"]),

    // User achievements/badges
    achievements: defineTable({
        userId: v.id("users"),
        type: v.union(
            v.literal("first_donation"),
            v.literal("monthly_donor"),
            v.literal("helped_10"),
            v.literal("helped_50"),
            v.literal("helped_100"),
            v.literal("big_heart"),
            v.literal("early_supporter"),
            v.literal("community_hero")
        ),
        unlockedAt: v.number(),
    })
        .index("by_user", ["userId"]),

    // Payment methods saved by users
    paymentMethods: defineTable({
        userId: v.id("users"),
        type: v.union(v.literal("card"), v.literal("paypal"), v.literal("bank")),
        name: v.string(), // e.g., "Visa ending in 4242"
        lastFour: v.optional(v.string()),
        expiryMonth: v.optional(v.number()),
        expiryYear: v.optional(v.number()),
        isDefault: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"]),

    // User notifications
    notifications: defineTable({
        userId: v.id("users"),
        type: v.union(
            v.literal("donation_received"),
            v.literal("case_update"),
            v.literal("achievement_unlocked"),
            v.literal("campaign_ended"),
            v.literal("system")
        ),
        title: v.string(),
        message: v.string(),
        caseId: v.optional(v.id("cases")),
        read: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_unread", ["userId", "read"]),

    // User settings/preferences
    userSettings: defineTable({
        userId: v.id("users"),
        emailNotifications: v.boolean(),
        pushNotifications: v.boolean(),
        donationReminders: v.boolean(),
        marketingEmails: v.boolean(),
        language: v.string(),
        currency: v.string(),
    })
        .index("by_user", ["userId"]),

    // Rate limiting for machine translation requests (on-demand UGC translation)
    translationRateLimits: defineTable({
        clerkId: v.string(),
        day: v.number(),
        count: v.number(),
        updatedAt: v.number(),
    })
        .index("by_clerk_day", ["clerkId", "day"]),

    // Cases table - main animal reports with fundraising
    cases: defineTable({
        userId: v.id("users"),
        type: v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted")),
        category: v.union(
            v.literal("surgery"),
            v.literal("shelter"),
            v.literal("food"),
            v.literal("medical"),
            v.literal("rescue")
        ),
        // Language of the original user-generated content (ISO locale like "bg", "en", "de")
        language: v.optional(v.string()),
        title: v.string(),
        description: v.string(),
        story: v.optional(v.string()),
        // Cached machine translations, keyed by target locale.
        // Only translated fields are stored to keep payload small.
        translations: v.optional(v.record(v.string(), v.object({
            title: v.optional(v.string()),
            description: v.optional(v.string()),
            story: v.optional(v.string()),
            translatedAt: v.number(),
            provider: v.string(),
            sourceHash: v.string(),
        }))),
        // Per-locale status (useful for showing "Translating..." and retrying on failures).
        translationStatus: v.optional(v.record(v.string(), v.object({
            status: v.union(v.literal("pending"), v.literal("done"), v.literal("error")),
            updatedAt: v.number(),
            error: v.optional(v.string()),
        }))),
        images: v.array(v.id("_storage")),
        location: v.object({
            city: v.string(),
            neighborhood: v.string(),
            coordinates: v.optional(v.object({
                lat: v.number(),
                lng: v.number(),
            })),
        }),
        clinicId: v.optional(v.id("clinics")),
        foundAt: v.number(),
        broughtToClinicAt: v.optional(v.number()),
        fundraising: v.object({
            goal: v.number(),
            current: v.number(),
            currency: v.string(),
        }),
        status: v.union(v.literal("active"), v.literal("funded"), v.literal("closed")),
        updates: v.array(v.object({
            date: v.number(),
            text: v.string(),
            images: v.optional(v.array(v.id("_storage"))),
        })),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_type", ["type"])
        .index("by_status", ["status"]),

    // Adoptions table - separate non-urgent flow
    adoptions: defineTable({
        userId: v.id("users"),
        animalType: v.union(v.literal("dog"), v.literal("cat"), v.literal("other")),
        name: v.string(),
        age: v.string(),
        description: v.string(),
        images: v.array(v.id("_storage")),
        location: v.object({
            city: v.string(),
            neighborhood: v.string(),
        }),
        vaccinated: v.boolean(),
        neutered: v.boolean(),
        status: v.union(v.literal("available"), v.literal("pending"), v.literal("adopted")),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),

    // Clinics table
    clinics: defineTable({
        name: v.string(),
        city: v.string(),
        address: v.string(),
        phone: v.string(),
        is24h: v.boolean(),
        specializations: v.array(v.string()),
        verified: v.boolean(),
    }).index("by_city", ["city"]),

    // Campaigns table - fundraising campaigns
    campaigns: defineTable({
        title: v.string(),
        description: v.string(),
        image: v.optional(v.string()), // URL for now, could be storage ID
        goal: v.number(),
        current: v.number(),
        unit: v.string(), // "EUR", "homes", "surgeries", "meals", etc.
        endDate: v.optional(v.string()), // ISO date string
        status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
        createdAt: v.number(),
    })
        .index("by_status", ["status"]),

    // Partners table - organizations that support PawsSafe
    partners: defineTable({
        name: v.string(),
        logo: v.string(), // URL
        type: v.union(
            v.literal("pet-shop"),
            v.literal("food-brand"),
            v.literal("veterinary"),
            v.literal("sponsor")
        ),
        contribution: v.string(), // Description of what they contribute
        description: v.string(),
        website: v.optional(v.string()),
        since: v.string(), // Year started
        animalsHelped: v.number(),
        totalContributed: v.number(), // In EUR
        featured: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_type", ["type"])
        .index("by_featured", ["featured"]),

    // Volunteers table - volunteer profiles
    volunteers: defineTable({
        userId: v.id("users"),
        bio: v.string(),
        location: v.string(),
        rating: v.number(), // 1-5
        memberSince: v.string(), // Year
        isTopVolunteer: v.boolean(),
        badges: v.array(v.string()),
        stats: v.object({
            animalsHelped: v.number(),
            adoptions: v.number(),
            campaigns: v.number(),
            donationsReceived: v.number(),
            hoursVolunteered: v.number(),
        }),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_top", ["isTopVolunteer"]),

    // Community posts
    communityPosts: defineTable({
        userId: v.id("users"),
        content: v.string(),
        image: v.optional(v.string()), // URL for now
        caseId: v.optional(v.id("cases")),
        isPinned: v.boolean(),
        isRules: v.boolean(),
        likes: v.number(),
        commentsCount: v.number(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_created", ["createdAt"])
        .index("by_pinned", ["isPinned"]),
});
