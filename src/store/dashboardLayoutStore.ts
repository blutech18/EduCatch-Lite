import { create } from "zustand";
import { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutState {
  // Persists across navigations within same session
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Page header (updated per-page via setHeader)
  pageTitle: string;
  pageSubtitle: string;
  pageIcon: ReactNode;
  setHeader: (title: string, subtitle: string, icon?: ReactNode) => void;

  // Layout config (set by each role layout)
  navItems: NavItem[];
  roleLabel: string;
  basePath: string;
  setLayoutConfig: (navItems: NavItem[], roleLabel: string, basePath: string) => void;
}

export const useDashboardLayoutStore = create<DashboardLayoutState>()((set, get) => ({
  collapsed: false,
  setCollapsed: (v) =>
    set((s) => ({ collapsed: typeof v === "function" ? v(s.collapsed) : v })),

  pageTitle: "",
  pageSubtitle: "",
  pageIcon: null,
  setHeader: (title, subtitle, icon) => {
    const s = get();
    if (s.pageTitle === title && s.pageSubtitle === subtitle && icon === undefined) return;
    set({ pageTitle: title, pageSubtitle: subtitle, pageIcon: icon ?? s.pageIcon });
  },

  navItems: [],
  roleLabel: "",
  basePath: "",
  setLayoutConfig: (navItems, roleLabel, basePath) => {
    const s = get();
    if (s.navItems === navItems && s.roleLabel === roleLabel && s.basePath === basePath) return;
    set({ navItems, roleLabel, basePath });
  },
}));
