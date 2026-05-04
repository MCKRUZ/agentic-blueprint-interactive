// ─────────────────────────────────────────────────────────────────────
// Example view — walks through one customer-support scenario
// ("Where's my refund?") step-by-step, lighting up the relevant layer
// + component on a mini-atlas, with a payload toggle per step.
// ─────────────────────────────────────────────────────────────────────

const MINI_W = 720;
const MINI_H = 460;

// Mini-atlas: one row per layer, components as small chips. Lights up
// the active layer + active component for the current step.
const MiniAtlas = ({ activeLayer, activeComp, theme }) => {
  const layers = window.LAYERS;
  const padX = 32;
  const padY = 28;
  const rowH = (MINI_H - padY * 2) / layers.length;
  const labelW = 132;
  const stripX = padX + labelW + 8;
  const stripW = MINI_W - stripX - padX;

  return (
    <svg
      viewBox={`0 0 ${MINI_W} ${MINI_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="ex-mini"
    >
      <defs>
        <filter id="ex-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="ex-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(120,120,180,0.06)" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={MINI_W} height={MINI_H} fill="url(#ex-grid)" />

      {/* Frame */}
      <rect
        x={padX - 8} y={padY - 8}
        width={MINI_W - (padX - 8) * 2}
        height={MINI_H - (padY - 8) * 2}
        fill="none"
        stroke="rgba(167,139,250,0.12)"
        strokeWidth="1"
      />

      {layers.map((layer, i) => {
        const y = padY + i * rowH;
        const isActive = layer.id === activeLayer;
        const opacity = isActive ? 1 : 0.32;

        return (
          <g key={layer.id} opacity={opacity} style={{ transition: "opacity 360ms" }}>
            {/* Active row halo */}
            {isActive && (
              <rect
                x={padX - 4} y={y + 2}
                width={MINI_W - (padX - 4) * 2}
                height={rowH - 4}
                fill={layer.ink} fillOpacity="0.06"
                stroke={layer.ink} strokeOpacity="0.45"
                strokeWidth="1"
              />
            )}

            {/* Layer label */}
            <text
              x={padX} y={y + rowH / 2 - 4}
              fontFamily="var(--mono)" fontSize="9"
              letterSpacing="2"
              fill={isActive ? layer.ink : "var(--ink-3)"}
            >
              {layer.n}
            </text>
            <text
              x={padX} y={y + rowH / 2 + 8}
              fontFamily="var(--display)" fontStyle="italic"
              fontSize="13"
              fill={isActive ? "var(--ink)" : "var(--ink-3)"}
            >
              {layer.name}
            </text>

            {/* Component chips */}
            {layer.components.map((c, j) => {
              const chipW = (stripW - 6 * (layer.components.length - 1)) / layer.components.length;
              const cx = stripX + j * (chipW + 6);
              const cy = y + 6;
              const ch = rowH - 12;
              const isActiveComp = isActive && c.id === activeComp;

              return (
                <g key={c.id}>
                  <rect
                    x={cx} y={cy}
                    width={chipW} height={ch}
                    rx="2"
                    fill={isActiveComp ? layer.ink : "transparent"}
                    fillOpacity={isActiveComp ? 0.18 : 0}
                    stroke={isActiveComp ? layer.ink : "var(--line)"}
                    strokeWidth={isActiveComp ? 1.4 : 0.8}
                    filter={isActiveComp ? "url(#ex-glow)" : undefined}
                  />
                  {isActiveComp && (
                    <circle
                      cx={cx + 8} cy={cy + ch / 2}
                      r="2.5"
                      fill={layer.ink}
                    >
                      <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <text
                    x={cx + (isActiveComp ? 16 : 6)}
                    y={cy + ch / 2 + 3}
                    fontFamily="var(--sans)"
                    fontSize="9.5"
                    fill={isActiveComp ? "var(--ink)" : "var(--ink-3)"}
                    style={{ fontWeight: isActiveComp ? 600 : 400 }}
                  >
                    {c.name.length > 14 ? c.name.slice(0, 13) + "…" : c.name}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

// ── Payload pretty-printer (expandable JSON) ───────────────────
const PayloadView = ({ data }) => {
  const json = React.useMemo(() => JSON.stringify(data, null, 2), [data]);
  // Lightweight syntax highlight via regex
  const highlighted = React.useMemo(() => {
    return json
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/("(?:\\.|[^"\\])*")(\s*:)?/g, (m, str, colon) => {
        if (colon) return `<span class="ex-k">${str}</span>${colon}`;
        return `<span class="ex-s">${str}</span>`;
      })
      .replace(/\b(true|false|null)\b/g, '<span class="ex-b">$1</span>')
      .replace(/(?<![a-zA-Z_])(-?\d+\.?\d*)/g, '<span class="ex-n">$1</span>');
  }, [json]);
  return <pre className="ex-payload" dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

// ── Main Example component ────────────────────────────────────
const Example = () => {
  const trace = window.EXAMPLE_TRACE;
  const [active, setActive] = React.useState(0);
  const [showPayload, setShowPayload] = React.useState(false);
  const step = trace.steps[active];
  const layer = window.LAYERS.find(l => l.id === step.layer);
  const comp = layer?.components.find(c => c.id === step.comp);

  // keyboard nav within the example
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "j") {
        setActive(a => Math.min(trace.steps.length - 1, a + 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        setActive(a => Math.max(0, a - 1));
      } else if (e.key === "p") {
        setShowPayload(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trace.steps.length]);

  return (
    <div className="ex-stage">
      {/* Left rail — header + stepper */}
      <aside className="hud ex-rail">
        <div className="ex-rail-h">
          <div className="eyebrow">Example · Trace 01</div>
          <h2 className="ex-title">{trace.title}</h2>
          <div className="ex-sub">{trace.subtitle}</div>

          <div className="ex-meta">
            <div className="ex-meta-row">
              <span className="lbl">Customer</span>
              <span className="val">{trace.user.name}</span>
            </div>
            <div className="ex-meta-row">
              <span className="lbl">Channel</span>
              <span className="val">{trace.user.channel}</span>
            </div>
            <div className="ex-meta-row">
              <span className="lbl">Persona</span>
              <span className="val">{trace.user.persona}</span>
            </div>
          </div>
        </div>

        <div className="ex-steps">
          <div className="ex-steps-h">Trace · {trace.steps.length} steps</div>
          {trace.steps.map((s, i) => {
            const sLayer = window.LAYERS.find(l => l.id === s.layer);
            const isOn = i === active;
            const isPast = i < active;
            return (
              <button
                key={i}
                className={`ex-step ${isOn ? "on" : ""} ${isPast ? "past" : ""}`}
                onClick={() => setActive(i)}
                style={{ "--step-ink": sLayer?.ink || "var(--accent-1)" }}
              >
                <span className="ex-step-n">{s.n}</span>
                <span className="ex-step-tail">
                  <span className="ex-step-layer">{sLayer?.name || s.layer}</span>
                  <span className="ex-step-title">{s.title}</span>
                </span>
                <span className="ex-step-tick" />
              </button>
            );
          })}
        </div>

        <div className="ex-outcome">
          <div className="ex-outcome-h">Outcome</div>
          <div className="ex-outcome-grid">
            <div><span className="lbl">Duration</span><span className="val">{trace.outcome.duration}</span></div>
            <div><span className="lbl">Cost</span><span className="val">{trace.outcome.cost}</span></div>
            <div><span className="lbl">Tools</span><span className="val">{trace.outcome.tools_called}</span></div>
            <div><span className="lbl">HITL</span><span className="val">{trace.outcome.human_approvals}</span></div>
          </div>
        </div>
      </aside>

      {/* Center — mini-atlas */}
      <section className="hud ex-canvas">
        <div className="ex-canvas-h">
          <span className="eyebrow">Step {step.n} · Atlas position</span>
          <div className="ex-breadcrumb">
            <span className="ex-bc-layer" style={{ color: layer?.ink }}>
              {layer?.name || step.layer}
            </span>
            <span className="ex-bc-sep">›</span>
            <span className="ex-bc-comp">{comp?.name || step.comp}</span>
          </div>
        </div>
        <div className="ex-canvas-body">
          <MiniAtlas activeLayer={step.layer} activeComp={step.comp} />
        </div>
        <div className="ex-canvas-nav">
          <button
            className="ex-nav-btn"
            disabled={active === 0}
            onClick={() => setActive(Math.max(0, active - 1))}
          >← Prev</button>
          <div className="ex-nav-dots">
            {trace.steps.map((_, i) => (
              <button
                key={i}
                className={`ex-nav-dot ${i === active ? "on" : ""} ${i < active ? "past" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>
          <button
            className="ex-nav-btn"
            disabled={active === trace.steps.length - 1}
            onClick={() => setActive(Math.min(trace.steps.length - 1, active + 1))}
          >Next →</button>
        </div>
      </section>

      {/* Right — step detail */}
      <aside className="hud ex-detail">
        <div className="ex-detail-h">
          <div className="ex-detail-num" style={{ color: layer?.ink }}>{step.n}</div>
          <div className="ex-detail-meta">
            <div className="ex-detail-layer" style={{ color: layer?.ink }}>
              {layer?.name} · {comp?.name}
            </div>
            <h3 className="ex-detail-title">{step.title}</h3>
          </div>
        </div>

        <div className="ex-detail-body">
          <div className="ex-toggle">
            <button
              className={!showPayload ? "on" : ""}
              onClick={() => setShowPayload(false)}
            >Plain English</button>
            <button
              className={showPayload ? "on" : ""}
              onClick={() => setShowPayload(true)}
            >Payload</button>
            <span className="ex-toggle-hint">press <kbd>P</kbd> to toggle</span>
          </div>

          {!showPayload && (
            <div className="ex-narrative">
              <p>{step.narrative}</p>
            </div>
          )}

          {showPayload && (
            <div className="ex-payload-wrap">
              <div className="ex-payload-h">
                <span className="ex-payload-lbl">Envelope passing through</span>
                <span className="ex-payload-tag">{step.payload.type}</span>
              </div>
              <PayloadView data={step.payload} />
            </div>
          )}
        </div>

        <div className="ex-detail-foot">
          <button
            className="ex-foot-btn"
            disabled={active === 0}
            onClick={() => setActive(active - 1)}
          >
            <span className="k">↑</span>
            <span className="t">Previous step</span>
          </button>
          <button
            className="ex-foot-btn"
            disabled={active === trace.steps.length - 1}
            onClick={() => setActive(active + 1)}
          >
            <span className="t">Next step</span>
            <span className="k">↓</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

window.Example = Example;
