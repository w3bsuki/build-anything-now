import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedUser } from "./testHelpers";

describe("cases external sources", () => {
  it("stores normalized source metadata and returns it on case detail", async () => {
    const t = createTestClient();
    const { clerkId } = await seedUser(t, { clerkId: "case_external_source_owner" });
    const asOwner = t.withIdentity(buildIdentity(clerkId));

    const caseId = await asOwner.mutation(api.cases.create, {
      type: "urgent",
      category: "medical",
      language: "en",
      title: "Source metadata case",
      description: "Testing external sources",
      story: "Detailed story",
      images: [],
      location: {
        city: "Sofia",
        neighborhood: "Center",
      },
      foundAt: Date.now(),
      fundraisingGoal: 150,
      currency: "EUR",
      externalSourceUrl: "facebook.com/pawtreon/posts/rescue-update?utm_source=test",
    });

    const source = await t.run(async (ctx) => {
      return ctx.db
        .query("externalSources")
        .withIndex("by_target_created", (q) => q.eq("targetType", "case").eq("targetId", String(caseId)))
        .order("desc")
        .first();
    });

    expect(source).toBeTruthy();
    expect(source?.platform).toBe("facebook");
    expect(source?.url).toBe("https://facebook.com/pawtreon/posts/rescue-update");
    expect(source?.title).toBe("rescue update");

    const caseDetail = await asOwner.query(api.cases.getUiForLocale, {
      id: caseId,
      locale: "en",
    });

    expect(caseDetail?.externalSource).toBeTruthy();
    expect(caseDetail?.externalSource?.domain).toBe("facebook.com");
    expect(caseDetail?.externalSource?.url).toBe("https://facebook.com/pawtreon/posts/rescue-update");
  });

  it("rejects non-http source URLs", async () => {
    const t = createTestClient();
    const { clerkId } = await seedUser(t, { clerkId: "case_external_source_invalid" });
    const asOwner = t.withIdentity(buildIdentity(clerkId));

    await expect(
      asOwner.mutation(api.cases.create, {
        type: "urgent",
        category: "medical",
        language: "en",
        title: "Invalid source case",
        description: "Testing invalid source",
        story: "Story",
        images: [],
        location: {
          city: "Sofia",
          neighborhood: "Center",
        },
        foundAt: Date.now(),
        fundraisingGoal: 100,
        currency: "EUR",
        externalSourceUrl: "javascript:alert('xss')",
      }),
    ).rejects.toThrow("External source must use http or https");
  });
});
