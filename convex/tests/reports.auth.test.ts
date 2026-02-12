import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { createTestClient, seedCase, seedUser } from "./testHelpers";

describe("reports.create auth", () => {
  it("requires an authenticated reporter", async () => {
    const t = createTestClient();
    const { userId } = await seedUser(t);
    const caseId = await seedCase(t, userId);

    await expect(
      t.mutation(api.reports.create, {
        caseId,
        reason: "other",
      }),
    ).rejects.toThrow("Not authenticated");
  });
});
