import { memo } from "react";

export default memo(function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative h-12 w-12">
        <div className="absolute h-full w-full rounded-full border-4 border-slate-700" />
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-transparent border-t-violet-500" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-400">{text}</p>
    </div>
  );
})
