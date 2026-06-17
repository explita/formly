"use client";

import type { z } from "zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  InputValue,
  HandlerContext,
  FormInstance,
  FormOptions,
  Subscriber,
  ComputedField,
  CascadeField,
  FieldRegistrationOptions,
  ConditionalConfig,
  InferComputed,
  Prettify,
  SchemaType,
} from "../types/utils.js";
import {
  debounce,
  deleteDraft,
  validateForm,
  writeDraft,
  writeDraftImmediate,
} from "../utils/index.js";
import {
  flattenFormValues,
  mapErrors,
  multiPathError,
  nestFormValues,
  shallowEqual,
  areFlatValuesEqual,
} from "../lib/utils.js";
import { getDeepValue, getValueByPath } from "../lib/deep-path.js";
import { formArrayHelper, handlerArrayHelpers } from "../lib/array-helpers.js";
import {
  createEmptyValues,
  isZodError,
  isZodSchema,
  mapZodErrors,
} from "../lib/zod-helpers.js";
import { Path, PathValue } from "../types/path.js";
import { groupHelpers } from "../lib/group-helpers.js";
import { Field } from "../components/field.js";
import { createFormBus } from "../lib/pub-sub.js";
import { registry } from "../lib/form-registry.js";
import { useFormInitialization } from "./use-form-initialization.js";
import { createMetaContext } from "../lib/meta-context.js";

/**
 * A highly performant, custom React hook designed to orchestrate state, validation,
 * array helpers, draft persistence, and event subscriptions for forms of any complexity.
 *
 * Provides type-safe validation using Zod schemas, dynamic computed properties,
 * debounced async field validations, cascading dropdown option loading,
 * nested object manipulation, and optimal re-rendering.
 *
 * @template TSchema - An optional Zod Object schema representing the form structure.
 * @template TDefault - The shape of the default values. If `TSchema` is provided, defaults to `z.infer<TSchema>`.
 * @template TComputed - The shape of computed/derived properties mapped to their dependency paths.
 * @template TAsyncValidation - Record of async validation configurations (e.g., uniqueness checks).
 * @template TCascade - Record of cascading dropdown option configurations.
 *
 * @param {FormOptions<TSchema, TDefault, TComputed, TAsyncValidation, TCascade>} [options] - Configuration options for the form instance.
 *
 * @returns {FormInstance} A unified controller object containing form states (values, errors, flags) and manipulation helpers.
 *
 * @example
 * ```tsx
 * const userSchema = z.object({
 *   username: z.string().min(3),
 *   branchId: z.string(),
 *   referrerId: z.string(),
 * });
 *
 * const form = useForm({
 *   schema: userSchema,
 *   defaultValues: { username: "", branchId: "", referrerId: "" },
 *   validateOn: "change-submit",
 *   asyncValidate: {
 *     username: {
 *       debounce: 1000,
 *       validate: async (value) => {
 *         const isUnique = await api.checkUsername(value);
 *         return isUnique ? null : "Username is already taken";
 *       },
 *     },
 *   },
 *   cascade: {
 *     referrerId: {
 *       watch: ["branchId"],
 *       fn: async ([branchId]) => {
 *         if (!branchId) return [];
 *         return await api.getReferrers(branchId);
 *       },
 *     },
 *   },
 * });
 *
 * return (
 *   <form onSubmit={form.handleSubmit(data => console.log(data))}>
 *     <input value={form.values.username} onChange={e => form.setValue("username", e.target.value)} />
 *     {form.validatingFields.username && <span>Checking availability...</span>}
 *     {form.errors.username && <span>{form.errors.username}</span>}
 *
 *     <select value={form.values.branchId} onChange={e => form.setValue("branchId", e.target.value)}>
 *       <option value="1">Branch 1</option>
 *       <option value="2">Branch 2</option>
 *     </select>
 *
 *     <select value={form.values.referrerId} onChange={e => form.setValue("referrerId", e.target.value)}>
 *       {form.cascade.referrerId?.map(ref => (
 *         <option key={ref.id} value={ref.id}>{ref.name}</option>
 *       ))}
 *     </select>
 *
 *     <button type="submit">Submit</button>
 *   </form>
 * );
 * ```
 */
export function useForm<
  TSchema extends z.ZodObject<any> | undefined = undefined,
  TDefault = TSchema extends z.ZodObject<any>
    ? z.infer<TSchema>
    : Record<string, any>,
  TComputed extends Record<string, any> = {},
  TAsyncValidation extends Record<string, any> = {},
  TCascade extends Record<string, any> = {},
  TSteps extends Array<Array<Path<SchemaType<TSchema, TDefault>>>> | undefined =
    undefined,
>(
  options?: FormOptions<
    TSchema,
    TDefault,
    TComputed,
    TAsyncValidation,
    any,
    TSteps
  > & {
    cascade?: {
      [K in keyof TCascade]: CascadeField<
        SchemaType<TSchema, TDefault>,
        TCascade[K]
      >;
    };
    // steps?: Array<Array<Path<SchemaType<TSchema, TDefault>>>>;
  },
): FormInstance<
  TSchema extends z.ZodObject<any>
    ? Prettify<z.infer<TSchema> & InferComputed<TComputed>>
    : Prettify<TDefault & InferComputed<TComputed>>,
  TAsyncValidation,
  TCascade,
  //@ts-expect-error steps is not infered correctly
  TSteps
