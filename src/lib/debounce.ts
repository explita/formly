/**
 * Creates a debounced function that delays invoking the provided function until
 * after `delay` milliseconds have passed since the last time the debounced
 * function was called. The debounced function returns a function that can be
 * used to cancel the pending call to the underlying function.
 *
 * @param fn The function to debounce.
 * @param delay The number of milliseconds to delay calling the function.
 * @returns A debounced function with an extra `cancel` method to cancel the pending call.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timeout: ReturnType<typeof setTimeout> | null;

  function debounced(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as T & { cancel: () => void };
}
