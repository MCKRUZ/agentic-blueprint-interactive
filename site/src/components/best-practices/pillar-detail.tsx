"use client";

import { useRef, useState } from "react";
import type { Pillar } from "@/data/types";
import { RelevanceStrip } from "./relevance-strip";
import { LayerCellCard } from "./layer-cell-card";

interface PillarDetailProps {
  pillar: Pillar;
}

export function PillarDetail({ pillar }: PillarDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEng, setShowEng] = useState(false);

  const sortedCells = [...pillar.cells].sort((a, b) => {
    const order = { critical: 0, moderate: 1, minimal: 2 };
    return order[a.tier] - order[b.tier];
  });

  function scrollToLayer(layerId: string) {
    const el = scrollRef.current?.querySelector(`#cell-${layerId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ padding: "0 8px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>{pillar.icon}</span>
          <h2
            style={{
              fontFamily: "var(--display)",
              fontSize: 26,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {pillar.name}
          </h2>
        </div>
        <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.65 }}>
          {pillar.exec}
        </p>
        {pillar.eng && (
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
                padding: "8px 0 0",
                letterSpacing: "0.1em",
              }}
            >
              {showEng ? "▾ HIDE TECHNICAL OVERVIEW" : "▸ TECHNICAL OVERVIEW"}
            </button>
            {showEng && (
              <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.65, marginTop: 8 }}>
                {pillar.eng}
              </p>
            )}
          </>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--ink-4)",
            marginBottom: 8,
          }}
        >
          LAYER RELEVANCE
        </div>
        <RelevanceStrip cells={pillar.cells} onClickLayer={scrollToLayer} />
      </div>

      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--ink-4)",
            marginBottom: 12,
          }}
        >
          GUIDELINES BY LAYER
        </div>
        {sortedCells.map((cell) => (
          <LayerCellCard key={cell.layerId} cell={cell} />
        ))}
      </div>

      {pillar.citations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.2em",
              color: "var(--ink-4)",
              marginBottom: 8,
            }}
          >
            FRAMEWORKS & CITATIONS
          </div>
          <div className="flex flex-wrap gap-2">
            {pillar.citations.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid var(--line)",
                  color: "var(--ink-3)",
                  textDecoration: "none",
                }}
              >
                {c.label}
                <span style={{ color: "var(--ink-4)", marginLeft: 4, fontSize: 10 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
