import React from "react";
import { useFieldContext } from "../index.js";

export function FieldError() {
  const { message } = useFieldContext();

  if (!message) return null;

  return (
    <p className="field-error" data-error="true">
      {message}
    </p>
  );
}
