import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Calendar, CircleOff, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type SubscriptionStatus = "pending" | "active" | "past_due" | "canceled" | "unpaid";
type BillingInterval = "month" | "year";

type SubscriptionRow = {
  _id: Id<"subscriptions">;
  targetType: "case" | "user";
  targetTitle?: string | null;
  amount: number;
  currency: string;
  interval: BillingInterval;
  status: SubscriptionStatus;
  createdAt: number;
};

function formatMoney(amount: number, currency: string) {
  const safeCurrency = currency || "EUR";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${safeCurrency}`;
  }
}

function statusTone(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "bg-success/10 text-success border-success/30";
    case "pending":
      return "bg-warning/10 text-warning border-warning/30";
    case "past_due":
      return "bg-warning/10 text-warning border-warning/30";
    case "unpaid":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "canceled":
      return "bg-muted text-muted-foreground border-border/40";
    default:
      return "bg-muted text-muted-foreground border-border/40";
  }
}

export default function Subscriptions() {
  const { t } = useTranslation();
  const subscriptionsRaw = useQuery(api.subscriptions.list);
  const cancelSubscription = useMutation(api.subscriptions.cancel);
  const [cancellingId, setCancellingId] = useState<Id<"subscriptions"> | null>(null);

  const isLoading = subscriptionsRaw === undefined;
  const subscriptions = (subscriptionsRaw ?? []) as SubscriptionRow[];

  const handleCancel = async (id: Id<"subscriptions">) => {
    setCancellingId(id);
    try {
      await cancelSubscription({ id });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <PageShell>
      <header className="sticky top-0 md:top-14 z-40 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-5 py-3 flex items-center gap-3">
          <Link
            to="/settings"
            className="h-11 w-11 rounded-full bg-surface-sunken hover:bg-surface-sunken/90 transition-colors inline-flex items-center justify-center"
            aria-label={t("common.back", "Back")}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-foreground">{t("subscriptions.title", "Monthly Support")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("subscriptions.subtitle", "Manage recurring donations in one place.")}
            </p>
          </div>
        </div>
      </header>

      <PageSection className="py-4">
        <SectionHeader
          title={t("subscriptions.activeListTitle", "Your subscriptions")}
          count={isLoading ? undefined : subscriptions.length}
          description={t("subscriptions.activeListDescription", "Cancel anytime. Billing is handled securely by Stripe.")}
        />

        {isLoading ? (
          <div className="text-sm text-muted-foreground">{t("common.loading", "Loading…")}</div>
        ) : subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
            <p className="text-sm font-semibold text-foreground">
              {t("subscriptions.emptyTitle", "No monthly support yet")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("subscriptions.emptyBody", "Open a case or profile and tap Support Monthly to start helping regularly.")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => {
              const isCancelling = cancellingId === subscription._id;
              const canCancel = subscription.status !== "canceled";
              const intervalLabel =
                subscription.interval === "year"
                  ? t("subscriptions.yearly", "per year")
                  : t("subscriptions.monthly", "per month");

              return (
                <div
                  key={subscription._id}
                  className="rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {subscription.targetTitle ??
                          (subscription.targetType === "case"
                            ? t("subscriptions.caseFallback", "Rescue case")
                            : t("subscriptions.profileFallback", "Rescuer profile"))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatMoney(subscription.amount, subscription.currency)} {intervalLabel}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t("subscriptions.startedOn", "Started")}{" "}
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-2">
                      <Badge
                        variant="secondary"
                        className={cn("border text-[10px] px-2 py-0.5 h-5 font-medium", statusTone(subscription.status))}
                      >
                        {t(`subscriptions.status.${subscription.status}`, subscription.status)}
                      </Badge>
                      {canCancel ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 rounded-xl"
                          onClick={() => void handleCancel(subscription._id)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t("subscriptions.canceling", "Canceling…")}
                            </>
                          ) : (
                            <>
                              <CircleOff className="w-4 h-4 mr-2" />
                              {t("subscriptions.cancel", "Cancel")}
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="inline-flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {t("subscriptions.canceledLabel", "Canceled")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
