import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedUser } from "./testHelpers";

describe("donations.createCheckoutSession amount validation", () => {
  it("rejects non-positive donation amounts", async () => {
    const t = createTestClient();
    const { clerkId } = await seedUser(t);
    const asUser = t.withIdentity(buildIdentity(clerkId));

    await expect(
      asUser.mutation(api.donations.createCheckoutSession, {
        amount: 0,
        currency: "EUR",
        anonymous: false,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      }),
    ).rejects.toThrow("Amount must be positive");
  });
});
