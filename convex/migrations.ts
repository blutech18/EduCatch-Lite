import { internalMutation } from "./_generated/server";

// Run once to backfill role field on existing users who were created before role was added
export const backfillRoles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let updated = 0;
    for (const user of users) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(user as any).role) {
        await ctx.db.patch(user._id, { role: "student" });
        updated++;
      }
    }
    return { updated };
  },
});
