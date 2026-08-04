import { Path, PathValue } from "../types/path.js";
import { FieldRegistrationOptions, InputChangeEvent } from "../types/utils.js";
import { useFormContext } from "./use-form-context.js";
import { useCallback, useEffect, useId, useState } from "react";

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

  const [value, setFieldValue] = useState<PathValue<T, P>>(
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

    const handleUpdate = (newVal: any) => {
      setFieldValue(newVal);
      //@ts-ignore
      setIsDirty(form.isDirty(name));
      //@ts-ignore
      setIsTouched(form.isTouched(name));
    };

    //@ts-ignore
    form.subscribe(name, handleUpdate, { internalRef: refId });
    //@ts-ignore
    form.subscribeFieldError(name, setError);

    return () => {
      //@ts-ignore
      form.unsubscribeField(name, handleUpdate);
    };
  }, [name]);

  // ── Memoized callbacks ─────────────────────────────────────────────
  // Keep stable identities across re-renders. Consumers pass these as props
  // (e.g. `onValueChange` on the TextEditor), and a fresh reference every
  // render would re-fire their effects (e.g. re-emitting stale content after
  // form.reset()). `form` itself is recreated each render by useForm, but all
  // of its methods are useCallback-stable, so we depend only on `name` (and
  // read fresh state via the stable setState setters).
  const setValue = useCallback(
    (value: PathValue<T, P & Path<T>>) =>
      form.field(name as any).set(value as any),
    [name],
  );

  const handleChange = useCallback(
    (e: InputChangeEvent) => {
      const val = (e as any)?.target ? (e as any).target.value : e;
      form.field(name as any).set(val as any);

      setFieldValue(val as any);
      setIsDirty(true);
    },
    [name],
  );

  const handleBlur = useCallback(() => {
    //@ts-ignore
    form.markTouched(name);
    setIsTouched(true);
    //@ts-ignore
    if (form.validateOn === "blur") form.field(name).validate();
  }, [name]);

  const reset = useCallback(() => {
    //@ts-ignore
    form.resetField(name);
    setFieldValue(form.getValue(name as any) as any);
    setIsDirty(false);
    setIsTouched(false);
  }, [name]);

  const validate = useCallback(() => {
    //@ts-ignore
    return form.field(name as any).validate();
  }, [name]);

  //@ts-ignore
  const focus = useCallback(() => form.focus(name), [name]);

  // Field helpers
  const bind = {
    name: name as string,
    value: (value ?? "") as any,
    onChange: handleChange,
    onBlur: handleBlur,
    "data-input-ref": refId,
    "data-input-error": !!error,
    "aria-invalid": !!error,
  };

  return {
    value,
    error,
    hasError: !!error,
    isTouched,
    touched: isTouched,
    isDirty,
    dirty: isDirty,
    setValue,
    reset,
    validate,
    focus,
    refId,
    bind: () => bind,
  };
}
