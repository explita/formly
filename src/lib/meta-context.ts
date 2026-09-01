export function createMetaContext(
  metaRef: React.RefObject<Map<string, unknown>>,
  notifyChange: () => void,
) {
  return {
    get<T = unknown>(key: string): T | undefined {
      return metaRef.current?.get(key) as T | undefined;
    },
    set(key: string, value: unknown, opts?: { silent?: boolean }) {
      metaRef.current?.set(key, value);
      if (!opts?.silent) {
        notifyChange();
      }
    },
    delete(key: string) {
      metaRef.current?.delete(key);
      notifyChange();
    },
    has(key: string): boolean {
      return Boolean(metaRef.current?.has(key));
    },
    keys(): string[] {
      return Array.from(metaRef.current?.keys() ?? []);
    },
    values<T = unknown>(): T[] {
      return Array.from(metaRef.current?.values() ?? []) as T[];
    },
    clear() {
      metaRef.current?.clear();
      notifyChange();
    },
    entries(): Record<string, unknown> {
      return metaRef.current
        ? Object.fromEntries(metaRef.current.entries())
        : {};
    },
    raw(): Map<string, unknown> | null {
      return metaRef.current;
    },
  };
}
