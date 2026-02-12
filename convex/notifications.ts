import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { assertOwnership, getAuthUserId, optionalUser } from "./lib/auth";

const HOUR_MS = 60 * 60 * 1000;

const notificationTypeValidator = v.union(
    v.literal("donation_received"),
    v.literal("case_update"),
    v.literal("achievement_unlocked"),
    v.literal("campaign_ended"),
    v.literal("system"),
);

const pushPlatformValidator = v.union(
    v.literal("ios"),
    v.literal("android"),
    v.literal("web"),
    v.literal("unknown"),
);

const PUSH_STALE_ERRORS = new Set([
    "NotRegistered",
    "InvalidRegistration",
    "MismatchSenderId",
]);

function getHourWindowStart(now: number) {
    return Math.floor(now / HOUR_MS) * HOUR_MS;
}

function normalizeAppOrigin(value: string | undefined): string | null {
    if (!value) return null;

    try {
        const parsed = new URL(value);
        parsed.pathname = "";
        parsed.search = "";
        parsed.hash = "";
        return parsed.origin;
    } catch (_err) {
        return null;
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function upsertEmailBatchWindow(
    ctx: MutationCtx,
    args: { userId: Id<"users">; caseId: Id<"cases">; now: number },
) {
    const windowStartedAt = getHourWindowStart(args.now);
    const existing = await ctx.db
        .query("notificationEmailBatches")
        .withIndex("by_user_case_window", (q) =>
            q.eq("userId", args.userId).eq("caseId", args.caseId).eq("windowStartedAt", windowStartedAt),
        )
        .unique();

    if (existing) {
        await ctx.db.patch(existing._id, {
            notificationCount: existing.notificationCount + 1,
            updatedAt: args.now,
        });
        return false;
    }

    await ctx.db.insert("notificationEmailBatches", {
        userId: args.userId,
        caseId: args.caseId,
        windowStartedAt,
        notificationCount: 1,
        createdAt: args.now,
        updatedAt: args.now,
    });
    return true;
}

async function sendEmailViaResend(args: {
    to: string;
    title: string;
    message: string;
    caseId?: Id<"cases">;
}) {
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL?.trim();
    if (!resendApiKey || !fromEmail) {
        return { sent: false, reason: "provider_not_configured" as const };
    }

    const appOrigin = normalizeAppOrigin(process.env.APP_ORIGIN);
    const caseUrl = args.caseId && appOrigin ? `${appOrigin}/case/${args.caseId}` : null;
    const html = `<div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
  <h2 style="margin:0 0 12px;">${escapeHtml(args.title)}</h2>
  <p style="margin:0 0 16px;">${escapeHtml(args.message)}</p>
  ${caseUrl ? `<p style="margin:0;"><a href="${escapeHtml(caseUrl)}">Open case</a></p>` : ""}
</div>`;

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [args.to],
            subject: args.title,
            html,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        console.error("Resend notification email failed:", response.status, body);
        return { sent: false, reason: "provider_error" as const };
    }

    return { sent: true as const };
}

async function sendPushViaFcm(args: {
    tokens: Array<{ id: Id<"pushTokens">; token: string }>;
    title: string;
    message: string;
    caseId?: Id<"cases">;
    type: "donation_received" | "case_update" | "achievement_unlocked" | "campaign_ended" | "system";
}) {
    const fcmServerKey = process.env.FCM_SERVER_KEY?.trim();
    if (!fcmServerKey) {
        return {
            sent: false,
            staleTokenIds: [] as Id<"pushTokens">[],
            reason: "provider_not_configured" as const,
        };
    }

    const staleTokenIds: Id<"pushTokens">[] = [];
    let deliveredCount = 0;

    for (const tokenRow of args.tokens) {
        try {
            const response = await fetch("https://fcm.googleapis.com/fcm/send", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: `key=${fcmServerKey}`,
                },
                body: JSON.stringify({
                    to: tokenRow.token,
                    priority: "high",
                    notification: {
                        title: args.title,
                        body: args.message,
                    },
                    data: {
                        type: args.type,
                        ...(args.caseId ? { caseId: String(args.caseId) } : {}),
                    },
                }),
            });

            if (!response.ok) {
                console.error("FCM push send failed:", response.status, await response.text());
                continue;
            }

            const payload = (await response.json()) as {
                failure?: number;
                success?: number;
                results?: Array<{ error?: string }>;
            };

            if ((payload.success ?? 0) > 0) {
                deliveredCount += payload.success ?? 0;
            }

            const maybeError = payload.results?.[0]?.error;
            if (maybeError && PUSH_STALE_ERRORS.has(maybeError)) {
                staleTokenIds.push(tokenRow.id);
            }
        } catch (err) {
            console.error("FCM push send threw:", err);
        }
    }

    return {
        sent: deliveredCount > 0,
        staleTokenIds,
        reason: deliveredCount > 0 ? "ok" : "no_deliveries",
    } as const;
}

// Get all notifications for current user
export const getMyNotifications = query({
    args: {},
    handler: async (ctx) => {
        const user = await optionalUser(ctx);
        if (!user) return [];

        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

// Get unread notification count
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const user = await optionalUser(ctx);
        if (!user) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("read", false))
            .collect();

        return unread.length;
    },
});

