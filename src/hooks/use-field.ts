import { Path, PathValue } from "../types/path.js";
import { FieldRegistrationOptions, InputChangeEvent } from "../types/utils.js";
import { useFormContext } from "./use-form-context.js";
import { useEffect, useId, useState } from "react";

/**
 * useField hook for managing a single form field's state.
 * Supports explicit schema typing via useField<Schema>("path").
 */
export function useField<
  T extends Record<string, any>,
  P extends Path<T> = any,
>(name: P, options?: FieldRegistrationOptions<T, P>) {
  const form = useFormContext<T>();
  //@ts-ignore
  form.register(name, options, true);

  const [value, setValue] = useState<PathValue<T, P>>(
    //@ts-ignore
    form.getValue(name),
  );
  const [error, setError] = useState<string | undefined>("");
  //@ts-ignore
  const [isDirty, setIsDirty] = useState<boolean>(form.isDirty(name));
  //@ts-ignore
  const [isTouched, setIsTouched] = useState<boolean>(form.isTouched(name));

  const refId = name + "-" + useId();

  useEffect(() => {
    if (!form || !name) return;

    //@ts-ignore
    form.subscribe(name, setValue, { internalRef: refId });
    //@ts-ignore
    form.subscribeFieldError(name, setError);

    return () => {
      //@ts-ignore
      form.unsubscribeField(name, setValue);
    };
  }, [name]);

  // Field helpers
  const bind = {
    name: name as string,
    value: (value ?? "") as any,
    onChange: (e: InputChangeEvent) => {
      const val = (e as any)?.target ? (e as any).target.value : e;
      form.field(name as any).set(val as any);

      setValue(val as any);
      setIsDirty(true);
    },
    onBlur: () => {
      //@ts-ignore
      form.markTouched(name);
      setIsTouched(true);
      //@ts-ignore
      if (form.validateOn === "blur") form.field(name).validate();
    },
    "data-input-ref": refId,
    "data-input-error": !!error,
    "aria-invalid": !!error,
  };

  return {
    value,
    error,
    hasError: !!error,
    isTouched,
    setValue: (value: PathValue<T, P & Path<T>>) =>
      form.field(name as any).set(value as any),
    reset: () => {
      //@ts-ignore
      form.resetField(name);
      setValue(form.getValue(name as any) as any);
    },
    //@ts-ignore
    focus: () => form.focus(name),
    refId,
    bind: () => bind,
  };
}
