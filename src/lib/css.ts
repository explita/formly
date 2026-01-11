export const css = `.explita-form .form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* gap-2 */
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-none */
  font-weight: 500; /* font-medium */
  user-select: none; /* select-none */
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
  font-size: 1rem; /* text-base */
  margin-left: -0.25rem; /* ml-1 */
}

/* Error state */
.explita-form .form-label[data-error="true"] {
  color: #ef4444; /* red-500 */
}

/* Input error state */
.explita-form [data-input-error="true"] {
  border-color: #ef4444 !important; /* red-500 */
  // outline: none !important;
  outline-color: #ef4444;
}
`;
