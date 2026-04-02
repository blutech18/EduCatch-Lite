"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ChevronLeft } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { collapsed, setCollapsed, navItems, roleLabel, basePath } = useDashboardLayout();

  if (!user) return null;

  return (
    <aside
      style={{ width: collapsed ? 68 : 240 }}
      className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] bg-slate-900/80 backdrop-blur-xl transition-[width] duration-300 ease-in-out"
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/[0.06] overflow-hidden">
        <div className="flex h-16 w-[68px] shrink-0 items-center justify-center">
          <Logo size="sm" />
        </div>
        <span
          style={{ opacity: collapsed ? 0 : 1 }}
          className="whitespace-nowrap text-base font-semibold text-white transition-opacity duration-300 ease-in-out"
        >
          EduCatch<span className="text-violet-400"> Lite</span>
        </span>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{ top: 20 }}
        className="absolute -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
      >
        <ChevronLeft
          className="h-3.5 w-3.5 transition-transform duration-300 ease-in-out"
          style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 py-5 overflow-x-hidden">
        <p
          style={{ opacity: collapsed ? 0 : 1 }}
          className="mb-1 whitespace-nowrap px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-opacity duration-300 ease-in-out"
        >
          Navigation
        </p>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== basePath && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group mx-2 flex h-10 items-center overflow-hidden rounded-xl text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex w-[52px] shrink-0 items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <span
                style={{ opacity: collapsed ? 0 : 1 }}
                className="whitespace-nowrap transition-opacity duration-300 ease-in-out"
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.06] py-3 overflow-x-hidden">
        <div className="mx-2 flex h-10 items-center rounded-xl bg-slate-800/50">
          <div className="flex w-[52px] shrink-0 items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div
            style={{ opacity: collapsed ? 0 : 1 }}
            className="min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-300 ease-in-out"
          >
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-slate-500">{roleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
