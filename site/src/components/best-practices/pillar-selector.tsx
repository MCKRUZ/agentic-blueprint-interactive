"use client";

import type { Pillar } from "@/data/types";

interface PillarSelectorProps {
  pillars: Pillar[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function PillarSelector({ pillars, activeId, onSelect }: PillarSelectorProps) {
  return (
    <div className="flex flex-col gap-2" style={{ width: 240, flexShrink: 0 }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          letterSpacing: "0.2em",
          color: "var(--ink-4)",
          marginBottom: 4,
        }}
      >
        PRACTICE DOMAINS
      </div>
      {pillars.map((p) => {
        const isActive = activeId === p.id;
        const critical = p.cells.filter((c) => c.tier === "critical").length;
        const moderate = p.cells.filter((c) => c.tier === "moderate").length;
        const minimal = p.cells.filter((c) => c.tier === "minimal").length;
        const total = p.cells.length || 1;

        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="text-left px-3 py-2.5 rounded-md"
            style={{
              border: `1px solid ${isActive ? "var(--line-3)" : "var(--line)"}`,
              background: isActive ? "var(--glass-2)" : "transparent",
              color: isActive ? "var(--ink)" : "var(--ink-3)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 500 }}>
                {p.name}
              </span>
            </div>
            {/* Tier distribution bar */}
            <div
              style={{
                display: "flex",
                height: 3,
                borderRadius: 2,
                overflow: "hidden",
                marginTop: 8,
                background: "var(--line)",
              }}
            >
              <div style={{ width: `${(critical / total) * 100}%`, background: "var(--c1)" }} />
              <div style={{ width: `${(moderate / total) * 100}%`, background: "var(--c3)" }} />
              <div style={{ width: `${(minimal / total) * 100}%`, background: "var(--ink-4)" }} />
            </div>
          </button>
        );
      })}

      {/* Legend for spark bar colors */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 8,
          paddingLeft: 4,
        }}
      >
        <LegendDot color="var(--c1)" label="Critical" />
        <LegendDot color="var(--c3)" label="Moderate" />
        <LegendDot color="var(--ink-4)" label="Minimal" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.1em" }}>
        {label.toUpperCase()}
      </span>
    </div>
  );
}
