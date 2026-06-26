import type { z, ZodObject } from "zod";
import { Path, PathValue } from "./path.js";
import { ArrayHelpers, ArrayItem, HandlerArrayHelpers } from "./array.js";
import { GroupHelpers } from "./group.js";
import { FieldHelpers } from "./field.js";
import { createFormBus } from "../lib/pub-sub.js";
import { ReactElement, JSX } from "react";

type MaybePromise<T> = T | Promise<T>;

export type FormShape<F> =
  F extends FormInstance<infer T, any> ? Prettify<T> : never;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type FormOptions<
  TSchema extends z.ZodObject | undefined = undefined,
  DefaultValues = TSchema extends undefined
    ? Record<string, any>
    : Partial<z.infer<TSchema>>,
  TComputed extends Record<string, any> = {},
  TAsyncValidation extends Record<string, any> = {},
  TCascade extends Record<string, any> = {},
  TSteps extends
    | Array<Array<Path<SchemaType<TSchema, DefaultValues>>>>
    | undefined = undefined,
> = FormOptionsInternal<
  TSchema,
  DefaultValues,
  TComputed,
  TAsyncValidation,
  TCascade,
  TSteps
>;

export type SchemaType<TSchema, TValues> =
  TSchema extends ZodObject<any> ? z.infer<TSchema> : TValues;

export type InferComputed<T> = T;
export type InputValue = string | undefined;

export type InputEvent = React.FormEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement
>;
export type InputChangeEvent =
  | React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | HTMLButtonElement
    >
  | React.FormEvent<HTMLButtonElement>;

type InputMeta<T = any> = {
  name?: string;
  value: T;
  error?: string;
  hasError: boolean;
  onChange: (value: T) => void;
  internalRef: string;
};

export type FieldRegistration<T = any> = {
  name: string;
  id: string;
  value: string;
  onChange: (e: InputChangeEvent) => void;
  onBlur: () => void;
  "data-input-error": boolean;
  "data-input-ref": string;
};

export type FieldRegistrationOptions<T, P extends Path<T>> = {
  defaultValue?: PathValue<T, P>;
  transform?:
    | ((val: PathValue<T, P>) => unknown)
    | ((val: PathValue<T, P>) => unknown)[];
  validate?: (value: PathValue<T, P>) => string | undefined;
};

export type FieldProps<T, P extends Path<T> = Path<T>> = {
  id?: string;
  name: P;
  label?: string | ReactElement;
  as?: "checkbox" | "select" | "date";
  required?: boolean;
  hideError?: boolean;
  className?: string;
  // **Render prop** alternative
  render?: (
    props: FieldRegistration<PathValue<T, P>>,
    meta: InputMeta<PathValue<T, P>>,
  ) => React.ReactNode;
  // **Children as function**
  children?: (
    props: FieldRegistration<PathValue<T, P>>,
    meta: InputMeta<PathValue<T, P>>,
  ) => React.ReactNode;
  transform?:
    | ((val: PathValue<T, P>) => unknown)
    | ((val: PathValue<T, P>) => unknown)[];
  validate?: (value: PathValue<T, P>) => string | undefined;
  defaultValue?: PathValue<T, P>;
};

export type FieldContextType = {
  name?: string;
  label?: string | ReactElement;
  id?: string;
  message?: string;
  required?: boolean;
  hasError: boolean;
};

export type HandlerContext<T> = {
  setErrors: SetErrors<T>;
  mapErrors: MapErrors;
  setValues: SetValues<T>;
  reset: ResetFn;
  focus: (name: Path<T>) => void;
  array: <P extends Path<T>>(path: P) => HandlerArrayHelpers<ArrayItem<T, P>>;
  meta: FormMeta;
  getChanges: () => Partial<T>;
};

type ResetFn = (opts?: { ignoreDefaults?: boolean }) => void;

type ReadyContext<T> = {
  meta: FormMeta;
};

export type FormMeta = {
  get<T = unknown>(key: string): T | undefined;
  set: (key: string, value: unknown, options?: { silent?: boolean }) => void;
  delete: (key: string) => void;
  has: (key: string) => boolean;
  keys: () => MapIterator<string>;
  values: () => MapIterator<unknown>;
  clear: () => void;
};

