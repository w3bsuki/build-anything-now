import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type ExternalSourcePlatform = "facebook" | "instagram" | "x" | "youtube" | "tiktok" | "other";
export type ExternalSourceTargetType = "case" | "community_post";

type QueryLikeCtx = Pick<QueryCtx, "db">;
type MutationLikeCtx = Pick<MutationCtx, "db">;

export type NormalizedExternalSource = {
  url: string;
  platform: ExternalSourcePlatform;
  title: string;
  thumbnailUrl: string;
};

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

function normalizeDomain(hostname: string) {
  return hostname.trim().toLowerCase().replace(/^www\./, "");
}

function sanitizePath(pathname: string) {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  const trimmed = collapsed.replace(/\/+$/g, "");
  return trimmed || "/";
}

function parseDomainFromUrl(url: string): string {
  try {
    return normalizeDomain(new URL(url).hostname);
  } catch {
    return "";
  }
}

function detectPlatform(domain: string): ExternalSourcePlatform {
  if (domain.endsWith("facebook.com") || domain.endsWith("fb.com")) return "facebook";
  if (domain.endsWith("instagram.com")) return "instagram";
  if (domain.endsWith("x.com") || domain.endsWith("twitter.com")) return "x";
  if (domain.endsWith("youtube.com") || domain.endsWith("youtu.be")) return "youtube";
  if (domain.endsWith("tiktok.com")) return "tiktok";
  return "other";
}

function platformTitle(platform: ExternalSourcePlatform): string {
  if (platform === "facebook") return "Facebook post";
  if (platform === "instagram") return "Instagram post";
  if (platform === "x") return "X post";
  if (platform === "youtube") return "YouTube post";
  if (platform === "tiktok") return "TikTok post";
  return "External source";
}

function inferPathTitle(pathname: string): string | null {
  const segments = pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const tail = segments.length > 0 ? segments[segments.length - 1] : undefined;
  if (!tail) return null;

  let decodedTail = tail;
  try {
    decodedTail = decodeURIComponent(tail);
  } catch {
    decodedTail = tail;
  }

  const normalized = decodedTail
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || /^[0-9]+$/.test(normalized)) return null;
  if (normalized.length <= 72) return normalized;
  return `${normalized.slice(0, 72)}…`;
}

function normalizeRawUrl(rawUrl: string): URL {
  const trimmed = rawUrl.trim();
  if (!trimmed) throw new Error("External source URL is required");

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("External source URL is invalid");
  }

  if (!HTTP_PROTOCOLS.has(parsed.protocol)) {
    throw new Error("External source must use http or https");
  }

  const domain = normalizeDomain(parsed.hostname);
  if (!domain || !domain.includes(".")) {
    throw new Error("External source URL is invalid");
  }

  parsed.protocol = "https:";
  parsed.username = "";
  parsed.password = "";
  parsed.hostname = domain;
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = sanitizePath(parsed.pathname);

  return parsed;
}

export function normalizeExternalSourceInput(rawUrl: string): NormalizedExternalSource {
  const parsed = normalizeRawUrl(rawUrl);
  const domain = normalizeDomain(parsed.hostname);
  const platform = detectPlatform(domain);
  const pathTitle = inferPathTitle(parsed.pathname);

  return {
    url: parsed.pathname === "/" ? `https://${domain}` : `https://${domain}${parsed.pathname}`,
    platform,
    title: pathTitle ?? platformTitle(platform),
    thumbnailUrl: `https://${domain}/favicon.ico`,
  };
}

export function normalizeOptionalExternalSourceInput(rawUrl?: string | null): NormalizedExternalSource | null {
  if (!rawUrl) return null;
  if (!rawUrl.trim()) return null;
  return normalizeExternalSourceInput(rawUrl);
}

export async function createExternalSourceForTarget(
  ctx: MutationLikeCtx,
  args: {
    targetType: ExternalSourceTargetType;
    targetId: string;
    source: NormalizedExternalSource;
    createdAt: number;
  }
) {
  const existing = await ctx.db
    .query("externalSources")
    .withIndex("by_target_url", (q) =>
      q.eq("targetType", args.targetType).eq("targetId", args.targetId).eq("url", args.source.url)
    )
    .first();

  if (existing) return existing._id;

  return ctx.db.insert("externalSources", {
    targetType: args.targetType,
    targetId: args.targetId,
    url: args.source.url,
    platform: args.source.platform,
    title: args.source.title,
    thumbnailUrl: args.source.thumbnailUrl,
    createdAt: args.createdAt,
  });
}

export async function getLatestExternalSourceForTarget(
  ctx: QueryLikeCtx,
  targetType: ExternalSourceTargetType,
  targetId: string
) {
  return ctx.db
    .query("externalSources")
    .withIndex("by_target_created", (q) => q.eq("targetType", targetType).eq("targetId", targetId))
    .order("desc")
    .first();
}

export function mapExternalSourceForUi(source: Doc<"externalSources"> | null) {
  if (!source) return null;

  const domain = parseDomainFromUrl(source.url);

  return {
    url: source.url,
    platform: source.platform,
    title: source.title,
    thumbnailUrl: source.thumbnailUrl ?? null,
    domain,
  };
}
