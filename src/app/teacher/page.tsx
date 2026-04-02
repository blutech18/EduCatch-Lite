"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import RoleGuard from "@/components/auth/RoleGuard";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useTeacherStore } from "@/store/teacherStore";
import { useAuthStore } from "@/store/authStore";
import { useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import { GraduationCap, ChevronDown, ChevronUp, BookOpen, CheckCircle2, Hourglass } from "lucide-react";

export default function TeacherPage() {
  return (
    <RoleGuard allowedRoles={["teacher"]}>
      <TeacherDashboard />
    </RoleGuard>
  );
}

function StudentCard({
  student,
}: {
  student: {
    _id: Id<"users">;
    name: string;
    email: string;
    stats: { total: number; completed: number; pending: number; progress: number };
  };
}) {
  const { expandedStudentId, toggleStudent } = useTeacherStore();
  const { sessionToken } = useAuthStore();
  const expanded = expandedStudentId === student._id;

  const studentData = useQuery(
    api.teachers.getStudentLessons,
    expanded ? { studentId: student._id, sessionToken: sessionToken ?? undefined } : "skip"
  );

  const getDifficultyBadge = (difficulty: string) => {
    if (difficulty === "easy") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    if (difficulty === "hard") return "border-red-500/20 bg-red-500/10 text-red-400";
    return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-800/30 transition-all hover:border-white/[0.1]">
      <button
        className="flex w-full items-center justify-between p-5 text-left"
        onClick={() => toggleStudent(student._id)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{student.name}</p>
            <p className="text-xs text-slate-500">{student.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-4 sm:flex">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <BookOpen className="h-3.5 w-3.5" /> {student.stats.total} lessons
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {student.stats.completed} done
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Hourglass className="h-3.5 w-3.5" /> {student.stats.pending} pending
            </div>
          </div>
          <div className="w-28">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="font-medium text-white">{student.stats.progress}%</span>
            </div>
            <ProgressBar value={student.stats.progress} showPercentage={false} size="sm" />
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-5 pb-5 pt-4">
          {studentData === undefined ? (
            <LoadingSpinner text="Loading lessons..." />
          ) : !studentData || studentData.lessons.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No lessons recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {studentData.lessons.map((lesson) => (
                <div key={lesson._id} className="flex items-center justify-between rounded-xl bg-slate-900/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${lesson.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-600"}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${lesson.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>{lesson.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-slate-600">{lesson.subject}</span>
                        <span className="text-xs text-slate-600">{new Date(lesson.lessonDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${getDifficultyBadge(lesson.difficulty)}`}>{lesson.difficulty}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${lesson.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{lesson.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TeacherDashboard() {
  const { sessionToken } = useAuthStore();
  const { setHeader } = useDashboardLayout();
  const students = useQuery(api.teachers.getAllStudents, sessionToken ? { sessionToken } : "skip");

  useEffect(() => {
    setHeader("Student Overview", "View all students' catch-up progress", <GraduationCap className="h-5 w-5 text-emerald-400" />);
  }, [setHeader]);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardSidebar />
      <DashboardNavbar />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          {students === undefined ? (
            <LoadingSpinner text="Loading students..." />
          ) : students === null || students.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="mx-auto h-12 w-12 text-slate-500" />}
              title="No students yet"
              description="Students will appear here once they register and add lessons."
            />
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
