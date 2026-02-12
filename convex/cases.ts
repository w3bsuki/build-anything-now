import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireUser } from "./lib/auth";

const UPDATE_TYPE_VALUES = ["medical", "milestone", "update", "success"] as const;
const LIFECYCLE_STAGE_VALUES = [
  "active_treatment",
  "seeking_adoption",
  "closed_success",
  "closed_transferred",
  "closed_other",
] as const;

type CaseType = "critical" | "urgent" | "recovering" | "adopted";
type CaseStatus = "active" | "funded" | "closed";
type UpdateType = (typeof UPDATE_TYPE_VALUES)[number];
type AuthorRole = "owner" | "clinic" | "moderator";
type LifecycleStage = (typeof LIFECYCLE_STAGE_VALUES)[number];

type ViewerUser = Pick<Doc<"users">, "_id" | "role">;

const CLOSED_STAGES = new Set<LifecycleStage>(["closed_success", "closed_transferred", "closed_other"]);

const LIFECYCLE_TRANSITIONS: Record<LifecycleStage, LifecycleStage[]> = {
  active_treatment: ["seeking_adoption", "closed_success", "closed_transferred", "closed_other"],
  seeking_adoption: ["closed_success", "closed_transferred", "closed_other"],
  closed_success: [],
  closed_transferred: [],
  closed_other: [],
};

function normalizeLocale(locale: string): string {
  return locale.trim().toLowerCase().split("-")[0];
}

function normalizeLifecycleStage(stage: string | undefined): LifecycleStage {
  if (!stage) return "active_treatment";
  if ((LIFECYCLE_STAGE_VALUES as readonly string[]).includes(stage)) {
    return stage as LifecycleStage;
  }
  return "active_treatment";
}

function canManageCase(viewer: ViewerUser | null, caseDoc: Doc<"cases">): boolean {
  if (!viewer) return false;
  return viewer._id === caseDoc.userId || viewer.role === "admin" || viewer.role === "clinic";
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

function normalizeUpdateType(caseDoc: Doc<"cases">, rawType: string | undefined): UpdateType {
  if (rawType && (UPDATE_TYPE_VALUES as readonly string[]).includes(rawType)) {
    return rawType as UpdateType;
  }

  if (caseDoc.type === "critical" || caseDoc.type === "urgent") {
    return "medical";
  }

  return "update";
}

function deriveUpdateTitle(updateType: UpdateType, clinicName: string | undefined): string {
  if (updateType === "medical" && clinicName) return `Clinic update: ${clinicName}`;
  if (updateType === "medical") return "Medical update";
  if (updateType === "milestone") return "Milestone update";
  if (updateType === "success") return "Success update";
  return "Case update";
}

async function resolveUpdateImages(ctx: QueryCtx, imageIds: Id<"_storage">[] | undefined) {
  if (!imageIds || imageIds.length === 0) return [] as string[];
  const urls = await Promise.all(imageIds.map((id) => ctx.storage.getUrl(id)));
  return urls.filter((u): u is string => Boolean(u));
}

async function mapUpdatesForUi(ctx: QueryCtx, caseDoc: Doc<"cases">) {
  return Promise.all(
    caseDoc.updates.map(async (u, index) => {
      const updateType = normalizeUpdateType(caseDoc, u.type);
      const imageUrls = await resolveUpdateImages(ctx, u.images);

      return {
        id: u.id ?? `${caseDoc._id}:${index}`,
        date: new Date(u.date).toISOString(),
        title: deriveUpdateTitle(updateType, u.clinicName),
        description: u.text,
        type: updateType,
        evidenceType: u.evidenceType ?? null,
        clinicId: u.clinicId ?? null,
        clinicName: u.clinicName ?? null,
        authorRole: u.authorRole ?? "owner",
        images: imageUrls,
      };
    })
  );
}

async function getViewer(ctx: QueryCtx): Promise<ViewerUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) return null;
  return { _id: user._id, role: user.role };
}

async function mapCaseForUi(ctx: QueryCtx, caseDoc: Doc<"cases">, locale: string, viewer: ViewerUser | null) {
  const localized = pickLocalizedFields(caseDoc, locale);
  const imageUrls = (await Promise.all(caseDoc.images.map((id) => ctx.storage.getUrl(id))))
    .filter((u): u is string => Boolean(u));

  const targetLocale = normalizeLocale(locale);
  const translationStatus = caseDoc.translationStatus?.[targetLocale]?.status ?? null;
  const lifecycleStage = normalizeLifecycleStage(caseDoc.lifecycleStage);
  const updates = await mapUpdatesForUi(ctx, caseDoc);

  const payload = {
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
    updates,
    ownerId: caseDoc.userId,
    canManageCase: canManageCase(viewer, caseDoc),
    createdAt: new Date(caseDoc.createdAt).toISOString(),
    isMachineTranslated: localized.isMachineTranslated,
    translatedFrom: localized.translatedFrom ?? null,
    originalLanguage: normalizeLocale(caseDoc.language ?? "") || null,
    translationStatus,
    originalTitle: caseDoc.title,
    originalDescription: caseDoc.description,
    originalStory: caseDoc.story ?? "",
  };
  return payload;
}

