import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "./lib/auth";

type SubscriptionStatus = "pending" | "active" | "past_due" | "canceled" | "unpaid";

function makeSubscriptionIdempotencyKey(
  userId: string,
  targetType: "case" | "user",
  targetId: string,
  amount: number,
  interval: "month" | "year",
) {
  const nowBucket = Math.floor(Date.now() / 10000);
  return `${userId}:${targetType}:${targetId}:${amount}:${interval}:${nowBucket}`;
}

function mapStripeStatus(status: string | undefined): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "incomplete":
    case "incomplete_expired":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "canceled":
      return "canceled";
    default:
      return "pending";
  }
}

function assertCaseDonationAllowed(caseDoc: {
  status: "active" | "funded" | "closed";
  lifecycleStage?: "active_treatment" | "seeking_adoption" | "closed_success" | "closed_transferred" | "closed_other";
  verificationStatus?: "unverified" | "community" | "clinic";
  riskLevel?: "low" | "medium" | "high";
}) {
  const lifecycleStage = caseDoc.lifecycleStage ?? "active_treatment";
  const closedStages = new Set(["closed_success", "closed_transferred", "closed_other"]);

  if (caseDoc.status === "closed" || closedStages.has(lifecycleStage)) {
    throw new Error("Donations are closed for this case");
  }

  if ((caseDoc.verificationStatus ?? "unverified") === "unverified" && (caseDoc.riskLevel ?? "low") === "high") {
    throw new Error("This case is currently blocked for donations pending review");
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      subscriptions.map(async (subscription) => {
        if (subscription.targetType === "case") {
          const caseDoc = await ctx.db.get(subscription.targetId as Id<"cases">);
          return {
            ...subscription,
            targetTitle: caseDoc?.title ?? null,
          };
        }

        const targetUser = await ctx.db.get(subscription.targetId as Id<"users">);
        return {
          ...subscription,
          targetTitle: targetUser?.displayName ?? targetUser?.name ?? null,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    targetType: v.union(v.literal("case"), v.literal("user")),
    targetId: v.string(),
    amount: v.number(),
    currency: v.string(),
    interval: v.optional(v.union(v.literal("month"), v.literal("year"))),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    if (!args.successUrl.startsWith("http") || !args.cancelUrl.startsWith("http")) {
      throw new Error("Invalid success/cancel URL");
    }

    const interval = args.interval ?? "month";
    let targetTitle = "Pawtreon";

    if (args.targetType === "case") {
      const caseDoc = await ctx.db.get(args.targetId as Id<"cases">);
      if (!caseDoc) throw new Error("Case not found");
      assertCaseDonationAllowed(caseDoc);
      targetTitle = caseDoc.title;
    } else {
      const targetUser = await ctx.db.get(args.targetId as Id<"users">);
      if (!targetUser) throw new Error("User not found");
      if (targetUser._id === userId) {
        throw new Error("You cannot subscribe to your own profile");
      }
      targetTitle = targetUser.displayName ?? targetUser.name;
    }

    const now = Date.now();
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId,
      targetType: args.targetType,
      targetId: args.targetId,
      status: "pending",
      amount: args.amount,
      currency: args.currency.toUpperCase(),
      interval,
      createdAt: now,
      updatedAt: now,
    });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      const previewStripeSubscriptionId = `preview_sub_${String(subscriptionId)}`;
      await ctx.db.patch(subscriptionId, {
        stripeSubscriptionId: previewStripeSubscriptionId,
        status: "active",
        updatedAt: now,
      });

      await ctx.db.insert("auditLogs", {
        actorId: userId,
        entityType: "subscription",
        entityId: String(subscriptionId),
        action: "subscription.preview_created",
        details: `targetType=${args.targetType};targetId=${args.targetId}`,
        createdAt: now,
      });

      return {
        mode: "preview" as const,
        subscriptionId,
        checkoutUrl: null,
      };
    }

    const StripeModule = await import("stripe");
    const stripe = new StripeModule.default(stripeSecret);
    const idempotencyKey = makeSubscriptionIdempotencyKey(
      String(userId),
      args.targetType,
      args.targetId,
      args.amount,
      interval,
    );

    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        success_url: args.successUrl,
        cancel_url: args.cancelUrl,
        client_reference_id: String(subscriptionId),
        line_items: [
          {
            price_data: {
              currency: args.currency.toLowerCase(),
              recurring: {
                interval,
              },
              product_data: {
                name: `Monthly support • ${targetTitle}`,
              },
              unit_amount: Math.round(args.amount * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          subscriptionId: String(subscriptionId),
          userId: String(userId),
          targetType: args.targetType,
          targetId: args.targetId,
        },
      },
      { idempotencyKey },
    );

    await ctx.db.patch(subscriptionId, {
      stripeCheckoutSessionId: session.id,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      actorId: userId,
      entityType: "subscription",
      entityId: String(subscriptionId),
      action: "subscription.checkout_session_created",
      details: `checkoutSessionId=${session.id}`,
      createdAt: now,
    });

    return {
      mode: "stripe" as const,
      subscriptionId,
      checkoutUrl: session.url,
    };
  },
});

