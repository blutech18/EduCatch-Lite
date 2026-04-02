import { ReactNode } from "react";

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  gradient: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: CardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-800/50 p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/20">
      {/* Gradient glow */}
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${gradient} opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-30`}
      />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">{title}</span>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
