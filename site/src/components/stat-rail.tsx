"use client";

import { LAYERS } from "@/data/layers";
import { PATTERNS } from "@/data/patterns";
import { useAppStore } from "@/store/app-store";

export function StatRail() {
  const view = useAppStore((s) => s.view);
  const totalComponents = LAYERS.reduce((sum, l) => sum + l.components.length, 0);

  return (
    <div
      className="flex items-center justify-center gap-4 py-1.5"
      style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.15em" }}
    >
      <span>{LAYERS.length} LAYERS</span>
      <span style={{ color: "var(--line-2)" }}>·</span>
      <span>{totalComponents} COMPONENTS</span>
      <span style={{ color: "var(--line-2)" }}>·</span>
      <span>{PATTERNS.length} TOPOLOGIES</span>
      <span style={{ color: "var(--line-2)" }}>·</span>
      <span style={{ color: "var(--c1)" }}>
        ✛ Live diagram · {view.toUpperCase()}
      </span>
    </div>
  );
}
