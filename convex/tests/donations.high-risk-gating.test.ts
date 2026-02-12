import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

describe("donations.createCheckoutSession high-risk gating", () => {
  it("blocks donations for unverified high-risk cases", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId, {
      verificationStatus: "unverified",
      riskLevel: "high",
    });

    const { clerkId: donorClerkId } = await seedUser(t);
    const asDonor = t.withIdentity(buildIdentity(donorClerkId));

    await expect(
      asDonor.mutation(api.donations.createCheckoutSession, {
        caseId,
        amount: 25,
        currency: "EUR",
        anonymous: false,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      }),
    ).rejects.toThrow("This case is currently blocked for donations pending review");
  });
});
