import { REGIONS } from "./regions";

interface Route {
  from: string;
  to: string;
  kind: string;
}

export const ROUTES: Route[] = [
  { from: "surface",       to: "identity",      kind: "down" },
  { from: "identity",      to: "orchestration", kind: "down" },
  { from: "orchestration", to: "runtime",       kind: "down" },
  { from: "runtime",       to: "gateway",       kind: "down" },
  { from: "runtime",       to: "memory",        kind: "side-l" },
  { from: "runtime",       to: "tools",         kind: "side-r" },
  { from: "runtime",       to: "state",         kind: "diag-bl" },
  { from: "gateway",       to: "governance",    kind: "down" },
  { from: "tools",         to: "governance",    kind: "diag-br" },
  { from: "memory",        to: "state",         kind: "down-l" },
  { from: "observability", to: "runtime",       kind: "side-cross" },
  { from: "observability", to: "governance",    kind: "down-r" },
];

export function buildRoutePath(route: Route): string {
  const a = REGIONS[route.from];
  const b = REGIONS[route.to];
  if (!a || !b) return "";

  const aCx = a.x + a.w / 2, aCy = a.y + a.h / 2;
  const bCx = b.x + b.w / 2, bCy = b.y + b.h / 2;
  const aBottom = a.y + a.h;
  const aLeft = a.x, aRight = a.x + a.w;
  const bTop = b.y;
  const bLeft = b.x, bRight = b.x + b.w;

  switch (route.kind) {
    case "down": {
      const sx = aCx, sy = aBottom;
      const ex = bCx, ey = bTop;
      const my = (sy + ey) / 2;
      return `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
    }
    case "side-l": {
      const sx = aLeft, sy = aCy;
      const ex = bRight, ey = bCy;
      const mx = (sx + ex) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    }
    case "side-r": {
      const sx = aRight, sy = aCy;
      const ex = bLeft, ey = bCy;
      const mx = (sx + ex) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    }
    case "diag-bl": {
      const sx = aLeft + 60, sy = aBottom;
      const ex = bRight, ey = bTop + 30;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "diag-br": {
      const sx = aRight - 60, sy = aBottom;
      const ex = bLeft, ey = bTop + 30;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "down-l": {
      const sx = aCx, sy = aBottom;
      const ex = bCx, ey = bTop;
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    case "down-r": {
      const sx = aCx, sy = aBottom;
      const ex = bRight, ey = bCy;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "side-cross": {
      const sx = aLeft, sy = aCy;
      const ex = bRight, ey = bCy;
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    default:
      return `M ${aCx} ${aCy} L ${bCx} ${bCy}`;
  }
}
