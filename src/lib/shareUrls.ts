function normalizeLocale(locale: string): string {
  return locale.trim().toLowerCase().split("-")[0];
}

export function deriveConvexSiteOrigin(viteConvexUrl: string | undefined): string | null {
  if (!viteConvexUrl) return null;

  try {
    const url = new URL(viteConvexUrl);

    if (url.hostname.endsWith(".convex.cloud")) {
      url.hostname = url.hostname.replace(/\.convex\.cloud$/, ".convex.site");
    } else if (!url.hostname.endsWith(".convex.site")) {
      return null;
    }

    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.origin;
  } catch (_err) {
    return null;
  }
}

export function getCaseShareUrl(args: { caseId: string; locale?: string }): string | null {
  const convexSiteOrigin = deriveConvexSiteOrigin(import.meta.env.VITE_CONVEX_URL as string | undefined);
  if (!convexSiteOrigin) return null;

  const localeKey = args.locale ? normalizeLocale(args.locale) : null;
  const query = localeKey ? `?locale=${encodeURIComponent(localeKey)}` : "";

  return `${convexSiteOrigin}/share/case/${args.caseId}${query}`;
}

