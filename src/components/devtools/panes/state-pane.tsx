import React from "react";
import { FormInstance } from "../../../types/utils.js";
import { JsonTree } from "../json-tree-viewer.js";
import { nestFormValues } from "../../../lib/utils.js";

interface StatePaneProps {
  form: FormInstance<any>;
  debugState: any;
}

export function StatePane({ form, debugState }: StatePaneProps) {
  const wizard = form.steps as any;
  const errorsCount = Object.keys(form.errors).length;
  const dirtyCount = Object.keys(debugState.dirty || {}).length;
  const touchedCount = Object.keys(debugState.touched || {}).length;
  const computedCount = Object.keys(debugState.computed || {}).length;
  const cascadeCount = Object.keys(debugState.cascade || {}).length;

  return (
    <div className="formly-devtools-pane">
      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">Form Properties</span>
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
          {wizard?.total > 0 && (
            <div className="formly-devtools-cell">
              <span className="formly-devtools-label">Wizard Step</span>
              <span className="formly-devtools-val step">
                {wizard.current + 1} / {wizard.total}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">
          Errors ({errorsCount})
        </span>
        {errorsCount === 0 ? (
          <div className="formly-devtools-empty">No validation errors</div>
        ) : (
          <JsonTree data={nestFormValues(form.errors)} />
        )}
      </div>

      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">
          Dirty Fields ({dirtyCount})
        </span>
        {dirtyCount === 0 ? (
          <div className="formly-devtools-empty">No fields dirty</div>
        ) : (
          <JsonTree data={debugState.dirty} />
        )}
      </div>

      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">
          Touched Fields ({touchedCount})
        </span>
        {touchedCount === 0 ? (
          <div className="formly-devtools-empty">No fields touched</div>
        ) : (
          <JsonTree data={debugState.touched} />
        )}
      </div>

      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">
          Computed Fields ({computedCount})
        </span>
        {computedCount === 0 ? (
          <div className="formly-devtools-empty">No computed fields</div>
        ) : (
          <JsonTree data={debugState.computed} />
        )}
      </div>

      <div className="formly-devtools-section">
        <span className="formly-devtools-section-title">
          Cascading Dropdowns ({cascadeCount})
        </span>
        {cascadeCount === 0 ? (
          <div className="formly-devtools-empty">
            No cascading dropdowns configured
          </div>
        ) : (
          <JsonTree data={debugState.cascade} />
        )}
      </div>
    </div>
  );
}
