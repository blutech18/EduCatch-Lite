"use client";

import { DashboardLayoutProvider, useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
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
      className="transition-[padding-left] duration-300 ease-in-out"
    >
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
