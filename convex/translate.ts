import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

function fnv1a32(input: string): string {
  // Deterministic, cheap hash for caching/deduping translations.
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  // Unsigned 32-bit hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizeLocale(locale: string): string {
  // i18next can return tags like "en-US"; we store/translate by base language.
  return locale.trim().toLowerCase().split("-")[0];
}

function getDefaultTargetLocales(): string[] {
  // Keep in sync with public/locales.
  return ["bg", "de", "en", "ru", "uk"];
}

function getTargetLocalesFromEnv(): string[] | null {
  const raw = process.env.TRANSLATION_TARGET_LOCALES;
  if (!raw) return null;
  const locales = raw
    .split(",")
    .map((s) => normalizeLocale(s))
    .filter(Boolean);
  return locales.length ? Array.from(new Set(locales)) : null;
}

function getDayKey(now: number): number {
  // UTC day key for quota accounting
  return Math.floor(now / 86_400_000);
}

function getDailyLimitPerUser(): number {
  const raw = process.env.TRANSLATION_DAILY_LIMIT_PER_USER;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20;
}

function allowAnonymousTranslationRequests(): boolean {
  const raw = process.env.TRANSLATION_ALLOW_ANON;
  return raw === "1" || raw?.toLowerCase() === "true";
}

export const getCaseForTranslation = internalQuery({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.caseId);
  },
});

export const setCaseTranslationStatus = internalMutation({
  args: {
    caseId: v.id("cases"),
    locale: v.string(),
    status: v.union(v.literal("pending"), v.literal("done"), v.literal("error")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("Case not found");

    const nextStatus = {
      ...(caseDoc.translationStatus ?? {}),
      [normalizeLocale(args.locale)]: {
        status: args.status,
        updatedAt: Date.now(),
        ...(args.error ? { error: args.error } : {}),
      },
    };

    await ctx.db.patch(args.caseId, { translationStatus: nextStatus });
  },
});

export const saveCaseTranslation = internalMutation({
  args: {
    caseId: v.id("cases"),
    locale: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    story: v.optional(v.string()),
    provider: v.string(),
    sourceHash: v.string(),
  },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("Case not found");

    const targetLocale = normalizeLocale(args.locale);

    const nextTranslations = {
      ...(caseDoc.translations ?? {}),
      [targetLocale]: {
        title: args.title,
        description: args.description,
        story: args.story,
        translatedAt: Date.now(),
        provider: args.provider,
        sourceHash: args.sourceHash,
      },
    };

    await ctx.db.patch(args.caseId, { translations: nextTranslations });
  },
});

async function deeplTranslate(params: {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
}): Promise<string> {
  const authKey = process.env.DEEPL_AUTH_KEY;
  if (!authKey) {
    throw new Error("Missing DEEPL_AUTH_KEY env var");
  }

  const endpoint = process.env.DEEPL_API_URL ?? "https://api-free.deepl.com/v2/translate";

  // DeepL expects uppercase language codes (EN, DE, BG). It also supports regional variants.
  const targetLang = params.targetLocale.toUpperCase();
  const sourceLang = params.sourceLocale ? params.sourceLocale.toUpperCase() : undefined;

  const body = new URLSearchParams();
  body.set("text", params.text);
  body.set("target_lang", targetLang);
  if (sourceLang) body.set("source_lang", sourceLang);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`DeepL translate failed: ${response.status} ${details}`);
  }

  const json = (await response.json()) as { translations?: Array<{ text: string }> };
  const translated = json.translations?.[0]?.text;
  if (!translated) throw new Error("DeepL translate returned empty result");
  return translated;
}

async function translateText(params: {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
}): Promise<{ text: string; provider: string }> {
  const provider = (process.env.TRANSLATION_PROVIDER ?? "deepl").toLowerCase();

  switch (provider) {
    case "deepl": {
      const text = await deeplTranslate(params);
      return { text, provider: "deepl" };
    }
    default:
      throw new Error(
        `Unsupported TRANSLATION_PROVIDER: ${provider}. Supported: deepl. (Set TRANSLATION_PROVIDER=deepl)`
      );
  }
}

