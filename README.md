# @explita/formly

A lightweight, type-safe form toolkit for React built with developer ergonomics in mind. Provides a flexible form management solution with built-in validation, array manipulation, and nested form support.

## Features

- 🚀 **Type-safe** with TypeScript support
- 🧩 **Composable** form components and hooks
- 🔄 **Form State Management** with minimal re-renders
- ✅ **Built-in Validation** with Zod integration
- 📋 **Array & Nested Fields** support
- 🔍 **Form Context** for easy access to form state
- 🎯 **Field-level** and **Form-level** validation
- ⚡ **Optimized Performance** with smart re-rendering

## Installation

```bash
npm install @explita/formly
# or
yarn add @explita/formly
# or
pnpm add @explita/formly
```

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
      })
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
      <Field name="name" label="Full Name" />
      <Field name="email" type="email" label="Email" />

      {/* Dynamic array fields */}
      {contacts.value.map((contact, index) => (
        <div key={index}>
          <Field
            name={`contacts.${index}.phone`}
            label={`Phone ${index + 1}`}
          />
          <Field name={`contacts.${index}.type`} as="select" label="Type">
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="mobile">Mobile</option>
          </Field>
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

## Core Concepts

### `useForm` Hook

The `useForm` hook is the heart of Formly. It manages the form state and provides methods to interact with the form.

```tsx
const form = useForm({
  defaultValues: {
    /* ... */
  },
  // Optional: Zod schema for validation
  schema: userSchema,
  // Optional: Custom validation function
  check: (values) => {
    const errors = {};
    if (!values.name) errors.name = "Name is required";
    return errors;
  },
  // Form submission handler
  onSubmit: async (values, ctx) => {
    console.log("Form values:", values);
  },
  // Persist form state
  persistKey: "myFormState",
});
```

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

## API Reference

### `useForm` Options

| Option             | Type                    | Description                               |
| ------------------ | ----------------------- | ----------------------------------------- |
| `defaultValues`    | `object`                | Initial form values                       |
| `schema`           | `z.ZodSchema`           | Zod schema for validation                 |
| `check`            | `(values) => object`    | Custom validation function                |
| `onSubmit`         | `(values, ctx) => void` | Form submission handler                   |
| `persistKey`       | `string`                | Key to persist form state in localStorage |
| `autoFocusOnError` | `boolean`               | Auto-focus first invalid field            |

### Form Methods

| Method                       | Description                              |
| ---------------------------- | ---------------------------------------- |
| `submit()`                   | Submit the form programmatically         |
| `reset(values?)`             | Reset form to initial or provided values |
| `setValues(values)`          | Set multiple field values                |
| `setFieldValue(path, value)` | Set a single field value                 |
| `setErrors(errors)`          | Set form errors                          |
| `setFieldError(path, error)` | Set error for a specific field           |
| `validate()`                 | Trigger validation                       |
| `watch(path?)`               | Watch form or specific field values      |
| `array(path)`                | Get array field helpers                  |
| `group(path)`                | Get nested form group helpers            |

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

## License

MIT © [Explita](https://github.com/explita)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
