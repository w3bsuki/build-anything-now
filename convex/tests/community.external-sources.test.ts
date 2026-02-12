import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedUser } from "./testHelpers";

describe("community external sources", () => {
  it("stores normalized source metadata on thread creation and exposes it on detail query", async () => {
    const t = createTestClient();
    const { clerkId } = await seedUser(t, { clerkId: "community_external_source_owner" });
    const asUser = t.withIdentity(buildIdentity(clerkId));

    const threadId = await asUser.mutation(api.community.createThread, {
      board: "community",
      category: "general",
      title: "External source thread",
      content: "Sharing context from social media.",
      externalSourceUrl: "https://www.instagram.com/reel/RescueUpdate-1/?utm_source=test",
    });

    const source = await t.run(async (ctx) => {
      return ctx.db
        .query("externalSources")
        .withIndex("by_target_created", (q) => q.eq("targetType", "community_post").eq("targetId", String(threadId)))
        .order("desc")
        .first();
    });

    expect(source).toBeTruthy();
    expect(source?.platform).toBe("instagram");
    expect(source?.url).toBe("https://instagram.com/reel/RescueUpdate-1");

    const thread = await asUser.query(api.community.getThread, {
      id: threadId,
    });

    expect(thread?.externalSource).toBeTruthy();
    expect(thread?.externalSource?.domain).toBe("instagram.com");
    expect(thread?.externalSource?.url).toBe("https://instagram.com/reel/RescueUpdate-1");
  });
});
