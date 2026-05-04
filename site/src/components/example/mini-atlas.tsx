"use client";

import { LAYERS } from "@/data/layers";

interface MiniAtlasProps {
  activeLayer: string;
  activeComp: string;
}

export function MiniAtlas({ activeLayer, activeComp }: MiniAtlasProps) {
  const rowH = 40;
  const compW = 70;
  const compH = 24;
  const leftPad = 140;

  return (
    <svg viewBox={`0 0 720 ${LAYERS.length * rowH + 20}`} className="w-full">
      {LAYERS.map((layer, i) => {
        const isActive = layer.id === activeLayer;
        const y = 10 + i * rowH;

        return (
          <g key={layer.id} style={{ opacity: isActive ? 1 : 0.32, transition: "opacity 0.3s" }}>
            {isActive && (
              <rect x={0} y={y} width={720} height={rowH} rx={4}
                fill={layer.ink} fillOpacity={0.06} stroke={layer.ink} strokeOpacity={0.15} strokeWidth={1} />
            )}

            <text x={8} y={y + rowH / 2 + 3}
              style={{ fontFamily: "var(--mono)", fontSize: 8, fill: isActive ? layer.ink : "var(--ink-4)", letterSpacing: "0.1em" }}>
              {layer.n} {layer.name}
            </text>

            {layer.components.map((comp, ci) => {
              const isActiveComp = isActive && comp.id === activeComp;
              const cx = leftPad + ci * (compW + 4);
              return (
                <g key={comp.id}>
                  <rect
                    x={cx} y={y + 8} width={compW} height={compH} rx={3}
                    fill={isActiveComp ? layer.ink : layer.ink}
                    fillOpacity={isActiveComp ? 0.25 : 0.06}
                    stroke={layer.ink}
                    strokeOpacity={isActiveComp ? 0.7 : 0.15}
                    strokeWidth={isActiveComp ? 1.5 : 0.5}
                    style={isActiveComp ? { filter: `drop-shadow(0 0 6px ${layer.ink})` } : undefined}
                  />
                  <text
                    x={cx + compW / 2} y={y + 8 + compH / 2 + 3}
                    textAnchor="middle"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: Math.min(7, compW / (comp.name.length * 0.55)),
                      fill: isActiveComp ? layer.ink : "var(--ink-4)",
                    }}
                  >
                    {comp.name}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
