# @explita/formly

**A lightweight, type-safe form toolkit for React built with developer ergonomics in mind.**

Formly provides a flexible form management solution with built-in validation, dynamic array manipulation, reactive computed fields, and multi-step wizard layouts—driven by a high-performance pub-sub event architecture.

[![NPM Version](https://img.shields.io/npm/v/@explita/formly?style=flat-square&color=blue)](https://www.npmjs.com/package/@explita/formly)
[![License](https://img.shields.io/npm/l/@explita/formly?style=flat-square&color=lightgray)](https://github.com/explita/formly/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-formly.explita.ng-blueviolet?style=flat-square)](https://formly.explita.ng)

---

## 🚀 Key Features

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

## 📖 Complete Documentation

Visit our documentation portal for complete guides, API references, computed fields, multi-step wizards, cascading dropdowns, and interactive devtools:

👉 **[formly.explita.ng](https://formly.explita.ng)**

---

## Installation

```bash
# npm
npm install @explita/formly

# yarn
yarn add @explita/formly

# pnpm
pnpm add @explita/formly
```

Ensure `react`, `react-dom` (v19+ recommended), and `zod` are installed as peer dependencies.

---

## Quick Start

```tsx
import { Form, Field, useForm } from "@explita/formly";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
});

function UserForm() {
  const form = useForm({
    defaultValues: { username: "", email: "" },
    schema: formSchema,
    onSubmit: (values, ctx) => {
      console.log("Submitted values:", values);
      console.log("Changes (PATCH payload):", ctx.getChanges());
    },
  });

  return (
    <Form use={form}>
      <form.Field
        name="username"
        label="Username"
        render={(props) => <input {...props} />}
      />
      <form.Field
        name="email"
        label="Email Address"
        render={(props) => <input {...props} type="email" />}
      />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

---

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

---

## License

MIT © [Explita](https://github.com/explita)
