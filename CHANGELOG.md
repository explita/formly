# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
