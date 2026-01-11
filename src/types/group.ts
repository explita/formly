import { Path, PathValue } from "./path";
import { SetValues } from "./utils";

export type GroupHelpersProps<T> = {
  path: Path<T>;
  defaultValues: T;
  formValues: T;
  setValues: SetValues<T>;
  getCurrentValue: () => PathValue<T, Path<T>>;
  validatePartial: (values: Partial<T>) => Promise<void>;
};

export type GroupHelpers<T> = {
  get: () => T;
  set: (value: Partial<T>) => void;
  reset: () => void;
  validate: () => void;
};
