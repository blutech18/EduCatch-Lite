"use client";

import { useEffect, useRef } from "react";
import { X, BookOpen } from "lucide-react";

interface LessonReaderModalProps {
  open: boolean;
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard" | string;
  lessonDate: string;
  estimatedMinutes: number;
  content: string;
  assignedTo?: string; // e.g. "Student: Jane Doe" or "Assigned to 5 students"
  onClose: () => void;
}

const difficultyStyles: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

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
    // Prevent background scroll while the modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/6 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="wrap-break-word text-lg font-semibold text-white">
                {title}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">
                  {subject}
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                    difficultyStyles[difficulty] ?? difficultyStyles.medium
                  }`}
                >
                  {difficulty}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(lessonDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs text-slate-500">
                  • {estimatedMinutes} min
                </span>
              </div>
              {assignedTo && (
                <p className="mt-1.5 text-xs text-slate-500">{assignedTo}</p>
              )}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {content.trim().length === 0 ? (
            <p className="text-sm italic text-slate-500">
              No lesson content was provided.
            </p>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {content}
            </p>
          )}
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
