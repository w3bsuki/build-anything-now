/// <reference types="vite/client" />

"use node";

import { convexTest } from "convex-test";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";

const modules = import.meta.glob("../**/*.ts");

export type TestClient = ReturnType<typeof createTestClient>;

type UserRole = "user" | "volunteer" | "clinic" | "admin";
type CaseStatus = "active" | "funded" | "closed";
type CaseLifecycleStage =
  | "active_treatment"
  | "seeking_adoption"
  | "closed_success"
  | "closed_transferred"
  | "closed_other";
type VerificationStatus = "unverified" | "community" | "clinic";
type RiskLevel = "low" | "medium" | "high";

export function createTestClient() {
  return convexTest(schema, modules);
}

export function buildIdentity(clerkId: string) {
  return {
    subject: clerkId,
    tokenIdentifier: `${clerkId}|test`,
    issuer: "https://clerk.test",
    name: clerkId,
  };
}

export async function seedUser(
  t: TestClient,
  args?: {
    clerkId?: string;
    role?: UserRole;
    verificationLevel?: VerificationStatus | "partner";
    linkedPetServiceId?: Id<"petServices">;
  },
) {
  const now = Date.now();
  const clerkId = args?.clerkId ?? `clerk_${Math.random().toString(36).slice(2, 10)}`;

  const userId = await t.run(async (ctx) => {
    return ctx.db.insert("users", {
      clerkId,
      name: `User ${clerkId}`,
      email: `${clerkId}@example.com`,
      role: args?.role ?? "user",
      createdAt: now,
      verificationLevel: args?.verificationLevel,
      linkedPetServiceId: args?.linkedPetServiceId,
    });
  });

  return { userId, clerkId };
}

export async function seedClinic(
  t: TestClient,
  args?: {
    ownerId?: Id<"users">;
    verified?: boolean;
  },
) {
  return t.run(async (ctx) => {
    return ctx.db.insert("clinics", {
      name: "Test Clinic",
      city: "Sofia",
      address: "Test Address 1",
      phone: "+3590000000",
      is24h: true,
      specializations: ["emergency"],
      verified: args?.verified ?? true,
      ownerId: args?.ownerId,
      claimedAt: Date.now(),
    });
  });
}

export async function seedCase(
  t: TestClient,
  userId: Id<"users">,
  args?: {
    status?: CaseStatus;
    lifecycleStage?: CaseLifecycleStage;
    verificationStatus?: VerificationStatus;
    riskLevel?: RiskLevel;
    clinicId?: Id<"clinics">;
    title?: string;
  },
) {
  return t.run(async (ctx) => {
    const now = Date.now();
    return ctx.db.insert("cases", {
      userId,
      type: "urgent",
      category: "medical",
      language: "en",
      title: args?.title ?? "Test case",
      description: "Test description",
      story: "Test story",
      images: [],
      location: {
        city: "Sofia",
        neighborhood: "Center",
      },
      clinicId: args?.clinicId,
      verificationStatus: args?.verificationStatus ?? "community",
      foundAt: now,
      fundraising: {
        goal: 1000,
        current: 100,
        currency: "EUR",
      },
      status: args?.status ?? "active",
      lifecycleStage: args?.lifecycleStage ?? "active_treatment",
      riskLevel: args?.riskLevel ?? "low",
      updates: [],
      createdAt: now,
    });
  });
}
