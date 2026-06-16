---
sidebar_position: 2
title: useForm Hook & API
---

# useForm Hook & Instance API

The `useForm` hook is the core controller of Formly. It manages the form state values, handles validations, computes fields reactively, coordinates wizards, and interfaces with storage.

---

## hook: `useForm` Options

When initializing a form, you can configure it by passing the following options:

| Option             | Type                                                       | Default           | Description                                                                             |
| :----------------- | :--------------------------------------------------------- | :---------------- | :-------------------------------------------------------------------------------------- |
| `defaultValues`    | `object`                                                   | `{}`              | Initial default values of the form fields.                                              |
| `errors`           | `object`                                                   | `undefined`       | Initial validation errors of the form fields.                                           |
| `schema`           | `z.ZodObject`                                              | `undefined`       | A Zod object schema used for automatic runtime input validation.                        |
| `errorParser`      | `(message: string) => string`                              | `undefined`       | Custom parsing/formatting function for validation error messages.                       |
| `check`            | `(values: T) => Record<string, string>`                    | `undefined`       | Custom synchronous validation callback returning field-to-error mapping.                |
| `computed`         | `Record<string, ComputedConfig>`                           | `undefined`       | Defines derived fields computed reactively from dependency paths.                       |
| `onSubmit`         | `(values: T, ctx: SubmitContext) => void \| Promise<void>` | `undefined`       | Callback invoked upon successful schema/check validation.                               |
| `onReady`          | `(values: T, ctx: FormInstance) => void`                   | `undefined`       | Lifecycle callback triggered when form mount/initialization finishes.                   |
| `mode`             | `'controlled' \| 'uncontrolled'`                           | `'controlled'`    | Renders inputs as React state-controlled or ref-based uncontrolled.                     |
| `validateOn`       | `'change' \| 'submit' \| 'change-submit' \| 'blur'`        | `'change-submit'` | Event hook that triggers validation routines.                                           |
| `id`               | `string`                                                   | `undefined`       | Unique identifier to bind this form to the global registry.                             |
| `persistKey`       | `string`                                                   | `undefined`       | Storage key to backup/restore form drafts (falls back to `id`).                         |
| `autoFocusOnError` | `boolean`                                                  | `true`            | Programmatically shifts focus to the first invalid input element on submission failure. |
| `savedFormFirst`   | `boolean`                                                  | `true`            | Prioritizes local storage draft restoration over `defaultValues`.                       |
| `preventUnload`    | `boolean`                                                  | `false`           | Blocks page refreshes, tab closures, and navigation when the form is dirty.             |
| `normalize`        | `Record<string, (value: any, prev: any) => any>`           | `undefined`       | Input normalizers that sanitize values in real-time as users type.                      |
| `asyncValidate`    | `Record<string, AsyncValidatorConfig>`                     | `undefined`       | Debounced async validators (e.g., database checks).                                     |
| `cascade`          | `Record<string, CascadeConfig>`                            | `undefined`       | Cascading select dynamic option loaders.                                                |
| `steps`            | `string[][]`                                               | `undefined`       | Array of path groups representing pages in a wizard form.                               |

---

## Form Instance API Reference

The object returned by `useForm` exposes getters, methods, and components to interact with the form programmatically:

### Getters & Properties

| Member             | Type                           | Description                                                                   |
| :----------------- | :----------------------------- | :---------------------------------------------------------------------------- |
| `values`           | `T`                            | Getter returning the current nested state values of all form fields.          |
| `errors`           | `Record<string, string>`       | Getter returning active validation errors.                                    |
| `submitting`       | `boolean`                      | Flag indicating if the form is currently executing the `onSubmit` callback.   |
| `validated`        | `boolean`                      | Flag indicating whether the validation engine has run at least once.          |
| `isValidating`     | `boolean`                      | Flag indicating if any async validation is actively running.                  |
| `validatingFields` | `Record<string, boolean>`      | Mapping showing which specific fields are actively running async validations. |
| `cascade`          | `Record<string, CascadeState>` | Option sets, loading states, and errors for cascading select inputs.          |
| `channel`          | `EventBus`                     | The internal high-performance pub-sub event bus channel.                      |
| `meta`             | `Record<string, any>`          | Form metadata store for attaching custom context variables.                   |
| `steps`            | `WizardController`             | Controller managing multi-step wizard state (current, next, prev, total).     |
| `busy`             | `boolean`                      | Flag indicating if the form is busy (submitting or validating).               |

### Methods

