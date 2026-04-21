"use client";

import { useEffect, ReactNode } from "react";
import { useDashboardLayoutStore } from "@/store/dashboardLayoutStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  children: ReactNode;
  navItems: NavItem[];
  roleLabel: string;
  basePath: string;
}

export function DashboardLayoutProvider({ children, navItems, roleLabel, basePath }: Props) {
  const setLayoutConfig = useDashboardLayoutStore((s) => s.setLayoutConfig);

  useEffect(() => {
    setLayoutConfig(navItems, roleLabel, basePath);
  }, [navItems, roleLabel, basePath, setLayoutConfig]);

  return <>{children}</>;
}

export function useDashboardLayout() {
  return {
    collapsed: useDashboardLayoutStore((s) => s.collapsed),
    setCollapsed: useDashboardLayoutStore((s) => s.setCollapsed),
    pageTitle: useDashboardLayoutStore((s) => s.pageTitle),
    pageSubtitle: useDashboardLayoutStore((s) => s.pageSubtitle),
    pageIcon: useDashboardLayoutStore((s) => s.pageIcon),
    setHeader: useDashboardLayoutStore((s) => s.setHeader),
    navItems: useDashboardLayoutStore((s) => s.navItems),
    roleLabel: useDashboardLayoutStore((s) => s.roleLabel),
    basePath: useDashboardLayoutStore((s) => s.basePath),
  };
}
