import { useContext, useEffect } from "react";
import { FormContext, FormContextValue } from "../providers/form";
import type { z } from "zod";

export function useFormContext<
  TDefaultValues extends Record<string, any> = Record<string, any>,
  TSchema extends z.ZodObject<any> | undefined = undefined
>(props?: { schema?: TSchema }): FormContextValue<TSchema, TDefaultValues> {
  const form = useContext(FormContext) as FormContextValue<
    TSchema,
    TDefaultValues
  > | null;

  if (!form) {
    throw new Error("useFormContext must be used within a FormProvider");
  }

  // Handle schema updates if provided
  useEffect(() => {
    //@ts-ignore
    form.setSchema(props?.schema);
  }, [props?.schema]);

  return form;
}
