import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { buildIdentity, createTestClient, seedCase, seedUser, type TestClient } from "./testHelpers";

const DAY_MS = 24 * 60 * 60 * 1000;

async function insertCompletedDonation(
  t: TestClient,
  args: {
    userId: Id<"users">;
    amount: number;
    createdAt: number;
    caseId?: Id<"cases">;
    donationKind?: "one_time" | "recurring";
  },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("donations", {
      userId: args.userId,
      caseId: args.caseId,
      amount: args.amount,
      currency: "EUR",
      status: "completed",
      anonymous: false,
      donationKind: args.donationKind,
      completedAt: args.createdAt,
      createdAt: args.createdAt,
    });
  });
}

describe("admin analytics metrics", () => {
  it("requires admin role for analytics queries", async () => {
    const t = createTestClient();
    const { clerkId } = await seedUser(t, { clerkId: "analytics_non_admin", role: "user" });
    const asUser = t.withIdentity(buildIdentity(clerkId));

    await expect(
      asUser.query(api.adminAnalytics.getCaseAnalytics, { days: 30 }),
    ).rejects.toThrow("Admin access required");
  });

  it("computes case analytics including funded timeline and city aggregates", async () => {
    const t = createTestClient();
    const { clerkId: adminClerkId } = await seedUser(t, { clerkId: "analytics_admin_cases", role: "admin" });
    const { userId: ownerId } = await seedUser(t, { clerkId: "analytics_case_owner" });
    const { userId: donorId } = await seedUser(t, { clerkId: "analytics_case_donor" });

    const base = Date.now() - 12 * DAY_MS;
    const caseA = await seedCase(t, ownerId, { title: "Case A", verificationStatus: "unverified", riskLevel: "low" });
    const caseB = await seedCase(t, ownerId, { title: "Case B", verificationStatus: "unverified", riskLevel: "low" });
    const caseC = await seedCase(t, ownerId, { title: "Case C", verificationStatus: "unverified", riskLevel: "low" });

    await t.run(async (ctx) => {
      await ctx.db.patch(caseA, {
        createdAt: base,
        location: { city: "Sofia", neighborhood: "Center" },
        fundraising: { goal: 100, current: 100, currency: "EUR" },
        status: "funded",
      });
      await ctx.db.patch(caseB, {
        createdAt: base + DAY_MS,
        location: { city: "Sofia", neighborhood: "Lozenets" },
        fundraising: { goal: 70, current: 70, currency: "EUR" },
        status: "closed",
        closedAt: base + 4 * DAY_MS,
      });
      await ctx.db.patch(caseC, {
        createdAt: base + 2 * DAY_MS,
        location: { city: "Varna", neighborhood: "Center" },
        fundraising: { goal: 80, current: 10, currency: "EUR" },
        status: "active",
      });
    });

    await insertCompletedDonation(t, {
      userId: donorId,
      caseId: caseA,
      amount: 60,
      createdAt: base + DAY_MS,
      donationKind: "one_time",
    });
    await insertCompletedDonation(t, {
      userId: donorId,
      caseId: caseA,
      amount: 40,
      createdAt: base + 2 * DAY_MS,
      donationKind: "one_time",
    });
    await insertCompletedDonation(t, {
      userId: donorId,
      caseId: caseB,
      amount: 70,
      createdAt: base + 3 * DAY_MS,
      donationKind: "one_time",
    });

    const asAdmin = t.withIdentity(buildIdentity(adminClerkId));
    const analytics = await asAdmin.query(api.adminAnalytics.getCaseAnalytics, { days: 30 });

    expect(analytics.totals.created).toBe(3);
    expect(analytics.totals.funded).toBe(2);
    expect(analytics.totals.closed).toBe(1);
    expect(analytics.totals.avgTimeToFundedHours).toBe(48);

    const timelineCreated = analytics.timeline.reduce((sum, row) => sum + row.created, 0);
    const timelineFunded = analytics.timeline.reduce((sum, row) => sum + row.funded, 0);
    const timelineClosed = analytics.timeline.reduce((sum, row) => sum + row.closed, 0);
    expect(timelineCreated).toBe(3);
    expect(timelineFunded).toBe(2);
    expect(timelineClosed).toBe(1);

    const sofia = analytics.byCity.find((city) => city.city === "Sofia");
    const varna = analytics.byCity.find((city) => city.city === "Varna");
    expect(sofia?.created).toBe(2);
    expect(sofia?.funded).toBe(2);
    expect(varna?.created).toBe(1);
    expect(varna?.funded).toBe(0);
  });

  it("computes donation totals, recurring split, and donor cohorts", async () => {
    const t = createTestClient();
    const { clerkId: adminClerkId } = await seedUser(t, { clerkId: "analytics_admin_donations", role: "admin" });
    const { userId: donorOne } = await seedUser(t, { clerkId: "analytics_donor_one" });
    const { userId: donorRecurring } = await seedUser(t, { clerkId: "analytics_donor_recurring" });
    const { userId: donorOld } = await seedUser(t, { clerkId: "analytics_donor_old" });
    const { userId: donorNew } = await seedUser(t, { clerkId: "analytics_donor_new" });
    const { userId: subscriptionOnly } = await seedUser(t, { clerkId: "analytics_subscriber_only" });

    const now = Date.now();
    await insertCompletedDonation(t, {
      userId: donorOne,
      amount: 20,
      createdAt: now - 10 * DAY_MS,
      donationKind: "one_time",
    });
    await insertCompletedDonation(t, {
      userId: donorRecurring,
      amount: 15,
      createdAt: now - 8 * DAY_MS,
      donationKind: "recurring",
    });
    await insertCompletedDonation(t, {
      userId: donorRecurring,
      amount: 15,
      createdAt: now - 3 * DAY_MS,
      donationKind: "recurring",
    });
    await insertCompletedDonation(t, {
      userId: donorOld,
      amount: 40,
      createdAt: now - 40 * DAY_MS,
      donationKind: "one_time",
    });
    await insertCompletedDonation(t, {
      userId: donorNew,
      amount: 50,
      createdAt: now - 2 * DAY_MS,
      donationKind: "one_time",
    });

    await t.run(async (ctx) => {
      await ctx.db.insert("subscriptions", {
        userId: subscriptionOnly,
        targetType: "user",
        targetId: String(subscriptionOnly),
        status: "active",
        amount: 10,
        currency: "EUR",
        interval: "month",
        createdAt: now - DAY_MS,
      });
    });

    const asAdmin = t.withIdentity(buildIdentity(adminClerkId));
    const analytics = await asAdmin.query(api.adminAnalytics.getDonationAnalytics, { days: 30 });

    expect(analytics.totals.raised).toBe(100);
    expect(analytics.totals.donationCount).toBe(4);
    expect(analytics.totals.averageDonation).toBe(25);
    expect(analytics.totals.uniqueDonors).toBe(4);
    expect(analytics.totals.currency).toBe("EUR");
    expect(analytics.recurringVsOneTime.recurringAmount).toBe(30);
    expect(analytics.recurringVsOneTime.recurringCount).toBe(2);
    expect(analytics.recurringVsOneTime.oneTimeAmount).toBe(70);
    expect(analytics.recurringVsOneTime.oneTimeCount).toBe(2);
    expect(analytics.donorCohorts.oneTimeDonors).toBe(3);
    expect(analytics.donorCohorts.repeatDonors).toBe(1);
    expect(analytics.donorCohorts.powerDonors).toBe(0);
    expect(analytics.donorCohorts.newDonorsInWindow).toBe(3);
    expect(analytics.donorCohorts.returningDonorsInWindow).toBe(0);
    expect(analytics.donorCohorts.recurringSupporters).toBe(2);
  });

  it("computes verification distribution and average promotion timing", async () => {
    const t = createTestClient();
    const { clerkId: adminClerkId } = await seedUser(t, { clerkId: "analytics_admin_verification", role: "admin" });
    const { userId: ownerId } = await seedUser(t, { clerkId: "analytics_verification_owner" });
    const { userId: actorId } = await seedUser(t, { clerkId: "analytics_verification_actor" });

    const base = Date.now() - 12 * DAY_MS;
    const caseCommunity = await seedCase(t, ownerId, { title: "Community case", verificationStatus: "community", riskLevel: "low" });
    const caseClinic = await seedCase(t, ownerId, { title: "Clinic case", verificationStatus: "clinic", riskLevel: "low" });
    const caseUnverified = await seedCase(t, ownerId, { title: "Unverified case", verificationStatus: "unverified", riskLevel: "low" });

    await t.run(async (ctx) => {
      await ctx.db.patch(caseCommunity, { createdAt: base });
      await ctx.db.patch(caseClinic, { createdAt: base + DAY_MS });
      await ctx.db.patch(caseUnverified, { createdAt: base + 2 * DAY_MS });

      await ctx.db.insert("auditLogs", {
        actorId,
        entityType: "case",
        entityId: String(caseCommunity),
        action: "case.verification_upgraded",
        details: "unverified -> community",
        createdAt: base + 2 * DAY_MS,
      });
      await ctx.db.insert("auditLogs", {
        actorId,
        entityType: "case",
        entityId: String(caseClinic),
        action: "case.verification_set",
        details: "unverified -> community",
        createdAt: base + 2 * DAY_MS,
      });
      await ctx.db.insert("auditLogs", {
        actorId,
        entityType: "case",
        entityId: String(caseClinic),
        action: "case.verification_upgraded",
        details: "community -> clinic",
        createdAt: base + 4 * DAY_MS,
      });
    });

    const asAdmin = t.withIdentity(buildIdentity(adminClerkId));
    const analytics = await asAdmin.query(api.adminAnalytics.getVerificationAnalytics, { days: 30 });

    expect(analytics.totals.byStatus.unverified).toBe(1);
    expect(analytics.totals.byStatus.community).toBe(1);
    expect(analytics.totals.byStatus.clinic).toBe(1);
    expect(analytics.totals.verifiedRate).toBe(66.67);
    expect(analytics.totals.avgHoursToCommunity).toBe(36);
    expect(analytics.totals.avgHoursToClinic).toBe(72);
    expect(analytics.totals.transitionsInWindow).toBe(3);
  });

  it("computes moderation status, resolution time, and top reasons", async () => {
    const t = createTestClient();
    const { clerkId: adminClerkId } = await seedUser(t, { clerkId: "analytics_admin_moderation", role: "admin" });
    const { userId: ownerId } = await seedUser(t, { clerkId: "analytics_moderation_owner" });
    const caseId = await seedCase(t, ownerId, { title: "Moderation case", verificationStatus: "unverified", riskLevel: "low" });

    const base = Date.now() - 8 * DAY_MS;
    await t.run(async (ctx) => {
      await ctx.db.insert("reports", {
        caseId,
        reason: "suspected_scam",
        status: "open",
        createdAt: base + DAY_MS,
      });
      await ctx.db.insert("reports", {
        caseId,
        reason: "duplicate_case",
        status: "closed",
        createdAt: base + DAY_MS,
        reviewedAt: base + 2 * DAY_MS,
      });
      await ctx.db.insert("reports", {
        caseId,
        reason: "duplicate_case",
        status: "closed",
        createdAt: base + 2 * DAY_MS,
        reviewedAt: base + 5 * DAY_MS,
      });
      await ctx.db.insert("reports", {
        caseId,
        reason: "animal_welfare",
        status: "reviewing",
        createdAt: base + 3 * DAY_MS,
      });
    });

    const asAdmin = t.withIdentity(buildIdentity(adminClerkId));
    const analytics = await asAdmin.query(api.adminAnalytics.getModerationAnalytics, { days: 30 });

    expect(analytics.totals.totalReports).toBe(4);
    expect(analytics.totals.byStatus.open).toBe(1);
    expect(analytics.totals.byStatus.reviewing).toBe(1);
    expect(analytics.totals.byStatus.closed).toBe(2);
    expect(analytics.totals.avgResolutionHours).toBe(48);
    expect(analytics.totals.resolutionRate).toBe(50);
    expect(analytics.topReasons[0]).toMatchObject({ reason: "duplicate_case", count: 2 });

    const createdInTimeline = analytics.timeline.reduce((sum, row) => sum + row.created, 0);
    const resolvedInTimeline = analytics.timeline.reduce((sum, row) => sum + row.resolved, 0);
    expect(createdInTimeline).toBe(4);
    expect(resolvedInTimeline).toBe(2);
  });
});
