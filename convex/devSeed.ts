import { mutation } from "./_generated/server";
import { v } from "convex/values";

function requireDevSecret(secret: string) {
  const expected = process.env.DEV_SEED_SECRET;
  if (!expected) {
    throw new Error(
      "DEV_SEED_SECRET is not set. Set it with `npx convex env set DEV_SEED_SECRET <value>`.",
    );
  }
  if (secret !== expected) throw new Error("Invalid DEV_SEED_SECRET");
}

export const seedDemoData = mutation({
  args: {
    secret: v.string(),
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    requireDevSecret(args.secret);

    const now = Date.now();
    const clerkId = "dev_seed";

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId,
        name: "Dev Seed",
        email: "dev-seed@local.test",
        avatar: undefined,
        phone: undefined,
        role: "admin",
        createdAt: now,
      });
      user = await ctx.db.get(userId);
      if (!user) throw new Error("Failed to create seed user");
    }

    if (args.reset) {
      const existing = await ctx.db
        .query("cases")
        .withIndex("by_user", (q) => q.eq("userId", user!._id))
        .collect();
      for (const doc of existing) {
        await ctx.db.delete(doc._id);
      }
    }

    const casesToInsert = [
      {
        language: "en",
        type: "urgent" as const,
        category: "medical" as const,
        title: "Kitten found with injured paw",
        description: "A small kitten was found by the road with a front paw injury.",
        story:
          "The kitten is exhausted and was likely hit by a car. It needs examination, X-ray and treatment.\n\nHelp us provide care and a safe place.",
        location: { city: "Sofia", neighborhood: "Lozenets" },
        fundraising: { goal: 1200, currency: "BGN" },
        translations: {
          bg: {
            title: "Намерено коте с наранена лапичка",
            description: "Малко коте беше намерено до пътя с травма на предната лапа.",
            story: "Котето е изтощено и вероятно е било ударено от кола. Нужни са преглед, рентген и лечение.\n\nПомогнете да осигурим грижа и безопасно място.",
          },
        },
      },
      {
        language: "en",
        type: "critical" as const,
        category: "surgery" as const,
        title: "Dog after accident — urgent surgery needed",
        description: "Needs surgery and post-operative recovery.",
        story:
          "The dog was found with severe injuries. The clinic confirmed the need for urgent surgery.\n\nEvery contribution matters.",
        location: { city: "Plovdiv", neighborhood: "Center" },
        fundraising: { goal: 2500, currency: "BGN" },
        translations: {
          ru: {
            title: "Собака после аварии — срочная операция",
            description: "Нужна операция и послеоперационное восстановление.",
            story: "Собака была найдена с тяжелыми травмами. В клинике подтвердили необходимость срочной операции.\n\nКаждый вклад важен.",
          },
        },
      },
      {
        language: "en",
        type: "recovering" as const,
        category: "food" as const,
        title: "Kitten recovering — food and medicine needed",
        description: "Needs special food and medicine for 2 weeks.",
        story:
          "After treatment, she is doing better. Now she needs rest, food and follow-up care.\n\nThank you for your support.",
        location: { city: "Varna", neighborhood: "Asparuhovo" },
        fundraising: { goal: 600, currency: "BGN" },
        translations: {
          de: {
            title: "Kätzchen erholt sich — Futter und Medikamente",
            description: "Benötigt Spezialfutter und Medikamente für 2 Wochen.",
            story: "Nach der Behandlung geht es ihr besser. Jetzt braucht sie Ruhe, Futter und Nachsorge.\n\nDanke für eure Unterstützung.",
          },
        },
      },
    ];

    const insertedIds: string[] = [];

    for (const item of casesToInsert) {
      const id = await ctx.db.insert("cases", {
        userId: user._id,
        type: item.type,
        category: item.category,
        language: item.language,
        title: item.title,
        description: item.description,
        story: item.story,
        images: [],
        location: {
          city: item.location.city,
          neighborhood: item.location.neighborhood,
          coordinates: undefined,
        },
        clinicId: undefined,
        foundAt: now - 1000 * 60 * 60 * 24 * 2,
        broughtToClinicAt: now - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30,
        fundraising: {
          goal: item.fundraising.goal,
          current: 0,
          currency: item.fundraising.currency,
        },
        status: "active",
        updates: [],
        createdAt: now,
        translations: item.translations,
      });
      insertedIds.push(String(id));
    }

    return { inserted: insertedIds, userId: String(user._id) };
  },
});
