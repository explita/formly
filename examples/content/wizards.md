---
sidebar_position: 5
title: Wizards & Multi-Step Forms
---

# Wizards & Multi-Step Forms

Formly provides native support for multi-step / wizard forms, allowing you to divide complex forms into multiple pages with step-level validation and active step tracking.

---

## Defining Wizard Steps

To initialize a wizard form, pass a `steps` array into `useForm` options. The `steps` array is an array of string arrays, where each inner array contains the field paths belonging to that step.

```typescript
const form = useForm({
  defaultValues: {
    username: "",
    email: "",
    phone: "",
    address: "",
  },
  schema: z.object({
    username: z.string().min(3, "Username must be at least 3 chars"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone must be 10 digits"),
    address: z.string().min(5, "Address too short"),
  }),
  // Step definitions grouping paths
  steps: [
    ["username", "email"], // Step 1
    ["phone", "address"], // Step 2
  ],
});
```

---

## Render Fields Dynamically

Using the step controller `form.steps`, you can conditionally render fields and navigate between stages. 

```tsx
export default function MultiStepWizard() {
  const form = useForm({
    /* ... options ... */
  });
  
  const { current, isFirst, isLast, next, prev } = form.steps;

  return (
    <form onSubmit={form.handleSubmit((data) => console.log("Submitting:", data))}>
      
      {/* Step 1 Content */}
      {current === 0 && (
        <div className="step-pane">
          <h2>Step 1: Account Information</h2>
          <form.Field name="username" label="Username" render={(props) => <input {...props} />} />
          <form.Field name="email" label="Email" render={(props) => <input {...props} type="email" />} />
          
          <button type="button" onClick={next}>
            Next Step
          </button>
        </div>
      )}

      {/* Step 2 Content */}
      {current === 1 && (
        <div className="step-pane">
          <h2>Step 2: Contact Details</h2>
          <form.Field name="phone" label="Phone Number" render={(props) => <input {...props} />} />
          <form.Field name="address" label="Mailing Address" render={(props) => <input {...props} />} />
          
          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            <button type="button" onClick={prev}>
              Back
            </button>
            <button type="submit">
              Submit Form
            </button>
          </div>
        </div>
      )}
      
    </form>
  );
}
```

---

## Wizard Controller API (`form.steps`)

The `form.steps` controller exposes the following members to handle wizard navigation:

| Member | Type | Description |
| :--- | :--- | :--- |
| `current` | `number` | The active step index (0-indexed). |
| `total` | `number` | The total number of steps configured. |
| `isFirst` | `boolean` | True if the active step is `0`. |
| `isLast` | `boolean` | True if the active step is the last step index. |
| `next()` | `() => Promise<boolean>` | Validates **only** the fields belonging to the current step (using Zod schemas, sync `check` rules, and `asyncValidate` handlers). If they pass validation, it increments the step index and returns `true`. If they fail, it focuses the first invalid element, displays errors, and returns `false`. |
| `prev()` | `() => void` | Shifts the active step index backward by one (no validation is performed). |
| `set(index)` | `(index: number) => void` | Programmatically sets the active step index directly. |

---

## Key Benefits of Formly Wizards

1. **Step-Level Validation**: Instead of validating the entire form on every step transition, calling `next()` validates *only the paths specified for the current step*. This prevents validation errors from firing on fields that the user hasn't seen yet.
2. **Cohesive State Management**: Although the form is visually divided into pages, it remains a single cohesive form instance. Values from previous steps are fully preserved and included in the final submit payload.
