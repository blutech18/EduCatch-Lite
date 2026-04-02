"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import {
  LayoutDashboard,
  BookOpen,
  CalendarHeart,
  Users,
  GraduationCap,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

const NAV_ITEMS: Record<UserRole, { href: string; label: string; icon: React.ReactNode }[]> = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/lessons", label: "Lessons", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/plan", label: "Catch-up Plan", icon: <CalendarHeart className="h-5 w-5" /> },
  ],
  teacher: [
    { href: "/teacher", label: "Students", icon: <GraduationCap className="h-5 w-5" /> },
    { href: "/teacher/lessons", label: "All Lessons", icon: <ClipboardList className="h-5 w-5" /> },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { href: "/admin/lessons", label: "All Lessons", icon: <BookOpen className="h-5 w-5" /> },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const role = user.role ?? "student";
  const navItems = NAV_ITEMS[role];

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/[0.06] lg:bg-slate-900/50 lg:pt-20 lg:backdrop-blur-xl">
      <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
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
      </nav>

      {/* Role indicator */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs capitalize text-slate-500">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
