import { v } from "convex/values";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type LandingIntent = "urgent" | "nearby" | "success" | "all";

const CITY_ALIASES: Record<"sofia" | "varna" | "plovdiv", string[]> = {
  sofia: ["sofia", "софия", "софія"],
  varna: ["varna", "варна"],
  plovdiv: ["plovdiv", "пловдив"],
};

const URGENT_TYPES = new Set(["critical", "urgent", "recovering"]);
const SUCCESS_TYPES = new Set(["adopted"]);
const CLOSED_STAGES = new Set(["closed_success", "closed_transferred", "closed_other"]);

function normalizeLocale(locale: string): string {
  return locale.trim().toLowerCase().split("-")[0];
}

function normalizeLifecycleStage(stage: string | undefined) {
  if (
    stage === "active_treatment" ||
    stage === "seeking_adoption" ||
    stage === "closed_success" ||
    stage === "closed_transferred" ||
    stage === "closed_other"
  ) {
    return stage;
  }
  return "active_treatment";
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
    };
  }

  return {
    title: caseDoc.title,
    description: caseDoc.description,
    story: caseDoc.story,
  };
}

function isDonationAllowed(caseDoc: Doc<"cases">): boolean {
  const lifecycleStage = normalizeLifecycleStage(caseDoc.lifecycleStage);
  const isClosed = caseDoc.status === "closed" || CLOSED_STAGES.has(lifecycleStage);
  if (isClosed) return false;

  const verificationStatus = caseDoc.verificationStatus ?? "unverified";
  const riskLevel = caseDoc.riskLevel ?? "low";
  if (verificationStatus === "unverified" && riskLevel === "high") {
    return false;
  }

  return true;
}

function matchCity(caseDoc: Doc<"cases">, city: string | undefined) {
  if (!city) return true;
  const cityKey = city.toLowerCase();
  const aliases = CITY_ALIASES[cityKey as keyof typeof CITY_ALIASES] ?? [cityKey];
  const value = caseDoc.location.city.toLowerCase();
  return aliases.some((alias) => value.includes(alias));
}

function matchSearch(caseDoc: Doc<"cases">, localized: { title: string; description: string; story?: string }, search: string | undefined) {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    localized.title.toLowerCase().includes(q) ||
    localized.description.toLowerCase().includes(q) ||
    (localized.story ?? "").toLowerCase().includes(q) ||
    caseDoc.location.city.toLowerCase().includes(q) ||
    caseDoc.location.neighborhood.toLowerCase().includes(q)
  );
}

function cityCounts(cases: Doc<"cases">[]) {
  const counts = { sofia: 0, varna: 0, plovdiv: 0 };
  for (const caseDoc of cases) {
    const city = caseDoc.location.city.toLowerCase();
    for (const [key, aliases] of Object.entries(CITY_ALIASES) as Array<[keyof typeof CITY_ALIASES, string[]]>) {
      if (aliases.some((alias) => city.includes(alias))) {
        counts[key] += 1;
        break;
      }
    }
  }
  return counts;
}

async function mapCaseForUi(ctx: QueryCtx, caseDoc: Doc<"cases">, locale: string) {
  const localized = pickLocalizedFields(caseDoc, locale);
  const imageUrls = (
    await Promise.all(caseDoc.images.map((imageId) => ctx.storage.getUrl(imageId)))
  ).filter((url): url is string => Boolean(url));
  const author = await ctx.db.get(caseDoc.userId);
  const lifecycleStage = normalizeLifecycleStage(caseDoc.lifecycleStage);

  return {
    id: caseDoc._id,
    title: localized.title,
    description: localized.description,
    story: localized.story ?? "",
    images: imageUrls,
    status: caseDoc.type,
    fundingStatus: caseDoc.status,
    lifecycleStage,
    lifecycleUpdatedAt: caseDoc.lifecycleUpdatedAt ? new Date(caseDoc.lifecycleUpdatedAt).toISOString() : null,
    closedAt: caseDoc.closedAt ? new Date(caseDoc.closedAt).toISOString() : null,
    closedReason: caseDoc.closedReason ?? null,
    closedNotes: caseDoc.closedNotes ?? null,
    verificationStatus: caseDoc.verificationStatus ?? "unverified",
    riskLevel: caseDoc.riskLevel ?? "low",
    riskFlags: caseDoc.riskFlags ?? [],
    isDonationAllowed: isDonationAllowed(caseDoc),
    species: "other" as const,
    location: { city: caseDoc.location.city, neighborhood: caseDoc.location.neighborhood },
    fundraising: caseDoc.fundraising,
    clinicId: caseDoc.clinicId ?? null,
    updates: [],
    ownerId: caseDoc.userId,
    createdAt: new Date(caseDoc.createdAt).toISOString(),
    author: author
      ? {
        id: author._id,
        name: author.displayName || author.name,
        avatar: author.avatar,
      }
      : null,
  };
}

