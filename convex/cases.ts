import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin, requireUser } from "./lib/auth";

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

const COMMUNITY_ENDORSEMENT_THRESHOLD = 3;
const PERCEPTUAL_HASH_DISTANCE_THRESHOLD = 8;
const PERCEPTUAL_HASH_BUCKET_PREFIX_LENGTH = 12;
const PERCEPTUAL_BUCKET_QUERY_LIMIT = 40;
const HEX_NIBBLE_BIT_COUNTS = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4] as const;

type PreparedImageFingerprint = {
  storageId: Id<"_storage">;
  sha256: string;
  pHash?: string;
  dHash?: string;
  pHashBucket?: string;
  dHashBucket?: string;
};

type PerceptualMatchEvidence = {
  sourceStorageId: string;
  matchedStorageId: string;
  matchedCaseId: string;
  pHashDistance?: number;
  dHashDistance?: number;
};

function normalizeLocale(locale: string): string {
  return locale.trim().toLowerCase().split("-")[0];
}

function normalizePerceptualHash(rawHash: string | undefined): string | undefined {
  if (!rawHash) return undefined;
  const normalized = rawHash.trim().toLowerCase().replace(/^0x/, "");
  if (!normalized) return undefined;
  if (!/^[0-9a-f]+$/.test(normalized)) return undefined;
  return normalized;
}

function perceptualBucketKey(hash: string): string {
  const prefix = hash.slice(0, PERCEPTUAL_HASH_BUCKET_PREFIX_LENGTH);
  return `${hash.length}:${prefix}`;
}

function hammingDistance(leftHash: string, rightHash: string): number | null {
  if (leftHash.length !== rightHash.length) return null;

  let distance = 0;
  for (let index = 0; index < leftHash.length; index += 1) {
    const leftNibble = parseInt(leftHash.charAt(index), 16);
    const rightNibble = parseInt(rightHash.charAt(index), 16);

    if (Number.isNaN(leftNibble) || Number.isNaN(rightNibble)) return null;
    distance += HEX_NIBBLE_BIT_COUNTS[leftNibble ^ rightNibble] ?? 0;
  }

  return distance;
}

async function collectPerceptualCandidates(
  ctx: MutationCtx,
  caseId: Id<"cases">,
  fingerprints: PreparedImageFingerprint[],
): Promise<{ matchedCaseIds: Set<Id<"cases">>; evidence: PerceptualMatchEvidence[] }> {
  const matchedCaseIds = new Set<Id<"cases">>();
  const evidence: PerceptualMatchEvidence[] = [];

  for (const fingerprint of fingerprints) {
    if (!fingerprint.pHash && !fingerprint.dHash) continue;

    const candidateMatches = new Map<
      string,
      {
        caseId: Id<"cases">;
        storageId: Id<"_storage">;
        pHashDistance?: number;
        dHashDistance?: number;
      }
    >();

    if (fingerprint.pHash && fingerprint.pHashBucket) {
      const pHashBucket = fingerprint.pHashBucket;
      const pHashCandidates = await ctx.db
        .query("imageFingerprints")
        .withIndex("by_phash_bucket", (q) => q.eq("pHashBucket", pHashBucket))
        .take(PERCEPTUAL_BUCKET_QUERY_LIMIT);

      for (const candidate of pHashCandidates) {
        if (candidate.caseId === caseId) continue;
        const candidateHash = normalizePerceptualHash(candidate.pHash);
        if (!candidateHash) continue;

        const distance = hammingDistance(fingerprint.pHash, candidateHash);
        if (distance === null || distance > PERCEPTUAL_HASH_DISTANCE_THRESHOLD) continue;

        const key = String(candidate._id);
        const existing = candidateMatches.get(key);
        if (existing) {
          existing.pHashDistance =
            existing.pHashDistance === undefined ? distance : Math.min(existing.pHashDistance, distance);
          continue;
        }

        candidateMatches.set(key, {
          caseId: candidate.caseId,
          storageId: candidate.storageId,
          pHashDistance: distance,
        });
      }
    }

    if (fingerprint.dHash && fingerprint.dHashBucket) {
      const dHashBucket = fingerprint.dHashBucket;
      const dHashCandidates = await ctx.db
        .query("imageFingerprints")
        .withIndex("by_dhash_bucket", (q) => q.eq("dHashBucket", dHashBucket))
        .take(PERCEPTUAL_BUCKET_QUERY_LIMIT);

      for (const candidate of dHashCandidates) {
        if (candidate.caseId === caseId) continue;
        const candidateHash = normalizePerceptualHash(candidate.dHash);
        if (!candidateHash) continue;

        const distance = hammingDistance(fingerprint.dHash, candidateHash);
        if (distance === null || distance > PERCEPTUAL_HASH_DISTANCE_THRESHOLD) continue;

        const key = String(candidate._id);
        const existing = candidateMatches.get(key);
        if (existing) {
          existing.dHashDistance =
            existing.dHashDistance === undefined ? distance : Math.min(existing.dHashDistance, distance);
          continue;
        }

        candidateMatches.set(key, {
          caseId: candidate.caseId,
          storageId: candidate.storageId,
          dHashDistance: distance,
        });
      }
    }

    for (const candidate of candidateMatches.values()) {
      matchedCaseIds.add(candidate.caseId);
      evidence.push({
        sourceStorageId: String(fingerprint.storageId),
        matchedStorageId: String(candidate.storageId),
        matchedCaseId: String(candidate.caseId),
        pHashDistance: candidate.pHashDistance,
        dHashDistance: candidate.dHashDistance,
      });
    }
  }

  return { matchedCaseIds, evidence };
}

