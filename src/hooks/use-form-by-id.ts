import { useEffect, useMemo, useState } from "react";
import { registry } from "../lib/form-registry.js";
import { FormInstance as BaseInstance } from "../types/utils.js";

type FormInstance<T> = Omit<BaseInstance<T>, "isDirty" | "Field"> & {
  isDirty: boolean;
};

export function useFormById<T extends Record<string, any>>(
  id: string,
  field?: string,
): FormInstance<T> {
  const [, setTick] = useState(0);
  const form = useMemo(() => registry.get(id) as BaseInstance<T>, [id]);

  useEffect(() => {
    // trigger initial render so values are pulled into React
    setTick((t) => t + 1);

    const channelName = field ?? "*";

    const unsub = form
      //@ts-ignore
      .channel(`value:${channelName}`)
      .subscribe(() => setTick((t) => t + 1));

    return unsub;
  }, [form, field]);

  return {
    ...form,
    get isDirty() {
      return form.isDirty();
    },
    get schema() {
      return (form as any)?.schema;
    },
  };
}
