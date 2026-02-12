import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

type VerificationStatus = "unverified" | "community" | "clinic";
type DonationKind = "one_time" | "recurring";
type ReportStatus = "open" | "reviewing" | "closed";
type ReportReason = "suspected_scam" | "duplicate_case" | "incorrect_information" | "animal_welfare" | "other";

const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeDays(input?: number): number {
  if (typeof input !== "number" || Number.isNaN(input)) return 30;
  const rounded = Math.floor(input);
  return Math.min(Math.max(rounded, 7), 365);
}

function startOfUtcDay(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getDateKey(timestamp: number): string {
  return new Date(startOfUtcDay(timestamp)).toISOString().slice(0, 10);
}

function buildTimelineKeys(days: number, now: number): string[] {
  const keys: string[] = [];
  const todayStart = startOfUtcDay(now);
  for (let i = days - 1; i >= 0; i -= 1) {
    keys.push(new Date(todayStart - i * DAY_MS).toISOString().slice(0, 10));
  }
  return keys;
}

function createDateMap<T>(
  keys: string[],
  createValue: () => T,
): Record<string, T> {
  const map: Record<string, T> = {};
  for (const key of keys) {
    map[key] = createValue();
  }
  return map;
}

function hoursBetween(start: number, end: number): number {
  return (end - start) / (60 * 60 * 1000);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function pickPrimaryCurrency(currencyCounts: Map<string, number>): string {
  let selected = "EUR";
  let selectedCount = 0;
  for (const [currency, count] of currencyCounts.entries()) {
    if (count > selectedCount) {
      selected = currency;
      selectedCount = count;
    }
  }
  return selected;
}

function parseVerificationTarget(details?: string): VerificationStatus | null {
  if (!details) return null;
  const rightSide = details.split("->")[1]?.trim().toLowerCase();
  if (rightSide === "unverified" || rightSide === "community" || rightSide === "clinic") {
    return rightSide;
  }
  return null;
}

function readDonationTimestamp(donation: { completedAt?: number; createdAt: number }): number {
  return donation.completedAt ?? donation.createdAt;
}

function deriveCaseFundedAt(
  goalAmount: number,
  donations: Array<{ amount: number; completedAt?: number; createdAt: number }>,
): number | null {
  if (!Number.isFinite(goalAmount) || goalAmount <= 0 || donations.length === 0) return null;

  let cumulative = 0;
  const sorted = [...donations].sort((a, b) => readDonationTimestamp(a) - readDonationTimestamp(b));
  for (const donation of sorted) {
    cumulative += donation.amount;
    if (cumulative + 1e-6 >= goalAmount) {
      return readDonationTimestamp(donation);
    }
  }

  return null;
}

async function getCompletedDonationsByCase(ctx: QueryCtx) {
  const completed = await ctx.db
    .query("donations")
    .withIndex("by_status", (q) => q.eq("status", "completed"))
    .collect();

  const byCase = new Map<string, typeof completed>();
  for (const donation of completed) {
    if (!donation.caseId) continue;
    const key = String(donation.caseId);
    const list = byCase.get(key);
    if (list) {
      list.push(donation);
    } else {
      byCase.set(key, [donation]);
    }
  }

  return { completed, byCase };
}

function toCityName(city?: string | null): string {
  const normalized = city?.trim();
  return normalized && normalized.length > 0 ? normalized : "unknown";
}

export const getCaseAnalytics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const days = normalizeDays(args.days);
    const startTimestamp = startOfUtcDay(now) - (days - 1) * DAY_MS;
    const timelineKeys = buildTimelineKeys(days, now);
    const timelineMap = createDateMap(timelineKeys, () => ({ created: 0, funded: 0, closed: 0 }));

    const cases = await ctx.db.query("cases").collect();
    const { byCase: completedDonationsByCase } = await getCompletedDonationsByCase(ctx);

    const fundedDurationsHours: number[] = [];
    const cityMap = new Map<string, { created: number; funded: number; closed: number; totalRaised: number; caseCount: number }>();

    let totalCreated = 0;
    let totalFunded = 0;
    let totalClosed = 0;

    for (const caseDoc of cases) {
      const createdAt = caseDoc.createdAt;
      const city = toCityName(caseDoc.location.city);
      const cityStats = cityMap.get(city) ?? { created: 0, funded: 0, closed: 0, totalRaised: 0, caseCount: 0 };
      cityStats.caseCount += 1;
      cityStats.totalRaised += caseDoc.fundraising.current;

      totalCreated += 1;
      cityStats.created += 1;

      const createdKey = getDateKey(createdAt);
      if (createdAt >= startTimestamp && timelineMap[createdKey]) {
        timelineMap[createdKey].created += 1;
      }

      const fundedAt = deriveCaseFundedAt(
        caseDoc.fundraising.goal,
        completedDonationsByCase.get(String(caseDoc._id)) ?? [],
      );
      if (fundedAt !== null) {
        totalFunded += 1;
        cityStats.funded += 1;
        const durationHours = hoursBetween(caseDoc.createdAt, fundedAt);
        if (Number.isFinite(durationHours) && durationHours >= 0) {
          fundedDurationsHours.push(durationHours);
        }

        const fundedKey = getDateKey(fundedAt);
        if (fundedAt >= startTimestamp && timelineMap[fundedKey]) {
          timelineMap[fundedKey].funded += 1;
        }
      }

      if (caseDoc.status === "closed" || caseDoc.closedAt) {
        totalClosed += 1;
        cityStats.closed += 1;

        const closedAt = caseDoc.closedAt ?? caseDoc.lifecycleUpdatedAt ?? caseDoc.createdAt;
        const closedKey = getDateKey(closedAt);
        if (closedAt >= startTimestamp && timelineMap[closedKey]) {
          timelineMap[closedKey].closed += 1;
        }
      }

      cityMap.set(city, cityStats);
    }

    const timeline = timelineKeys.map((date) => ({
      date,
      created: timelineMap[date].created,
      funded: timelineMap[date].funded,
      closed: timelineMap[date].closed,
    }));

    const byCity = Array.from(cityMap.entries())
      .map(([city, stats]) => ({
        city,
        ...stats,
      }))
      .sort((a, b) => b.created - a.created);

    const avgTimeToFundedHours = average(fundedDurationsHours);

    return {
      windowDays: days,
      totals: {
        created: totalCreated,
        funded: totalFunded,
        closed: totalClosed,
        avgTimeToFundedHours,
      },
      timeline,
      byCity,
    };
  },
});

