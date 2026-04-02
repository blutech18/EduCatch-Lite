import { QueryCtx, MutationCtx } from "./_generated/server";

type Role = "student" | "teacher" | "admin";

type AuthenticatedUser = {
  _id: any;
  name: string;
  email: string;
  role: Role;
  createdAt: number;
};

/**
 * Validates a session token and returns the authenticated user.
 * Throws if the session is invalid, expired, or user not found.
 */
export async function authenticateSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | null | undefined
): Promise<AuthenticatedUser> {
  if (!sessionToken) {
    throw new Error("Not authenticated. Please log in.");
  }

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .first();

  if (!session) {
    throw new Error("Invalid session. Please log in again.");
  }

  if (session.expiresAt < Date.now()) {
    throw new Error("Session expired. Please log in again.");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("User not found.");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    createdAt: user.createdAt,
  };
}

/**
 * Non-throwing version — returns null if session is invalid.
 * Use this in queries so they don't crash the page.
 */
export async function tryAuthenticateSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | null | undefined
): Promise<AuthenticatedUser | null> {
  if (!sessionToken) return null;

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .first();

  if (!session || session.expiresAt < Date.now()) return null;

  const user = await ctx.db.get(session.userId);
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    createdAt: user.createdAt,
  };
}

/**
 * Validates session and checks that the user has one of the allowed roles.
 * Throws on failure.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | null | undefined,
  allowedRoles: Role[]
) {
  const user = await authenticateSession(ctx, sessionToken);

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Access denied. Insufficient permissions.");
  }

  return user;
}

/**
 * Non-throwing version of requireRole — returns null if session is invalid or role doesn't match.
 * Use this in queries.
 */
export async function tryRequireRole(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | null | undefined,
  allowedRoles: Role[]
): Promise<AuthenticatedUser | null> {
  const user = await tryAuthenticateSession(ctx, sessionToken);
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) return null;
  return user;
}
