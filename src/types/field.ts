export type FieldHelpers<T> = {
  /**
   * Retrieves the value of the form field.
   *
   * @returns The value of the form field.
   */
  get: () => T;
  /**
   * Sets the value of the form field.
   *
   * @param value - The value to set for the form field.
   */
  set: (value: T) => void;
  /**
   * Transforms the value of the form field using the provided function.
   *
   * @param fn - The function to transform the value of the form field.
   */
  transform(fn: (val: T) => unknown): void;
  /**
   * Validates a specific form field value using the provided schema. If validation fails,
   * the error is parsed and set in the form errors. The function is debounced to prevent
   * excessive validation calls.
   *
   * @param name - The name of the form field to validate.
   * @param inputValue - The value of the form field to be validated.
   */
  validate: () => void;
  /**
   * Focuses the form field.
   */
  focus: () => void;
  /**
   * Resets the form field to its default value.
   */
  reset: () => void;
  /**
   * Retrieves the error of the form field.
   *
   * @returns The error of the form field.
   */
  error: string;
  /**
   * Indicates whether the form field has an error.
   *
   * @returns `true` if the form field has an error, `false` otherwise.
   */
  hasError: boolean;
  /**
   * Indicates whether the form field has been touched.
   *
   * @returns `true` if the form field has been touched, `false` otherwise.
   */
  isTouched: boolean;
  /**
   * Indicates whether the form field has been modified.
   *
   * @returns `true` if the form field has been modified, `false` otherwise.
   */
  isDirty: boolean;
};
