import React, { createContext, JSX, use } from "react";
import { FieldError, Label, useField } from "../";
import { FieldContextType, FieldProps } from "../types/utils";

const FieldContext = createContext<FieldContextType | null>(null);

export function useFieldContext(): FieldContextType {
  const fieldContext = use(FieldContext);

  if (!fieldContext) {
    return {
      name: "",
      label: "",
      id: "",
      message: "",
      required: false,
      hasError: false,
    };
  }

  return fieldContext;
}

export function Field<T>({
  name,
  id,
  label,
  as,
  required,
  hideError = false,
  className,
  children,
  render,
  ...rest
}: FieldProps<T>): JSX.Element {
  //@ts-ignore
  const field = useField(name, { ...rest });

  // Pick whichever function/render prop is provided
  const renderFn = children || render;
  if (!renderFn) return <></>;

  const bind = {
    ...field.bind(),
    id: id ?? field.refId,
  };

  const value = field.value;
  const error = field.error;
  const hasFieldError = error && error?.length > 0 ? true : false;
  const hasError = !hideError && hasFieldError;
  const setValue = field.setValue;

  const isBoolean = as === "checkbox";

  const fieldContextValue = {
    name: name?.toString(),
    label,
    id: bind.id,
    message: error,
    required,
    hasError,
  };

  const meta = {
    internalRef: field.refId,
    name,
    value,
    error,
    hasError: hasFieldError ?? false,
    onChange: field.setValue,
  };

  if (isBoolean) {
    return (
      <FieldContext value={fieldContextValue}>
        {renderFn(
          {
            ...bind,
            //@ts-ignore
            checked: !!value,
            onCheckedChange: (val: boolean) => {
              setValue(val);
            },
          },
          meta
        )}
      </FieldContext>
    );
  }

  if (as === "select" || as === "date") {
    return (
      <FieldContext value={fieldContextValue}>
        <div
          data-slot="field"
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          className={className}
        >
          <Label />
          {renderFn(
            {
              ...bind,
              //@ts-ignore
              onValueChange: (val: string) => {
                setValue(val);
              },
              "data-input-error": hasError,
            },
            meta
          )}
          {hasError && <FieldError />}
        </div>
      </FieldContext>
    );
  }

  return (
    <FieldContext value={fieldContextValue}>
      <div
        data-slot="field"
        style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        className={className}
      >
        <Label />
        {renderFn(
          {
            ...bind,
            "data-input-error": hasError,
          },
          meta
        )}
        {hasError && <FieldError />}
      </div>
    </FieldContext>
  );
}