export type InferCascade<TCascade> = TCascade;

export type FormInstance<
  T,
  TAsyncValidation extends Record<string, any> = {},
  TCascade extends Record<string, any> = {},
  TSteps extends Array<Array<Path<T>>> | undefined = undefined,
> = {
  /**
   * The unique identifier of this form instance.
   */
  id: string;
  /**
   * Indicates whether the form is currently submitting.
   */
  submitting: boolean;
  /**
   * Indicates whether the form is validated.
   */
  validated: boolean;
  /**
   * Indicates whether any debounced async validation is currently running.
   */
  isValidating: boolean;
  /**
   * Mapping of which specific field paths are currently running async validations.
   */
  validatingFields: [keyof TAsyncValidation] extends [never]
    ? Record<string, boolean>
    : Record<keyof TAsyncValidation, boolean>;
  /**
   * Indicates whether the form is busy (submitting or validating).
   */
  busy: boolean;
  /**
   * Mapping of cascading options and loading states resolved for each field path.
   */
  cascade: {
    [K in keyof TCascade]: {
      data: TCascade[K];
      isLoading: boolean;
    };
  };
  /**
   * Retrieves a patch containing only form values that were modified compared to defaultValues.
   */
  getChanges: () => Partial<T>;
  /**
   * Retrieves the current values of the form.
   */
  values: T;
  /**
   * Retrieves the errors of the form.
   */
  errors: Partial<Record<Path<T>, string>>;

  /**
   * Retrieves the current values of the form.
   */
  getValues: () => T;
  /**
   * Validates the form using the current schema.
   * @returns void
   */
  validate: () => void;
  /**
   * Validates a partial set of form field values using the provided schema. If validation fails,
   * the error is parsed and set in the form errors. The function is debounced to prevent
   * excessive validation calls.
   *
   * @param values - An object containing key-value pairs to validate.
   */
  validatePartial: <V extends Path<T>>(values: Record<V, any>) => void;
  /**
   * Updates the value of a specific form field. If the form is in uncontrolled mode
   * or the field name is not provided, the function exits without making changes.
   *
   * @param name - The name of the form field to update.
   * @param value - The new value to set for the specified form field.
   */
  setValue: <P extends Path<T>>(name: P, value: PathValue<T, P>) => void;
  /**
   * Merges the provided values into the current form values. This function does not
   * update values in uncontrolled mode.
   *
   * @param values - An object containing key-value pairs to update the form with.
   */
  setValues: (values: Partial<T>, options?: { overwrite?: boolean }) => void;
  /**
   * Retrieves the value of a single form field.
   */
  getValue: <P extends Path<T>>(name: P) => PathValue<T, P>;
  /**
   * Updates the form errors with the provided errors. If the form is in uncontrolled mode
   * or the field name is not provided, the function exits without making changes.
   *
   * @param errors - The errors to set for the form.
   */
  setErrors: SetErrors<T>;
  /**
   * Retrieves the error of a single form field.
   */
  getError: <P extends Path<T>>(name: P) => string | undefined;
  /**
   * Retrieves the errors of the form.
   */
  getErrors: () => Partial<Record<Path<T>, string>>;
  /**
   * Clears the form values and errors, and if persistKey is provided, it will
   * also remove the persisted state from localStorage.
   */
  reset: ResetFn;
  /**
   * Resets the value of a specific form field to its default value.
   *
   * @param name - The name of the form field to reset.
   */
  // resetField: (name: Path<T>) => void;
  /**
   * A utility function to be used as a form's `onSubmit` handler.
   *
   * When called, it will validate the form using the current schema, if provided.
   * If the form is valid, it will call the `onValid` function with the validated form values.
   * If the form is invalid, it will set the `isValidated` state to `false` and update the `formErrors` state.
   *
   * If no schema is provided, it will simply call the `onValid` function with the current `formValues`.
   *
   * @param onValid - A function that will be called with the validated form values if the form is valid.
   * @returns A function that can be used as a form's `onSubmit` handler.
   */
  handleSubmit: (
    onValid: (
      data: T,
      ctx: HandlerContext<T>,
      raw: FormData,
    ) => MaybePromise<void>,
  ) => (event: React.FormEvent<HTMLFormElement>) => MaybePromise<void>;
  /**
   * Programmatically triggers form submission. Validates the form first if a schema is provided;
   * if valid, calls the `onSubmit` handler configured in the form options.
   *
   * Useful for submitting the form from external buttons or programmatic logic.
   */
  submit: () => void;
  /**
   * A utility function to register a form field.
   *
   * @param name - The name of the form field to register.
   * @returns An object containing the form field properties.
   */
  // register: <P extends Path<T>>(
  //   name: P,
  //   options?: FieldRegistrationOptions<T, P>,
  // ) => FieldRegistration<PathValue<T, P>>;
  /**
   * A utility function to access and modify a specific form field.
   *
   * @param name - The name of the form field to access.
   * @returns An object containing field helper functions.
   */
  field: <P extends Path<T>>(name: P) => FieldHelpers<PathValue<T, P>>;
  /**
   * A utility function to access and modify array fields in the form.
   *
   * @param path - The path to the array field in the form values.
   * @returns An object containing array helper functions.
   */
  array: <P extends Path<T>>(path: P) => ArrayHelpers<ArrayItem<T, P>>;
  /**
   * A utility function to access and modify group fields in the form.
   *
   * @param path - The path to the group field in the form values.
   * @returns An object containing group helper functions.
   */
  group: <P extends Path<T>>(path: P) => GroupHelpers<PathValue<T, P>>;
  // markTouched: (name: Path<T>) => void;
  isDirty: (name?: Path<T>) => boolean;
  isTouched: (name?: Path<T>) => boolean;
  focus: (name: Path<T>) => void;
  /**
   * A utility function to compute a value based on the form values.
   *
   * @param name - The name of the form field to compute.
   * @param depsOrFn - The dependencies of the form field or a function to compute the value.
   * @param maybeFn - A function to compute the value.
   */
  compute: Compute<T>;
  /**
   * Watches specified fields for changes and returns reactive values.
   *
   * @param field(s) - The name of the form field(s) to watch
   * @returns The value(s) of the watched field(s)
   */
  watch: WatchFn<T>;

  /**
   * Subscribes to changes in the form values.
   *
   * @param nameOrCallback - The name/names of the form field/fields to subscribe to or a callback function.
   * @param callback - A callback function that will be called with the value of the subscribed field.
   * @returns A function that can be called to unsubscribe from the changes.
   */
  subscribe: <P extends Path<T> | undefined = undefined>(
    nameOrCallback: P | P[] | Subscriber<T, P>,
    callback?: Subscriber<T, P>,
    // internalRef?: string
  ) => () => void;
  /**
   * Transforms the value of a specific form field using the provided function.
   *
   * @param name - The name of the form field to transform.
   * @param fn - The function to transform the value of the form field.
   */
  transform: <P extends Path<T>>(
    name: P,
    fn: (val: PathValue<T, P>) => unknown,
  ) => void;
  /**
   * A utility function to conditionally show or hide a form field.
   *
   * @param name - The name of the form field to conditionally show or hide.
   * @param deps - The dependencies of the form field.
   * @param fn - The function to conditionally show or hide the form field.
   */
  // conditional: <P extends Path<T>>(
  //   name: P,
  //   deps: Path<T>[],
  //   fn: (...depValues: any[]) => any
  // ) => void;
  debug: () => {
    values: T;
    errors: Record<Path<T>, string>;
    dirty: Record<Path<T>, boolean>;
    touched: Record<Path<T>, boolean>;
    computed: Record<Path<T>, any>;
    subscriptions: {
      fields: Record<Path<T>, Subscriber<T, Path<T>>>;
      errors: Record<Path<T>, Subscriber<T, Path<T>>>;
    };
    state: {
      isSubmitting: boolean;
      isValidated: boolean;
    };
  };
  Field: <P extends Path<T>>(props: FieldProps<T, P>) => JSX.Element;
  channel: ReturnType<typeof createFormBus<T>>["channel"];
  meta: FormMeta;

  /**
   * Formly Wizard Steps API. Intelligent multi-step state navigator.
   */
  steps: TSteps extends Array<Array<Path<T>>>
    ? {
        /**
         * Validates the fields in the current active step and advances to the next step if they are valid.
         * @returns A promise resolving to a boolean indicating whether the step was advanced successfully.
         */
        next: () => Promise<boolean>;
        /**
         * Navigates back to the previous step index safely.
         */
        prev: () => void;
        /**
         * The active step index (0-indexed).
         */
        current: number;
        /**
         * Indicates whether the current active step is the first step.
         */
        isFirst: boolean;
        /**
         * Indicates whether the current active step is the last step.
         */
        isLast: boolean;
        /**
         * The total number of wizard steps defined.
         */
        total: number;
        /**
         * Explicitly sets the active step index.
         * @param step - The 0-indexed step index to set.
         */
        set: (step: number) => void;
      }
    : undefined;
};

