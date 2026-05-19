# @explita/formly

<p align="left">
  <a href="https://bundlephobia.com/package/@explita/formly">
    <img src="https://img.shields.io/bundlephobia/minzip/@explita/formly" alt="Bundle Size" />
  </a>
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/react-19.0+-blue.svg" alt="React Version" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript" />
  </a>
</p>

A lightweight, type-safe form toolkit for React built with developer ergonomics in mind. Provides a flexible form management solution with built-in validation, array manipulation, and nested form support.

👉 **Explore the Live Demos & Playgrounds:** [formly.explita.ng](https://formly.explita.ng)

#

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [useForm Hook](#useform-hook)
  - [Field Component](#field-component)
  - [useField Hook](#usefield-hook)
  - [When to Use Field vs useField](#when-to-use-field-vs-usefield)
  - [Array Fields](#array-fields)
- [Advanced Usage](#advanced-usage)
  - [Conditional Fields](#conditional-fields)
- [API Reference](#api-reference)
  - [useForm Options](#useform-options)
  - [Form Instance Properties and Methods](#form-instance-properties-and-methods)
- [⚡ Advanced Features](#-advanced-features)
  - [1. Pre-bound Field Component](#1-pre-bound-field-component)
  - [2. Dynamic Computed Fields](#2-dynamic-computed-fields)
  - [3. Native Multi-Step / Wizard Forms](#3-native-multi-step--wizard-forms)
  - [4. High-Performance Subscriptions](#4-high-performance-subscriptions)
  - [5. Zero-Config Draft Persistence](#5-zero-config-draft-persistence)
  - [6. Accidental Navigation / Page Unload Prevention](#6-accidental-navigation--page-unload-prevention)
  - [7. Zero-Setup Interactive Form DevTools Inspector](#7-zero-setup-interactive-form-devtools-inspector)
- [🌟 Enterprise-Grade Capabilities](#-enterprise-grade-capabilities)
  - [1. Debounced Async Validation (Race-Condition Safe)](#1-debounced-async-validation-race-condition-safe)
  - [2. Patch Payload Diffing (getChanges)](#2-patch-payload-diffing-getchanges)
  - [3. Declarative Input Normalization & Auto-Formatters](#3-declarative-input-normalization--auto-formatters)
  - [4. Cascading Dropdowns & Dynamic Options Binding](#4-cascading-dropdowns--dynamic-options-binding)
  - [5. Auto-Keyed Dynamic Arrays](#5-auto-keyed-dynamic-arrays)
- [TypeScript Support](#typescript-support)

#

## Features

- 🚀 **100% Type-Safe** with flawless, automatic TypeScript type inference
- 🧩 **Composable & Declarative** form components (`<Form />`, `<Field />`, `<FormSpy />`) and hooks (`useForm`, `useField`)
- 🔄 **High-Performance Pub-Sub Architecture** with targeted, micro-render state updates (no full-form re-renders)
- ✅ **First-Class Zod Validation** for schema-driven, type-safe runtime validations
- 📋 **Auto-Keyed Dynamic Arrays** with persistent unique keys for perfect React reconciliation and smooth transition animations
- 🎯 **Native Multi-Step / Wizard Forms** built-in with step-by-step layout tracking and step-level validation
- 🧮 **Dynamic Computed Fields** that derive values reactively from form dependencies or external React state
- ⏱️ **Debounced Async Validation** built-in and version-controlled to eliminate network race conditions
- 📊 **Precise Delta Tracking (`getChanges`)** to extract only user-modified patches for lightweight API updates
- 🧹 **Declarative Input Normalization** to sanitize and auto-format input values in real-time as users type
- 🎯 **Cascading Dropdowns** that reactively fetch and option-bind dependencies with automatic type inference
- 💾 **Zero-Config Draft Persistence** to auto-save and restore form states across page reloads and tab closures

#

## Installation

```bash
npm install @explita/formly
# or
yarn add @explita/formly
# or
pnpm add @explita/formly
```

#

## Quick Start

```tsx
import { Form, Field, useForm, useField } from "@explita/formly";
import { z } from "zod";

// Define your form schema with Zod
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  contacts: z
    .array(
      z.object({
        phone: z.string().min(1, "Phone is required"),
        type: z.enum(["home", "work", "mobile"]),
      }),
    )
    .min(1, "At least one contact is required"),
});

function UserForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      contacts: [{ phone: "", type: "mobile" }],
    },
    // Optional: Uncomment to enable Zod validation
    // schema: userSchema,
    onSubmit: (data) => {
      console.log("Form submitted:", data);
    },
  });

  const contacts = form.array("contacts");

  return (
    <Form use={form}>
      <Field
        name="name"
        label="Full Name"
        render={(props) => <input {...props} />}
      />
      <Field
        name="email"
        label="Email"
        render={(props) => <input {...props} type="email" />}
      />

      {/* Dynamic array fields */}
      {contacts.value.map((contact, index) => (
        <div key={index}>
          <Field
            name={`contacts.${index}.phone`}
            label={`Phone ${index + 1}`}
            render={(props) => <input {...props} />}
          />
          <Field
            name={`contacts.${index}.type`}
            as="select"
            label="Type"
            render={(props) => (
              <select {...props}>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="mobile">Mobile</option>
              </select>
            )}
          />
          <button type="button" onClick={() => contacts.remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => contacts.push({ phone: "", type: "mobile" })}
      >
        Add Contact
      </button>

      <button type="submit">Submit</button>
    </Form>
  );
}
```

#

## Core Concepts

### `useForm` Hook

The `useForm` hook is the heart of Formly. It manages the form state and provides methods to interact with the form.

```tsx
const form = useForm({
  defaultValues: {
    username: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    quantity: 1,
    price: 10,
  },
  // 1. Zod schema for automatic validation
  schema: userSchema,
  // 2. Custom synchronous validation rules
  check: (values) => {
    const errors: Record<string, string> = {};
    if (values.username === "admin") {
      errors.username = "Username 'admin' is reserved";
    }
    return errors;
  },
  // 3. Declarative input normalization (formats/sanitizes values in real-time)
  normalize: {
    phone: (value) => value.replace(/\D/g, "").slice(0, 10), // Only digits, max 10
  },
  // 4. Dynamic computed fields (derived reactively on dependency changes)
  computed: {
    total: {
      deps: ["quantity", "price"],
      fn: (values) => values.quantity * values.price,
    },
  },
  // 5. Debounced, race-condition-safe async validation (e.g. database checks)
  asyncValidate: {
    email: {
      validate: async (value) => {
        const isTaken = await api.checkEmailTaken(value);
        return isTaken ? "This email is already registered" : undefined;
      },
    },
  },
  // 6. Cascading fields (fetches dynamic dropdown options automatically)
  cascade: {
    cities: {
      watch: ["country"],
      fn: async ([country]) => {
        if (!country) return [];
        return await api.getCitiesForCountry(country);
      },
    },
  },
  // 7. Zero-config draft state auto-save and restore
  persistKey: "user-profile-draft",
  // 8. Submit callback
  onSubmit: async (values, ctx) => {
    console.log("Successfully validated form values:", values);
    console.log("Precise changes made by the user:", ctx.getChanges());
  },
  errorParser: (message) => {
    // Transform "String must contain at least 1 character(s)"
    // to "This field is required"
    if (message.includes("at least 1 character")) {
      return "This field is required";
    }
    return message.charAt(0).toUpperCase() + message.slice(1);
  },
});
```

#

### `Field` Component

Render form inputs with automatic state management and validation.

```tsx
<Field
  name="email"
  label="Email Address"
  placeholder="Enter your email"
  required
  render={(props, ctx) => <input {...props} type="email" />}
/>
```

#

### `useField` Hook

Access and modify a specific field's state and helpers.

```tsx
function EmailField() {
  const { value, setValue, error, touched } = useField("email");

  return (
    <div>
      <input
        type="email"
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        className={touched && error ? "error" : ""}
      />
      {touched && error && <div className="error-message">{error}</div>}
    </div>
  );
}
```

#### `useField` Return Value Properties

| Property   | Type                     | Description                                                                               |
| ---------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| `value`    | `T`                      | The current real-time state value of the field.                                           |
| `setValue` | `(value: T) => void`     | Safe imperative state updater method for this field.                                      |
| `error`    | `string \| undefined`    | The current validation error message (if any).                                            |
| `hasError` | `boolean`                | Boolean flag checking whether this field has any active validation error.                 |
| `touched`  | `boolean`                | Flag checking whether this input field has been blurred/touched by the user.              |
| `dirty`    | `boolean`                | Flag checking whether this input value has been modified compared to the initial default. |
| `reset`    | `() => void`             | Reverts this field value, dirty state, and touched state to its initial defaults.         |
| `validate` | `() => Promise<boolean>` | Manually triggers the validation engine specifically for this field element.              |
| `focus`    | `() => void`             | Imperatively shifts target document focus back to this field's registered input element.  |
| `bind`     | `() => object`           | Pre-bound input parameters (`name`, `value`, `onChange`, `onBlur`, accessibility props).  |
| `refId`    | `string`                 | Stable, unique DOM reference string associated with the registered field channel.         |

#

### When to Use `Field` vs `useField`

| Use Case                              | Recommendation                                       |
| ------------------------------------- | ---------------------------------------------------- |
| Simple input with standard DOM events | `<Field render={(props) => <input {...props} />} />` |
| Custom component with complex logic   | `useField()`                                         |
| Performance-critical path             | `useField()` with memo                               |
| Quick prototyping                     | `<Field render={(props) => <input {...props} />} />` |

#

### Array Fields

Easily manage dynamic arrays of fields.

```tsx
const todos = form.array("todos");

// Add item
todos.push({ text: "", completed: false });

// Update item
todos.update(0, { text: "Updated todo", completed: true });

// Remove item
todos.remove(0);

// Move item
todos.move(0, 1);
```

#

## Advanced Usage

### Conditional Fields

```tsx
const showAddress = form.watch("hasAddress");

return (
  <>
    <Field name="hasAddress" type="checkbox" label="Add address?" />

    {showAddress && (
      <div className="address-fields">
        <Field name="address.street" label="Street" />
        <Field name="address.city" label="City" />
        <Field name="address.zip" label="ZIP Code" />
      </div>
    )}
  </>
);
```

#

## API Reference

### `useForm` Options

| Option             | Type                                                | Default           | Description                                                                     |
| :----------------- | :-------------------------------------------------- | :---------------- | :------------------------------------------------------------------------------ |
| `defaultValues`    | `object`                                            | `{}`              | Initial default values of the form fields.                                      |
| `errors`           | `object`                                            | `undefined`       | Initial validation errors of the form fields.                                   |
| `schema`           | `z.ZodObject`                                       | `undefined`       | A Zod object schema used for automatic runtime input validation.                |
| `errorParser`      | `(message: string) => string`                       | `undefined`       | Custom parsing of validation error messages.                                    |
| `check`            | `(values) => object`                                | `undefined`       | Custom validation function returning field-to-error mapping.                    |
| `computed`         | `Record<string, ComputedField>`                     | `undefined`       | Defines properties derived dynamically from other form fields.                  |
| `onSubmit`         | `(values, ctx) => void`                             | `undefined`       | Callback invoked upon successful submission validation.                         |
| `onReady`          | `(values, ctx) => void`                             | `undefined`       | Lifecycle callback triggered when form mount/initialization finishes.           |
| `mode`             | `'controlled' \| 'uncontrolled'`                    | `'controlled'`    | Renders input fields as React state-controlled or ref-based uncontrolled.       |
| `validateOn`       | `'change' \| 'submit' \| 'change-submit' \| 'blur'` | `'change-submit'` | Event hook that triggers validation.                                            |
| `id`               | `string`                                            | `undefined`       | Unique identifier to bind this form to the global registry.                     |
| `persistKey`       | `string`                                            | `undefined`       | Storage key to backup/restore form drafts (falls back to `id`).                 |
| `autoFocusOnError` | `boolean`                                           | `true`            | Programmatically focuses the first invalid input element on validation failure. |
| `savedFormFirst`   | `boolean`                                           | `true`            | Prioritizes local storage draft restoration over `defaultValues`.               |
| `normalize`        | `Record<string, (value, prev) => any>`              | `undefined`       | Declarative normalizers to format input values in real-time as users type.      |
| `asyncValidate`    | `Record<string, AsyncValidator>`                    | `undefined`       | Race-condition safe debounced async validators (e.g. database checks).          |
| `cascade`          | `Record<string, CascadeField>`                      | `undefined`       | Cascading options selectors that reactively resolve choices based on deps.      |
| `steps`            | `string[][]`                                        | `undefined`       | Groupings of field paths representing steps in a wizard/multi-step form.        |

#

### Form Instance Properties and Methods

| Member                      | Type             | Description                                                                            |
| :-------------------------- | :--------------- | :------------------------------------------------------------------------------------- |
| `values`                    | `object`         | Getter returning the current nested state values of all form fields.                   |
| `errors`                    | `object`         | Getter returning the current nested field validation errors.                           |
| `submitting`                | `boolean`        | True if the form is currently running `onSubmit`.                                      |
| `validated`                 | `boolean`        | True if the form validation has run at least once.                                     |
| `isValidating`              | `boolean`        | True if any debounced async validation is actively running.                            |
| `validatingFields`          | `object`         | Mapping showing which specific fields are actively running async validations.          |
| `cascade`                   | `object`         | Mapping of loaded option sets and active loading states for cascading fields.          |
| `getChanges()`              | `Function`       | Returns a patch containing only form values modified compared to `defaultValues`.      |
| `getValue(path)`            | `Function`       | Retrieves a single field value by path.                                                |
| `setValue(path, value)`     | `Function`       | Sets a single field value by path (e.g. `setValue("address.city", "New York")`).       |
| `getValues()`               | `Function`       | Returns the entire form state values object.                                           |
| `setValues(values)`         | `Function`       | Merges a partial or complete set of values into the form state.                        |
| `getError(path)`            | `Function`       | Retrieves the validation error string for a specific field path.                       |
| `getErrors()`               | `Function`       | Returns all active validation errors.                                                  |
| `setErrors(errors)`         | `Function`       | Sets multiple validation errors manually.                                              |
| `validate()`                | `Function`       | Triggers a full form validation cycle manually.                                        |
| `validatePartial(values)`   | `Function`       | Validates a partial set of values using the schema.                                    |
| `reset(values?)`            | `Function`       | Resets the form back to initial values or new custom values.                           |
| `handleSubmit(onValid)`     | `Function`       | Wraps onSubmit callbacks with schema validation and passes the `HandlerContext`.       |
| `field(path)`               | `Function`       | Returns helper methods (`get`, `set`, `validate`, `reset`, etc.) for a single field.   |
| `array(path)`               | `Function`       | Returns array helper methods (`push`, `pop`, `remove`, `move`, `update`, etc.).        |
| `group(path)`               | `Function`       | Returns nested form group validation and update helpers.                               |
| `isDirty(path?)`            | `Function`       | Checks if a specific path or the entire form has been modified by the user.            |
| `focus(path)`               | `Function`       | Programmatically focuses the input element bound to the path.                          |
| `compute(name, deps, fn)`   | `Function`       | Registers a dynamic derived value dynamically recalculating on dependency updates.     |
| `watch(path?)`              | `Function`       | Subscribes to a field path, forcing React to re-render when it changes.                |
| `subscribe(path, callback)` | `Function`       | Subscribes to field/form changes without forcing a full React re-render.               |
| `transform(path, fn)`       | `Function`       | Transforms the value of a specific field dynamically.                                  |
| `debug()`                   | `Function`       | Returns a comprehensive dump of all form states, errors, dirty flags, and sub states.  |
| `Field`                     | `ReactComponent` | A pre-bound `<Field />` component specifically for this form instance.                 |
| `channel`                   | `object`         | High-performance event bus pub-sub channel.                                            |
| `meta`                      | `object`         | Form metadata and option storage object.                                               |
| `currentStep`               | `number`         | The current active step index (0-indexed) in a multi-step/wizard form.                 |
| `totalSteps`                | `number`         | The total number of steps defined in the form config.                                  |
| `nextStep()`                | `Function`       | Validates only the fields of the current step, and advances to the next step if valid. |
| `prevStep()`                | `Function`       | Safe helper to go back to the previous step.                                           |
| `setStep(index)`            | `Function`       | Directly sets the active step index.                                                   |

#

## ⚡ Advanced Features

### 1. Pre-bound Field Component

Instead of importing `<Field />` globally and passing `form` or relying on context, you can render fields directly from the form instance. This keeps your templates clean:

```tsx
const form = useForm({ defaultValues: { username: "" } });

return (
  <Form use={form}>
    <form.Field
      name="username"
      label="Username"
      render={(props) => <input {...props} />}
    />
  </Form>
);
```

### 2. Dynamic Computed Fields

Generate computed values dynamically whenever their dependencies change. Computed fields are treated as first-class members of your form values:

```tsx
const form = useForm({
  defaultValues: { quantity: 1, price: 10 },
  computed: {
    total: {
      deps: ["quantity", "price"],
      fn: (values) => values.quantity * values.price,
    },
  },
});

// form.values.total automatically stays in sync!
```

### 3. Native Multi-Step / Wizard Forms

Formly provides first-class support for multi-step forms with zero-config step state tracking and automated step-level validation.

#

#### Step 1: Define steps in your config

```tsx
const form = useForm({
  defaultValues: {
    username: "",
    email: "",
    phone: "",
    address: "",
  },
  schema: z.object({
    username: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
  }),
  steps: [
    ["username", "email"], // Step 1 fields
    ["phone", "address"], // Step 2 fields
  ],
});
```

#### Step 2: Render fields dynamically based on the wizard steps state

```tsx
const { current, isFirst, isLast, next, prev } = form.steps;

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    {current === 0 && (
      <>
        <form.Field
          name="username"
          label="Username"
          render={(props) => <input {...props} />}
        />
        <form.Field
          name="email"
          label="Email"
          render={(props) => <input {...props} type="email" />}
        />
        <button type="button" onClick={next}>
          Next Step
        </button>
      </>
    )}

    {current === 1 && (
      <>
        <form.Field
          name="phone"
          label="Phone Number"
          render={(props) => <input {...props} />}
        />
        <form.Field
          name="address"
          label="Address"
          render={(props) => <input {...props} />}
        />
        <button type="button" onClick={prev}>
          Back
        </button>
        <button type="submit">Submit Form</button>
      </>
    )}
  </form>
);
```

#

#### API Reference:

Formly wizard navigation is organized under the `form.steps` controller:

- `form.steps.current` (`number`): The 0-indexed current active step index.
- `form.steps.total` (`number`): The total number of steps defined in the config.
- `form.steps.isFirst` (`boolean`): Indicates whether the current active step is the first step.
- `form.steps.isLast` (`boolean`): Indicates whether the current active step is the last step.
- `form.steps.next()` (`Promise<boolean>`): Validates **only** the fields belonging to the current step (using Zod schema, sync `check` rules, and `asyncValidate` validations). Advances to the next step and returns `true` if valid, otherwise highlights errors and returns `false`.
- `form.steps.prev()` (`void`): Safe utility to move back to the previous step.
- `form.steps.set(index)` (`void`): Directly sets the active step index.

#

#### 💡 Depending on External React State / Props

If a computed field depends on external React variables (like props, global context, or state variables that are outside Formly's own internal form values), you can pass them directly inside the `deps` array. Formly will automatically detect changes in these external dependency elements and recalculate the computed field instantly:

```tsx
import { useState } from "react";
import { useForm, Form } from "@explita/formly";

function ProductInvoice() {
  const [taxRate, setTaxRate] = useState(0.15); // External state dependency

  const form = useForm({
    defaultValues: { subtotal: 100 },
    computed: {
      total: {
        // Simply add the external taxRate state directly into the deps array!
        // String values target form fields; non-string values trigger reactive updates.
        deps: ["subtotal", taxRate],
        fn: (values) => values.subtotal * (1 + taxRate),
      },
    },
  });

  return (
    <Form use={form}>
      <form.Field
        name="subtotal"
        label="Subtotal"
        render={(props) => <input {...props} type="number" />}
      />
      <div>
        Tax Rate Selector:
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
      </div>

      {/* Both subtotal inputs and external taxRate state changes will trigger automatic real-time updates! */}
      <div>Total: ${form.values.total}</div>
    </Form>
  );
}
```

#

### 4. High-Performance Subscriptions

For hyper-responsive forms, you can bypass React's state/re-render cycle and subscribe to field updates directly:

```typescript
useEffect(() => {
  const unsubscribe = form.subscribe("email", (newValue) => {
    console.log("Email changed (no re-render triggered):", newValue);
  });
  return unsubscribe;
}, [form]);
```

> [!WARNING]
> **Performance Note:** `form.watch()` subscribes to field changes and will trigger re-renders of the calling component. For logging or background side effects without triggering re-renders, use `form.subscribe()` instead.

#

### 5. Zero-Config Draft Persistence

Keep your users' data safe across browser reloads or tab closures by simply passing an `id` or `persistKey`:

```typescript
const form = useForm({
  id: "user-onboarding-form", // Auto-saves and restores draft state from localStorage!
  defaultValues: { name: "", bio: "" },
});
```

#

### 6. Accidental Navigation / Page Unload Prevention

Prevent users from accidentally losing their input state during long form editing sessions if they trigger page reloads, tab closures, or accidental browser navigation. By setting `preventUnload: true`, Formly automatically manages the background browser lifecycle events and blocks tab closure/reloads **exactly when the form is dirty**!

```typescript
const form = useForm({
  defaultValues: { username: "", bio: "" },
  preventUnload: true, // 👈 Triggers browser unload warnings if the form is dirty!
});
```

#

### 7. Zero-Setup Interactive Form DevTools Inspector

Formly features a state-of-the-art, premium interactive Form DevTools Inspector. To provide the ultimate developer experience (DX), **the DevTools automatically mounts and renders inside the `<Form />` provider in development environments**—requiring absolutely zero custom imports or configuration!

> [!NOTE]
> When multiple forms are rendered on the same page, Formly DevTools intelligently manages multiple instances, providing a selector to switch between active forms in the inspector panel.

#### Automatic & Configurable Hook:

```tsx
// 1. Zero Setup! In development mode, the inspector mounts automatically!
<Form use={form}>
  <form.Field name="username" render={(props) => <input {...props} />} />
</Form>

// 2. Custom Placement: Reposition the DevTools floating button to any corner
<Form use={form} devTools="top-left">
  {/* Moves DevTools from bottom-right to top-left! */}
</Form>

// 3. Complete Opt-out: Disable automatic mounting in development entirely
<Form use={form} devTools={false}>
  {/* DevTools is completely hidden */}
</Form>
```

#### 🛡️ Bulletproof Production Performance:

In production builds (`process.env.NODE_ENV === "production"`), the inspector automatically renders `null` and is optimized out by bundlers (Vite, Webpack, Turbopack), ensuring absolutely zero impact on production bundle sizes or customer runtime performance!

#### 🛠️ DevTools Control Room Features:

- **Values Tab**: Displays your live nested form values tree with a floating absolute "Copy entire JSON" helper button.
- **Changes Tab** _(Brand New!)_: Live-recalculated diff patch payload using `form.getChanges()`. Displays only fields modified by the user compared to initial `defaultValues`, and includes a one-click **Copy Changes** button to easily grab the exact PATCH payload!
- **State Tab**: Live status monitors for form properties (`submitting`, `validated`, `isValidating`, active Wizard step info), active `errors`, flat `dirty` paths, `touched` lists, **Metadata Context Map** (`form.meta`), and **Cascading Dropdowns** loader status (`form.cascade`)!
- **Actions Tab**: Interactively fire form overrides in real-time! Re-run global validations, reset the form completely, step through steps in a Wizard layout, or enter target paths (like `contacts.0.name`) to manually override field state values!

#

## 🌟 Enterprise-Grade Capabilities

Formly includes powerful, highly performant, and declarative helpers built to simplify advanced business applications.

#

### 1. Debounced Async Validation (Race-Condition Safe)

Easily register remote validators (e.g. checking username uniqueness, email availability, or coupon validity). Formly automatically manages debouncing and request versioning, ensuring that slow network requests don't cause state race conditions or out-of-order errors!

```typescript
const form = useForm({
  defaultValues: { username: "" },
  asyncValidate: {
    username: {
      debounce: 500, // Wait 500ms after the user stops typing
      validate: async (value) => {
        const isTaken = await checkUsernameTaken(value);
        return isTaken ? "Username is already taken" : null;
      },
    },
  },
});

// Reactively display spinners or block actions during verification:
const isFieldChecking = form.validatingFields.username; // Specific field state
const isFormChecking = form.isValidating; // Global form state
```

#

### 2. Patch Payload Diffing (getChanges)

Instead of sending the entire form payload back to your API when updating records, you can retrieve a clean patch containing _only the fields actually modified by the user_ compared to the initial `defaultValues`.

- **Directly in the submit callback context:**
  ```typescript
  const form = useForm({
    defaultValues: userProfile,
    onSubmit: (values, ctx) => {
      const changes = ctx.getChanges();
      // e.g. sends only { email: "new-email@explita.com" } instead of the full user object!
      await api.patch(`/users/${userProfile.id}`, changes);
    },
  });
  ```
- **Directly from the form instance:**
  ```typescript
  const changes = form.getChanges();
  ```
  #

### 3. Declarative Input Normalization & Auto-Formatters

Format and sanitize input fields in real-time as users type (e.g., stripping non-digits from phone fields, formatting credit card spaces, or capitalizing coupon codes). Normalization runs directly before committing values to the state or notifying subscribers.

```typescript
const form = useForm({
  defaultValues: { promoCode: "", phone: "" },
  normalize: {
    promoCode: (value) => value.toUpperCase().trim(),
    phone: (value, prevValue) => value.replace(/\D/g, "").slice(0, 10),
  },
});
```

#

### 4. Cascading Dropdowns & Dynamic Options Binding

Declare select field relationships cleanly (e.g. choosing a "Country" dynamically loads its "Cities"). Formly automatically subscribes to target dependencies, invokes your async loader `fn`, and stores the reactively resolved option sets and loading states directly inside `form.cascade` with **100% perfect, automatic TypeScript type inference**!

```typescript
const form = useForm({
  defaultValues: { country: "", city: "" },
  cascade: {
    cities: {
      watch: ["country"],
      fn: async ([country]) => {
        if (!country) return [];
        return await fetchCitiesForCountry(country); // Returns: { value: string; label: string; }[]
      },
      onLoad: (cities) => {
        console.log("Cities loaded successfully!", cities);
      },
    },
  },
});

// Render reactively and with full IDE autocompletion & type-safety:
const { data: cityOptions, isLoading } = form.cascade.cities;
// `cityOptions` is fully typed as `{ value: string; label: string; }[]`!
```

#

### 5. Auto-Keyed Dynamic Arrays

When rendering dynamic lists in React (using `form.array("path")`), assigning a stable, unique `key` prop is critical for list performance and flawless transition animations. However, using `index` as a key causes rendering bugs, and standard list items might be objects or simple primitives (like `string[]` or `number[]`), which cannot hold custom properties.

Formly solves this elegantly by automatically generating and synchronizing a parallel array of **persistent, unique string keys** under `items.keys`!

#### Rendering Objects:

```tsx
const contacts = form.array("contacts");

return (
  <div>
    {contacts.value.map((contact, index) => (
      <div key={contacts.keys[index]}>
        <form.Field
          name={`contacts.${index}.name`}
          label="Name"
          render={(props) => <input {...props} />}
        />
        <button onClick={() => contacts.remove(index)}>Remove</button>
      </div>
    ))}
    <button onClick={() => contacts.push({ name: "" })}>Add Contact</button>
  </div>
);
```

#### Rendering Primitives (e.g. `string[]`):

Works exactly the same way, with **zero mapping wrappers** needed!

```tsx
const tags = form.array("tags");

return (
  <div>
    {tags.value.map((tag, index) => (
      <div key={tags.keys[index]}>
        <form.Field
          name={`tags.${index}`}
          label={`Tag ${index + 1}`}
          render={(props) => <input {...props} />}
        />
        <button onClick={() => tags.remove(index)}>Remove</button>
      </div>
    ))}
    <button onClick={() => tags.push("")}>Add Tag</button>
  </div>
);
```

#### Why it's a game-changer:

The parallel keys are maintained **100% in sync** with every mutation (including `push`, `insert`, `swap`, `move`, `sort`, `filter`, and `removeIf`). Each logical list item retains its key forever, resulting in perfect React DOM reconciliation, no component unmounting, and beautifully smooth item transitions!

#

## TypeScript Support

Formly is built with TypeScript and provides excellent type safety:

```ts
interface UserForm {
  name: string;
  email: string;
  contacts: {
    phone: string;
    type: "home" | "work" | "mobile";
  }[];
}

const form = useForm<UserForm>({
  defaultValues: {
    name: "",
    email: "",
    contacts: [],
  },
});
```

#

## 💖 Support the Mission

Formly is built to make form management in React simple, type-safe, and performant. If it has improved your developer experience or helped you build complex forms faster, please consider supporting the project to ensure its continued growth and maintenance!

<p align="left">
  <a href="https://github.com/sponsors/explita">
    <img src="https://img.shields.io/badge/Sponsor_on_GitHub-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white" />
  </a>
  <a href="https://ko-fi.com/explita">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" />
  </a>
</p>

### 🚀 Ways to Contribute

- **Give us a ⭐**: It helps others discover the project.
- **Join the Discussion**: Report [bugs](https://github.com/explita/formly/issues) or suggest new [features](https://github.com/explita/formly/discussions).
- **Spread the Word**: Share your experience with Formly on social media.

### 🙏 Our Amazing Supporters

_A huge thank you to everyone helping us build the future of React forms!_

[![Contributors](https://contrib.rocks/image?repo=explita/formly)](https://github.com/explita/formly/graphs/contributors)

#

## License

MIT © [Explita](https://github.com/explita)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