export const getDonationAnalytics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const days = normalizeDays(args.days);
    const startTimestamp = startOfUtcDay(now) - (days - 1) * DAY_MS;
    const timelineKeys = buildTimelineKeys(days, now);
    const timelineMap = createDateMap(timelineKeys, () => ({ amount: 0, count: 0 }));

    const completedDonations = await ctx.db
      .query("donations")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();

    const donorStats = new Map<string, { count: number; firstDonationAt: number; recurringCount: number }>();
    const donorIdsInWindow = new Set<string>();
    const recurringSupporterIds = new Set<string>();
    const currencyCounts = new Map<string, number>();

    let totalRaisedAllTime = 0;
    let totalRaisedPeriod = 0;
    let recurringAmountPeriod = 0;
    let oneTimeAmountPeriod = 0;
    let recurringCountPeriod = 0;
    let oneTimeCountPeriod = 0;
    let completedCountPeriod = 0;

    for (const donation of completedDonations) {
      totalRaisedAllTime += donation.amount;

      const timestamp = readDonationTimestamp(donation);
      const donorKey = String(donation.userId);
      const donationKind: DonationKind = donation.donationKind === "recurring" ? "recurring" : "one_time";
      const donationCurrency = donation.currency?.trim().toUpperCase() || "EUR";
      currencyCounts.set(donationCurrency, (currencyCounts.get(donationCurrency) ?? 0) + 1);

      const currentDonor = donorStats.get(donorKey);
      if (currentDonor) {
        currentDonor.count += 1;
        currentDonor.firstDonationAt = Math.min(currentDonor.firstDonationAt, timestamp);
        if (donationKind === "recurring") {
          currentDonor.recurringCount += 1;
        }
      } else {
        donorStats.set(donorKey, {
          count: 1,
          firstDonationAt: timestamp,
          recurringCount: donationKind === "recurring" ? 1 : 0,
        });
      }

      if (donationKind === "recurring") {
        recurringSupporterIds.add(donorKey);
      }

      if (timestamp < startTimestamp) continue;

      donorIdsInWindow.add(donorKey);
      completedCountPeriod += 1;
      totalRaisedPeriod += donation.amount;

      if (donationKind === "recurring") {
        recurringCountPeriod += 1;
        recurringAmountPeriod += donation.amount;
      } else {
        oneTimeCountPeriod += 1;
        oneTimeAmountPeriod += donation.amount;
      }

      const dateKey = getDateKey(timestamp);
      if (timelineMap[dateKey]) {
        timelineMap[dateKey].count += 1;
        timelineMap[dateKey].amount = Number((timelineMap[dateKey].amount + donation.amount).toFixed(2));
      }
    }

    for (const subscription of subscriptions) {
      if (subscription.status === "active" || subscription.status === "past_due") {
        recurringSupporterIds.add(String(subscription.userId));
      }
    }

    const primaryCurrency = pickPrimaryCurrency(currencyCounts);

    let oneTimeDonors = 0;
    let repeatDonors = 0;
    let powerDonors = 0;
    let newDonorsInWindow = 0;
    let returningDonorsInWindow = 0;

    for (const [donorKey, donor] of donorStats.entries()) {
      if (donor.count === 1) oneTimeDonors += 1;
      if (donor.count >= 2) repeatDonors += 1;
      if (donor.count >= 5) powerDonors += 1;
      if (donorIdsInWindow.has(donorKey)) {
        if (donor.firstDonationAt >= startTimestamp) {
          newDonorsInWindow += 1;
        } else {
          returningDonorsInWindow += 1;
        }
      }
    }

    const timeline = timelineKeys.map((date) => ({
      date,
      amount: Number(timelineMap[date].amount.toFixed(2)),
      count: timelineMap[date].count,
    }));

    return {
      windowDays: days,
      totals: {
        raised: Number(totalRaisedPeriod.toFixed(2)),
        raisedAllTime: Number(totalRaisedAllTime.toFixed(2)),
        donationCount: completedCountPeriod,
        averageDonation: completedCountPeriod > 0 ? Number((totalRaisedPeriod / completedCountPeriod).toFixed(2)) : 0,
        uniqueDonors: donorStats.size,
        currency: primaryCurrency,
      },
      recurringVsOneTime: {
        recurringAmount: Number(recurringAmountPeriod.toFixed(2)),
        recurringCount: recurringCountPeriod,
        oneTimeAmount: Number(oneTimeAmountPeriod.toFixed(2)),
        oneTimeCount: oneTimeCountPeriod,
      },
      donorCohorts: {
        oneTimeDonors,
        repeatDonors,
        powerDonors,
        newDonorsInWindow,
        returningDonorsInWindow,
        recurringSupporters: recurringSupporterIds.size,
      },
      timeline,
    };
  },
});

