"use client";

import { useState, useRef } from "react";
import { GLOSSARY } from "@/data/glossary";

export function GlossaryChip({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const definition = GLOSSARY[term];

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 4,
          border: "1px solid var(--line)",
          background: "transparent",
          color: "var(--ink-3)",
          cursor: "default",
        }}
      >
        {term}
      </button>
      {open && definition && (
        <div
          className="glass"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            padding: "8px 12px",
            borderRadius: 8,
            width: 240,
            zIndex: 100,
            fontSize: 11,
            color: "var(--ink-2)",
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--c1)", marginBottom: 4 }}>{term}</div>
          {definition}
        </div>
      )}
    </span>
  );
}
