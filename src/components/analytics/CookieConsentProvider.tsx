import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { initAnalytics } from "@/lib/analytics";

type CookieConsentState = "unset" | "accepted" | "declined";

type CookieConsentContextValue = {
  consent: CookieConsentState;
  accept: () => void;
  decline: () => void;
};

const COOKIE_CONSENT_STORAGE_KEY = "pawtreon.cookie-consent.v1";

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readConsentFromStorage(): CookieConsentState {
  if (typeof window === "undefined") return "unset";
  const saved = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (saved === "accepted" || saved === "declined") return saved;
  return "unset";
}

function persistConsent(next: Exclude<CookieConsentState, "unset">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, next);
}

function CookieConsentBanner(props: { onAccept: () => void; onDecline: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:px-6 md:pb-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-surface-elevated shadow-lg">
        <div className="space-y-3 p-4 md:p-5">
          <h2 className="text-sm font-semibold text-foreground">
            {t("analytics.cookieConsent.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("analytics.cookieConsent.description")}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={props.onDecline}
              className="h-11 rounded-xl border border-border/70 bg-surface px-4 text-base font-medium text-foreground transition-colors hover:bg-surface-sunken"
            >
              {t("analytics.cookieConsent.decline")}
            </button>
            <button
              type="button"
              onClick={props.onAccept}
              className="h-11 rounded-xl bg-primary px-4 text-base font-medium text-primary-foreground transition-colors hover:opacity-95"
            >
              {t("analytics.cookieConsent.accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookieConsentProvider(props: {
  children: ReactNode;
  analyticsConfig?: { key?: string; host?: string };
}) {
  const [consent, setConsent] = useState<CookieConsentState>(() => readConsentFromStorage());

  useEffect(() => {
    if (consent !== "accepted") return;
    initAnalytics(props.analyticsConfig);
  }, [consent, props.analyticsConfig]);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      accept: () => {
        persistConsent("accepted");
        setConsent("accepted");
      },
      decline: () => {
        persistConsent("declined");
        setConsent("declined");
      },
    }),
    [consent],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {props.children}
      {consent === "unset" ? (
        <CookieConsentBanner onAccept={value.accept} onDecline={value.decline} />
      ) : null}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return context;
}
