import {
  ArrayHelperProps,
  ArrayHelpers,
  HandlerArrayHelpers,
} from "../types/array.js";
import { getDeepValue, setDeepValue, setValueByPath } from "./deep-path.js";
import { nestFormValues } from "./utils.js";
import { Path } from "../types/path.js";
import { Compute, SetValues } from "../types/utils.js";

export function formArrayHelper<T = any>(
  props: ArrayHelperProps<T>,
): ArrayHelpers<T> {
  const {
    path,
    formValues,
    setValues,
    compute,
    computed,
    getCurrentArrayValue,
    getKeys,
    setKeys,
  } = props;

  function get() {
    return getCurrentArrayValue() || [];
  }

  // Auto-initialize keys if not matching the current list length
  const currentLength = get().length;
  let initialKeys = [...getKeys()];
  if (initialKeys.length !== currentLength) {
    while (initialKeys.length < currentLength) {
      initialKeys.push(generateArrayKey());
    }
    if (initialKeys.length > currentLength) {
      initialKeys.length = currentLength;
    }
    setKeys(initialKeys);
  }

  let working = [...get()];

  function set(arr: T[]) {
    const newFlat = { ...formValues };

    Object.keys(formValues || {}).forEach((key) => {
      if (key.startsWith(path)) {
        delete newFlat[key as keyof T];
      }
    });

    // set new array keys
    arr.forEach((v, i) => {
      //@ts-ignore
      newFlat[`${path}.${i}`] = v;
    });

    setValues(newFlat, { overwrite: true });
  }

  function remove(index: number | number[]) {
    const currentKeys = [...getKeys()];
    if (Array.isArray(index)) {
      const sorted = [...index].sort((a, b) => b - a);
      sorted.forEach((i) => {
        currentKeys.splice(i, 1);
      });
    } else {
      currentKeys.splice(index, 1);
    }
    setKeys(currentKeys);
    removeArrayItem(formValues, setValues, path, index);
  }

  function clear() {
    setKeys([]);
    clearArray(formValues, setValues, path);
  }

  const api: ArrayHelpers<T> = {
    get: () => structuredClone(get()),
    get value() {
      return structuredClone(get());
    },
    get length() {
      return get().length;
    },
    get keys() {
      return getKeys();
    },

    filter(fn) {
      const currentKeys = [...getKeys()];
      const keptIndexes: number[] = [];
      const filtered = get().filter((item, index) => {
        const keep = fn(item, index);
        if (keep) {
          keptIndexes.push(index);
        }
        return keep;
      });
      working = filtered;
      set(filtered);

      const newKeys = keptIndexes.map((idx) => currentKeys[idx]);
      setKeys(newKeys);
      return api;
    },
    map(fn) {
      const mapped = get().map(fn);
      working = mapped;
      set(mapped);
      return api;
    },

    replaceAll: (value) => {
      set(value);
      working = [...value];

      const newKeys = value.map(() => generateArrayKey());
      setKeys(newKeys);
      return api;
    },
    push(items) {
      const newValues = Array.isArray(items) ? items : [items];
      const oldValues = get();

      const combined = [...oldValues, ...newValues];
      working = combined;
      set(combined);

      const currentKeys = [...getKeys()];
      newValues.forEach(() => {
        currentKeys.push(generateArrayKey());
      });
      setKeys(currentKeys);

      const startIndex = oldValues.length;

      //@ts-ignore
      generateComputedKeys(path, startIndex, newValues, compute, computed);

      return api;
    },
    insert: (index, item) => {
      working.splice(index, 0, item);
      set(working);

      const currentKeys = [...getKeys()];
      currentKeys.splice(index, 0, generateArrayKey());
      setKeys(currentKeys);
      return api;
    },
    insertFirst: (item) => {
      working.unshift(item);
      set(working);

      const currentKeys = [...getKeys()];
      currentKeys.unshift(generateArrayKey());
      setKeys(currentKeys);
      return api;
    },

    updateAt: (index, item) => {
      const oldValues = get();
      working = [...oldValues];
      working[index] = item;
      set(working);

      return api;
    },

    swap: (a, b) => {
      [working[a], working[b]] = [working[b], working[a]];
      set(working);

      const currentKeys = [...getKeys()];
      [currentKeys[a], currentKeys[b]] = [currentKeys[b], currentKeys[a]];
      setKeys(currentKeys);
      return api;
    },
    move: (from, to) => {
      const [item] = working.splice(from, 1);
      working.splice(to, 0, item);
      set(working);

      const currentKeys = [...getKeys()];
      const [key] = currentKeys.splice(from, 1);
      currentKeys.splice(to, 0, key);
      setKeys(currentKeys);
      return api;
    },

    moveUp(index) {
      if (index <= 0) return api;
      return api.move(index, index - 1);
    },
    moveDown(index) {
      const arr = get();
      if (index >= arr.length - 1) return api;
      return api.move(index, index + 1);
    },

    compact() {
      const currentKeys = [...getKeys()];
      const keptIndexes: number[] = [];
      const filtered = get().filter((item, index) => {
        const keep = !!item;
        if (keep) {
          keptIndexes.push(index);
        }
        return keep;
      });
      working = filtered;
      set(filtered);

      const newKeys = keptIndexes.map((idx) => currentKeys[idx]);
      setKeys(newKeys);
      return api;
    },

    replaceWhere(fn, newItem) {
      const arr = get().map((item) => (fn(item) ? newItem : item));
      working = arr;
      set(arr);
      return api;
    },
    merge(fn) {
      const oldValues = get();
      const newValues = fn(oldValues);
      working = newValues;
      set(newValues);

      const currentKeys = [...getKeys()];
      while (currentKeys.length < newValues.length) {
        currentKeys.push(generateArrayKey());
      }
      if (currentKeys.length > newValues.length) {
        currentKeys.length = newValues.length;
      }
      setKeys(currentKeys);

      const startIndex = oldValues.length;

      //@ts-ignore
      generateComputedKeys(path, startIndex, newValues, compute, computed);

      return api;
    },
    sort(fn) {
      const arr = get();
      const currentKeys = [...getKeys()];

      const indexed = arr.map((item, idx) => ({ item, key: currentKeys[idx] }));
      indexed.sort((a, b) => fn(a.item, b.item));

      const sortedItems = indexed.map((x) => x.item);
      const sortedKeys = indexed.map((x) => x.key);

      working = sortedItems;
      set(sortedItems);
      setKeys(sortedKeys);
      return api;
    },

    remove,
    removeIf(fn) {
      const currentKeys = [...getKeys()];
      const keptIndexes: number[] = [];
      const filtered = get().filter((item, index) => {
        const keep = !fn(item, index);
        if (keep) {
          keptIndexes.push(index);
        }
        return keep;
      });
      working = filtered;
      set(filtered);

      const newKeys = keptIndexes.map((idx) => currentKeys[idx]);
      setKeys(newKeys);
      return api;
    },
    clear,

    toObject() {
      return get().reduce<Record<number, T>>((acc, item, idx) => {
        acc[idx] = item;
        return acc;
      }, {});
    },

    some: (fn) => get().some(fn),
    every: (fn) => get().every(fn),
    findIndex: (fn) => get().findIndex(fn),
    isFirst: (index) => index === 0,
    isLast: (index) => index === get().length - 1,
    first: () => get()[0],
    last: () => get()[get().length - 1],
  };

  return api;
}

