import React, { JSX, ReactNode, useEffect, useRef, useState } from "react";
import { FormContextValue } from "../providers/form";
import { Path, PathValue } from "../types/path";

// Overload 1: select is provided
export function FormSpy<
  DefaultValues extends Record<string, any>,
  P extends Path<DefaultValues>
>({
  form,
  watch,
  render,
}: {
  form: FormContextValue<undefined, DefaultValues>;
  render: (selected: PathValue<DefaultValues, P>) => ReactNode;
  watch: P;
}): JSX.Element;

// Overload 2: select is not provided
export function FormSpy<
  DefaultValues extends Record<string, any>,
  P extends Path<DefaultValues>
>({
  form,
  render,
}: {
  form: FormContextValue<undefined, DefaultValues>;
  render: (selected: DefaultValues) => ReactNode;
}): JSX.Element;

export function FormSpy<
  DefaultValues extends Record<string, any>,
  P extends Path<DefaultValues>
>({
  form,
  watch,
  render,
}: {
  form: FormContextValue<undefined, DefaultValues>;
  watch?: P;
  render: (selected: PathValue<DefaultValues, P>) => ReactNode;
}) {
  const [selected, setSelected] = useState(() =>
    watch ? form.field(watch).get() : form.values
  ) as any;

  const prevRef = useRef(selected);

  useEffect(() => {
    const unsubscribe = form.subscribe((values) => {
      const next = watch ? form.field(watch).get() : values;
      if (JSON.stringify(prevRef.current) !== JSON.stringify(next)) {
        prevRef.current = next;
        setSelected(next);
      }
    });

    return unsubscribe;
  }, [form, watch]);

  return <>{render(selected)}</>;
}

export function FormSpyDebug<DefaultValues extends Record<string, any>>({
  form,
  watch,
}: {
  form: FormContextValue<undefined, DefaultValues>;
  watch?: Path<DefaultValues>;
}) {
  return (
    <FormSpy
      form={form}
      //@ts-ignore
      watch={watch}
      render={(v) => (
        <pre
          style={{
            whiteSpace: "pre-wrap", // allow wrapping
            wordBreak: "break-word", // break long words
            overflowWrap: "break-word", // extra safety
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            width: "100%",
          }}
        >
          {JSON.stringify(v, null, 2)}
        </pre>
      )}
    />
  );
}
