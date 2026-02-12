import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import Stripe from "stripe";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    email_addresses?: Array<{ email_address: string }>;
  };
};

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecret || !stripeWebhookSecret) {
      console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
      return new Response("Server configuration error", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const payload = await request.text();
    const stripe = new Stripe(stripeSecret);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
    } catch (err) {
      console.error("Stripe webhook verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const latestCharge = paymentIntent.latest_charge;
      const chargeId = typeof latestCharge === "string" ? latestCharge : latestCharge?.id;
      let receiptUrl: string | undefined;

      if (typeof latestCharge === "string" && latestCharge) {
        try {
          const charge = await stripe.charges.retrieve(latestCharge);
          receiptUrl = charge.receipt_url ?? undefined;
        } catch (err) {
          console.warn("Could not retrieve Charge for receipt:", err);
        }
      } else if (latestCharge && typeof latestCharge !== "string") {
        receiptUrl = latestCharge.receipt_url ?? undefined;
      }

      await ctx.runMutation(internal.donations.confirmPaymentFromWebhook, {
        paymentIntentId: paymentIntent.id,
        chargeId,
        receiptUrl,
        amountReceivedMinor: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        eventId: event.id,
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await ctx.runMutation(internal.donations.markPaymentFailedFromWebhook, {
        paymentIntentId: paymentIntent.id,
        eventId: event.id,
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;

      let chargeId: string | undefined;
      let receiptUrl: string | undefined;

      if (paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ["latest_charge"],
          });

          const latestCharge = paymentIntent.latest_charge;
          if (typeof latestCharge === "string") {
            chargeId = latestCharge;
          } else if (latestCharge && typeof latestCharge !== "string") {
            chargeId = latestCharge.id;
            receiptUrl = latestCharge.receipt_url ?? undefined;
          }
        } catch (err) {
          console.warn("Could not retrieve PaymentIntent for receipt:", err);
        }
      }

      await ctx.runMutation(internal.donations.confirmCheckoutSessionFromWebhook, {
        sessionId: session.id,
        paymentIntentId,
        chargeId,
        receiptUrl,
        amountReceivedMinor: session.amount_total ?? undefined,
        currency: session.currency ?? undefined,
        eventId: event.id,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET");
      return new Response("Server configuration error", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();
    const wh = new Webhook(webhookSecret);

    let evt: ClerkWebhookEvent;
    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsert, {
          clerkId: evt.data.id,
          name: `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() || "User",
          email: evt.data.email_addresses?.[0]?.email_address || "",
          avatar: evt.data.image_url || undefined,
        });
        break;
      case "user.deleted":
        console.log("User deleted:", evt.data.id);
        break;
      default:
        console.log("Unhandled Clerk webhook event:", evt.type);
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;