> {
  const {
    schema,
    validateOn = "change-submit",
    defaultValues = {} as TDefault,
    errors = {},
    mode = "controlled",
    errorParser,
    check,
    computed,
    onSubmit,
    onReady,
    autoFocusOnError = true,
    savedFormFirst = true,
    id,
    preventUnload = false,
  } = options || {};

  const persistKey = options?.persistKey || options?.id;
  const formIdRef = useRef<string>(
    persistKey || `form_${Math.random().toString(36).substring(2, 9)}`,
  );

  const cascadeRef = useRef(options?.cascade);
  cascadeRef.current = options?.cascade;
  const arrayKeysRef = useRef<Record<string, string[]>>({});

  const channelBus = useMemo(() => createFormBus(), []);

  // validation state
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [, forceRender] = useState(0);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // validation state for debounced async operations
  const [validatingFields, setValidatingFields] = useState<
    Record<string, boolean>
  >({});
  const isValidating = Object.values(validatingFields).some(Boolean);

  const [loadingCascades, setLoadingCascades] = useState<
    Record<string, boolean>
  >({});
  const asyncTimersRef = useRef<Record<string, any>>({});
  const asyncVersionsRef = useRef<Record<string, number>>({});

  let runAsyncValidation: (name: string, value: any) => void = () => {};
  let runAllAsyncValidations: () => Promise<{
    success: boolean;
    errors: Record<string, string>;
  }> = async () => ({ success: true, errors: {} });

  // Draft listeners
  const draftListeners = useRef<{
    save?: (values: any) => void;
    restore?: (values: any) => void;
  }>({});

  // values
  const formValues = useRef({} as Record<string, any>);
  const initialValuesRef = useRef<any>(null);
  if (initialValuesRef.current === null) {
    initialValuesRef.current = structuredClone(defaultValues);
  }
  const computing = useRef<Set<string>>(new Set());
  const computedFieldsRef = useRef<Record<string, ComputedField<TDefault>>>({});
  const computedUnsubscribesRef = useRef<Record<string, (() => void)[]>>({});

  // watched fields state (triggers re-renders)
  const watchedFieldsRef = useRef<Set<string>>(new Set());

  // errors
  const formErrors = useRef<Partial<Record<string, string>>>({});

  // subscribers
  const globalSubscribers = useRef<Set<(values: any) => void>>(new Set());
  const fieldSubscribersRef = useRef<Record<string, Set<(value: any) => void>>>(
    {},
  );
  const fieldRegistryRef = useRef<
    Record<string, FieldRegistrationOptions<any, any>>
  >({});
  const fieldsTransformsRef = useRef<Map<string, ((val: any) => any)[]>>(
    new Map(),
  );
  const fieldsValidationsRef = useRef<Map<string, (val: any) => any>>(
    new Map(),
  );

  const metaRef = useRef<Map<string, unknown>>(new Map());

  const fieldErrorSubscribersRef = useRef<
    Record<string, Set<(err: string | undefined) => void>>
  >({});

  // store field refs
  const fieldRefs = useRef<Record<string, string>>({});
  const registerUnsubsRef = useRef<Record<string, (() => void)[]>>({});

  const pendingFields = new Set<string>();
  let notifyScheduled = false;

  const dirtyFieldsRef = useRef<Record<string, boolean>>({});
  const touchedFieldsRef = useRef<Record<string, boolean>>({});

  const currentSchema = useRef<z.ZodObject<any> | undefined>(
    schema && isZodSchema(schema) ? schema : undefined,
  );

  //conditionals
  const conditionalRulesRef = useRef<
    Array<{ fields: string[]; config: ConditionalConfig<TDefault> }>
  >([]);
  const hiddenFieldsRef = useRef<Record<string, boolean>>({});
  const requiredFieldsRef = useRef<Record<string, boolean>>({});
  // optional: track unregister for each field
  const unregisteredRef = useRef<Record<string, boolean>>({});
  const visibilitySubscribersRef = useRef<Record<string, Set<() => void>>>({});

  const previousErrorsRef = useRef<Record<string, string | undefined>>({});

  // placeholders
  const generatePlaceholders = useMemo(() => {
    if (mode === "controlled")
      return flattenFormValues({
        ...createEmptyValues(currentSchema.current),
        // ...defaultValues,
      });

    return {};
  }, [mode, currentSchema, defaultValues]);

  //validate on values change
  useEffect(() => {
    const handler = debounce(() => {
      formValidation().then(({ isValidated }) => {
        setIsValidated(isValidated);
      });
    }, 200);

    handler();

    return () => handler.cancel();
  }, [formValues, currentSchema, mode]);

  //set schema on schema change
  useEffect(() => {
    if (schema) {
      if (!isZodSchema(schema)) {
        throw new Error("Schema is not a zod schema.");
      } else {
        resetErrors();
        currentSchema.current = schema;
      }
    }
  }, [schema]);

  //set errors on errors change
  useEffect(() => {
    const flattenedErrors = flattenFormValues(errors);
    const errorsUnchanged = shallowEqual(
      previousErrorsRef.current,
      flattenedErrors,
    );

    if (errorsUnchanged) return;

    previousErrorsRef.current = flattenedErrors;

    setErrors(errors);
  }, [errors]);

  // -----------------------------
  // Draft hooks
  // -----------------------------
  const onDraftSave = useCallback((callback: (values: TDefault) => void) => {
    draftListeners.current.save = callback;
  }, []);

  const onDraftRestore = useCallback((callback: (values: TDefault) => void) => {
    draftListeners.current.restore = callback;
  }, []);

  const writeDraftDebounced = useCallback(
    (channel?: "immediate" | "debounced") => {
      if (!persistKey) return;

      draftListeners.current.save?.(formValues.current);

      if (channel === "immediate") {
        writeDraftImmediate(persistKey, nestFormValues(formValues.current));
        return;
      }

      writeDraft(persistKey, nestFormValues(formValues.current));
    },
    [persistKey],
  );

  const setSchema = useCallback((newSchema?: z.ZodObject<any>) => {
    currentSchema.current = newSchema;
  }, []);

  const triggerRerender = useCallback(() => {
    if (isMountedRef.current) {
      forceRender((prev) => prev + 1);
    }
  }, []);

  const setValue = useCallback(
    (name: string, value: any, opts: { silent?: boolean } = {}) => {
      if (mode === "uncontrolled") return;

      const previousValue = formValues.current[name];

      // Apply declarative normalizer if present
      if (options?.normalize && (options.normalize as any)[name]) {
        value = (options.normalize as any)[name](value, previousValue);
      }

      value = applyTransformations(name as string, value);

      // If value hasn't changed (e.g., invalid characters stripped by normalizer), exit early!
      if (previousValue === value) {
        // 🔔 Notify subscribers
        notifySubscribers(name as any);
        return;
      }

      // Always update ref for consistency
      formValues.current[name] = value;
      markDirty(name);

      if (!opts.silent) {
        channelBus.channel("value:*").emit(getValues());
        channelBus.channel(`value:${name}` as any).emit(value);

        if (
          !computedFieldsRef.current[name] &&
          (validateOn === "change-submit" || validateOn === "change")
        ) {
          validateField(name, value);
          // Trigger debounced async validation with previous value reference
          runAsyncValidation(name, value);
        }

        const validator = fieldsValidationsRef.current.get(name);

        if (validator) {
          const error = validator(value);
          setFieldError(name, error);
        }

        // 🔔 Notify subscribers
        notifySubscribers(name as any);

        // Update state if field is watched or we are in controlled mode (triggers re-render)
        if (watchedFieldsRef.current.has(name)) {
          // || mode === "controlled"
          writeDraftDebounced("immediate");
          triggerRerender();
        } else {
          writeDraftDebounced();
          evaluateConditionals();
        }
      }
    },
    [mode, writeDraftDebounced, runAsyncValidation],
  );

  const setValues = useCallback(
    (
      values: any,
      options?: {
        overwrite?: boolean;
      },
      skipWriteDraft = false,
    ) => {
      // Flatten incoming values for consistent key access
      const flattened = flattenFormValues(values);

      formValues.current = {
        ...(options?.overwrite ? {} : formValues.current),
        ...flattened,
      };

      channelBus.channel("value:*").emit(getValues());

      // 🔔 Notify all affected subscribers
      Object.keys(flattened).forEach((key) => {
        channelBus.channel(`value:${key}` as any).emit(getValue(key));
        notifySubscribers(key as any);
      });

      if (!skipWriteDraft) {
        // Trigger rerender when structure changes
        triggerRerender();

        writeDraftDebounced();
      }
    },
    [writeDraftDebounced, triggerRerender],
  );

  const getValue = useCallback(
    (name: string) => getValueByPath(getValues(), name),
    [],
  );

  const getValues = useCallback(
    () => nestFormValues(formValues.current) as TDefault,
    [],
  );

  const setFieldError = useCallback(
    (name: string, error: string | undefined) => {
      const prevError = formErrors.current[name];

      // Prevent triggering the same error again
      if (prevError === error) return;

      formErrors.current[name] = errorParser ? errorParser(error ?? "") : error;

      // notify only the affected field
      fieldErrorSubscribersRef.current[name]?.forEach((fn) => fn(error));
    },
    [],
  );

  const setErrors = useCallback(
    (errors?: Record<string, string | undefined> | z.ZodError["issues"]) => {
      if (!errors || Object.keys(errors).length === 0)
        return Object.keys(fieldErrorSubscribersRef.current).forEach((key) => {
          setFieldError(key, undefined);
        });

      const mapped = isZodError(errors) ? mapZodErrors(errors) : errors;

      Object.keys(formErrors.current).forEach((key) => {
        setFieldError(key, undefined);
      });

      Object.keys(mapped).forEach((key) => {
        setFieldError(key, mapped[key]);
      });
    },
    [setFieldError],
  );

  const getError = useCallback(
    (name: keyof TDefault) =>
      getValueByPath(formErrors.current, name as string),
    [],
  );

  const getErrors = useCallback(() => formErrors.current, []);

  function resetErrors() {
    if (!formErrors.current || Object.keys(formErrors.current).length === 0)
      return;
    setErrors(
      Object.keys(formErrors.current).reduce(
        (acc, key) => {
          acc[key] = undefined;
          return acc;
        },
        {} as Record<string, undefined>,
      ),
    );
  }

  //validate single field
  const validateField = useCallback(
    debounce(async (name: string, inputValue?: InputValue) => {
      if (!name || !currentSchema.current || mode === "uncontrolled") return;

      const valToValidate =
        inputValue !== undefined ? inputValue : formValues.current[name];

      const result = await validateForm(currentSchema.current, {
        [name]: valToValidate,
      });

      if (!result.success) {
        const fieldError = result.errors[name as string] ?? undefined;

        setFieldError(name, fieldError);
      } else {
        setFieldError(name, undefined);
      }
    }, 150),
    [currentSchema, mode, setFieldError],
  );

  async function formValidation() {
    if (!currentSchema.current || mode === "uncontrolled")
      return { isValidated: false, formValues: formValues.current };

    const result = await validateForm(
      currentSchema.current,
      formValues.current as Record<string, unknown>,
    );

    if (result.success) {
      formValues.current = {
        ...formValues.current,
        ...flattenFormValues(result.data),
      };
    }

    return {
      isValidated: result.success,
      formValues: result.data,
      formErrors: !result.success ? result.errors : undefined,
    };
  }

  const validatePartial = useCallback(async (values: Partial<TDefault>) => {
    if (!currentSchema.current || mode === "uncontrolled") return;

    const flat = flattenFormValues(values);
    const fields = {} as Partial<TDefault>;

    for (const [key, val] of Object.entries(flat)) {
      //@ts-ignore
      fields[key] = val;
    }

    const result = await validateForm(currentSchema.current, fields);

    if (!result.success) {
      const errors = {};
      for (const [key, _] of Object.entries(flat)) {
        //@ts-ignore
        errors[key] = result.errors[key];
      }
      setErrors({ ...formErrors.current, ...errors });
    }
  }, []);

  //run validation before submit
  async function validateAndSubmit() {
    // resetErrors();

    // 1️⃣ Schema validation
    if (
      currentSchema.current &&
      (validateOn === "change-submit" || validateOn === "submit")
    ) {
      const validate = await formValidation();

      if (!validate.isValidated) {
        setIsValidated(false);
        setErrors(validate.formErrors);
        focusFirst(validate.formErrors);

        return;
      }

      resetErrors();
    }

    // 2️⃣ Custom check
    if (check) {
      //@ts-ignore
      const checkResult = await check(getValues(), {
        multiPathError,
        focus,
        // setErrors,
        // mapErrors: (errors, path) => setErrors(mapErrors(errors, path)),
      });

      if (checkResult && Object.keys(checkResult).length > 0) {
        setIsValidated(false);
        setErrors(checkResult);

        focusFirst(checkResult);

        return;
      }

      resetErrors();
    }

    // 3️⃣ Async validations
    if (options?.asyncValidate) {
      const asyncResult = await runAllAsyncValidations();
      if (!asyncResult.success) {
        setIsValidated(false);
        setErrors({ ...formErrors.current, ...asyncResult.errors });
        focusFirst(asyncResult.errors);
        return;
      }
    }

    // resetErrors();

    return getValues();
  }

  const focus = useCallback((name: string) => {
    if (typeof document === "undefined") return;
    const ref = fieldRefs.current[name];
    if (!ref) return;

    let element = document.querySelector(
      `[data-input-ref="${ref}"]`,
    ) as HTMLElement;
    if (element) {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
      if (!isInput) {
        const nested = element.querySelector(
          "input, textarea, select",
        ) as HTMLElement;
        if (nested) {
          element = nested;
        }
      }
      if (typeof element.focus === "function") {
        element.focus();
      }
    }
  }, []);

  function focusFirst(obj: Partial<Record<string, string>> | undefined) {
    if (!obj || !autoFocusOnError) return;
    const first = Object.keys(obj)[0];
    focus(first);
  }

  // --- Public notify() ---
  function notifySubscribers<P extends Path<TDefault>>(path: P) {
    pendingFields.add(path);

    scheduleNotify();
  }

  function scheduleNotify() {
    if (notifyScheduled) return;
    notifyScheduled = true;

    setTimeout(() => {
      notifyScheduled = false;

      // Capture and clear pending fields
      const fields = Array.from(pendingFields);
      pendingFields.clear();

      // 1️⃣ Notify all relevant field subscribers
      for (const [subPath, subscribers] of Object.entries(
        fieldSubscribersRef.current,
      )) {
        const shouldNotify = fields.some(
          (path) => path === subPath || path.startsWith(`${subPath}.`),
        );
        if (shouldNotify) {
          const value = getValue(subPath as Path<TDefault>) || "";
          for (const cb of subscribers) {
            cb(value);
          }
        }
      }

      // 2️⃣ Notify global subscribers once
      if (globalSubscribers.current.size > 0) {
        for (const cb of globalSubscribers.current) {
          cb(getValues());
        }
      }
    });
  }

  const subscribe = useCallback(
    (
      nameOrCallback: string | string[] | Subscriber<any>,
      callback?: Subscriber<any>,
      opts?: { internalRef?: string },
    ) => {
      // --- GLOBAL SUBSCRIPTION ---
      if (typeof nameOrCallback === "function") {
        globalSubscribers.current.add(nameOrCallback);
        return () => {
          globalSubscribers.current.delete(nameOrCallback);
        };
      }

      // --- FIELD SUBSCRIPTION ---
      const fields = Array.isArray(nameOrCallback)
        ? nameOrCallback
        : [nameOrCallback];

      const cb = callback!;
      for (const field of fields) {
        // Associate ref (for cleanup when unmounting a field)
        if (opts?.internalRef) {
          fieldRefs.current[field] = opts.internalRef;
        }

        // Create new set if it doesn’t exist
        let subscribers = fieldSubscribersRef.current[field];
        if (!subscribers) {
          subscribers = new Set();
          fieldSubscribersRef.current[field] = subscribers;
        }

        cb(getValue(field));

        subscribers.add(cb);
      }

      // --- UNSUBSCRIBE CLEANUP ---
      return () => {
        for (const field of fields) {
          const subscribers = fieldSubscribersRef.current[field];
          if (!subscribers) continue;

          subscribers.delete(cb);

          // If no subscribers remain, clean up
          if (subscribers.size === 0) {
            delete fieldSubscribersRef.current[field];

            // Optional: clean up fieldRef if linked
            if (
              opts?.internalRef &&
              fieldRefs.current[field] === opts.internalRef
            ) {
              delete fieldRefs.current[field];
            }
          }
        }
      };
    },
    [],
  );

  async function safeCompute(
    name: string,
    fn: (values: TDefault, index: number) => any,
    index?: number,
    opts?: { silent?: boolean },
  ) {
    if (computing.current.has(name)) return; // avoid infinite loops
    computing.current.add(name);

    try {
      //@ts-ignore
      const result = fn(getValues(), index);

      const currentValue = getValue(name as Path<TDefault>);
      if (result instanceof Promise) {
        result.then((value) => {
          if (value !== currentValue) {
            setValue(name, value, opts);
          }
        });
      } else {
        if (result !== currentValue) {
          setValue(name, result, opts);
        }
      }
    } finally {
      computing.current.delete(name);
    }
  }

  const compute = useCallback(
    (
      name: string,
      depsOrFn: any[] | ((values: any, index: number) => any),
      maybeFn?: (values: any, index: number) => any,
      index?: number,
      opts?: { silent?: boolean },
    ) => {
      const deps = Array.isArray(depsOrFn) ? depsOrFn : null;
      const fn = Array.isArray(depsOrFn) ? maybeFn! : depsOrFn;

      if (deps && deps.includes(name))
        throw new Error(`Computed field "${name}" cannot depend on itself.`);

      // if (Object.keys(formValues.current || {}).includes(name)) {
      //   throw new Error(`Computed field "${name}" already exists`);
      // }

      if (typeof fn !== "function") {
        throw new Error("Invalid compute function");
      }

      // Cleanup previous subscriptions for this computed field
      if (computedUnsubscribesRef.current[name]) {
        computedUnsubscribesRef.current[name].forEach((unsub) => unsub());
      }
      computedUnsubscribesRef.current[name] = [];

      // Store for introspection
      //@ts-ignore
      computedFieldsRef.current[name as string] = { deps, fn };

      // Initial compute
      void safeCompute(name, fn, index, opts);

      // Subscribe to form changes
      if (deps && deps.length > 0) {
        deps.forEach((dep) => {
          // Only subscribe if dependency is a string (field name)
          if (typeof dep === "string") {
            const unsub = subscribe(
              dep,
              () => void safeCompute(name, fn, index),
            );
            computedUnsubscribesRef.current[name].push(unsub);
          }
        });
      } else {
        const unsub = subscribe(() => void safeCompute(name, fn, index));
        computedUnsubscribesRef.current[name].push(unsub);
      }
    },
    [],
  );

  const transform = useCallback(
    <P extends string>(path: P, fn: (val: any) => any) => {
      if (!fieldsTransformsRef.current.has(path)) {
        fieldsTransformsRef.current.set(path, []);
      }
      fieldsTransformsRef.current.get(path)!.push(fn);

      //@ts-ignore
      setValue(path, fn(getValue(path)));
    },
    [],
  );

  function applyTransformations(path: string, value: any) {
    const fns = fieldsTransformsRef.current.get(path);

    if (fns) {
      for (const transformFn of fns) {
        value = transformFn(value);
      }
    }

    return value;
  }

  function evaluateConditionals() {
    const values = getValues() as TDefault;

    // reset ephemeral metadata (we re-evaluate everything)
    hiddenFieldsRef.current = { ...(hiddenFieldsRef.current || {}) };
    requiredFieldsRef.current = { ...(requiredFieldsRef.current || {}) };
    unregisteredRef.current = { ...(unregisteredRef.current || {}) };

    for (const rule of conditionalRulesRef.current) {
      const { fields, config } = rule;
      let result: boolean;

      try {
        result = Boolean(config.when(values));
      } catch (err) {
        // if the condition throws, treat as false and continue
        result = false;
        // optionally log or surface dev warning
        // console.warn("conditional when() threw for rule", rule, err);
      }

      const effects = result ? (config.then ?? {}) : (config.else ?? {});

      for (const field of fields) {
        // apply visibility
        if (effects.visible !== undefined) {
          hiddenFieldsRef.current[field] = !effects.visible;
        }

        // apply unregister or clear behavior when hidden
        const isHidden = hiddenFieldsRef.current[field] === true;
        if (isHidden) {
          if (effects.clear) {
            // clear the value silently (avoid firing user-level subscriptions twice)
            setValue(field, undefined, { silent: true });
          }

          if (effects.unregister) {
            unregisteredRef.current[field] = true;
            // form.unregister(field);
          }

          // remove errors for hidden field
          delete formErrors.current[field];
        } else {
          // field visible → ensure unregister flag false
          unregisteredRef.current[field] = false;
        }
      }
    }

    notifyConditionalChange();
  }

  const conditional = useCallback(
    (fields: string | string[], cfg: ConditionalConfig<TDefault>) => {
      const normalized = Array.isArray(fields) ? fields : [fields];

      conditionalRulesRef.current.push({
        fields: normalized,
        config: cfg,
      });

      // evaluate immediately so state is correct before UI renders
      evaluateConditionals();

      // return an unregister handle for this rule.
      const ruleIndex = conditionalRulesRef.current.length - 1;
      return () => {
        conditionalRulesRef.current.splice(ruleIndex, 1);
        evaluateConditionals();
      };
    },
    [],
  );

  function subscribeVisibility(name: string, cb: () => void) {
    if (!visibilitySubscribersRef.current[name]) {
      visibilitySubscribersRef.current[name] = new Set();
    }
    visibilitySubscribersRef.current[name].add(cb);
    return () => {
      visibilitySubscribersRef.current[name].delete(cb);
      if (visibilitySubscribersRef.current[name].size === 0) {
        delete visibilitySubscribersRef.current[name];
      }
    };
  }

  function notifyConditionalChange() {
    const map = visibilitySubscribersRef.current;
    for (const key in map) {
      const set = map[key];
      set.forEach((cb) => cb());
    }
  }

  const watch = useCallback((fields?: string | string[]) => {
    // If no fields provided, watch all fields
    const fieldsToWatch = !fields
      ? Object.keys(formValues.current) // Watch all fields
      : Array.isArray(fields)
        ? fields
        : [fields];

    if (!fields) watchedFieldsRef.current.clear();

    // Track fields for reactivity
    fieldsToWatch.forEach((field) => {
      if (field) {
        // Ensure field is not empty
        watchedFieldsRef.current.add(field);
      }
    });

    // Return current values
    if (!fields) return getValues();
    const result = fieldsToWatch.map((field) => getValue(field));

    if (!Array.isArray(fields) && result.length === 1) return result[0];

    if (Array.isArray(fields)) {
      // Return both array and object types
      return Object.assign(
        result,
        Object.fromEntries(
          fields.map((field, index) => [field, result[index]]),
        ),
      );
    }

    return result;
  }, []);

  const subscribeFieldError = useCallback(
    (name: string, callback: (error: string | undefined) => void) => {
      if (!fieldErrorSubscribersRef.current[name]) {
        fieldErrorSubscribersRef.current[name] = new Set();
      }

      const set = fieldErrorSubscribersRef.current[name];
      set.add(callback);

      // immediately emit current error
      callback(formErrors.current[name]);

      return () => {
        set.delete(callback);
        if (set.size === 0) {
          delete fieldErrorSubscribersRef.current[name];
        }
      };
    },
    [],
  );

  const unsubscribeField = useCallback(
    (name: string, callback: (value: any) => void) => {
      const set = fieldSubscribersRef.current[name as string];

      if (set && callback) set.delete(callback);

      delete fieldErrorSubscribersRef.current[name];
      delete fieldRefs.current[name as string];
      delete dirtyFieldsRef.current[name as string];
      delete touchedFieldsRef.current[name as string];
      delete computedFieldsRef.current[name as string];
      fieldsTransformsRef.current.delete(name as string);
      delete formErrors.current[name];
      fieldsValidationsRef.current.delete(name);
    },
    [],
  );

  const unsubscribeFieldPrefix = useCallback(
    (prefix: keyof TDefault) => {
      for (const key of Object.keys(fieldSubscribersRef.current)) {
        if (key.startsWith(prefix as string)) {
          fieldSubscribersRef.current[key].forEach((cb) => {
            unsubscribeField(key, cb);
          });
        }
      }
    },
    [unsubscribeField],
  );

  const reset = useCallback(
    (opts?: { ignoreDefaults?: boolean }) => {
      Object.keys(fieldSubscribersRef.current).forEach((name) =>
        fieldSubscribersRef.current[name]?.forEach((cb) => cb("")),
      );

      Object.keys(fieldErrorSubscribersRef.current).forEach((name) =>
        fieldErrorSubscribersRef.current[name]?.forEach((fn) => fn(undefined)),
      );

      dirtyFieldsRef.current = {};
      touchedFieldsRef.current = {};

      formValues.current = flattenFormValues({
        ...generatePlaceholders,
        ...(opts?.ignoreDefaults ? {} : defaultValues),
      });

      setErrors({});
      formErrors.current = {};

      if (persistKey) deleteDraft(persistKey);

      // 🔔 Clear form metadata context
      // metaRef.current.clear();

      // 🔔 Reset wizard step state back to step 1
      setCurrentStep(0);

      // 🔔 Re-calculate all computed fields after reset
      Object.entries(computedFieldsRef.current).forEach(([name, { fn }]) => {
        void safeCompute(name, fn, undefined, { silent: true });
      });

      setValues(
        {
          ...generatePlaceholders,
          ...(opts?.ignoreDefaults ? {} : defaultValues),
        },
        { overwrite: true },
        true,
      );

      triggerRerender();
    },
    [
      defaultValues,
      persistKey,
      getValues,
      getValue,
      generatePlaceholders,
      triggerRerender,
    ],
  );

  const resetField = useCallback((name: string) => {
    const combined = { ...generatePlaceholders, ...defaultValues };
    setValue(name, combined[name]);
    markTouched(name as string);
  }, []);

  const isDirty = useCallback((name?: string) => {
    if (!name) return Object.values(dirtyFieldsRef.current).some(Boolean);
    return !!dirtyFieldsRef.current[name];
  }, []);

  const isTouched = useCallback((name?: string) => {
    if (!name) return Object.values(touchedFieldsRef.current).some(Boolean);
    return !!touchedFieldsRef.current[name];
  }, []);

  const markTouched = useCallback((name: string) => {
    touchedFieldsRef.current[name] = true;
  }, []);

  const markDirty = useCallback((name: string) => {
    dirtyFieldsRef.current[name] = true;
  }, []);

  // -----------------------------
  // Async Validation Assignments
  // -----------------------------
  runAsyncValidation = useCallback(
    (name: string, value: any) => {
      const config = (options?.asyncValidate as any)?.[name];
      if (!config) return;

      // Clear previous timer for this field
      if (asyncTimersRef.current[name]) {
        clearTimeout(asyncTimersRef.current[name]);
      }

      // Set current version of this request
      const currentVersion = (asyncVersionsRef.current[name] || 0) + 1;
      asyncVersionsRef.current[name] = currentVersion;

      const debounceTime = config.debounce ?? 500;

      asyncTimersRef.current[name] = setTimeout(async () => {
        setValidatingFields((prev) => ({ ...prev, [name]: true }));
        try {
          const error = await config.fn(value, getValues());

          // If this is still the latest request version, commit it!
          if (asyncVersionsRef.current[name] === currentVersion) {
            setFieldError(name, error || undefined);
          }
        } catch (err) {
          if (asyncVersionsRef.current[name] === currentVersion) {
            setFieldError(name, "Validation failed");
          }
        } finally {
          if (asyncVersionsRef.current[name] === currentVersion) {
            setValidatingFields((prev) => {
              const next = { ...prev };
              delete next[name];
              return next;
            });
          }
          setTimeout(() => focus(name), 10);
        }
      }, debounceTime);
    },
    [options, setFieldError, focus],
  );

  runAllAsyncValidations = useCallback(async () => {
    const asyncConfigs = options?.asyncValidate;
    if (!asyncConfigs) return { success: true, errors: {} };

    const errors: Record<string, string> = {};
    const promises = Object.entries(asyncConfigs).map(
      async ([name, config]: [string, any]) => {
        if (!config) return;
        const value = getValue(name);

        setValidatingFields((prev) => ({ ...prev, [name]: true }));
        try {
          const error = await config.fn(value, getValues());
          if (error) {
            errors[name] = error;
          }
        } catch (err) {
          errors[name] = "Validation failed";
        } finally {
          setValidatingFields((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
          });
        }
      },
    );

    await Promise.all(promises);
    return {
      success: Object.keys(errors).length === 0,
      errors,
    };
  }, [options, getValue, focus]);

  // -----------------------------
  // Patch Diffing (getChanges)
  // -----------------------------
  const getChanges = useCallback(() => {
    const flatDefaults = flattenFormValues(
      initialValuesRef.current || defaultValues,
    );
    const flatCurrent = flattenFormValues(formValues.current);
    const changes: Record<string, any> = {};
    for (const key in flatCurrent) {
      if (!areFlatValuesEqual(flatCurrent[key], flatDefaults[key])) {
        changes[key] = flatCurrent[key];
      }
    }

    return nestFormValues(changes);
  }, []);

  function createHandlerContext(data: Record<string, any>) {
    return {
      setValues,
      setErrors,
      mapErrors: (errors: Record<string, any>, path: string) =>
        setErrors(mapErrors(errors, path)),
      reset,
      focus,
      array: (path: string) => handlerArrayHelpers(path, data),
      meta: formMetadata,
      getChanges,
    };
  }

  const handleSubmit = useCallback(
    (
      onValid: (
        data: any,
        ctx: HandlerContext<any>,
        raw: FormData,
      ) => void | Promise<void>,
    ) => {
      return async (event?: React.FormEvent) => {
        if (event) event.preventDefault();

        try {
          const validatedData = await validateAndSubmit();
          if (!validatedData) return;

          setIsSubmitting(true);

          const data = structuredClone(validatedData);
          const raw =
            event?.currentTarget instanceof HTMLFormElement
              ? new FormData(event.currentTarget)
              : new FormData();

          //@ts-ignore
          await onValid(validatedData, createHandlerContext(data), raw);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [],
  );

  const field = useCallback(<P extends Path<TDefault>>(path: P) => {
    return {
      get: () => getValue(path),
      set: (value: PathValue<TDefault, P>) => setValue(path, value),
      transform(fn: (val: any) => any) {
        transform(path, fn);
      },
      validate: () => {
        //@ts-ignore
        validateField(path, getValue(path));
        //@ts-ignore
        if (getError(path)) {
          focus(path);
        }
      },
      get error() {
        //@ts-ignore
        return getError(path);
      },
      get hasError() {
        //@ts-ignore
        return !!getError(path);
      },
      get isTouched() {
        return isTouched(path);
      },
      get isDirty() {
        return isDirty(path);
      },
      focus: () => focus(path),
      //@ts-ignore
      reset: () => resetField(path),
    };
  }, []);

  const array = useCallback((path: string) => {
    return formArrayHelper({
      path,
      get formValues() {
        return formValues.current;
      },
      setValues,
      //@ts-ignore
      computed,
      compute,
      getCurrentArrayValue: () => getDeepValue(formValues.current, path),
      getKeys: () => arrayKeysRef.current[path] || [],
      setKeys: (newKeys: string[]) => {
        arrayKeysRef.current[path] = newKeys;
      },
    });
  }, []);

  const group = useCallback(<P extends Path<TDefault>>(path: P) => {
    return groupHelpers({
      path,
      //@ts-ignore
      formValues: formValues.current,
      //@ts-ignore
      defaultValues,
      setValues,
      getCurrentValue: () => getDeepValue(formValues.current, path),
      validateField,
      validatePartial,
    });
  }, []);

  const debug = useCallback(() => {
    const cascadeState = {} as any;
    const cascades = cascadeRef.current;
    if (cascades) {
      Object.keys(cascades).forEach((key) => {
        cascadeState[key] = {
          data: metaRef.current.get(`${key}.options`) ?? [],
          isLoading: !!loadingCascades[key],
        };
      });
    }

    return {
      values: { ...getValues() },
      errors: { ...getErrors() },
      dirty: { ...nestFormValues(dirtyFieldsRef.current) },
      touched: { ...nestFormValues(touchedFieldsRef.current) },
      computed: { ...computedFieldsRef.current },
      meta: Object.fromEntries(metaRef.current.entries()),
      cascade: cascadeState,
      subscriptions: {
        fields: { ...fieldSubscribersRef.current },
        errors: { ...fieldErrorSubscribersRef.current },
      },
      state: {
        isSubmitting,
        isValidated,
      },
    };
  }, [loadingCascades]);

  const formMetadata = useMemo(
    () => createMetaContext(metaRef, triggerRerender),
    [triggerRerender],
  );

  // -----------------------------
  // Cascading Option Binding Subscription
  // -----------------------------
  useEffect(() => {
    const cascades = cascadeRef.current;
    if (!cascades) return;

    const unsubs: (() => void)[] = [];

    Object.entries(cascades).forEach(([fieldName, _config]) => {
      const triggerCascade = async () => {
        const latestConfig = (cascadeRef.current as any)?.[fieldName];
        if (!latestConfig) return;

        const currentValues = getValues();
        const watchedValues = latestConfig.watch.map((p: string) =>
          getValue(p),
        );

        setLoadingCascades((prev) => ({ ...prev, [fieldName]: true }));
        try {
          const resolved = await latestConfig.fn(currentValues, watchedValues);
          formMetadata.set(`${fieldName}.options`, resolved);
          latestConfig.onLoad?.(resolved);
        } catch (err) {
          console.error(
            `Cascading options failed for field ${fieldName}:`,
            err,
          );
        } finally {
          setLoadingCascades((prev) => {
            const next = { ...prev };
            delete next[fieldName];
            return next;
          });
        }
      };

      const initialConfig = (cascades as any)[fieldName];
      if (initialConfig) {
        // Subscribe to each watched field
        initialConfig.watch.forEach((watchField: string) => {
          const unsub = subscribe(watchField, () => {
            void triggerCascade();
          });
          unsubs.push(unsub);
        });

        // Run initial load on mount
        void triggerCascade();
      }
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [getValues, getValue, subscribe, formMetadata]);

  //initialize form
  // Intentionally depends only on defaultValues.
  // Draft restoration & computed logic are internally guarded.
  useFormInitialization({
    //@ts-ignore
    defaultValues,
    persistKey,
    savedFormFirst,
    generatePlaceholders,
    //@ts-ignore
    computed,
    draftListeners,
    onReady,
    setValues,
    createHandlerContext,
    compute,
    initialValuesRef,
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const totalSteps = options?.steps?.length ?? 0;

  const nextStep = useCallback(async () => {
    if (!options?.steps) return true;
    const stepFields = options.steps[currentStep];
    if (!stepFields) return true;

    const stepErrors: Record<string, string> = {};
    let hasStepError = false;

    // 1. Zod schema validation
    if (currentSchema.current) {
      const validate = await formValidation();
      if (!validate.isValidated && validate.formErrors) {
        stepFields.forEach((field) => {
          const err = validate.formErrors?.[field as string];
          if (err) {
            stepErrors[field as string] = err;
            hasStepError = true;
          } else {
            delete formErrors.current[field as string];
          }
        });
      } else {
        stepFields.forEach((field) => {
          delete formErrors.current[field as string];
        });
      }
    }

    // 2. Custom check function
    if (check) {
      const checkResult = await check(getValues() as any, {
        multiPathError,
        focus,
      });
      if (checkResult) {
        const checkErrors = checkResult as Record<string, string>;
        stepFields.forEach((field) => {
          const err = checkErrors[field as string];
          if (err) {
            stepErrors[field as string] = err;
            hasStepError = true;
          }
        });
      }
    }

    // 3. Debounced async validation checks
    if (options?.asyncValidate) {
      const asyncConfigs = options.asyncValidate;
      const promises = stepFields.map(async (field) => {
        const config = (asyncConfigs as any)[field];
        if (!config) return;

        const val = getValue(field);

        setValidatingFields((prev) => ({ ...prev, [field]: true }));
        try {
          const err = await config.fn(val, getValues());
          if (err) {
            stepErrors[field] = err;
            hasStepError = true;
          }
        } catch {
          stepErrors[field] = "Validation failed";
          hasStepError = true;
        } finally {
          setValidatingFields((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
      });

      await Promise.all(promises);
    }

    if (hasStepError) {
      setErrors({ ...formErrors.current, ...stepErrors });
      focusFirst(stepErrors);
      return false;
    }

    // Clear step fields errors if valid
    const cleanErrors = { ...formErrors.current };
    stepFields.forEach((field) => {
      delete cleanErrors[field as string];
    });
    setErrors(cleanErrors);

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      return true;
    }

    return true;
  }, [
    currentStep,
    options?.steps,
    check,
    options?.asyncValidate,
    getValues,
    formValidation,
    focusFirst,
    setErrors,
  ]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      return true;
    }
    return false;
  }, [currentStep]);

  const setStep = useCallback(
    (step: number) => {
      if (!options?.steps) return;
      if (step >= 0 && step < options.steps.length) {
        setCurrentStep(step);
      }
    },
    [options?.steps],
  );

  const register = useCallback(
    <P extends Path<TDefault>>(
      name: P,
      options?: FieldRegistrationOptions<TDefault, P>,
      internal?: boolean,
    ) => {
      // 1️⃣ Setup field metadata immediately during render (no hooks)
      if (options) {
        fieldRegistryRef.current[name] = options;

        if (options.transform) {
          const arr = Array.isArray(options.transform)
            ? options.transform
            : [options.transform];
          fieldsTransformsRef.current.set(name, arr);
        }

        if (options.validate) {
          fieldsValidationsRef.current.set(name, options.validate);
        }

        // handle defaultValue only when field is initially undefined
        const currentValue = getValue(name);
        if (options.defaultValue !== undefined && currentValue === undefined) {
          setValue(name, options.defaultValue, { silent: true });
        }
      }

      // 2️⃣ Event Handlers
      const onChange = (e: any) => {
        const val = e?.target?.value ?? e;
        setValue(name, val);
        touchedFieldsRef.current[name] = true;
        dirtyFieldsRef.current[name] = true;

        if (["change", "change-submit"].includes(validateOn)) {
          validateField(name);
        }
      };

      const onBlur = () => {
        touchedFieldsRef.current[name] = true;
        if (validateOn === "blur") {
          validateField(name);
          runAsyncValidation(name, getValue(name));
        }
      };

      const refId = name + "-reg-" + Math.random().toString(36).substring(2, 9);

      const valueProps =
        mode === "uncontrolled"
          ? { defaultValue: getValue(name) ?? "" }
          : { value: getValue(name) ?? "" };

      return {
        name: name as string,
        ...valueProps,
        onChange,
        onBlur,
        "data-input-ref": refId,
        "data-input-error": !!formErrors.current[name],
        "aria-invalid": !!formErrors.current[name],
        ref: (element: any) => {
          if (element) {
            // Save element reference id for focus()
            fieldRefs.current[name] = refId;

            if (internal) return;

            // Subscribe to element value changes
            const unsubValue = subscribe(
              name,
              (val) => {
                if (element && element.value !== val) {
                  element.value = val ?? "";
                }
              },
              { internalRef: refId },
            );

            // Subscribe to element validation error changes
            const unsubError = subscribeFieldError(name, (err) => {
              if (element) {
                if (err) {
                  element.setAttribute("data-input-error", "true");
                  element.setAttribute("aria-invalid", "true");
                } else {
                  element.removeAttribute("data-input-error");
                  element.removeAttribute("aria-invalid");
                }
              }
            });

            // Save subscriptions for cleanup
            registerUnsubsRef.current[refId] = [unsubValue, unsubError];
          } else {
            // Clean up subscriptions on unmount
            const unsubs = registerUnsubsRef.current[refId];
            if (unsubs) {
              unsubs.forEach((unsub) => unsub());
              delete registerUnsubsRef.current[refId];
            }
            if (fieldRefs.current[name] === refId) {
              delete fieldRefs.current[name];
            }
          }
        },
      };
    },
    [
      mode,
      validateOn,
      getValue,
      setValue,
      subscribe,
      subscribeFieldError,
      validateField,
      runAsyncValidation,
    ],
  );

  const values = {
    register,
    validate: async () => {
      const result = await formValidation();

      focusFirst(result.formErrors);
      setErrors(result.formErrors);
      setIsValidated(result.isValidated);
    },
    validateOn,
    validatePartial,
    setSchema,
    setValue,
    getValue,
    getValues,
    setValues,
    setErrors,
    getError,
    getErrors,
    reset,
    resetField,
    handleSubmit,
    onSubmit: onSubmit ? handleSubmit(onSubmit) : undefined,
    subscribe,
    unsubscribeField,
    subscribeFieldError,
    errorParser,
    field,
    array,
    group,
    steps: {
      next: nextStep,
      prev: () => {
        prevStep();
      },
      get current() {
        return currentStep;
      },
      get isFirst() {
        return currentStep === 0;
      },
      get isLast() {
        return currentStep === totalSteps - 1;
      },
      get total() {
        return totalSteps;
      },
      set: setStep,
    },
    get values() {
      return getValues();
    },
    get errors() {
      return getErrors();
    },
    submitting: isSubmitting,
    validated: isValidated,
    isValidating,
    validatingFields,
    busy: isSubmitting || isValidating,
    getChanges,
    isDirty,
    markDirty,
    isTouched,
    markTouched,
    focus,
    compute,
    transform,
    conditional,
    onDraftSave,
    onDraftRestore,
    debug,
    watch,
    Field,
    channel: channelBus.channel,
    meta: formMetadata,
    get cascade() {
      const res = {} as any;
      const cascades = cascadeRef.current;
      if (cascades) {
        Object.keys(cascades).forEach((key) => {
          res[key] = {
            data: metaRef.current.get(`${key}.options`) ?? [],
            isLoading: !!loadingCascades[key],
          };
        });
      }
      return res;
    },
    id: formIdRef.current,
    get schema() {
      return currentSchema.current;
    },
  };

  if (formIdRef.current) {
    //@ts-ignore
    registry.add(formIdRef.current, values);
  }

  const lastValuesRef = useRef(values);
  lastValuesRef.current = values;

  useEffect(() => {
    return () => {
      if (formIdRef.current) {
        try {
          if (
            registry.has(formIdRef.current) &&
            (registry.get(formIdRef.current) as any) === lastValuesRef.current
          ) {
            registry.delete(formIdRef.current);
          }
        } catch {
          // Ignore if already deleted/not found
        }
      }
    };
  }, []);

  // Prevent accidental page refreshes or closures if form is dirty
  useEffect(() => {
    if (!preventUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [preventUnload, isDirty]);

  //@ts-ignore
  return values;
}
