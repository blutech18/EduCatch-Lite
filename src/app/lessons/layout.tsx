"use client";

import { DashboardLayoutProvider, useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { LayoutDashboard, BookOpen, CalendarHeart } from "lucide-react";

const STUDENT_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/plan", label: "Catch-up Plan", icon: CalendarHeart },
];

function StudentContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useDashboardLayout();
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

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutProvider navItems={STUDENT_NAV} roleLabel="Student" basePath="/dashboard">
      <StudentContent>{children}</StudentContent>
    </DashboardLayoutProvider>
  );
}
