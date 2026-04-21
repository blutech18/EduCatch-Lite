import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("admin")
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  lessons: defineTable({
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
    status: v.union(v.literal("pending"), v.literal("completed")),
    // Lesson body authored by the teacher so students can read / study from it.
    // Optional for backward compat with lessons created before this field existed
    // and for student-reported "missed lesson" entries that have no content yet.
    content: v.optional(v.string()),
    // Shared ID linking copies of the same lesson that was assigned to
    // multiple students in a single action. Used to dedupe the teacher overview
    // and allow group-level actions (e.g., delete-for-all).
    groupId: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_groupId", ["groupId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),
});