export const getVerificationAnalytics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const days = normalizeDays(args.days);
    const now = Date.now();
    const startTimestamp = startOfUtcDay(now) - (days - 1) * DAY_MS;

    const cases = await ctx.db.query("cases").collect();
    const verificationLogs = (
      await ctx.db
        .query("auditLogs")
        .withIndex("by_entity", (q) => q.eq("entityType", "case"))
        .collect()
    ).filter((log) => log.action === "case.verification_set" || log.action === "case.verification_upgraded");

    const firstCommunityAt = new Map<string, number>();
    const firstClinicAt = new Map<string, number>();

    for (const log of verificationLogs) {
      const target = parseVerificationTarget(log.details);
      if (!target) continue;

      const caseKey = log.entityId;
      if (target === "community") {
        const previous = firstCommunityAt.get(caseKey);
        if (previous === undefined || log.createdAt < previous) {
          firstCommunityAt.set(caseKey, log.createdAt);
        }
      }
      if (target === "clinic") {
        const previous = firstClinicAt.get(caseKey);
        if (previous === undefined || log.createdAt < previous) {
          firstClinicAt.set(caseKey, log.createdAt);
        }
      }
    }

    const byStatus: Record<VerificationStatus, number> = {
      unverified: 0,
      community: 0,
      clinic: 0,
    };

    const communityDurationsHours: number[] = [];
    const clinicDurationsHours: number[] = [];

    for (const caseDoc of cases) {
      const status = (caseDoc.verificationStatus ?? "unverified") as VerificationStatus;
      byStatus[status] += 1;

      const caseKey = String(caseDoc._id);
      const communityAt = firstCommunityAt.get(caseKey);
      const clinicAt = firstClinicAt.get(caseKey);

      if (communityAt && communityAt >= caseDoc.createdAt) {
        communityDurationsHours.push(hoursBetween(caseDoc.createdAt, communityAt));
      }
      if (clinicAt && clinicAt >= caseDoc.createdAt) {
        clinicDurationsHours.push(hoursBetween(caseDoc.createdAt, clinicAt));
      }
    }

    const transitionsInWindow = verificationLogs.filter((log) => log.createdAt >= startTimestamp).length;

    return {
      windowDays: days,
      totals: {
        totalCases: cases.length,
        byStatus,
        verifiedRate: cases.length > 0 ? Number((((byStatus.community + byStatus.clinic) / cases.length) * 100).toFixed(2)) : 0,
        transitionsInWindow,
        avgHoursToCommunity: average(communityDurationsHours),
        avgHoursToClinic: average(clinicDurationsHours),
      },
    };
  },
});

