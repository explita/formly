import React, { useState } from "react";
import { FormInstance } from "../../../types/utils.js";

interface ActionsPaneProps {
  form: FormInstance<any>;
  pathInput: string;
  setPathInput: (path: string) => void;
  flatPaths: string[];
  onCommitValue: () => void;
}

export function ActionsPane({
  form,
  pathInput,
  setPathInput,
  flatPaths,
  onCommitValue,
}: ActionsPaneProps) {
  const [valueInput, setValueInput] = useState("");
  const wizard = form.steps as any;

  const handleSetValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathInput) return;

    let parsedValue: any = valueInput;
    try {
      parsedValue = JSON.parse(valueInput);
    } catch {
      // Fallback as raw string
    }

    form.setValue(pathInput as any, parsedValue);
    onCommitValue();
  };

  return (
    <div className="formly-devtools-pane">
      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">Form Actions</span>
        <div className="formly-devtools-btn-group">
          <button
            className="formly-devtools-btn primary"
            onClick={() => {
              form.validate();
              onCommitValue();
            }}
            disabled={!(form as any).schema}
          >
            Validate
          </button>
          <button
            className="formly-devtools-btn success"
            onClick={() => {
              form.submit();
            }}
          >
            Submit
          </button>
          <button
            className="formly-devtools-btn secondary"
            onClick={() => {
              form.reset();
              onCommitValue();
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {wizard?.total > 0 && (
        <div className="formly-devtools-section">
          <span className="formly-devtools-section-title">
            Wizard Navigation
          </span>
          <div className="formly-devtools-btn-group">
            <button
              className="formly-devtools-btn"
              onClick={() => {
                wizard.prev();
                onCommitValue();
              }}
            >
              Prev Step
            </button>
            <button
              className="formly-devtools-btn"
              onClick={() => {
                wizard.next();
                onCommitValue();
              }}
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">Set Field Value</span>
        <form onSubmit={handleSetValue} className="formly-devtools-setter-form">
          <div className="formly-devtools-input-group">
            <label className="formly-devtools-setter-label">Field Path</label>
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

          <button type="submit" className="formly-devtools-btn primary block">
            Commit Value change
          </button>
        </form>
      </div>
    </div>
  );
}
