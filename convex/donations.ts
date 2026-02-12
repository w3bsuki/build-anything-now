import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireUser } from "./lib/auth";

function makeReceiptId() {
  const token = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PT-${token}`;
}

function makeIdempotencyKey(userId: string, amount: number, caseId?: string | null, campaignId?: string | null) {
  const nowBucket = Math.floor(Date.now() / 10000);
  return `${userId}:${amount}:${caseId ?? "none"}:${campaignId ?? "none"}:${nowBucket}`;
}

// Get all donations for current user
export const getMyDonations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const enrichedDonations = await Promise.all(
      donations.map(async (donation) => {
        let caseName = null;
        let caseImage = null;

        if (donation.caseId) {
          const caseData = await ctx.db.get(donation.caseId);
          if (caseData) {
            caseName = caseData.title;
            if (caseData.images.length > 0) {
              caseImage = await ctx.storage.getUrl(caseData.images[0]);
            }
          }
        }

        return {
          ...donation,
          caseName,
          caseImage,
        };
      })
    );

    return enrichedDonations;
  },
});

// Get donation stats for current user
export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { totalDonations: 0, totalAmount: 0, animalsHelped: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { totalDonations: 0, totalAmount: 0, animalsHelped: 0 };

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueCases = new Set(donations.filter((d) => d.caseId).map((d) => d.caseId));

    return {
      totalDonations: donations.length,
      totalAmount,
      animalsHelped: uniqueCases.size,
    };
  },
});

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

// Backward-compatible preview donation create
export const create = mutation({
  args: {
    caseId: v.optional(v.id("cases")),
    campaignId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    message: v.optional(v.string()),
    anonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.caseId) {
      const caseDoc = await ctx.db.get(args.caseId);
      if (!caseDoc) throw new Error("Case not found");
      assertCaseDonationAllowed(caseDoc);
    }

    return await ctx.db.insert("donations", {
      userId: user._id,
      caseId: args.caseId,
      campaignId: args.campaignId,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      paymentProvider: "manual",
      message: args.message,
      anonymous: args.anonymous,
      createdAt: Date.now(),
    });
  },
});

// Hosted Stripe Checkout path (production-ready confirmation UX).
export const createCheckoutSession = mutation({
  args: {
    caseId: v.optional(v.id("cases")),
    campaignRefId: v.optional(v.id("campaigns")),
    amount: v.number(),
    currency: v.string(),
    message: v.optional(v.string()),
    anonymous: v.boolean(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    if (!args.successUrl.startsWith("http") || !args.cancelUrl.startsWith("http")) {
      throw new Error("Invalid success/cancel URL");
    }

    let caseTitle = "Pawtreon Rescue";
    if (args.caseId) {
      const caseDoc = await ctx.db.get(args.caseId);
      if (!caseDoc) throw new Error("Case not found");
      assertCaseDonationAllowed(caseDoc);
      caseTitle = caseDoc.title;
    }

    const idempotencyKey = makeIdempotencyKey(
      String(user._id),
      args.amount,
      args.caseId ? String(args.caseId) : null,
      args.campaignRefId ? String(args.campaignRefId) : null
    );

    const donationId = await ctx.db.insert("donations", {
      userId: user._id,
      caseId: args.caseId,
      campaignId: args.campaignRefId ? String(args.campaignRefId) : undefined,
      campaignRefId: args.campaignRefId,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      paymentProvider: "stripe",
      message: args.message,
      anonymous: args.anonymous,
      idempotencyKey,
      createdAt: Date.now(),
    });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return {
        mode: "preview" as const,
        donationId,
        checkoutUrl: null,
      };
    }

    const StripeModule = await import("stripe");
    const stripe = new StripeModule.default(stripeSecret);

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: args.successUrl,
        cancel_url: args.cancelUrl,
        client_reference_id: String(donationId),
        line_items: [
          {
            price_data: {
              currency: args.currency.toLowerCase(),
              product_data: {
                name: `Donation • ${caseTitle}`,
              },
              unit_amount: Math.round(args.amount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          donationId: String(donationId),
          userId: String(user._id),
          caseId: args.caseId ? String(args.caseId) : "",
          campaignRefId: args.campaignRefId ? String(args.campaignRefId) : "",
        },
      },
      {
        idempotencyKey,
      }
    );

    await ctx.db.patch(donationId, {
      stripeCheckoutSessionId: session.id,
      transactionId: session.id,
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "donation",
      entityId: String(donationId),
      action: "donation.checkout_session_created",
      details: `checkoutSessionId=${session.id}`,
      createdAt: Date.now(),
    });

    return {
      mode: "stripe" as const,
      donationId,
      checkoutUrl: session.url,
    };
  },
});

export const confirmPaymentFromWebhook = internalMutation({
  args: {
    paymentIntentId: v.string(),
    chargeId: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    amountReceivedMinor: v.optional(v.number()),
    currency: v.optional(v.string()),
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_stripe_payment_intent", (q) => q.eq("stripePaymentIntentId", args.paymentIntentId))
      .first();

    if (!donation) {
      return { ok: false, reason: "donation_not_found" as const };
    }

    const now = Date.now();

    if (donation.status === "completed") {
      const patch: {
        receiptId?: string;
        stripeChargeId?: string;
        transactionId?: string;
        receiptUrl?: string;
      } = {};

      if (!donation.receiptId) {
        patch.receiptId = makeReceiptId();
      }
      if (!donation.stripeChargeId && args.chargeId) {
        patch.stripeChargeId = args.chargeId;
      }
      if (!donation.transactionId && args.chargeId) {
        patch.transactionId = args.chargeId;
      }
      if (!donation.receiptUrl && args.receiptUrl) {
        patch.receiptUrl = args.receiptUrl;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(donation._id, patch);
      }

      return { ok: true, reason: "already_completed" as const };
    }

    const amount = args.amountReceivedMinor !== undefined ? args.amountReceivedMinor / 100 : donation.amount;
    const currency = args.currency?.toUpperCase() ?? donation.currency;

    const patch: {
      status: "completed";
      amount: number;
      currency: string;
      stripeChargeId?: string;
      transactionId?: string;
      completedAt: number;
      receiptId: string;
      receiptUrl?: string;
    } = {
      status: "completed",
      amount,
      currency,
      completedAt: now,
      receiptId: donation.receiptId ?? makeReceiptId(),
    };

    if (args.chargeId) {
      patch.stripeChargeId = args.chargeId;
    }

    const transactionId = args.chargeId ?? donation.transactionId;
    if (transactionId) {
      patch.transactionId = transactionId;
    }

    if (!donation.receiptUrl && args.receiptUrl) {
      patch.receiptUrl = args.receiptUrl;
    }

    await ctx.db.patch(donation._id, patch);

    const roundedAmount = Number(amount.toFixed(2));

    if (donation.caseId) {
      const caseDoc = await ctx.db.get(donation.caseId);
      if (caseDoc) {
        await ctx.db.patch(donation.caseId, {
          fundraising: {
            ...caseDoc.fundraising,
            current: Number((caseDoc.fundraising.current + roundedAmount).toFixed(2)),
          },
          status: caseDoc.fundraising.current + roundedAmount >= caseDoc.fundraising.goal ? "funded" : caseDoc.status,
        });

        if (caseDoc.userId !== donation.userId) {
          const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", caseDoc.userId))
            .unique();

          const lang = (settings?.language ?? "en").toLowerCase();
          const isBg = lang.startsWith("bg");

          const title = isBg ? "Получено дарение" : "Donation received";
          const message = isBg
            ? `Получихте дарение от ${roundedAmount} ${currency} за ${caseDoc.title}`
            : `${roundedAmount} ${currency} received for ${caseDoc.title}`;

          await ctx.db.insert("notifications", {
            userId: caseDoc.userId,
            type: "donation_received",
            title,
            message,
            caseId: donation.caseId,
            read: false,
            createdAt: now,
          });
        }
      }
    }

    await ctx.db.insert("auditLogs", {
      actorId: undefined,
      entityType: "donation",
      entityId: String(donation._id),
      action: "donation.payment_confirmed",
      details: `paymentIntentId=${args.paymentIntentId}`,
      metadataJson: JSON.stringify({ eventId: args.eventId ?? null }),
      createdAt: now,
    });

    return { ok: true, reason: "completed" as const };
  },
});

export const confirmCheckoutSessionFromWebhook = internalMutation({
  args: {
    sessionId: v.string(),
    paymentIntentId: v.optional(v.string()),
    chargeId: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    amountReceivedMinor: v.optional(v.number()),
    currency: v.optional(v.string()),
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_stripe_checkout_session", (q) => q.eq("stripeCheckoutSessionId", args.sessionId))
      .first();

    if (!donation) {
      return { ok: false, reason: "donation_not_found" as const };
    }

    const now = Date.now();

    if (donation.status === "completed") {
      const patch: {
        receiptId?: string;
        stripePaymentIntentId?: string;
        stripeChargeId?: string;
        transactionId?: string;
        receiptUrl?: string;
      } = {};

      if (!donation.receiptId) {
        patch.receiptId = makeReceiptId();
      }

      if (!donation.stripePaymentIntentId && args.paymentIntentId) {
        patch.stripePaymentIntentId = args.paymentIntentId;
      }

      if (!donation.stripeChargeId && args.chargeId) {
        patch.stripeChargeId = args.chargeId;
      }

      if (!donation.transactionId) {
        const transactionId = args.paymentIntentId ?? args.chargeId;
        if (transactionId) {
          patch.transactionId = transactionId;
        }
      }

      if (!donation.receiptUrl && args.receiptUrl) {
        patch.receiptUrl = args.receiptUrl;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(donation._id, patch);
      }

      return { ok: true, reason: "already_completed" as const };
    }

    const amount = args.amountReceivedMinor !== undefined ? args.amountReceivedMinor / 100 : donation.amount;
    const currency = args.currency?.toUpperCase() ?? donation.currency;
    const roundedAmount = Number(amount.toFixed(2));

    const patch: {
      status: "completed";
      amount: number;
      currency: string;
      stripeCheckoutSessionId: string;
      stripePaymentIntentId?: string;
      stripeChargeId?: string;
      transactionId?: string;
      completedAt: number;
      receiptId: string;
      receiptUrl?: string;
    } = {
      status: "completed",
      amount,
      currency,
      stripeCheckoutSessionId: args.sessionId,
      completedAt: now,
      receiptId: donation.receiptId ?? makeReceiptId(),
    };

    if (args.paymentIntentId) {
      patch.stripePaymentIntentId = args.paymentIntentId;
    } else if (donation.stripePaymentIntentId) {
      patch.stripePaymentIntentId = donation.stripePaymentIntentId;
    }

    if (args.chargeId) {
      patch.stripeChargeId = args.chargeId;
    }

    const transactionId = args.paymentIntentId ?? args.chargeId ?? donation.transactionId;
    if (transactionId) {
      patch.transactionId = transactionId;
    }

    if (!donation.receiptUrl && args.receiptUrl) {
      patch.receiptUrl = args.receiptUrl;
    }

    await ctx.db.patch(donation._id, patch);

    if (donation.caseId) {
      const caseDoc = await ctx.db.get(donation.caseId);
      if (caseDoc) {
        await ctx.db.patch(donation.caseId, {
          fundraising: {
            ...caseDoc.fundraising,
            current: Number((caseDoc.fundraising.current + roundedAmount).toFixed(2)),
          },
          status: caseDoc.fundraising.current + roundedAmount >= caseDoc.fundraising.goal ? "funded" : caseDoc.status,
        });

        if (caseDoc.userId !== donation.userId) {
          const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", caseDoc.userId))
            .unique();

          const lang = (settings?.language ?? "en").toLowerCase();
          const isBg = lang.startsWith("bg");

          const title = isBg ? "Получено дарение" : "Donation received";
          const message = isBg
            ? `Получихте дарение от ${roundedAmount} ${currency} за ${caseDoc.title}`
            : `${roundedAmount} ${currency} received for ${caseDoc.title}`;

          await ctx.db.insert("notifications", {
            userId: caseDoc.userId,
            type: "donation_received",
            title,
            message,
            caseId: donation.caseId,
            read: false,
            createdAt: now,
          });
        }
      }
    }

    await ctx.db.insert("auditLogs", {
      actorId: undefined,
      entityType: "donation",
      entityId: String(donation._id),
      action: "donation.checkout_completed",
      details: `checkoutSessionId=${args.sessionId}`,
      metadataJson: JSON.stringify({ eventId: args.eventId ?? null }),
      createdAt: now,
    });

    return { ok: true, reason: "completed" as const };
  },
});

export const markPaymentFailedFromWebhook = internalMutation({
  args: {
    paymentIntentId: v.string(),
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_stripe_payment_intent", (q) => q.eq("stripePaymentIntentId", args.paymentIntentId))
      .first();

    if (!donation) {
      return { ok: false, reason: "donation_not_found" as const };
    }

    if (donation.status === "completed") {
      return { ok: true, reason: "already_completed" as const };
    }

    await ctx.db.patch(donation._id, {
      status: "failed",
      failedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: undefined,
      entityType: "donation",
      entityId: String(donation._id),
      action: "donation.payment_failed",
      details: `paymentIntentId=${args.paymentIntentId}`,
      metadataJson: JSON.stringify({ eventId: args.eventId ?? null }),
      createdAt: Date.now(),
    });

    return { ok: true, reason: "failed_marked" as const };
  },
});

// Local preview helper: confirm pending donation when Stripe keys are not configured.
export const confirmPreviewDonation = mutation({
  args: {
    donationId: v.id("donations"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (process.env.STRIPE_SECRET_KEY) {
      throw new Error("Preview confirmation is disabled when Stripe is configured");
    }

    const donation = await ctx.db.get(args.donationId);
    if (!donation) throw new Error("Donation not found");
    if (donation.userId !== user._id) throw new Error("Unauthorized donation access");

    if (donation.status === "completed") {
      return { ok: true, reason: "already_completed" as const };
    }

    const now = Date.now();
    await ctx.db.patch(args.donationId, {
      status: "completed",
      completedAt: now,
      receiptId: donation.receiptId ?? makeReceiptId(),
    });

    if (donation.caseId) {
      const caseDoc = await ctx.db.get(donation.caseId);
      if (caseDoc) {
        await ctx.db.patch(donation.caseId, {
          fundraising: {
            ...caseDoc.fundraising,
            current: Number((caseDoc.fundraising.current + donation.amount).toFixed(2)),
          },
          status: caseDoc.fundraising.current + donation.amount >= caseDoc.fundraising.goal ? "funded" : caseDoc.status,
        });
      }
    }

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "donation",
      entityId: String(args.donationId),
      action: "donation.preview_confirmed",
      createdAt: now,
    });

    return { ok: true, reason: "completed" as const };
  },
});


