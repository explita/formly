import React, { useState } from "react";
import { FormInstance } from "../../types/utils.js";
import { JsonTree } from "./json-tree-viewer.js";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type:
    | "init"
    | "value_change"
    | "error_added"
    | "error_removed"
    | "step_change"
    | "submitting_change"
    | "validating_change";
  message: string;
  data: any;
  field?: string;
}

interface DevToolsTimelineProps {
  timeline: TimelineEvent[];
  onClear: () => void;
  form: FormInstance<any>;
}

export function DevToolsTimeline({
  timeline,
  onClear,
  form,
}: DevToolsTimelineProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideComputed, setHideComputed] = useState(true);

  const debugState = form.debug ? form.debug() : null;
  const computedKeys = debugState ? Object.keys(debugState.computed || {}) : [];

  const filteredTimeline = timeline.filter((event) => {
    // 1. Hide computed changes
    const field = event.field;
    if (hideComputed && field) {
      const isComputed = computedKeys.some(
        (key) => field === key || field.startsWith(key + ".")
      );
      if (isComputed) return false;
    }
    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesMessage = event.message.toLowerCase().includes(q);
      const matchesType = event.type.toLowerCase().includes(q);
      return matchesMessage || matchesType;
    }
    return true;
  });

  const handleRestore = (event: TimelineEvent) => {
    if (event.data) {
      try {
        form.setValues(event.data);
      } catch (err) {
        console.error("Failed to restore form values:", err);
      }
    }
  };

  const getEventBadgeClass = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "init":
        return "formly-timeline-badge init";
      case "value_change":
        return "formly-timeline-badge value";
      case "error_added":
        return "formly-timeline-badge error-add";
      case "error_removed":
        return "formly-timeline-badge error-remove";
      case "step_change":
        return "formly-timeline-badge step";
      case "submitting_change":
        return "formly-timeline-badge submitting";
      case "validating_change":
        return "formly-timeline-badge validating";
      default:
        return "formly-timeline-badge";
    }
  };

  const getEventBadgeLabel = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "init":
        return "INIT";
      case "value_change":
        return "VALUE";
      case "error_added":
        return "ERR+";
      case "error_removed":
        return "ERR-";
      case "step_change":
        return "STEP";
      case "submitting_change":
        return "SUBMIT";
      case "validating_change":
        return "VALID";
      default:
        return "LOG";
    }
  };

  return (
    <div className="formly-devtools-pane timeline-pane">
      <div className="formly-devtools-section timeline-header">
        <div className="formly-timeline-info">
          <span className="formly-devtools-section-title">History Logs</span>
          <span className="formly-timeline-count">
            {filteredTimeline.length} of {timeline.length}
          </span>
        </div>
        <button
          className="formly-devtools-btn text-danger formly-btn-sm"
          onClick={onClear}
          disabled={timeline.length === 0}
        >
          Clear Logs
        </button>
      </div>

      {timeline.length > 0 && (
        <div className="formly-timeline-filter-bar">
          <input
            type="text"
            placeholder="Filter logs..."
            className="formly-timeline-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <label className="formly-timeline-checkbox-label">
            <input
              type="checkbox"
              className="formly-timeline-checkbox"
              checked={hideComputed}
              onChange={(e) => setHideComputed(e.target.checked)}
            />
            Hide Computed
          </label>
        </div>
      )}

      <div className="formly-timeline-list-container">
        {filteredTimeline.length === 0 ? (
          <div className="formly-devtools-empty">
            {timeline.length === 0
              ? "No events logged yet. Interact with the form to see updates!"
              : "No events match the active search/filters."}
          </div>
        ) : (
          <div className="formly-timeline-list">
            {filteredTimeline
              .slice()
              .reverse()
              .map((event) => {
                const isExpanded = expandedEventId === event.id;
                return (
                  <div key={event.id} className="formly-timeline-item">
                    <div className="formly-timeline-item-meta">
                      <span className={getEventBadgeClass(event.type)}>
                        {getEventBadgeLabel(event.type)}
                      </span>
                      <span className="formly-timeline-time">
                        {event.timestamp}
                      </span>
                    </div>

                    <div className="formly-timeline-item-content">
                      <div className="formly-timeline-msg">{event.message}</div>
                      <div className="formly-timeline-actions">
                        <button
                          className="formly-timeline-action-btn"
                          onClick={() =>
                            setExpandedEventId(isExpanded ? null : event.id)
                          }
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                        <button
                          className="formly-timeline-action-btn restore"
                          onClick={() => handleRestore(event)}
                          title="Restore form values to this snapshot"
                        >
                          Restore
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="formly-timeline-detail-view">
                        <div className="formly-timeline-snapshot-title">
                          Form Values Snapshot:
                        </div>
                        <JsonTree data={event.data} />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
