"use client";

import { REGIONS, computeCompBoxes } from "@/lib/regions";
import type { Layer } from "@/data/types";
import { ComponentBox } from "./component-box";

interface LayerRegionProps {
  layer: Layer;
  visible: boolean;
  onOpenLayer: (layerId: string) => void;
  onOpenComp: (layerId: string, compId: string, rect: { x: number; y: number; w: number; h: number }) => void;
  hoveredComp: string | null;
  onHoverComp: (id: string | null) => void;
}

export function LayerRegion({ layer, visible, onOpenLayer, onOpenComp, hoveredComp, onHoverComp }: LayerRegionProps) {
  const region = REGIONS[layer.id];
  if (!region) return null;

  const boxes = computeCompBoxes(region, layer.components);

  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <rect
        x={region.x}
        y={region.y}
        width={region.w}
        height={region.h}
        rx={4}
        fill="none"
        stroke="var(--line)"
        strokeWidth={1}
      />

      <text
        x={region.label === "top" ? region.x + region.w / 2 : region.x + 8}
        y={region.label === "top" ? region.y + 16 : region.y + region.h / 2}
        textAnchor={region.label === "top" ? "middle" : "start"}
        dominantBaseline={region.label === "top" ? "auto" : "middle"}
        style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", fill: "var(--ink-4)" }}
        className="pointer-events-none select-none"
      >
        {layer.n} {layer.name}
      </text>

      <text
        x={region.label === "top" ? region.x + region.w / 2 : region.x + 8}
        y={region.label === "top" ? region.y + 26 : region.y + region.h / 2 + 14}
        textAnchor={region.label === "top" ? "middle" : "start"}
        style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 9, fill: "var(--ink-4)", opacity: 0.6 }}
        className="pointer-events-none select-none"
      >
        {layer.tagline}
      </text>

      {boxes.map((box) => (
        <ComponentBox
          key={box.comp.id}
          box={box}
          ink={layer.ink}
          layerId={layer.id}
          isHovered={hoveredComp === box.comp.id}
          onOpen={(rect) => onOpenComp(layer.id, box.comp.id, rect)}
          onHover={(hovered) => onHoverComp(hovered ? box.comp.id : null)}
        />
      ))}
    </g>
  );
}
