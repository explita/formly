import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { FormInstance } from "../../types/utils.js";

interface InspectorProps {
  form: FormInstance<any>;
  active: boolean;
  onClose: () => void;
  onSelectField: (fieldName: string) => void;
}

export function DevToolsInspector({
  form,
  active,
  onClose,
  onSelectField,
}: InspectorProps) {
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [fieldName, setFieldName] = useState<string | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      setHoveredRect(null);
      setFieldName(null);
      activeElementRef.current = null;
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Ensure the hovered element belongs to the current form
      const formEl = target.closest(`[data-form-id="${form.id}"]`);
      if (!formEl) {
        setHoveredRect(null);
        setFieldName(null);
        activeElementRef.current = null;
        return;
      }

      // Check if it's an input/interactive element or has a name
      const isInput =
        ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
        target.hasAttribute("name") ||
        target.hasAttribute("data-input-ref");

      if (!isInput) {
        // Try finding parent label or container first if target is child
        const parentInput = target.closest("input, select, textarea, [name]");
        if (parentInput && parentInput.closest(`[data-form-id="${form.id}"]`)) {
          const name = parentInput.getAttribute("name");
          if (name) {
            setHoveredRect(parentInput.getBoundingClientRect());
            setFieldName(name);
            activeElementRef.current = parentInput as HTMLElement;
            return;
          }
        }
        setHoveredRect(null);
        setFieldName(null);
        activeElementRef.current = null;
        return;
      }

      const name = target.getAttribute("name");
      if (name) {
        setHoveredRect(target.getBoundingClientRect());
        setFieldName(name);
        activeElementRef.current = target;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const formEl = target.closest(`[data-form-id="${form.id}"]`);
      if (!formEl) return;

      const interactiveInput = target.closest("input, select, textarea, [name]");
      if (interactiveInput) {
        const name = interactiveInput.getAttribute("name");
        if (name) {
          e.preventDefault();
          e.stopPropagation();
          onSelectField(name);
          onClose();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Global cursor crosshair style when inspecting
    document.body.style.cursor = "crosshair";

    document.addEventListener("mouseover", handleMouseOver, { capture: true });
    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("mouseover", handleMouseOver, { capture: true });
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [active, form.id, onClose, onSelectField]);

  if (!active || !hoveredRect || !fieldName) return null;

  // Retrieve field details
  const fieldValue = form.values[fieldName];
  const fieldError = form.errors[fieldName];
  const isDirty = form.isDirty(fieldName);
  const isTouched = form.isTouched(fieldName);

  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0;

  const style: React.CSSProperties = {
    position: "absolute",
    top: hoveredRect.top + scrollY,
    left: hoveredRect.left + scrollX,
    width: hoveredRect.width,
    height: hoveredRect.height,
    border: "2px dashed #6366f1",
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    pointerEvents: "none",
    zIndex: 999999,
    boxSizing: "border-box",
    borderRadius: "4px",
    transition: "all 0.1s ease-out",
  };

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    top: hoveredRect.top + scrollY - 32 < 0 ? hoveredRect.bottom + scrollY + 8 : hoveredRect.top + scrollY - 34,
    left: hoveredRect.left + scrollX,
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    zIndex: 999999,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    border: "1px solid #334155",
    display: "flex",
    gap: "6px",
    alignItems: "center",
  };

  return createPortal(
    <>
      <div style={style} />
      <div style={tooltipStyle}>
        <span style={{ color: "#818cf8", fontWeight: "bold" }}>{fieldName}</span>
        <span style={{ color: "#94a3b8" }}>|</span>
        <span>
          val:{" "}
          <span style={{ color: "#38bdf8" }}>
            {fieldValue === undefined
              ? "undefined"
              : typeof fieldValue === "object"
              ? JSON.stringify(fieldValue)
              : String(fieldValue)}
          </span>
        </span>
        {(isDirty || isTouched) && (
          <>
            <span style={{ color: "#94a3b8" }}>|</span>
            <span style={{ display: "flex", gap: "3px" }}>
              {isDirty && (
                <span
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#fbbf24",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    fontSize: "9px",
                  }}
                >
                  dirty
                </span>
              )}
              {isTouched && (
                <span
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#34d399",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    fontSize: "9px",
                  }}
                >
                  touched
                </span>
              )}
            </span>
          </>
        )}
        {fieldError && (
          <>
            <span style={{ color: "#94a3b8" }}>|</span>
            <span style={{ color: "#f87171", fontWeight: "medium" }}>
              err: {fieldError}
            </span>
          </>
        )}
      </div>
    </>,
    document.body,
  );
}
