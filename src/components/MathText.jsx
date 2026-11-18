import React, { useMemo } from "react";
import katex from "katex";

export default function MathText({ text = "", className = "" }) {
  const renderedHtml = useMemo(() => {
    if (!text) return "";
    // Divide por bloques $$...$$ o en línea $...$
    const tokens = String(text).split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);

    return tokens
      .map((token) => {
        if (token.startsWith("$$") && token.endsWith("$$")) {
          const math = token.slice(2, -2).trim();
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            return `<code>${math}</code>`;
          }
        }
        if (token.startsWith("$") && token.endsWith("$")) {
          const math = token.slice(1, -1).trim();
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return `<code>${math}</code>`;
          }
        }
        // Escapa HTML básico en texto plano y respeta saltos de línea
        return token
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>");
      })
      .join("");
  }, [text]);

  return (
    <div
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}