"use client";

import type { CompBox } from "@/lib/regions";

interface ComponentBoxProps {
  box: CompBox;
  ink: string;
  layerId: string;
  isHovered: boolean;
  onOpen: (rect: { x: number; y: number; w: number; h: number }) => void;
  onHover: (hovered: boolean) => void;
}

export function ComponentBox({ box, ink, isHovered, onOpen, onHover }: ComponentBoxProps) {
  return (
    <g
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        const svgEl = (e.target as SVGElement).closest("svg");
        if (!svgEl) return;
        const ctm = svgEl.getScreenCTM();
        if (!ctm) return;
        const pt = svgEl.createSVGPoint();
        pt.x = box.x;
        pt.y = box.y;
        const screenPt = pt.matrixTransform(ctm);
        const pt2 = svgEl.createSVGPoint();
        pt2.x = box.x + box.w;
        pt2.y = box.y + box.h;
        const screenPt2 = pt2.matrixTransform(ctm);
        onOpen({
          x: screenPt.x,
          y: screenPt.y,
          w: screenPt2.x - screenPt.x,
          h: screenPt2.y - screenPt.y,
        });
      }}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={5}
        fill={ink}
        fillOpacity={isHovered ? 0.22 : 0.12}
        stroke={ink}
        strokeOpacity={isHovered ? 0.6 : 0.35}
        strokeWidth={1.5}
        style={{
          transition: "fill-opacity 0.2s, stroke-opacity 0.2s, transform 0.2s",
          transformOrigin: `${box.x + box.w / 2}px ${box.y + box.h / 2}px`,
          transform: isHovered ? "scale(1.04)" : "scale(1)",
        }}
      />
      <text
        x={box.x + box.w / 2}
        y={box.y + box.h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "var(--mono)",
          fontSize: Math.min(13, box.w / (box.comp.name.length * 0.55)),
          fontWeight: 500,
          fill: ink,
          opacity: isHovered ? 1 : 0.9,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {box.comp.name}
      </text>
    </g>
  );
}
