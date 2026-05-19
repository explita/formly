import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  focusClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, focusClassName, ...props }, ref) => {
    const borderClass = hasError
      ? "border-red-500/50"
      : "border-slate-200 dark:border-slate-800";

    const focusClass = hasError
      ? "focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
      : focusClassName ||
        "focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/30";

    return (
      <input
        ref={ref}
        className={`w-full text-sm bg-slate-50 dark:bg-slate-950/50 border rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 ${borderClass} ${focusClass} ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
