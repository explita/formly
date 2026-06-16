---
sidebar_position: 1
title: Introduction & Quick Start
---

# Introduction & Quick Start

`@explita/formly` is a lightweight, 100% type-safe form management toolkit for React designed for developer ergonomics and high-performance rendering.

It implements a **pub-sub event bus architecture** to handle targeted state changes, completely bypassing full-form re-renders. This ensures forms with hundreds of inputs remain hyper-responsive and lightweight.

[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@explita/formly?style=flat-square)](https://bundlephobia.com/package/@explita/formly) [![React Version](https://img.shields.io/badge/react-19.0+-blue.svg?style=flat-square)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

---

## Key Features

- ⚡ **Micro-Render Architecture**: High-performance pub-sub event bus updates targeted inputs directly, completely bypassing full-form React re-renders.
- 🧩 **100% Type-Safe**: Auto-inferred nested paths, option cascades, normalizers, and wizard steps.
- ✅ **First-Class Schema Validation**: Native, seamless integration with Zod schemas.
- 📋 **Auto-Keyed Dynamic Arrays**: Lists tracked via parallel, persistent unique keys for perfect React reconciliation and smooth animations.
- 🧮 **Dynamic Computed Fields**: Derive values reactively from other form fields or external React state.
- 🧹 **Declarative Input Normalization**: Format and sanitize values (e.g., phone formatting, uppercasing) in real-time as users type.
- 📊 **Patch Payload Diffing (`getChanges`)**: Extract and submit only modified fields to keep API requests lightweight.
- 💾 **Zero-Config Draft Persistence**: Automatically backup and restore form states across page reloads.
- 🛡️ **Page Unload Prevention (`preventUnload`)**: Stop users from losing unsaved edits by blocking accidental navigation/tab close when the form is dirty.
- 🛠️ **Zero-Setup Interactive DevTools**: Floating debugger suite featuring live values, diff monitoring, and time-travel history.

---

## Installation

Install the package via your package manager:

```bash
# npm
npm install @explita/formly

# yarn
yarn add @explita/formly

# pnpm
pnpm add @explita/formly
```

Ensure `react`, `react-dom` (v19+ recommended), and `zod` (if using schema validation) are installed in your project.

---

## 2-Minute Quick Start

Here is a complete, type-safe form example featuring Zod schema validation, text inputs, and a dynamic array list.

```tsx
import React from "react";
import { Form, Field, useForm } from "@explita/formly";
import { z } from "zod";

// 1. Define your validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  contacts: z
    .array(
      z.object({
        phone: z.string().min(1, "Phone is required"),
        type: z.enum(["home", "work", "mobile"]),
      }),
    )
    .min(1, "At least one contact is required"),
});

export default function QuickStartForm() {
  // 2. Initialize the form instance
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      contacts: [{ phone: "", type: "mobile" }],
    },
    schema: contactSchema,
    onSubmit: (values, ctx) => {
      console.log("Successfully submitted values:", values);
      console.log("Only modified fields (PATCH payload):", ctx.getChanges());
    },
  });

  // 3. Bind dynamic list manager
  const contacts = form.array("contacts");

  return (
    <Form use={form}>
      {/* Name Input */}
      <Field
        name="name"
        label="Full Name"
        placeholder="Enter full name"
        render={(props, ctx) => (
          <input {...props} className={ctx.error ? "error" : ""} />
        )}
      />

      {/* Email Input */}
      <Field
        name="email"
        label="Email Address"
        render={(props) => <input {...props} type="email" />}
      />

      {/* Dynamic Array section */}
      <h3>Contact Channels</h3>
      {contacts.value.map((contact, index) => (
        // Assign the unique persistent Formly key for list reconciliation
        <div
          key={contacts.keys[index]}
          style={{ display: "flex", gap: "10px", marginBottom: "1rem", alignItems: "flex-end" }}
        >
          <Field
            name={`contacts.${index}.phone`}
            label="Phone"
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

      <div style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={() => contacts.push({ phone: "", type: "mobile" })}
        >
          Add Contact
        </button>

        <button type="submit">Submit Form</button>
      </div>
    </Form>
  );
}
```
