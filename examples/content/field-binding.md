---
sidebar_position: 3
title: Field Binding & Components
---

# Field Binding & Components

Formly provides two primary ways to register and bind input elements to the form state: the declarative `<Field />` component and the `useField()` hook. Both methods ensure that only the individual input re-renders on value updates.

---

## The `<Field />` Component

The `<Field />` component is a declarative wrapper that automatically connects standard HTML inputs to your form state. It manages label text, handles error displays, tracks touched states, and injects accessibility attributes.

### Basic Usage

```tsx
import { Form, Field, useForm } from "@explita/formly";

function MyForm() {
  const form = useForm({
    defaultValues: { username: "" }
  });

  return (
    <Form use={form}>
      <Field
        name="username"
        label="Account Username"
        placeholder="Enter username"
        required
        render={(props, ctx) => (
          <div className="input-group">
            <input {...props} />
            {ctx.touched && ctx.error && (
              <span className="error">{ctx.error}</span>
            )}
          </div>
        )}
      />
    </Form>
  );
}
```

### Pre-bound Field Component (`form.Field`)

Instead of importing the global `<Field />` component, you can use the pre-bound component exposed directly by your form instance. This removes the dependency on React context and makes your code cleaner:

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

---

## The `useField` Hook

The `useField` hook is ideal for building custom input components or integrating with complex third-party library fields (like Select components, date pickers, or rich text editors).

### Hook Signature

```tsx
const field = useField(namePath, options?);
```

### Return Value Properties

The `useField` hook returns a `FieldController` object with the following properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `value` | `T` | The current value of the field. |
| `setValue` | `(value: T) => void` | Sets the field value programmatically. |
| `error` | `string \| undefined` | The active validation error message. |
| `hasError` | `boolean` | Flag indicating if the field currently has a validation error. |
| `touched` | `boolean` | Flag indicating if the input has been focused and blurred. |
| `dirty` | `boolean` | Flag indicating if the value differs from its initial default. |
| `reset` | `() => void` | Resets value, touched, and dirty states to initial values. |
| `validate` | `() => Promise<boolean>` | Triggers validation specifically for this field element. |
| `focus` | `() => void` | Programmatically focuses this field's input element. |
| `bind()` | `() => object` | Returns pre-bound event handlers (`name`, `value`, `onChange`, `onBlur`, and ARIA tags). |
| `refId` | `string` | A unique stable DOM reference ID for labels and aria-describedby bindings. |

### Hook Example

```tsx
import { useField } from "@explita/formly";

function CustomTextInput({ name, label }: { name: string; label: string }) {
  const { value, setValue, error, touched, bind } = useField(name);

  return (
    <div className="form-group">
      <label>{label}</label>
      <input 
        {...bind()} 
        type="text" 
        className={touched && error ? "border-red" : ""}
      />
      {touched && error && <div className="error-msg">{error}</div>}
    </div>
  );
}
```

---

## Choosing Between `<Field />` and `useField`

Use this table to decide which approach fits your implementation:

| Use Case | Recommendation |
| :--- | :--- |
| Simple input/select with standard HTML events | `<Field render={(props) => <input {...props} />} />` |
| Fast prototyping & simple markup templates | `<Field />` component |
| Custom complex inputs (comboboxes, calendar picks) | `useField()` custom hook |
| Reusable form UI library components | `useField()` custom hook |
| Advanced manual focus & programmatic verification | `useField()` hook helpers |

---

## Input Normalization

In addition to field-level rendering, Formly supports **Declarative Input Normalization** at the form configuration level. This allows you to format and sanitize input values in real-time as the user types (e.g., stripping non-digits from phone numbers, capitalizing promo codes, or formatting credit card spaces).

Normalization runs automatically before committing the value to the form state, triggering validations, or notifying subscribers.

### Example: Normalizing phone numbers and promo codes

To configure normalizers, pass a `normalize` object to `useForm`. Each key matches a field path and takes a function returning the normalized value:

```tsx
import { Form, Field, useForm } from "@explita/formly";

function ProfileForm() {
  const form = useForm({
    defaultValues: {
      phone: "",
      promoCode: "",
    },
    normalize: {
      // 1. Clean phone input: strip non-digits and limit to 10 characters
      phone: (value, prevValue) => value.replace(/\D/g, "").slice(0, 10),
      
      // 2. Format promo code: force uppercase and trim whitespace
      promoCode: (value) => value.toUpperCase().trim(),
    },
  });

  return (
    <Form use={form}>
      <Field
        name="phone"
        label="Phone Number"
        render={(props) => <input {...props} placeholder="Only digits allowed" />}
      />
      <Field
        name="promoCode"
        label="Promo Code"
        render={(props) => <input {...props} />}
      />
    </Form>
  );
}
```

Since the normalizer runs on every keystroke, the bound input value stays perfectly formatted in real-time, preventing users from entering invalid characters into your form state.
