"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({
  allowedRoles,
  children,
  redirectTo = "/login",
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  // Initialize to true if Zustand has already rehydrated (common on navigations)
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    // Subscribe to finish-hydration event so we only unblock once localStorage is read
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "teacher") router.push("/teacher");
      else router.push("/dashboard");
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, router, redirectTo]);

  if (!hydrated || !isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
        <LoadingSpinner text="Checking access..." />
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
        <LoadingSpinner text="Redirecting..." />
      </div>
    );
  }

  return <>{children}</>;
}
