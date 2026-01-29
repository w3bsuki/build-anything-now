import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to check if a case has pending (open or reviewing) reports
// Only returns data for admin/clinic roles (ops visibility)
export const getCasePendingReportStatus = query({
  args: {
    caseId: v.id("cases"),
  },
  handler: async (ctx, args) => {
    // Check if user is admin/clinic (ops role)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // Only admin and clinic roles can see report status
    if (!user || (user.role !== "admin" && user.role !== "clinic")) {
      return null;
    }

    // Count pending reports for this case
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
      status: pendingReports.some(r => r.status === "reviewing") ? "reviewing" : "open",
    };
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
      v.literal("other"),
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

    return await ctx.db.insert("reports", {
      caseId: args.caseId,
      reason: args.reason,
      details: details || undefined,
      reporterId,
      reporterClerkId,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

