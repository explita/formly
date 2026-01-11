import { Path } from "../types/path";
import { FieldRegistrationOptions, InputChangeEvent } from "../types/utils";
import { useFormContext } from "./use-form-context";
import { useEffect, useId, useState } from "react";

export function useField<T extends Record<string, any>>(
  name: string,
  options?: FieldRegistrationOptions<T, Path<T>>
) {
  const form = useFormContext();
  //@ts-ignore
  form.register(name, options, true);

  const [value, setValue] = useState("");
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
    name,
    value: value || "",
    onChange: (e: InputChangeEvent) => {
      form.field(name).set(e.currentTarget.value);

      setValue(e.currentTarget.value);
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
    setValue: (value: any) => form.field(name).set(value),
    reset: () => {
      //@ts-ignore
      form.resetField(name);
      setValue("");
    },
    //@ts-ignore
    focus: () => form.focus(name),
    refId,
    bind: () => bind,
  };
}
