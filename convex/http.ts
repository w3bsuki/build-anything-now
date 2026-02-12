import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
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
  pathPrefix: "/share/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length !== 3 || parts[0] !== "share" || parts[1] !== "case") {
      return new Response("Not found", { status: 404 });
    }

    const caseId = parts[2] as Id<"cases">;
    const locale = url.searchParams.get("locale") ?? undefined;

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    let meta:
      | { id: Id<"cases">; title: string; description: string; imageUrl: string | null }
      | null = null;

    try {
      meta = await ctx.runQuery(api.cases.getCaseShareMeta, {
        id: caseId,
        locale,
      });
    } catch (_err) {
      meta = null;
    }

    if (!meta) {
      return new Response("Not found", { status: 404 });
    }

    let appUrl: string | null = null;
    const rawAppOrigin = process.env.APP_ORIGIN;

    if (rawAppOrigin) {
      try {
        const parsed = new URL(rawAppOrigin);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          parsed.pathname = "";
          parsed.search = "";
          parsed.hash = "";
          appUrl = `${parsed.origin}/case/${meta.id}`;
        }
      } catch (_err) {
        appUrl = null;
      }
    }
    const shareUrl = url.toString();

    const title = meta.title || "Pawtreon";
    const description = meta.description || "Rescue case on Pawtreon";
    const imageUrl = meta.imageUrl ?? null;

    const ogUrl = appUrl ?? shareUrl;
    const twitterCard = imageUrl ? "summary_large_image" : "summary";

    const html = `<!doctype html>
<html lang="${escapeHtml(locale ?? "en")}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Pawtreon" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(ogUrl)}" />
    ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ""}
    ${imageUrl ? `<meta property="og:image:alt" content="${escapeHtml(title)}" />` : ""}

    <meta name="twitter:card" content="${twitterCard}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ""}

    ${appUrl ? `<link rel="canonical" href="${escapeHtml(appUrl)}" />` : ""}
    ${appUrl ? `<meta http-equiv="refresh" content="0; url=${escapeHtml(appUrl)}" />` : ""}
    ${appUrl ? `<script>window.location.replace(${JSON.stringify(appUrl)});</script>` : ""}
  </head>
  <body>
    <main style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; line-height: 1.4;">
      <h1 style="margin: 0 0 12px;">${escapeHtml(title)}</h1>
      <p style="margin: 0 0 16px; color: #555;">${escapeHtml(description)}</p>
      ${
        appUrl
          ? `<p style="margin: 0;"><a href="${escapeHtml(appUrl)}">Open in Pawtreon</a></p>`
          : `<p style="margin: 0;">Missing server configuration: APP_ORIGIN</p>`
      }
    </main>
  </body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }),
});

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



