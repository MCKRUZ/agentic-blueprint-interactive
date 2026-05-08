"use client";

import { LAYERS } from "@/data/layers";
import type { MatrixCell } from "@/data/types";

const TIER_OPACITY: Record<string, number> = {
  critical: 1,
  moderate: 0.5,
  minimal: 0.15,
};

interface RelevanceStripProps {
  cells: MatrixCell[];
  onClickLayer: (layerId: string) => void;
}

export function RelevanceStrip({ cells, onClickLayer }: RelevanceStripProps) {
  const cellMap = new Map(cells.map((c) => [c.layerId, c]));

  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 24 }}>
      {LAYERS.map((layer) => {
        const cell = cellMap.get(layer.id);
        const tier = cell?.tier ?? "minimal";
        return (
          <button
            key={layer.id}
            onClick={() => onClickLayer(layer.id)}
            title={`${layer.name} — ${tier}`}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: layer.ink,
              opacity: TIER_OPACITY[tier],
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 2px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 600,
                color: "#fff",
                textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {layer.n} {layer.name.split("&")[0].trim()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