export type SetValues<T> = (
  values: Partial<T>,
  options?: { overwrite?: boolean },
) => void;

export type SetErrors<T> = (
  errors?: Partial<Record<Path<T>, string>> | z.ZodError["issues"],
) => void;

export type FormOptionsInternal<
  TSchema extends ZodObject<any> | undefined,
  TValues,
  TComputed extends Record<string, any> = {},
  TAsyncValidation extends Record<string, any> = {},
  TCascade extends Record<string, any> = {},
  TSteps extends Array<Array<Path<SchemaType<TSchema, TValues>>>> | undefined =
    undefined,
> = {
  /**
   * The schema to use for validation.
   */
  schema?: TSchema;
  /**
   * The default values of the form.
   */
  defaultValues?: TValues;
  /**
   * The errors of the form.
   */
  errors?: Partial<Record<Path<SchemaType<TSchema, TValues>>, string>>;
  /**
   * The error parser to use for parsing errors.
   */
  errorParser?: (message: string) => string;
  /**
   * The check function to use for checking the form.
   */
  check?: CheckFn<
    Prettify<SchemaType<TSchema, TValues> & InferComputed<TComputed>>
  >;
  /**
   * The computed fields of the form.
   */
  computed?: {
    [K in keyof TComputed]: {
      deps?: (
        | Path<SchemaType<TSchema, TValues>>
        | (string & {})
        | number
        | boolean
      )[];
      fn: (
        values: SchemaType<TSchema, TValues>,
        index: number,
      ) => MaybePromise<TComputed[K]>;
    };
  };
  /**
   * The submit handler of the form.
   */
  onSubmit?: (
    values: Prettify<SchemaType<TSchema, TValues> & InferComputed<TComputed>>,
    ctx: HandlerContext<
      Prettify<SchemaType<TSchema, TValues> & InferComputed<TComputed>>
    >,
    raw: FormData,
  ) => void;
  /**
   * Called when the form is ready/mounted.
   */
  onReady?: (
    values: Prettify<SchemaType<TSchema, TValues> & InferComputed<TComputed>>,
    ctx: ReadyContext<
      Prettify<SchemaType<TSchema, TValues> & InferComputed<TComputed>>
    >,
  ) => void;
  /**
   * The mode of the form.
   *
   * @default "controlled"
   */
  mode?: "controlled" | "uncontrolled";
  /**
   * The validation trigger.
   *
   * @default "change-submit"
   */
  validateOn?: "change" | "blur" | "submit" | "change-submit";
  /**
   * Used to register the form so it can be accessed outside the hook.
   */
  id?: string;
  /**
   * The key used to persist the form state.
   * If provided, the form state will be persisted to localStorage and restored on mount.
   * If id is provided, it will be used as the key.
   */
  persistKey?: string;
  /**
   * Whether to focus the first field with an error on submit.
   */
  autoFocusOnError?: boolean;
  /**
   * Whether to use the saved form state first.
   */
  savedFormFirst?: boolean;
  /**
   * Whether to prevent page unload (reloads, tab close, navigation) if the form is dirty.
   */
  preventUnload?: boolean;
  /**
   * Declarative normalizers to intercept and format/sanitize input values as they are typed.
   */
  normalize?: Partial<{
    [P in Path<SchemaType<TSchema, TValues>>]: (
      value: PathValue<SchemaType<TSchema, TValues>, P>,
      previousValue: PathValue<SchemaType<TSchema, TValues>, P> | undefined,
    ) => PathValue<SchemaType<TSchema, TValues>, P>;
  }>;
  /**
   * Race-condition safe debounced async validation (e.g. unique username checks, remote coupon codes).
   */
  asyncValidate?: {
    [P in keyof TAsyncValidation]: P extends Path<SchemaType<TSchema, TValues>>
      ? {
          /**
           * The debounce time in milliseconds.
           * @default 500
           */
          debounce?: number;
          /**
           * The async validation function.
           */
          fn: (
            value: PathValue<SchemaType<TSchema, TValues>, P>,
            formValues: SchemaType<TSchema, TValues>,
          ) => Promise<string | undefined | null>;
        }
      : never;
  };
  /**
   * Cascading dropdown bindings to automatically load options list based on other fields changing.
   * Options are automatically stored in formMetadata under `${fieldName}.options` (e.g. `form.meta.get("city.options")`).
   */
  cascade?: {
    [K in keyof TCascade]: CascadeField<
      SchemaType<TSchema, TValues>,
      TCascade[K]
    >;
  };
  /**
   * Groupings of field paths representing steps in a wizard/multi-step form.
   */
  steps?: TSteps; // Array<Array<Path<SchemaType<TSchema, TValues>>>>;
};

