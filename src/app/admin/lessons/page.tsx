"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import RoleGuard from "@/components/auth/RoleGuard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { useDashboardLayoutStore } from "@/store/dashboardLayoutStore";
import { BookOpen, Inbox } from "lucide-react";
import { useEffect, useMemo, useCallback } from "react";

export default function AdminLessonsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminLessons />
    </RoleGuard>
  );
}

function AdminLessons() {
  const sessionToken = useAuthStore((s) => s.sessionToken);
  const setHeader = useDashboardLayoutStore((s) => s.setHeader);
  const data = useQuery(api.admin.getAllLessons, sessionToken ? { sessionToken } : "skip");
  const lessonFilter = useAdminStore((s) => s.lessonFilter);
  const setLessonFilter = useAdminStore((s) => s.setLessonFilter);
  const headerIcon = useMemo(() => <BookOpen className="h-5 w-5 text-amber-400" />, []);

  useEffect(() => {
    setHeader("All Lessons", `System-wide view of all student lessons (${data?.length ?? 0} total)`, headerIcon);
  }, [setHeader, data?.length, headerIcon]);

  const filtered = useMemo(
    () => data?.filter((l) => lessonFilter === "all" || l.status === lessonFilter),
    [data, lessonFilter]
  );

  const getDifficultyBadge = useCallback((difficulty: string) => {
    const styles: Record<string, string> = {
      easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      hard: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return styles[difficulty] || styles.medium;
  }, []);

  return (
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <div className="mb-5 flex gap-2">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setLessonFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                lessonFilter === f
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {data === undefined ? (
          <LoadingSpinner text="Loading lessons..." />
        ) : filtered?.length === 0 ? (
          <EmptyState
            icon={<Inbox className="mx-auto h-12 w-12 text-slate-500" />}
            title="No lessons found"
            description="No lessons match this filter."
          />
        ) : (
          <div className="space-y-3">
            {filtered?.map((item) => (
              <div key={item._id} className="rounded-2xl border border-white/6 bg-slate-800/30 p-5 transition-all hover:border-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${item.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-600"}`}>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${item.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>{item.title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">{item.subject}</span>
                        <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getDifficultyBadge(item.difficulty)}`}>{item.difficulty}</span>
                        <span className="text-xs text-slate-500">{new Date(item.lessonDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="text-xs text-slate-500">• {item.estimatedMinutes} min</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Student: {item.studentName}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${item.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {item.status === "completed" ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
  );
}
