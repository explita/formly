import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { FormInstance } from "../../types/utils.js";
import { registry } from "../../lib/form-registry.js";
import { Footer } from "./footer.js";
import { getFlatPaths, renderStyles, STORAGE_KEY } from "./lib/utils.js";
import { readDraft, writeDraftImmediate } from "../../lib/drafts-helpter.js";
import { DevToolsFAB } from "./fab.js";
import type { DevToolsState, FormDevToolsProps } from "./types/index.js";

import { DevToolsInspector } from "./inspector.js";
import { DevToolsTimeline, TimelineEvent } from "./timeline.js";
import { DevToolsStateManager } from "./state-manager.js";
import { ValuesPane } from "./panes/values-pane.js";
import { ChangesPane } from "./panes/changes-pane.js";
import { StatePane } from "./panes/state-pane.js";
import { ActionsPane } from "./panes/actions-pane.js";

const tabs = [
  { label: "Values", id: "values" },
  { label: "Changes", id: "changes" },
  { label: "State", id: "state" },
  { label: "Timeline", id: "timeline" },
  { label: "JSON", id: "json" },
  { label: "Actions", id: "actions" },
] as const;

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
  boundary,
}: FormDevToolsProps) {
  // Automatically hide in production environments unless forceShow is true
  const isProd =
    ((typeof process !== "undefined" &&
      process.env.NODE_ENV === "production") ||
      // @ts-ignore
      (typeof import.meta !== "undefined" && import.meta.env?.PROD)) &&
    !(
      typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_IS_EXAMPLES === "true"
    );

  const [tick, setTick] = useState(0);

  // 🛡️ Multi-form single portal coordinator check:
  // Only the first mounted FormDevTools actually renders the floating button on the screen!
  useEffect(() => {
    if (typeof window !== "undefined") {
      const claimMount = () => {
        if (!(window as any).__FORMLY_DEVTOOLS_MOUNTED__) {
          (window as any).__FORMLY_DEVTOOLS_MOUNTED__ = use.id;
          setTick((t) => t + 1);
        }
      };

      claimMount();

      window.addEventListener("formly-devtools-mount-change", claimMount);

      return () => {
        window.removeEventListener("formly-devtools-mount-change", claimMount);
        if ((window as any).__FORMLY_DEVTOOLS_MOUNTED__ === use.id) {
          (window as any).__FORMLY_DEVTOOLS_MOUNTED__ = undefined;
          window.dispatchEvent(new CustomEvent("formly-devtools-mount-change"));
        }
      };
    }
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
    const getDevToolsForms = () => {
      return registry
        .getAll()
        .filter(([_, inst]) => (inst as any)._devToolsEnabled !== false);
    };
    setRegisteredForms(getDevToolsForms());
    const unsubscribe = registry.subscribe(() => {
      setRegisteredForms(getDevToolsForms());
    });
    return unsubscribe;
  }, []);

  const isFormSelectable = (id: string) => {
    if (!registry.has(id)) return false;
    const inst = registry.get(id);
    return (inst as any)?._devToolsEnabled !== false;
  };

  // Safe fallback if selectedFormId is unmounted or has devTools disabled
  const activeFormId = isFormSelectable(selectedFormId)
    ? selectedFormId
    : use.id;
  const form = (
    registry.has(activeFormId) ? registry.get(activeFormId) : use
  ) as FormInstance<any, any, any, any>;

  const [isOpen, setIsOpen] = useState(() => {
    if (initialState.isOpen !== undefined) {
      return initialState.isOpen;
    }
    return initialOpen;
  });
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>(
    () => {
      if (initialState.activeTab) {
        const isValid = tabs.some((t) => t.id === initialState.activeTab);
        if (isValid) {
          return initialState.activeTab as (typeof tabs)[number]["id"];
        }
      }
      return tabs[0].id;
    },
  );

  useEffect(() => {
    setStoredDevToolsState({ activeTab });
  }, [activeTab]);
  const [pathInput, setPathInput] = useState("");
  const [isInspecting, setIsInspecting] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
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
    minLeft: 0,
    maxLeft: 0,
    minTop: 0,
    maxTop: 0,
  });

  const currentPosRef = useRef({ x: 0, y: 0 });

  // FAB dragging & snapping support
  const [fabPlacement, setFabPlacement] = useState<
    "bottom-right" | "bottom-left" | "top-right" | "top-left"
  >(() => {
    return initialState.fabPlacement || initialPlacement;
  });

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

    // Clamp absolute position inside screen viewport or parent boundary
    const clampedLeft = Math.max(
      metrics.minLeft,
      Math.min(metrics.maxLeft, nextLeft),
    );
    const clampedTop = Math.max(
      metrics.minTop,
      Math.min(metrics.maxTop, nextTop),
    );

    const finalX = clampedLeft - metrics.baseLeft;
    const finalY = clampedTop - metrics.baseTop;

    // Direct DOM manipulation for buttery smooth GPU-accelerated movement (60+ FPS)
    panelRef.current.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;

    currentPosRef.current = { x: finalX, y: finalY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (panelRef.current) {
      panelRef.current.classList.remove("dragging");
    }
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
    if (panelRef.current) {
      panelRef.current.classList.add("dragging");
    }
    const rect = panelRef.current.getBoundingClientRect();
    const parent = panelRef.current.parentElement;
    const useParent = boundary === "parent" && parent;
    const parentRect = useParent ? parent.getBoundingClientRect() : null;

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
      minLeft: parentRect ? parentRect.left : 0,
      maxLeft: parentRect
        ? parentRect.right - rect.width
        : window.innerWidth - rect.width,
      minTop: parentRect ? parentRect.top : 0,
      maxTop: parentRect
        ? parentRect.bottom - rect.height
        : window.innerHeight - rect.height,
    };

    currentPosRef.current = { x: position.x, y: position.y };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  };

  const handleResetPosition = () => {
    setFabPlacement(initialPlacement);
    setPosition({ x: 0, y: 0 });
    setStoredDevToolsState({
      fabPlacement: initialPlacement,
      position: { x: 0, y: 0 },
    });
  };

  const findDiff = useCallback(
    (oldObj: any, newObj: any, path = ""): Record<string, any> => {
      const diff: Record<string, any> = {};
      if (
        !oldObj ||
        typeof oldObj !== "object" ||
        !newObj ||
        typeof newObj !== "object"
      ) {
        if (oldObj !== newObj) {
          diff[path] = newObj;
        }
        return diff;
      }
      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
      for (const key of allKeys) {
        const nextPath = path ? `${path}.${key}` : key;
        if (!(key in oldObj)) {
          diff[nextPath] = newObj[key];
        } else if (!(key in newObj)) {
          diff[nextPath] = undefined;
        } else if (
          typeof oldObj[key] === "object" &&
          typeof newObj[key] === "object"
        ) {
          Object.assign(diff, findDiff(oldObj[key], newObj[key], nextPath));
        } else if (oldObj[key] !== newObj[key]) {
          diff[nextPath] = newObj[key];
        }
      }
      return diff;
    },
    [],
  );

  const lastFormIdRef = useRef<string | null>(null);
  const lastStepRef = useRef<number>(0);
  const lastSubmittingRef = useRef<boolean>(false);
  const lastValidatingRef = useRef<boolean>(false);
  const lastErrorsRef = useRef<any>({});
  const lastValuesRef = useRef<any>(null);

  // Sync state reactively and record value modifications in timeline
  useEffect(() => {
    if (!form) return;

    const isNewForm = lastFormIdRef.current !== form.id;
    lastFormIdRef.current = form.id;

    if (isNewForm) {
      // Reset tracking refs for the current form instance
      lastStepRef.current = form.steps?.current ?? 0;
      lastSubmittingRef.current = form.submitting;
      lastValidatingRef.current = form.isValidating;
      lastErrorsRef.current = { ...form.errors };
      lastValuesRef.current = { ...form.values };

      // Record initialization event
      setTimeline([
        {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          type: "init",
          message: `DevTools attached to form: ${form.id || "unnamed"}`,
          data: { ...form.values },
        },
      ]);
    } else {
      if (lastValuesRef.current === null) {
        lastValuesRef.current = { ...form.values };
      }
      setTimeline((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: Math.random().toString(36).substring(7),
              timestamp: new Date().toLocaleTimeString(),
              type: "init",
              message: `DevTools attached to form: ${form.id || "unnamed"}`,
              data: { ...form.values },
            },
          ];
        }
        return prev;
      });
    }

    const unsubscribe = form.subscribe((values) => {
      // Force rerender
      setTick((t) => t + 1);

      // Diff check
      const diff = findDiff(lastValuesRef.current, values);
      lastValuesRef.current = { ...values };

      if (Object.keys(diff).length > 0) {
        setTimeline((prev) => [
          ...prev,
          ...Object.entries(diff).map(([key, val]) => ({
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toLocaleTimeString(),
            type: "value_change" as const,
            message: `Field updated: ${key} = ${JSON.stringify(val)}`,
            data: { ...values },
            field: key,
          })),
        ]);
      }
    });

    return unsubscribe;
  }, [form, findDiff]);

  // Monitor form state transitions (submitting, validating, errors, steps) for the timeline
  const currentStep = form.steps?.current ?? 0;
  const submitting = form.submitting;
  const validating = form.isValidating;
  const errors = form.errors;

  useEffect(() => {
    if (!form) return;

    // 1. Check Step
    if (currentStep !== lastStepRef.current) {
      setTimeline((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          type: "step_change" as const,
          message: `Moved to Step ${currentStep + 1}`,
          data: { ...form.values },
        },
      ]);
      lastStepRef.current = currentStep;
    }

    // 2. Check Submitting
    if (submitting !== lastSubmittingRef.current) {
      setTimeline((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          type: "submitting_change" as const,
          message: submitting
            ? "Form submission started"
            : "Form submission finished",
          data: { ...form.values },
        },
      ]);
      lastSubmittingRef.current = submitting;
    }

    // 3. Check Validating
    if (validating !== lastValidatingRef.current) {
      setTimeline((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          type: "validating_change" as const,
          message: validating
            ? "Async validation started"
            : "Async validation finished",
          data: { ...form.values },
        },
      ]);
      lastValidatingRef.current = validating;
    }

    // 4. Check Errors
    const errorDiff = findDiff(lastErrorsRef.current, errors);
    lastErrorsRef.current = { ...errors };
    if (Object.keys(errorDiff).length > 0) {
      setTimeline((prev) => [
        ...prev,
        ...Object.entries(errorDiff).map(([key, val]) => ({
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          type: val ? ("error_added" as const) : ("error_removed" as const),
          message: val
            ? `Error on '${key}': ${val}`
            : `Cleared error on '${key}'`,
          data: { ...form.values },
          field: key,
        })),
      ]);
    }
  }, [form, currentStep, submitting, validating, errors, findDiff]);

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

  // Keep panel within screen viewport on mount and window resize
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    const clampPanelPosition = () => {
      const panelWidth = 380;
      const panelHeight = panelRef.current
        ? panelRef.current.offsetHeight
        : 520;

      let baseLeft = 0;
      let baseTop = 0;

      if (fabPlacement === "bottom-right") {
        baseLeft = window.innerWidth - panelWidth - 20;
        baseTop = window.innerHeight - panelHeight - 20;
      } else if (fabPlacement === "bottom-left") {
        baseLeft = 20;
        baseTop = window.innerHeight - panelHeight - 20;
      } else if (fabPlacement === "top-right") {
        baseLeft = window.innerWidth - panelWidth - 20;
        baseTop = 20;
      } else {
        baseLeft = 20;
        baseTop = 20;
      }

      const actualLeft = baseLeft + position.x;
      const actualTop = baseTop + position.y;

      const minLeft = 0;
      const maxLeft = window.innerWidth - panelWidth;
      const minTop = 0;
      const maxTop = window.innerHeight - panelHeight;

      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, actualLeft));
      const clampedTop = Math.max(minTop, Math.min(maxTop, actualTop));

      const newX = clampedLeft - baseLeft;
      const newY = clampedTop - baseTop;

      if (newX !== position.x || newY !== position.y) {
        const nextPos = { x: newX, y: newY };
        setPosition(nextPos);
        setStoredDevToolsState({ position: nextPos });
      }
    };

    clampPanelPosition();
    window.addEventListener("resize", clampPanelPosition);
    return () => window.removeEventListener("resize", clampPanelPosition);
  }, [isOpen, fabPlacement, position.x, position.y]);

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

  const renderContent = () => {
    if (!isOpen) {
      return (
        <DevToolsFAB
          placement={fabPlacement}
          boundary={boundary}
          onPlacementChange={(placement) => {
            setFabPlacement(placement);
            setStoredDevToolsState({ fabPlacement: placement });
          }}
          onOpen={() => setIsOpen(true)}
        />
      );
    }

    return (
      <>
        {isInspecting && (
          <div
            className="formly-inspect-banner"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span>
              🔍 Inspect Mode Active: Hover/click form fields to view detail
            </span>
            <button
              className="formly-inspect-banner-btn"
              onClick={() => setIsInspecting(false)}
            >
              Cancel (Esc)
            </button>
          </div>
        )}

        <DevToolsInspector
          form={form}
          active={isInspecting}
          onClose={() => setIsInspecting(false)}
          onSelectField={(name) => {
            setPathInput(name);
            setActiveTab("actions");
          }}
        />

        <div
          ref={panelRef}
          className={`formly-devtools-panel ${fabPlacement} ${boundary === "parent" ? "boundary-parent" : ""}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            opacity: isInspecting ? 0.25 : 1,
            pointerEvents: isInspecting ? "none" : "auto",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
            }
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
            <div
              className="formly-devtools-actions"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                className={`formly-devtools-inspect ${isInspecting ? "active" : ""}`}
                onClick={() => setIsInspecting(!isInspecting)}
                title="Inspect DOM field element"
              >
                🔍
              </button>
              <button
                className="formly-devtools-reset"
                onClick={handleResetPosition}
                title="Reset Position"
              >
                ⟲
              </button>
              <button
                className="formly-devtools-close"
                onClick={() => setIsOpen(false)}
              >
                &times;
              </button>
            </div>
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
            {activeTab === "values" && <ValuesPane form={form} />}

            {activeTab === "changes" && <ChangesPane form={form} />}

            {activeTab === "state" && (
              <StatePane form={form} debugState={debugState} />
            )}

            {activeTab === "timeline" && (
              <DevToolsTimeline
                timeline={timeline}
                onClear={() => setTimeline([])}
                form={form}
              />
            )}

            {activeTab === "json" && <DevToolsStateManager form={form} />}

            {activeTab === "actions" && (
              <ActionsPane
                form={form}
                pathInput={pathInput}
                setPathInput={setPathInput}
                flatPaths={flatPaths}
                onCommitValue={() => setTick((t) => t + 1)}
              />
            )}
          </div>
          {/* Footer */}
          <Footer />
        </div>
      </>
    );
  };

  const content = renderContent();
  const shouldPortal = boundary !== "parent" && typeof document !== "undefined";

  return (
    <>
      {renderStyles()}
      {shouldPortal ? createPortal(content, document.body) : content}
    </>
  );
}
