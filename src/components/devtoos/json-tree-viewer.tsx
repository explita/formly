import React, { useState } from "react";
import { CopyButton } from "./copy-button.js";

export function JsonTree({
  data,
  label,
  path = "",
}: {
  data: any;
  label?: string;
  path?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  const currentPath = label ? (path ? `${path}.${label}` : label) : path;

  if (typeof data !== "object" || data === null) {
    return (
      <div className="formly-json-leaf">
        {label && <span className="formly-json-key">{label}: </span>}
        <span className={`formly-json-value ${typeof data}`}>
          {JSON.stringify(data)}
        </span>
        <span className="formly-json-actions">
          {currentPath && (
            <CopyButton text={currentPath} title="Copy Path" label="path" />
          )}
          <CopyButton
            text={JSON.stringify(data)}
            title="Copy Value"
            label="val"
          />
        </span>
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);

  return (
    <div className="formly-json-node">
      <div
        className="formly-json-node-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`formly-json-arrow ${expanded ? "expanded" : ""}`}>
          ▶
        </span>
        {label && <span className="formly-json-key">{label}: </span>}
        <span className="formly-json-type">
          {isArray ? `Array(${keys.length})` : `Object {${keys.length}}`}
        </span>
        <span
          className="formly-json-actions"
          onClick={(e) => e.stopPropagation()}
        >
          {currentPath && (
            <CopyButton text={currentPath} title="Copy Path" label="path" />
          )}
          <CopyButton
            text={JSON.stringify(data, null, 2)}
            title="Copy JSON"
            label="json"
          />
        </span>
      </div>
      {expanded && (
        <div className="formly-json-node-body">
          {keys.length === 0 ? (
            <div className="formly-json-empty">{isArray ? "[]" : "{}"}</div>
          ) : (
            keys.map((key) => (
              <JsonTree
                key={key}
                label={key}
                data={data[key]}
                path={currentPath}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
