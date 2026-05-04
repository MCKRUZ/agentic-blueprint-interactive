// Free-form architecture diagram — flat orthographic boxes.
// Layer containers (hairline) hold component boxes (filled, tinted).
// Orthogonal connection lines with ambient flow animation.
// Pan, zoom, hover ripple, click drill-down. Holographic accents kept.

// World canvas size — virtual coordinate space the boxes are laid out in.
const WORLD_W = 1600;
const WORLD_H = 1100;

// Layer regions — hand-designed positions for a whiteboard architecture diagram.
// Top: user surface (entry).
// Below: identity (gate).
// Center band: orchestration → runtime → gateway (the reasoning core).
// Left side: memory + state (data plane, vertical).
// Right side: tools (action plane).
// Right rail: observability (cross-cutting, full-height).
// Bottom band: governance (cross-cutting wrap).
const REGIONS = {
  surface:       { x:  60, y:  60, w: 1200, h: 110, cols: 5, label: "left" },
  identity:      { x:  60, y: 200, w: 1200, h: 110, cols: 4, label: "left" },
  orchestration: { x: 360, y: 340, w: 600,  h: 140, cols: 4, label: "top" },
  runtime:       { x: 360, y: 510, w: 600,  h: 200, cols: 3, label: "top" },
  gateway:       { x: 360, y: 740, w: 600,  h: 140, cols: 5, label: "top" },
  memory:        { x:  60, y: 340, w: 270,  h: 540, cols: 1, label: "top" },
  state:         { x:  60, y: 910, w: 270,  h: 110, cols: 2, label: "left" },
  tools:         { x: 990, y: 340, w: 270,  h: 540, cols: 1, label: "top" },
  observability: { x: 1290, y: 60, w: 250,  h: 820, cols: 1, label: "top" },
  governance:    { x:  60, y: 1050, w: 1480, h: 0,  cols: 5, label: "left", wrap: true },
};

// Governance wraps along the bottom — but since the diagram is tall,
// we'll give it its own band at the bottom.
REGIONS.governance.y = 910;
REGIONS.governance.x = 360;
REGIONS.governance.w = 600;
REGIONS.governance.h = 110;
REGIONS.governance.cols = 5;
REGIONS.governance.label = "top";

// Pad inside each region for components
const PAD = { x: 16, top: 30, bottom: 16 };

// Compute component positions inside a region.
const computeCompBoxes = (region, components) => {
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
};

