"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", rows = 6, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {label}
        </label>
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full resize-y rounded-xl border bg-slate-800/50 px-4 py-2.5 text-sm leading-relaxed text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 ${
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
              : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/30 hover:border-white/20"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-red-400">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
