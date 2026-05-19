export function createMetaContext(
  metaRef: React.RefObject<Map<string, unknown>>,
  triggerRerender: () => void,
) {
  return {
    get<T = unknown>(key: string): T | undefined {
      return metaRef.current.get(key) as T | undefined;
    },
    set(key: string, value: unknown, opts?: { silent?: boolean }) {
      metaRef.current.set(key, value);
      if (!opts?.silent) setTimeout(triggerRerender, 10);
    },
    delete(key: string) {
      metaRef.current.delete(key);
      setTimeout(triggerRerender, 10);
    },
    has(key: string) {
      return metaRef.current.has(key);
    },
    keys() {
      return metaRef.current.keys();
    },
    values() {
      return metaRef.current.values();
    },
    clear() {
      metaRef.current.clear();
      setTimeout(triggerRerender, 10);
    },
  };
}
