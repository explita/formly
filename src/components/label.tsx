"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { useFieldContext } from "./field.js";

export function Label({ className, as, ...props }: React.ComponentProps<"label"> & { as?: any }) {
  const { id, required, hasError, label } = useFieldContext();

  if (!label) return null;

  // Detect if the passed label is already an element that renders a label, to avoid nested labels
  const isLabelElement = React.isValidElement(label) && (
    (typeof label.type === "string" && label.type === "label") ||
    (typeof label.type === "function" && label.type.name === "Label")
  );

  const Component = as || (isLabelElement ? "span" : "label");

  return (
    <Component
      data-slot="label"
      {...(Component === "label" ? { htmlFor: id } : {})}
      data-required={required}
      aria-required={required}
      data-error={hasError}
      aria-invalid={hasError}
      className={cn("form-label", className)}
      {...props}
    >
      {label}
    </Component>
  );
}
