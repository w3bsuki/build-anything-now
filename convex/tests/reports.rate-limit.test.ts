import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

describe("reports.create rate limiting", () => {
  it("enforces a per-user limit of 10 reports per day", async () => {
    const t = createTestClient();

    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId);

    const { clerkId: reporterClerkId } = await seedUser(t);
    const asReporter = t.withIdentity(buildIdentity(reporterClerkId));

    for (let index = 0; index < 10; index += 1) {
      await asReporter.mutation(api.reports.create, {
        caseId,
        reason: "other",
        details: `report-${index}`,
      });
    }

    await expect(
      asReporter.mutation(api.reports.create, {
        caseId,
        reason: "other",
        details: "limit-hit",
      }),
    ).rejects.toThrow("Daily report limit reached. Please try again tomorrow.");
  });
});
