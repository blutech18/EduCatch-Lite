import { create } from "zustand";

interface LessonState {
  // Lessons page
  showForm: boolean;
  deletingId: string | null;
  filter: "all" | "pending" | "completed";
  // Actions
  setShowForm: (show: boolean) => void;
  toggleForm: () => void;
  setDeletingId: (id: string | null) => void;
  setFilter: (filter: "all" | "pending" | "completed") => void;
  reset: () => void;
}

export const useLessonStore = create<LessonState>()((set) => ({
  showForm: false,
  deletingId: null,
  filter: "all",
  setShowForm: (show) => set({ showForm: show }),
  toggleForm: () => set((s) => ({ showForm: !s.showForm })),
  setDeletingId: (id) => set({ deletingId: id }),
  setFilter: (filter) => set({ filter }),
  reset: () => set({ showForm: false, deletingId: null, filter: "all" }),
}));