// Inter-layer connection routes — orthogonal paths between layer-region edges.
// Each route: from layerId.fromSide → toLayerId.toSide
const ROUTES = [
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

// Build the SVG path for a route given the regions it connects.
const buildRoutePath = (route) => {
  const a = REGIONS[route.from];
  const b = REGIONS[route.to];
  if (!a || !b) return "";

  const aCx = a.x + a.w / 2, aCy = a.y + a.h / 2;
  const bCx = b.x + b.w / 2, bCy = b.y + b.h / 2;
  const aBottom = a.y + a.h, aTop = a.y;
  const aLeft = a.x, aRight = a.x + a.w;
  const bTop = b.y, bBottom = b.y + b.h;
  const bLeft = b.x, bRight = b.x + b.w;

  switch (route.kind) {
    case "down": {
      // exit bottom-center of A, enter top-center of B
      const sx = aCx, sy = aBottom;
      const ex = bCx, ey = bTop;
      const my = (sy + ey) / 2;
      return `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
    }
    case "side-l": {
      // A center → B right edge
      const sx = aLeft, sy = aCy;
      const ex = bRight, ey = bCy;
      const mx = (sx + ex) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    }
    case "side-r": {
      const sx = aRight, sy = aCy;
      const ex = bLeft,  ey = bCy;
      const mx = (sx + ex) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    }
    case "diag-bl": {
      // bottom-left of A → top of B (state is to the bottom-left)
      const sx = aLeft + 60, sy = aBottom;
      const ex = bRight,     ey = bTop + 30;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "diag-br": {
      const sx = aRight - 60, sy = aBottom;
      const ex = bLeft,       ey = bTop + 30;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "down-l": {
      // memory bottom → state top
      const sx = aCx, sy = aBottom;
      const ex = bCx, ey = bTop;
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    case "down-r": {
      // observability bottom → governance right edge
      const sx = aCx, sy = aBottom;
      const ex = bRight, ey = bCy;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "side-cross": {
      // observability is full-height on right; bus into runtime right edge
      const sx = aLeft, sy = aCy;
      const ex = bRight, ey = bCy;
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    default:
      return `M ${aCx} ${aCy} L ${bCx} ${bCy}`;
  }
};

// Centroid for the travelling pulse (component coord, layer region)
const componentCenter = (layerId, compId) => {
  const region = REGIONS[layerId];
  const layer = window.LAYERS.find(l => l.id === layerId);
  if (!region || !layer) return null;
  const boxes = computeCompBoxes(region, layer.components);
  const b = boxes.find(x => x.comp.id === compId);
  if (!b) return null;
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
};

const Atlas = ({ revealUpTo, activeFlow, onOpenLayer, onOpenComp, hoveredComp, setHoveredComp }) => {
  const layers = window.LAYERS;
  const total = layers.length;

  // Pan & zoom state
  const [transform, setTransform] = React.useState({ x: 0, y: 0, k: 0.6 });
  const dragRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const didCenterRef = React.useRef(false);

  React.useEffect(() => {
    const center = () => {
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      if (r.width < 50 || r.height < 50) return false;
      const k = Math.min((r.width - 60) / WORLD_W, (r.height - 80) / WORLD_H, 0.85);
      setTransform({ x: r.width / 2, y: r.height / 2 + 20, k: Math.max(0.32, k) });
      didCenterRef.current = true;
      return true;
    };

    // Try immediately, then on next frame, then watch for size changes
    if (!center()) {
      requestAnimationFrame(() => { center(); });
    }
    const ro = new ResizeObserver(() => {
      if (!didCenterRef.current) center();
    });
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const onWheel = (e) => {
    e.preventDefault();
    const dk = -e.deltaY * 0.001;
    setTransform((t) => {
      const k2 = Math.max(0.25, Math.min(2.5, t.k * (1 + dk)));
      const r = stageRef.current.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      const wx = (cx - t.x) / t.k;
      const wy = (cy - t.y) / t.k;
      return { k: k2, x: cx - wx * k2, y: cy - wy * k2 };
    });
  };

  const onMouseDown = (e) => {
    if (e.target.closest(".comp-box, .layer-region")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, t: transform };
    stageRef.current.classList.add("dragging");
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setTransform({ ...dragRef.current.t, x: dragRef.current.t.x + dx, y: dragRef.current.t.y + dy });
  };
  const onMouseUp = () => {
    dragRef.current = null;
    if (stageRef.current) stageRef.current.classList.remove("dragging");
  };

  const activeLayer = activeFlow ? activeFlow.layer : null;
  const hoveredLayer = hoveredComp?.layer;

  // For each layer, an index for reveal order
  const order = layers.reduce((acc, l, i) => ({ ...acc, [l.id]: i }), {});

  return (
    <div
      ref={stageRef}
      className="canvas"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="world" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}>
        <svg className="diag-svg"
             width={WORLD_W} height={WORLD_H}
             viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}>
          <defs>
            <filter id="box-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="active-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {layers.map(l => (
              <linearGradient key={"g-"+l.id} id={`fill-${l.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={l.ink} stopOpacity="0.22" />
                <stop offset="100%" stopColor={l.ink} stopOpacity="0.08" />
              </linearGradient>
            ))}
            <linearGradient id="flow-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"  stopColor="#67E8F9" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.5" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
                    markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10" fill="#67E8F9" />
            </marker>
          </defs>

          {/* Connection routes (drawn behind) */}
          <g className="routes">
            {ROUTES.map((r, i) => {
              const aIdx = order[r.from];
              const bIdx = order[r.to];
              const isRevealed = revealUpTo >= Math.max(aIdx, bIdx);
              const isActive = activeFlow && (
                (activeFlow.layer === r.from || activeFlow.layer === r.to)
              );
              return (
                <path key={i}
                      d={buildRoutePath(r)}
                      className={"route-line " + (isActive ? "active" : "")}
                      style={{ opacity: isRevealed ? 1 : 0, transition: "opacity 600ms" }}
                      markerEnd="url(#arrow)" />
              );
            })}
          </g>

          {/* Layer regions */}
          {layers.map((layer, li) => {
            const region = REGIONS[layer.id];
            if (!region) return null;
            const isRevealed = li <= revealUpTo;
            const isActive = activeLayer === layer.id || hoveredLayer === layer.id;
            const boxes = computeCompBoxes(region, layer.components);

            return (
              <g key={layer.id}
                 className={"layer-region " + (isActive ? "is-active" : "")}
                 style={{
                   opacity: isRevealed ? 1 : 0,
                   transform: isRevealed ? "translateY(0)" : "translateY(8px)",
                   transition: "opacity 500ms, transform 500ms",
                   transitionDelay: `${li * 60}ms`,
                 }}
                 onDoubleClick={(e) => { e.stopPropagation(); onOpenLayer(layer.id); }}
              >
                {/* Region container — hairline */}
                <rect
                  x={region.x} y={region.y}
                  width={region.w} height={region.h}
                  rx="6"
                  fill="rgba(15, 18, 38, 0.45)"
                  stroke={layer.ink}
                  strokeOpacity={isActive ? 0.9 : 0.35}
                  strokeWidth="1"
                  strokeDasharray="6 4"
                />
                {/* Region corner accents */}
                {[
                  [region.x, region.y],
                  [region.x + region.w, region.y],
                  [region.x, region.y + region.h],
                  [region.x + region.w, region.y + region.h],
                ].map(([cx, cy], i) => (
                  <g key={i} stroke={layer.ink} strokeOpacity="0.7" strokeWidth="1" fill="none">
                    <path d={`M ${cx + (i%2 ? -8 : 8)} ${cy} L ${cx} ${cy} L ${cx} ${cy + (i<2 ? 8 : -8)}`} />
                  </g>
                ))}

                {/* Layer label */}
                <g style={{ pointerEvents: "none" }}>
                  <text x={region.x + 14} y={region.y + 18}
                        style={{
                          fontFamily: "JetBrains Mono", fontSize: 10,
                          letterSpacing: "0.22em", textTransform: "uppercase",
                          fill: layer.ink, opacity: 0.95,
                        }}>
                    {layer.n} · {layer.name}
                  </text>
                  <circle cx={region.x + region.w - 14} cy={region.y + 14} r="3"
                          fill={layer.ink} filter="url(#box-glow)" />
                </g>

                {/* Component boxes */}
                {boxes.map((b) => {
                  const isCompActive = activeFlow && activeFlow.layer === layer.id && activeFlow.comp === b.comp.id;
                  const isHov = hoveredComp && hoveredComp.layer === layer.id && hoveredComp.comp === b.comp.id;
                  return (
                    <g key={b.comp.id}
                       className="comp-box"
                       style={{ cursor: "pointer" }}
                       onClick={(e) => {
                         e.stopPropagation();
                         // Capture the box's screen-space rect for the arrow source.
                         const r = e.currentTarget.getBoundingClientRect();
                         onOpenComp(layer.id, b.comp.id, { x: r.x, y: r.y, w: r.width, h: r.height });
                       }}
                       onMouseEnter={() => setHoveredComp({ layer: layer.id, comp: b.comp.id })}
                       onMouseLeave={() => setHoveredComp(null)}
                    >
                      <rect
                        x={b.x} y={b.y}
                        width={b.w} height={b.h}
                        rx="3"
                        fill={`url(#fill-${layer.id})`}
                        stroke={layer.ink}
                        strokeOpacity={isCompActive || isHov ? 1 : 0.55}
                        strokeWidth={isCompActive || isHov ? 1.4 : 0.9}
                        filter={isCompActive ? "url(#active-glow)" : (isHov ? "url(#box-glow)" : "none")}
                      />
                      {/* Tiny port indicator (top-left dot) */}
                      <circle cx={b.x + 6} cy={b.y + 6} r="1.6" fill={layer.ink} opacity="0.95" />
                      {/* Component name */}
                      <text x={b.x + 12} y={b.y + 18}
                            style={{
                              fontFamily: "Space Grotesk",
                              fontSize: 11,
                              fontWeight: 500,
                              fill: "var(--ink)",
                              pointerEvents: "none",
                            }}>
                        {b.comp.name}
                      </text>
                      {/* Code/term hint, second line if there's room */}
                      {b.h > 44 && b.comp.terms?.[0] && (
                        <text x={b.x + 12} y={b.y + 32}
                              style={{
                                fontFamily: "JetBrains Mono",
                                fontSize: 9,
                                letterSpacing: "0.08em",
                                fill: "var(--ink-3)",
                                pointerEvents: "none",
                              }}>
                          {b.comp.terms.slice(0, 2).join(" · ")}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Active flow ring on the active component */}
          {activeFlow && (() => {
            const c = componentCenter(activeFlow.layer, activeFlow.comp);
            if (!c) return null;
            return (
              <g style={{ pointerEvents: "none" }}>
                <circle cx={c.x} cy={c.y} r="14" fill="none"
                        stroke="white" strokeOpacity="0.7" strokeWidth="1"
                        style={{ animation: "ringExpand 1.6s ease-out infinite" }} />
                <circle cx={c.x} cy={c.y} r="22" fill="none"
                        stroke="white" strokeOpacity="0.4" strokeWidth="0.8"
                        style={{ animation: "ringExpand 1.6s ease-out 0.5s infinite" }} />
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

window.Atlas = Atlas;
