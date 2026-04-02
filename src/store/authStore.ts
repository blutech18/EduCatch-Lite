import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Id } from "../../convex/_generated/dataModel";

export type UserRole = "student" | "teacher" | "admin";

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, sessionToken: string) => void;
  logout: () => void;
}

function setSessionCookie(token: string, role: string) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  document.cookie = `session_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearSessionCookies() {
  document.cookie = "session_token=; path=/; max-age=0";
  document.cookie = "user_role=; path=/; max-age=0";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      login: (user: User, sessionToken: string) => {
        setSessionCookie(sessionToken, user.role);
        set({ user, sessionToken, isAuthenticated: true });
      },
      logout: () => {
        clearSessionCookies();
        set({ user: null, sessionToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "educatch-auth",
    }
  )
);