export const getModerationAnalytics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const days = normalizeDays(args.days);
    const startTimestamp = startOfUtcDay(now) - (days - 1) * DAY_MS;
    const timelineKeys = buildTimelineKeys(days, now);
    const timelineMap = createDateMap(timelineKeys, () => ({ created: 0, resolved: 0 }));

    const reports = await ctx.db.query("reports").collect();

    const statusCounts: Record<ReportStatus, number> = {
      open: 0,
      reviewing: 0,
      closed: 0,
    };
    const reasonCounts: Record<ReportReason, number> = {
      suspected_scam: 0,
      duplicate_case: 0,
      incorrect_information: 0,
      animal_welfare: 0,
      other: 0,
    };
    const resolutionHours: number[] = [];

    for (const report of reports) {
      statusCounts[report.status as ReportStatus] += 1;
      reasonCounts[report.reason as ReportReason] += 1;

      if (report.createdAt >= startTimestamp) {
        const createdKey = getDateKey(report.createdAt);
        if (timelineMap[createdKey]) {
          timelineMap[createdKey].created += 1;
        }
      }

      if (report.status === "closed" && report.reviewedAt && report.reviewedAt >= report.createdAt) {
        resolutionHours.push(hoursBetween(report.createdAt, report.reviewedAt));
        if (report.reviewedAt >= startTimestamp) {
          const resolvedKey = getDateKey(report.reviewedAt);
          if (timelineMap[resolvedKey]) {
            timelineMap[resolvedKey].resolved += 1;
          }
        }
      }
    }

    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason: reason as ReportReason, count }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);

    const timeline = timelineKeys.map((date) => ({
      date,
      created: timelineMap[date].created,
      resolved: timelineMap[date].resolved,
    }));

    const totalReports = reports.length;
    const closedReports = statusCounts.closed;
    const resolutionRate = totalReports > 0 ? Number(((closedReports / totalReports) * 100).toFixed(2)) : 0;

    return {
      windowDays: days,
      totals: {
        totalReports,
        byStatus: statusCounts,
        resolutionRate,
        avgResolutionHours: average(resolutionHours),
      },
      topReasons,
      timeline,
    };
  },
});
