import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireUser, assertOwnership } from "./lib/auth";

function normalizeLocale(locale: string): string {
    return locale.trim().toLowerCase().split("-")[0];
}

function pickLocalizedFields(caseDoc: Doc<"cases">, locale: string) {
    const targetLocale = normalizeLocale(locale);
    const sourceLocale = normalizeLocale(caseDoc.language ?? "");
    const translation = caseDoc.translations?.[targetLocale];

    if (translation && sourceLocale !== targetLocale) {
        return {
            title: translation.title ?? caseDoc.title,
            description: translation.description ?? caseDoc.description,
            story: translation.story ?? caseDoc.story,
            isMachineTranslated: true,
            translatedFrom: sourceLocale || undefined,
        };
    }

    return {
        title: caseDoc.title,
        description: caseDoc.description,
        story: caseDoc.story,
        isMachineTranslated: false,
        translatedFrom: undefined,
    };
}

// List all cases with optional filters
export const list = query({
    args: {
        type: v.optional(v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted"))),
        status: v.optional(v.union(v.literal("active"), v.literal("funded"), v.literal("closed"))),
    },
    handler: async (ctx, args) => {
        let cases;

        if (args.type) {
            cases = await ctx.db
                .query("cases")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .collect();
        } else {
            cases = await ctx.db.query("cases").collect();
        }

        // Filter by status if provided
        if (args.status) {
            return cases.filter(c => c.status === args.status);
        }

        return cases;
    },
});

// List cases, returning title/description/story localized for the requested locale.
// This keeps clients from needing to understand the translations schema.
export const listForLocale = query({
    args: {
        locale: v.string(),
        type: v.optional(v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted"))),
        status: v.optional(v.union(v.literal("active"), v.literal("funded"), v.literal("closed"))),
    },
    handler: async (ctx, args) => {
        const locale = args.locale;

        let cases;
        if (args.type) {
            cases = await ctx.db
                .query("cases")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .collect();
        } else {
            cases = await ctx.db.query("cases").collect();
        }

        if (args.status) {
            cases = cases.filter((c) => c.status === args.status);
        }

        return cases.map((c) => {
            const localized = pickLocalizedFields(c, locale);
            return { ...c, ...localized };
        });
    },
});

// Get a single case by ID
export const get = query({
    args: { id: v.id("cases") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get a single case localized for a locale (omits full translations).
export const getForLocale = query({
    args: { id: v.id("cases"), locale: v.string() },
    handler: async (ctx, args) => {
        const caseDoc = await ctx.db.get(args.id);
        if (!caseDoc) return null;

        const localized = pickLocalizedFields(caseDoc, args.locale);
        return { ...caseDoc, ...localized };
    },
});

// UI-friendly paginated list: returns image URLs with cursor-based pagination
export const listUiForLocalePaginated = query({
    args: {
        locale: v.string(),
        type: v.optional(v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted"))),
        status: v.optional(v.union(v.literal("active"), v.literal("funded"), v.literal("closed"))),
        limit: v.optional(v.number()),
        cursor: v.optional(v.number()), // timestamp-based cursor for pagination
    },
    handler: async (ctx, args) => {
        const locale = args.locale;
        const limit = args.limit ?? 10;

        // Query all cases (we'll filter and paginate)
        let cases;
        if (args.type) {
            cases = await ctx.db
                .query("cases")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .order("desc")
                .collect();
        } else {
            cases = await ctx.db.query("cases").order("desc").collect();
        }

        // Filter by status if provided
        if (args.status) {
            cases = cases.filter((c) => c.status === args.status);
        }

        // Apply cursor filter (get cases created before the cursor timestamp)
        if (args.cursor) {
            cases = cases.filter((c) => c.createdAt < args.cursor!);
        }

        // Get one more than limit to check if there's more
        const hasMore = cases.length > limit;
        const paginatedCases = cases.slice(0, limit);

        // Calculate next cursor
        const nextCursor = paginatedCases.length > 0
            ? paginatedCases[paginatedCases.length - 1].createdAt
            : null;

        // Transform to UI format
        const items = await Promise.all(
            paginatedCases.map(async (c) => {
                const localized = pickLocalizedFields(c, locale);
                const imageUrls = (await Promise.all(c.images.map((id) => ctx.storage.getUrl(id))))
                    .filter((u): u is string => Boolean(u));
                const targetLocale = normalizeLocale(locale);
                const translationStatus = c.translationStatus?.[targetLocale]?.status ?? null;

                return {
                    id: c._id,
                    title: localized.title,
                    description: localized.description,
                    story: localized.story ?? "",
                    images: imageUrls,
                    status: c.type,
                    species: "other",
                    location: { city: c.location.city, neighborhood: c.location.neighborhood },
                    fundraising: c.fundraising,
                    updates: c.updates.map((u, index) => ({
                        id: `${c._id}:${index}`,
                        date: new Date(u.date).toISOString(),
                        title: "",
                        description: u.text,
                        type: "update" as const,
                    })),
                    createdAt: new Date(c.createdAt).toISOString(),
                    isMachineTranslated: localized.isMachineTranslated,
                    translatedFrom: localized.translatedFrom ?? null,
                    originalLanguage: normalizeLocale(c.language ?? "") || null,
                    translationStatus,
                };
            })
        );

        return {
            items,
            nextCursor: hasMore ? nextCursor : null,
            hasMore,
        };
    },
});

// UI-friendly list: returns image URLs and includes translation metadata.
export const listUiForLocale = query({
    args: {
        locale: v.string(),
        type: v.optional(v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted"))),
        status: v.optional(v.union(v.literal("active"), v.literal("funded"), v.literal("closed"))),
    },
    handler: async (ctx, args) => {
        const locale = args.locale;

        let cases;
        if (args.type) {
            cases = await ctx.db
                .query("cases")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .collect();
        } else {
            cases = await ctx.db.query("cases").collect();
        }

        if (args.status) {
            cases = cases.filter((c) => c.status === args.status);
        }

        return await Promise.all(
            cases.map(async (c) => {
                const localized = pickLocalizedFields(c, locale);
                const imageUrls = (await Promise.all(c.images.map((id) => ctx.storage.getUrl(id))))
                    .filter((u): u is string => Boolean(u));
                const targetLocale = normalizeLocale(locale);
                const translationStatus = c.translationStatus?.[targetLocale]?.status ?? null;

                return {
                    id: c._id,
                    title: localized.title,
                    description: localized.description,
                    story: localized.story ?? "",
                    images: imageUrls,
                    status: c.type,
                    species: "other",
                    location: { city: c.location.city, neighborhood: c.location.neighborhood },
                    fundraising: c.fundraising,
                    updates: c.updates.map((u, index) => ({
                        id: `${c._id}:${index}`,
                        date: new Date(u.date).toISOString(),
                        title: "",
                        description: u.text,
                        type: "update" as const,
                    })),
                    createdAt: new Date(c.createdAt).toISOString(),
                    isMachineTranslated: localized.isMachineTranslated,
                    translatedFrom: localized.translatedFrom ?? null,
                    originalLanguage: normalizeLocale(c.language ?? "") || null,
                    translationStatus,
                };
            })
        );
    },
});

// UI-friendly detail: includes original fields for "View original".
export const getUiForLocale = query({
    args: { id: v.id("cases"), locale: v.string() },
    handler: async (ctx, args) => {
        const caseDoc = await ctx.db.get(args.id);
        if (!caseDoc) return null;

        const localized = pickLocalizedFields(caseDoc, args.locale);
        const imageUrls = (await Promise.all(caseDoc.images.map((id) => ctx.storage.getUrl(id))))
            .filter((u): u is string => Boolean(u));
        const targetLocale = normalizeLocale(args.locale);
        const translationStatus = caseDoc.translationStatus?.[targetLocale]?.status ?? null;

        return {
            id: caseDoc._id,
            title: localized.title,
            description: localized.description,
            story: localized.story ?? "",
            originalTitle: caseDoc.title,
            originalDescription: caseDoc.description,
            originalStory: caseDoc.story ?? "",
            images: imageUrls,
            status: caseDoc.type,
            species: "other",
            location: { city: caseDoc.location.city, neighborhood: caseDoc.location.neighborhood },
            fundraising: caseDoc.fundraising,
            updates: caseDoc.updates.map((u, index) => ({
                id: `${caseDoc._id}:${index}`,
                date: new Date(u.date).toISOString(),
                title: "",
                description: u.text,
                type: "update" as const,
            })),
            createdAt: new Date(caseDoc.createdAt).toISOString(),
            isMachineTranslated: localized.isMachineTranslated,
            translatedFrom: localized.translatedFrom ?? null,
            originalLanguage: normalizeLocale(caseDoc.language ?? "") || null,
            translationStatus,
        };
    },
});

// Get cases by user
export const listByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cases")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

// Create a new case
export const create = mutation({
    args: {
        type: v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted")),
        category: v.union(v.literal("surgery"), v.literal("shelter"), v.literal("food"), v.literal("medical"), v.literal("rescue")),
        // Original language for user-generated fields (title/description/story). Pass i18n.language from the client.
        language: v.optional(v.string()),
        title: v.string(),
        description: v.string(),
        story: v.optional(v.string()),
        images: v.array(v.id("_storage")),
        location: v.object({
            city: v.string(),
            neighborhood: v.string(),
            coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
        }),
        clinicId: v.optional(v.id("clinics")),
        foundAt: v.number(),
        broughtToClinicAt: v.optional(v.number()),
        fundraisingGoal: v.number(),
        currency: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const sourceLocale = args.language ? normalizeLocale(args.language) : "";
        const language = sourceLocale || undefined;

        const caseId = await ctx.db.insert("cases", {
            userId: user._id,
            type: args.type,
            category: args.category,
            language,
            title: args.title,
            description: args.description,
            story: args.story,
            images: args.images,
            location: args.location,
            clinicId: args.clinicId,
            foundAt: args.foundAt,
            broughtToClinicAt: args.broughtToClinicAt,
            fundraising: {
                goal: args.fundraisingGoal,
                current: 0,
                currency: args.currency,
            },
            status: "active",
            updates: [],
            createdAt: Date.now(),
        });

        // Translation is on-demand via `translate.requestCaseTranslations`.
        // This avoids translating into locales that nobody views.
        return caseId;
    },
});

// Add update to a case (owner only)
export const addUpdate = mutation({
    args: {
        caseId: v.id("cases"),
        text: v.string(),
        images: v.optional(v.array(v.id("_storage"))),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const caseData = await ctx.db.get(args.caseId);
        if (!caseData) throw new Error("Case not found");
        assertOwnership(user, caseData.userId, "case");

        const updates = [...caseData.updates, {
            date: Date.now(),
            text: args.text,
            images: args.images,
        }];

        await ctx.db.patch(args.caseId, { updates });
    },
});
