import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedUser } from "./testHelpers";

describe("gdpr data export", () => {
  it("requires authentication", async () => {
    const t = createTestClient();

    await expect(t.mutation(api.gdpr.createDataExport, {})).rejects.toThrow("Not authenticated");
  });

  it("returns user-owned payload with generated timestamp", async () => {
    const t = createTestClient();
    const { userId, clerkId } = await seedUser(t, { clerkId: "gdpr_owner" });
    const asUser = t.withIdentity(buildIdentity(clerkId));

    await t.run(async (ctx) => {
      await ctx.db.insert("donations", {
        userId,
        donationKind: "one_time",
        amount: 20,
        currency: "EUR",
        status: "completed",
        anonymous: false,
        createdAt: Date.now(),
      });
    });

    const payload = await asUser.mutation(api.gdpr.createDataExport, {});

    expect(payload.user._id).toBe(userId);
    expect(payload.generatedAt).toBeTypeOf("number");
    expect(payload.donations.length).toBe(1);
    expect(payload.donations[0]?.amount).toBe(20);
  });
});
