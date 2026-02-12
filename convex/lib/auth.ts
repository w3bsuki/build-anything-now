import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

async function getUserFromIdentity(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found in database. Please sign up first.");
  }

  return user;
}

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const user = await getUserFromIdentity(ctx);
  return user._id;
}

/**
 * Require authentication and return the current user.
 * Throws if not authenticated or user not found in database.
 * 
 * Use this in any mutation/query that should only work for logged-in users.
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  return getUserFromIdentity(ctx);
}

/**
 * Require the current user to be an admin.
 * Throws if not authenticated, user not found, or user is not an admin.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}

/**
 * Optionally get the current user if authenticated.
 * Returns null if not authenticated or user not found.
 * 
 * Use this for queries/mutations that work for both guests and logged-in users.
 */
export async function optionalUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

/**
 * Verify that a resource belongs to the current user.
 * Throws if the userId doesn't match the current user.
 */
export function assertOwnership(
  user: Doc<"users">,
  resourceUserId: Id<"users">,
  resourceName: string = "resource"
): void {
  if (user._id !== resourceUserId) {
    throw new Error(`You don't have permission to access this ${resourceName}`);
  }
}
