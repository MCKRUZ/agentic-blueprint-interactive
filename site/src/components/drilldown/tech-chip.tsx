"use client";

import { useState } from "react";
import { lookupTech } from "@/data/tech-catalog";

interface TechChipProps {
  label: string;
  ink: string;
}

export function TechChip({ label, ink }: TechChipProps) {
  const [expanded, setExpanded] = useState(false);
  const detail = lookupTech(label);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 4,
          border: `1px solid ${ink}33`,
          background: `${ink}0D`,
          color: ink,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
      {expanded && detail && (
        <div
          className="glass"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            padding: "14px 16px",
            borderRadius: 10,
            width: 300,
            zIndex: 100,
            animation: "techDetailIn 0.2s ease-out",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)" }}>Technology</span>
            <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", color: "var(--ink-4)", cursor: "pointer" }}>×</button>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "var(--ink)" }}>{detail.name}</h3>
          <p style={{ fontSize: 11, color: "var(--ink-2)", margin: "0 0 10px", lineHeight: 1.4 }}>{detail.blurb}</p>

          {detail.pros.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--c5)" }}>PROS</span>
              <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 11, color: "var(--ink-2)" }}>
                {detail.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {detail.cons.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--signal)" }}>CONS</span>
              <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 11, color: "var(--ink-2)" }}>
                {detail.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6 }}>
            <span style={{ fontFamily: "var(--mono)" }}>Best for:</span> {detail.best}
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>
            {detail.license} · {detail.maturity}
          </div>
        </div>
      )}
    </span>
  );
}
