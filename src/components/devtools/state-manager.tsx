import React, { useState, useEffect } from "react";
import { FormInstance } from "../../types/utils.js";
import { generateMockData } from "./lib/mock-generator.js";

interface StateManagerProps {
  form: FormInstance<any>;
}

export function DevToolsStateManager({ form }: StateManagerProps) {
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync import text with current values when tab is active (if desired, or leave it editable)
  const handleExportCopy = () => {
    try {
      const json = JSON.stringify(form.values, null, 2);
      navigator.clipboard.writeText(json);
      setCopied(true);
      setImportError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setImportError("Failed to copy state to clipboard");
    }
  };

  const handleFillMock = () => {
    try {
      const mocked = generateMockData(form.values);
      form.setValues(mocked);
      setImportSuccess(true);
      setImportError(null);
      setTimeout(() => form.validate(), 10);
      setTimeout(() => setImportSuccess(false), 2000);
    } catch (err) {
      setImportError("Failed to generate mock data");
    }
  };

  const handleImportApply = () => {
    if (!importText.trim()) {
      setImportError("Please enter valid JSON values");
      return;
    }
    try {
      const parsed = JSON.parse(importText);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Pasted JSON must be a key-value object");
      }
      form.setValues(parsed);
      setImportError(null);
      setImportSuccess(true);
      setTimeout(() => form.validate(), 10);
      setTimeout(() => setImportSuccess(false), 2000);
    } catch (err: any) {
      setImportError(err?.message || "Invalid JSON syntax. Please verify.");
    }
  };

  return (
    <div className="formly-devtools-pane state-pane">
      {/* Mock Data Generator */}
      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">
          Test Data Utilities
        </span>
        <p className="formly-devtools-section-desc">
          Automatically fill form inputs with relevant test values.
        </p>
        <button
          className="formly-devtools-btn primary formly-devtools-btn-block"
          onClick={handleFillMock}
        >
          ✨ Fill Mock Data
        </button>
      </div>

      {/* Copy / Export State */}
      <div className="formly-devtools-section">
        <div
          className="formly-state-section-header"
          style={{
            display: "flex",
            justifyContent: "between",
            alignItems: "center",
          }}
        >
          <span
            className="formly-devtools-section-title"
            style={{ flexGrow: 1, margin: 0 }}
          >
            Export State
          </span>
          <button
            className={`formly-json-copy-btn ${copied ? "copied" : ""}`}
            onClick={handleExportCopy}
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>
        <pre className="formly-state-export-pre">
          {JSON.stringify(form.values, null, 2)}
        </pre>
      </div>

      {/* Import / Hydrate State */}
      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">
          Import & Hydrate State
        </span>
        <p className="formly-devtools-section-desc">
          Paste a JSON object to instantly update all form fields.
        </p>

        {importError && (
          <div className="formly-state-status error">{importError}</div>
        )}
        {importSuccess && (
          <div className="formly-state-status success">
            ✓ State updated successfully!
          </div>
        )}
        <textarea
          className="formly-state-import-textarea"
          placeholder='{"name": "John Doe", "email": "john@example.com"}'
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value);
            setImportError(null);
          }}
        />
        <button
          className="formly-devtools-btn secondary formly-devtools-btn-block"
          onClick={handleImportApply}
          style={{ marginTop: "8px" }}
        >
          Hydrate Form Values
        </button>
      </div>
    </div>
  );
}
