"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LogOut } from "lucide-react";
import { useDashboardLayout } from "@/components/providers/DashboardLayoutProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default memo(function DashboardNavbar() {
  const router = useRouter();
  const { user, logout, sessionToken } = useAuthStore();
  const logoutMutation = useMutation(api.users.logout);
  const { collapsed, pageTitle, pageSubtitle, pageIconRef } = useDashboardLayout();
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    if (sessionToken) {
      try { await logoutMutation({ sessionToken }); } catch {}
    }
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const icon = pageIconRef.current;

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-white/6 bg-slate-950/80 px-6 backdrop-blur-xl transition-[left] duration-300 ease-in-out ${
          collapsed ? "left-[68px]" : "left-60"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && <span className="shrink-0">{icon}</span>}
          <h1 className="truncate text-base font-semibold text-white">{pageTitle}</h1>
          {pageSubtitle && (
            <>
              <span className="shrink-0 text-slate-600">·</span>
              <p className="truncate text-sm text-slate-400">{pageSubtitle}</p>
            </>
          )}
        </div>
        <button
          onClick={() => setShowLogout(true)}
          title="Logout"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>
      <ConfirmModal
        open={showLogout}
        title="Sign out"
        message="Are you sure you want to sign out? You'll need to log in again to access your account."
        confirmLabel="Sign out"
        cancelLabel="Stay"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
        isLoading={loggingOut}
      />
    </>
  );
});
