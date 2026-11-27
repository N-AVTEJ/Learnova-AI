"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const KEYWORDS = new Set([
  "def",
  "return",
  "if",
  "else",
  "elif",
  "for",
  "while",
  "in",
  "import",
  "from",
  "as",
  "class",
  "const",
  "let",
  "var",
  "function",
  "async",
  "await",
  "try",
  "catch",
  "throw",
  "new",
  "export",
  "default",
  "true",
  "false",
  "null",
  "None",
  "True",
  "False",
  "interface",
  "type",
]);

function highlightLine(line: string) {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("#") || trimmed.startsWith("//")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  const tokens = line.split(/(\s+|[()[\]{}.,:;+-/*=<>!]+|"[^"]*"|'[^']*'|`[^`]*`)/g);
  return tokens.map((token, idx) => {
    if (!token) return null;
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith("`") && token.endsWith("`"))
    ) {
      return (
        <span key={idx} className="text-emerald-300">
          {token}
        </span>
      );
    }
    if (KEYWORDS.has(token)) {
      return (
        <span key={idx} className="text-purple-300 font-medium">
          {token}
        </span>
      );
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <span key={idx} className="text-amber-300">
          {token}
        </span>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className="my-3 overflow-hidden rounded-md border border-border-strong bg-[#070A14]">
      <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-3 py-1.5">
        <span className="text-caption font-mono text-muted-foreground">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed font-mono text-slate-200">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="table-row">
              <span className="table-cell select-none pr-4 text-right text-slate-600">
                {idx + 1}
              </span>
              <span className="table-cell">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function renderInlineText(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-xs text-purple-300 border border-border"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function MarkdownRenderer({ content }: { content: string }) {
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-body leading-relaxed">
      {segments.map((segment, idx) => {
        if (segment.startsWith("```") && segment.endsWith("```")) {
          const inner = segment.slice(3, -3);
          const firstNewline = inner.indexOf("\n");
          const language =
            firstNewline >= 0 ? inner.slice(0, firstNewline).trim() : "";
          const code =
            firstNewline >= 0 ? inner.slice(firstNewline + 1) : inner;
          return <CodeBlock key={idx} language={language} code={code} />;
        }

        const lines = segment.split("\n");
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lineIdx} className="pt-1 text-body font-semibold text-foreground">
                    {renderInlineText(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
                const text = trimmed.startsWith("## ") ? trimmed.slice(3) : trimmed.slice(2);
                return (
                  <h3 key={lineIdx} className="pt-1 text-h3 text-foreground">
                    {renderInlineText(text)}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={lineIdx} className="flex gap-2 pl-2">
                    <span className="text-purple-400">•</span>
                    <span>{renderInlineText(trimmed.slice(2))}</span>
                  </div>
                );
              }
              return <p key={lineIdx}>{renderInlineText(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}
