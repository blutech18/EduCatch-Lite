"use client";

import { useEffect, useRef, ReactNode } from "react";
import { X, BookOpen } from "lucide-react";

interface LessonReaderModalProps {
  open: boolean;
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard" | string;
  lessonDate: string;
  estimatedMinutes: number;
  content: string;
  assignedTo?: string; // e.g. "Student User (student@x.com)" or "All 5 students"
  onClose: () => void;
}

const difficultyStyles: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

/**
 * Read-only field that visually matches `Input` / `Select` / `Textarea` so the
 * lesson viewer looks like the Add Lesson form.
 */
function ReadOnlyField({
  label,
  children,
  multiline = false,
}: {
  label: string;
  children: ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div
        className={`w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white ${
          multiline
            ? "min-h-40 leading-relaxed whitespace-pre-wrap wrap-anywhere"
            : "wrap-anywhere"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function LessonReaderModal({
  open,
  title,
  subject,
  difficulty,
  lessonDate,
  estimatedMinutes,
  content,
  assignedTo,
  onClose,
}: LessonReaderModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const formattedDate = new Date(lessonDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/6 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">
                Lesson Details
              </h2>
              <p className="text-xs text-slate-500">
                View the lesson as your student will see it.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — form-style read-only fields */}
        <div className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-6 py-6">
          {assignedTo && <ReadOnlyField label="Student">{assignedTo}</ReadOnlyField>}

          <ReadOnlyField label="Lesson Title">{title}</ReadOnlyField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Subject">
              <span className="inline-block rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">
                {subject}
              </span>
            </ReadOnlyField>
            <ReadOnlyField label="Difficulty">
              <span
                className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                  difficultyStyles[difficulty] ?? difficultyStyles.medium
                }`}
              >
                {difficulty}
              </span>
            </ReadOnlyField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Lesson Date">{formattedDate}</ReadOnlyField>
            <ReadOnlyField label="Estimated Minutes">
              {estimatedMinutes} min
            </ReadOnlyField>
          </div>

          <ReadOnlyField label="Lesson Content" multiline>
            {content.trim().length === 0 ? (
              <span className="italic text-slate-500">
                No lesson content was provided.
              </span>
            ) : (
              content
            )}
          </ReadOnlyField>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/6 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
