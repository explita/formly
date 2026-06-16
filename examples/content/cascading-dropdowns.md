---
sidebar_position: 8
title: Cascading Dropdowns
---

# Cascading Dropdowns

Cascading dropdowns define relationships where selecting an option in one select element dynamically loads the choices in a child select element (e.g. selecting a "Country" loads its "Cities").

Formly provides a declarative `cascade` configuration that automatically watches dependencies, runs async data loaders, and exposes option states with type safety.

---

## Defining Cascading Options

To configure cascading relations, pass the `cascade` option config to `useForm`:

```typescript
import { useForm } from "@explita/formly";

type Option = { value: string; label: string };

const form = useForm({
  defaultValues: {
    country: "",
    city: "",
  },
  cascade: {
    // Watch 'country' and load 'cities' reactively
    cities: {
      watch: ["country"],
      fn: async ([country]): Promise<Option[]> => {
        if (!country) return [];
        
        // Fetch from API
        const res = await fetch(`/api/countries/${country}/cities`);
        return await res.json();
      },
      onLoad: (cities) => {
        console.log("Cities loaded successfully:", cities);
      },
    },
  },
});
```

---

## Accessing Options State

Formly exposes option sets, loaders, and errors under `form.cascade`:

```typescript
const { data, isLoading, error } = form.cascade.cities;
// `data` is automatically typed as Option[]!
```

---

## Complete Example

```tsx
import React from "react";
import { Form, useForm } from "@explita/formly";

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
];

export default function BookingForm() {
  const form = useForm({
    defaultValues: { country: "", city: "" },
    cascade: {
      cities: {
        watch: ["country"],
        fn: async ([country]) => {
          if (!country) return [];
          
          // Mimic API delay
          await new Promise((r) => setTimeout(r, 600));
          
          if (country === "us") {
            return [
              { value: "nyc", label: "New York City" },
              { value: "la", label: "Los Angeles" },
            ];
          } else if (country === "ca") {
            return [
              { value: "tor", label: "Toronto" },
              { value: "van", label: "Vancouver" },
            ];
          }
          return [];
        },
      },
    },
    onSubmit: (values) => console.log("Booking submission:", values),
  });

  // Extract option array and loading flag
  const { data: cityOptions = [], isLoading: loadingCities } = form.cascade.cities;

  return (
    <Form use={form}>
      {/* Country Selector */}
      <form.Field
        name="country"
        label="Select Country"
        render={(props) => (
          <select {...props}>
            <option value="">-- Choose Country --</option>
            {countries.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        )}
      />

      {/* City Selector (Cascades from Country selection) */}
      <form.Field
        name="city"
        label="Select City"
        render={(props) => (
          <div style={{ marginTop: "1rem" }}>
            <select {...props} disabled={!form.values.country || loadingCities}>
              <option value="">
                {loadingCities ? "Loading cities..." : "-- Choose City --"}
              </option>
              {cityOptions.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            {loadingCities && <span style={{ marginLeft: "10px" }}>⏳</span>}
          </div>
        )}
      />

      <button type="submit" style={{ marginTop: "1.5rem" }} disabled={loadingCities}>
        Submit Booking
      </button>
    </Form>
  );
}
```

---

## Automatic Reset Behavior

When a watched dependency changes (e.g. the user changes Country from `United States` to `Canada`), Formly **automatically resets the dependent field value (`city`) back to its empty default values**. This prevents users from accidentally submitting invalid nested combinations (like Canadian cities with the United States country selected).
