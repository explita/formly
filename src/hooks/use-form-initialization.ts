import { extraxtArrayPrefixies, getArrayKeys } from "../lib/array-helpers";
import {
  mergeInitialValues,
  flattenFormValues,
  shallowEqual,
} from "../lib/utils";
import { useEffect, useRef } from "react";
import { readDraft } from "../utils";
import { UseFormInitializationProps } from "../types/utils";

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
}: UseFormInitializationProps) {
  const previousDefaultValuesRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const saved = persistKey
      ? (readDraft(persistKey) as Record<string, any>)
      : {};

    const merged = mergeInitialValues({
      saved,
      defaults: defaultValues as Record<string, any>,
      savedFormFirst,
      generatePlaceholders,
    });

    // Restore persisted state
    draftListeners.current.restore?.(merged);

    // Notify readiness
    onReady?.(merged, createHandlerContext(merged));

    const flattenedDefaults = flattenFormValues(defaultValues);

    const defaultsUnchanged = shallowEqual(
      previousDefaultValuesRef.current,
      flattenedDefaults
    );

    if (defaultsUnchanged) return;

    previousDefaultValuesRef.current = flattenedDefaults;

    // Run computed fields
    if (computed) {
      for (const key in computed) {
        const { deps, fn } = computed[key];

        if (key.includes("*")) {
          const parts = key.split("*");
          if (parts.length !== 2) continue;

          const [arrayName, fieldName] = parts;
          const arrLength = getArrayKeys(arrayName, merged).length;

          for (let i = 0; i < arrLength; i++) {
            const computedKey = `${arrayName}.${i}.${fieldName}`;
            const fieldDeps = extraxtArrayPrefixies(arrayName, i, deps);

            compute(computedKey, fieldDeps, (vals: any) => fn(vals, i));
          }
        } else {
          compute(key, deps || [], fn);
        }
      }
    }

    // Commit values as source of truth
    setValues({ ...merged }, { overwrite: true }, true);
  }, [defaultValues]);
}
