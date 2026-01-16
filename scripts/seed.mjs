import { ConvexClient } from "convex/browser";

const client = new ConvexClient(process.env.VITE_CONVEX_URL || "https://fearless-dalmatian-888.convex.cloud");

async function seed() {
  try {
    const result = await client.mutation("devSeed:seedAll", {
      secret: "pawssafe-dev-2026",
      reset: true
    });
    console.log("Seed completed:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Seed failed:", error);
  }
  process.exit(0);
}

seed();
