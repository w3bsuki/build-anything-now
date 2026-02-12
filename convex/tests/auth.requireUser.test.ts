import { describe, expect, it } from "vitest";
import { requireUser } from "../lib/auth";

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
  } as unknown as Parameters<typeof requireUser>[0];
}

describe("requireUser", () => {
  it("throws when identity is missing", async () => {
    await expect(requireUser(mockCtx(null, null))).rejects.toThrow("Not authenticated");
  });

  it("throws when user is not found", async () => {
    await expect(requireUser(mockCtx({ subject: "clerk_missing" }, null))).rejects.toThrow(
      "User not found in database. Please sign up first.",
    );
  });

  it("returns the resolved user", async () => {
    const user = { _id: "user_1", role: "user" as const };
    await expect(requireUser(mockCtx({ subject: "clerk_1" }, user))).resolves.toMatchObject(user);
  });
});
