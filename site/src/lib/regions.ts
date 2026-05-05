import type { Component } from "@/data/types";

export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  label: "left" | "top";
}

export const WORLD_W = 1600;
export const WORLD_H = 1220;

export const REGIONS: Record<string, Region> = {
  surface:       { x:  60, y:  60, w: 1200, h: 110, cols: 5, label: "left" },
  identity:      { x:  60, y: 200, w: 1200, h: 110, cols: 4, label: "left" },
  orchestration: { x: 360, y: 340, w: 600,  h: 140, cols: 4, label: "top" },
  runtime:       { x: 360, y: 510, w: 600,  h: 200, cols: 3, label: "top" },
  gateway:       { x: 360, y: 740, w: 600,  h: 140, cols: 5, label: "top" },
  memory:        { x:  60, y: 340, w: 270,  h: 540, cols: 1, label: "top" },
  state:         { x:  60, y: 910, w: 270,  h: 110, cols: 2, label: "left" },
  tools:         { x: 990, y: 340, w: 270,  h: 540, cols: 1, label: "top" },
  observability: { x: 1290, y: 60, w: 250,  h: 820, cols: 1, label: "top" },
  governance:    { x: 360, y: 910, w: 600,  h: 110, cols: 5, label: "top" },
  systems:       { x:  60, y: 1050, w: 1200, h: 110, cols: 6, label: "left" },
};

const PAD = { x: 12, top: 12, bottom: 12 };

export interface CompBox {
  x: number;
  y: number;
  w: number;
  h: number;
  comp: Component;
}

export function computeCompBoxes(region: Region, components: Component[]): CompBox[] {
  const cols = Math.min(region.cols, components.length);
  const rows = Math.ceil(components.length / cols);
  const innerW = region.w - PAD.x * 2;
  const innerH = region.h - PAD.top - PAD.bottom;
  const gx = 8, gy = 8;
  const cw = (innerW - gx * (cols - 1)) / cols;
  const ch = (innerH - gy * (rows - 1)) / rows;
  return components.map((c, i) => {
    const r = Math.floor(i / cols);
    const col = i % cols;
    return {
      x: region.x + PAD.x + col * (cw + gx),
      y: region.y + PAD.top + r * (ch + gy),
      w: cw,
      h: ch,
      comp: c,
    };
  });
}
