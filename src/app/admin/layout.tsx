"use client";

import { DashboardLayoutProvider } from "@/components/providers/DashboardLayoutProvider";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { useDashboardLayoutStore } from "@/store/dashboardLayoutStore";
import { LayoutDashboard, Users, BookOpen } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/lessons", label: "All Lessons", icon: BookOpen },
];

function AdminContent({ children }: { children: React.ReactNode }) {
  const collapsed = useDashboardLayoutStore((s) => s.collapsed);
  return (
    <div
      style={{ paddingLeft: collapsed ? 68 : 240 }}
      className="min-h-screen bg-slate-950 transition-[padding-left] duration-300 ease-in-out"
    >
      <DashboardSidebar />
      <DashboardNavbar />
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutProvider navItems={ADMIN_NAV} roleLabel="Admin" basePath="/admin">
      <AdminContent>{children}</AdminContent>
    </DashboardLayoutProvider>
  );
}
