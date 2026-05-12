"use client";

import { Check, Copy } from "lucide-react";
import { type ComponentPropsWithoutRef, type ReactNode, useState } from "react";

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return getTextContent(props.children);
  }
  return "";
}

interface CodeBlockProps extends ComponentPropsWithoutRef<"pre"> {
  code?: string;
}

export function CodeBlock({ code, children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const content = code ?? getTextContent(children).replace(/\n$/, "");
  const preClassName =
    className ??
    "rounded-lg bg-rp-800 border border-rp-border p-4 text-sm font-mono text-rp-300 overflow-x-auto whitespace-pre";

  function copyCode() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="markdown-code-block">
      <button
        type="button"
        className="markdown-code-copy"
        onClick={copyCode}
        aria-label="コードをコピー"
      >
        {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
      </button>
      <pre className={preClassName} {...props}>
        {code ?? children}
      </pre>
    </div>
  );
}
