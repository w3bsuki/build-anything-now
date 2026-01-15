import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

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