export const createPushToken = mutation({
    args: {
        token: v.string(),
        platform: v.optional(pushPlatformValidator),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const token = args.token.trim();
        if (!token) throw new Error("Push token is required");

        const now = Date.now();
        const platform = args.platform ?? "unknown";

        const existingByUser = await ctx.db
            .query("pushTokens")
            .withIndex("by_user_token", (q) => q.eq("userId", userId).eq("token", token))
            .unique();

        if (existingByUser) {
            await ctx.db.patch(existingByUser._id, {
                platform,
                updatedAt: now,
            });
            return { id: existingByUser._id, created: false };
        }

        const existingByToken = await ctx.db
            .query("pushTokens")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (existingByToken) {
            await ctx.db.patch(existingByToken._id, {
                userId,
                platform,
                updatedAt: now,
            });
            return { id: existingByToken._id, created: false };
        }

        const id = await ctx.db.insert("pushTokens", {
            userId,
            token,
            platform,
            createdAt: now,
            updatedAt: now,
        });
        return { id, created: true };
    },
});

export const deletePushToken = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const token = args.token.trim();
        if (!token) return { removed: 0 };

        const existingByUser = await ctx.db
            .query("pushTokens")
            .withIndex("by_user_token", (q) => q.eq("userId", userId).eq("token", token))
            .unique();

        if (!existingByUser) return { removed: 0 };

        await ctx.db.delete(existingByUser._id);
        return { removed: 1 };
    },
});

export const deleteAllPushTokens = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        const tokens = await ctx.db
            .query("pushTokens")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        for (const token of tokens) {
            await ctx.db.delete(token._id);
        }

        return { removed: tokens.length };
    },
});

// Mark notification as read
export const markAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const notification = await ctx.db.get(args.id);
        if (!notification) throw new Error("Notification not found");
        assertOwnership(user, notification.userId, "notification");
        await ctx.db.patch(args.id, { read: true });
    },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
            .collect();

        for (const notification of unread) {
            await ctx.db.patch(notification._id, { read: true });
        }
    },
});

// Delete a notification
export const remove = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const notification = await ctx.db.get(args.id);
        if (!notification) throw new Error("Notification not found");
        assertOwnership(user, notification.userId, "notification");
        await ctx.db.delete(args.id);
    },
});

export const createCaseUpdateBatch = internalMutation({
    args: {
        recipientIds: v.array(v.id("users")),
        caseId: v.id("cases"),
        title: v.string(),
        message: v.string(),
        createdAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = args.createdAt ?? Date.now();
        const seen = new Set<string>();
        let createdCount = 0;

        for (const recipientId of args.recipientIds) {
            const key = String(recipientId);
            if (seen.has(key)) continue;
            seen.add(key);

            const notificationId = await ctx.db.insert("notifications", {
                userId: recipientId,
                type: "case_update",
                title: args.title,
                message: args.message,
                caseId: args.caseId,
                read: false,
                createdAt: now,
            });
            createdCount += 1;

            const settings = await ctx.db
                .query("userSettings")
                .withIndex("by_user", (q) => q.eq("userId", recipientId))
                .unique();

            const sendPush = settings?.pushNotifications ?? true;
            const allowsEmail = settings?.emailNotifications ?? true;
            const sendEmail = allowsEmail
                ? await upsertEmailBatchWindow(ctx, { userId: recipientId, caseId: args.caseId, now })
                : false;

            if (!sendPush && !sendEmail) continue;

            await ctx.scheduler.runAfter(0, internal.notifications.sendChannelNotification, {
                userId: recipientId,
                notificationId,
                type: "case_update",
                title: args.title,
                message: args.message,
                caseId: args.caseId,
                sendPush,
                sendEmail,
            });
        }

        return { createdCount };
    },
});

export const _internalGetChannelDeliveryData = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();
        const pushTokens = await ctx.db
            .query("pushTokens")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        return {
            userEmail: user?.email ?? null,
            emailNotifications: settings?.emailNotifications ?? true,
            pushNotifications: settings?.pushNotifications ?? true,
            pushTokens: pushTokens.map((token) => ({
                id: token._id,
                token: token.token,
                platform: token.platform,
            })),
        };
    },
});

export const _internalDeletePushToken = internalMutation({
    args: {
        id: v.id("pushTokens"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) return { deleted: false };
        await ctx.db.delete(args.id);
        return { deleted: true };
    },
});

export const sendChannelNotification = internalAction({
    args: {
        userId: v.id("users"),
        notificationId: v.id("notifications"),
        type: notificationTypeValidator,
        title: v.string(),
        message: v.string(),
        caseId: v.optional(v.id("cases")),
        sendPush: v.boolean(),
        sendEmail: v.boolean(),
    },
    handler: async (ctx, args) => {
        const deliveryData = await ctx.runQuery(internal.notifications._internalGetChannelDeliveryData, {
            userId: args.userId,
        });

        let emailResult: "skipped" | "sent" | "failed" = "skipped";
        if (args.sendEmail && deliveryData.emailNotifications && deliveryData.userEmail) {
            const result = await sendEmailViaResend({
                to: deliveryData.userEmail,
                title: args.title,
                message: args.message,
                caseId: args.caseId,
            });
            emailResult = result.sent ? "sent" : "failed";
        }

        let pushResult: "skipped" | "sent" | "failed" = "skipped";
        if (args.sendPush && deliveryData.pushNotifications && deliveryData.pushTokens.length > 0) {
            const result = await sendPushViaFcm({
                tokens: deliveryData.pushTokens,
                title: args.title,
                message: args.message,
                caseId: args.caseId,
                type: args.type,
            });
            pushResult = result.sent ? "sent" : "failed";

            for (const staleTokenId of result.staleTokenIds) {
                await ctx.runMutation(internal.notifications._internalDeletePushToken, {
                    id: staleTokenId,
                });
            }
        }

        return {
            notificationId: args.notificationId,
            emailResult,
            pushResult,
        };
    },
});
