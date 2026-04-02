import { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-800/30 px-8 py-16 text-center">
      <span className="mb-4 text-5xl">{icon}</span>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="max-w-sm text-sm text-slate-400">{description}</p>
    </div>
  );
}
