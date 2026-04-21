import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, tryRequireRole } from "./auth";

// Teacher: Get all lessons across all students with student names
export const getAllLessonsOverview = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const user = await tryRequireRole(ctx, args.sessionToken, ["teacher", "admin"]);
      if (!user) return null;
    }

    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();

    const studentMap = new Map(students.map((s) => [s._id, s.name]));
    const allLessons = await ctx.db.query("lessons").collect();

    return allLessons
      .filter((l) => studentMap.has(l.userId))
      .map((l) => ({
        _id: l._id,
        title: l.title,
        subject: l.subject,
        lessonDate: l.lessonDate,
        difficulty: l.difficulty,
        estimatedMinutes: l.estimatedMinutes,
        status: l.status,
        content: l.content,
        studentName: studentMap.get(l.userId) ?? "Unknown",
        createdAt: l.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
      );
  },
});

// Teacher: Get all students with their lesson stats
export const getAllStudents = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const user = await tryRequireRole(ctx, args.sessionToken, ["teacher", "admin"]);
      if (!user) return null;
    }

    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();

    const results = await Promise.all(
      students.map(async (student) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_userId", (q) => q.eq("userId", student._id))
          .collect();

        const total = lessons.length;
        const completed = lessons.filter((l) => l.status === "completed").length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          stats: { total, completed, pending: total - completed, progress },
        };
      })
    );

    return results.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Teacher: Get lessons for a specific student
export const getStudentLessons = query({
  args: { studentId: v.id("users"), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const user = await tryRequireRole(ctx, args.sessionToken, ["teacher", "admin"]);
      if (!user) return null;
    }

    const student = await ctx.db.get(args.studentId);
    if (!student || student.role !== "student") return null;

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_userId", (q) => q.eq("userId", args.studentId))
      .collect();

    return {
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
      },
      lessons: lessons.sort(
        (a, b) =>
          new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
      ),
    };
  },
});