export const cancel = mutation({
  args: {
    id: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const subscription = await ctx.db.get(args.id);
    if (!subscription) throw new Error("Subscription not found");
    if (subscription.userId !== userId) throw new Error("Unauthorized subscription access");

    if (subscription.status === "canceled") {
      return { ok: true, status: "canceled" as const };
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (
      stripeSecret &&
      subscription.stripeSubscriptionId &&
      !subscription.stripeSubscriptionId.startsWith("preview_sub_")
    ) {
      const StripeModule = await import("stripe");
      const stripe = new StripeModule.default(stripeSecret);
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "canceled",
      canceledAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      actorId: userId,
      entityType: "subscription",
      entityId: String(args.id),
      action: "subscription.canceled",
      details: subscription.stripeSubscriptionId
        ? `stripeSubscriptionId=${subscription.stripeSubscriptionId}`
        : undefined,
      createdAt: now,
    });

    return { ok: true, status: "canceled" as const };
  },
});

export const confirmCheckoutSessionFromWebhook = internalMutation({
  args: {
    sessionId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    stripeStatus: v.optional(v.string()),
    clientReferenceId: v.optional(v.string()),
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_checkout_session", (q) => q.eq("stripeCheckoutSessionId", args.sessionId))
      .first();

    if (!subscription && args.clientReferenceId) {
      subscription = await ctx.db.get(args.clientReferenceId as Id<"subscriptions">);
    }

    if (!subscription) {
      return { ok: false, reason: "subscription_not_found" as const };
    }

    const nextStatus = mapStripeStatus(args.stripeStatus ?? "active");
    const patch: Partial<Doc<"subscriptions">> = { updatedAt: now, status: nextStatus };

    if (args.stripeSubscriptionId) {
      patch.stripeSubscriptionId = args.stripeSubscriptionId;
    }

    if (nextStatus === "canceled") {
      patch.canceledAt = subscription.canceledAt ?? now;
    }

    await ctx.db.patch(subscription._id, patch);

    await ctx.db.insert("auditLogs", {
      actorId: undefined,
      entityType: "subscription",
      entityId: String(subscription._id),
      action: "subscription.checkout_confirmed",
      details: `checkoutSessionId=${args.sessionId}`,
      metadataJson: JSON.stringify({ eventId: args.eventId ?? null }),
      createdAt: now,
    });

    return { ok: true, reason: "updated" as const };
  },
});

export const syncStatusFromWebhook = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeStatus: v.string(),
    canceledAtMs: v.optional(v.number()),
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();

    if (!subscription) {
      return { ok: false, reason: "subscription_not_found" as const };
    }

    const now = Date.now();
    const nextStatus = mapStripeStatus(args.stripeStatus);

    const patch: Partial<Doc<"subscriptions">> = {
      status: nextStatus,
      updatedAt: now,
    };

    if (nextStatus === "canceled") {
      patch.canceledAt = args.canceledAtMs ?? subscription.canceledAt ?? now;
    }

    await ctx.db.patch(subscription._id, patch);

    await ctx.db.insert("auditLogs", {
      actorId: undefined,
      entityType: "subscription",
      entityId: String(subscription._id),
      action: "subscription.status_synced",
      details: `stripeStatus=${args.stripeStatus}`,
      metadataJson: JSON.stringify({ eventId: args.eventId ?? null }),
      createdAt: now,
    });

    return { ok: true, reason: "updated" as const };
  },
});

export const ensureRecurringDonationFromInvoice = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeInvoiceId: v.string(),
    paymentIntentId: v.optional(v.string()),
    amountPaidMinor: v.optional(v.number()),
    currency: v.optional(v.string()),
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();

    if (!subscription) {
      return { ok: false, reason: "subscription_not_found" as const };
    }

    const existing = await ctx.db
      .query("donations")
      .withIndex("by_stripe_invoice", (q) => q.eq("stripeInvoiceId", args.stripeInvoiceId))
      .first();

    if (existing) {
      const patch: Partial<Doc<"donations">> = {};
      if (!existing.subscriptionId) patch.subscriptionId = subscription._id;
      if (!existing.stripeSubscriptionId) patch.stripeSubscriptionId = args.stripeSubscriptionId;
      if (!existing.stripePaymentIntentId && args.paymentIntentId) {
        patch.stripePaymentIntentId = args.paymentIntentId;
        patch.transactionId = args.paymentIntentId;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existing._id, patch);
      }
      return { ok: true, reason: "already_exists" as const, donationId: existing._id };
    }

    const now = Date.now();
    const amount =
      args.amountPaidMinor !== undefined
        ? Number((args.amountPaidMinor / 100).toFixed(2))
        : Number(subscription.amount.toFixed(2));
    const currency = (args.currency ?? subscription.currency).toUpperCase();
    const caseId = subscription.targetType === "case" ? (subscription.targetId as Id<"cases">) : undefined;

    const donationId = await ctx.db.insert("donations", {
      userId: subscription.userId,
      caseId,
      amount,
      currency,
      status: "pending",
      paymentProvider: "stripe",
      anonymous: false,
      donationKind: "recurring",
      subscriptionId: subscription._id,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeInvoiceId: args.stripeInvoiceId,
      stripePaymentIntentId: args.paymentIntentId,
      transactionId: args.paymentIntentId,
      createdAt: now,
    });

    await ctx.db.patch(subscription._id, {
      status: "active",
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      actorId: undefined,
      entityType: "donation",
      entityId: String(donationId),
      action: "donation.recurring_invoice_recorded",
      details: `invoiceId=${args.stripeInvoiceId}`,
      metadataJson: JSON.stringify({ eventId: args.eventId ?? null }),
      createdAt: now,
    });

    return { ok: true, reason: "created" as const, donationId };
  },
});
