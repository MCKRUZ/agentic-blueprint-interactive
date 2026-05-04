"use client";

import { useState } from "react";
import { LAYERS } from "@/data/layers";
import { useAppStore } from "@/store/app-store";

export function IntroCard() {
  const openLayer = useAppStore((s) => s.openLayer);
  const [dismissed, setDismissed] = useState(false);

  if (openLayer || dismissed) return null;

  return (
    <div
      className="glass absolute"
      style={{
        top: 24,
        left: 24,
        width: 360,
        padding: "24px 28px",
        zIndex: 50,
        borderRadius: 14,
        animation: "dossierIn 0.5s ease-out",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          Field Atlas · Cross-Section
        </span>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: "none", border: "none", color: "var(--ink-4)", cursor: "pointer", fontSize: 16 }}
        >
          ×
        </button>
      </div>

      <h1
        style={{
          fontFamily: "var(--display)",
          fontSize: 22,
          fontWeight: 500,
          lineHeight: 1.3,
          color: "var(--ink)",
          margin: "0 0 12px",
        }}
      >
        How an agentic platform actually works.
      </h1>

      <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.5 }}>
        Explore the architecture layer by layer. Click any component to open its dossier.
        Use the scrubber below to reveal layers sequentially.
      </p>

      <div className="flex flex-wrap gap-2">
        {LAYERS.map((l) => (
          <div key={l.id} className="flex items-center gap-1.5">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: l.ink,
                display: "inline-block",
                boxShadow: `0 0 6px ${l.ink}`,
              }}
            />
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>
              {l.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