function ensureLifecycleTransition(currentStage: LifecycleStage, nextStage: LifecycleStage) {
  if (currentStage === nextStage) return;
  const allowedNext = LIFECYCLE_TRANSITIONS[currentStage] ?? [];
  if (!allowedNext.includes(nextStage)) {
    throw new Error(`Invalid lifecycle transition: ${currentStage} -> ${nextStage}`);
  }
}

function lifecycleCloseReason(stage: LifecycleStage) {
  if (stage === "closed_success") return "success" as const;
  if (stage === "closed_transferred") return "transferred" as const;
  return "other" as const;
}

function lifecycleTransitionLabel(stage: LifecycleStage): string {
  if (stage === "seeking_adoption") return "Case moved to seeking adoption";
  if (stage === "closed_success") return "Case closed: successful outcome";
  if (stage === "closed_transferred") return "Case closed: transferred";
  if (stage === "closed_other") return "Case closed";
  return "Case lifecycle updated";
}

function deriveAuthorRole(userRole: Doc<"users">["role"]): AuthorRole {
  if (userRole === "clinic") return "clinic";
  if (userRole === "admin") return "moderator";
  return "owner";
}

// List all cases with optional filters
export const list = query({
  args: {
    type: v.optional(v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted"))),
    status: v.optional(v.union(v.literal("active"), v.literal("funded"), v.literal("closed"))),
  },
  handler: async (ctx, args) => {
    let cases: Doc<"cases">[];

    if (args.type) {
      cases = await ctx.db
        .query("cases")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    } else {
      cases = await ctx.db.query("cases").collect();
    }

    if (args.status) {
      return cases.filter((c) => c.status === args.status);
    }

    return cases;
  },
});

// Get a single case by ID
export const get = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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

    let cases: Doc<"cases">[];
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

    return Promise.all(cases.map((c) => mapCaseForUi(ctx, c, locale, null)));
  },
});

// UI-friendly detail: includes original fields for "View original" and authorization hints.
export const getUiForLocale = query({
  args: { id: v.id("cases"), locale: v.string() },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.id);
    if (!caseDoc) return null;

    const viewer = await getViewer(ctx);
    return mapCaseForUi(ctx, caseDoc, args.locale, viewer);
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

// Get cases by user with image URLs (for profile display)
export const listByUserWithImages = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cases = await ctx.db
      .query("cases")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return Promise.all(
      cases.map(async (c) => {
        let imageUrl: string | null = null;
        if (c.images.length > 0) {
          imageUrl = await ctx.storage.getUrl(c.images[0]);
        }
        return {
          _id: c._id,
          title: c.title,
          description: c.description,
          type: c.type,
          status: c.status,
          lifecycleStage: normalizeLifecycleStage(c.lifecycleStage),
          location: c.location,
          fundraising: c.fundraising,
          imageUrl,
          createdAt: c.createdAt,
        };
      })
    );
  },
});

// Create a new case
export const create = mutation({
  args: {
    type: v.union(v.literal("critical"), v.literal("urgent"), v.literal("recovering"), v.literal("adopted")),
    category: v.union(v.literal("surgery"), v.literal("shelter"), v.literal("food"), v.literal("medical"), v.literal("rescue")),
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
    const now = Date.now();

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
      verificationStatus: "unverified",
      foundAt: args.foundAt,
      broughtToClinicAt: args.broughtToClinicAt,
      fundraising: {
        goal: args.fundraisingGoal,
        current: 0,
        currency: args.currency,
      },
      status: "active",
      lifecycleStage: "active_treatment",
      lifecycleUpdatedAt: now,
      riskLevel: "low",
      updates: [],
      createdAt: now,
    });

    return caseId;
  },
});

