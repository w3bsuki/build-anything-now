import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("cases.endorseCase threshold promotion", () => {
  it("auto-promotes to community verification at 3 trusted endorsements", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId, { verificationStatus: "unverified" });

    const oldEnoughCreatedAt = Date.now() - 2 * DAY_MS;
    const trustedA = await seedUser(t, { verificationLevel: "community", createdAt: oldEnoughCreatedAt });
    const trustedB = await seedUser(t, { verificationLevel: "community", createdAt: oldEnoughCreatedAt });
    const trustedC = await seedUser(t, { verificationLevel: "community", createdAt: oldEnoughCreatedAt });

    await t.withIdentity(buildIdentity(trustedA.clerkId)).mutation(api.cases.endorseCase, { caseId });
    await t.withIdentity(buildIdentity(trustedB.clerkId)).mutation(api.cases.endorseCase, { caseId });
    const thirdResult = await t.withIdentity(buildIdentity(trustedC.clerkId)).mutation(api.cases.endorseCase, { caseId });

    expect(thirdResult.promotedToCommunity).toBe(true);

    const updatedCase = await t.query(api.cases.get, { id: caseId });
    expect(updatedCase?.verificationStatus ?? "unverified").toBe("community");
  });
});
