import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateSession, tryAuthenticateSession } from "./auth";

// Get all lessons for a user (student: own only)
export const getLessons = query({
  args: { userId: v.id("users"), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const caller = await tryAuthenticateSession(ctx, args.sessionToken);
      if (!caller) return null;
      if (caller.role === "student" && caller._id !== args.userId) {
        return null;
      }
    }

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return lessons.sort(
      (a, b) =>
        new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
    );
  },
});

// Add a new lesson (student: own only)
export const addLesson = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    subject: v.string(),
    lessonDate: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    estimatedMinutes: v.number(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let callerId: typeof args.userId | undefined;
    if (args.sessionToken) {
      const caller = await authenticateSession(ctx, args.sessionToken);
      callerId = caller._id;
      if (caller.role === "student" && caller._id !== args.userId) {
        throw new Error("Access denied.");
      }
    }

    const lessonId = await ctx.db.insert("lessons", {
      userId: args.userId,
      title: args.title,
      subject: args.subject,
      lessonDate: args.lessonDate,
      difficulty: args.difficulty,
      estimatedMinutes: args.estimatedMinutes,
      status: "pending",
      createdBy: callerId,
      createdAt: Date.now(),
    });
    return lessonId;
  },
});

// Update lesson status (student: own lessons only)
export const updateStatus = mutation({
  args: {
    lessonId: v.id("lessons"),
    status: v.union(v.literal("pending"), v.literal("completed")),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const caller = await authenticateSession(ctx, args.sessionToken);
      if (caller.role === "student") {
        const lesson = await ctx.db.get(args.lessonId);
        if (!lesson || lesson.userId !== caller._id) {
          throw new Error("Access denied.");
        }
      }
    }

    await ctx.db.patch(args.lessonId, { status: args.status });
  },
});

// Delete a lesson (student: own lessons only)
export const deleteLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const caller = await authenticateSession(ctx, args.sessionToken);
      if (caller.role === "student") {
        const lesson = await ctx.db.get(args.lessonId);
        if (!lesson || lesson.userId !== caller._id) {
          throw new Error("Access denied.");
        }
      }
    }

    await ctx.db.delete(args.lessonId);
  },
});

// Get lesson stats for dashboard (student: own only)
export const getStats = query({
  args: { userId: v.id("users"), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const caller = await tryAuthenticateSession(ctx, args.sessionToken);
      if (!caller) return null;
      if (caller.role === "student" && caller._id !== args.userId) {
        return null;
      }
    }

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const total = lessons.length;
    const completed = lessons.filter((l) => l.status === "completed").length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, progress };
  },
});

// Generate catch-up plan (student: own only)
export const getCatchUpPlan = query({
  args: { userId: v.id("users"), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const caller = await tryAuthenticateSession(ctx, args.sessionToken);
      if (!caller) return null;
      if (caller.role === "student" && caller._id !== args.userId) {
        return null;
      }
    }

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const pendingLessons = lessons
      .filter((l) => l.status === "pending")
      .sort(
        (a, b) =>
          new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
      );

    const plan = pendingLessons.map((lesson, index) => {
      let recommendedDuration: number;
      switch (lesson.difficulty) {
        case "easy":
          recommendedDuration = 30;
          break;
        case "medium":
          recommendedDuration = 60;
          break;
        case "hard":
          recommendedDuration = 90;
          break;
        default:
          recommendedDuration = 60;
      }

      return {
        _id: lesson._id,
        order: index + 1,
        title: lesson.title,
        subject: lesson.subject,
        lessonDate: lesson.lessonDate,
        difficulty: lesson.difficulty,
        recommendedDuration,
      };
    });

    return plan;
  },
});
