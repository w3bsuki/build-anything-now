import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { createTestClient } from "./testHelpers";

describe("donations.createCheckoutSession auth", () => {
  it("requires an authenticated user", async () => {
    const t = createTestClient();

    await expect(
      t.mutation(api.donations.createCheckoutSession, {
        amount: 20,
        currency: "EUR",
        anonymous: false,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      }),
    ).rejects.toThrow("Not authenticated");
  });
});