type CheckFn<T> = (
  data: T,
  ctx: {
    multiPathError: (paths: Path<T>[], message: string) => void;
    focus: (name: Path<T>) => void;
  },
) => MaybePromise<Partial<Record<Path<T>, string>> | void>;

type MapErrors = <E extends Record<string, any>>(
  errObj: E,
  path?: string,
) => void;

export type Compute<T> = <P extends Path<T>>(
  name: string,
  depsOrFn:
    | (Path<T> | (string & {}) | any)[]
    | ((values: T, index: number) => MaybePromise<any>),
  maybeFn?: (values: T, index: number) => MaybePromise<any>,
) => void;

export type ComputedField<T, R = unknown> = {
  deps?: (Path<T> | (string & {}) | any)[];
  fn: (values: T, index: number) => MaybePromise<R>;
};

export type CascadeField<T, R = unknown> = {
  watch: (Path<T> | (string & {}))[];
  fn: (currentValues: T, watchedValues: any[]) => MaybePromise<R>;
  onLoad?: (options: NoInfer<R>) => void;
};

export type Computed<T> = ComputedField<T>;

export type Subscriber<T, P extends Path<T> | undefined = undefined> = (
  value: P extends undefined ? T : PathValue<T, P>,
) => void;

type WatchFn<T> = {
  (): T; // No args → returns full form
  <P extends Path<T>>(
    fields: P[],
  ): { [K in P]: PathValue<T, K> } & Array<PathValue<T, P[number]>>; // Array of fields or object
  <P extends Path<T>>(field: P): PathValue<T, P>; // Single field
};

