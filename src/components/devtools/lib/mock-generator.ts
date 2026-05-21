/**
 * Smart Mock Data Generator for Formly DevTools.
 * Recursively traverses a form's current values object template and populates
 * it with realistic dummy data based on property keys and types.
 */

export function generateMockData(template: any, keyName = ""): any {
  if (template === null || template === undefined) {
    // If the template is empty, infer based on key name heuristics
    const normalizedKey = keyName.toLowerCase();
    if (
      normalizedKey.includes("email") ||
      normalizedKey.includes("phone") ||
      normalizedKey.includes("tel") ||
      normalizedKey.includes("mobile") ||
      normalizedKey.includes("name") ||
      normalizedKey.includes("address") ||
      normalizedKey.includes("street") ||
      normalizedKey.includes("city") ||
      normalizedKey.includes("zip") ||
      normalizedKey.includes("postal") ||
      normalizedKey.includes("password") ||
      normalizedKey.includes("url") ||
      normalizedKey.includes("website") ||
      normalizedKey.includes("company") ||
      normalizedKey.includes("desc") ||
      normalizedKey.includes("bio") ||
      normalizedKey.includes("about") ||
      normalizedKey.includes("notes") ||
      normalizedKey.includes("comment")
    ) {
      return getMockString(keyName);
    }
    if (
      normalizedKey.includes("age") ||
      normalizedKey.includes("price") ||
      normalizedKey.includes("amount") ||
      normalizedKey.includes("cost") ||
      normalizedKey.includes("qty") ||
      normalizedKey.includes("quantity") ||
      normalizedKey.includes("count")
    ) {
      return getMockNumber(keyName);
    }
    return "";
  }

  // Handle Array
  if (Array.isArray(template)) {
    if (template.length > 0) {
      return template.map((item, index) =>
        generateMockData(item, `${keyName}[${index}]`),
      );
    }
    // If empty array, default to generating one mock element if we can infer its shape
    return [];
  }

  // Handle plain object
  if (typeof template === "object" && !(template instanceof Date)) {
    const result: Record<string, any> = {};
    for (const key of Object.keys(template)) {
      result[key] = generateMockData(template[key], key);
    }
    return result;
  }

  // Handle String
  if (typeof template === "string") {
    return getMockString(keyName);
  }

  // Handle Number
  if (typeof template === "number") {
    return getMockNumber(keyName);
  }

  // Handle Boolean
  if (typeof template === "boolean") {
    // Alternate or default to true
    return true;
  }

  // Handle Date
  if (template instanceof Date) {
    return new Date();
  }

  // Fallback to template
  return template;
}

function getMockString(key: string): string {
  const normalized = key.toLowerCase();
  if (normalized.includes("email")) {
    return "test.developer@example.com";
  }
  if (
    normalized.includes("phone") ||
    normalized.includes("tel") ||
    normalized.includes("mobile")
  ) {
    return "+1 (555) 019-2834";
  }
  if (normalized.includes("firstname")) {
    return "Jane";
  }
  if (normalized.includes("lastname")) {
    return "Doe";
  }
  if (normalized.includes("name")) {
    return "Jane Doe";
  }
  if (normalized.includes("address") || normalized.includes("street")) {
    return "123 Main Street";
  }
  if (normalized.includes("city")) {
    return "San Francisco";
  }
  if (normalized.includes("state")) {
    return "CA";
  }
  if (normalized.includes("zip") || normalized.includes("postal")) {
    return "94105";
  }
  if (normalized.includes("country")) {
    return "United States";
  }
  if (normalized.includes("password")) {
    return "P@ssword123!";
  }
  if (normalized.includes("url") || normalized.includes("website")) {
    return "https://github.com/explita/formly";
  }
  if (normalized.includes("company")) {
    return "Explita Labs";
  }
  if (
    normalized.includes("desc") ||
    normalized.includes("description") ||
    normalized.includes("bio") ||
    normalized.includes("biography") ||
    normalized.includes("about") ||
    normalized.includes("notes") ||
    normalized.includes("comment")
  ) {
    return "This is an auto-generated development testing entry.";
  }
  return `Test ${key || "Value"}`;
}

function getMockNumber(key: string): number {
  const normalized = key.toLowerCase();
  if (normalized.includes("age")) {
    return 28;
  }
  if (normalized.includes("zip") || normalized.includes("postal")) {
    return 94105;
  }
  if (
    normalized.includes("price") ||
    normalized.includes("amount") ||
    normalized.includes("cost")
  ) {
    return 49.99;
  }
  if (
    normalized.includes("qty") ||
    normalized.includes("quantity") ||
    normalized.includes("count")
  ) {
    return 3;
  }
  return 100;
}
