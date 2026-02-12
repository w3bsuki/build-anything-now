import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

describe("cases.endorseCase trusted-user requirement", () => {
  it("rejects endorsements from untrusted users", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId, { verificationStatus: "unverified" });

    const { clerkId: untrustedClerkId } = await seedUser(t, {
      role: "user",
      verificationLevel: "unverified",
    });
    const asUntrusted = t.withIdentity(buildIdentity(untrustedClerkId));

    await expect(
      asUntrusted.mutation(api.cases.endorseCase, { caseId }),
    ).rejects.toThrow("Trusted user endorsement required");
  });
});