export const translateCase = internalAction({
  args: {
    caseId: v.id("cases"),
    targetLocale: v.string(),
  },
  handler: async (ctx, args) => {
    const targetLocale = normalizeLocale(args.targetLocale);

    const caseDoc = await ctx.runQuery(internal.translate.getCaseForTranslation, { caseId: args.caseId });
    if (!caseDoc) throw new Error("Case not found");

    const sourceLocale = normalizeLocale(caseDoc.language ?? "");
    if (sourceLocale && sourceLocale === targetLocale) {
      return { skipped: true, reason: "source_locale_equals_target" };
    }

    const sourceSnapshot = {
      title: caseDoc.title,
      description: caseDoc.description,
      story: caseDoc.story ?? "",
    };
    const sourceHash = fnv1a32(JSON.stringify(sourceSnapshot));

    const existing = caseDoc.translations?.[targetLocale];
    if (existing?.sourceHash === sourceHash) {
      return { skipped: true, reason: "up_to_date" };
    }

    await ctx.runMutation(internal.translate.setCaseTranslationStatus, {
      caseId: args.caseId,
      locale: targetLocale,
      status: "pending",
    });

    try {
      const [title, description, story] = await Promise.all([
        translateText({ text: caseDoc.title, targetLocale, sourceLocale: sourceLocale || undefined }),
        translateText({ text: caseDoc.description, targetLocale, sourceLocale: sourceLocale || undefined }),
        caseDoc.story
          ? translateText({ text: caseDoc.story, targetLocale, sourceLocale: sourceLocale || undefined })
          : Promise.resolve({ text: undefined, provider: (process.env.TRANSLATION_PROVIDER ?? "deepl").toLowerCase() }),
      ]);

      const provider = title.provider;

      await ctx.runMutation(internal.translate.saveCaseTranslation, {
        caseId: args.caseId,
        locale: targetLocale,
        title: title.text,
        description: description.text,
        story: caseDoc.story ? story.text : undefined,
        provider,
        sourceHash,
      });

      await ctx.runMutation(internal.translate.setCaseTranslationStatus, {
        caseId: args.caseId,
        locale: targetLocale,
        status: "done",
      });

      return { skipped: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.runMutation(internal.translate.setCaseTranslationStatus, {
        caseId: args.caseId,
        locale: targetLocale,
        status: "error",
        error: message,
      });
      throw error;
    }
  },
});

export const requestCaseTranslations = mutation({
  args: {
    caseId: v.id("cases"),
    // Optional override; if omitted, uses TRANSLATION_TARGET_LOCALES or the default set.
    targetLocales: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const subject = identity?.subject ?? (allowAnonymousTranslationRequests() ? "anon" : null);
    if (!subject) throw new Error("Not authenticated");

    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("Case not found");

    const sourceLocale = normalizeLocale(caseDoc.language ?? "");

    const sourceSnapshot = {
      title: caseDoc.title,
      description: caseDoc.description,
      story: caseDoc.story ?? "",
    };
    const sourceHash = fnv1a32(JSON.stringify(sourceSnapshot));

    const defaultTargets = getTargetLocalesFromEnv() ?? getDefaultTargetLocales();
    const requestedTargets = (args.targetLocales ?? defaultTargets)
      .map(normalizeLocale)
      .filter((l) => l && l !== sourceLocale);

    const uniqueTargets = Array.from(new Set(requestedTargets));

    // Dedupe: skip locales that are already up-to-date or already pending.
    const toSchedule = uniqueTargets.filter((locale) => {
      const existing = caseDoc.translations?.[locale];
      if (existing?.sourceHash === sourceHash) return false;
      const status = caseDoc.translationStatus?.[locale]?.status;
      if (status === "pending") return false;
      return true;
    });

    // Simple per-user-per-day quota.
    const now = Date.now();
    const day = getDayKey(now);
    const quota = getDailyLimitPerUser();

    const existingLimitRow = await ctx.db
      .query("translationRateLimits")
      .withIndex("by_clerk_day", (q) => q.eq("clerkId", subject).eq("day", day))
      .unique();

    const currentCount = existingLimitRow?.count ?? 0;
    if (currentCount + toSchedule.length > quota) {
      throw new Error(`Translation quota exceeded. Try again tomorrow.`);
    }

    if (existingLimitRow) {
      await ctx.db.patch(existingLimitRow._id, {
        count: currentCount + toSchedule.length,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("translationRateLimits", {
        clerkId: subject,
        day,
        count: toSchedule.length,
        updatedAt: now,
      });
    }

    for (const locale of toSchedule) {
      await ctx.scheduler.runAfter(0, internal.translate.translateCase, {
        caseId: args.caseId,
        targetLocale: locale,
      });
    }

    return { scheduled: toSchedule, skipped: uniqueTargets.filter((l) => !toSchedule.includes(l)) };
  },
});
