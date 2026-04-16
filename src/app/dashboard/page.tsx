"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import { Target, BookOpen, CheckCircle2, Hourglass, TrendingUp, ClipboardList, Inbox, LayoutDashboard } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["student"]}>
      <Dashboard />
    </RoleGuard>
  );
}

function Dashboard() {
  const router = useRouter();
  const { user, sessionToken } = useAuthStore();
  const { setHeader } = useDashboardLayout();

  const stats = useQuery(
    api.lessons.getStats,
    user ? { userId: user._id, sessionToken: sessionToken ?? undefined } : "skip"
  );
  const recentLessons = useQuery(
    api.lessons.getLessons,
    user ? { userId: user._id, sessionToken: sessionToken ?? undefined } : "skip"
  );

  useEffect(() => {
    setHeader("Dashboard", "Overview of your catch-up progress", <LayoutDashboard className="h-5 w-5 text-violet-400" />);
  }, [setHeader]);

  if (!user) return null;

  return (
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          {stats === undefined || stats === null ? (
            <LoadingSpinner text="Loading your dashboard..." />
          ) : (
            <>
              {/* Progress Section */}
              <div className="mb-8 rounded-2xl border border-white/6 bg-slate-800/30 p-6 sm:p-8">
                <div className="mb-2 flex items-center gap-3">
                  <Target className="h-6 w-6 text-violet-400" />
                  <h2 className="text-lg font-semibold text-white">Overall Progress</h2>
                </div>
                <p className="mb-5 text-sm text-slate-400">
                  {stats.completed} of {stats.total} lessons completed
                </p>
                <ProgressBar value={stats.progress} size="lg" />
              </div>

              {/* Stats Grid */}
              <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Lessons" value={stats.total} icon={<BookOpen className="h-6 w-6 text-violet-400" />} gradient="bg-violet-500" subtitle="All recorded lessons" />
                <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="h-6 w-6 text-emerald-400" />} gradient="bg-emerald-500" subtitle="Lessons finished" />
                <StatCard title="Pending" value={stats.pending} icon={<Hourglass className="h-6 w-6 text-amber-400" />} gradient="bg-amber-500" subtitle="Lessons remaining" />
                <StatCard title="Progress" value={`${stats.progress}%`} icon={<TrendingUp className="h-6 w-6 text-indigo-400" />} gradient="bg-indigo-500" subtitle="Completion rate" />
              </div>

              {/* Recent Lessons */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <ClipboardList className="h-5 w-5 text-violet-400" /> Recent Lessons
                </h2>
                {recentLessons === undefined ? (
                  <LoadingSpinner text="Loading lessons..." />
                ) : !recentLessons || recentLessons.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/30 p-12 text-center">
                    <Inbox className="mb-4 mx-auto h-12 w-12 text-slate-500" />
                    <h3 className="mb-1 text-base font-semibold text-white">No lessons yet</h3>
                    <p className="text-sm text-slate-400">
                      Head to the{" "}
                      <button onClick={() => router.push("/lessons")} className="text-violet-400 underline underline-offset-2 hover:text-violet-300">Lessons page</button>{" "}
                      to add your first missed lesson.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLessons.slice(0, 5).map((lesson) => (
                      <div key={lesson._id} className="flex items-center justify-between rounded-xl border border-white/6 bg-slate-800/40 px-5 py-4 transition-all hover:border-white/10">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm ${lesson.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                            {lesson.status === "completed" ? "✓" : "○"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{lesson.title}</p>
                            <p className="text-xs text-slate-400">{lesson.subject} • {new Date(lesson.lessonDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${lesson.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {lesson.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
  );
}
