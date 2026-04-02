import { create } from "zustand";

type UserFilter = "all" | "student" | "teacher" | "admin";
type LessonFilter = "all" | "pending" | "completed";

interface AdminState {
  // Users page
  userFilter: UserFilter;
  showTeacherForm: boolean;
  deletingUserId: string | null;
  // Lessons page
  lessonFilter: LessonFilter;
  // Actions
  setUserFilter: (filter: UserFilter) => void;
  setShowTeacherForm: (show: boolean) => void;
  toggleTeacherForm: () => void;
  setDeletingUserId: (id: string | null) => void;
  setLessonFilter: (filter: LessonFilter) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  userFilter: "all",
  showTeacherForm: false,
  deletingUserId: null,
  lessonFilter: "all",
  setUserFilter: (filter) => set({ userFilter: filter }),
  setShowTeacherForm: (show) => set({ showTeacherForm: show }),
  toggleTeacherForm: () => set((s) => ({ showTeacherForm: !s.showTeacherForm })),
  setDeletingUserId: (id) => set({ deletingUserId: id }),
  setLessonFilter: (filter) => set({ lessonFilter: filter }),
  reset: () => set({ userFilter: "all", showTeacherForm: false, deletingUserId: null, lessonFilter: "all" }),
}));
