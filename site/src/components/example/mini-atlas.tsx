"use client";

import { LAYERS } from "@/data/layers";

interface MiniAtlasProps {
  activeLayer: string;
  activeComp: string;
}

const MINI_W = 720;
const PAD_X = 32;
const PAD_Y = 28;
const LABEL_W = 132;
const STRIP_X = PAD_X + LABEL_W + 8;
const STRIP_W = MINI_W - STRIP_X - PAD_X;
const CHIP_GAP = 6;

export function MiniAtlas({ activeLayer, activeComp }: MiniAtlasProps) {
  const rowH = (460 - PAD_Y * 2) / LAYERS.length;

  return (
    <svg
      viewBox={`0 0 ${MINI_W} 460`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      style={{ display: "block" }}
    >
      <defs>
        <filter id="ex-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="ex-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(120,120,180,0.06)" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={MINI_W} height={460} fill="url(#ex-grid)" />

      <rect
        x={PAD_X - 8} y={PAD_Y - 8}
        width={MINI_W - (PAD_X - 8) * 2}
        height={460 - (PAD_Y - 8) * 2}
        fill="none"
        stroke="rgba(167,139,250,0.12)"
        strokeWidth="1"
      />

      {LAYERS.map((layer, i) => {
        const y = PAD_Y + i * rowH;
        const isActive = layer.id === activeLayer;
        const chipW = (STRIP_W - CHIP_GAP * (layer.components.length - 1)) / layer.components.length;
        const chipH = rowH - 12;

        return (
          <g key={layer.id} style={{ opacity: isActive ? 1 : 0.32, transition: "opacity 360ms" }}>
            {isActive && (
              <rect
                x={PAD_X - 4} y={y + 2}
                width={MINI_W - (PAD_X - 4) * 2}
                height={rowH - 4}
                fill={layer.ink} fillOpacity={0.06}
                stroke={layer.ink} strokeOpacity={0.45}
                strokeWidth={1}
              />
            )}

            <text
              x={PAD_X} y={y + rowH / 2 - 4}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "2px",
                fill: isActive ? layer.ink : "var(--ink-3)",
              }}
            >
              {layer.n}
            </text>
            <text
              x={PAD_X} y={y + rowH / 2 + 8}
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontSize: 13,
                fill: isActive ? "var(--ink)" : "var(--ink-3)",
              }}
            >
              {layer.name}
            </text>

            {layer.components.map((comp, j) => {
              const cx = STRIP_X + j * (chipW + CHIP_GAP);
              const cy = y + 6;
              const isActiveComp = isActive && comp.id === activeComp;

              return (
                <g key={comp.id}>
                  <rect
                    x={cx} y={cy}
                    width={chipW} height={chipH}
                    rx={2}
                    fill={isActiveComp ? layer.ink : "transparent"}
                    fillOpacity={isActiveComp ? 0.18 : 0}
                    stroke={isActiveComp ? layer.ink : "var(--line)"}
                    strokeWidth={isActiveComp ? 1.4 : 0.8}
                    filter={isActiveComp ? "url(#ex-glow)" : undefined}
                  />
                  {isActiveComp && (
                    <circle cx={cx + 8} cy={cy + chipH / 2} r={2.5} fill={layer.ink}>
                      <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <text
                    x={cx + (isActiveComp ? 16 : 6)}
                    y={cy + chipH / 2 + 3}
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: 9.5,
                      fill: isActiveComp ? "var(--ink)" : "var(--ink-3)",
                      fontWeight: isActiveComp ? 600 : 400,
                    }}
                  >
                    {comp.name.length > 14 ? comp.name.slice(0, 13) + "…" : comp.name}
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
