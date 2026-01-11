"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { useFieldContext } from "./field";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  const { id, required, hasError, label } = useFieldContext();

  if (!label) return;

  return (
    <label
      data-slot="label"
      htmlFor={id}
      data-required={required}
      aria-required={required}
      data-error={hasError}
      aria-invalid={hasError}
      className={cn("form-label", className)}
      {...props}
    >
      {label}
    </label>
  );
}
