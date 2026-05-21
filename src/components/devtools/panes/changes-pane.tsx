import React from "react";
import { FormInstance } from "../../../types/utils.js";
import { CopyButton } from "../copy-button.js";
import { JsonTree } from "../json-tree-viewer.js";

interface ChangesPaneProps {
  form: FormInstance<any>;
}

export function ChangesPane({ form }: ChangesPaneProps) {
  const changes = form.getChanges();
  return (
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
          text={JSON.stringify(changes, null, 2)}
          title="Copy changes payload JSON"
          label="Copy Changes"
        />
      </div>
      {Object.keys(changes).length === 0 ? (
        <div
          className="formly-devtools-empty"
          style={{ padding: "24px 12px" }}
        >
          No changes made yet (form is pristine)
        </div>
      ) : (
        <JsonTree data={changes} />
      )}
    </div>
  );
}