type ConditionalEffects = {
  visible?: boolean; // visible or hidden (true -> visible)
  clear?: boolean; // clear value when hidden (default false)
  unregister?: boolean; // whether the field should be unregistered when hidden
};

export type ConditionalConfig<T> = {
  when: (values: T) => boolean; // condition
  then?: Partial<ConditionalEffects>; // effects when condition true
  else?: Partial<ConditionalEffects>; // effects when condition false
};

export type UseFormInitializationProps = {
  defaultValues: Record<string, any>;
  persistKey?: string;
  savedFormFirst?: boolean;
  generatePlaceholders: Record<string, any>;
  computed?: Record<
    string,
    {
      deps?: string[];
      fn: (values: any, index?: number) => MaybePromise<any>;
    }
  >;

  compute: (
    key: string,
    deps: string[],
    fn: (values: any, index?: number) => MaybePromise<any>,
    index?: number,
    opts?: { silent?: boolean },
  ) => void;

  draftListeners: React.RefObject<{
    restore?: (values: any) => void;
  }>;

  onReady?: (values: any, ctx: any) => void;

  setValues: (
    values: Record<string, any>,
    options?: { overwrite?: boolean },
    silent?: boolean,
  ) => void;

  initialValuesRef?: React.RefObject<any>;
  createHandlerContext: (values: Record<string, any>) => any;
};
