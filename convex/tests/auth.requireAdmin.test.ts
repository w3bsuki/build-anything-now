import { describe, expect, it } from "vitest";
import { requireAdmin } from "../lib/auth";

type Identity = { subject: string } | null;
type MockUser = { _id: string; role: "user" | "volunteer" | "clinic" | "admin" } | null;

function mockCtx(identity: Identity, user: MockUser) {
  return {
    auth: {
      getUserIdentity: async () => identity,
    },
    db: {
      query: () => ({
        withIndex: (_name: string, handler: (query: { eq: (field: string, value: string) => unknown }) => unknown) => {
          handler({ eq: () => ({}) });
          return {
            unique: async () => user,
          };
        },
      }),
    },
  } as unknown as Parameters<typeof requireAdmin>[0];
}

describe("requireAdmin", () => {
  it("throws for authenticated non-admin users", async () => {
    await expect(requireAdmin(mockCtx({ subject: "clerk_user" }, { _id: "user_2", role: "user" }))).rejects.toThrow(
      "Admin access required",
    );
  });

  it("returns admin user", async () => {
    const admin = { _id: "admin_1", role: "admin" as const };
    await expect(requireAdmin(mockCtx({ subject: "clerk_admin" }, admin))).resolves.toMatchObject(admin);
  });
});
