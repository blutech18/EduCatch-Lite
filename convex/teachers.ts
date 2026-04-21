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

    const visibleLessons = allLessons.filter((l) => studentMap.has(l.userId));

    // Group lessons that share a groupId (same lesson assigned to several
    // students in one action). Ungrouped lessons stay as standalone entries.
    type Acc = {
      key: string;
      groupId?: string;
      lessonIds: typeof visibleLessons[number]["_id"][];
      title: string;
      subject: string;
      lessonDate: string;
      difficulty: "easy" | "medium" | "hard";
      estimatedMinutes: number;
      content?: string;
      studentNames: string[];
      completedCount: number;
      totalCount: number;
      status: "pending" | "completed";
      createdAt: number;
    };

    const groups = new Map<string, Acc>();
    for (const l of visibleLessons) {
      const key = l.groupId ?? `single:${l._id}`;
      const existing = groups.get(key);
      const studentName = studentMap.get(l.userId) ?? "Unknown";
      if (existing) {
        existing.lessonIds.push(l._id);
        existing.studentNames.push(studentName);
        existing.totalCount += 1;
        if (l.status === "completed") existing.completedCount += 1;
        // Group is "completed" only when every copy is completed.
        existing.status =
          existing.completedCount === existing.totalCount ? "completed" : "pending";
        // Prefer the earliest createdAt so the row order is stable.
        if (l.createdAt < existing.createdAt) existing.createdAt = l.createdAt;
      } else {
        groups.set(key, {
          key,
          groupId: l.groupId,
          lessonIds: [l._id],
          title: l.title,
          subject: l.subject,
          lessonDate: l.lessonDate,
          difficulty: l.difficulty,
          estimatedMinutes: l.estimatedMinutes,
          content: l.content,
          studentNames: [studentName],
          completedCount: l.status === "completed" ? 1 : 0,
          totalCount: 1,
          status: l.status,
          createdAt: l.createdAt,
        });
      }
    }

    return Array.from(groups.values())
      .map((g) => ({
        _id: g.key,
        groupId: g.groupId,
        lessonIds: g.lessonIds,
        title: g.title,
        subject: g.subject,
        lessonDate: g.lessonDate,
        difficulty: g.difficulty,
        estimatedMinutes: g.estimatedMinutes,
        status: g.status,
        content: g.content,
        studentNames: g.studentNames.sort((a, b) => a.localeCompare(b)),
        studentCount: g.totalCount,
        completedCount: g.completedCount,
        createdAt: g.createdAt,
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
