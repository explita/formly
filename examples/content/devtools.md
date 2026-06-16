---
sidebar_position: 9
title: Form DevTools Inspector
---

# Form DevTools Inspector

Formly features a built-in, interactive Form DevTools suite. It automatically mounts inside the `<Form />` provider in development mode, requiring absolutely zero custom imports, loaders, or setup.

---

## Setup & Configuration

By default, the inspector is enabled and fixed to the viewport's bottom-right corner in development. You can configure, reposition, or disable it using props on the `<Form />` provider:

```tsx
import { Form, useForm } from "@explita/formly";

function MyPage() {
  const form = useForm({ defaultValues: { name: "" } });

  return (
    // 1. Default position is "bottom-right"
    <Form use={form}>
      {/* ... inputs ... */}
    </Form>

    // 2. Change default placement corner ("top-left" | "top-right" | "bottom-left" | "bottom-right")
    // <Form use={form} devTools="top-left">

    // 3. Disable DevTools completely
    // <Form use={form} devTools={false}>

    // 4. Bound inspector to parent element container instead of browser viewport
    // <Form use={form} devToolsBoundary="parent">
  );
}
```

---

## 🛠️ DevTools Control Room Features

The inspector window is split into five tabs to monitor, debug, and log form states:

### 1. Values Tab
* Displays a live, formatted JSON tree representing `form.values`.
* Includes a one-click **Copy JSON** button to easily grab current state snapshots.

### 2. Changes Tab
* Shows a live diff patch representation of `form.getChanges()`.
* Lists only fields modified by the user compared to the initial `defaultValues` (the exact PATCH payload).
* Includes a **Copy Changes** button for quick API testing.

### 3. State Tab
* Displays real-time boolean states: `submitting`, `validated`, `isValidating`, and active wizard step info.
* Shows active `errors` object, flat `dirty` paths list, and `touched` paths.
* Displays **Metadata Context Map** (`form.meta`) and **Cascading Dropdowns** loading states (`form.cascade`).

### 4. Actions Tab
* Interactively test form methods in real-time.
* Trigger full validations (`form.validate()`), reset fields (`form.reset()`), or change step indexes.
* Enter target paths (e.g. `contacts.0.name`) and submit mock values to test UI bindings instantly.

### 5. JSON Tab (Mocking & Import/Export)
* **✨ Fill Mock Data**: Automatically generates and populates the form with realistic test data in one click. Useful for quickly testing validation layouts, dynamic arrays, and form renders.
* **Export State**: Renders a formatted JSON string representing the current form state, copyable to the clipboard.
* **Import & Hydrate State**: Paste any raw JSON values object to instantly hydrate, merge, and validate values into the form fields.

### 6. Timeline Tab (Time-Travel Debugger)
* Chronologically logs all form events: `init`, `value_change`, `error_added`, `error_removed`, `step_change`, `submitting_change`, and `validating_change`.
* **View Details**: Expands an interactive JSON snapshot of the form values exactly as they were at that millisecond.
* **Filter/Search**: Search logs by text or check the **Hide Computed** box to ignore reactive computed changes.
* **Time Travel**: Click the **Restore** button on any log entry to instantly roll back or fast-forward the entire form values to that snapshot in time.

---

## 🎯 Element Picker (Visual Inspector Mode)

To inspect specific input elements, click the **Visual Picker Icon** (the cursor arrow icon) in the DevTools header:

1. **Crosshair Selection**: Cursor turns into a `crosshair` across the page.
2. **Dashed Bounding Highlights**: Hovering over form inputs (`INPUT`, `SELECT`, `TEXTAREA` or elements with `name`/`data-input-ref` belonging to the form) highlights them with a dashed bounding box.
3. **Floating Tooltip**: Displays real-time details next to the hovered input:
   * **Field Path**: The targeted path name (e.g. `contacts.0.phone`).
   * **Real-time Value**: The field's current state value.
   * **Status Badges**: Indicators showing if the field is `dirty` (yellow) or `touched` (green).
   * **Validation Errors**: Displays the active field-specific error message in red.
4. **Target Lock-in**: Clicking a highlighted element selects it inside the DevTools panel for immediate debugging and closes the crosshair picker.
5. **Escape Route**: Press the `Escape` key at any time to exit visual inspector mode.

---

## 🛩️ Touch-Draggable Snapping FAB

The DevTools Floating Action Button (FAB) is built for modern developer ergonomics:
* **Fully Draggable**: Grab the button and drag it anywhere on the viewport (or inside its parent container if `devToolsBoundary="parent"` is set). Works with both mouse and touch gestures.
* **Smart Corner Snapping**: When released, the button automatically snap-glides to the closest screen corner (`top-left`, `top-right`, `bottom-left`, or `bottom-right`) using smooth CSS spring animations.

---

## 🛡️ Production Optimization

You don't need to strip out DevTools configurations before pushing to production. 

The inspector logic check resolves `process.env.NODE_ENV === "production"`. When compiled, the bundler (Vite, Webpack, Turbopack) performs dead-code elimination, stripping the DevTools module from the bundle. It renders `null` in production, resulting in **zero bundle size overhead or runtime CPU/memory impact** for end users.
