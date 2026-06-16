"use client";

import React, { useEffect } from "react";
import { useForm } from "../hooks/use-form.js";
import { FormDevTools } from "../components/devtools/main.js";
import { css } from "../lib/css.js";
import type { z } from "zod";
import { Path } from "../types/path.js";
import { SchemaType } from "../types/utils.js";
import { DevtoolBoundary } from "../components/devtools/types/index.js";
import { registry } from "../lib/form-registry.js";

export type FormContextValue<
  TSchema extends z.ZodObject | undefined = undefined,
  DefaultValues = TSchema extends undefined
    ? Record<string, any>
    : Partial<z.infer<TSchema>>,
  TComputed extends Record<string, any> = {},
  TAsyncValidation extends Record<string, any> = {},
  TSteps extends
    | Array<Array<Path<SchemaType<TSchema, DefaultValues>>>>
    | undefined = undefined,
> = ReturnType<
  typeof useForm<
    TSchema,
    DefaultValues,
    TComputed,
    TAsyncValidation,
    any,
    TSteps
  >
>;

type FormProps<
  TSchema extends z.ZodObject | undefined = undefined,
  DefaultValues = TSchema extends undefined
    ? Record<string, any>
    : Partial<z.infer<TSchema>>,
  TComputed extends Record<string, any> = {},
  TAsyncValidation extends Record<string, any> = {},
  TSteps extends
    | Array<Array<Path<SchemaType<TSchema, DefaultValues>>>>
    | undefined = undefined,
> = {
  use?: FormContextValue<
    TSchema,
    DefaultValues,
    TComputed,
    TAsyncValidation,
    TSteps
  >;
  children: React.ReactNode;
  as?: "form" | "div" | "section";
  className?: string;
  devTools?:
    | boolean
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left";
  devToolsBoundary?: DevtoolBoundary;
} & React.HTMLAttributes<HTMLFormElement | HTMLDivElement>;

export const FormContext = React.createContext<FormContextValue<
  any,
  any,
  any,
  any
> | null>(null);

/**
 * A component that wraps the useForm hook and provides the form context
 * to its children. It also provides a way to render the form as a
 * different HTML element and supports computed fields.
 *
 * @param {FormProps<TSchema, DefaultValues, TComputed>} props - The props for the Form component.
 * @returns {React.ReactNode} - The rendered Form component.
 *
 * @example
 *
 * const form = useForm({
 *   defaultValues: { name: "", age: 0 },
 *   computed: {
 *     fullName: {
 *       fn: (vals) => `${vals.name} (${vals.age})`,
 *       deps: ["name", "age"]
 *     }
 *   },
 *   onSubmit: (values) => console.log(values.fullName)
 * })
 *
 * <Form use={form}>
 *   <Field name="name" label="Name" />
 *   <Field name="age" label="Age" type="number" />
 * </Form>
 */
export function Form<
  TSchema extends z.ZodObject | undefined = undefined,
  DefaultValues = TSchema extends undefined
    ? Record<string, any>
    : Partial<z.infer<TSchema>>,
  TComputed extends Record<string, any> = {},
  TAsyncValidation extends Record<string, any> = {},
  TSteps extends
    | Array<Array<Path<SchemaType<TSchema, DefaultValues>>>>
    | undefined = undefined,
>({
  children,
  use,
  as = "form",
  className,
  onSubmit,
  devTools = true,
  devToolsBoundary = "viewport",
  ...rest
}: FormProps<TSchema, DefaultValues, TComputed, TAsyncValidation, TSteps>) {
  const formInstance = use ?? useForm();

  const Element = as;

  //@ts-ignore
  const submitFn = onSubmit || formInstance.onSubmit;

  const isProd =
    ((typeof process !== "undefined" &&
      process.env.NODE_ENV === "production") ||
      // @ts-ignore
      (typeof import.meta !== "undefined" && import.meta.env?.PROD)) &&
    !(
      typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_IS_EXAMPLES === "true"
    );

  const showDevTools = !isProd && devTools !== false;
  const devToolsPos = typeof devTools === "string" ? devTools : undefined;

  useEffect(() => {
    if (formInstance) {
      const prev = (formInstance as any)._devToolsEnabled;
      (formInstance as any)._devToolsEnabled = showDevTools;
      if (prev !== showDevTools) {
        registry.notify();
      }
    }
  }, [formInstance, showDevTools]);

  return (
    // @ts-ignore
    <FormContext.Provider value={formInstance}>
      <Element
        onSubmit={submitFn}
        className={`explita-form ${className ?? ""}`}
        data-form-id={formInstance.id}
        {...rest}
      >
        <style>{css}</style>
        {children}
        {showDevTools && (
          <FormDevTools
            //@ts-expect-error
            use={formInstance}
            position={devToolsPos}
            boundary={devToolsBoundary}
          />
        )}
      </Element>
    </FormContext.Provider>
  );
}
