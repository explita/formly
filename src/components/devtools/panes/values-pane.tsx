import React from "react";
import { FormInstance } from "../../../types/utils.js";
import { CopyButton } from "../copy-button.js";
import { JsonTree } from "../json-tree-viewer.js";

interface ValuesPaneProps {
  form: FormInstance<any>;
}

export function ValuesPane({ form }: ValuesPaneProps) {
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
          text={JSON.stringify(form.getValues(), null, 2)}
          title="Copy entire Form JSON"
          label="Copy entire JSON"
        />
      </div>
      <JsonTree data={form.getValues()} />
    </div>
  );
}
