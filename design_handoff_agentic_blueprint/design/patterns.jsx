// Pattern Explorer — 4 orchestration topologies, with deep context per pattern.
// Layout: left list of patterns · center diagram · right rail with stats &
// "in the wild" · scrolling content section below the fold with description,
// when-to-use, anatomy, scaling, failure modes, example walkthrough, stack.

const PatternViz = ({ id }) => {
  const W = 720, H = 460;
  const cx = W / 2, cy = H / 2;

  if (id === "supervisor") {
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="arr-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#67E8F9" />
          </marker>
        </defs>
        {[0,1,2,3,4].map(i => {
          const ang = -Math.PI/2 + (i * 2 * Math.PI / 5);
          const r = 150;
          const x = cx + Math.cos(ang) * r;
          const y = cy + Math.sin(ang) * r;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y}
                    stroke="#67E8F9" strokeOpacity="0.4" strokeWidth="1"
                    strokeDasharray="3 4"
                    style={{ animation: `drawline 1.4s ${0.2 + i * 0.1}s both`, filter: "drop-shadow(0 0 4px #67E8F9)" }}
                    markerEnd="url(#arr-s)" />
              <circle cx={x} cy={y} r="22" fill="rgba(167,139,250,0.18)" stroke="#A78BFA" strokeOpacity="0.7"
                      style={{ animation: `pop 0.5s ${0.3 + i * 0.1}s both`, filter: "drop-shadow(0 0 10px #A78BFA)" }} />
              <text x={x} y={y + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9"
                    letterSpacing="0.18em" fill="#E8F1FF">SPC{i+1}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="34" fill="rgba(103,232,249,0.20)" stroke="#67E8F9" strokeOpacity="0.9"
                style={{ animation: "pop 0.5s both", filter: "drop-shadow(0 0 14px #67E8F9)" }} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="Instrument Serif" fontStyle="italic"
              fontSize="14" fill="#E8F1FF">Supervisor</text>
      </svg>
    );
  }

  if (id === "pipeline") {
    const ys = cy;
    const xs = [80, 220, 360, 500, 640];
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="arr-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#67E8F9" />
          </marker>
        </defs>
        {xs.slice(0, -1).map((x, i) => (
          <line key={i} x1={x + 26} y1={ys} x2={xs[i+1] - 26} y2={ys}
                stroke="#67E8F9" strokeOpacity="0.6" strokeWidth="1.2"
                strokeDasharray="3 4"
                style={{ animation: `drawline 1.2s ${0.3 + i * 0.18}s both`, filter: "drop-shadow(0 0 4px #67E8F9)" }}
                markerEnd="url(#arr-p)" />
        ))}
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys} r="22" fill="rgba(167,139,250,0.18)" stroke="#A78BFA" strokeOpacity="0.7"
                    style={{ animation: `pop 0.5s ${i * 0.18}s both`, filter: "drop-shadow(0 0 8px #A78BFA)" }} />
            <text x={x} y={ys + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9"
                  letterSpacing="0.18em" fill="#E8F1FF">STG{i+1}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (id === "swarm") {
    const nodes = [];
    const N = 7;
    for (let i = 0; i < N; i++) {
      const ang = (i * 2 * Math.PI / N) - Math.PI/2;
      nodes.push({ x: cx + Math.cos(ang) * 160, y: cy + Math.sin(ang) * 130 });
    }
    const edges = [[0,2],[0,4],[1,3],[2,5],[3,6],[4,6],[1,5],[0,3],[2,4]];
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
                stroke="#67E8F9" strokeOpacity="0.4" strokeWidth="0.9"
                strokeDasharray="3 4"
                style={{ animation: `drawline 1.5s ${0.2 + i * 0.08}s both`, filter: "drop-shadow(0 0 3px #67E8F9)" }} />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="20" fill="rgba(167,139,250,0.18)" stroke="#A78BFA" strokeOpacity="0.7"
                    style={{ animation: `pop 0.5s ${i * 0.08}s both`, filter: "drop-shadow(0 0 8px #A78BFA)" }} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9"
                  letterSpacing="0.18em" fill="#E8F1FF">A{i+1}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (id === "hierarchical") {
    const top = { x: cx, y: 70 };
    const mids = [{ x: cx - 200, y: 220 }, { x: cx, y: 220 }, { x: cx + 200, y: 220 }];
    const leaves = [];
    mids.forEach((m, i) => {
      [-50, 0, 50].forEach((dx) => leaves.push({ x: m.x + dx, y: 380, parent: i }));
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`}>
        {mids.map((m, i) => (
          <line key={"t"+i} x1={top.x} y1={top.y + 22} x2={m.x} y2={m.y - 22}
                stroke="#67E8F9" strokeOpacity="0.5" strokeWidth="1"
                strokeDasharray="3 4"
                style={{ animation: `drawline 1s ${0.3 + i * 0.1}s both`, filter: "drop-shadow(0 0 3px #67E8F9)" }} />
        ))}
        {leaves.map((l, i) => (
          <line key={"l"+i} x1={mids[l.parent].x} y1={mids[l.parent].y + 20} x2={l.x} y2={l.y - 18}
                stroke="#67E8F9" strokeOpacity="0.4" strokeWidth="0.8"
                strokeDasharray="3 4"
                style={{ animation: `drawline 1s ${0.7 + i * 0.06}s both`, filter: "drop-shadow(0 0 3px #67E8F9)" }} />
        ))}
        <circle cx={top.x} cy={top.y} r="26" fill="rgba(103,232,249,0.20)" stroke="#67E8F9" strokeOpacity="0.9"
                style={{ animation: "pop 0.5s both", filter: "drop-shadow(0 0 12px #67E8F9)" }} />
        <text x={top.x} y={top.y + 4} textAnchor="middle" fontFamily="Instrument Serif" fontStyle="italic"
              fontSize="13" fill="#E8F1FF">Coord</text>
        {mids.map((m, i) => (
          <g key={"m"+i}>
            <circle cx={m.x} cy={m.y} r="22" fill="rgba(167,139,250,0.20)" stroke="#A78BFA" strokeOpacity="0.8"
                    style={{ animation: `pop 0.5s ${0.4 + i * 0.1}s both`, filter: "drop-shadow(0 0 10px #A78BFA)" }} />
            <text x={m.x} y={m.y + 4} textAnchor="middle" fontFamily="Instrument Serif" fontStyle="italic"
                  fontSize="12" fill="#E8F1FF">SUP {i+1}</text>
          </g>
        ))}
        {leaves.map((l, i) => (
          <g key={"lv"+i}>
            <circle cx={l.x} cy={l.y} r="14" fill="rgba(244,114,182,0.16)" stroke="#F472B6" strokeOpacity="0.7"
                    style={{ animation: `pop 0.5s ${0.8 + i * 0.05}s both`, filter: "drop-shadow(0 0 6px #F472B6)" }} />
          </g>
        ))}
      </svg>
    );
  }

  return null;
};

const PSection = ({ num, label, children, accent }) => (
  <section className="pp-sec" style={accent ? { "--accent": accent } : undefined}>
    <div className="pp-sec-h">
      <span className="pp-sec-num">{num}</span>
      <span className="pp-sec-lbl">{label}</span>
    </div>
    <div className="pp-sec-body">{children}</div>
  </section>
);

const StatCell = ({ k, v }) => (
  <div className="pp-stat">
    <div className="pp-stat-k">{k}</div>
    <div className="pp-stat-v">{v}</div>
  </div>
);

const Patterns = () => {
  const [active, setActive] = React.useState(0);
  const p = window.PATTERNS[active];

  return (
    <div className="patterns-stage">
      {/* Left rail — pattern picker */}
      <aside className="hud pattern-list">
        <div className="pl-h">
          <span className="pl-h-eyebrow">Topology</span>
          <span className="pl-h-count">{window.PATTERNS.length}</span>
        </div>
        {window.PATTERNS.map((pp, i) => (
          <button key={pp.id} className={i === active ? "on" : ""} onClick={() => setActive(i)}>
            <div className="pn">Pattern · {String(i + 1).padStart(2, "0")}</div>
            <div className="pt">{pp.name}</div>
            <div className="ps">{pp.summary}</div>
          </button>
        ))}
      </aside>

      {/* Right scrollable detail */}
      <section className="hud pattern-detail">
        <div className="pp-scroll">
          {/* Header band */}
          <header className="pp-header">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Topology · {String(active + 1).padStart(2, "0")}
            </div>
            <h2 className="pp-title">{p.name}</h2>
            <p className="pp-summ">{p.summary}</p>
          </header>

          {/* Diagram + side-rail */}
          <div className="pp-fold">
            <div className="canvas-wrap" key={p.id /* re-mount for anim */}>
              <PatternViz id={p.id} />
            </div>

            <aside className="pp-rail">
              <div className="pp-rail-block">
                <div className="pp-rail-h">Vital signs</div>
                <div className="pp-stats">
                  <StatCell k="Latency"      v={p.stats.latency} />
                  <StatCell k="Parallelism"  v={p.stats.parallelism} />
                  <StatCell k="Traceability" v={p.stats.traceability} />
                  <StatCell k="Complexity"   v={p.stats.complexity} />
                </div>
              </div>

              <div className="pp-rail-block">
                <div className="pp-rail-h">Seen in production</div>
                <ul className="pp-wild">
                  {p.inTheWild.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>

              <div className="pp-rail-block">
                <div className="pp-rail-h">Typical stack</div>
                <div className="pp-stack">
                  {p.stack.map((s, i) => <span key={i} className="pp-chip">{s}</span>)}
                </div>
              </div>
            </aside>
          </div>

          {/* Long-form context — scrolls beneath */}
          <div className="pp-context">

            <PSection num="01" label="What it is">
              <p>{p.description}</p>
              {p.description2 && <p style={{ marginTop: 10 }}>{p.description2}</p>}
            </PSection>

            <PSection num="02" label="Best for" accent="#67E8F9">
              <ul className="pp-bullets pp-pos">
                {p.bestFor.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </PSection>

            <PSection num="03" label="Avoid when" accent="#F472B6">
              <ul className="pp-bullets pp-neg">
                {p.avoidWhen.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </PSection>

            <PSection num="04" label="Anatomy of one turn">
              <ol className="pp-flow">
                {p.flow.map((step, i) => (
                  <li key={i}>
                    <span className="pp-flow-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="pp-flow-t">{step}</span>
                  </li>
                ))}
              </ol>
            </PSection>

            <div className="pp-pair">
              <PSection num="05" label="How it scales">
                <p>{p.scaling}</p>
              </PSection>
              <PSection num="06" label="How it fails" accent="#F472B6">
                <p>{p.failureMode}</p>
              </PSection>
            </div>

            <PSection num="07" label="Walked-through example" accent="#A78BFA">
              <div className="pp-example">{p.example}</div>
            </PSection>

          </div>
        </div>
      </section>
    </div>
  );
};

window.Patterns = Patterns;
