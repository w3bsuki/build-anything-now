import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/auth";

// Query to check if a case has pending (open or reviewing) reports
// Only returns data for admin/clinic roles (ops visibility)
export const getCasePendingReportStatus = query({
  args: {
    caseId: v.id("cases"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (user.role !== "admin" && user.role !== "clinic")) {
      return null;
    }

    const pendingReports = await ctx.db
      .query("reports")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "open"),
          q.eq(q.field("status"), "reviewing")
        )
      )
      .collect();

    if (pendingReports.length === 0) {
      return null;
    }

    return {
      hasPendingReports: true,
      count: pendingReports.length,
      status: pendingReports.some((r) => r.status === "reviewing") ? "reviewing" : "open",
    };
  },
});

// Admin moderation queue
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    const reviewing = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "reviewing"))
      .collect();

    const queue = [...reports, ...reviewing].sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(
      queue.map(async (report) => {
        const caseDoc = await ctx.db.get(report.caseId);
        const reporter = report.reporterId ? await ctx.db.get(report.reporterId) : null;
        const reviewedBy = report.reviewedBy ? await ctx.db.get(report.reviewedBy) : null;

        return {
          ...report,
          case: caseDoc
            ? {
              id: caseDoc._id,
              title: caseDoc.title,
              status: caseDoc.status,
              verificationStatus: caseDoc.verificationStatus ?? "unverified",
              lifecycleStage: caseDoc.lifecycleStage ?? "active_treatment",
              creatorId: caseDoc.userId,
            }
            : null,
          reporter: reporter
            ? {
              id: reporter._id,
              name: reporter.displayName || reporter.name,
              role: reporter.role,
            }
            : null,
          reviewedByUser: reviewedBy
            ? {
              id: reviewedBy._id,
              name: reviewedBy.displayName || reviewedBy.name,
            }
            : null,
        };
      })
    );
  },
});

export const setReviewing = mutation({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    await ctx.db.patch(args.reportId, {
      status: "reviewing",
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      entityType: "report",
      entityId: String(args.reportId),
      action: "report.set_reviewing",
      details: `caseId=${String(report.caseId)}`,
      createdAt: Date.now(),
    });
  },
});

export const resolve = mutation({
  args: {
    reportId: v.id("reports"),
    action: v.union(v.literal("hide_case"), v.literal("warn_user"), v.literal("dismiss"), v.literal("no_action")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    const notes = args.notes?.trim();

    if (args.action === "hide_case") {
      const caseDoc = await ctx.db.get(report.caseId);
      if (caseDoc) {
        await ctx.db.patch(report.caseId, {
          status: "closed",
          lifecycleStage: "closed_other",
          closedReason: "other",
          closedAt: Date.now(),
          closedNotes: notes,
          lifecycleUpdatedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.reportId, {
      status: "closed",
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
      resolutionAction: args.action,
      resolutionNotes: notes,
    });

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      entityType: "report",
      entityId: String(args.reportId),
      action: "report.resolved",
      details: `action=${args.action}`,
      metadataJson: JSON.stringify({ notes: notes ?? "" }),
      createdAt: Date.now(),
    });
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    reason: v.union(
      v.literal("suspected_scam"),
      v.literal("duplicate_case"),
      v.literal("incorrect_information"),
      v.literal("animal_welfare"),
      v.literal("other")
    ),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) {
      throw new Error("Case not found");
    }

    const details = args.details?.trim();
    if (details && details.length > 2000) {
      throw new Error("Details are too long (max 2000 characters)");
    }

    const identity = await ctx.auth.getUserIdentity();
    let reporterId: typeof caseDoc.userId | undefined;
    let reporterClerkId: string | undefined;

    if (identity) {
      reporterClerkId = identity.subject;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      reporterId = user?._id;
    }

    const createdId = await ctx.db.insert("reports", {
      caseId: args.caseId,
      reason: args.reason,
      details: details || undefined,
      reporterId,
      reporterClerkId,
      status: "open",
      createdAt: Date.now(),
    });

    const actor = await requireUser(ctx).catch(() => null);
    await ctx.db.insert("auditLogs", {
      actorId: actor?._id,
      entityType: "report",
      entityId: String(createdId),
      action: "report.created",
      details: `reason=${args.reason}`,
      createdAt: Date.now(),
    });

    return createdId;
  },
});