function generateComputedKeys<T>(
  path: string,
  startIndex: number,
  newValues: T[],
  compute: Compute<T>,
  computed?: Compute<T>,
) {
  if (!computed) return;

  for (const key in computed) {
    if (key.startsWith(path + "*")) {
      const fieldName = key.split("*")[1];
      //@ts-ignore
      const template = computed[key];

      // compute for each new item
      newValues.forEach((_, i) => {
        const index = startIndex + i;
        const computedKey = `${path}.${index}.${fieldName}`;
        const fieldDeps = extraxtArrayPrefixies(path, index, template.deps);

        compute(
          computedKey,
          // @ts-ignore
          fieldDeps,
          (vals) => template.fn(vals, index),
        );
      });
    }
  }
}

export function handlerArrayHelpers<T>(
  path: Path<T>,
  data: T,
): HandlerArrayHelpers<T> {
  const api = {
    get: () => getDeepValue(data, path) ?? [],
    get value() {
      return getDeepValue(data, path) ?? [];
    },
    snapshot: () => structuredClone(data),
    filter: (fn: (item: T, index: number) => boolean) => {
      const arr = getDeepValue(data, path) ?? [];
      const filtered = arr.filter(fn);
      setValueByPath(data, path, filtered);
      return api;
    },
    removeIf: (fn: (item: T, index: number) => boolean) => {
      const arr = getDeepValue(data, path) ?? [];
      const filtered = arr.filter((item: T, index: number) => !fn(item, index));
      setValueByPath(data, path, filtered);
      return api;
    },
    map: (fn: (item: T, index: number) => T) => {
      const arr = getDeepValue(data, path) ?? [];
      const mapped = arr.map(fn);
      setValueByPath(data, path, mapped);
      return api;
    },
  };

  return api;
}

