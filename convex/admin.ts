import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, tryRequireRole } from "./auth";

// ─── Admin: Get all users ────────────────────────────────────────────────────
export const getAllUsers = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const user = await tryRequireRole(ctx, args.sessionToken, ["admin"]);
      if (!user) return null;
    }

    const users = await ctx.db.query("users").collect();
    return users
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

// ─── Admin: System-wide stats ────────────────────────────────────────────────
export const getSystemStats = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const user = await tryRequireRole(ctx, args.sessionToken, ["admin"]);
      if (!user) return null;
    }

    const users = await ctx.db.query("users").collect();
    const lessons = await ctx.db.query("lessons").collect();

    const students = users.filter((u) => u.role === "student").length;
    const teachers = users.filter((u) => u.role === "teacher").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(
      (l) => l.status === "completed"
    ).length;

    return { students, teachers, admins, totalLessons, completedLessons };
  },
});

// ─── Admin: Create a teacher account ────────────────────────────────────────
export const createTeacher = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      await requireRole(ctx, args.sessionToken, ["admin"]);
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: "teacher",
      createdAt: Date.now(),
    });

    return userId;
  },
});

// ─── Admin: Delete a user ────────────────────────────────────────────────────
export const deleteUser = mutation({
  args: { userId: v.id("users"), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      await requireRole(ctx, args.sessionToken, ["admin"]);
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");
    if (user.role === "admin") throw new Error("Cannot delete an admin account.");

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const lesson of lessons) {
      await ctx.db.delete(lesson._id);
    }

    await ctx.db.delete(args.userId);
  },
});

// ─── Admin: Check if any admin exists (for /setup page guard) ────────────────
// Public — no auth needed (used before any user exists)
export const adminExists = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();
    return !!admin;
  },
});

// ─── Admin: Get all lessons with student names ──────────────────────────────
export const getAllLessons = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const user = await tryRequireRole(ctx, args.sessionToken, ["admin"]);
      if (!user) return null;
    }

    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u._id, u.name]));

    const lessons = await ctx.db.query("lessons").collect();

    return lessons
      .map((l) => ({
        _id: l._id,
        title: l.title,
        subject: l.subject,
        lessonDate: l.lessonDate,
        difficulty: l.difficulty,
        estimatedMinutes: l.estimatedMinutes,
        status: l.status,
        studentName: userMap.get(l.userId) ?? "Unknown",
        createdAt: l.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
      );
  },
});