| Method                        | Signature                                                                | Description                                                                                   |
| :---------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `getValues()`                 | `() => T`                                                                | Returns the entire current form values object.                                                |
| `getValue(path)`              | `(path: string) => any`                                                  | Retrieves a single field value by path (e.g., `getValue("user.email")`).                      |
| `setValue(path, value)`       | `(path: string, value: any) => void`                                     | Sets a single field value by path.                                                            |
| `setValues(values)`           | `(values: Partial<T>) => void`                                           | Merges a partial or complete set of values into the form state.                               |
| `getErrors()`                 | `() => Record<string, string>`                                           | Returns all active validation errors.                                                         |
| `getError(path)`              | `(path: string) => string \| undefined`                                  | Retrieves the active validation error string for a specific field path.                       |
| `setErrors(errors)`           | `(errors: Record<string, string>) => void`                               | Sets multiple validation errors manually.                                                     |
| `validate()`                  | `() => Promise<boolean>`                                                 | Triggers a full form validation cycle manually.                                               |
| `validatePartial(values)`     | `(values: Partial<T>) => Promise<boolean>`                               | Validates a partial set of values against the schema.                                         |
| `reset(opts?)`                | `(opts?: { ignoreDefaults?: boolean }) => void`                          | Resets the form back to its initial default values (or clears values if `ignoreDefaults: true`) and clears errors. |
| `handleSubmit(onValid)`       | `(onValid: (values: T, ctx: HandlerContext<T>, raw: FormData) => void) => FormEventHandler` | Wraps form submit events, running schema validation before execution.                         |
| `field(path)`                 | `(path: string) => FieldController`                                      | Returns helper methods (`get`, `set`, `validate`, `reset`) for a single field.                |
| `array(path)`                 | `(path: string) => ArrayController`                                      | Returns array helpers (`push`, `pop`, `remove`, `move`, `update`) for lists.                  |
| `group(path)`                 | `(path: string) => GroupController`                                      | Returns nested form group validation and update helpers.                                      |
| `isDirty(path?)`              | `(path?: string) => boolean`                                             | Checks if a specific path or the entire form has been modified compared to defaults.          |
| `isTouched(path?)`            | `(path?: string) => boolean`                                             | Checks if a specific path or the entire form has been focused/touched.                        |
| `markDirty(path, dirty?)`     | `(path: string, dirty?: boolean) => void`                                | Programmatically marks a specific field path as dirty.                                        |
| `markTouched(path, touched?)` | `(path: string, touched?: boolean) => void`                              | Programmatically marks a specific field path as touched (defaults to true).                   |
| `focus(path)`                 | `(path: string) => void`                                                 | Programmatically focuses the input element bound to the path.                                 |
| `compute(name, deps, fn)`     | `(name: string, deps: any[], fn: (vals: T) => any) => void`              | Dynamically registers a computed field after initialization.                                  |
| `watch(path)`                 | `(path: string) => any`                                                  | Subscribes to a field path, forcing React to re-render the calling component when it changes. |
| `subscribe(path, callback)`   | `(path: string, cb: (val: any) => void) => () => void`                   | Subscribes to field changes without triggering full component re-renders.                     |
| `transform(path, fn)`         | `(path: string, fn: (val: any) => any) => void`                          | Registers a dynamic transformer function for a field path.                                    |
| `debug()`                     | `() => FormDebugInfo`                                                    | Returns a comprehensive state dump for debugging purposes.                                    |

### Component Binding

| Member  | Type                  | Description                                                                                                                    |
| :------ | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `Field` | `React.ComponentType` | A pre-bound `<Field />` component specifically for this form instance, eliminating the need to pass `form` context explicitly. |

---

## Form Submission & Handler Context (`ctx`)

The `onSubmit` callback registered inside `useForm` (or passed to `handleSubmit`) receives three arguments:

```typescript
onSubmit: (values: T, ctx: HandlerContext<T>, raw: FormData) => void | Promise<void>;
```

1. **`values`**: The fully validated, type-safe nested form values.
2. **`ctx`**: The Formly **Handler Context**, which exposes utility methods to manipulate the form state during/after submission.
3. **`raw`**: The browser's native `FormData` object generated from the form submission.

### The Power of `ctx`

The `ctx` object enables seamless interaction with the form lifecycle, such as handling server-side API responses, focus management, and status metadata tracking:

* **Retrieve Partial Updates (`ctx.getChanges()`)**: Compare current values to initial default values and return a delta object of modified fields. Perfect for lightweight `PATCH` updates.
* **Server-Side Error Handling (`ctx.setErrors()`)**: Directly map backend validation errors back to Formly's field errors.
* **Smart Focus Relocation (`ctx.focus()`)**: Automatically move document focus to a specific input field (e.g., if the backend rejects that specific field).
* **Reset on Success (`ctx.reset()`)**: Reset the form values, touched, and dirty state back to default values.
* **Metadata Communication (`ctx.meta`)**: Read/write status keys (e.g., setting a submission flag like `submitted` to render successful completion pages).

### Comprehensive Submission Example

Here is a demonstration of using `ctx` to handle a simulated server submission, including backend error handling and dynamic layout changes:

```tsx
import React from "react";
import { Form, Field, useForm } from "@explita/formly";

function RegistrationForm() {
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
    },
    onSubmit: async (values, ctx, raw) => {
      // 1. Get only changed fields (PATCH payload)
      const patchData = ctx.getChanges();
      
      // Note: Alternatively, you can upload the browser's native raw FormData directly (e.g. for multi-part file uploads):
      // const response = await fetch("/api/update-profile", { method: "POST", body: raw });
      
      try {
        const response = await fetch("/api/update-profile", {
          method: "PATCH",
          body: JSON.stringify(patchData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          if (result.errors) {
            // 2. Set backend errors on specific fields
            ctx.setErrors(result.errors);
            
            // 3. Focus the first field that has an error
            const firstErrorField = Object.keys(result.errors)[0];
            ctx.focus(firstErrorField as any);
          }
          return;
        }

        // 4. Update meta state to render success message/card
        ctx.meta.set("submitSuccess", true);
        
        // 5. Reset the form back to clean state
        ctx.reset();

      } catch (error) {
        console.error("Submission failed:", error);
      }
    },
  });

  const isSuccess = form.meta.get("submitSuccess");

  if (isSuccess) {
    return (
      <div>
        <h3>Profile Updated Successfully!</h3>
        <button onClick={() => form.meta.delete("submitSuccess")}>
          Edit Profile Again
        </button>
      </div>
    );
  }

  return (
    <Form use={form}>
      <Field
        name="username"
        label="Username"
        render={(props) => <input {...props} />}
      />
      <Field
        name="email"
        label="Email Address"
        render={(props) => <input {...props} type="email" />}
      />
      <button type="submit">Save Changes</button>
    </Form>
  );
}
```
