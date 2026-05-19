import React, { useState, useEffect, useRef, useCallback } from "react";
import { FormInstance } from "../../types/utils.js";
import { registry } from "../../lib/form-registry.js";
import { Footer } from "./footer.js";
import { CopyButton } from "./copy-button.js";
import { JsonTree } from "./json-tree-viewer.js";
import { getFlatPaths, renderStyles } from "./lib/utils.js";
import { readDraft, writeDraftImmediate } from "../../lib/drafts-helpter.js";

export type FormDevToolsProps = {
  use: FormInstance<any, any, any>;
  initialOpen?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  forceShow?: boolean;
};

const tabs = [
  { label: "Values", id: "values" },
  { label: "Changes", id: "changes" },
  { label: "State", id: "state" },
  { label: "Actions", id: "actions" },
] as const;

const STORAGE_KEY = "__formly_devtools_state__";

interface DevToolsState {
  position?: { x: number; y: number };
  isOpen?: boolean;
  selectedFormId?: string;
}

function getStoredDevToolsState(): DevToolsState {
  try {
    return (readDraft(STORAGE_KEY) as DevToolsState) || {};
  } catch {
    return {};
  }
}

function setStoredDevToolsState(state: Partial<DevToolsState>) {
  try {
    const existing = getStoredDevToolsState();
    writeDraftImmediate(STORAGE_KEY, { ...existing, ...state });
  } catch {
    // Ignore storage quota errors
  }
}

