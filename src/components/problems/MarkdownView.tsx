"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "@/components/ui/CodeBlock";

function CopyablePre({ children, className, ...props }: ComponentPropsWithoutRef<"pre">) {
  return (
    <CodeBlock className={className} {...props}>
      {children}
    </CodeBlock>
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
