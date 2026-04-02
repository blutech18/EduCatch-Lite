"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CalendarHeart,
  Users,
  ShieldCheck,
  GraduationCap,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import ConfirmModal from "@/components/ui/ConfirmModal";

// Nav items per role
const NAV_ITEMS: Record<UserRole, { href: string; label: string; icon: React.ReactNode }[]> = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/lessons", label: "Lessons", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/plan", label: "Catch-up Plan", icon: <CalendarHeart className="h-4 w-4" /> },
  ],
  teacher: [
    { href: "/teacher", label: "Students", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/teacher/lessons", label: "All Lessons", icon: <BookOpen className="h-4 w-4" /> },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/lessons", label: "All Lessons", icon: <BookOpen className="h-4 w-4" /> },
  ],
};

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  student: { label: "Student", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  teacher: { label: "Teacher", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  admin: { label: "Admin", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, sessionToken } = useAuthStore();
  const logoutMutation = useMutation(api.users.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    if (sessionToken) {
      try { await logoutMutation({ sessionToken }); } catch {}
    }
    logout();
    router.push("/login");
  };

  if (!isAuthenticated || !user) return null;

  const role = user.role ?? "student";
  const navItems = NAV_ITEMS[role];
  const badge = ROLE_BADGE[role];

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/dashboard"}
            className="flex items-center gap-2.5"
          >
            <Logo size="sm" />
            <span className="text-lg font-semibold text-white">
              EduCatch<span className="text-violet-400"> Lite</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-violet-500/15 text-violet-300 shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Role badge */}
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {/* Avatar + name */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-300">{user.name}</span>
            </div>
            <button
              onClick={() => setShowLogout(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/5 bg-slate-900/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-violet-500/15 text-violet-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{user.name}</p>
                  <span className={`text-xs font-medium ${badge.className.split(" ")[1]}`}>{badge.label}</span>
                </div>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); setShowLogout(true); }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-left text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
    <ConfirmModal
      open={showLogout}
      title="Sign out"
      message="Are you sure you want to sign out? You'll need to log in again to access your account."
      confirmLabel="Sign out"
      cancelLabel="Stay"
      onConfirm={handleLogout}
      onCancel={() => setShowLogout(false)}
      isLoading={loggingOut}
    />
    </>
  );
}