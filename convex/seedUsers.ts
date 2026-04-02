import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with 3 test users (one of each role).
 * This mutation can be run from the Convex dashboard.
 * 
 * Usage: Call this mutation without arguments from the dashboard.
 */
export const seedTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const results = [];

    // 1. Create Admin
    const adminEmail = "admin@example.com";
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", adminEmail))
      .first();

    if (!existingAdmin) {
      const adminId = await ctx.db.insert("users", {
        name: "Admin User",
        email: adminEmail,
        password: "admin123", // In production, this should be hashed
        role: "admin",
        createdAt: Date.now(),
      });
      results.push({
        role: "admin",
        email: adminEmail,
        password: "admin123",
        userId: adminId,
      });
    } else {
      results.push({
        role: "admin",
        email: adminEmail,
        message: "Already exists",
        userId: existingAdmin._id,
      });
    }

    // 2. Create Teacher
    const teacherEmail = "teacher@example.com";
    const existingTeacher = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", teacherEmail))
      .first();

    if (!existingTeacher) {
      const teacherId = await ctx.db.insert("users", {
        name: "Teacher User",
        email: teacherEmail,
        password: "teacher123",
        role: "teacher",
        createdAt: Date.now(),
      });
      results.push({
        role: "teacher",
        email: teacherEmail,
        password: "teacher123",
        userId: teacherId,
      });
    } else {
      results.push({
        role: "teacher",
        email: teacherEmail,
        message: "Already exists",
        userId: existingTeacher._id,
      });
    }

    // 3. Create Student
    const studentEmail = "student@example.com";
    const existingStudent = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", studentEmail))
      .first();

    if (!existingStudent) {
      const studentId = await ctx.db.insert("users", {
        name: "Student User",
        email: studentEmail,
        password: "student123",
        role: "student",
        createdAt: Date.now(),
      });
      results.push({
        role: "student",
        email: studentEmail,
        password: "student123",
        userId: studentId,
      });
    } else {
      results.push({
        role: "student",
        email: studentEmail,
        message: "Already exists",
        userId: existingStudent._id,
      });
    }

    return {
      success: true,
      message: "Test users seeded successfully",
      users: results,
    };
  },
});
