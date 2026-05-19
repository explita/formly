import { extraxtArrayPrefixies, getArrayKeys } from "../lib/array-helpers.js";
import {
  mergeInitialValues,
  flattenFormValues,
  shallowEqual,
  nestFormValues,
} from "../lib/utils.js";
import { useEffect, useRef, useCallback } from "react";
import { readDraft } from "../utils/index.js";
import { UseFormInitializationProps } from "../types/utils.js";

export function useFormInitialization({
  defaultValues,
  persistKey,
  savedFormFirst,
  generatePlaceholders,
  computed,
  draftListeners,
  compute,
  onReady,
  setValues,
  createHandlerContext,
  initialValuesRef,
}: UseFormInitializationProps) {
  const previousDefaultValuesRef = useRef<Record<string, any>>({});
  const hasInitializedRef = useRef(false);

  const saved = persistKey
    ? (readDraft(persistKey) as Record<string, any>)
    : {};

  const merged = mergeInitialValues({
    saved,
    defaults: defaultValues as Record<string, any>,
    savedFormFirst,
    generatePlaceholders,
  });

  const initialize = useCallback(
    (currentValues: any, opts?: { silent?: boolean }) => {
      if (!computed) return;

      for (const key in computed) {
        const { deps, fn } = computed[key];

        if (key.includes("*")) {
          const parts = key.split("*");
          if (parts.length !== 2) continue;

          const [arrayName, fieldName] = parts;
          const arrLength = getArrayKeys(arrayName, currentValues).length;

          for (let i = 0; i < arrLength; i++) {
            const computedKey = `${arrayName}.${i}.${fieldName}`;
            const fieldDeps = extraxtArrayPrefixies(arrayName, i, deps);

            compute(
              computedKey,
              fieldDeps,
              (vals: any) => fn(vals, i),
              undefined,
              opts,
            );
          }
        } else {
          compute(key, deps || [], fn, undefined, opts);
        }
      }
    },
    [computed, compute],
  );

  // Handle first-pass synchronous initialization
  if (!hasInitializedRef.current) {
    const flattenedDefaults = flattenFormValues(defaultValues);
    previousDefaultValuesRef.current = flattenedDefaults;
    if (initialValuesRef) {
      initialValuesRef.current = structuredClone(defaultValues);
    }

    // Restore persisted state if any
    draftListeners.current.restore?.(merged);

    // Commit values as source of truth
    setValues({ ...merged }, { overwrite: true }, true);

    // Initial compute loop (Sync)
    initialize(merged, { silent: true });

    // Notify readiness
    onReady?.(nestFormValues(merged), createHandlerContext(merged));
    hasInitializedRef.current = true;
  }

  const previousComputedRef = useRef<any>({});

  useEffect(() => {
    const flattenedDefaults = flattenFormValues(defaultValues);
    const defaultsUnchanged = shallowEqual(
      previousDefaultValuesRef.current,
      flattenedDefaults,
    );

    const computedUnchanged = shallowEqual(
      previousComputedRef.current,
      computed || {},
    );

    if (defaultsUnchanged && computedUnchanged) return;

    if (!defaultsUnchanged) {
      previousDefaultValuesRef.current = flattenedDefaults;
      if (initialValuesRef) {
        initialValuesRef.current = structuredClone(defaultValues);
      }
      // Commit values as source of truth
      setValues({ ...merged }, { overwrite: true }, true);
    }

    if (!computedUnchanged) {
      previousComputedRef.current = computed;
    }

    // Run computed fields updates
    initialize(merged, { silent: true });
  }, [defaultValues, computed]);
}
