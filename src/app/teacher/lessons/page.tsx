"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import RoleGuard from "@/components/auth/RoleGuard";
import TeacherLessonForm from "@/components/forms/TeacherLessonForm";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useTeacherStore } from "@/store/teacherStore";
import { useDashboardLayoutStore } from "@/store/dashboardLayoutStore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList, Inbox, Plus, Trash2, BookOpen, ChevronUp } from "lucide-react";

export default function TeacherLessonsPage() {
  return (
    <RoleGuard allowedRoles={["teacher"]}>
      <TeacherLessons />
    </RoleGuard>
  );
}

function TeacherLessons() {
  const sessionToken = useAuthStore((s) => s.sessionToken);
  const setHeader = useDashboardLayoutStore((s) => s.setHeader);
  const showLessonForm = useTeacherStore((s) => s.showLessonForm);
  const toggleLessonForm = useTeacherStore((s) => s.toggleLessonForm);
  const setShowLessonForm = useTeacherStore((s) => s.setShowLessonForm);
  const data = useQuery(api.teachers.getAllLessonsOverview, sessionToken ? { sessionToken } : "skip");
  const deleteLesson = useMutation(api.lessons.deleteLesson);
  const updateStatus = useMutation(api.lessons.updateStatus);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpanded = useCallback(
    (id: string) => setExpandedId((curr) => (curr === id ? null : id)),
    []
  );
  const headerIcon = useMemo(() => <ClipboardList className="h-5 w-5 text-emerald-400" />, []);

  useEffect(() => {
    setHeader("All Student Lessons", `Overview of all missed lessons (${data?.length ?? 0} total)`, headerIcon);
  }, [setHeader, data?.length, headerIcon]);

  const getDifficultyBadge = useCallback((difficulty: string) => {
    const styles: Record<string, string> = {
      easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      hard: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return styles[difficulty] || styles.medium;
  }, []);

  const handleToggleStatus = useCallback(async (lessonId: Id<"lessons">, currentStatus: string) => {
    try {
      await updateStatus({ lessonId, status: currentStatus === "completed" ? "pending" : "completed", sessionToken: sessionToken ?? undefined });
    } catch (error) { console.error("Failed to update status:", error); }
  }, [updateStatus, sessionToken]);

  const handleDelete = useCallback(async (lessonId: Id<"lessons">) => {
    setDeletingId(lessonId);
    try {
      await deleteLesson({ lessonId, sessionToken: sessionToken ?? undefined });
    } catch (error) { console.error("Failed to delete lesson:", error); }
    finally { setDeletingId(null); }
  }, [deleteLesson, sessionToken]);

  return (
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="mb-8 flex items-center justify-end">
            <Button onClick={toggleLessonForm} variant={showLessonForm ? "secondary" : "primary"}>
              {showLessonForm ? "Cancel" : <><Plus className="h-4 w-4" /> Add Lesson for Student</>}
            </Button>
          </div>

          {showLessonForm && (
            <div className="mb-8 rounded-2xl border border-white/6 bg-slate-900/50 p-6 sm:p-8">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <ClipboardList className="h-5 w-5 text-violet-400" /> Add a Lesson for Student
              </h2>
              <TeacherLessonForm onSuccess={() => setShowLessonForm(false)} />
            </div>
          )}

          {data === undefined ? (
            <LoadingSpinner text="Loading lessons..." />
          ) : data === null || data.length === 0 ? (
            <EmptyState
              icon={<Inbox className="mx-auto h-12 w-12 text-slate-500" />}
              title="No lessons recorded"
              description='Click "Add Lesson for Student" to create a lesson for your students.'
            />
          ) : (
            <div className="space-y-3">
              {data.map((item) => {
                const isExpanded = expandedId === item._id;
                const hasContent = !!item.content && item.content.trim().length > 0;
                return (
                  <div
                    key={item._id}
                    className="group rounded-2xl border border-white/6 bg-slate-800/30 p-5 transition-all hover:border-white/10"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleStatus(item._id as Id<"lessons">, item.status)}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${item.status === "completed" ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400" : "border-white/20 bg-white/5 text-transparent hover:border-violet-500/50 hover:bg-violet-500/10"}`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        </button>
                        <div className="min-w-0">
                          <h3 className={`text-sm font-semibold ${item.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>{item.title}</h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">{item.subject}</span>
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getDifficultyBadge(item.difficulty)}`}>{item.difficulty}</span>
                            <span className="text-xs text-slate-500">{new Date(item.lessonDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span className="text-xs text-slate-500">• {item.estimatedMinutes} min</span>
                            {hasContent ? (
                              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">Has content</span>
                            ) : (
                              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">No content</span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">Student: {item.studentName}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                        {hasContent && (
                          <Button variant="secondary" size="sm" onClick={() => toggleExpanded(item._id)}>
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5" /> Hide
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-3.5 w-3.5" /> Read
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(item._id as Id<"lessons">, item.status)}>
                          {item.status === "completed" ? "Undo" : "Mark Complete"}
                        </Button>
                        <Button variant="danger" size="sm" isLoading={deletingId === item._id} onClick={() => handleDelete(item._id as Id<"lessons">)}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                    {hasContent && isExpanded && (
                      <div className="mt-4 rounded-xl border border-white/6 bg-slate-900/40 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Lesson Content
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                          {item.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
  );
}