async function resolveUnreadCounts(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { notifications: 0, community: 0 };
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) return { notifications: 0, community: 0 };

  const [unreadNotifications, recentCommunityPosts] = await Promise.all([
    ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("read", false))
      .collect(),
    ctx.db
      .query("communityPosts")
      .withIndex("by_created")
      .order("desc")
      .take(40),
  ]);

  // Lightweight approximation: new community posts from others in the last 24h.
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const communityUnread = recentCommunityPosts.filter(
    (post) => post.userId !== user._id && post.createdAt >= cutoff
  ).length;

  return {
    notifications: unreadNotifications.length,
    community: communityUnread,
  };
}

async function getUrgentStories(ctx: QueryCtx, locale: string, limit: number) {
  const [critical, urgent] = await Promise.all([
    ctx.db.query("cases").withIndex("by_type", (q) => q.eq("type", "critical")).collect(),
    ctx.db.query("cases").withIndex("by_type", (q) => q.eq("type", "urgent")).collect(),
  ]);

  const sorted = [...critical, ...urgent]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, Math.max(limit * 2, 12));

  const stories = await Promise.all(
    sorted.map(async (caseDoc) => {
      const localized = pickLocalizedFields(caseDoc, locale);
      const imageUrl = caseDoc.images[0] ? await ctx.storage.getUrl(caseDoc.images[0]) : null;
      const latestUpdate = [...(caseDoc.updates ?? [])].sort((a, b) => b.date - a.date)[0];

      return {
        id: `case-${caseDoc._id}`,
        type: latestUpdate ? "case_update" : "case_created",
        caseId: caseDoc._id,
        title: localized.title,
        subtitle: latestUpdate?.text ?? localized.description,
        imageUrl,
        timestamp: latestUpdate?.date ?? caseDoc.createdAt,
        status: caseDoc.type,
      };
    })
  );

  return stories
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export const getLandingFeed = query({
  args: {
    locale: v.string(),
    intent: v.optional(v.union(v.literal("urgent"), v.literal("nearby"), v.literal("success"), v.literal("all"))),
    city: v.optional(v.string()),
    search: v.optional(v.string()),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const locale = args.locale;
    const intent: LandingIntent = args.intent ?? "urgent";
    const limit = Math.min(Math.max(args.limit ?? 12, 1), 30);

    // Fetch broad datasets once and perform view-specific shaping server-side.
    const [allCasesRaw, featuredInitiativesRaw, stories, unreadCounts] = await Promise.all([
      ctx.db.query("cases").order("desc").collect(),
      ctx.db
        .query("campaigns")
        .withIndex("by_featured_initiative", (q) => q.eq("featuredInitiative", true))
        .order("desc")
        .take(2),
      getUrgentStories(ctx, locale, 12),
      resolveUnreadCounts(ctx),
    ]);

    const filtered = allCasesRaw.filter((caseDoc) => {
      if (args.cursor && caseDoc.createdAt >= args.cursor) return false;

      if (intent === "urgent" && !URGENT_TYPES.has(caseDoc.type)) return false;
      if (intent === "success" && !SUCCESS_TYPES.has(caseDoc.type)) return false;
      if (!matchCity(caseDoc, args.city)) return false;

      const localized = pickLocalizedFields(caseDoc, locale);
      if (!matchSearch(caseDoc, localized, args.search)) return false;

      return true;
    });

    const heroCandidate =
      intent === "urgent"
        ? filtered
          .filter((caseDoc) => caseDoc.type === "critical")
          .sort((a, b) => {
            const pctA = a.fundraising.goal > 0 ? a.fundraising.current / a.fundraising.goal : 1;
            const pctB = b.fundraising.goal > 0 ? b.fundraising.current / b.fundraising.goal : 1;
            if (pctA !== pctB) return pctA - pctB;
            return b.createdAt - a.createdAt;
          })[0] ?? null
        : null;

    const filteredWithoutHero = heroCandidate ? filtered.filter((caseDoc) => caseDoc._id !== heroCandidate._id) : filtered;
    const paginated = filteredWithoutHero.slice(0, limit);
    const hasMore = filteredWithoutHero.length > limit;
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].createdAt : null;

    const [heroCase, casesPageItems] = await Promise.all([
      heroCandidate ? mapCaseForUi(ctx, heroCandidate, locale) : Promise.resolve(null),
      Promise.all(paginated.map((caseDoc) => mapCaseForUi(ctx, caseDoc, locale))),
    ]);

    const featuredInitiativeSource = featuredInitiativesRaw.find((campaign) => campaign.status === "active")
      ?? null;

    const featuredInitiative = featuredInitiativeSource
      ? {
        id: featuredInitiativeSource._id,
        title: featuredInitiativeSource.title,
        description: featuredInitiativeSource.description,
        image: featuredInitiativeSource.image ?? null,
        goal: featuredInitiativeSource.goal,
        current: featuredInitiativeSource.current,
        unit: featuredInitiativeSource.unit,
        endDate: featuredInitiativeSource.endDate ?? null,
      }
      : null;

    return {
      heroCase,
      stories,
      cityCounts: cityCounts(allCasesRaw),
      casesPage: {
        items: casesPageItems,
        hasMore,
        nextCursor,
      },
      featuredInitiative,
      unreadCounts,
    };
  },
});

export const getUnreadCounts = query({
  args: {},
  handler: async (ctx) => {
    return resolveUnreadCounts(ctx);
  },
});
