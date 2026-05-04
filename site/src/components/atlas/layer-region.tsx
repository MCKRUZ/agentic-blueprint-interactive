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
      {/* Region background fill */}
      <rect
        x={region.x}
        y={region.y}
        width={region.w}
        height={region.h}
        rx={6}
        fill={layer.ink}
        fillOpacity={0.06}
        stroke={layer.ink}
        strokeOpacity={0.25}
        strokeWidth={1}
      />

      {/* Layer label — positioned above the region */}
      <text
        x={region.label === "top" ? region.x + region.w / 2 : region.x + 4}
        y={region.y - 16}
        textAnchor={region.label === "top" ? "middle" : "start"}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fill: layer.ink,
        }}
        className="pointer-events-none select-none"
      >
        {layer.n} {layer.name}
      </text>

      {/* Tagline — just above the region */}
      <text
        x={region.label === "top" ? region.x + region.w / 2 : region.x + 4}
        y={region.y - 3}
        textAnchor={region.label === "top" ? "middle" : "start"}
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontSize: 12,
          fill: "var(--ink-3)",
          opacity: 0.7,
        }}
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
