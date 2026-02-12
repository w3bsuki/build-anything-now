import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "convex/react";
import { Heart, Loader2, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

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

export function MonthlySupportDrawer({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetTitle,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "case" | "user";
  targetId: string;
  targetTitle: string;
  currency: string;
}) {
  const { t } = useTranslation();
  const createSubscription = useMutation(api.subscriptions.create);
  const presets = useMemo(() => [5, 10, 20, 50], []);
  const [amount, setAmount] = useState(presets[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setAmount(presets[1]);
      setCustomAmount("");
      setIsSubmitting(false);
    }
  }, [open, presets]);

  const effectiveAmount = useMemo(() => {
    const parsed = Number(customAmount.replace(/[^\d.]/g, ""));
    if (customAmount.trim().length > 0 && Number.isFinite(parsed)) {
      return parsed;
    }
    return amount;
  }, [amount, customAmount]);

  const canSubmit = effectiveAmount > 0 && !isSubmitting;

  const handleStart = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      const result = await createSubscription({
        targetType,
        targetId,
        amount: effectiveAmount,
        currency,
        interval: "month",
        successUrl: `${returnUrl}?subscription=success`,
        cancelUrl: `${returnUrl}?subscription=cancelled`,
      });

      if (result.mode === "preview") {
        toast({
          title: t("subscriptions.previewActiveTitle", "Monthly support started"),
          description: t("subscriptions.previewActiveBody", "Preview mode: recurring billing is simulated locally."),
        });
        onOpenChange(false);
        return;
      }

      if (!result.checkoutUrl) {
        throw new Error("Missing Stripe checkout URL");
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      console.error(error);
      toast({
        title: t("common.error", "Error"),
        description: t("subscriptions.checkoutFailed", "Unable to start monthly support. Please try again."),
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-base font-semibold">
                {t("actions.supportMonthly", "Support Monthly")}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 text-left">
              {targetTitle}
            </p>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <div className="rounded-xl border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">
                {t("subscriptions.billingLabel", "Billed monthly")}
              </p>
              <p className="text-sm font-semibold text-foreground line-clamp-1">{targetTitle}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                {t("subscriptions.chooseAmount", "Choose monthly amount")}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount("");
                    }}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-semibold transition-colors",
                      customAmount.trim().length === 0 && amount === preset
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-surface-sunken/70",
                    )}
                  >
                    {formatMoney(preset, currency)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Input
                inputMode="decimal"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder={t("subscriptions.customAmount", "Custom monthly amount")}
                className="h-11 text-base"
              />
              <p className="text-xs text-muted-foreground">
                {t("subscriptions.secureCheckoutHint", "You will be redirected to secure Stripe checkout.")}
              </p>
            </div>

            <Button
              className="w-full h-11 rounded-xl font-semibold"
              variant="donate"
              onClick={() => void handleStart()}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("subscriptions.redirecting", "Redirecting…")}
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  {t("subscriptions.startMonthlySupport", "Start monthly support")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
