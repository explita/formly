import React from "react";
import { useFieldContext } from "../";

export function FieldError() {
  const { message } = useFieldContext();

  if (!message) return null;

  return (
    <p data-error="true" style={{ color: "red", fontSize: "0.75rem" }}>
      {message}
    </p>
  );
}
