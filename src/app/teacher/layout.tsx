"use client";

import { DashboardLayoutProvider, useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { GraduationCap, ClipboardList } from "lucide-react";

const TEACHER_NAV = [
  { href: "/teacher", label: "Students", icon: GraduationCap },
  { href: "/teacher/lessons", label: "All Lessons", icon: ClipboardList },
];

function TeacherContent({ children }: { children: React.ReactNode }) {
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

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutProvider navItems={TEACHER_NAV} roleLabel="Teacher" basePath="/teacher">
      <TeacherContent>{children}</TeacherContent>
    </DashboardLayoutProvider>
  );
}
