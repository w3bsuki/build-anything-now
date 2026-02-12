import { v } from "convex/values";
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "./lib/auth";

const volunteerAvailabilityValidator = v.union(
    v.literal("available"),
    v.literal("busy"),
    v.literal("offline"),
);

const volunteerCapabilityValidator = v.union(
    v.literal("transport"),
    v.literal("fostering"),
    v.literal("rescue"),
    v.literal("events"),
    v.literal("social_media"),
    v.literal("medical"),
    v.literal("general"),
);

const directoryAvailabilityValidator = v.union(
    v.literal("available"),
    v.literal("busy"),
    v.literal("offline"),
    v.literal("all"),
);

type VolunteerAvailability = "available" | "busy" | "offline";
type DirectoryAvailabilityFilter = VolunteerAvailability | "all";
type VolunteerCapability = "transport" | "fostering" | "rescue" | "events" | "social_media" | "medical" | "general";
type VolunteerStatKey = "animalsHelped" | "adoptions" | "campaigns" | "donationsReceived" | "hoursVolunteered";

const volunteerCapabilities: VolunteerCapability[] = [
    "transport",
    "fostering",
    "rescue",
    "events",
    "social_media",
    "medical",
    "general",
];

const capabilitySet = new Set<VolunteerCapability>(volunteerCapabilities);
const TRANSPORT_REQUEST_COOLDOWN_MS = 10 * 60 * 1000;
const TRANSPORT_REQUEST_MESSAGE_MAX = 280;

type EnrichedVolunteer = Doc<"volunteers"> & {
    name: string;
    avatar?: string;
    city: string | null;
    availability: VolunteerAvailability;
    capabilities: VolunteerCapability[];
};

type DirectoryFilters = {
    topOnly?: boolean;
    city?: string;
    capability?: VolunteerCapability;
    availability?: DirectoryAvailabilityFilter;
    includeOffline?: boolean;
    limit?: number;
};

