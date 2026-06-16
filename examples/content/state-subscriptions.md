---
sidebar_position: 10
title: Subscriptions & Watchers
---

# Subscriptions & Watchers

Formly is built on a high-performance **Pub-Sub event bus architecture**. Rather than forcing the entire React form component to re-render on every keystroke, input values are updated directly inside their respective target elements.

To sync state across fields or trigger React layout updates, Formly provides two subscription mechanisms: `watch` and `subscribe`.

---

## Reactive Watchers: `form.watch`

The `form.watch()` method registers a reactive subscription. Whenever the watched field path changes, **it forces the calling React component to re-render**. 

This is the standard approach for conditionally rendering sections or updating text displays based on user selections.

### Example: Conditional Field Rendering

```tsx
import React from "react";
import { Form, Field, useForm } from "@explita/formly";

export default function CheckoutForm() {
  const form = useForm({
    defaultValues: {
      hasGiftMessage: false,
      giftMessage: "",
    }
  });

  // Watch the checkbox field
  const showMessage = form.watch("hasGiftMessage");

  return (
    <Form use={form}>
      <Field
        name="hasGiftMessage"
        type="checkbox"
        label="Include a free gift message?"
        render={(props) => <input {...props} type="checkbox" />}
      />

      {/* Conditionally render message input */}
      {showMessage && (
        <div className="gift-message-section" style={{ marginTop: "1rem" }}>
          <Field
            name="giftMessage"
            label="Gift Message Text"
            render={(props) => <textarea {...props} maxLength={200} />}
          />
        </div>
      )}

      <button type="submit" style={{ marginTop: "1.5rem" }}>
        Place Order
      </button>
    </Form>
  );
}
```

---

## Performance Listeners: `form.subscribe`

For performance-critical code or actions that don't need visual layout changes, `form.subscribe()` registers an event listener. It triggers a callback whenever the target field value changes **without forcing a React re-render**.

This is ideal for logging, tracking analytics, updating background caches, or triggering secondary mutations.

### Example: Background Logging

```typescript
import React, { useEffect } from "react";
import { useForm } from "@explita/formly";

function AnalyticLogger() {
  const form = useForm({
    defaultValues: { email: "" }
  });

  useEffect(() => {
    // Subscribe directly to the email channel
    const unsubscribe = form.subscribe("email", (newEmail) => {
      // Runs on every keystroke, but AnalyticLogger does NOT re-render!
      console.log("Analytics: email input changed to:", newEmail);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [form]);

  return (
    <form.Field
      name="email"
      label="Email"
      render={(props) => <input {...props} />}
    />
  );
}
```

---

## Summary comparison

Use this table to choose the correct approach:

| Use Case | Method | React Re-render? |
| :--- | :--- | :--- |
| Conditionally hiding/showing form sections | `form.watch("path")` | Yes (Triggered on value change) |
| Displaying calculated totals in text nodes | `form.watch("path")` | Yes (Triggered on value change) |
| Triggering analytical trackers (Google Analytics) | `form.subscribe("path", cb)` | No |
| Saving draft states silently to a remote DB | `form.subscribe("path", cb)` | No |
| Writing logs or syncing with non-React stores | `form.subscribe("path", cb)` | No |
