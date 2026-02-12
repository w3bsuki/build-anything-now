import { describe, expect, it } from "vitest";
import { api, internal } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

describe("notifications channels", () => {
  it("requires authentication for push token registration", async () => {
    const t = createTestClient();

    await expect(
      t.mutation(api.notifications.createPushToken, {
        token: "push_token_unauthed",
        platform: "android",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  it("upserts push tokens and rebinds token ownership", async () => {
    const t = createTestClient();
    const { userId: firstUserId, clerkId: firstClerkId } = await seedUser(t, { clerkId: "push_owner_1" });
    const { userId: secondUserId, clerkId: secondClerkId } = await seedUser(t, { clerkId: "push_owner_2" });

    const asFirst = t.withIdentity(buildIdentity(firstClerkId));
    const asSecond = t.withIdentity(buildIdentity(secondClerkId));

    await asFirst.mutation(api.notifications.createPushToken, {
      token: "shared_push_token",
      platform: "ios",
    });

    await asFirst.mutation(api.notifications.createPushToken, {
      token: "shared_push_token",
      platform: "android",
    });

    const afterFirstUserUpserts = await t.run(async (ctx) => {
      return ctx.db
        .query("pushTokens")
        .withIndex("by_token", (q) => q.eq("token", "shared_push_token"))
        .collect();
    });

    expect(afterFirstUserUpserts).toHaveLength(1);
    expect(afterFirstUserUpserts[0]?.userId).toBe(firstUserId);
    expect(afterFirstUserUpserts[0]?.platform).toBe("android");

    await asSecond.mutation(api.notifications.createPushToken, {
      token: "shared_push_token",
      platform: "ios",
    });

    const afterRebind = await t.run(async (ctx) => {
      return ctx.db
        .query("pushTokens")
        .withIndex("by_token", (q) => q.eq("token", "shared_push_token"))
        .collect();
    });

    expect(afterRebind).toHaveLength(1);
    expect(afterRebind[0]?.userId).toBe(secondUserId);
  });

  it("creates case update notifications and throttles email batch windows hourly", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t, { clerkId: "case_owner_for_batch" });
    const caseId = await seedCase(t, ownerId, { title: "Case update throttle check" });
    const { userId: recipientId } = await seedUser(t, { clerkId: "case_update_recipient" });

    await t.run(async (ctx) => {
      await ctx.db.insert("userSettings", {
        userId: recipientId,
        emailNotifications: true,
        pushNotifications: false,
        donationReminders: true,
        marketingEmails: false,
        language: "en",
        currency: "EUR",
      });
    });

    const firstCreatedAt = 1_700_000_000_000;
    const secondCreatedAt = firstCreatedAt + 15 * 60 * 1000;

    await t.mutation(internal.notifications.createCaseUpdateBatch, {
      recipientIds: [recipientId],
      caseId,
      title: "Case update",
      message: "First update",
      createdAt: firstCreatedAt,
    });

    await t.mutation(internal.notifications.createCaseUpdateBatch, {
      recipientIds: [recipientId, recipientId],
      caseId,
      title: "Case update",
      message: "Second update",
      createdAt: secondCreatedAt,
    });

    const notifications = await t.run(async (ctx) => {
      return ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", recipientId))
        .collect();
    });

    const batches = await t.run(async (ctx) => {
      return ctx.db
        .query("notificationEmailBatches")
        .withIndex("by_user_case_window", (q) =>
          q.eq("userId", recipientId).eq("caseId", caseId).eq("windowStartedAt", Math.floor(firstCreatedAt / 3_600_000) * 3_600_000),
        )
        .collect();
    });

    expect(notifications).toHaveLength(2);
    expect(batches).toHaveLength(1);
    expect(batches[0]?.notificationCount).toBe(2);
  });

  it("skips email batch window creation when recipient disabled email notifications", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t, { clerkId: "case_owner_email_off" });
    const caseId = await seedCase(t, ownerId, { title: "Case update no email batch" });
    const { userId: recipientId } = await seedUser(t, { clerkId: "recipient_email_off" });

    await t.run(async (ctx) => {
      await ctx.db.insert("userSettings", {
        userId: recipientId,
        emailNotifications: false,
        pushNotifications: false,
        donationReminders: true,
        marketingEmails: false,
        language: "en",
        currency: "EUR",
      });
    });

    await t.mutation(internal.notifications.createCaseUpdateBatch, {
      recipientIds: [recipientId],
      caseId,
      title: "Case update",
      message: "No email update",
      createdAt: 1_700_000_000_000,
    });

    const batches = await t.run(async (ctx) => {
      return ctx.db
        .query("notificationEmailBatches")
        .withIndex("by_user_case_window", (q) => q.eq("userId", recipientId).eq("caseId", caseId).eq("windowStartedAt", 1_699_999_200_000))
        .collect();
    });

    expect(batches).toHaveLength(0);
  });
});

