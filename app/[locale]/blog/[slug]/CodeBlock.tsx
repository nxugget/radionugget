'use client';

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { synthwave84 } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language, children }: { language?: string; children: any }) {
  return (
    <SyntaxHighlighter
      style={synthwave84}
      language={language || "text"}
      PreTag="div"
      wrapLongLines
      customStyle={{
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      {String(children)}
    </SyntaxHighlighter>
  );
}