export function FormDevTools({
  use,
  initialOpen = false,
  position: initialPlacement = "bottom-right",
  forceShow = false,
}: FormDevToolsProps) {
  // Automatically hide in production environments unless forceShow is true
  const isProd =
    ((typeof process !== "undefined" && process.env.NODE_ENV === "production") ||
    // @ts-ignore
    (typeof import.meta !== "undefined" && import.meta.env?.PROD)) &&
    !(typeof process !== "undefined" && process.env.NEXT_PUBLIC_IS_EXAMPLES === "true");

  const [tick, setTick] = useState(0);

  // 🛡️ Multi-form single portal coordinator check:
  // Only the first mounted FormDevTools actually renders the floating button on the screen!
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!(window as any).__FORMLY_DEVTOOLS_MOUNTED__) {
        (window as any).__FORMLY_DEVTOOLS_MOUNTED__ = use.id;
        // trigger render so it manifests
        setTick((t) => t + 1);
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        if ((window as any).__FORMLY_DEVTOOLS_MOUNTED__ === use.id) {
          (window as any).__FORMLY_DEVTOOLS_MOUNTED__ = undefined;
        }
      }
    };
  }, [use.id]);

  const isMountedInstance =
    typeof window !== "undefined" &&
    (window as any).__FORMLY_DEVTOOLS_MOUNTED__ === use.id;

  // Load initial state from storage
  const [initialState] = useState(() => getStoredDevToolsState());

  const [selectedFormId, setSelectedFormId] = useState<string>(() => {
    return initialState.selectedFormId || use.id;
  });
  const [registeredForms, setRegisteredForms] = useState<
    Array<[string, FormInstance<any>]>
  >([]);

  useEffect(() => {
    setRegisteredForms(registry.getAll());
    const unsubscribe = registry.subscribe(() => {
      setRegisteredForms(registry.getAll());
    });
    return unsubscribe;
  }, []);

  // Safe fallback if selectedFormId is unmounted
  const activeFormId = registry.has(selectedFormId) ? selectedFormId : use.id;
  const form = (
    registry.has(activeFormId) ? registry.get(activeFormId) : use
  ) as FormInstance<any, any, any>;

  const [isOpen, setIsOpen] = useState(() => {
    if (initialState.isOpen !== undefined) {
      return initialState.isOpen;
    }
    return initialOpen;
  });
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>(
    tabs[0].id,
  );
  const [pathInput, setPathInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  // Draggable movement support
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    return initialState.position || { x: 0, y: 0 };
  });
  const isDragging = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const dragMetrics = useRef({
    width: 0,
    height: 0,
    baseLeft: 0,
    baseTop: 0,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  });

  const currentPosRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !panelRef.current) return;

    const metrics = dragMetrics.current;

    // Calculate new position relative to the starting position
    const deltaX = e.clientX - metrics.startX;
    const deltaY = e.clientY - metrics.startY;

    const newX = metrics.startPosX + deltaX;
    const newY = metrics.startPosY + deltaY;

    // Absolute position after translation
    const nextLeft = metrics.baseLeft + newX;
    const nextTop = metrics.baseTop + newY;

    // Clamp absolute position inside screen viewport
    const clampedLeft = Math.max(
      0,
      Math.min(window.innerWidth - metrics.width, nextLeft),
    );
    const clampedTop = Math.max(
      0,
      Math.min(window.innerHeight - metrics.height, nextTop),
    );

    const finalX = clampedLeft - metrics.baseLeft;
    const finalY = clampedTop - metrics.baseTop;

    // Direct DOM manipulation for buttery smooth GPU-accelerated movement (60+ FPS)
    panelRef.current.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;

    currentPosRef.current = { x: finalX, y: finalY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // Commit final position to React state once at the end of the drag gesture
    setPosition(currentPosRef.current);
    setStoredDevToolsState({ position: currentPosRef.current });
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select")
    )
      return;

    if (!panelRef.current) return;

    isDragging.current = true;
    const rect = panelRef.current.getBoundingClientRect();

    // Cache all layout dimensions and calculations on mousedown to prevent high-frequency reflows
    dragMetrics.current = {
      width: rect.width,
      height: rect.height,
      baseLeft: rect.left - position.x,
      baseTop: rect.top - position.y,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };

    currentPosRef.current = { x: position.x, y: position.y };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  };

  // Sync state reactively
  useEffect(() => {
    const unsubscribe = form.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, [form]);

  // Periodic poll to capture state changes not sent through value pub-sub (like submitting/validating)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Persist isOpen state
  useEffect(() => {
    setStoredDevToolsState({ isOpen });
  }, [isOpen]);

  // Persist selectedFormId state
  useEffect(() => {
    if (selectedFormId) {
      setStoredDevToolsState({ selectedFormId });
    }
  }, [selectedFormId]);

  if (isProd && !forceShow) {
    return null;
  }

  if (!isMountedInstance) {
    return null;
  }

  const debugState = form.debug();
  const computedKeys = Object.keys(debugState.computed || {});
  const flatPaths = getFlatPaths(form.getValues()).filter((p) => {
    return !computedKeys.some((key) => p === key || p.startsWith(key + "."));
  });

  const handleSetValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathInput) return;

    let parsedValue: any = valueInput;
    try {
      // Try parsing as JSON (for numbers, booleans, objects, arrays)
      parsedValue = JSON.parse(valueInput);
    } catch {
      // Fallback as raw string
    }

    form.setValue(pathInput as any, parsedValue);
    setTick((t) => t + 1);
  };

  if (!isOpen) {
    return (
      <>
        {renderStyles()}
        <button
          className={`formly-devtools-fab ${initialPlacement}`}
          onClick={() => setIsOpen(true)}
          title="Open Formly DevTools"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="formly-devtools-badge">DevTools</span>
        </button>
      </>
    );
  }

  return (
    <>
      {renderStyles()}
      <div
        ref={panelRef}
        className={`formly-devtools-panel ${initialPlacement}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {/* Header */}
        <div className="formly-devtools-header" onMouseDown={handleMouseDown}>
          <div className="formly-devtools-title">
            <span className="formly-devtools-dot" />
            <strong>Formly DevTools</strong>
            {registeredForms.length > 1 && (
              <div
                className="formly-devtools-select-wrapper"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <select
                  className="formly-devtools-select"
                  value={form.id}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                >
                  {registeredForms.map(([id]) => (
                    <option
                      key={id}
                      value={id}
                      style={{ background: "#1e293b", color: "#ffffff" }}
                    >
                      {id}
                    </option>
                  ))}
                </select>
                <span className="formly-devtools-select-chevron">▼</span>
              </div>
            )}
          </div>
          <button
            className="formly-devtools-close"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="formly-devtools-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`formly-devtools-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="formly-devtools-content">
          {activeTab === "values" && (
            <div
              className="formly-devtools-pane"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "12px",
                  zIndex: 20,
                }}
              >
                <CopyButton
                  text={JSON.stringify(form.getValues(), null, 2)}
                  title="Copy entire Form JSON"
                  label="Copy entire JSON"
                />
              </div>
              <JsonTree data={form.getValues()} />
            </div>
          )}

          {activeTab === "changes" && (
            <div
              className="formly-devtools-pane"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "12px",
                  zIndex: 20,
                }}
              >
                <CopyButton
                  text={JSON.stringify(form.getChanges(), null, 2)}
                  title="Copy changes payload JSON"
                  label="Copy Changes"
                />
              </div>
              {Object.keys(form.getChanges()).length === 0 ? (
                <div
                  className="formly-devtools-empty"
                  style={{ padding: "24px 12px" }}
                >
                  No changes made yet (form is pristine)
                </div>
              ) : (
                <JsonTree data={form.getChanges()} />
              )}
            </div>
          )}

          {activeTab === "state" && (
            <div className="formly-devtools-pane">
              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Form Properties
                </span>
                <div className="formly-devtools-grid">
                  <div className="formly-devtools-cell">
                    <span className="formly-devtools-label">Submitting</span>
                    <span
                      className={`formly-devtools-val ${form.submitting ? "true" : "false"}`}
                    >
                      {form.submitting ? "TRUE" : "FALSE"}
                    </span>
                  </div>
                  <div className="formly-devtools-cell">
                    <span className="formly-devtools-label">Validated</span>
                    <span
                      className={`formly-devtools-val ${form.validated ? "true" : "false"}`}
                    >
                      {form.validated ? "TRUE" : "FALSE"}
                    </span>
                  </div>
                  <div className="formly-devtools-cell">
                    <span className="formly-devtools-label">Validating</span>
                    <span
                      className={`formly-devtools-val ${form.isValidating ? "true" : "false"}`}
                    >
                      {form.isValidating ? "TRUE" : "FALSE"}
                    </span>
                  </div>
                  {(form.steps as any)?.total > 0 && (
                    <div className="formly-devtools-cell">
                      <span className="formly-devtools-label">Wizard Step</span>
                      <span className="formly-devtools-val step">
                        {(form.steps as any).current + 1} /{" "}
                        {(form.steps as any).total}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Errors ({Object.keys(form.errors).length})
                </span>
                {Object.keys(form.errors).length === 0 ? (
                  <div className="formly-devtools-empty">
                    No validation errors
                  </div>
                ) : (
                  <JsonTree data={form.errors} />
                )}
              </div>

              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Dirty Fields ({Object.keys(debugState.dirty).length})
                </span>
                {Object.keys(debugState.dirty).length === 0 ? (
                  <div className="formly-devtools-empty">No fields dirty</div>
                ) : (
                  <JsonTree data={debugState.dirty} />
                )}
              </div>

              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Touched Fields ({Object.keys(debugState.touched).length})
                </span>
                {Object.keys(debugState.touched).length === 0 ? (
                  <div className="formly-devtools-empty">No fields touched</div>
                ) : (
                  <JsonTree data={debugState.touched} />
                )}
              </div>

              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Metadata Context (
                  {Object.keys((debugState as any).meta || {}).length})
                </span>
                {Object.keys((debugState as any).meta || {}).length === 0 ? (
                  <div className="formly-devtools-empty">
                    No metadata stored
                  </div>
                ) : (
                  <JsonTree data={(debugState as any).meta} />
                )}
              </div>

              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Cascading Dropdowns (
                  {Object.keys((debugState as any).cascade || {}).length})
                </span>
                {Object.keys((debugState as any).cascade || {}).length === 0 ? (
                  <div className="formly-devtools-empty">
                    No cascading dropdowns configured
                  </div>
                ) : (
                  <JsonTree data={(debugState as any).cascade} />
                )}
              </div>
            </div>
          )}

          {activeTab === "actions" && (
            <div className="formly-devtools-pane">
              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Form Actions
                </span>
                <div className="formly-devtools-btn-group">
                  <button
                    className="formly-devtools-btn primary"
                    onClick={() => form.validate()}
                  >
                    Trigger Validate
                  </button>
                  <button
                    className="formly-devtools-btn secondary"
                    onClick={() => form.reset()}
                  >
                    Reset Form
                  </button>
                </div>
              </div>

              {(form.steps as any)?.total > 0 && (
                <div className="formly-devtools-section">
                  <span className="formly-devtools-section-title">
                    Wizard Navigation
                  </span>
                  <div className="formly-devtools-btn-group">
                    <button
                      className="formly-devtools-btn"
                      onClick={() => (form.steps as any).prev()}
                    >
                      Prev Step
                    </button>
                    <button
                      className="formly-devtools-btn"
                      onClick={() => (form.steps as any).next()}
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              <div className="formly-devtools-section">
                <span className="formly-devtools-section-title">
                  Set Field Value
                </span>
                <form
                  onSubmit={handleSetValue}
                  className="formly-devtools-setter-form"
                >
                  <div className="formly-devtools-input-group">
                    <label className="formly-devtools-setter-label">
                      Field Path
                    </label>
                    <input
                      className="formly-devtools-setter-input"
                      list="formly-paths"
                      placeholder="e.g. username"
                      value={pathInput}
                      onChange={(e) => setPathInput(e.target.value)}
                      required
                    />
                    <datalist id="formly-paths">
                      {flatPaths.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>

                  <div className="formly-devtools-input-group">
                    <label className="formly-devtools-setter-label">
                      Value (JSON parsed)
                    </label>
                    <input
                      className="formly-devtools-setter-input"
                      placeholder="e.g. 'Jane' or 123 or true"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="formly-devtools-btn primary block"
                  >
                    Commit Value change
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
