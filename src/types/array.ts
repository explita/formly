import { Path } from "./path";
import { Compute, Computed, SetValues } from "./utils";

export type ArrayItem<
  T,
  P extends string
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? T[Key] extends Record<string, any>
      ? ArrayItem<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P] extends Array<infer U>
    ? U
    : never
  : never;

export type ArrayHelpers<T> = {
  /**
   * Returns the array of values for the specified path.
   * @returns The array of values for the specified path.
   */
  get: () => T[];
  /**
   * Returns the array of values for the specified path.
   * @returns The array of values for the specified path.
   */
  value: T[];
  toObject: () => Record<number, T>;
  /**
   * Returns the length of the array for the specified path.
   * @returns The length of the array for the specified path.
   */
  length: number;
  /**
   * Sets the array of values for the specified path.
   * @param arr The array of values to set for the specified path.
   */
  //   set: (arr: ArrayItem<T, P>[]) => void;
  /**
   * Updates the item at the specified index.
   * @param index The index of the item to update.
   * @param item The new value for the item.
   */
  updateAt: (index: number, item: T) => ArrayHelpers<T>;
  /**
   * Replaces all items in the array for the specified path with the new array.
   * @param newArray The new array of values to set for the specified path.
   */
  replaceAll: (newArray: T[]) => ArrayHelpers<T>;
  /**
   * Replaces the first item in the array that satisfies the provided testing function.
   * @param fn The testing function to apply to each item in the array.
   * @param newItem The new value for the item.
   */
  replaceWhere: (fn: (item: T) => boolean, newItem: T) => ArrayHelpers<T>;
  /**
   * Adds a new value to the array at the end.
   * @param value The value to add to the array.
   */
  push: (value: T | T[]) => ArrayHelpers<T>;
  /**
   * Inserts a new value at the specified index.
   * @param index The index at which to insert the value.
   * @param value The value to insert into the array.
   */
  insert: (index: number, value: T) => ArrayHelpers<T>;
  /**
   * Inserts a new value at the begining of the array.
   * @param value The value to insert into the array.
   */
  insertFirst: (value: T) => ArrayHelpers<T>;
  /**
   * Moves an item from one index to another.
   * @param from The index of the item to move.
   * @param to The index to move the item to.
   */
  move: (from: number, to: number) => ArrayHelpers<T>;
  /**
   * Moves an item up by one index.
   * @param index The index of the item to move up.
   */
  moveUp: (index: number) => ArrayHelpers<T>;
  /**
   * Moves an item down by one index.
   * @param index The index of the item to move down.
   */
  moveDown: (index: number) => ArrayHelpers<T>;
  /**
   * Swaps the items at the specified indices.
   * @param a The index of the first item to swap.
   * @param b The index of the second item to swap.
   */
  swap: (a: number, b: number) => ArrayHelpers<T>;
  /**
   * Merges the array with the new array.
   * @param fn The callback function to apply to each item in the array.
   */
  merge: (fn: (old: T[]) => T[]) => ArrayHelpers<T>;
  /**
   * Removes all falsey values from the array.
   */
  compact: () => ArrayHelpers<T>;
  /**
   * Sorts the array.
   * @param fn The callback function to apply to each item in the array.
   */
  sort: (fn: (a: T, b: T) => number) => ArrayHelpers<T>;
  /**
   * Removes the item at the specified index from the array for the specified path and updates the form values.
   * @param index The index of the item to remove.
   */
  remove: (index: number) => void;
  /**
   * Removes all items from the array for the specified path and updates the form values.
   */
  removeIf: (fn: (item: T, index: number) => boolean) => ArrayHelpers<T>;
  /**
   * Removes all items from the array for the specified path and updates the form values.
   */
  clear: () => void;
  /**
   * Maps the array for the specified path and updates the form values.
   * @param fn The callback function to apply to each item in the array.
   */
  map: (fn: (item: T, index: number) => T) => ArrayHelpers<T>;
  /**
   * Filters the array for the specified path and updates the form values.
   * @param fn The testing function to apply to each item in the array.
   */
  filter: (fn: (item: T, index: number) => boolean) => ArrayHelpers<T>;
  /**
   * Finds the index of the first item in the array for the specified path that satisfies the provided testing function.
   * @param fn The testing function to apply to each item in the array.
   * @returns The index of the first item in the array for the specified path that satisfies the provided testing function, or -1 if no such item is found.
   */
  findIndex: (fn: (item: T) => boolean) => number;
  /**
   * Checks if the item at the specified index is the first item in the array.
   * @param index The index of the item to check.
   * @returns True if the item is the first item in the array, false otherwise.
   */
  isFirst: (index: number) => boolean;
  /**
   * Checks if the item at the specified index is the last item in the array.
   * @param index The index of the item to check.
   * @returns True if the item is the last item in the array, false otherwise.
   */
  isLast: (index: number) => boolean;
  /**
   * Returns the first item in the array for the specified path.
   * @returns The first item in the array for the specified path.
   */
  first: () => T;
  /**
   * Returns the last item in the array for the specified path.
   * @returns The last item in the array for the specified path.
   */
  last: () => T;

  /**
   * Checks if the array for the specified path contains at least one item that satisfies the provided testing function.
   * @param fn The testing function to apply to each item in the array.
   * @returns True if the array for the specified path contains at least one item that satisfies the provided testing function, false otherwise.
   */
  some: (fn: (item: T, index: number) => boolean) => boolean;
  /**
   * Checks if all items in the array for the specified path satisfy the provided testing function.
   * @param fn The testing function to apply to each item in the array.
   * @returns True if all items in the array for the specified path satisfy the provided testing function, false otherwise.
   */
  every: (fn: (item: T, index: number) => boolean) => boolean;

  /**
   * Commits the changes to the array for the specified path.
   */
  // done: () => void;
};

export type ArrayHelperProps<T> = {
  path: Path<T>;
  formValues: T;
  setValues: SetValues<T>;
  computed?: Computed<T>;
  compute: Compute<T>;
  getCurrentArrayValue: () => T[];
};

export type HandlerArrayHelpers<T> = {
  /**
   * Returns the modified form object.
   * @returns Returns the modified form object.
   */
  snapshot: () => T;
  /**
   * Returns the array of values for the specified path.
   * @returns The array of values for the specified path.
   */
  get: () => T[];
  /**
   * Returns the array of values for the specified path.
   * @returns The array of values for the specified path.
   */
  value: T[];
  /**
   * Filters the array for the specified path and updates the form values.
   * @param fn The testing function to apply to each item in the array.
   */
  filter: (fn: (item: T) => boolean) => HandlerArrayHelpers<T>;
  /**
   * Removes all items from the array for the specified path and updates the form values.
   * @param fn The testing function to apply to each item in the array.
   */
  removeIf: (fn: (item: T) => boolean) => HandlerArrayHelpers<T>;
  /**
   * Maps the array for the specified path and updates the form values.
   * @param fn The callback function to apply to each item in the array.
   */
  map: (fn: (item: T, index: number) => T) => HandlerArrayHelpers<T>;
};
