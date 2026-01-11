"use client";

import React from "react";
import { useForm } from "../hooks/use-form";
import { css } from "../lib/css";
import type { z } from "zod";

export type FormContextValue<
  TSchema extends z.ZodObject | undefined = undefined,
  DefaultValues = TSchema extends undefined
    ? Record<string, any>
    : Partial<z.infer<TSchema>>
> = ReturnType<typeof useForm<TSchema, DefaultValues>>;

type FormProps<
  TSchema extends z.ZodObject | undefined = undefined,
  DefaultValues = TSchema extends undefined
    ? Record<string, any>
    : Partial<z.infer<TSchema>>
> = {
  use?: FormContextValue<TSchema, DefaultValues>;
  children: React.ReactNode;
  as?: "form" | "div" | "section";
  className?: string;
} & React.HTMLAttributes<HTMLFormElement | HTMLDivElement>;

// export const FormContext = createContext<FormContextValue | null>(null);
export const FormContext = React.createContext<FormContextValue<any> | null>(
  null
);

/**
 * A component that wraps the useForm hook and provides the form context
 * to its children. It also provides a way to render the form as a
 * different HTML element.
 *
 * @param {FormProps<TSchema, DefaultValues>} - The props for the Form component.
 * @returns {ReactNode} - The rendered Form component.
 *
 * @example
 *
 * const form = useForm({
 *   schema,
 *   defaultValues,
 *   errors,
 *   mode,
 *   errorParser,
 *   persistKey,
 *   check,
 * })
 * 
 * <Form use={form} onSubmit={form.handleSubmit((data, ctx) => {
      console.log("before", data);

      const after = ctx
        .array("contacts")
        .filter((item) => item.phone > 3 && item.phone !== null)
        .map((item) => item)
        .removeIf((item) => item.phone === 4);

      const snapshot = after.snapshot();
      const values = after.get();

      console.log("after", snapshot, values);
    })}>
 *   <Field name="name" label="Name" />
 *   <Field name="age" label="Age" type="number" />
 * </Form>
 */
export function Form<
  TSchema extends z.ZodObject | undefined = undefined,
  DefaultValues = TSchema extends undefined
    ? Record<string, any>
    : Partial<z.infer<TSchema>>
>({
  children,
  use,
  as = "form",
  className,
  onSubmit,
  ...rest
}: FormProps<TSchema, DefaultValues>) {
  const formInstance = use ?? useForm();

  const Element = as;

  //@ts-ignore
  const submitFn = onSubmit || formInstance.onSubmit;

  return (
    // @ts-ignore
    <FormContext.Provider value={formInstance}>
      <Element
        onSubmit={submitFn}
        className={`explita-form ${className ?? ""}`}
        {...rest}
      >
        <style>{css}</style>
        {children}
      </Element>
    </FormContext.Provider>
  );
}
