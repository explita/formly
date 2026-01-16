"use client";

import type { z } from "zod";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  InputValue,
  HandlerContext,
  FormInstance,
  FormValues,
  Subscriber,
  ComputedField,
  FieldRegistrationOptions,
  ConditionalConfig,
} from "../types/utils";
import {
  debounce,
  deleteDraft,
  validateForm,
  writeDraft,
  writeDraftImmediate,
} from "../utils";
import {
  flattenFormValues,
  mapErrors,
  multiPathError,
  nestFormValues,
  shallowEqual,
} from "../lib/utils";
import { getDeepValue, getValueByPath } from "../lib/deep-path";
import { formArrayHelper, handlerArrayHelpers } from "../lib/array-helpers";
import {
  createEmptyValues,
  isZodError,
  isZodSchema,
  mapZodErrors,
} from "../lib/zod-helpers";
import { Path, PathValue } from "../types/path";
import { groupHelpers } from "../lib/group-helpers";
import { Field } from "../components";
import { createFormBus } from "../lib/pub-sub";
import { registry } from "../lib/form-registry";
import { useFormInitialization } from "./use-form-initialization";
import { createMetaContext } from "../lib/meta-context";

export function useForm<
  TSchema extends z.ZodObject<any> | undefined = undefined,
  TDefault = TSchema extends z.ZodObject<any>
    ? z.infer<TSchema>
    : Record<string, any>
