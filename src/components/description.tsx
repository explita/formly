"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { useFieldContext } from "./field.js";

export function Description({
  className,
  children,
  as,
  ...props
}: React.ComponentProps<"p"> & { as?: any }) {
  const { id, description } = useFieldContext();
  const content = children ?? description;

  if (!content) return null;

  const Component = as || "p";

  return (
    <Component
      id={id ? `${id}-description` : undefined}
      data-slot="description"
      className={cn("form-description", className)}
      {...props}
    >
      {content}
    </Component>
  );
}
