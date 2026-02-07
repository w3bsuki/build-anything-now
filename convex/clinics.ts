import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

// List all clinics with optional city filter
export const list = query({
    args: {
        city: v.optional(v.string()),
        is24h: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let clinics = await ctx.db.query("clinics").collect();

        if (args.city) {
            clinics = clinics.filter(c => c.city.toLowerCase() === args.city!.toLowerCase());
        }

        if (args.is24h !== undefined) {
            clinics = clinics.filter(c => c.is24h === args.is24h);
        }

        return clinics;
    },
});

// Get a single clinic by ID
export const get = query({
    args: { id: v.id("clinics") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Search clinics for claim flow (used during onboarding)
export const searchForClaim = query({
    args: { searchText: v.string() },
    handler: async (ctx, args) => {
        if (args.searchText.length < 2) return [];

        const searchLower = args.searchText.toLowerCase();

        // Get all clinics and filter (small dataset for Bulgaria)
        const clinics = await ctx.db.query("clinics").collect();

        return clinics
            .filter(c =>
                c.name.toLowerCase().includes(searchLower) ||
                c.city.toLowerCase().includes(searchLower) ||
                c.address.toLowerCase().includes(searchLower)
            )
            .slice(0, 10)
            .map(c => ({
                ...c,
                isClaimed: !!c.ownerId,
            }));
    },
});

// Submit a claim for a clinic
export const submitClaim = mutation({
    args: {
        clinicId: v.id("clinics"),
        claimerRole: v.string(),
        claimerEmail: v.string(),
        claimerPhone: v.optional(v.string()),
        additionalInfo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Check if clinic exists and isn't already claimed
        const clinic = await ctx.db.get(args.clinicId);
        if (!clinic) throw new Error("Clinic not found");
        if (clinic.ownerId) throw new Error("Clinic already claimed");

        // Check for existing pending claim by this user for this clinic
        const existingClaim = await ctx.db
            .query("clinicClaims")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.and(
                q.eq(q.field("clinicId"), args.clinicId),
                q.eq(q.field("status"), "pending")
            ))
            .first();

        if (existingClaim) throw new Error("You already have a pending claim for this clinic");

        // Create claim
        await ctx.db.insert("clinicClaims", {
            clinicId: args.clinicId,
            userId: user._id,
            status: "pending",
            claimerRole: args.claimerRole,
            claimerEmail: args.claimerEmail,
            claimerPhone: args.claimerPhone,
            additionalInfo: args.additionalInfo,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

// Get user's clinic claims
export const getMyClaims = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const claims = await ctx.db
            .query("clinicClaims")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Enrich with clinic details
        const enrichedClaims = await Promise.all(
            claims.map(async (claim) => {
                const clinic = await ctx.db.get(claim.clinicId);
                return {
                    ...claim,
                    clinic: clinic ? { name: clinic.name, city: clinic.city } : null,
                };
            })
        );

        return enrichedClaims;
    },
});

// Admin queue for clinic claims
export const listPendingClaims = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const claims = await ctx.db
            .query("clinicClaims")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .order("desc")
            .collect();

        return Promise.all(
            claims.map(async (claim) => {
                const clinic = await ctx.db.get(claim.clinicId);
                const claimant = await ctx.db.get(claim.userId);

                return {
                    ...claim,
                    clinic: clinic
                        ? {
                            id: clinic._id,
                            name: clinic.name,
                            city: clinic.city,
                            address: clinic.address,
                            verified: clinic.verified,
                            ownerId: clinic.ownerId,
                        }
                        : null,
                    claimant: claimant
                        ? {
                            id: claimant._id,
                            name: claimant.displayName || claimant.name,
                            email: claimant.email,
                            role: claimant.role,
                        }
                        : null,
                };
            })
        );
    },
});

// Admin claim review action
export const reviewClaim = mutation({
    args: {
        claimId: v.id("clinicClaims"),
        action: v.union(v.literal("approve"), v.literal("reject")),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx);
        const claim = await ctx.db.get(args.claimId);
        if (!claim) throw new Error("Claim not found");
        if (claim.status !== "pending") throw new Error("Only pending claims can be reviewed");

        const clinic = await ctx.db.get(claim.clinicId);
        if (!clinic) throw new Error("Clinic not found");

        const now = Date.now();

        if (args.action === "approve") {
            if (clinic.ownerId && clinic.ownerId !== claim.userId) {
                throw new Error("Clinic already has a different owner");
            }

            await ctx.db.patch(claim.clinicId, {
                ownerId: claim.userId,
                claimedAt: now,
                verified: true,
            });

            const claimant = await ctx.db.get(claim.userId);
            if (claimant && claimant.role !== "admin" && claimant.role !== "clinic") {
                await ctx.db.patch(claim.userId, {
                    role: "clinic",
                });
            }
        }

        await ctx.db.patch(args.claimId, {
            status: args.action === "approve" ? "approved" : "rejected",
            reviewedBy: admin._id,
            reviewedAt: now,
            rejectionReason: args.action === "reject" ? args.rejectionReason?.trim() || "Not eligible" : undefined,
        });

        await ctx.db.insert("auditLogs", {
            actorId: admin._id,
            entityType: "clinic_claim",
            entityId: String(args.claimId),
            action: args.action === "approve" ? "clinic_claim.approved" : "clinic_claim.rejected",
            details: `clinicId=${String(claim.clinicId)}`,
            metadataJson: JSON.stringify({
                claimantId: String(claim.userId),
                rejectionReason: args.action === "reject" ? args.rejectionReason?.trim() || null : null,
            }),
            createdAt: now,
        });

        return { ok: true };
    },
});

// Seed clinics from mock data (internal only - not callable from client)
export const seed = internalMutation({
    args: {
        clinics: v.array(v.object({
            name: v.string(),
            city: v.string(),
            address: v.string(),
            phone: v.string(),
            is24h: v.boolean(),
            specializations: v.array(v.string()),
            verified: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        for (const clinic of args.clinics) {
            await ctx.db.insert("clinics", clinic);
        }
        return { inserted: args.clinics.length };
    },
});
