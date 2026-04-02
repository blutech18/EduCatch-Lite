import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface TeacherState {
  // Student overview
  expandedStudentId: Id<"users"> | null;
  // Actions
  setExpandedStudentId: (id: Id<"users"> | null) => void;
  toggleStudent: (id: Id<"users">) => void;
  reset: () => void;
}

export const useTeacherStore = create<TeacherState>()((set) => ({
  expandedStudentId: null,
  setExpandedStudentId: (id) => set({ expandedStudentId: id }),
  toggleStudent: (id) =>
    set((s) => ({
      expandedStudentId: s.expandedStudentId === id ? null : id,
    })),
  reset: () => set({ expandedStudentId: null }),
}));
