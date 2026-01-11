import { GroupHelpersProps } from "../types/group";
import { getDeepValue, setDeepValue } from "./deep-path";

export function groupHelpers<T>(props: GroupHelpersProps<T>) {
  const {
    path,
    formValues,
    defaultValues,
    setValues,
    getCurrentValue,
    validatePartial,
  } = props;

  const getGroupValues = () => getCurrentValue() ?? {};
  const setGroupValues = (vals: any, options?: { overwrite?: boolean }) => {
    const current = getGroupValues();

    const merged = options?.overwrite ? vals : { ...current, ...vals };

    setDeepValue(formValues, path, merged);

    setValues(formValues, { overwrite: true });
  };

  const reset = (to?: any) => {
    const defaultGroup = to ?? getDeepValue(defaultValues || {}, path) ?? {};
    setGroupValues(defaultGroup);
  };

  const validate = async () => {
    const groupValues = getGroupValues();

    await validatePartial({ [path]: groupValues } as Partial<T>);
  };

  return {
    get: getGroupValues,
    set: setGroupValues,
    reset,
    validate,
  };
}
