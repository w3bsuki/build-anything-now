import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

describe("donations.createCheckoutSession closed-case gating", () => {
  it("blocks donations for closed cases", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId, {
      status: "closed",
      lifecycleStage: "closed_success",
      verificationStatus: "clinic",
    });

    const { clerkId: donorClerkId } = await seedUser(t);
    const asDonor = t.withIdentity(buildIdentity(donorClerkId));

    await expect(
      asDonor.mutation(api.donations.createCheckoutSession, {
        caseId,
        amount: 15,
        currency: "EUR",
        anonymous: false,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      }),
    ).rejects.toThrow("Donations are closed for this case");
  });
});
