"use client";

import { ROUTES, buildRoutePath } from "@/lib/routes";

interface ConnectionLinesProps {
  activeLayer: string | null;
}

export function ConnectionLines({ activeLayer }: ConnectionLinesProps) {
  return (
    <g>
      {ROUTES.map((route, i) => {
        const d = buildRoutePath(route);
        if (!d) return null;
        const isActive = activeLayer === route.from || activeLayer === route.to;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--line)"
            strokeWidth={isActive ? 1.5 : 1}
            strokeOpacity={isActive ? 0.6 : 0.25}
            strokeDasharray="4 4"
            style={{ animation: "flowdash 14s linear infinite" }}
          />
        );
      })}
    </g>
  );
}