function removeArrayItem<T>(
  formValues: T,
  setValues: SetValues<T>,
  path: string,
  index: number | number[],
) {
  const prefix = `${path}.`;
  const flat = { ...formValues };
  const keys = Object.keys(flat || {}).filter((k) => k.startsWith(prefix));

  // Sort descending to avoid index shift issues
  keys.sort((a, b) => {
    const ai = parseInt(a.slice(prefix.length).split(".")[0], 10);
    const bi = parseInt(b.slice(prefix.length).split(".")[0], 10);
    return bi - ai;
  });

  const updated: Partial<T> = {};

  for (const key in flat) {
    if (!key.startsWith(prefix)) {
      updated[key as keyof T] = flat[key as keyof T];
    }
  }

  const indicesToRemove = new Set(Array.isArray(index) ? index : [index]);

  for (const key of keys) {
    const rest = key.slice(prefix.length);
    const [arrayIndexStr] = rest.split(".");
    const currentIndex = parseInt(arrayIndexStr, 10);

    if (Number.isNaN(currentIndex)) continue;

    if (indicesToRemove.has(currentIndex)) continue;

    let shift = 0;
    for (const idx of indicesToRemove) {
      if (currentIndex > idx) {
        shift++;
      }
    }

    const newIndex = currentIndex - shift;
    const newKey = key.replace(
      new RegExp(`^${prefix}${currentIndex}`),
      `${prefix}${newIndex}`,
    );
    updated[newKey as keyof T] = flat[key as keyof T];
  }

  const nested = nestFormValues(updated);

  // Ensure array still exists
  if (!Array.isArray(getDeepValue(nested, path))) {
    setDeepValue(nested, path, []);
  }

  setValues(nested, { overwrite: true });
}

function clearArray<T>(formValues: T, setValues: SetValues<T>, path: string) {
  const updated = nestFormValues(formValues);
  setDeepValue(updated, path, []);

  setValues({ ...updated }, { overwrite: true });
}

export function getArrayKeys(path: string, values: any) {
  const indexes = new Set<number>();

  for (const key of Object.keys(values)) {
    if (key.startsWith(path + ".")) {
      const match = key.match(new RegExp(`^${path}\\.(\\d+)\\.`));
      if (match) indexes.add(Number(match[1]));
    }
  }

  return Array.from(indexes).sort((a, b) => a - b);
}

export function extraxtArrayPrefixies(
  path: string,
  index: number,
  deps?: string[],
) {
  return (
    deps?.map((dep: string) => {
      // If dep starts with the same array path, replace its first numeric index
      const arrayPrefix = path + ".";
      if (dep.startsWith(arrayPrefix)) {
        // extract the remaining path after the first dot
        const rest = dep
          .slice(arrayPrefix.length)
          .replace(/^\d+/, index.toString());
        return `${path}.${rest}`;
      }
      return dep; // global deps stay as-is
    }) || []
  );
}

function generateArrayKey(length = 9) {
  return `key-${Math.random().toString(36).substring(2, length)}`;
}