// Add update to a case (owner, clinic, or admin)
export const addUpdate = mutation({
  args: {
    caseId: v.id("cases"),
    text: v.string(),
    type: v.optional(v.union(v.literal("medical"), v.literal("milestone"), v.literal("update"), v.literal("success"))),
    images: v.optional(v.array(v.id("_storage"))),
    evidenceType: v.optional(v.union(v.literal("bill"), v.literal("lab_result"), v.literal("clinic_photo"), v.literal("other"))),
    clinicId: v.optional(v.id("clinics")),
    clinicName: v.optional(v.string()),
    authorRole: v.optional(v.union(v.literal("owner"), v.literal("clinic"), v.literal("moderator"))),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const caseData = await ctx.db.get(args.caseId);
    if (!caseData) throw new Error("Case not found");

    const isOwner = user._id === caseData.userId;
    const isPrivileged = user.role === "admin" || user.role === "clinic";
    if (!isOwner && !isPrivileged) {
      throw new Error("You don't have permission to update this case");
    }

    const text = args.text.trim();
    if (!text) throw new Error("Update text is required");
    if (text.length > 3000) throw new Error("Update text exceeds 3000 characters");

    const now = Date.now();
    const updateType = args.type ?? "update";
    const authorRole = args.authorRole ?? deriveAuthorRole(user.role);

    const updates = [
      ...caseData.updates,
      {
        id: `upd_${now}_${String(user._id)}`,
        date: now,
        type: updateType,
        text,
        images: args.images,
        evidenceType: args.evidenceType,
        clinicId: args.clinicId,
        clinicName: args.clinicName,
        authorRole,
      },
    ];

    await ctx.db.patch(args.caseId, { updates, lifecycleUpdatedAt: now });
    const completedDonations = await ctx.db
      .query("donations")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const donorIds = Array.from(new Set(completedDonations.map((d) => d.userId))).filter(
      (donorId) => donorId !== user._id,
    );


    const caseLocale = (caseData.language ?? "").trim().toLowerCase();
    const isBg = caseLocale.startsWith("bg");
    const title = isBg ? "Обновление по случая" : "Case update";
    const message = isBg ? `Ново обновление за ${caseData.title}` : `New update on ${caseData.title}`;
    for (const donorId of donorIds.slice(0, 200)) {
      await ctx.db.insert("notifications", {
        userId: donorId,
        type: "case_update",
        title,
        message,
        caseId: args.caseId,
        read: false,
        createdAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "case",
      entityId: String(args.caseId),
      action: "case.update_added",
      details: `Update type=${updateType}`,
      createdAt: now,
    });
  },
});

// Move case through lifecycle stages
export const updateLifecycleStage = mutation({
  args: {
    caseId: v.id("cases"),
    stage: v.union(
      v.literal("active_treatment"),
      v.literal("seeking_adoption"),
      v.literal("closed_success"),
      v.literal("closed_transferred"),
      v.literal("closed_other")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const caseData = await ctx.db.get(args.caseId);
    if (!caseData) throw new Error("Case not found");

    const isOwner = user._id === caseData.userId;
    const isPrivileged = user.role === "admin" || user.role === "clinic";
    if (!isOwner && !isPrivileged) {
      throw new Error("You don't have permission to change lifecycle stage");
    }

    const currentStage = normalizeLifecycleStage(caseData.lifecycleStage);
    const nextStage = args.stage;

    ensureLifecycleTransition(currentStage, nextStage);

    const now = Date.now();
    const notes = args.notes?.trim();

    const patch: {
      lifecycleStage: LifecycleStage;
      lifecycleUpdatedAt: number;
      status?: CaseStatus;
      closedAt?: number;
      closedReason?: "success" | "transferred" | "other";
      closedNotes?: string;
      type?: CaseType;
      updates?: Doc<"cases">["updates"];
    } = {
      lifecycleStage: nextStage,
      lifecycleUpdatedAt: now,
    };

    if (nextStage === "seeking_adoption") {
      if (caseData.type === "critical" || caseData.type === "urgent") {
        patch.type = "recovering";
      }
    }

    if (CLOSED_STAGES.has(nextStage)) {
      patch.status = "closed";
      patch.closedAt = now;
      patch.closedReason = lifecycleCloseReason(nextStage);
      patch.closedNotes = notes;
      if (nextStage === "closed_success") {
        patch.type = "adopted";
      }
    }

    const transitionText = notes ? `${lifecycleTransitionLabel(nextStage)}. ${notes}` : lifecycleTransitionLabel(nextStage);
    patch.updates = [
      ...caseData.updates,
      {
        id: `life_${now}_${String(user._id)}`,
        date: now,
        type: CLOSED_STAGES.has(nextStage) ? "success" : "milestone",
        text: transitionText,
        authorRole: deriveAuthorRole(user.role),
      },
    ];

    await ctx.db.patch(args.caseId, patch);

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "case",
      entityId: String(args.caseId),
      action: "case.lifecycle_updated",
      details: `${currentStage} -> ${nextStage}`,
      createdAt: now,
    });
  },
});



