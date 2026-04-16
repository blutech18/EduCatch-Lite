"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import { useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PartyPopper, ClipboardList, CalendarHeart } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function PlanPage() {
  return (
    <RoleGuard allowedRoles={["student"]}>
      <Plan />
    </RoleGuard>
  );
}

function Plan() {
  const { user, sessionToken } = useAuthStore();
  const { setHeader } = useDashboardLayout();

  const plan = useQuery(
    api.lessons.getCatchUpPlan,
    user ? { userId: user._id, sessionToken: sessionToken ?? undefined } : "skip"
  );

  useEffect(() => {
    setHeader("Catch-up Plan", "Auto-generated study schedule based on difficulty", <CalendarHeart className="h-5 w-5 text-violet-400" />);
  }, [setHeader]);

  if (!user) return null;

  const getDifficultyColor = (difficulty: string) => {
    const map: Record<string, { bg: string; border: string; text: string; dot: string; line: string }> = {
      easy: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400", line: "bg-emerald-500/20" },
      medium: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400", line: "bg-amber-500/20" },
      hard: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-400", line: "bg-red-500/20" },
    };
    return map[difficulty] || { bg: "bg-slate-500/10", border: "border-slate-500/20", text: "text-slate-400", dot: "bg-slate-400", line: "bg-slate-500/20" };
  };

  const totalDuration = plan?.reduce((sum, item) => sum + item.recommendedDuration, 0);

  return (
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          {plan === undefined || plan === null ? (
            <LoadingSpinner text="Generating your catch-up plan..." />
          ) : plan.length === 0 ? (
            <EmptyState icon={<PartyPopper className="mx-auto h-12 w-12 text-slate-500" />} title="All caught up!" description="You have no pending lessons. Add missed lessons from the Lessons page to generate a catch-up plan." />
          ) : (
            <>
              <div className="mb-8 rounded-2xl border border-white/6 bg-linear-to-r from-violet-500/10 to-indigo-500/10 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                      <ClipboardList className="h-5 w-5 text-violet-400" /> Study Schedule Summary
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {plan.length} lessons to complete • {Math.floor((totalDuration || 0) / 60)}h {(totalDuration || 0) % 60}m total study time
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span className="text-xs text-slate-400">Easy (30m)</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="text-xs text-slate-400">Medium (60m)</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="text-xs text-slate-400">Hard (90m)</span></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                {plan.map((item, index) => {
                  const colors = getDifficultyColor(item.difficulty);
                  const isLast = index === plan.length - 1;
                  return (
                    <div key={item._id} className="relative flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${colors.border} ${colors.bg}`}>
                          <span className={`text-sm font-bold ${colors.text}`}>{item.order}</span>
                        </div>
                        {!isLast && <div className={`w-0.5 flex-1 ${colors.line}`} style={{ minHeight: "2rem" }} />}
                      </div>
                      <div className={`mb-6 flex-1 rounded-2xl border ${colors.border} bg-slate-800/30 p-5 transition-all hover:bg-slate-800/50`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-white">{item.title}</h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">{item.subject}</span>
                              <span className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${colors.border} ${colors.text}`}>{item.difficulty}</span>
                              <span className="text-xs text-slate-500">{new Date(item.lessonDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl bg-slate-700/40 px-4 py-2.5 sm:shrink-0">
                            <svg className={`h-4 w-4 ${colors.text}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="text-sm font-semibold text-white">{item.recommendedDuration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
  );
}
