"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from "@/store/authStore";
import { useLessonStore } from "@/store/lessonStore";
import { useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import LessonForm from "@/components/forms/LessonForm";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ClipboardList, Inbox, BookOpen } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function LessonsPage() {
  return (
    <RoleGuard allowedRoles={["student"]}>
      <Lessons />
    </RoleGuard>
  );
}

function Lessons() {
  const { user, sessionToken } = useAuthStore();
  const { setHeader } = useDashboardLayout();
  const { showForm, toggleForm, setShowForm, deletingId, setDeletingId, filter, setFilter } = useLessonStore();

  const updateStatus = useMutation(api.lessons.updateStatus);
  const deleteLesson = useMutation(api.lessons.deleteLesson);
  const lessons = useQuery(
    api.lessons.getLessons,
    user ? { userId: user._id, sessionToken: sessionToken ?? undefined } : "skip"
  );

  useEffect(() => {
    setHeader("Missed Lessons", "Track and manage all your missed classes", <BookOpen className="h-5 w-5 text-violet-400" />);
  }, [setHeader]);

  if (!user) return null;

  const filteredLessons = lessons?.filter((l) => filter === "all" || l.status === filter);

  const handleToggleStatus = async (lessonId: Id<"lessons">, currentStatus: string) => {
    try {
      await updateStatus({ lessonId, status: currentStatus === "completed" ? "pending" : "completed", sessionToken: sessionToken ?? undefined });
    } catch (error) { console.error("Failed to update status:", error); }
  };

  const handleDelete = async (lessonId: Id<"lessons">) => {
    setDeletingId(lessonId);
    try {
      await deleteLesson({ lessonId, sessionToken: sessionToken ?? undefined });
    } catch (error) { console.error("Failed to delete lesson:", error); }
    finally { setDeletingId(null); }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const styles = { easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", medium: "bg-amber-500/10 text-amber-400 border-amber-500/20", hard: "bg-red-500/10 text-red-400 border-red-500/20" };
    return styles[difficulty as keyof typeof styles] || styles.medium;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardSidebar />
      <DashboardNavbar />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="mb-8 flex items-center justify-end">
            <Button onClick={toggleForm} variant={showForm ? "secondary" : "primary"}>
              {showForm ? "Cancel" : "+ Add Lesson"}
            </Button>
          </div>

          {showForm && (
            <div className="mb-8 rounded-2xl border border-white/[0.06] bg-slate-900/50 p-6 sm:p-8">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <ClipboardList className="h-5 w-5 text-violet-400" /> Add a Missed Lesson
              </h2>
              <LessonForm onSuccess={() => setShowForm(false)} />
            </div>
          )}

          <div className="mb-5 flex gap-2">
            {(["all", "pending", "completed"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${filter === f ? "bg-violet-500/15 text-violet-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{f}</button>
            ))}
          </div>

          {lessons === undefined ? (
            <LoadingSpinner text="Loading lessons..." />
          ) : filteredLessons?.length === 0 ? (
            <EmptyState icon={<Inbox className="mx-auto h-12 w-12 text-slate-500" />} title={filter === "all" ? "No lessons yet" : `No ${filter} lessons`} description={filter === "all" ? 'Click "Add Lesson" to record your first missed class.' : `You have no ${filter} lessons right now.`} />
          ) : (
            <div className="space-y-3">
              {filteredLessons?.map((lesson) => (
                <div key={lesson._id} className="group rounded-2xl border border-white/[0.06] bg-slate-800/30 p-5 transition-all hover:border-white/[0.1] hover:bg-slate-800/50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleToggleStatus(lesson._id, lesson.status)} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${lesson.status === "completed" ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400" : "border-white/20 bg-white/5 text-transparent hover:border-violet-500/50 hover:bg-violet-500/10"}`}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </button>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold ${lesson.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>{lesson.title}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">{lesson.subject}</span>
                          <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getDifficultyBadge(lesson.difficulty)}`}>{lesson.difficulty}</span>
                          <span className="text-xs text-slate-500">{new Date(lesson.lessonDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="text-xs text-slate-500">• {lesson.estimatedMinutes} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(lesson._id, lesson.status)}>{lesson.status === "completed" ? "Undo" : "Mark Complete"}</Button>
                      <Button variant="danger" size="sm" isLoading={deletingId === lesson._id} onClick={() => handleDelete(lesson._id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
