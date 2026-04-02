"use client";

import { DashboardLayoutProvider, useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import { LayoutDashboard, Users, BookOpen } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/lessons", label: "All Lessons", icon: BookOpen },
];

function AdminContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useDashboardLayout();
  return (
    <div
      style={{ paddingLeft: collapsed ? 68 : 240 }}
      className="transition-[padding-left] duration-300 ease-in-out"
    >
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
