import posthog from "posthog-js";

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

let initialized = false;

export function initAnalytics(config?: { key?: string; host?: string }) {
  if (initialized) return true;

  const key = config?.key?.trim() ?? "";
  const host = config?.host?.trim() ?? "";
  if (!key || !host) return false;

  posthog.init(key, {
    api_host: host,
    respect_dnt: true,
    persistence: "localStorage",
    capture_pageview: false,
  });

  initialized = true;
  return true;
}

export function identifyAnalytics(distinctId: string, properties?: AnalyticsProps) {
  if (!initialized) return;
  posthog.identify(distinctId, properties);
}

export function trackAnalytics(eventName: string, properties?: AnalyticsProps) {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}
