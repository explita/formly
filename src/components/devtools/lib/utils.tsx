import React from "react";

export const STORAGE_KEY = "__formly_devtools_state__";

// Helper to flatten nested object keys
export function getFlatPaths(obj: any, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [];
  return Object.keys(obj).reduce((acc: string[], key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      acc.push(path);
      acc.push(...getFlatPaths(obj[key], path));
    } else if (Array.isArray(obj[key])) {
      acc.push(path);
      obj[key].forEach((item: any, i: number) => {
        acc.push(`${path}.${i}`);
        acc.push(...getFlatPaths(item, `${path}.${i}`));
      });
    } else {
      acc.push(path);
    }
    return acc;
  }, []);
}

// Render inlined styles
export function renderStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      .formly-devtools-fab {
        position: fixed;
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: #ffffff;
        border: none;
        border-radius: 50px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      }
      .formly-devtools-fab:hover {
        transform: scale(1.06) translateY(-2px);
        box-shadow: 0 6px 24px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }
      .formly-devtools-fab.bottom-right { bottom: 20px; right: 20px; }
      .formly-devtools-fab.bottom-left { bottom: 20px; left: 20px; }
      .formly-devtools-fab.top-right { top: 20px; right: 20px; }
      .formly-devtools-fab.top-left { top: 20px; left: 20px; }

      .formly-devtools-badge {
        font-size: 11px;
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
      }
      
      .formly-devtools-panel {
        position: fixed;
        z-index: 99999;
        width: 380px;
        height: 520px;
        max-height: calc(100vh - 120px);
        background: rgba(15, 17, 23, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        color: #e2e8f0;
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .formly-devtools-panel.dragging {
        transition: none !important;
      }
      .formly-devtools-panel.bottom-right { bottom: 20px; right: 20px; }
      .formly-devtools-panel.bottom-left { bottom: 20px; left: 20px; }
      .formly-devtools-panel.top-right { top: 20px; right: 20px; }
      .formly-devtools-panel.top-left { top: 20px; left: 20px; }

      .formly-devtools-fab.boundary-parent {
        position: absolute !important;
      }
      .formly-devtools-panel.boundary-parent {
        position: absolute !important;
        max-height: calc(100% - 40px) !important;
      }

      .formly-devtools-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        cursor: move;
        user-select: none;
        white-space: nowrap;
      }
      .formly-devtools-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #ffffff;
      }
      .formly-devtools-dot {
        width: 8px;
        height: 8px;
        background-color: #10b981;
        border-radius: 50%;
        box-shadow: 0 0 8px #10b981;
      }
      .formly-devtools-close {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      .formly-devtools-close:hover {
        color: #ffffff;
      }

      .formly-devtools-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .formly-devtools-reset {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 15px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }
      .formly-devtools-reset:hover {
        color: #ffffff;
        transform: rotate(-45deg);
      }

      .formly-devtools-tabs {
        display: flex;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .formly-devtools-tab {
        flex: 1;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 12px;
        font-weight: 500;
        padding: 10px 0;
        cursor: pointer;
        transition: color 0.15s ease, background 0.15s ease;
        text-align: center;
      }
      .formly-devtools-tab:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.02);
      }
      .formly-devtools-tab.active {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 2px solid #6366f1;
      }

      .formly-devtools-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }
      .formly-devtools-pane {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .formly-devtools-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 12px;
      }
      .formly-devtools-section-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6366f1;
        font-weight: 700;
      }

      .formly-devtools-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .formly-devtools-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: rgba(255, 255, 255, 0.02);
        padding: 8px 12px;
        border-radius: 8px;
      }
      .formly-devtools-label {
        font-size: 10px;
        color: #94a3b8;
      }
      .formly-devtools-val {
        font-family: monospace;
        font-size: 12px;
        font-weight: 700;
      }
      .formly-devtools-val.true { color: #10b981; }
      .formly-devtools-val.false { color: #f43f5e; }
      .formly-devtools-val.step { color: #3b82f6; }

      .formly-devtools-empty {
        font-size: 12px;
        color: #64748b;
        font-style: italic;
        padding: 4px 0;
      }

      .formly-devtools-btn-group {
        display: flex;
        gap: 10px;
      }
      .formly-devtools-btn {
        flex: 1;
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
      }
      .formly-devtools-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.2);
      }
      .formly-devtools-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }
      .formly-devtools-btn.primary {
        background: #6366f1;
        border-color: #4f46e5;
      }
      .formly-devtools-btn.primary:hover {
        background: #4f46e5;
      }
      .formly-devtools-btn.secondary {
        background: #f43f5e;
        border-color: #e11d48;
      }
      .formly-devtools-btn.secondary:hover {
        background: #e11d48;
      }
      .formly-devtools-btn.block {
        width: 100%;
      }

      .formly-devtools-setter-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .formly-devtools-input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .formly-devtools-setter-label {
        font-size: 11px;
        color: #94a3b8;
      }
      .formly-devtools-setter-input {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        padding: 8px;
        color: #ffffff;
        font-family: monospace;
        font-size: 12px;
        outline: none;
      }
      .formly-devtools-setter-input:focus {
        border-color: #6366f1;
      }

      /* JSON Tree Viewer CSS */
      .formly-json-node {
        margin: 2px 0;
      }
      .formly-json-node-header {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        user-select: none;
        font-family: monospace;
        font-size: 12px;
        color: #cbd5e1;
      }
      .formly-json-arrow {
        display: inline-block;
        font-size: 8px;
        color: #94a3b8;
        transition: transform 0.15s ease;
      }
      .formly-json-arrow.expanded {
        transform: rotate(90deg);
      }
      .formly-json-key {
        color: #a5b4fc;
      }
      .formly-json-type {
        color: #64748b;
        font-size: 11px;
      }
      .formly-json-node-body {
        border-left: 1px dashed rgba(255, 255, 255, 0.12);
        margin-left: 6px;
        padding-left: 10px;
      }
      .formly-json-empty {
        color: #64748b;
        font-family: monospace;
        font-size: 11px;
        padding: 2px 0;
      }
      
      .formly-json-leaf {
        margin: 2px 0 2px 14px;
        font-family: monospace;
        font-size: 12px;
      }
      .formly-json-value {
        font-weight: 500;
      }
      .formly-json-value.string { color: #34d399; }
      .formly-json-value.number { color: #f43f5e; }
      .formly-json-value.boolean { color: #fbbf24; }
      .formly-json-value.undefined, .formly-json-value.object { color: #94a3b8; }

      /* Copy Actions CSS styling */
      .formly-json-actions {
        display: inline-flex;
        gap: 4px;
        margin-left: 8px;
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .formly-json-leaf:hover .formly-json-actions,
      .formly-json-node-header:hover .formly-json-actions {
        opacity: 1;
      }
      .formly-json-copy-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94a3b8;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        border-radius: 4px;
        padding: 1px 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        line-height: 1;
      }
      .formly-json-copy-btn:hover {
        background: #6366f1;
        border-color: #4f46e5;
        color: #ffffff;
      }
      .formly-json-copy-btn.copied {
        background: #10b981;
        border-color: #059669;
        color: #ffffff;
      }

      /* Custom Form Selector Dropdown CSS styling */
      .formly-devtools-select-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
        margin-left: 12px;
        max-width: 90px;
      }
      .formly-devtools-select {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #cbd5e1;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 11px;
        font-weight: 600;
        border-radius: 6px;
        padding: 2px 20px 2px 8px;
        cursor: pointer;
        outline: none;
        transition: all 0.15s ease;
        appearance: none;
        line-height: 1.4;
        max-width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .formly-devtools-select:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: #6366f1;
        color: #ffffff;
      }
      .formly-devtools-select:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
      }
      .formly-devtools-select-chevron {
        position: absolute;
        right: 8px;
        pointer-events: none;
        font-size: 7px;
        color: #64748b;
      }

      /* DevTools Footer styling */
      .formly-devtools-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        background: rgba(15, 17, 23, 0.98);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11px;
        color: #64748b;
        user-select: none;
      }
      .formly-devtools-footer-version {
        font-family: monospace;
        font-weight: 600;
        color: #475569;
      }
      .formly-devtools-footer-links {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .formly-devtools-footer-link {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #94a3b8;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .formly-devtools-footer-link:hover {
        color: #ffffff;
      }
      .formly-devtools-footer-link svg {
        opacity: 0.7;
        transition: opacity 0.15s ease;
      }
      .formly-devtools-footer-link:hover svg {
        opacity: 1;
      }
      .formly-devtools-footer-divider {
        color: rgba(255, 255, 255, 0.08);
      }

      /* Inspect button */
      .formly-devtools-inspect {
        background: none;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        border-radius: 6px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
        font-size: 12px;
      }
      .formly-devtools-inspect:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.25);
      }
      .formly-devtools-inspect.active {
        background: rgba(99, 102, 241, 0.2);
        color: #818cf8;
        border-color: #6366f1;
        box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
      }

      /* Inspector Banner */
      .formly-inspect-banner {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid #6366f1;
        color: #f8fafc;
        padding: 8px 16px;
        border-radius: 9999px;
        font-size: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 500;
        z-index: 999999;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(8px);
        pointer-events: auto;
      }
      .formly-inspect-banner-btn {
        background: #ef4444;
        border: none;
        color: white;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 600;
        cursor: pointer;
        margin-left: 8px;
        transition: background 0.15s ease;
      }
      .formly-inspect-banner-btn:hover {
        background: #dc2626;
      }

      /* Timeline tab styling */
      .timeline-pane {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-shrink: 0;
      }
      .formly-timeline-filter-bar {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 0 0 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
        margin-bottom: 10px;
      }
      .formly-timeline-search {
        flex: 1;
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 11px;
        color: #f8fafc;
        outline: none;
        transition: all 0.15s ease;
      }
      .formly-timeline-search:focus {
        border-color: #6366f1;
        background: rgba(15, 23, 42, 0.7);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }
      .formly-timeline-checkbox-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #94a3b8;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        font-weight: 500;
        transition: color 0.15s ease;
      }
      .formly-timeline-checkbox-label:hover {
        color: #ffffff;
      }
      .formly-timeline-checkbox {
        accent-color: #6366f1;
        cursor: pointer;
      }
      .formly-timeline-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .formly-timeline-count {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #94a3b8;
        padding: 1px 6px;
        border-radius: 9999px;
        font-size: 10px;
      }
      .formly-timeline-list-container {
        flex: 1;
        overflow-y: auto;
        padding-right: 4px;
        min-height: 0;
      }
      .formly-timeline-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-bottom: 24px;
      }
      .formly-timeline-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 8px;
        padding: 10px;
        transition: background 0.15s ease, border-color 0.15s ease;
      }
      .formly-timeline-item:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);
      }
      .formly-timeline-item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .formly-timeline-badge {
        font-size: 9px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 4px;
        text-transform: uppercase;
        font-family: monospace;
      }
      .formly-timeline-badge.init { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
      .formly-timeline-badge.value { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      .formly-timeline-badge.error-add { background: rgba(239, 68, 68, 0.2); color: #f87171; }
      .formly-timeline-badge.error-remove { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
      .formly-timeline-badge.step { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
      .formly-timeline-badge.submitting { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
      .formly-timeline-badge.validating { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
      .formly-timeline-time {
        font-size: 10px;
        color: #475569;
        font-family: monospace;
      }
      .formly-timeline-msg {
        font-size: 12px;
        color: #cbd5e1;
        word-break: break-all;
        line-height: 1.4;
      }
      .formly-timeline-item-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-top: 4px;
      }
      .formly-timeline-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }
      .formly-timeline-action-btn {
        background: none;
        border: none;
        color: #64748b;
        font-size: 10px;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        transition: all 0.15s ease;
      }
      .formly-timeline-action-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #ffffff;
      }
      .formly-timeline-action-btn.restore:hover {
        color: #38bdf8;
      }
      .formly-timeline-detail-view {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed rgba(255, 255, 255, 0.06);
        max-height: 150px;
        overflow-y: auto;
      }
      .formly-timeline-snapshot-title {
        font-size: 9px;
        color: #64748b;
        font-weight: 600;
        margin-bottom: 4px;
      }

      /* State (Import/Export) Tab styling */
      .state-pane {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-bottom: 12px;
        height: 100%;
      }
      .formly-state-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .formly-state-export-pre {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px;
        font-family: monospace;
        font-size: 11px;
        color: #38bdf8;
        max-height: 120px;
        overflow-y: auto;
        margin: 0;
      }
      .formly-state-import-textarea {
        width: 100%;
        height: 80px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px;
        color: #ffffff;
        font-family: monospace;
        font-size: 11px;
        resize: vertical;
        box-sizing: border-box;
      }
      .formly-state-import-textarea:focus {
        border-color: #6366f1;
        outline: none;
      }
      .formly-state-status {
        margin-top: 8px;
        font-size: 11px;
        padding: 6px 10px;
        border-radius: 6px;
        animation: fadeIn 0.15s ease-out;
      }
      .formly-state-status.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #f87171;
      }
      .formly-state-status.success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.2);
        color: #34d399;
      }
    `,
      }}
    />
  );
}