function normalizeLifecycleStage(stage: string | undefined): LifecycleStage {
  if (!stage) return "active_treatment";
  if ((LIFECYCLE_STAGE_VALUES as readonly string[]).includes(stage)) {
    return stage as LifecycleStage;
  }
  return "active_treatment";
}

async function canManageCase(ctx: QueryCtx, viewer: ViewerUser | null, caseDoc: Doc<"cases">): Promise<boolean> {
  if (!viewer) return false;
  if (viewer._id === caseDoc.userId) return true;
  if (viewer.role === "admin") return true;
  if (viewer.role !== "clinic") return false;

  if (!caseDoc.clinicId) return false;
  const clinic = await ctx.db.get(caseDoc.clinicId);
  return !!clinic?.verified && clinic.ownerId === viewer._id;
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

function normalizeShareText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateForMeta(value: string, maxLength: number): string {
  const normalized = normalizeShareText(value);
  if (normalized.length <= maxLength) return normalized;

  const trimmed = normalized.slice(0, Math.max(maxLength - 1, 0)).trimEnd();
  return `${trimmed}…`;
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
  const canManage = await canManageCase(ctx, viewer, caseDoc);

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
    canManageCase: canManage,
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

export const getCaseShareMeta = query({
  args: {
    id: v.id("cases"),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.id);
    if (!caseDoc) return null;

    const locale = args.locale ?? caseDoc.language ?? "en";
    const localized = pickLocalizedFields(caseDoc, locale);
    const imageUrl = caseDoc.images[0] ? await ctx.storage.getUrl(caseDoc.images[0]) : null;

    const title = normalizeShareText(localized.title || "Pawtreon");
    const description = truncateForMeta(
      normalizeShareText(localized.description || localized.story || "Rescue case on Pawtreon"),
      220
    );

    return {
      id: caseDoc._id,
      title,
      description,
      imageUrl,
    };
  },
});

export const getCommunityVerificationSummary = query({
  args: {
    caseId: v.id("cases"),
  },
  handler: async (ctx, args) => {
    const [viewer, endorsements] = await Promise.all([
      getViewer(ctx),
      ctx.db.query("caseEndorsements").withIndex("by_case", (q) => q.eq("caseId", args.caseId)).collect(),
    ]);

    const hasEndorsed = viewer
      ? !!(await ctx.db
          .query("caseEndorsements")
          .withIndex("by_user_case", (q) => q.eq("userId", viewer._id).eq("caseId", args.caseId))
          .unique())
      : false;

    return {
      count: endorsements.length,
      threshold: COMMUNITY_ENDORSEMENT_THRESHOLD,
      hasEndorsed,
    };
  },
});

export const setVerificationStatus = mutation({
  args: {
    caseId: v.id("cases"),
    verificationStatus: v.union(v.literal("unverified"), v.literal("community"), v.literal("clinic")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("Case not found");

    const prevStatus = caseDoc.verificationStatus ?? "unverified";
    const nextStatus = args.verificationStatus;
    if (prevStatus === nextStatus) {
      return { ok: true, status: nextStatus };
    }

    const now = Date.now();
    await ctx.db.patch(args.caseId, {
      verificationStatus: nextStatus,
    });

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      entityType: "case",
      entityId: String(args.caseId),
      action: "case.verification_set",
      details: `${prevStatus} -> ${nextStatus}`,
      metadataJson: JSON.stringify({ notes: args.notes?.trim() || null }),
      createdAt: now,
    });

    return { ok: true, status: nextStatus };
  },
});