function normalizeText(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

function normalizeCity(value?: string | null): string | null {
    const normalized = normalizeText(value);
    return normalized ? normalized.toLowerCase() : null;
}

function normalizeAvailability(value?: string | null): VolunteerAvailability {
    if (value === "available" || value === "busy" || value === "offline") {
        return value;
    }
    return "offline";
}

function normalizeCapabilities(values?: string[] | null): VolunteerCapability[] {
    if (!values?.length) return [];
    const normalized: VolunteerCapability[] = [];

    for (const rawValue of values) {
        const value = rawValue.trim().toLowerCase() as VolunteerCapability;
        if (!capabilitySet.has(value) || normalized.includes(value)) continue;
        normalized.push(value);
    }

    return normalized;
}

function getDisplayName(user: Doc<"users"> | null): string {
    const preferred = normalizeText(user?.displayName) ?? normalizeText(user?.name);
    return preferred ?? "Unknown";
}

async function listEnrichedVolunteers(
    ctx: QueryCtx | MutationCtx,
    filters: DirectoryFilters,
): Promise<EnrichedVolunteer[]> {
    let volunteers: Doc<"volunteers">[];

    if (filters.topOnly) {
        volunteers = await ctx.db
            .query("volunteers")
            .withIndex("by_top", (q) => q.eq("isTopVolunteer", true))
            .collect();
    } else {
        volunteers = await ctx.db.query("volunteers").collect();
    }

    const normalizedCityFilter = normalizeCity(filters.city);
    const includeOffline = filters.includeOffline ?? false;

    const enriched = await Promise.all(
        volunteers.map(async (volunteer): Promise<EnrichedVolunteer | null> => {
            const user = await ctx.db.get(volunteer.userId);
            if (!user) return null;

            const availability = normalizeAvailability(user.volunteerAvailability);
            if (!includeOffline && availability === "offline") return null;
            if (filters.availability && filters.availability !== "all" && availability !== filters.availability) return null;

            const city = normalizeText(user.volunteerCity) ?? normalizeText(user.city) ?? normalizeText(volunteer.location);
            if (normalizedCityFilter && normalizeCity(city) !== normalizedCityFilter) return null;

            const capabilities = normalizeCapabilities(user.volunteerCapabilities);
            if (filters.capability && !capabilities.includes(filters.capability)) return null;

            return {
                ...volunteer,
                name: getDisplayName(user),
                avatar: user.avatar,
                city,
                availability,
                capabilities,
            };
        }),
    );

    const sorted = enriched
        .filter((value): value is EnrichedVolunteer => value !== null)
        .sort((a, b) => {
            if (a.isTopVolunteer !== b.isTopVolunteer) {
                return a.isTopVolunteer ? -1 : 1;
            }
            if (b.stats.animalsHelped !== a.stats.animalsHelped) {
                return b.stats.animalsHelped - a.stats.animalsHelped;
            }
            return b.createdAt - a.createdAt;
        });

    if (!filters.limit || filters.limit <= 0) return sorted;

    const safeLimit = Math.min(Math.max(Math.floor(filters.limit), 1), 100);
    return sorted.slice(0, safeLimit);
}

// List all volunteers with optional filters
export const list = query({
    args: {
        topOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        return listEnrichedVolunteers(ctx, {
            topOnly: args.topOnly,
            includeOffline: true,
        });
    },
});

// Get a single volunteer by ID
export const get = query({
    args: { id: v.id("volunteers") },
    handler: async (ctx, args) => {
        const volunteer = await ctx.db.get(args.id);
        if (!volunteer) return null;

        const user = await ctx.db.get(volunteer.userId);
        return {
            ...volunteer,
            name: getDisplayName(user),
            avatar: user?.avatar,
            city: normalizeText(user?.volunteerCity) ?? normalizeText(user?.city) ?? normalizeText(volunteer.location),
            availability: normalizeAvailability(user?.volunteerAvailability),
            capabilities: normalizeCapabilities(user?.volunteerCapabilities),
            // Never expose user email on public volunteer endpoints.
        };
    },
});

export const listDirectory = query({
    args: {
        city: v.optional(v.string()),
        capability: v.optional(volunteerCapabilityValidator),
        availability: v.optional(directoryAvailabilityValidator),
        topOnly: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return listEnrichedVolunteers(ctx, {
            topOnly: args.topOnly,
            city: args.city,
            capability: args.capability,
            availability: args.availability,
            includeOffline: args.availability === "offline" || args.availability === "all",
            limit: args.limit,
        });
    },
});

export const listTransportMatches = query({
    args: {
        caseId: v.id("cases"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const caseDoc = await ctx.db.get(args.caseId);
        if (!caseDoc) return [];

        const city = normalizeText(caseDoc.location.city);
        if (!city) return [];

        return listEnrichedVolunteers(ctx, {
            city,
            capability: "transport",
            availability: "available",
            includeOffline: false,
            limit: args.limit ?? 20,
        });
    },
});

export const create = mutation({
    args: {
        bio: v.string(),
        location: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const existing = await ctx.db
            .query("volunteers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        if (existing) {
            return { id: existing._id, created: false as const };
        }

        const bio = normalizeText(args.bio);
        if (!bio) throw new Error("Volunteer bio is required");
        if (bio.length > 600) throw new Error("Volunteer bio must be 600 characters or fewer");

        const location = normalizeText(args.location) ?? normalizeText(user.volunteerCity) ?? normalizeText(user.city);
        if (!location) throw new Error("City is required for volunteer profile");

        const now = Date.now();
        const volunteerId = await ctx.db.insert("volunteers", {
            userId,
            bio,
            location,
            rating: 5,
            memberSince: new Date(now).getUTCFullYear().toString(),
            isTopVolunteer: false,
            badges: [],
            stats: {
                animalsHelped: 0,
                adoptions: 0,
                campaigns: 0,
                donationsReceived: 0,
                hoursVolunteered: 0,
            },
            createdAt: now,
        });

        const normalizedCapabilities = normalizeCapabilities(user.volunteerCapabilities);
        const userPatch: Record<string, unknown> = {
            volunteerAvailability: "offline",
            volunteerCity: location,
        };

        if (user.role === "user") {
            userPatch.role = "volunteer";
        }
        if (user.userType !== "volunteer") {
            userPatch.userType = "volunteer";
        }
        if (!user.city) {
            userPatch.city = location;
        }
        if (normalizedCapabilities.length > 0) {
            userPatch.volunteerCapabilities = normalizedCapabilities;
        }

        await ctx.db.patch(userId, userPatch);

        await ctx.db.insert("auditLogs", {
            actorId: userId,
            entityType: "volunteer",
            entityId: String(volunteerId),
            action: "volunteer.created",
            createdAt: now,
        });

        return { id: volunteerId, created: true as const };
    },
});

export const update = mutation({
    args: {
        id: v.id("volunteers"),
        bio: v.optional(v.string()),
        location: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const volunteer = await ctx.db.get(args.id);
        if (!volunteer) throw new Error("Volunteer profile not found");
        if (volunteer.userId !== userId) throw new Error("Unauthorized volunteer access");

        const patch: Record<string, unknown> = {};

        if (args.bio !== undefined) {
            const bio = normalizeText(args.bio);
            if (!bio) throw new Error("Volunteer bio is required");
            if (bio.length > 600) throw new Error("Volunteer bio must be 600 characters or fewer");
            patch.bio = bio;
        }

        let locationToSync: string | null = null;
        if (args.location !== undefined) {
            const location = normalizeText(args.location);
            if (!location) throw new Error("City is required");
            patch.location = location;
            locationToSync = location;
        }

        if (Object.keys(patch).length === 0) {
            throw new Error("No volunteer fields provided");
        }

        await ctx.db.patch(args.id, patch);

        if (locationToSync) {
            const user = await ctx.db.get(userId);
            const userPatch: Record<string, unknown> = {
                volunteerCity: locationToSync,
            };

            if (!user?.city) {
                userPatch.city = locationToSync;
            }

            await ctx.db.patch(userId, userPatch);
        }

        return { success: true };
    },
});

export const updateAvailability = mutation({
    args: {
        availability: volunteerAvailabilityValidator,
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");
        const isVolunteer = user.role === "volunteer" || user.userType === "volunteer";
        if (!isVolunteer) throw new Error("Volunteer settings are only available for volunteer users");

        const previous = normalizeAvailability(user.volunteerAvailability);
        await ctx.db.patch(userId, {
            volunteerAvailability: args.availability,
        });

        if (previous !== args.availability) {
            await ctx.db.insert("auditLogs", {
                actorId: userId,
                entityType: "user",
                entityId: String(userId),
                action: "volunteer.availability_updated",
                details: `${previous}->${args.availability}`,
                createdAt: Date.now(),
            });
        }

        return { success: true, availability: args.availability };
    },
});

export const updateCapabilities = mutation({
    args: {
        capabilities: v.array(volunteerCapabilityValidator),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");
        const isVolunteer = user.role === "volunteer" || user.userType === "volunteer";
        if (!isVolunteer) throw new Error("Volunteer settings are only available for volunteer users");

        const normalized = Array.from(new Set(args.capabilities));
        await ctx.db.patch(userId, {
            volunteerCapabilities: normalized,
        });

        return { success: true, capabilities: normalized };
    },
});

export const createTransportRequest = mutation({
    args: {
        caseId: v.id("cases"),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const requester = await ctx.db.get(userId);
        if (!requester) throw new Error("User not found");

        const caseDoc = await ctx.db.get(args.caseId);
        if (!caseDoc) throw new Error("Case not found");

        const isOwner = caseDoc.userId === userId;
        const isPrivileged = requester.role === "admin" || requester.role === "clinic";
        if (!isOwner && !isPrivileged) {
            throw new Error("Only case owners can request transport support");
        }

        const now = Date.now();
        const recentRequestLogs = await ctx.db
            .query("auditLogs")
            .withIndex("by_entity", (q) => q.eq("entityType", "case").eq("entityId", String(args.caseId)))
            .order("desc")
            .take(20);

        const hasRecentRequest = recentRequestLogs.some((log) =>
            log.action === "volunteer.transport_requested" &&
            log.actorId === userId &&
            now - log.createdAt < TRANSPORT_REQUEST_COOLDOWN_MS,
        );

        if (hasRecentRequest) {
            throw new Error("Transport request sent recently. Please wait before sending another.");
        }

        const city = normalizeText(caseDoc.location.city);
        if (!city) throw new Error("Case city is required for transport matching");

        const message = normalizeText(args.message);
        if (message && message.length > TRANSPORT_REQUEST_MESSAGE_MAX) {
            throw new Error(`Transport request note must be ${TRANSPORT_REQUEST_MESSAGE_MAX} characters or fewer`);
        }

        const matches = await listEnrichedVolunteers(ctx, {
            city,
            capability: "transport",
            availability: "available",
            includeOffline: false,
            limit: 100,
        });

        const targets = matches.filter((match) => match.userId !== userId);
        const requesterName = getDisplayName(requester);

        for (const target of targets) {
            const baseMessage = `${requesterName} requested transport help for "${caseDoc.title}" in ${city}.`;
            const fullMessage = message ? `${baseMessage} Note: ${message}` : baseMessage;
            await ctx.db.insert("notifications", {
                userId: target.userId,
                type: "system",
                title: "Transport help needed nearby",
                message: fullMessage,
                caseId: args.caseId,
                read: false,
                createdAt: now,
            });
        }

        await ctx.db.insert("auditLogs", {
            actorId: userId,
            entityType: "case",
            entityId: String(args.caseId),
            action: "volunteer.transport_requested",
            details: `city=${city};matches=${targets.length}`,
            metadataJson: JSON.stringify({
                volunteerIds: targets.map((target) => String(target._id)),
            }),
            createdAt: now,
        });

        return {
            success: true,
            city,
            notifiedCount: targets.length,
            volunteerIds: targets.map((target) => target._id),
        };
    },
});

export const setTopVolunteer = internalMutation({
    args: {
        volunteerId: v.id("volunteers"),
        isTopVolunteer: v.boolean(),
        actorId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const volunteer = await ctx.db.get(args.volunteerId);
        if (!volunteer) throw new Error("Volunteer profile not found");

        await ctx.db.patch(args.volunteerId, {
            isTopVolunteer: args.isTopVolunteer,
        });

        await ctx.db.insert("auditLogs", {
            actorId: args.actorId,
            entityType: "volunteer",
            entityId: String(args.volunteerId),
            action: "volunteer.top_flag_updated",
            details: args.isTopVolunteer ? "enabled" : "disabled",
            createdAt: Date.now(),
        });
    },
});

export const incrementStats = internalMutation({
    args: {
        volunteerId: v.id("volunteers"),
        stat: v.union(
            v.literal("animalsHelped"),
            v.literal("adoptions"),
            v.literal("campaigns"),
            v.literal("donationsReceived"),
            v.literal("hoursVolunteered"),
        ),
        amount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const volunteer = await ctx.db.get(args.volunteerId);
        if (!volunteer) throw new Error("Volunteer profile not found");

        const amount = Math.max(1, Math.floor(args.amount ?? 1));
        const nextStats: Record<VolunteerStatKey, number> = {
            animalsHelped: volunteer.stats.animalsHelped,
            adoptions: volunteer.stats.adoptions,
            campaigns: volunteer.stats.campaigns,
            donationsReceived: volunteer.stats.donationsReceived,
            hoursVolunteered: volunteer.stats.hoursVolunteered,
        };

        nextStats[args.stat] += amount;

        await ctx.db.patch(args.volunteerId, {
            stats: nextStats,
        });

        return nextStats;
    },
});
