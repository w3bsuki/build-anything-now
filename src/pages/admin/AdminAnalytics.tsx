import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "convex/react";
import { BarChart3, BadgeCheck, CircleDollarSign, ShieldAlert } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { PageShell } from "@/components/layout/PageShell";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatsGrid } from "@/components/common/StatsGrid";
import { cn } from "@/lib/utils";

const dayOptions = [30, 90, 180] as const;

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: value >= 1000 ? 0 : 2,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatHours(value: number): string {
  if (value <= 0) return "0h";
  if (value >= 24) {
    return `${(value / 24).toFixed(1)}d`;
  }
  return `${value.toFixed(1)}h`;
}

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [days, setDays] = useState<(typeof dayOptions)[number]>(30);

  const me = useQuery(api.users.me);
  const caseAnalytics = useQuery(api.adminAnalytics.getCaseAnalytics, me?.role === "admin" ? { days } : "skip");
  const donationAnalytics = useQuery(api.adminAnalytics.getDonationAnalytics, me?.role === "admin" ? { days } : "skip");
  const verificationAnalytics = useQuery(
    api.adminAnalytics.getVerificationAnalytics,
    me?.role === "admin" ? { days } : "skip",
  );
  const moderationAnalytics = useQuery(api.adminAnalytics.getModerationAnalytics, me?.role === "admin" ? { days } : "skip");

  const isLoading =
    caseAnalytics === undefined ||
    donationAnalytics === undefined ||
    verificationAnalytics === undefined ||
    moderationAnalytics === undefined;

  const caseStatsItems = useMemo(
    () => [
      {
        id: "case-created",
        label: t("admin.analytics.cases.created", "Created"),
        value: caseAnalytics ? formatNumber(caseAnalytics.totals.created) : "—",
        icon: <BarChart3 className="h-4 w-4" />,
        tone: "primary" as const,
      },
      {
        id: "case-funded",
        label: t("admin.analytics.cases.funded", "Funded"),
        value: caseAnalytics ? formatNumber(caseAnalytics.totals.funded) : "—",
        icon: <CircleDollarSign className="h-4 w-4" />,
        tone: "success" as const,
      },
      {
        id: "case-closed",
        label: t("admin.analytics.cases.closed", "Closed"),
        value: caseAnalytics ? formatNumber(caseAnalytics.totals.closed) : "—",
        icon: <ShieldAlert className="h-4 w-4" />,
        tone: "warning" as const,
      },
      {
        id: "case-avg-funded",
        label: t("admin.analytics.cases.avgTimeToFunded", "Avg time to funded"),
        value: caseAnalytics ? formatHours(caseAnalytics.totals.avgTimeToFundedHours) : "—",
        icon: <BadgeCheck className="h-4 w-4" />,
        tone: "accent" as const,
      },
    ],
    [caseAnalytics, t],
  );

  const donationStatsItems = useMemo(
    () => [
      {
        id: "donation-raised",
        label: t("admin.analytics.donations.totalRaised", "Total raised"),
        value: donationAnalytics ? formatCurrency(donationAnalytics.totals.raised, donationAnalytics.totals.currency) : "—",
        icon: <CircleDollarSign className="h-4 w-4" />,
        tone: "success" as const,
      },
      {
        id: "donation-average",
        label: t("admin.analytics.donations.averageDonation", "Average donation"),
        value: donationAnalytics
          ? formatCurrency(donationAnalytics.totals.averageDonation, donationAnalytics.totals.currency)
          : "—",
        icon: <BarChart3 className="h-4 w-4" />,
        tone: "primary" as const,
      },
      {
        id: "donation-recurring",
        label: t("admin.analytics.donations.recurring", "Recurring"),
        value: donationAnalytics ? formatNumber(donationAnalytics.recurringVsOneTime.recurringCount) : "—",
        icon: <BadgeCheck className="h-4 w-4" />,
        tone: "accent" as const,
      },
      {
        id: "donation-one-time",
        label: t("admin.analytics.donations.oneTime", "One-time"),
        value: donationAnalytics ? formatNumber(donationAnalytics.recurringVsOneTime.oneTimeCount) : "—",
        icon: <ShieldAlert className="h-4 w-4" />,
        tone: "warning" as const,
      },
    ],
    [donationAnalytics, t],
  );

  const verificationStatsItems = useMemo(
    () => [
      {
        id: "verification-rate",
        label: t("admin.analytics.verification.verifiedRate", "Verified rate"),
        value: verificationAnalytics ? `${verificationAnalytics.totals.verifiedRate.toFixed(1)}%` : "—",
        icon: <BadgeCheck className="h-4 w-4" />,
        tone: "success" as const,
      },
      {
        id: "verification-community-time",
        label: t("admin.analytics.verification.avgCommunity", "Avg to community"),
        value: verificationAnalytics ? formatHours(verificationAnalytics.totals.avgHoursToCommunity) : "—",
        icon: <BarChart3 className="h-4 w-4" />,
        tone: "primary" as const,
      },
      {
        id: "verification-clinic-time",
        label: t("admin.analytics.verification.avgClinic", "Avg to clinic"),
        value: verificationAnalytics ? formatHours(verificationAnalytics.totals.avgHoursToClinic) : "—",
        icon: <CircleDollarSign className="h-4 w-4" />,
        tone: "accent" as const,
      },
      {
        id: "verification-transitions",
        label: t("admin.analytics.verification.transitions", "Transitions"),
        value: verificationAnalytics ? formatNumber(verificationAnalytics.totals.transitionsInWindow) : "—",
        icon: <ShieldAlert className="h-4 w-4" />,
        tone: "warning" as const,
      },
    ],
    [t, verificationAnalytics],
  );

  const moderationStatsItems = useMemo(
    () => [
      {
        id: "moderation-open",
        label: t("admin.analytics.moderation.open", "Open"),
        value: moderationAnalytics ? formatNumber(moderationAnalytics.totals.byStatus.open) : "—",
        icon: <ShieldAlert className="h-4 w-4" />,
        tone: "warning" as const,
      },
      {
        id: "moderation-reviewing",
        label: t("admin.analytics.moderation.reviewing", "Reviewing"),
        value: moderationAnalytics ? formatNumber(moderationAnalytics.totals.byStatus.reviewing) : "—",
        icon: <BarChart3 className="h-4 w-4" />,
        tone: "primary" as const,
      },
      {
        id: "moderation-closed",
        label: t("admin.analytics.moderation.closed", "Closed"),
        value: moderationAnalytics ? formatNumber(moderationAnalytics.totals.byStatus.closed) : "—",
        icon: <BadgeCheck className="h-4 w-4" />,
        tone: "success" as const,
      },
      {
        id: "moderation-avg-resolution",
        label: t("admin.analytics.moderation.avgResolution", "Avg resolution"),
        value: moderationAnalytics ? formatHours(moderationAnalytics.totals.avgResolutionHours) : "—",
        icon: <CircleDollarSign className="h-4 w-4" />,
        tone: "accent" as const,
      },
    ],
    [moderationAnalytics, t],
  );

  if (me === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">{t("admin.analytics.loading", "Loading analytics…")}</div>;
  }

  if (!me || me.role !== "admin") {
    return <div className="p-6 text-sm text-muted-foreground">{t("admin.common.adminRequired", "Admin access required.")}</div>;
  }

  return (
    <PageShell>
      <PageSection className="pb-2">
        <SectionHeader
          title={t("admin.analytics.title", "Analytics dashboard")}
          description={t("admin.analytics.subtitle", "Operational metrics for cases, donations, verification, and moderation.")}
        />
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={cn(
                "h-11 rounded-xl border px-3 text-sm font-medium transition-colors",
                days === option
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "border-border/70 bg-surface text-foreground hover:bg-surface-sunken",
              )}
            >
              {t("admin.analytics.periodDays", "{{count}}d", { count: option })}
            </button>
          ))}
        </div>
      </PageSection>

      {isLoading ? (
        <PageSection className="pt-0">
          <div className="rounded-2xl border border-border/60 bg-surface-elevated p-4 text-sm text-muted-foreground shadow-xs">
            {t("admin.analytics.loading", "Loading analytics…")}
          </div>
        </PageSection>
      ) : (
        <>
          <PageSection className="pt-0">
            <SectionHeader
              title={t("admin.analytics.sections.cases", "Case analytics")}
              description={t("admin.analytics.cases.description", "Created, funded, and closed trends plus city breakdown.")}
            />
            <StatsGrid items={caseStatsItems} />
          </PageSection>

          <PageSection className="pt-0">
            <div className="rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
              <p className="text-sm font-semibold text-foreground">{t("admin.analytics.cases.byCity", "By city")}</p>
              <div className="mt-3 space-y-2">
                {caseAnalytics?.byCity.slice(0, 8).map((row) => (
                  <div key={row.city} className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-sunken/50 px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{row.city}</span>
                    <span className="text-muted-foreground">
                      {t("admin.analytics.cases.cityRow", "created {{created}} · funded {{funded}} · closed {{closed}}", {
                        created: row.created,
                        funded: row.funded,
                        closed: row.closed,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PageSection>

          <PageSection className="pt-0">
            <SectionHeader
              title={t("admin.analytics.sections.donations", "Donation analytics")}
              description={t("admin.analytics.donations.description", "Raised totals, averages, cohorts, and recurring split.")}
            />
            <StatsGrid items={donationStatsItems} />
            <div className="mt-3 rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
              <p className="text-sm font-semibold text-foreground">{t("admin.analytics.donations.cohorts", "Donor cohorts")}</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div>{t("admin.analytics.donations.cohortOneTime", "One-time donors")}: {donationAnalytics?.donorCohorts.oneTimeDonors}</div>
                <div>{t("admin.analytics.donations.cohortRepeat", "Repeat donors")}: {donationAnalytics?.donorCohorts.repeatDonors}</div>
                <div>{t("admin.analytics.donations.cohortPower", "Power donors (5+)")}: {donationAnalytics?.donorCohorts.powerDonors}</div>
                <div>{t("admin.analytics.donations.cohortRecurring", "Recurring supporters")}: {donationAnalytics?.donorCohorts.recurringSupporters}</div>
                <div>{t("admin.analytics.donations.cohortNew", "New donors in period")}: {donationAnalytics?.donorCohorts.newDonorsInWindow}</div>
                <div>{t("admin.analytics.donations.cohortReturning", "Returning donors in period")}: {donationAnalytics?.donorCohorts.returningDonorsInWindow}</div>
              </div>
            </div>
          </PageSection>

          <PageSection className="pt-0">
            <SectionHeader
              title={t("admin.analytics.sections.verification", "Verification analytics")}
              description={t("admin.analytics.verification.description", "Verification status distribution and promotion timing.")}
            />
            <StatsGrid items={verificationStatsItems} />
            <div className="mt-3 rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
              <p className="text-sm font-semibold text-foreground">{t("admin.analytics.verification.byStatus", "Cases by status")}</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div>{t("admin.analytics.verification.unverified", "Unverified")}: {verificationAnalytics?.totals.byStatus.unverified}</div>
                <div>{t("admin.analytics.verification.community", "Community")}: {verificationAnalytics?.totals.byStatus.community}</div>
                <div>{t("admin.analytics.verification.clinic", "Clinic")}: {verificationAnalytics?.totals.byStatus.clinic}</div>
              </div>
            </div>
          </PageSection>

          <PageSection className="pt-0">
            <SectionHeader
              title={t("admin.analytics.sections.moderation", "Moderation analytics")}
              description={t("admin.analytics.moderation.description", "Report throughput, resolution speed, and top reasons.")}
            />
            <StatsGrid items={moderationStatsItems} />
            <div className="mt-3 rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
              <p className="text-sm font-semibold text-foreground">{t("admin.analytics.moderation.topReasons", "Top report reasons")}</p>
              <div className="mt-3 space-y-2">
                {moderationAnalytics?.topReasons.slice(0, 5).map((entry) => (
                  <div key={entry.reason} className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-sunken/50 px-3 py-2 text-sm">
                    <span className="text-foreground">
                      {t(
                        `admin.analytics.moderation.reasons.${entry.reason}`,
                        entry.reason.replace(/_/g, " "),
                      )}
                    </span>
                    <span className="font-medium text-muted-foreground">{entry.count}</span>
                  </div>
                ))}
                {moderationAnalytics?.topReasons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("admin.analytics.moderation.noReasons", "No reports yet.")}</p>
                ) : null}
              </div>
            </div>
          </PageSection>
        </>
      )}
    </PageShell>
  );
}
