"use client";

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutState {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  pageTitle: string;
  pageSubtitle: string;
  pageIconRef: React.RefObject<ReactNode>;
  setHeader: (title: string, subtitle: string, icon?: ReactNode) => void;
  navItems: NavItem[];
  roleLabel: string;
  basePath: string;
}

const DashboardLayoutContext = createContext<DashboardLayoutState | null>(null);

interface Props {
  children: ReactNode;
  navItems: NavItem[];
  roleLabel: string;
  basePath: string;
}

export function DashboardLayoutProvider({ children, navItems, roleLabel, basePath }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const pageIconRef = useRef<ReactNode>(null);

  const setHeader = useCallback((title: string, subtitle: string, icon?: ReactNode) => {
    pageIconRef.current = icon ?? null;
    setPageTitle(title);
    setPageSubtitle(subtitle);
  }, []);

  return (
    <DashboardLayoutContext.Provider
      value={{ collapsed, setCollapsed, pageTitle, pageSubtitle, pageIconRef, setHeader, navItems, roleLabel, basePath }}
    >
      {children}
    </DashboardLayoutContext.Provider>
  );
}

export function useDashboardLayout() {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx) throw new Error("useDashboardLayout must be used within DashboardLayoutProvider");
  return ctx;
}
