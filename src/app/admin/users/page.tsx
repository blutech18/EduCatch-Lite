"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import RoleGuard from "@/components/auth/RoleGuard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { useDashboardLayoutStore } from "@/store/dashboardLayoutStore";
import { Users, Trash2, UserPlus, GraduationCap, ShieldCheck } from "lucide-react";
import bcrypt from "bcryptjs";

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <UsersManager />
    </RoleGuard>
  );
}

function UsersManager() {
  const sessionToken = useAuthStore((s) => s.sessionToken);
  const setHeader = useDashboardLayoutStore((s) => s.setHeader);
  const users = useQuery(api.admin.getAllUsers, sessionToken ? { sessionToken } : "skip");
  const headerIcon = useMemo(() => <Users className="h-5 w-5 text-violet-400" />, []);

  useEffect(() => {
    setHeader("User Management", `${users?.length ?? 0} total users registered`, headerIcon);
  }, [setHeader, users?.length, headerIcon]);

  const createTeacher = useMutation(api.admin.createTeacher);
  const deleteUser = useMutation(api.admin.deleteUser);

  const userFilter = useAdminStore((s) => s.userFilter);
  const setUserFilter = useAdminStore((s) => s.setUserFilter);
  const showTeacherForm = useAdminStore((s) => s.showTeacherForm);
  const toggleTeacherForm = useAdminStore((s) => s.toggleTeacherForm);
  const setShowTeacherForm = useAdminStore((s) => s.setShowTeacherForm);
  const deletingUserId = useAdminStore((s) => s.deletingUserId);
  const setDeletingUserId = useAdminStore((s) => s.setDeletingUserId);

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTeacher = async () => {
    setFormError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const hashed = await bcrypt.hash(formData.password, 10);
      await createTeacher({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: hashed,
        sessionToken: sessionToken ?? undefined,
      });
      setFormData({ name: "", email: "", password: "" });
      setErrors({});
      setShowTeacherForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create teacher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: Id<"users">) => {
    setDeletingUserId(userId);
    try {
      await deleteUser({ userId, sessionToken: sessionToken ?? undefined });
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = useMemo(
    () => users?.filter((u) => userFilter === "all" || u.role === userFilter),
    [users, userFilter]
  );

  const roleBadge = useCallback((role: string) => {
    if (role === "admin") return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    if (role === "teacher") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    return "border-violet-500/20 bg-violet-500/10 text-violet-400";
  }, []);

  return (
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex items-center justify-end">
          <Button onClick={toggleTeacherForm} variant={showTeacherForm ? "secondary" : "primary"}>
            {showTeacherForm ? "Cancel" : <><UserPlus className="h-4 w-4" /> Add Teacher</>}
          </Button>
        </div>

        {showTeacherForm && (
          <div className="mb-8 rounded-2xl border border-white/6 bg-slate-900/50 p-6 sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
              <GraduationCap className="h-5 w-5 text-emerald-400" /> Create Teacher Account
            </h2>
            <div className="space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{formError}</div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Full Name" placeholder="Jane Smith" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} error={errors.name} />
                <Input label="Email" type="email" placeholder="teacher@school.edu" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} error={errors.email} />
                <Input label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} error={errors.password} />
              </div>
              <Button onClick={handleCreateTeacher} isLoading={isSubmitting}>Create Teacher</Button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-5 flex gap-2">
          {(["all", "student", "teacher", "admin"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setUserFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                userFilter === f ? "bg-violet-500/15 text-violet-300" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {users === undefined ? (
          <LoadingSpinner text="Loading users..." />
        ) : filteredUsers?.length === 0 ? (
          <EmptyState icon={<Users className="mx-auto h-12 w-12 text-slate-500" />} title="No users found" description="No users match this filter." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-slate-800/30">
            <div className="grid grid-cols-12 gap-4 border-b border-white/5 px-5 py-3">
              <p className="col-span-4 text-xs font-medium uppercase tracking-wider text-slate-500">User</p>
              <p className="col-span-3 text-xs font-medium uppercase tracking-wider text-slate-500">Email</p>
              <p className="col-span-2 text-xs font-medium uppercase tracking-wider text-slate-500">Role</p>
              <p className="col-span-2 text-xs font-medium uppercase tracking-wider text-slate-500">Joined</p>
              <p className="col-span-1 text-xs font-medium uppercase tracking-wider text-slate-500">Action</p>
            </div>
            {filteredUsers?.map((u) => (
              <div key={u._id} className="grid grid-cols-12 items-center gap-4 border-b border-white/4 px-5 py-4 transition-colors last:border-0 hover:bg-white/2">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">{u.name.charAt(0).toUpperCase()}</div>
                  <span className="truncate text-sm font-medium text-white">{u.name}</span>
                </div>
                <p className="col-span-3 truncate text-sm text-slate-400">{u.email}</p>
                <div className="col-span-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge(u.role)}`}>{u.role}</span>
                </div>
                <p className="col-span-2 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <div className="col-span-1">
                  {u.role !== "admin" ? (
                    <Button variant="danger" size="sm" isLoading={deletingUserId === u._id} onClick={() => handleDelete(u._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <span title="Admin accounts cannot be deleted"><ShieldCheck className="h-4 w-4 text-amber-400/50" /></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
  );
}
