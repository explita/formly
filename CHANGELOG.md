# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-19

### Added

- **Interactive DevTools Inspector**: Added a zero-setup, floating interactive DevTools inspector that automatically mounts inside development environments. Includes:
  - Live nested value tree viewer and copy helper.
  - Live patch diffing payload representation (`getChanges()`).
  - Active validation errors, flat dirty path lists, touched trackers, metadata map, and dropdown loading states.
  - Interactive Action Panel to manually trigger validations, resets, step routing, or state overrides.
- **Cascading Dropdowns (`cascade`)**: Declarative selector relationships that automatically fetch and options-bind choices upon dependency updates with full TypeScript autocompletion.
- **Accidental Navigation Prevention (`preventUnload`)**: Option to automatically block page reloads, tab closures, and accidental browser route changes when the form has unsaved/dirty state.
- **Input Normalization & Auto-Formatters (`normalize`)**: Real-time value sanitization and formatting directly on user keystrokes (e.g. UPPERCASING, phone digit formatting, spacing, etc.).
- **Precise Delta Tracking (`getChanges`)**: Helper to extract and submit only modified fields compared to the initial payload, keeping API requests lightweight.
- **Wizard & Multi-Step Forms (`steps`)**: Multi-step configuration with native step-by-step layout tracking, step-level schema/custom validation, and navigation utilities (`nextStep`, `prevStep`, `currentStep`, etc.).
- **Auto-Keyed Dynamic Arrays**: Automatically generated parallel persistent unique keys (`keys` array) to avoid rendering bugs and enable smooth animation list transitions.
- **Live Playground**: Configured and deployed the examples website to [formly.explita.ng](https://formly.explita.ng) and linked it in the documentation.
- **Optional Zod Support**: Marked `zod` as an optional peer dependency, allowing developer setups to run without schema validations if desired.

### Fixed

- **React 19 StrictMode warnings**: Resolved "Cannot update component while rendering" errors in FormRegistry by deferring state updates with `setTimeout`
- **Computed field double-renders**: Fixed redundant initial render cycles during dependency subscription setup

### Changed

- **Zod to optional peer dependency** - Reduces bundle size for non-Zod users
- **FormRegistry state updates** - Deferred to macro-task queue for React 19 compat

## [0.1.4] - 2026-03-25

### Added

- **Accessibility & Testing**: Added `data-error` attribute to `FieldError` component to improve semantic structure and facilitate testing.

### Fixed

- Improved computed fields initialization to ensure dependency tracking is established correctly during the first render.
- Refined draft restoration logic when `persistKey` is provided.

## [0.1.3] - 2026-02-11

### Fixed

- **Internal Improvements**: Refined form state initialization and update logic for better stability.
- **Type Safety**: Improved type-safety for nested paths and form value access.
- **Maintenance**: Updated internal dependencies and cleaned up unused code.

## [0.1.2] - 2026-01-16

### Added

- **Field Arrays**: Full support for dynamic lists with a comprehensive API (`push`, `insert`, `remove`, `swap`, `move`, `moveUp`, `moveDown`, etc.).
- **Form persistence (Drafts)**: Built-in support for saving and restoring form progress locally using `persistKey`.
- **Computed Fields**: Support for fields that derive their value from other fields, including wildcard support for arrays (`array.*.field`).
- **Form Registry**: Ability to access and control any form instance globally by its unique ID.
- **Improved Performance**: Switched to a flat-state internal representation with precise pub/sub notifications to minimize re-renders.
- **Deep Path Utilities**: Enhanced handling of nested objects and arrays in form state.

### Changed

- Refactored internal state Management for better scalability and performance.
- Simplified `useForm` initialization logic.

## [0.1.1] - 2026-01-11

### Fixed

- Initial maintenance and stabilization improvements.

## [0.1.0] - 2026-01-11

### Added

- Initial release of `@explita/formly`.
- **Core Hooks**:
  - `useForm`: Core hook for form state management, validation, and submission.
  - `useField`: Hook for managing individual field state and interactions.
  - `useFormContext`: Hook for accessing form state within the `Form` provider.
  - `useFormById`: Utility hook to access a form instance globally by its ID.
- **Components**:
  - `Form`: Provider component for the form context.
  - `Field`: Declarative component for field management.
  - `FieldError`: Component for displaying field validation messages.
  - `FormSpy`: Component to monitor form state changes without triggering global re-renders.
  - `Label`: Accessible label component integrated with form field state.
- **Validation**:
  - First-class support for `zod` schema validation.
- **Features**:
  - Support for complex, nested data structures.
  - Optimized performance through precise subscription-based updates.
  - Fully type-safe API for form values, errors, and handlers.
