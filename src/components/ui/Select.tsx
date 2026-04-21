import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  /** Text shown for the empty/default option. Defaults to "Select...". */
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, className = "", placeholder = "Select...", ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {label}
        </label>
        <select
          ref={ref}
          className={`w-full rounded-xl border bg-slate-800/50 px-4 py-2.5 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 ${
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
              : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/30 hover:border-white/20"
          } ${className}`}
          {...props}
        >
          <option value="" className="bg-slate-800">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
