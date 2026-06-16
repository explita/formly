---
sidebar_position: 11
title: Draft State & Persistence
---

# Draft Persistence & Unload Prevention

Formly includes built-in, zero-config hooks to safeguard user data, prevent accidental form loss during navigation, and generate clean delta patches for database updates.

---

## Zero-Config Draft Persistence

To save the form state automatically in the background, configure `id` or `persistKey` in your options. Formly will auto-save the values to `localStorage` and restore them when the page is reloaded or the tab is reopened.

```typescript
import { useForm } from "@explita/formly";

const form = useForm({
  id: "user-profile-editor", // Saves draft to localStorage under "user-profile-editor"
  defaultValues: { name: "", bio: "" },
  
  // Storage priorities:
  // If true (default), loads saved draft first. 
  // If false, ignores saved draft and uses defaultValues.
  savedFormFirst: true, 
});
```

---

## Page Unload Prevention

If a user accidentally clicks a link, closes a tab, or refreshes the page during a long form session, they lose their progress. By enabling `preventUnload: true`, Formly automatically monitors page close events and blocks them **only if the form is dirty**.

```typescript
const form = useForm({
  defaultValues: { name: "", bio: "" },
  preventUnload: true, // Triggers standard browser exit warnings if form has changes!
});
```

When the user submits the form or calls `form.reset()`, the dirty flags are cleared, allowing them to navigate away without prompt warnings.

---

## Patch Payload Diffing (`getChanges`)

When editing an existing database record, sending the entire form object back to your API creates unnecessary traffic and potential database write overrides. 

Formly provides a `getChanges()` helper that compares the current form state to the initial `defaultValues`, returning **only fields modified by the user**.

### Example: PATCH request on submit

```typescript
const form = useForm({
  // Load original database values
  defaultValues: userProfile, 
  
  onSubmit: async (values, ctx) => {
    // Extract only modified paths, e.g. { bio: "updated bio text" }
    const patchPayload = ctx.getChanges(); 
    
    if (Object.keys(patchPayload).length === 0) {
      console.log("No changes detected.");
      return;
    }
    
    // Send lightweight PATCH payload
    await api.patch(`/users/${userProfile.id}`, patchPayload);
  },
});
```

You can also fetch the patch payload programmatically at any time outside the submit callback using the instance method:

```typescript
const modifiedFields = form.getChanges();
```
