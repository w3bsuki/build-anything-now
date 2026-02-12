import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

describe("cases.addUpdate authorization", () => {
  it("rejects updates from unrelated users", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId);

    const { clerkId: outsiderClerkId } = await seedUser(t);
    const asOutsider = t.withIdentity(buildIdentity(outsiderClerkId));

    await expect(
      asOutsider.mutation(api.cases.addUpdate, {
        caseId,
        text: "Unauthorized update",
        type: "update",
      }),
    ).rejects.toThrow("You don't have permission to update this case");
  });

  it("allows updates from the case owner", async () => {
    const t = createTestClient();
    const { userId: ownerId, clerkId: ownerClerkId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId);
    const asOwner = t.withIdentity(buildIdentity(ownerClerkId));

    await asOwner.mutation(api.cases.addUpdate, {
      caseId,
      text: "Owner update",
      type: "milestone",
    });

    const updatedCase = await t.query(api.cases.get, { id: caseId });
    expect(updatedCase?.updates).toHaveLength(1);
    expect(updatedCase?.updates[0]?.text).toBe("Owner update");
  });
});