>(
  options?: FormValues<TSchema, TDefault>
): FormInstance<
  TSchema extends z.ZodObject<any> ? z.infer<TSchema> : TDefault
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
  } = options || {};

  const persistKey = options?.persistKey ?? options?.id;

  const channelBus = useMemo(() => createFormBus(), []);

  // validation state
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [, forceRender] = useState(0);

  // Draft listeners
  const draftListeners = useRef<{
    save?: (values: any) => void;
    restore?: (values: any) => void;
  }>({});

  // values
  const formValues = useRef({} as Record<string, any>);
  const computing = useRef<Set<string>>(new Set());
  const computedFieldsRef = useRef<Record<string, ComputedField<TDefault>>>({});

  // watched fields state (triggers re-renders)
  const watchedFieldsRef = useRef<Set<string>>(new Set());

  // errors
  const formErrors = useRef<Partial<Record<string, string>>>({});

  // subscribers
  const globalSubscribers = useRef<Set<(values: any) => void>>(new Set());
  const fieldSubscribersRef = useRef<Record<string, Set<(value: any) => void>>>(
    {}
  );
  const fieldRegistryRef = useRef<
    Record<string, FieldRegistrationOptions<any, any>>
  >({});
  const fieldsTransformsRef = useRef<Map<string, ((val: any) => any)[]>>(
    new Map()
  );
  const fieldsValidationsRef = useRef<Map<string, (val: any) => any>>(
    new Map()
  );

  const metaRef = useRef<Map<string, unknown>>(new Map());

  const fieldErrorSubscribersRef = useRef<
    Record<string, Set<(err: string | undefined) => void>>
  >({});

  // store field refs
  const fieldRefs = useRef<Record<string, string>>({});

  const pendingFields = new Set<string>();
  let notifyScheduled = false;

  const dirtyFieldsRef = useRef<Record<string, boolean>>({});
  const touchedFieldsRef = useRef<Record<string, boolean>>({});

  const currentSchema = useRef<z.ZodObject<any> | undefined>(
    schema && isZodSchema(schema) ? schema : undefined
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
      formValidation().then(({ isValidated, formValues: values }) => {
        setIsValidated(isValidated);
        formValues.current = values;
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
      flattenedErrors
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
      if (!persistKey) return () => {};

      draftListeners.current.save?.(formValues.current);

      if (channel === "immediate") {
        return writeDraftImmediate(
          persistKey,
          nestFormValues(formValues.current)
        );
      }

      return writeDraft(persistKey, nestFormValues(formValues.current));
    },
    [persistKey]
  );

  const setSchema = useCallback((newSchema?: z.ZodObject<any>) => {
    currentSchema.current = newSchema;
  }, []);

  function triggerRerender() {
    forceRender((prev) => prev + 1);
  }

  const setValue = useCallback(
    (name: string, value: any, opts: { silent?: boolean } = {}) => {
      if (mode === "uncontrolled") return;

      value = applyTransformations(name as string, value);

      // Always update ref for consistency
      formValues.current[name] = value;
      markDirty(name);

      if (!opts.silent) {
        channelBus.channel("value:*").emit(getValues());
        channelBus.channel(`value:${name}` as any).emit(value);

        if (
          !computedFieldsRef.current[name as string] &&
          (validateOn === "change-submit" || validateOn === "change")
        ) {
          validateField(name, value);
        }

        const validator = fieldsValidationsRef.current.get(name);

        if (validator) {
          const error = validator(value);
          setFieldError(name, error);
        }

        // 🔔 Notify subscribers
        notifySubscribers(name as any);

        // Update state if field is watched (triggers re-render)
        if (watchedFieldsRef.current.has(name)) {
          writeDraftDebounced("immediate");
          triggerRerender();
        } else {
          writeDraftDebounced();
          evaluateConditionals();
        }
      }
    },
    [mode, writeDraftDebounced]
  );

  const setValues = useCallback(
    (
      values: any,
      options?: {
        overwrite?: boolean;
      },
      skipWriteDraft = false
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
    [writeDraftDebounced, triggerRerender]
  );

  const getValue = useCallback(
    (name: string) => getValueByPath(getValues(), name),
    []
  );

  const getValues = useCallback(
    () => nestFormValues(formValues.current) as TDefault,
    []
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
    []
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
    [setFieldError]
  );

  const getError = useCallback(
    (name: keyof TDefault) =>
      getValueByPath(formErrors.current, name as string),
    []
  );

  const getErrors = useCallback(() => formErrors.current, []);

  function resetErrors() {
    if (!formErrors.current || Object.keys(formErrors.current).length === 0)
      return;
    setErrors(
      Object.keys(formErrors.current).reduce((acc, key) => {
        acc[key] = undefined;
        return acc;
      }, {} as Record<string, undefined>)
    );
  }

  //validate single field
  const validateField = useCallback(
    debounce(async (name: string, inputValue?: InputValue) => {
      if (!name || !currentSchema.current || mode === "uncontrolled") return;

      const result = await validateForm(currentSchema.current, {
        [name]: inputValue,
      });

      if (!result.success) {
        const fieldError = result.errors[name as string] ?? undefined;

        setFieldError(name, fieldError);
      } else {
        setFieldError(name, undefined);
      }
    }, 150),
    [currentSchema, mode, setFieldError]
  );

  async function formValidation() {
    if (!currentSchema.current || mode === "uncontrolled")
      return { isValidated: false, formValues: formValues.current };

    const result = await validateForm(
      currentSchema.current,
      formValues.current as Record<string, unknown>
    );

    if (result.success) {
      formValues.current = flattenFormValues(result.data);
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

    // resetErrors();

    return getValues();
  }

  const register = useCallback(
    <P extends Path<TDefault>>(
      name: P,
      options?: FieldRegistrationOptions<TDefault, P>,
      internal?: boolean
    ) => {
      const [error, setError] = useState<string | undefined>(
        formErrors.current[name]
      );
      // internal value ref
      const valueRef = useRef(getValue(name));

      const refId = name + "-" + useId();

      // setup field metadata on mount
      useEffect(() => {
        if (options) {
          fieldRegistryRef.current[name] = options;

          if (options.transform) {
            const arr = Array.isArray(options.transform)
              ? options.transform
              : [options.transform];
            fieldsTransformsRef.current.set(name, arr);
          } else {
            fieldsTransformsRef.current.delete(name);
          }

          //@ts-ignore
          if (options.compute) {
            //@ts-ignore
            const { deps, fn } = options.compute;
            compute(name, deps, fn);
          }

          if (options.validate) {
            fieldsValidationsRef.current.set(name, options.validate);
          } else {
            fieldsValidationsRef.current.delete(name);
          }

          // handle defaultValue only when field is initially undefined
          const currentValue = getValue(name);
          if (
            options.defaultValue !== undefined &&
            currentValue === undefined
          ) {
            setValue(name, options.defaultValue, { silent: true });
          }
        }

        if (!internal) {
          // subscribe to internal store → updates ref but not UI
          const unsub = subscribe(name, (val) => {
            valueRef.current = val;
          });

          const unsubError = subscribeFieldError(name, setError);

          return () => {
            unsub();
            unsubError();
            delete fieldRegistryRef.current[name];
            fieldsTransformsRef.current.delete(name);
            fieldsValidationsRef.current.delete(name);
          };
        }
      }, [name, options]); // keep stable

      // handlers
      const onChange = useCallback(
        (e: any) => {
          const val = e?.target?.value ?? e;

          setValue(name, val);
          touchedFieldsRef.current[name] = true;
          dirtyFieldsRef.current[name] = true;

          if (["change", "change-submit"].includes(validateOn)) {
            validateField(name);
          }
        },
        [name]
      );

      const onBlur = useCallback(() => {
        touchedFieldsRef.current[name] = true;
        if (validateOn === "blur") {
          validateField(name);
        }
      }, [name]);

      return {
        name,
        defaultValue: valueRef.current,
        onChange,
        onBlur,
        "data-input-ref": refId,
        "data-input-error": !!error,
        "aria-invalid": !!error,
      };
    },
    []
  );

  const focus = useCallback((name: string) => {
    if (typeof document === "undefined") return;
    const ref = fieldRefs.current[name];

    const element = document.querySelector(`[data-input-ref="${ref}"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    if (element && typeof element.focus === "function") {
      element.focus();
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

    queueMicrotask(() => {
      notifyScheduled = false;

      // Capture and clear pending fields
      const fields = Array.from(pendingFields);
      pendingFields.clear();

      // 1️⃣ Notify all relevant field subscribers
      for (const [subPath, subscribers] of Object.entries(
        fieldSubscribersRef.current
      )) {
        const shouldNotify = fields.some(
          (path) => path === subPath || path.startsWith(`${subPath}.`)
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
      opts?: { internalRef?: string }
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
    []
  );

  async function safeCompute(
    name: string,
    fn: (values: TDefault, index: number) => any,
    index?: number
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
            setValue(name, value);
          }
        });
      } else {
        if (result !== currentValue) {
          setValue(name, result);
        }
      }
    } finally {
      computing.current.delete(name);
    }
  }

  const compute = useCallback(
    (
      name: string,
      depsOrFn: string[] | ((values: any, index: number) => any),
      maybeFn?: (values: any, index: number) => any,
      index?: number
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

      // Store for introspection
      //@ts-ignore
      computedFieldsRef.current[name as string] = { deps, fn };

      // Initial compute
      void safeCompute(name, fn, index);

      // Subscribe to form changes
      if (deps && deps.length > 0) {
        deps.forEach((dep) => {
          subscribe(dep as any, () => void safeCompute(name, fn, index));
        });
      } else {
        subscribe(() => void safeCompute(name, fn, index));
      }
    },
    []
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
    []
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

      const effects = result ? config.then ?? {} : config.else ?? {};

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
    []
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
        Object.fromEntries(fields.map((field, index) => [field, result[index]]))
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
    []
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
    []
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
    [unsubscribeField]
  );

  const reset = useCallback(() => {
    Object.keys(fieldSubscribersRef.current).forEach((name) =>
      fieldSubscribersRef.current[name]?.forEach((cb) => cb(""))
    );

    Object.keys(fieldErrorSubscribersRef.current).forEach((name) =>
      fieldErrorSubscribersRef.current[name]?.forEach((fn) => fn(undefined))
    );

    dirtyFieldsRef.current = {};

    setValues(
      { ...generatePlaceholders, ...defaultValues },
      { overwrite: true },
      true
    );

    channelBus.channel("value:*").emit({});

    setErrors({});

    if (persistKey) deleteDraft(persistKey);

    triggerRerender();
  }, []);

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
    };
  }

  const handleSubmit = useCallback(
    (
      onValid: (data: any, ctx: HandlerContext<any>) => void | Promise<void>
    ) => {
      return async (event?: React.FormEvent) => {
        if (event) event.preventDefault();

        try {
          const validatedData = await validateAndSubmit();
          if (!validatedData) return;

          setIsSubmitting(true);

          const data = structuredClone(validatedData);

          //@ts-ignore
          await onValid(validatedData, createHandlerContext(data));
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    []
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
    return {
      values: { ...getValues() },
      errors: { ...getErrors() },
      dirty: { ...nestFormValues(dirtyFieldsRef.current) },
      touched: { ...nestFormValues(touchedFieldsRef.current) },
      computed: { ...computedFieldsRef.current },
      subscriptions: {
        fields: { ...fieldSubscribersRef.current },
        errors: { ...fieldErrorSubscribersRef.current },
      },
      state: {
        isSubmitting,
        isValidated,
      },
    };
  }, []);

  const formMetadata = createMetaContext(metaRef, triggerRerender);

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
  });

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
    get values() {
      return getValues();
    },
    get errors() {
      return getErrors();
    },
    submitting: isSubmitting,
    validated: isValidated,
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
  };

  //@ts-ignore
  if (id) registry.add(id, values); // synchronous

  useEffect(() => {
    return () => {
      if (id) registry.delete(id);
    };
  }, [id]);

  //@ts-ignore
  return values;
}
