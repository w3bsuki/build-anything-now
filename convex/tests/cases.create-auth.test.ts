import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { createTestClient } from "./testHelpers";

describe("cases.create auth", () => {
  it("requires an authenticated user", async () => {
    const t = createTestClient();

    await expect(
      t.mutation(api.cases.create, {
        type: "urgent",
        category: "medical",
        language: "en",
        title: "Auth check case",
        description: "Auth check description",
        story: "Auth check story",
        images: [],
        location: {
          city: "Sofia",
          neighborhood: "Center",
        },
        foundAt: Date.now(),
        fundraisingGoal: 100,
        currency: "EUR",
      }),
    ).rejects.toThrow("Not authenticated");
  });
});
