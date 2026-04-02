import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Update user passwords to hashed versions.
 * This is a one-time fix for users created with plain text passwords.
 */
export const updateUserPassword = mutation({
  args: {
    email: v.string(),
    hashedPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User not found: ${args.email}`);
    }

    await ctx.db.patch(user._id, {
      password: args.hashedPassword,
    });

    return {
      success: true,
      email: args.email,
      userId: user._id,
    };
  },
});
