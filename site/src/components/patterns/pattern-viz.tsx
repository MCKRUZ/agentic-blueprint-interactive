"use client";

interface PatternVizProps {
  id: string;
}

function SupervisorViz() {
  const cx = 360, cy = 230, r = 150;
  const specialists = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (
    <g>
      {specialists.map((s, i) => (
        <g key={i}>
          <line
            x1={cx} y1={cy} x2={s.x} y2={s.y}
            stroke="var(--c1)" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5"
            style={{ animation: `drawline 1.5s ease-out ${0.3 + i * 0.15}s both` }}
          />
          <circle
            cx={s.x} cy={s.y} r="18"
            fill="var(--c2)" fillOpacity="0.15" stroke="var(--c2)" strokeWidth="1"
            style={{ animation: `pop 0.5s ease-out ${0.5 + i * 0.15}s both` }}
          />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="24" fill="var(--c1)" fillOpacity="0.2" stroke="var(--c1)" strokeWidth="1.5"
        style={{ animation: "pop 0.5s ease-out 0.2s both", filter: "drop-shadow(0 0 8px var(--c1))" }} />
      <text x={cx} y={cy + 3} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--c1)" }}>SUPER</text>
    </g>
  );
}

function PipelineViz() {
  const xs = [80, 220, 360, 500, 640];
  const cy = 230;
  return (
    <g>
      {xs.map((x, i) => (
        <g key={i}>
          {i < xs.length - 1 && (
            <line x1={x + 30} y1={cy} x2={xs[i + 1] - 30} y2={cy}
              stroke="var(--c1)" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5"
              style={{ animation: `drawline 1.5s ease-out ${0.3 + i * 0.2}s both` }} />
          )}
          <rect x={x - 30} y={cy - 24} width="60" height="48" rx="6"
            fill="var(--c2)" fillOpacity="0.12" stroke="var(--c2)" strokeWidth="1"
            style={{ animation: `pop 0.5s ease-out ${0.2 + i * 0.15}s both` }} />
          <text x={x} y={cy + 3} textAnchor="middle"
            style={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--c2)" }}>
            S{i + 1}
          </text>
        </g>
      ))}
    </g>
  );
}

function SwarmViz() {
  const cx = 360, cy = 230, r = 130;
  const nodes = Array.from({ length: 7 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    edges.push([i, (i + 1) % nodes.length]);
    if (i < 2) edges.push([i, i + 3]);
  }

  return (
    <g>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="var(--c3)" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.4"
          style={{ animation: `drawline 1.5s ease-out ${0.2 + i * 0.1}s both` }} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="14"
          fill="var(--c3)" fillOpacity="0.12" stroke="var(--c3)" strokeWidth="1"
          style={{ animation: `pop 0.5s ease-out ${0.3 + i * 0.1}s both` }} />
      ))}
    </g>
  );
}

function HierarchicalViz() {
  const levels = [
    [{ x: 360, y: 80 }],
    [{ x: 200, y: 200 }, { x: 360, y: 200 }, { x: 520, y: 200 }],
    Array.from({ length: 9 }, (_, i) => ({ x: 120 + i * 60, y: 330 })),
  ];

  return (
    <g>
      {levels[0].map((parent, pi) =>
        levels[1].map((child, ci) => (
          <line key={`0-${pi}-${ci}`} x1={parent.x} y1={parent.y + 16} x2={child.x} y2={child.y - 16}
            stroke="var(--c4)" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5"
            style={{ animation: `drawline 1.5s ease-out ${0.3 + ci * 0.15}s both` }} />
        ))
      )}
      {levels[1].map((parent, pi) =>
        levels[2].slice(pi * 3, pi * 3 + 3).map((child, ci) => (
          <line key={`1-${pi}-${ci}`} x1={parent.x} y1={parent.y + 16} x2={child.x} y2={child.y - 12}
            stroke="var(--c4)" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.4"
            style={{ animation: `drawline 1.5s ease-out ${0.5 + ci * 0.1}s both` }} />
        ))
      )}
      {levels[0].map((n, i) => (
        <circle key={`l0-${i}`} cx={n.x} cy={n.y} r="20"
          fill="var(--c4)" fillOpacity="0.15" stroke="var(--c4)" strokeWidth="1.5"
          style={{ animation: "pop 0.5s ease-out 0.2s both", filter: "drop-shadow(0 0 6px var(--c4))" }} />
      ))}
      {levels[1].map((n, i) => (
        <circle key={`l1-${i}`} cx={n.x} cy={n.y} r="16"
          fill="var(--c4)" fillOpacity="0.12" stroke="var(--c4)" strokeWidth="1"
          style={{ animation: `pop 0.5s ease-out ${0.3 + i * 0.1}s both` }} />
      ))}
      {levels[2].map((n, i) => (
        <circle key={`l2-${i}`} cx={n.x} cy={n.y} r="10"
          fill="var(--c4)" fillOpacity="0.08" stroke="var(--c4)" strokeWidth="0.8"
          style={{ animation: `pop 0.5s ease-out ${0.5 + i * 0.06}s both` }} />
      ))}
    </g>
  );
}

export function PatternViz({ id }: PatternVizProps) {
  return (
    <svg viewBox="0 0 720 460" className="w-full h-full">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {id === "supervisor" && <SupervisorViz />}
      {id === "pipeline" && <PipelineViz />}
      {id === "swarm" && <SwarmViz />}
      {id === "hierarchical" && <HierarchicalViz />}
    </svg>
  );
}
