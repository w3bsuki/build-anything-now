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
        title: v.string(),
        description: v.string(),
        story: v.optional(v.string()),
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
});
