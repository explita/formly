import React, { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = "", children, ...props }: LabelProps) {
  return (
    <label
      className={`flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
