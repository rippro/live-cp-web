"use client";

import { Check, Copy } from "lucide-react";
import { type ComponentPropsWithoutRef, type ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

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

function CopyablePre({ children, className, ...props }: ComponentPropsWithoutRef<"pre">) {
  const [copied, setCopied] = useState(false);
  const codeText = getTextContent(children).replace(/\n$/, "");

  function copyCode() {
    navigator.clipboard.writeText(codeText).then(() => {
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
      <pre className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}

export function MarkdownView({ source }: { source: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{ pre: CopyablePre }}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
