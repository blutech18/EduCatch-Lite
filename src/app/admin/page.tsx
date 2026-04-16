"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import RoleGuard from "@/components/auth/RoleGuard";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Users, GraduationCap, ShieldCheck, BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import { useEffect } from "react";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminDashboard />
    </RoleGuard>
  );
}

function AdminDashboard() {
  const { sessionToken } = useAuthStore();
  const { setHeader } = useDashboardLayout();
  const stats = useQuery(api.admin.getSystemStats, sessionToken ? { sessionToken } : "skip");
  const users = useQuery(api.admin.getAllUsers, sessionToken ? { sessionToken } : "skip");

  useEffect(() => {
    setHeader("Admin Dashboard", "System-wide overview of EduCatch Lite", <ShieldCheck className="h-5 w-5 text-amber-400" />);
  }, [setHeader]);

  const recentUsers = users?.slice(-5).reverse();

  return (
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {stats === undefined ? (
          <LoadingSpinner text="Loading system stats..." />
        ) : !stats ? (
          <LoadingSpinner text="Loading system stats..." />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Students"
                value={stats.students}
                icon={<GraduationCap className="h-6 w-6 text-violet-400" />}
                gradient="bg-violet-500"
                subtitle="Registered students"
              />
              <StatCard
                title="Teachers"
                value={stats.teachers}
                icon={<Users className="h-6 w-6 text-emerald-400" />}
                gradient="bg-emerald-500"
                subtitle="Active teachers"
              />
              <StatCard
                title="Admins"
                value={stats.admins}
                icon={<ShieldCheck className="h-6 w-6 text-amber-400" />}
                gradient="bg-amber-500"
                subtitle="Admin accounts"
              />
              <StatCard
                title="Total Lessons"
                value={stats.totalLessons}
                icon={<BookOpen className="h-6 w-6 text-indigo-400" />}
                gradient="bg-indigo-500"
                subtitle="Across all students"
              />
              <StatCard
                title="Completed"
                value={stats.completedLessons}
                icon={<CheckCircle2 className="h-6 w-6 text-teal-400" />}
                gradient="bg-teal-500"
                subtitle="Lessons done"
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/admin/users"
                className="group rounded-2xl border border-white/6 bg-slate-800/30 p-6 transition-all hover:border-violet-500/30 hover:bg-slate-800/50"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15">
                  <Users className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Manage Users</h3>
                <p className="mt-1 text-sm text-slate-400">
                  View all users, create teacher accounts, remove accounts
                </p>
              </Link>

              <Link
                href="/admin/lessons"
                className="group rounded-2xl border border-white/6 bg-slate-800/30 p-6 transition-all hover:border-indigo-500/30 hover:bg-slate-800/50"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-white">All Lessons</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Browse all student lessons across the system
                </p>
              </Link>

              <div className="rounded-2xl border border-white/6 bg-slate-800/30 p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white">System Health</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {stats.totalLessons > 0
                    ? `${Math.round((stats.completedLessons / stats.totalLessons) * 100)}% of all lessons completed school-wide`
                    : "No lessons recorded yet"}
                </p>
              </div>
            </div>

            {/* Recent Users */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Users className="h-5 w-5 text-violet-400" /> Recent Users
                </h2>
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  View all →
                </Link>
              </div>

              {recentUsers === undefined ? (
                <LoadingSpinner text="Loading users..." />
              ) : recentUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/30 p-12 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                  <p className="text-slate-400">No users yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between rounded-xl border border-white/6 bg-slate-800/30 px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          u.role === "admin"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : u.role === "teacher"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-violet-500/20 bg-violet-500/10 text-violet-400"
                        }`}
                      >
                        {u.role}
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