export const endorseCase = mutation({
  args: {
    caseId: v.id("cases"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const verificationLevel = user.verificationLevel ?? "unverified";
    const isTrusted =
      user.role === "admin" || verificationLevel === "community" || verificationLevel === "clinic" || verificationLevel === "partner";

    if (!isTrusted) {
      throw new Error("Trusted user endorsement required");
    }

    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("Case not found");

    const existing = await ctx.db
      .query("caseEndorsements")
      .withIndex("by_user_case", (q) => q.eq("userId", user._id).eq("caseId", args.caseId))
      .unique();

    if (existing) {
      const endorsedCount = (
        await ctx.db.query("caseEndorsements").withIndex("by_case", (q) => q.eq("caseId", args.caseId)).collect()
      ).length;
      return { ok: true, alreadyEndorsed: true, endorsedCount, promotedToCommunity: false };
    }

    const now = Date.now();
    await ctx.db.insert("caseEndorsements", {
      caseId: args.caseId,
      userId: user._id,
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "case",
      entityId: String(args.caseId),
      action: "case.endorsed",
      createdAt: now,
    });

    const endorsedCount = (
      await ctx.db.query("caseEndorsements").withIndex("by_case", (q) => q.eq("caseId", args.caseId)).collect()
    ).length;

    let promotedToCommunity = false;
    const prevStatus = caseDoc.verificationStatus ?? "unverified";
    if (prevStatus === "unverified" && endorsedCount >= COMMUNITY_ENDORSEMENT_THRESHOLD) {
      await ctx.db.patch(args.caseId, {
        verificationStatus: "community",
      });

      await ctx.db.insert("auditLogs", {
        actorId: user._id,
        entityType: "case",
        entityId: String(args.caseId),
        action: "case.verification_upgraded",
        details: `${prevStatus} -> community`,
        metadataJson: JSON.stringify({
          from: prevStatus,
          to: "community",
          source: "community_endorsements",
          endorsements: endorsedCount,
          threshold: COMMUNITY_ENDORSEMENT_THRESHOLD,
        }),
        createdAt: now,
      });

      promotedToCommunity = true;
    }

    return { ok: true, alreadyEndorsed: false, endorsedCount, promotedToCommunity };
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
    perceptualHashes: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          pHash: v.optional(v.string()),
          dHash: v.optional(v.string()),
        }),
      ),
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

    const uniqueStorageIds = Array.from(new Set(args.images));
    const perceptualHashesByStorage = new Map<
      string,
      {
        pHash?: string;
        dHash?: string;
        pHashBucket?: string;
        dHashBucket?: string;
      }
    >();

    for (const perceptualHash of args.perceptualHashes ?? []) {
      const pHash = normalizePerceptualHash(perceptualHash.pHash);
      const dHash = normalizePerceptualHash(perceptualHash.dHash);
      if (!pHash && !dHash) continue;

      perceptualHashesByStorage.set(String(perceptualHash.storageId), {
        pHash,
        dHash,
        pHashBucket: pHash ? perceptualBucketKey(pHash) : undefined,
        dHashBucket: dHash ? perceptualBucketKey(dHash) : undefined,
      });
    }

    const fingerprints: PreparedImageFingerprint[] = [];

    for (const storageId of uniqueStorageIds) {
      const metadata = await ctx.db.system.get(storageId);
      const sha256 = (metadata as { sha256?: string } | null)?.sha256;
      if (!sha256) continue;

      const perceptualHashes = perceptualHashesByStorage.get(String(storageId));
      fingerprints.push({
        storageId,
        sha256,
        pHash: perceptualHashes?.pHash,
        dHash: perceptualHashes?.dHash,
        pHashBucket: perceptualHashes?.pHashBucket,
        dHashBucket: perceptualHashes?.dHashBucket,
      });
    }

    const matchedCaseIds = new Set<Id<"cases">>();
    for (const fingerprint of fingerprints) {
      const matches = await ctx.db
        .query("imageFingerprints")
        .withIndex("by_sha256", (q) => q.eq("sha256", fingerprint.sha256))
        .take(5);

      for (const match of matches) {
        if (match.caseId !== caseId) {
          matchedCaseIds.add(match.caseId);
        }
      }
    }

    const perceptualMatches = await collectPerceptualCandidates(ctx, caseId, fingerprints);
    for (const matchedCaseId of perceptualMatches.matchedCaseIds) {
      matchedCaseIds.add(matchedCaseId);
    }

    for (const fingerprint of fingerprints) {
      await ctx.db.insert("imageFingerprints", {
        storageId: fingerprint.storageId,
        sha256: fingerprint.sha256,
        pHash: fingerprint.pHash,
        dHash: fingerprint.dHash,
        pHashBucket: fingerprint.pHashBucket,
        dHashBucket: fingerprint.dHashBucket,
        caseId,
        uploaderId: user._id,
        createdAt: now,
      });
    }

    if (matchedCaseIds.size > 0) {
      const perceptualEvidence =
        fingerprints.some((fingerprint) => !!fingerprint.pHash || !!fingerprint.dHash)
          ? {
              threshold: PERCEPTUAL_HASH_DISTANCE_THRESHOLD,
              comparedHashes: fingerprints
                .filter((fingerprint) => !!fingerprint.pHash || !!fingerprint.dHash)
                .map((fingerprint) => ({
                  storageId: String(fingerprint.storageId),
                  pHash: fingerprint.pHash ?? null,
                  dHash: fingerprint.dHash ?? null,
                })),
              matches: perceptualMatches.evidence,
            }
          : undefined;

      const duplicateEvidence = {
        matchedCaseIds: Array.from(matchedCaseIds).map(String),
        sha256: fingerprints.map((f) => f.sha256),
        perceptual: perceptualEvidence,
      };

      await ctx.db.patch(caseId, {
        riskLevel: "high",
        riskFlags: ["possible_duplicate_images"],
      });

      await ctx.db.insert("reports", {
        caseId,
        reason: "duplicate_case",
        details: JSON.stringify(duplicateEvidence),
        status: "open",
        createdAt: now,
      });

      await ctx.db.insert("auditLogs", {
        actorId: undefined,
        entityType: "case",
        entityId: String(caseId),
        action: "case.duplicate_flagged",
        metadataJson: JSON.stringify(duplicateEvidence),
        createdAt: now,
      });
    }

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
    const isAdmin = user.role === "admin";

    const clinicForCase = caseData.clinicId ? await ctx.db.get(caseData.clinicId) : null;
    const isAuthorizedClinic =
      user.role === "clinic" && !!clinicForCase?.verified && clinicForCase.ownerId === user._id;

    if (!isOwner && !isAdmin && !isAuthorizedClinic) {
      throw new Error("You don't have permission to update this case");
    }

    const text = args.text.trim();
    if (!text) throw new Error("Update text is required");
    if (text.length > 3000) throw new Error("Update text exceeds 3000 characters");

    const now = Date.now();
    const updateType = args.type ?? "update";
    const authorRole = deriveAuthorRole(user.role);

    const updateClinicId = isAuthorizedClinic ? caseData.clinicId : args.clinicId;
    const updateClinic =
      updateClinicId && updateClinicId === caseData.clinicId ? clinicForCase : updateClinicId ? await ctx.db.get(updateClinicId) : null;

    if (updateClinicId && !updateClinic) {
      throw new Error("Clinic not found");
    }

    const updateId = `upd_${now}_${String(user._id)}`;

    const updates = [
      ...caseData.updates,
      {
        id: updateId,
        date: now,
        type: updateType,
        text,
        images: args.images,
        evidenceType: args.evidenceType,
        clinicId: updateClinicId,
        clinicName: updateClinic?.name,
        authorRole,
      },
    ];

    const previousVerification = caseData.verificationStatus ?? "unverified";
    const upgradedToClinicVerification =
      previousVerification !== "clinic" &&
      isAuthorizedClinic &&
      args.evidenceType === "clinic_photo" &&
      (args.images?.length ?? 0) > 0;

    await ctx.db.patch(args.caseId, {
      updates,
      lifecycleUpdatedAt: now,
      ...(upgradedToClinicVerification ? { verificationStatus: "clinic" as const } : {}),
    });

    if (upgradedToClinicVerification) {
      await ctx.db.insert("auditLogs", {
        actorId: user._id,
        entityType: "case",
        entityId: String(args.caseId),
        action: "case.verification_upgraded",
        details: `${previousVerification} -> clinic`,
        metadataJson: JSON.stringify({
          from: previousVerification,
          to: "clinic",
          source: "clinic_update",
          evidenceType: args.evidenceType,
          evidenceImageCount: args.images?.length ?? 0,
          clinicId: String(caseData.clinicId),
          updateId,
        }),
        createdAt: now,
      });
    }
    const completedDonations = await ctx.db
      .query("donations")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const donorIds = Array.from(new Set(completedDonations.map((d) => d.userId))).filter(
      (donorId) => donorId !== user._id,
    );


    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", caseData.userId))
      .take(200);

    const recipientIds: Id<"users">[] = [];
    const seenRecipients = new Set<string>();
    const pushUniqueRecipient = (recipientId: Id<"users">) => {
      const key = String(recipientId);
      if (seenRecipients.has(key)) return;
      seenRecipients.add(key);
      recipientIds.push(recipientId);
    };

    for (const donorId of donorIds) {
      pushUniqueRecipient(donorId);
    }

    for (const follow of followers) {
      pushUniqueRecipient(follow.followerId);
    }

    const finalRecipients = recipientIds.filter((recipientId) => recipientId !== user._id).slice(0, 200);

    const caseLocale = (caseData.language ?? "").trim().toLowerCase();
    const isBg = caseLocale.startsWith("bg");
    const title = isBg ? "Обновление по случая" : "Case update";
    const message = isBg ? `Ново обновление за ${caseData.title}` : `New update on ${caseData.title}`;
    for (const recipientId of finalRecipients) {
      await ctx.db.insert("notifications", {
        userId: recipientId,
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
    const isAdmin = user.role === "admin";

    const clinicForCase = caseData.clinicId ? await ctx.db.get(caseData.clinicId) : null;
    const isAuthorizedClinic =
      user.role === "clinic" && !!clinicForCase?.verified && clinicForCase.ownerId === user._id;

    if (!isOwner && !isAdmin && !isAuthorizedClinic) {
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



