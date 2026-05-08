"use client";

import { useState } from "react";
import { LAYERS } from "@/data/layers";
import { useAppStore } from "@/store/app-store";
import type { MatrixCell } from "@/data/types";

const TIER_COLORS: Record<string, string> = {
  critical: "var(--c1)",
  moderate: "var(--c3)",
  minimal: "var(--ink-4)",
};

interface LayerCellCardProps {
  cell: MatrixCell;
}

export function LayerCellCard({ cell }: LayerCellCardProps) {
  const layer = LAYERS.find((l) => l.id === cell.layerId);
  const openDossier = useAppStore((s) => s.openDossier);
  const setView = useAppStore((s) => s.setView);
  const [expanded, setExpanded] = useState(cell.tier !== "minimal");

  if (!layer) return null;

  return (
    <div
      id={`cell-${cell.layerId}`}
      className="glass"
      style={{ marginBottom: 12, overflow: "hidden" }}
    >
      {/* Solid colored header bar using layer ink */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          cursor: "pointer",
          background: layer.ink,
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#fff",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {layer.n}
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            flex: 1,
            color: "#fff",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {layer.name}
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.3)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {cell.tier}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setView("atlas");
            setTimeout(() => openDossier(layer.id), 100);
          }}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "#fff",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: "pointer",
            letterSpacing: "0.1em",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          ATLAS →
        </button>
      </div>

      {/* Guidelines — indented below header */}
      {expanded && (
        <div style={{ padding: "14px 20px 16px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
          {cell.guidelines.map((g) => (
            <GuidelineItem key={g.id} guideline={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function GuidelineItem({ guideline }: { guideline: import("@/data/types").Guideline }) {
  const [showEng, setShowEng] = useState(false);

  return (
    <div style={{ paddingLeft: 12, borderLeft: "2px solid var(--line)" }}>
      <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, marginBottom: 4 }}>
        {guideline.text}
      </div>
      <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
        {guideline.exec}
      </div>
      {guideline.eng && (
        <>
          <button
            onClick={() => setShowEng(!showEng)}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-4)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              letterSpacing: "0.1em",
            }}
          >
            {showEng ? "▾ HIDE TECHNICAL" : "▸ TECHNICAL DETAIL"}
          </button>
          {showEng && (
            <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6, marginTop: 4 }}>
              {guideline.eng}
            </div>
          )}
        </>
      )}
    </div>
  );
}
