---
sidebar_position: 7
title: Debounced Async Validation
---

# Debounced Async Validation

Async validation allows you to run remote validations (such as checking username availability, email existence, or coupon code validity) in the background. Formly includes built-in debouncing and request versioning to prevent network race conditions.

---

## Defining Async Validators

To set up async validation, use the `asyncValidate` option when initializing the form. You can specify a debounce interval in milliseconds for each field and define the validator callback using the `fn` property. The callback receives the current field value and the entire form values object:

```typescript
import { useForm } from "@explita/formly";

const form = useForm({
  defaultValues: { username: "" },
  asyncValidate: {
    username: {
      debounce: 500, // Waits 500ms after the user stops typing
      fn: async (value, formValues) => {
        if (!value) return undefined;
        
        // Remote API call
        const isTaken = await api.checkUsernameTaken(value);
        return isTaken ? "Username is already taken" : undefined;
      },
    },
  },
});
```

---

## Validation Status Indicators

Formly tracks active background operations on both a global and field-specific level. This allows you to show loading indicators or disable action buttons during validations.

| Property | Type | Description |
| :--- | :--- | :--- |
| `form.isValidating` | `boolean` | True if *any* async validator is currently executing. |
| `form.validatingFields.username` | `boolean` | True if the validator for `username` is actively running. |

---

## Complete Example

```tsx
import React from "react";
import { Form, useForm } from "@explita/formly";

export default function SignupForm() {
  const form = useForm({
    defaultValues: { username: "" },
    asyncValidate: {
      username: {
        debounce: 400,
        fn: async (username, formValues) => {
          const res = await fetch(`/api/users/check?username=${username}`);
          const { available } = await res.json();
          return available ? undefined : "This username is already taken";
        }
      }
    },
    onSubmit: (values) => console.log("Submitting:", values),
  });

  const isChecking = form.validatingFields.username;

  return (
    <Form use={form}>
      <form.Field
        name="username"
        label="Select Username"
        render={(props, ctx) => (
          <div style={{ position: "relative" }}>
            <input {...props} />
            
            {/* Field level loading indicator */}
            {isChecking && (
              <span className="spinner" style={{ marginLeft: "10px" }}>
                Checking availability... ⏳
              </span>
            )}
            
            {ctx.touched && ctx.error && (
              <div style={{ color: "red", marginTop: "4px" }}>{ctx.error}</div>
            )}
          </div>
        )}
      />

      <button type="submit" disabled={form.isValidating}>
        Register Account
      </button>
    </Form>
  );
}
```

---

## Race-Condition Safety

A common issue in forms is request race conditions:
1. User types `u` (Request A is sent).
2. User types `us` (Request B is sent).
3. Request B finishes quickly.
4. Request A finishes slowly, overwriting the result of Request B.

Formly eliminates this out-of-order execution bug. Under the hood, **each validation request is version-controlled**. If a newer keystroke initiates a validation, slow legacy requests are discarded automatically when they resolve, ensuring your validation messages stay synchronized with what is currently on screen.
