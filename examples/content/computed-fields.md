---
sidebar_position: 6
title: Dynamic Computed Fields
---

# Dynamic Computed Fields

Computed fields are form values derived reactively from other form fields or external React state variables. They stay in sync automatically and are treated as first-class members of your form values.

---

## Defining Computed Fields

To define computed fields, pass a `computed` object config into `useForm`.

```typescript
const form = useForm({
  defaultValues: {
    quantity: 1,
    price: 10,
  },
  computed: {
    // Defines 'total' as a derived value
    total: {
      deps: ["quantity", "price"],
      fn: (values) => values.quantity * values.price,
    },
  },
});
```

Whenever the `quantity` or `price` inputs change, Formly recalculates the `total` field value in the background. You can access it directly via `form.values.total`.

---

## Depending on External React State & Props

If a computed field depends on external variables (like component props, parent context, or React state outside of Formly's form values), you can add them directly to the `deps` array.

Formly distinguishes between dependencies:
* **String values** (e.g. `"quantity"`) target form field paths.
* **Non-string values** (e.g. state variables, props, objects) trigger reactive recalculations whenever they change.

### Example: Product Invoice with External Tax Rate State

Here, changing either the form field `subtotal` or the React state `taxRate` will trigger a calculation of the computed field `total`:

```tsx
import React, { useState } from "react";
import { Form, useForm } from "@explita/formly";

export default function ProductInvoice() {
  // External React state
  const [taxRate, setTaxRate] = useState(0.15); 

  const form = useForm({
    defaultValues: { subtotal: 100 },
    computed: {
      total: {
        // Formly watches the 'subtotal' path and watches the external 'taxRate' state value!
        deps: ["subtotal", taxRate],
        fn: (values) => values.subtotal * (1 + taxRate),
      },
    },
  });

  return (
    <Form use={form}>
      {/* Subtotal Form Field */}
      <form.Field
        name="subtotal"
        label="Invoice Subtotal ($)"
        render={(props) => <input {...props} type="number" />}
      />

      {/* External Tax Rate Input */}
      <div style={{ marginTop: "1rem" }}>
        <label>Tax Rate Selector: </label>
        <input
          type="number"
          step="0.01"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
      </div>

      {/* Computed Value displays in real-time */}
      <div style={{ marginTop: "1.5rem", fontWeight: "bold" }}>
        Calculated Total: ${form.values.total.toFixed(2)}
      </div>
    </Form>
  );
}
```

---

## Dynamic Registration (`form.compute`)

You can also register a computed field dynamically after form initialization using the `form.compute()` method:

```typescript
useEffect(() => {
  form.compute("discountedTotal", ["total", discount], (values) => {
    return values.total - discount;
  });
}, [form, discount]);
```
