import { memo } from "react";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

export default memo(function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = "md",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightMap = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const getColor = () => {
    if (clampedValue >= 80) return "from-emerald-500 to-green-400";
    if (clampedValue >= 50) return "from-amber-500 to-yellow-400";
    return "from-violet-500 to-indigo-400";
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-slate-400">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-white">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div
        className={`${heightMap[size]} w-full overflow-hidden rounded-full bg-slate-700/50`}
      >
        <div
          className={`${heightMap[size]} rounded-full bg-linear-to-r ${getColor()} transition-all duration-700 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
})
