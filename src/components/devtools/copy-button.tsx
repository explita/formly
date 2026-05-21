import React, { useState } from "react";

export function CopyButton({
  text,
  title,
  label,
}: {
  text: string;
  title: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={handleCopy}
      className={`formly-json-copy-btn ${copied ? "copied" : ""}`}
      title={title}
    >
      {copied ? "copied" : label}
    </button>
  );
}
