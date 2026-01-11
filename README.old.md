⚠️ Using register() is convenient for quick input wiring, but for large forms where performance matters, prefer useField or Field to avoid unnecessary re-renders.

For performance and clarity, here’s the usual pattern I’d recommend:

<form.Field /> (from form instance) or standalone <Field />

Best for most use cases.

Handles binding, errors, and local reactivity automatically.

Encapsulates the field logic, so the parent form doesn’t rerender on every change.

Easy to drop into JSX and add labels, wrappers, or custom styling.

useField() inside a separate component

Great when you want full programmatic control over the field.

Can wrap a custom input or a complex component.

Keeps reactivity local to the component.

Allows you to do more advanced things like computed values, conditional logic, or side effects specific to that field.

✅ Rule of thumb:

If you just need a simple form input, use <Field /> — minimal boilerplate, good defaults.

If you need custom behavior or a completely custom component, wrap it with a component using useField().

This way, the form itself stays light and doesn’t rerender unnecessarily, while each field manages its own state efficiently.

# @explita/formly

A powerful and extensible React form hook for building scalable forms with Zod validation, persistence, and full control.

## ✨ Features

- ✅ Built-in Zod schema validation
- ✅ Controlled and uncontrolled modes
- ✅ Persistent form state via `localStorage`
- ✅ Field-level error handling and parsing
- ✅ Debounced input validation
- ✅ Works seamlessly with any UI library (e.g. shadcn/ui)

## 📦 Installation

```bash
npm install @explita/formly
# or
yarn add @explita/formly
# or
pnpm add @explita/formly
```

## 🧪 Usage

```tsx
import { z } from "zod";
import { useForm, Form, Field } from "@explita/formly";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.email({ error: "Invalid email" }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters" }),
});

export default function LoginForm() {
  const form = useForm({
    schema,
    defaultValues: { email: "", password: "" },
    onSubmit: async (values) => {
      console.log("Submitted", values);
      // call server action here or perform an HTTP request
      // const response = await login(values)
      // return response
      return values;
    },
    onSuccess: (result, ctx) => {
      console.log("Success", result);
      // result is the result of onSubmit
      // ctx.reset(); - reset the form, you don't need this if resetOnSuccess is true
    },
    onError: (error, ctx) => {
      console.log("Error", error, ctx);
      // error - the error object (usually from schema or server)
      // ctx.setErrors({ email: "Email is required" }); - useful for server errors
    },
    persistKey: "login-form", // Optional – saves input across reloads
    errorParser: (msg) => msg, // Optional – customize error messages
    mode: "controlled", // Optional – "controlled" is the default
    resetOnSuccess: true, // Optional – clears the form on success
  });

  //Field meta is an object that contains the value, error, and hasError properties

  return (
    <Form use={form}>
      <Field name="email" label="Email" isRequired>
        {(props, meta) => <Input {...props} />}
      </Field>

      <Field name="password" label="Password" isRequired>
        {(props, meta) => <Input type="password" {...props} />}
      </Field>

      <button type="submit" disabled={form.isSubmitting}>
        Submit
      </button>
    </Form>
  );
}
```

## 🧩 API Overview

### `useForm(options)`

| Option           | Type                                  | Description                                 |
| ---------------- | ------------------------------------- | ------------------------------------------- |
| `schema`         | `ZodObject`                           | Optional Zod schema for validation          |
| `defaultValues`  | `Partial<T>`                          | Initial form values                         |
| `onSubmit`       | `(values, formData) => Promise<void>` | Async submission handler                    |
| `onSuccess`      | `(result) => void`                    | Called on successful submission             |
| `onError`        | `(error, ctx) => void`                | Called on error, with access to `setErrors` |
| `persistKey`     | `string`                              | Key to store form values under              |
| `errorParser`    | `(msg: string) => string`             | Optional formatter for error messages       |
| `mode`           | `controlled`\|`uncontrolled`          | Default to controlled                       |
| `resetOnSuccess` | `boolean`                             | Clear the form on successful submission     |

### `useFormContext()`

Can be used in any component nested inside the `Form` component to access the form context.

##

### 📄 License

MIT — Made with ❤️ by [Explita](https://explita.ng)
