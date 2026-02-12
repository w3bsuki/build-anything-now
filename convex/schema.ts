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
        // Profile fields
        displayName: v.optional(v.string()),
        bio: v.optional(v.string()),
        isPublic: v.optional(v.boolean()),
        // Onboarding tracking
        onboardingCompleted: v.optional(v.boolean()),
        onboardingCompletedAt: v.optional(v.number()),
        // Enhanced user type from onboarding selection
        userType: v.optional(v.union(
            v.literal("individual"),    // Legacy: "I want to help" or "Just exploring"
            v.literal("organization"),  // Legacy: "I represent a clinic/org"
            v.literal("pet_lover"),     // Pet owner / animal supporter
            v.literal("volunteer"),     // Active volunteer
            v.literal("professional"),  // Individual professional (vet, groomer, trainer)
            v.literal("business"),      // Business owner (clinic, store, shelter)
            v.literal("exploring"),     // Just browsing
        )),
        // Volunteer-specific fields (if userType is "volunteer")
        volunteerCapabilities: v.optional(v.array(v.string())), // ["transport", "fostering", "rescue", "events", "social_media", "general"]
        volunteerAvailability: v.optional(v.union(
            v.literal("available"),
            v.literal("busy"),
            v.literal("offline"),
        )),
        volunteerCity: v.optional(v.string()),
        // Professional-specific fields (if userType is "professional")
        professionalType: v.optional(v.union(
            v.literal("veterinarian"),
            v.literal("groomer"),
            v.literal("trainer"),
            v.literal("pet_sitter"),
            v.literal("other"),
        )),
        professionalSpecialties: v.optional(v.array(v.string())),
        // Linked pet service (for professionals/businesses)
        linkedPetServiceId: v.optional(v.id("petServices")),
        // Pet owner fields
        hasPets: v.optional(v.boolean()),
        petTypes: v.optional(v.array(v.string())), // ["dog", "cat", "bird", "other"]
        city: v.optional(v.string()),
        // Verification status
        verifiedAt: v.optional(v.number()),
        verifiedBy: v.optional(v.id("users")),
        // Multi-capability account model (single signup, many roles/capabilities)
        capabilities: v.optional(v.array(v.string())),
        verificationLevel: v.optional(v.union(
            v.literal("unverified"),
            v.literal("community"),
            v.literal("clinic"),
            v.literal("partner"),
        )),
        // Product tour tracking
        productTourCompleted: v.optional(v.boolean()),
        productTourCompletedAt: v.optional(v.number()),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_onboarding", ["onboardingCompleted"])
        .index("by_user_type", ["userType"])
        .index("by_volunteer_availability", ["volunteerAvailability"]),

    // Donations table - tracks all user donations
    donations: defineTable({
        userId: v.id("users"),
        caseId: v.optional(v.id("cases")),
        campaignId: v.optional(v.string()), // For campaign donations
        campaignRefId: v.optional(v.id("campaigns")),
        donationKind: v.optional(v.union(v.literal("one_time"), v.literal("recurring"))),
        subscriptionId: v.optional(v.id("subscriptions")),
        amount: v.number(),
        currency: v.string(),
        status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded")),
        paymentMethod: v.optional(v.string()),
        paymentProvider: v.optional(v.union(v.literal("stripe"), v.literal("manual"))),
        stripeCheckoutSessionId: v.optional(v.string()),
        stripePaymentIntentId: v.optional(v.string()),
        stripeSubscriptionId: v.optional(v.string()),
        stripeInvoiceId: v.optional(v.string()),
        stripeChargeId: v.optional(v.string()),
        idempotencyKey: v.optional(v.string()),
        receiptId: v.optional(v.string()),
        receiptUrl: v.optional(v.string()),
        transactionId: v.optional(v.string()),
        message: v.optional(v.string()),
        anonymous: v.boolean(),
        completedAt: v.optional(v.number()),
        failedAt: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_case", ["caseId"])
        .index("by_campaign_ref", ["campaignRefId"])
        .index("by_subscription", ["subscriptionId"])
        .index("by_stripe_checkout_session", ["stripeCheckoutSessionId"])
        .index("by_stripe_payment_intent", ["stripePaymentIntentId"])
        .index("by_stripe_invoice", ["stripeInvoiceId"])
        .index("by_idempotency_key", ["idempotencyKey"])
        .index("by_status", ["status"])
        .index("by_kind", ["donationKind"]),

    // Recurring subscriptions for monthly support
    subscriptions: defineTable({
        userId: v.id("users"),
        targetType: v.union(v.literal("case"), v.literal("user")),
        targetId: v.string(),
        stripeSubscriptionId: v.optional(v.string()),
        stripeCheckoutSessionId: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("active"),
            v.literal("past_due"),
            v.literal("canceled"),
            v.literal("unpaid"),
        ),
        amount: v.number(),
        currency: v.string(),
        interval: v.union(v.literal("month"), v.literal("year")),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
        canceledAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_user_status", ["userId", "status"])
        .index("by_target", ["targetType", "targetId"])
        .index("by_checkout_session", ["stripeCheckoutSessionId"])
        .index("by_stripe_subscription", ["stripeSubscriptionId"]),

    // User achievements/badges
    achievements: defineTable({
        userId: v.id("users"),
        type: v.union(
            // Donation badges
            v.literal("first_donation"),
            v.literal("monthly_donor"),
            v.literal("helped_10"),
            v.literal("helped_50"),
            v.literal("helped_100"),
            v.literal("big_heart"),
            v.literal("early_supporter"),
            v.literal("community_hero"),
            // Role/verification badges
            v.literal("verified_volunteer"),
            v.literal("verified_veterinarian"),
            v.literal("verified_groomer"),
            v.literal("verified_trainer"),
            v.literal("verified_business"),
            v.literal("verified_shelter"),
            // Volunteer activity badges
            v.literal("top_transporter"),
            v.literal("foster_hero"),
            v.literal("rescue_champion"),
            v.literal("event_organizer"),
            // Special badges
            v.literal("founding_member"),
            v.literal("ambassador")
        ),
        unlockedAt: v.number(),
        // Optional metadata for the badge
        metadata: v.optional(v.object({
            description: v.optional(v.string()),
            awardedBy: v.optional(v.id("users")),
        })),
    })
        .index("by_user", ["userId"])
        .index("by_type", ["type"]),

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

    // Push notification device tokens (Capacitor native clients)
    pushTokens: defineTable({
        userId: v.id("users"),
        token: v.string(),
        platform: v.union(
            v.literal("ios"),
            v.literal("android"),
            v.literal("web"),
            v.literal("unknown"),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_token", ["token"])
        .index("by_user_token", ["userId", "token"]),

    // Email throttle windows for case updates (max 1 outbound email per hour per user+case)
    notificationEmailBatches: defineTable({
        userId: v.id("users"),
        caseId: v.id("cases"),
        windowStartedAt: v.number(),
        notificationCount: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user_case_window", ["userId", "caseId", "windowStartedAt"]),

    // Rate limiting for machine translation requests (on-demand UGC translation)
    translationRateLimits: defineTable({
        clerkId: v.string(),
        day: v.number(),
        count: v.number(),
        updatedAt: v.number(),
    })
        .index("by_clerk_day", ["clerkId", "day"]),
    // Rate limiting for abuse-prone case reports (trust & safety)
    reportRateLimits: defineTable({
        clerkId: v.string(),
        day: v.number(),
        count: v.number(),
        updatedAt: v.number(),
    })
        .index("by_clerk_day", ["clerkId", "day"]),
    // Rate limiting for verification endorsements (anti-brigading baseline)
    endorsementRateLimits: defineTable({
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
        // Trust signal shown in the UI (defaults to "unverified" in queries if missing)
        verificationStatus: v.optional(v.union(
            v.literal("unverified"),
            v.literal("community"),
            v.literal("clinic"),
        )),
        foundAt: v.number(),
        broughtToClinicAt: v.optional(v.number()),
        fundraising: v.object({
            goal: v.number(),
            current: v.number(),
            currency: v.string(),
        }),
        status: v.union(v.literal("active"), v.literal("funded"), v.literal("closed")),
        lifecycleStage: v.optional(v.union(
            v.literal("active_treatment"),
            v.literal("seeking_adoption"),
            v.literal("closed_success"),
            v.literal("closed_transferred"),
            v.literal("closed_other"),
        )),
        lifecycleUpdatedAt: v.optional(v.number()),
        closedAt: v.optional(v.number()),
        closedReason: v.optional(v.union(
            v.literal("success"),
            v.literal("transferred"),
            v.literal("other"),
        )),
        closedNotes: v.optional(v.string()),
        riskLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
        riskFlags: v.optional(v.array(v.string())),
        updates: v.array(v.object({
            id: v.optional(v.string()),
            date: v.number(),
            type: v.optional(v.union(
                v.literal("medical"),
                v.literal("milestone"),
                v.literal("update"),
                v.literal("success"),
            )),
            text: v.string(),
            images: v.optional(v.array(v.id("_storage"))),
            evidenceType: v.optional(v.union(
                v.literal("bill"),
                v.literal("lab_result"),
                v.literal("clinic_photo"),
                v.literal("other"),
            )),
            clinicId: v.optional(v.id("clinics")),
            clinicName: v.optional(v.string()),
            authorRole: v.optional(v.union(
                v.literal("owner"),
                v.literal("clinic"),
                v.literal("moderator"),
            )),
        })),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_type", ["type"])
        .index("by_status", ["status"])
        .index("by_lifecycle_stage", ["lifecycleStage"])
        .index("by_verification_status", ["verificationStatus"]),

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
        // Enhanced clinic fields
        image: v.optional(v.string()),          // Hero/cover image
        rating: v.optional(v.number()),         // Average rating 0-5
        reviewCount: v.optional(v.number()),    // Number of reviews
        distance: v.optional(v.string()),       // Distance from user e.g. "0.8 km"
        featured: v.optional(v.boolean()),      // Featured clinic flag
        // Ownership tracking for claimed clinics
        ownerId: v.optional(v.id("users")),
        claimedAt: v.optional(v.number()),
    })
        .index("by_city", ["city"])
        .index("by_owner", ["ownerId"])
        .index("by_verified", ["verified"])
        .index("by_featured", ["featured"]),

    // Clinic claims - pending verification requests
    clinicClaims: defineTable({
        clinicId: v.id("clinics"),
        userId: v.id("users"),
        status: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected")
        ),
        // Verification info provided by claimer
        claimerRole: v.string(),        // "Owner", "Manager", "Staff"
        claimerEmail: v.string(),
        claimerPhone: v.optional(v.string()),
        additionalInfo: v.optional(v.string()),
        // Admin review
        reviewedBy: v.optional(v.id("users")),
        reviewedAt: v.optional(v.number()),
        rejectionReason: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_clinic", ["clinicId"])
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),

    // Pet Services Directory - unified table for ALL pet-related businesses/services
    petServices: defineTable({
        name: v.string(),
        type: v.union(
            v.literal("clinic"),        // Veterinary clinic
            v.literal("grooming"),      // Pet grooming salon
            v.literal("training"),      // Dog training / behavior
            v.literal("pet_store"),     // Pet supply store
            v.literal("shelter"),       // Animal shelter / rescue org
            v.literal("pet_sitting"),   // Pet sitting / boarding
            v.literal("pet_hotel"),     // Pet hotel / daycare
            v.literal("pharmacy"),      // Pet pharmacy
            v.literal("other"),         // Other pet services
        ),
        // Location info
        city: v.string(),
        address: v.string(),
        coordinates: v.optional(v.object({
            lat: v.number(),
            lng: v.number(),
        })),
        // Contact info
        phone: v.string(),
        email: v.optional(v.string()),
        website: v.optional(v.string()),
        // Details
        description: v.optional(v.string()),
        services: v.array(v.string()), // Specific services offered
        specializations: v.optional(v.array(v.string())), // For clinics: surgery, dermatology, etc.
        // Hours
        is24h: v.optional(v.boolean()),
        hours: v.optional(v.string()), // e.g., "Mon-Fri 9:00-18:00"
        // Verification & Ownership
        verified: v.boolean(),
        ownerId: v.optional(v.id("users")),
        claimedAt: v.optional(v.number()),
        // Media
        logo: v.optional(v.string()),
        photos: v.optional(v.array(v.id("_storage"))),
        // Stats
        rating: v.optional(v.number()),
        reviewCount: v.optional(v.number()),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_type", ["type"])
        .index("by_city", ["city"])
        .index("by_verified", ["verified"])
        .index("by_owner", ["ownerId"]),

    // Pet Service Claims - pending verification requests for pet services
    petServiceClaims: defineTable({
        petServiceId: v.id("petServices"),
        userId: v.id("users"),
        status: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected")
        ),
        // Claimer info
        claimerRole: v.string(),
        claimerEmail: v.string(),
        claimerPhone: v.optional(v.string()),
        additionalInfo: v.optional(v.string()),
        // Admin review
        reviewedBy: v.optional(v.id("users")),
        reviewedAt: v.optional(v.number()),
        rejectionReason: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_service", ["petServiceId"])
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),

    // Campaigns table - fundraising campaigns
    campaigns: defineTable({
        title: v.string(),
        description: v.string(),
        image: v.optional(v.string()), // URL for now, could be storage ID
        campaignType: v.optional(v.union(v.literal("rescue"), v.literal("initiative"))),
        initiativeKey: v.optional(v.string()),
        initiativeCategory: v.optional(v.union(v.literal("drone"), v.literal("safehouse"), v.literal("platform"), v.literal("other"))),
        featuredInitiative: v.optional(v.boolean()),
        goal: v.number(),
        current: v.number(),
        unit: v.string(), // "EUR", "homes", "surgeries", "meals", etc.
        endDate: v.optional(v.string()), // ISO date string
        status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
        createdAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_campaign_type", ["campaignType"])
        .index("by_featured_initiative", ["featuredInitiative"]),

    // Partners table - organizations that support Pawtreon
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

    // Community forum threads
    communityPosts: defineTable({
        userId: v.id("users"),
        title: v.optional(v.string()),
        content: v.string(),
        image: v.optional(v.string()), // URL for now
        caseId: v.optional(v.id("cases")),
        board: v.optional(v.union(v.literal("rescue"), v.literal("community"))),
        category: v.optional(v.union(
            v.literal("urgent_help"),
            v.literal("case_update"),
            v.literal("adoption"),
            v.literal("advice"),
            v.literal("general"),
            v.literal("announcements"),
        )),
        cityTag: v.optional(v.string()),
        lastActivityAt: v.optional(v.number()),
        isLocked: v.optional(v.boolean()),
        isDeleted: v.optional(v.boolean()),
        editedAt: v.optional(v.number()),
        isPinned: v.boolean(),
        isRules: v.boolean(),
        likes: v.number(),
        commentsCount: v.number(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_created", ["createdAt"])
        .index("by_pinned", ["isPinned"])
        .index("by_board_created", ["board", "createdAt"])
        .index("by_board_activity", ["board", "lastActivityAt"])
        .index("by_board_category", ["board", "category"])
        .index("by_board_city", ["board", "cityTag"])
        .index("by_deleted_created", ["isDeleted", "createdAt"]),

    // Community comments / replies (2 levels: top-level + one nested level)
    communityComments: defineTable({
        postId: v.id("communityPosts"),
        authorId: v.id("users"),
        parentCommentId: v.optional(v.id("communityComments")),
        content: v.string(),
        isDeleted: v.boolean(),
        reactionCount: v.number(),
        replyCount: v.number(),
        createdAt: v.number(),
        editedAt: v.optional(v.number()),
    })
        .index("by_post_created", ["postId", "createdAt"])
        .index("by_post_parent", ["postId", "parentCommentId"])
        .index("by_parent", ["parentCommentId"])
        .index("by_author", ["authorId"]),

    // Community reactions for both threads and comments
    communityReactions: defineTable({
        targetType: v.union(v.literal("post"), v.literal("comment")),
        targetId: v.string(),
        userId: v.id("users"),
        reactionType: v.union(v.literal("upvote")),
        createdAt: v.number(),
    })
        .index("by_target", ["targetType", "targetId"])
        .index("by_user_target", ["userId", "targetType", "targetId"])
        .index("by_unique_reaction", ["targetType", "targetId", "userId", "reactionType"]),

    // Community moderation reports for threads/comments
    communityReports: defineTable({
        targetType: v.union(v.literal("post"), v.literal("comment")),
        targetId: v.string(),
        reason: v.union(
            v.literal("spam"),
            v.literal("harassment"),
            v.literal("misinformation"),
            v.literal("scam"),
            v.literal("animal_welfare"),
            v.literal("other"),
        ),
        details: v.optional(v.string()),
        reporterId: v.id("users"),
        status: v.union(v.literal("open"), v.literal("reviewing"), v.literal("closed"), v.literal("dismissed")),
        createdAt: v.number(),
        reviewedAt: v.optional(v.number()),
        reviewedBy: v.optional(v.id("users")),
        resolutionNotes: v.optional(v.string()),
    })
        .index("by_target", ["targetType", "targetId"])
        .index("by_status", ["status"])
        .index("by_reporter", ["reporterId"])
        .index("by_reviewed_by", ["reviewedBy"]),

    // External social/source links attached to cases and community posts
    externalSources: defineTable({
        targetType: v.union(v.literal("case"), v.literal("community_post")),
        targetId: v.string(),
        url: v.string(),
        platform: v.union(
            v.literal("facebook"),
            v.literal("instagram"),
            v.literal("x"),
            v.literal("youtube"),
            v.literal("tiktok"),
            v.literal("other"),
        ),
        title: v.string(),
        thumbnailUrl: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_target_created", ["targetType", "targetId", "createdAt"])
        .index("by_target_url", ["targetType", "targetId", "url"]),

    // Likes table - tracks user likes on cases
    likes: defineTable({
        userId: v.id("users"),
        caseId: v.id("cases"),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_case", ["caseId"])
        .index("by_user_case", ["userId", "caseId"]),

    // Comments table - comments on cases
    comments: defineTable({
        userId: v.id("users"),
        caseId: v.id("cases"),
        content: v.string(),
        // Optional parent comment for replies
        parentId: v.optional(v.id("comments")),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_case", ["caseId"])
        .index("by_parent", ["parentId"])
        .index("by_case_created", ["caseId", "createdAt"]),

    // Reports table - user-submitted trust & safety reports (Phase 0: case reports only)
    reports: defineTable({
        caseId: v.id("cases"),
        reason: v.union(
            v.literal("suspected_scam"),
            v.literal("duplicate_case"),
            v.literal("incorrect_information"),
            v.literal("animal_welfare"),
            v.literal("other"),
        ),
        details: v.optional(v.string()),
        reporterId: v.optional(v.id("users")),
        reporterClerkId: v.optional(v.string()),
        status: v.union(v.literal("open"), v.literal("reviewing"), v.literal("closed")),
        reviewedBy: v.optional(v.id("users")),
        reviewedAt: v.optional(v.number()),
        resolutionAction: v.optional(v.union(
            v.literal("hide_case"),
            v.literal("warn_user"),
            v.literal("dismiss"),
            v.literal("no_action"),
        )),
        resolutionNotes: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_case", ["caseId"])
        .index("by_status", ["status"])
        .index("by_reporter", ["reporterId"])
        .index("by_reviewed_by", ["reviewedBy"]),

    // Case endorsements - trusted community corroboration for verification ladder
    caseEndorsements: defineTable({
        caseId: v.id("cases"),
        userId: v.id("users"),
        createdAt: v.number(),
    })
        .index("by_case", ["caseId"])
        .index("by_case_created", ["caseId", "createdAt"])
        .index("by_user_case", ["userId", "caseId"]),

    // Image fingerprints for duplicate detection (sha256 exact + perceptual hashes)
    imageFingerprints: defineTable({
        storageId: v.id("_storage"),
        sha256: v.string(),
        pHash: v.optional(v.string()),
        dHash: v.optional(v.string()),
        pHashBucket: v.optional(v.string()),
        dHashBucket: v.optional(v.string()),
        caseId: v.id("cases"),
        uploaderId: v.id("users"),
        createdAt: v.number(),
    })
        .index("by_sha256", ["sha256"])
        .index("by_phash_bucket", ["pHashBucket"])
        .index("by_dhash_bucket", ["dHashBucket"])
        .index("by_case", ["caseId"])
        .index("by_storage", ["storageId"]),

    // High-risk action audit trail (moderation, verification, lifecycle, money)
    auditLogs: defineTable({
        actorId: v.optional(v.id("users")),
        entityType: v.string(),
        entityId: v.string(),
        action: v.string(),
        details: v.optional(v.string()),
        metadataJson: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_entity", ["entityType", "entityId"])
        .index("by_actor", ["actorId"])
        .index("by_created_at", ["createdAt"]),

    // Follows table - social follow relationships
    follows: defineTable({
        followerId: v.id("users"),
        followingId: v.id("users"),
        createdAt: v.number(),
    })
        .index("by_follower", ["followerId"])
        .index("by_following", ["followingId"])
        .index("by_follower_following", ["followerId", "followingId"]),

    // Saved cases - bookmarked cases by users
    savedCases: defineTable({
        userId: v.id("users"),
        caseId: v.id("cases"),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_case", ["userId", "caseId"]),

    // Messages table - 1:1 chat messages
    messages: defineTable({
        senderId: v.id("users"),
        receiverId: v.id("users"),
        content: v.string(),
        read: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_sender", ["senderId"])
        .index("by_receiver", ["receiverId"])
        .index("by_conversation", ["senderId", "receiverId"]),
});

