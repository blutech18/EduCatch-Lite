import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface TeacherState {
  // Student overview
  expandedStudentId: Id<"users"> | null;
  // Lesson form
  showLessonForm: boolean;
  // Actions
  setExpandedStudentId: (id: Id<"users"> | null) => void;
  toggleStudent: (id: Id<"users">) => void;
  setShowLessonForm: (show: boolean) => void;
  toggleLessonForm: () => void;
  reset: () => void;
}

export const useTeacherStore = create<TeacherState>()((set) => ({
  expandedStudentId: null,
  showLessonForm: false,
  setExpandedStudentId: (id) => set({ expandedStudentId: id }),
  toggleStudent: (id) =>
    set((s) => ({
      expandedStudentId: s.expandedStudentId === id ? null : id,
    })),
  setShowLessonForm: (show) => set({ showLessonForm: show }),
  toggleLessonForm: () => set((s) => ({ showLessonForm: !s.showLessonForm })),
  reset: () => set({ expandedStudentId: null, showLessonForm: false }),
}));
