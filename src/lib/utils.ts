import { Path } from "../types/path";

/**
 * Combines multiple class names into a single string.
 * This function takes an array of class names and returns a single string
 * with all the class names combined, separated by spaces.
 * It filters out any falsey values (null, undefined, etc.) before joining.
 *
 * @param {string[]} classes - An array of class names to combine.
 * @returns {string} A single string with all the class names combined.
 */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function multiPathError<T>(
  paths: Path<T>[],
  message: string
): Partial<Record<Path<T>, string>> {
  return paths.reduce((acc, path) => {
    acc[path] = message;
    return acc;
  }, {} as Partial<Record<Path<T>, string>>);
}

export function mapErrors(
  obj: Record<string, any>,
  path = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    const currentPath = path ? `${path}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item: any, i: number) => {
        // graceful fallback for _index or broken items
        const index =
          item && typeof item === "object" && "_index" in item
            ? item._index
            : i;

        if (item && typeof item === "object" && !Array.isArray(item)) {
          const keys = Object.keys(item);
          const hasOtherKeys = keys.some(
            (k) => k !== "_index" && k !== "error"
          );

          if (hasOtherKeys) {
            // nested object or keyed structure
            for (const subKey in item) {
              if (subKey === "_index") continue;
              result[`${currentPath}.${index}.${subKey}`] = String(
                item[subKey]
              );
            }
          } else if ("error" in item) {
            // simple indexed error: { _index, error }
            result[`${currentPath}.${index}`] = String(item.error);
          } else {
            // empty or malformed object
            result[`${currentPath}.${index}`] = "Invalid value";
          }
        } else if (item != null && item !== "") {
          // primitive value (string, number, etc.)
          result[`${currentPath}.${index}`] = String(item);
        } else {
          // null, undefined, or empty
          result[`${currentPath}.${index}`] = "Invalid value";
        }
      });
    } else if (value && typeof value === "object") {
      // nested object
      Object.assign(result, mapErrors(value, currentPath));
    } else {
      // primitive (string, number, etc.)
      result[currentPath] = String(value);
    }
  }

  return result;
}

export function flattenFormValues<T extends any>(obj: T, prefix = "") {
  const result: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        // always include the array itself
        result[path] = [];
      } else {
        value.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            Object.assign(result, flattenFormValues(item, `${path}.${index}`));
          } else {
            result[`${path}.${index}`] = item;
          }
        });
      }
    } else if (
      typeof value === "object" &&
      !(value instanceof Date) &&
      value !== null
    ) {
      Object.assign(result, flattenFormValues(value, path));
    } else {
      result[path] = value;
    }
  }

  return result;
}

export function nestFormValues<T extends any>(flat: T): T {
  const result: any = {};

  for (const key in flat) {
    const parts = key.split("."); // split by dot
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // If part is numeric (array index)
      const arrayIndex = Number(part);
      const isLast = i === parts.length - 1;

      if (!isNaN(arrayIndex) && Number.isInteger(arrayIndex)) {
        // ensure current is an array
        if (!Array.isArray(current)) current = [];
        if (current[arrayIndex] === undefined) current[arrayIndex] = {};
        if (isLast) {
          current[arrayIndex] = flat[key];
        } else {
          current = current[arrayIndex];
        }
      } else {
        // normal object key
        if (isLast) {
          current[part] = flat[key];
        } else {
          if (
            current[part] === undefined ||
            typeof current[part] !== "object"
          ) {
            // check if next part is numeric to pre-create array
            const nextPart = parts[i + 1];
            current[part] = !isNaN(Number(nextPart)) ? [] : {};
          }
          current = current[part];
        }
      }
    }
  }

  return result;
}

export function mergeValues<T extends any>(defaultValues: T, saved: T): T {
  const flattenDefaultValues = flattenFormValues(defaultValues);
  const flattenSaved = flattenFormValues(saved);

  const result: Record<string, any> = {};

  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(flattenDefaultValues),
    ...Object.keys(flattenSaved),
  ]);

  for (const key of allKeys) {
    const savedValue = flattenSaved[key];
    const defaultValue = flattenDefaultValues[key];

    result[key] =
      defaultValue !== undefined && defaultValue !== null && defaultValue !== ""
        ? defaultValue
        : savedValue ?? defaultValue;
  }

  return result as T;
}

export function determineDirtyFields<T extends any>(
  defaultValues: T,
  saved: T
): T {
  const flattenDefaultValues = flattenFormValues(defaultValues);
  const flattenSaved = flattenFormValues(saved);

  const result: Record<string, any> = {};

  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(flattenDefaultValues),
    ...Object.keys(flattenSaved),
  ]);

  for (const key of allKeys) {
    const savedValue = flattenSaved[key];
    const defaultValue = flattenDefaultValues[key];

    if (savedValue === defaultValue) continue;

    result[key] = true;
  }

  return result as T;
}

export function shallowEqual(a: Record<string, any>, b: Record<string, any>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return aKeys.length === bKeys.length && aKeys.every((k) => a[k] === b[k]);
}

export function mergeInitialValues({
  saved,
  defaults,
  savedFormFirst,
  generatePlaceholders,
}: {
  saved: Record<string, any>;
  defaults: Record<string, any>;
  generatePlaceholders: Record<string, any>;
  savedFormFirst?: boolean;
}) {
  const primary = savedFormFirst ? saved : defaults;
  const secondary = savedFormFirst ? defaults : saved;

  return mergeValues(
    mergeValues(primary || {}, secondary || {}),
    generatePlaceholders
  );
}
