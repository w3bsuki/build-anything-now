import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { buildIdentity, createTestClient, seedCase, seedUser, type TestClient } from "./testHelpers";

async function seedVolunteerProfile(
  t: TestClient,
  args: {
    userId: Id<"users">;
    city: string;
    availability: "available" | "busy" | "offline";
    capabilities: string[];
    bio?: string;
  },
) {
    await t.run(async (ctx) => {
      await ctx.db.patch(args.userId, {
        role: "volunteer",
        userType: "volunteer",
        volunteerCity: args.city,
        volunteerAvailability: args.availability,
        volunteerCapabilities: args.capabilities,
      });

    await ctx.db.insert("volunteers", {
      userId: args.userId,
      bio: args.bio ?? `Volunteer in ${args.city}`,
      location: args.city,
      rating: 4.7,
      memberSince: "2024",
      isTopVolunteer: false,
      badges: [],
      stats: {
        animalsHelped: 5,
        adoptions: 1,
        campaigns: 0,
        donationsReceived: 0,
        hoursVolunteered: 12,
      },
      createdAt: Date.now(),
    });
  });
}

describe("volunteers coordination", () => {
  it("creates volunteer profile with offline default and returns existing profile on repeat", async () => {
    const t = createTestClient();
    const { userId, clerkId } = await seedUser(t, { clerkId: "volunteer_create_owner" });
    const asOwner = t.withIdentity(buildIdentity(clerkId));

    await t.run(async (ctx) => {
      await ctx.db.patch(userId, {
        volunteerCapabilities: ["transport", "events"],
        volunteerAvailability: "available",
      });
    });

    const created = await asOwner.mutation(api.volunteers.create, {
      bio: "Ready to help with rescue runs around Sofia.",
      location: "Sofia",
    });

    expect(created.created).toBe(true);

    const userAfterCreate = await t.run(async (ctx) => ctx.db.get(userId));
    expect(userAfterCreate?.volunteerAvailability).toBe("offline");
    expect(userAfterCreate?.volunteerCity).toBe("Sofia");

    const secondCreate = await asOwner.mutation(api.volunteers.create, {
      bio: "Another attempt should not duplicate profile.",
      location: "Sofia",
    });

    expect(secondCreate.created).toBe(false);
    expect(secondCreate.id).toBe(created.id);
  });

  it("updates availability and capabilities for the owner", async () => {
    const t = createTestClient();
    const { userId, clerkId } = await seedUser(t, { clerkId: "volunteer_update_owner" });
    await seedVolunteerProfile(t, {
      userId,
      city: "Plovdiv",
      availability: "offline",
      capabilities: ["general"],
    });

    const asOwner = t.withIdentity(buildIdentity(clerkId));

    const availabilityResult = await asOwner.mutation(api.volunteers.updateAvailability, {
      availability: "busy",
    });
    expect(availabilityResult.availability).toBe("busy");

    const capabilitiesResult = await asOwner.mutation(api.volunteers.updateCapabilities, {
      capabilities: ["transport", "rescue", "transport"],
    });
    expect(capabilitiesResult.capabilities).toEqual(["transport", "rescue"]);

    const user = await t.run(async (ctx) => ctx.db.get(userId));
    expect(user?.volunteerAvailability).toBe("busy");
    expect(user?.volunteerCapabilities).toEqual(["transport", "rescue"]);
  });

  it("blocks volunteer settings updates for non-volunteer users", async () => {
    const t = createTestClient();
    const { clerkId } = await seedUser(t, { clerkId: "non_volunteer_settings_guard" });
    const asUser = t.withIdentity(buildIdentity(clerkId));

    await expect(
      asUser.mutation(api.volunteers.updateAvailability, {
        availability: "available",
      }),
    ).rejects.toThrow("Volunteer settings are only available for volunteer users");
  });

  it("directory excludes offline by default and filters by city/capability/availability", async () => {
    const t = createTestClient();

    const { userId: sofiaTransportId } = await seedUser(t, { clerkId: "dir_sofia_transport" });
    const { userId: sofiaBusyId } = await seedUser(t, { clerkId: "dir_sofia_busy" });
    const { userId: sofiaOfflineId } = await seedUser(t, { clerkId: "dir_sofia_offline" });
    const { userId: varnaTransportId } = await seedUser(t, { clerkId: "dir_varna_transport" });

    await seedVolunteerProfile(t, {
      userId: sofiaTransportId,
      city: "Sofia",
      availability: "available",
      capabilities: ["transport"],
    });
    await seedVolunteerProfile(t, {
      userId: sofiaBusyId,
      city: "Sofia",
      availability: "busy",
      capabilities: ["fostering"],
    });
    await seedVolunteerProfile(t, {
      userId: sofiaOfflineId,
      city: "Sofia",
      availability: "offline",
      capabilities: ["transport"],
    });
    await seedVolunteerProfile(t, {
      userId: varnaTransportId,
      city: "Varna",
      availability: "available",
      capabilities: ["transport"],
    });

    const allVisible = await t.query(api.volunteers.listDirectory, {});
    const allVisibleUserIds = allVisible.map((item) => item.userId);
    expect(allVisibleUserIds).toContain(sofiaTransportId);
    expect(allVisibleUserIds).toContain(sofiaBusyId);
    expect(allVisibleUserIds).toContain(varnaTransportId);
    expect(allVisibleUserIds).not.toContain(sofiaOfflineId);

    const sofiaTransport = await t.query(api.volunteers.listDirectory, {
      city: "Sofia",
      capability: "transport",
    });
    expect(sofiaTransport.map((item) => item.userId)).toEqual([sofiaTransportId]);

    const offlineOnly = await t.query(api.volunteers.listDirectory, {
      availability: "offline",
    });
    expect(offlineOnly.map((item) => item.userId)).toEqual([sofiaOfflineId]);
  });

  it("sends transport request notifications only to available transport volunteers in same city", async () => {
    const t = createTestClient();
    const { userId: ownerId, clerkId: ownerClerkId } = await seedUser(t, { clerkId: "transport_owner" });
    const caseId = await seedCase(t, ownerId, { title: "Need transport to clinic" });

    const { userId: matchUserId } = await seedUser(t, { clerkId: "transport_match" });
    const { userId: busyUserId } = await seedUser(t, { clerkId: "transport_busy" });
    const { userId: wrongCapabilityUserId } = await seedUser(t, { clerkId: "transport_wrong_capability" });
    const { userId: wrongCityUserId } = await seedUser(t, { clerkId: "transport_wrong_city" });

    await seedVolunteerProfile(t, {
      userId: matchUserId,
      city: "Sofia",
      availability: "available",
      capabilities: ["transport"],
    });
    await seedVolunteerProfile(t, {
      userId: busyUserId,
      city: "Sofia",
      availability: "busy",
      capabilities: ["transport"],
    });
    await seedVolunteerProfile(t, {
      userId: wrongCapabilityUserId,
      city: "Sofia",
      availability: "available",
      capabilities: ["fostering"],
    });
    await seedVolunteerProfile(t, {
      userId: wrongCityUserId,
      city: "Varna",
      availability: "available",
      capabilities: ["transport"],
    });

    const asOwner = t.withIdentity(buildIdentity(ownerClerkId));
    const result = await asOwner.mutation(api.volunteers.createTransportRequest, {
      caseId,
      message: "Can someone assist in the next hour?",
    });

    expect(result.notifiedCount).toBe(1);

    const notifications = await t.run(async (ctx) => {
      return ctx.db.query("notifications").collect();
    });

    const notifiedUserIds = notifications.map((notification) => notification.userId);
    expect(notifiedUserIds).toEqual([matchUserId]);
    expect(notifiedUserIds).not.toContain(busyUserId);
    expect(notifiedUserIds).not.toContain(wrongCapabilityUserId);
    expect(notifiedUserIds).not.toContain(wrongCityUserId);
  });

  it("blocks transport requests from non-owners", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t, { clerkId: "transport_owner_authz" });
    const caseId = await seedCase(t, ownerId, { title: "Owner-only transport request" });

    const { clerkId: outsiderClerkId } = await seedUser(t, { clerkId: "transport_outsider" });
    const asOutsider = t.withIdentity(buildIdentity(outsiderClerkId));

    await expect(
      asOutsider.mutation(api.volunteers.createTransportRequest, {
        caseId,
      }),
    ).rejects.toThrow("Only case owners can request transport support");
  });
});
