---
sidebar_position: 4
title: Array Fields & Keys
---

# Array Fields & Keys

Formly provides a powerful list controller for dynamic arrays. It simplifies operations like appending, removing, and sorting list fields, and solves React's list rendering key dilemma automatically.

---

## Array Controller Methods

To manage a dynamic list of inputs, register it using `form.array("path")`:

```typescript
const todos = form.array("todos");
```

This returns an array controller that exposes the following methods:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `push` | `(item: any) => void` | Appends a new item to the end of the array. |
| `pop` | `() => void` | Removes the last item from the array. |
| `remove` | `(index: number | number[]) => void` | Removes an item or multiple items at the specified indices in a single batch update. |
| `update` | `(index: number, value: any) => void` | Overwrites the value of an item at a specific index. |
| `insert` | `(index: number, value: any) => void` | Inserts a new item at a specific index. |
| `move` | `(from: number, to: number) => void` | Moves an item from one index position to another (preserves its key). |
| `swap` | `(indexA: number, indexB: number) => void` | Swaps positions of two items in the array. |
| `clear` | `() => void` | Empties the entire array. |

---

## Auto-Keyed Dynamic Arrays

In React, lists require a stable, unique `key` prop for DOM reconciliation and transitions. 
* Using the list `index` as a key is a known anti-pattern that causes state leakage, input selection bugs, and ruins transition animations.
* Generating random keys on every render is even worse, as it forces the entire list of inputs to unmount and mount on every keystroke.

Formly resolves this by generating and maintaining a parallel array of **persistent, unique string keys** under `items.keys`. These keys are mapped `1:1` to your items, stay in sync through all mutations (`push`, `remove`, `move`, etc.), and are preserved for the lifespan of each item.

### Rendering Objects List

```tsx
const contacts = form.array("contacts");

return (
  <div>
    {contacts.value.map((contact, index) => (
      // Use contacts.keys[index] as the element key!
      <div key={contacts.keys[index]} className="contact-row">
        <form.Field
          name={`contacts.${index}.name`}
          label="Name"
          render={(props) => <input {...props} />}
        />
        <form.Field
          name={`contacts.${index}.phone`}
          label="Phone"
          render={(props) => <input {...props} />}
        />
        <button type="button" onClick={() => contacts.remove(index)}>
          Remove
        </button>
      </div>
    ))}

    <button type="button" onClick={() => contacts.push({ name: "", phone: "" })}>
      Add Contact
    </button>
  </div>
);
```

### Rendering Primitives List (e.g. `string[]`)

Formly arrays work exactly the same way for lists of simple primitive values (like tag lists):

```tsx
const tags = form.array("tags");

return (
  <div>
    {tags.value.map((tag, index) => (
      // Use the parallel key array for primitives!
      <div key={tags.keys[index]} className="tag-chip">
        <form.Field
          name={`tags.${index}`}
          label={`Tag ${index + 1}`}
          render={(props) => <input {...props} />}
        />
        <button type="button" onClick={() => tags.remove(index)}>
          Remove
        </button>
      </div>
    ))}

    <button type="button" onClick={() => tags.push("")}>
      Add Tag
    </button>
  </div>
);
```
---

## Batch Item Removal

You can delete multiple items from the array at once by passing an array of indices to `remove()`. Formly handles the index shifting under the hood automatically so you do not have to worry about shifting targets:

```tsx
const tags = form.array("tags");

// Batch delete the first, third, and fourth tags at once
const deleteSelectedTags = () => {
  tags.remove([0, 2, 3]);
};
```

---

## Why It's a Game-Changer

Because Formly's array keys are stable:
1. **React State Preservation**: Dragging items, sorting them, or inserting elements in the middle of a list will not trigger input re-mounts or reset internal native browser selections.
2. **Smooth Animations**: You can safely apply CSS transitions and Framer Motion layout animations to list items as they enter, exit, or shift order.
3. **Optimized Render Performance**: React only re-renders lists on a micro level, updating only the affected rows.
