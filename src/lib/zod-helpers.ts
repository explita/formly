import type { z } from "zod";

export function isZodSchema(schema: unknown): schema is z.ZodObject {
  return typeof schema === "object" && schema !== null && "def" in schema;
}

export function createEmptyValues<T extends z.ZodObject<any>>(
  schema?: T
): z.infer<T> {
  if (!schema) return {} as z.infer<T>;
  const shape = schema.shape;
  const result: any = {};

  for (const key in shape) {
    const field = shape[key];
    result[key] = getEmptyValue(field);
  }

  return result;
}

function getEmptyValue(field: z.ZodTypeAny): any {
  const { type } = field.def;

  switch (type) {
    case "object":
      return createEmptyValues(field as z.ZodObject<any>);

    case "array":
      // safe recursion into array element type
      //@ts-ignore
      return [getEmptyValue(field.def.element)];

    case "boolean":
      return false;

    case "string":
    case "number":
    case "bigint":
    case "date":
      return "";

    case "optional":
    case "nullable":
      // unwrap and recurse
      //@ts-ignore
      return getEmptyValue(field.def.innerType);

    default:
      return "";
  }
}

export function mapZodErrors(
  error?: z.ZodError["issues"]
): Record<string, string> {
  if (!error) return {};

  const result: Record<string, string> = {};

  for (const issue of error) {
    const path = issue.path
      .map((p) => (typeof p === "number" ? p : p.toString()))
      .join(".");
    result[path || "_root"] = issue.message;
  }

  return result;
}

export function isZodError(issues: any): issues is z.ZodError["issues"] {
  return (
    issues &&
    typeof issues === "object" &&
    Array.isArray(issues) &&
    issues.every((i: any) => "path" in i && "message" in i)
  );
}
