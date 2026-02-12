import { describe, expect, it } from "vitest";
import { api, internal } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

describe("subscriptions lifecycle", () => {
  it("requires authentication for create", async () => {
    const t = createTestClient();

    await expect(
      t.mutation(api.subscriptions.create, {
        targetType: "user",
        targetId: "user_123",
        amount: 10,
        currency: "EUR",
        interval: "month",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  it("creates, lists, and cancels a subscription for the owner", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId, {
      verificationStatus: "community",
      riskLevel: "low",
    });

    const { clerkId: donorClerkId } = await seedUser(t);
    const asDonor = t.withIdentity(buildIdentity(donorClerkId));

    const created = await asDonor.mutation(api.subscriptions.create, {
      targetType: "case",
      targetId: String(caseId),
      amount: 12,
      currency: "EUR",
      interval: "month",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    expect(created.mode).toBe("preview");

    const listed = await asDonor.query(api.subscriptions.list, {});
    expect(listed.length).toBe(1);
    expect(listed[0]?.status).toBe("active");

    await asDonor.mutation(api.subscriptions.cancel, {
      id: listed[0]!._id,
    });

    const listedAfterCancel = await asDonor.query(api.subscriptions.list, {});
    expect(listedAfterCancel[0]?.status).toBe("canceled");
  });

  it("blocks cancellation from a different user", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId);

    const { clerkId: donorClerkId } = await seedUser(t);
    const asDonor = t.withIdentity(buildIdentity(donorClerkId));

    await asDonor.mutation(api.subscriptions.create, {
      targetType: "case",
      targetId: String(caseId),
      amount: 15,
      currency: "EUR",
      interval: "month",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    const donorSubscriptions = await asDonor.query(api.subscriptions.list, {});
    const targetSubscriptionId = donorSubscriptions[0]!._id;

    const { clerkId: otherClerkId } = await seedUser(t);
    const asOther = t.withIdentity(buildIdentity(otherClerkId));

    await expect(
      asOther.mutation(api.subscriptions.cancel, {
        id: targetSubscriptionId,
      }),
    ).rejects.toThrow("Unauthorized subscription access");
  });

  it("records recurring invoice payments as recurring donations", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t);
    const caseId = await seedCase(t, ownerId, {
      verificationStatus: "clinic",
      riskLevel: "low",
    });

    const { clerkId: donorClerkId } = await seedUser(t);
    const asDonor = t.withIdentity(buildIdentity(donorClerkId));

    await asDonor.mutation(api.subscriptions.create, {
      targetType: "case",
      targetId: String(caseId),
      amount: 15,
      currency: "EUR",
      interval: "month",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    const subscriptions = await asDonor.query(api.subscriptions.list, {});
    const subscription = subscriptions[0]!;
    expect(subscription.stripeSubscriptionId).toBeTruthy();

    await t.mutation(internal.subscriptions.ensureRecurringDonationFromInvoice, {
      stripeSubscriptionId: subscription.stripeSubscriptionId!,
      stripeInvoiceId: "in_0001",
      paymentIntentId: "pi_0001",
      amountPaidMinor: 1500,
      currency: "eur",
      eventId: "evt_invoice_paid_1",
    });

    await t.mutation(internal.donations.confirmPaymentFromWebhook, {
      paymentIntentId: "pi_0001",
      chargeId: "ch_0001",
      receiptUrl: "https://example.com/receipt/ch_0001",
      amountReceivedMinor: 1500,
      currency: "eur",
      eventId: "evt_payment_intent_succeeded_1",
    });

    const createdDonation = await t.run(async (ctx) => {
      return ctx.db
        .query("donations")
        .withIndex("by_stripe_invoice", (q) => q.eq("stripeInvoiceId", "in_0001"))
        .first();
    });

    expect(createdDonation).toBeTruthy();
    expect(createdDonation?.status).toBe("completed");
    expect(createdDonation?.donationKind).toBe("recurring");
    expect(createdDonation?.amount).toBe(15);
    expect(createdDonation?.currency).toBe("EUR");

    const updatedCase = await t.run(async (ctx) => ctx.db.get(caseId));
    expect(updatedCase?.fundraising.current).toBe(115);
  });
});
