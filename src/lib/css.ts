export const css = `.explita-form {
  position: relative;
}
.explita-form .form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* gap-2 */
  font-size: 0.75rem; /* text-sm */
  line-height: 1.25rem; /* leading-none */
  font-weight: 600; /* font-medium */
  user-select: none; /* select-none */
  color: var(--formly-label-color, #334155); /* softened slate-700 instead of harsh black */
}

:is(.dark, [data-theme="dark"]) .explita-form .form-label {
  color: var(--formly-label-color, #cbd5e1); /* slate-300 */
}

/* Disabled group */
.explita-form .group[data-disabled="true"] .form-label {
  pointer-events: none;
  opacity: 0.5;
}

/* Disabled peer */
.explita-form .peer:disabled ~ .form-label {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Required field */
.explita-form .form-label[data-required="true"]::after {
  content: "*";
  color: #ef4444; /* Tailwind red-500 */
  font-size: 0.75rem;
  margin-left: -0.25rem;
}

/* Error state */
.explita-form .form-label[data-error="true"] {
  color: #ef4444; /* red-500 */
}

/* Form description / helper text */
.explita-form .form-description {
  display: block;
  font-size: 0.7125rem; /* ~13px text-xs+ */
  line-height: 1.25rem;
  color: var(--formly-description-color, #64748b); /* slate-500 */
  margin: 0 !important;
}

:is(.dark, [data-theme="dark"]) .explita-form .form-description {
  color: var(--formly-description-color, #94a3b8); /* slate-400 */
}

.explita-form .group[data-disabled="true"] .form-description,
.explita-form .peer:disabled ~ .form-description {
  opacity: 0.5;
}

/* Input error state */
.explita-form [data-input-error="true"] {
  border-color: #ef4444 !important; /* red-500 */
  outline-color: #ef4444;
}

/* Field Error messaging and animation */
.explita-form .field-error {
  color: #ef4444; /* red-500 */
  font-size: 0.75rem; /* text-xs */
  line-height: 1rem;
  margin-top: 0.25rem;
  animation: formly-slide-in 200ms ease-out forwards;
}

@keyframes formly-slide-in {
  from {
    opacity: 0;
    transform: translateY(-0.25rem); /* slide-in-from-top-1 (-4px) */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
