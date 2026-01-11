import { nestFormValues } from "./utils";

export function getValueByPath<T extends any>(obj: T, path: string) {
  return (
    path
      ?.split(/[\.\[\]]+/)
      .filter(Boolean)
      //@ts-ignore
      .reduce((acc, key) => (acc ? acc[key] : undefined), obj)
  );
}

export function setValueByPath<T extends any>(
  obj: T,
  path: string,
  value: any
) {
  const keys = path.split(/[\.\[\]]+/).filter(Boolean);
  let current = obj;
  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      //@ts-ignore
      current[key] = value;
    } else {
      //@ts-ignore
      current[key] = current[key] ?? {};
      //@ts-ignore
      current = current[key];
    }
  });
}

export function getDeepValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let current = nestFormValues(obj);

  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }

  return current;
}

export function setDeepValue(obj: any, path: string, value: any): void {
  if (!obj || !path) return;
  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;

    if (isLast) {
      current[part] = value;
    } else {
      if (current[part] == null || typeof current[part] !== "object") {
        // Determine if the next part looks like an array index
        const nextIsIndex = /^\d+$/.test(parts[i + 1]);
        current[part] = nextIsIndex ? [] : {};
      }
      current = current[part];
    }
  }
}
