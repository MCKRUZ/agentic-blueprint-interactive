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
      style={{ padding: "16px 20px", marginBottom: 12 }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: expanded ? 12 : 0, cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: layer.ink,
          }}
        >
          {layer.n}
        </span>
        <span style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500, flex: 1 }}>
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
            border: `1px solid ${TIER_COLORS[cell.tier]}`,
            color: TIER_COLORS[cell.tier],
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
            color: "var(--ink-4)",
            background: "transparent",
            border: "1px solid var(--line)",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          ATLAS →
        </button>
      </div>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
