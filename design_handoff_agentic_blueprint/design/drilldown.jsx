// Component Dossier — animated arrow connects the clicked box to the panel.
// Clicking a tech chip opens a tech-detail sub-panel with pros/cons/best-for.

// Animated arrow from clicked box → dossier panel.
const ArrowOverlay = ({ sourceRect }) => {
  const [progress, setProgress] = React.useState(0);
  const rafRef = React.useRef(null);
  const startRef = React.useRef(null);

  React.useEffect(() => {
    setProgress(0);
    startRef.current = null;
    const dur = 600;
    const tick = (t) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / dur);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [sourceRect?.x, sourceRect?.y]);

  if (!sourceRect) return null;

  const sx = sourceRect.x + sourceRect.w;
  const sy = sourceRect.y + sourceRect.h / 2;
  const dossierLeft = window.innerWidth - 460 - 16;
  const ex = dossierLeft - 8;
  const ey = Math.max(120, Math.min(window.innerHeight - 120, sy));

  const cx1 = sx + Math.max(80, (ex - sx) * 0.4);
  const cy1 = sy;
  const cx2 = ex - Math.max(80, (ex - sx) * 0.4);
  const cy2 = ey;
  const path = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`;

  const ease = 1 - Math.pow(1 - progress, 3);
  const total = 1000;

  return (
    <svg className="arrow-overlay"
         width={window.innerWidth} height={window.innerHeight}
         style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }}>
      <defs>
        <linearGradient id="arrow-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.0" />
          <stop offset="20%" stopColor="#67E8F9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="1" />
        </linearGradient>
        <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow-head" viewBox="0 0 12 12" refX="11" refY="6"
                markerWidth="10" markerHeight="10" orient="auto-start-reverse">
          <path d="M 0 0 L 12 6 L 0 12 L 4 6 Z" fill="#A78BFA" />
        </marker>
      </defs>
      <path d={path} stroke="rgba(167,139,250,0.18)" strokeWidth="1" fill="none" strokeDasharray="3 4" />
      <path d={path}
            stroke="url(#arrow-grad)" strokeWidth="2" fill="none"
            strokeDasharray={total}
            strokeDashoffset={total * (1 - ease)}
            filter="url(#arrow-glow)"
            markerEnd={ease > 0.95 ? "url(#arrow-head)" : undefined} />
      <circle cx={sx} cy={sy} r={4 + (1 - ease) * 8}
              fill="none" stroke="#67E8F9" strokeOpacity={1 - ease}
              strokeWidth="1.5" />
      <circle cx={sx} cy={sy} r="3" fill="#67E8F9" filter="url(#arrow-glow)" />
    </svg>
  );
};

// Tech-detail sub-panel. Slides in to the LEFT of the dossier.
const TechDetail = ({ techLabel, layerInk, onClose }) => {
  const detail = window.lookupTech ? window.lookupTech(techLabel) : null;

  return (
    <aside className="tech-detail hud" style={{ "--layer-ink": layerInk }}>
      <div className="hud-h">
        <div className="crumbs">
          <span className="td-tag">Technology</span>
          <span>/</span>
          <span>{techLabel}</span>
        </div>
        <button className="closex" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="body">
        <div className="td-marker">
          <span className="td-rule" />
          <span className="td-rule-lbl">Vendor brief</span>
          <span className="td-rule" />
        </div>
        <h2 className="td-name">{detail ? detail.name : techLabel}</h2>

        {detail ? (
          <>
            <p className="td-blurb">{detail.blurb}</p>

            <div className="td-meta">
              <div className="td-meta-row">
                <span className="td-meta-k">License</span>
                <span className="td-meta-v">{detail.license}</span>
              </div>
              <div className="td-meta-row">
                <span className="td-meta-k">Maturity</span>
                <span className="td-meta-v">{detail.maturity}</span>
              </div>
            </div>

            <section className="td-sec td-pros">
              <div className="td-sec-h">
                <span className="td-sec-mark">＋</span>
                <span className="td-sec-lbl">Pros</span>
              </div>
              <ul>
                {detail.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </section>

            <section className="td-sec td-cons">
              <div className="td-sec-h">
                <span className="td-sec-mark">−</span>
                <span className="td-sec-lbl">Cons</span>
              </div>
              <ul>
                {detail.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </section>

            <section className="td-sec td-best">
              <div className="td-sec-h">
                <span className="td-sec-mark">★</span>
                <span className="td-sec-lbl">Best for</span>
              </div>
              <p className="td-best-body">{detail.best}</p>
            </section>
          </>
        ) : (
          <>
            <p className="td-blurb td-stub">
              Detailed analysis for <em>{techLabel}</em> is not yet on file.
            </p>
            <div className="td-stub-note">
              <span className="td-stub-mark">⌖</span>
              <p>
                This vendor was named in the component's tech list, but no
                pros/cons/best-for analysis has been authored yet. The catalog
                covers ~50 of the most-cited platforms across the stack —
                expect this entry to be filled in as the gazetteer grows.
              </p>
            </div>
            <div className="td-fallback">
              <div className="td-fallback-h">General questions to ask any vendor in this category</div>
              <ul>
                <li>What is the license model, and what changes at scale?</li>
                <li>Self-hosted, hosted, or both? Where does the data sit?</li>
                <li>How does it fail — outage, rate-limit, dependency?</li>
                <li>Lock-in vector: format, API, runtime, or contract?</li>
                <li>Maturity: research / beta / GA / mature / sunsetting?</li>
                <li>Who else in your industry runs it in production?</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

const Dossier = ({ layerId, compId, onClose, onOpenComp, onOpenLayer, sourceRect }) => {
  const layer = window.LAYERS.find(l => l.id === layerId);
  const [openTech, setOpenTech] = React.useState(null);

  // Reset tech panel whenever the component changes
  React.useEffect(() => { setOpenTech(null); }, [compId, layerId]);

  if (!layer) return null;
  const comp = compId ? layer.components.find(c => c.id === compId) : null;

  // Layer overview (no specific component selected)
  if (!comp) {
    return (
      <aside className="hud dossier" style={{ "--layer-ink": layer.ink }}>
        <div className="hud-h">
          <div className="crumbs">
            <button onClick={() => onOpenLayer(null)}>Atlas</button>
            <span>/</span>
            <span>Layer {layer.n}</span>
          </div>
          <button className="closex" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="body">
          <div className="id-strip">
            <span className="sw" />
            <span>Layer · {layer.n}</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span>{layer.components.length} components</span>
          </div>
          <h2>{layer.name}</h2>
          <div className="tag">{layer.tagline}</div>
          <p>{layer.exec}</p>
          <div className="eng-tech">{layer.eng}</div>
          <div className="section-h">Components</div>
          <div className="comp-list">
            {layer.components.map((c, i) => (
              <button key={c.id} onClick={() => onOpenComp(layer.id, c.id)}>
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                <span>{c.name}</span>
                <span className="arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Component drill-down
  const idx = layer.components.findIndex(c => c.id === comp.id);
  const prev = layer.components[idx - 1];
  const next = layer.components[idx + 1];

  return (
    <>
      <ArrowOverlay sourceRect={sourceRect} />

      <aside className="hud dossier expanded" style={{ "--layer-ink": layer.ink }}>
        <div className="hud-h">
          <div className="crumbs">
            <button onClick={() => onOpenLayer(null)}>Atlas</button>
            <span>/</span>
            <button onClick={() => onOpenLayer(layer.id)}>{layer.name}</button>
            <span>/</span>
            <span>{comp.name}</span>
          </div>
          <button className="closex" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="body">
          <div className="id-strip">
            <span className="sw" />
            <span>{layer.n}.{String(idx + 1).padStart(2, "0")}</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span>{layer.name}</span>
          </div>
          <h2>{comp.name}</h2>

          {comp.what && (
            <section className="dsec">
              <div className="dsec-h">
                <span className="dsec-num">01</span>
                <span className="dsec-lbl">What it is</span>
              </div>
              <p className="dsec-body">{comp.what}</p>
            </section>
          )}

          {comp.why && (
            <section className="dsec">
              <div className="dsec-h">
                <span className="dsec-num">02</span>
                <span className="dsec-lbl">Why it matters</span>
              </div>
              <p className="dsec-body">{comp.why}</p>
            </section>
          )}

          {comp.eng && (
            <section className="dsec">
              <div className="dsec-h">
                <span className="dsec-num">↳</span>
                <span className="dsec-lbl">Engineering note</span>
              </div>
              <div className="eng-tech">{comp.eng}</div>
            </section>
          )}

          {comp.tech && comp.tech.length > 0 && (
            <section className="dsec">
              <div className="dsec-h">
                <span className="dsec-num">03</span>
                <span className="dsec-lbl">Technologies that solve this</span>
                <span className="dsec-count">{comp.tech.length}</span>
              </div>
              <div className="tech-list">
                {comp.tech.map((t, i) => {
                  const has = window.lookupTech && window.lookupTech(t);
                  const isOpen = openTech === t;
                  return (
                    <button key={i}
                            className={`tech-row ${isOpen ? "is-open" : ""} ${has ? "has-detail" : "no-detail"}`}
                            onClick={() => setOpenTech(isOpen ? null : t)}>
                      <span className="tech-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="tech-name">{t}</span>
                      <span className="tech-meta">
                        {has ? <span className="tech-has">analysis</span> : <span className="tech-stub">brief</span>}
                        <span className="tech-arrow">{isOpen ? "×" : "→"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "space-between" }}>
            <button className="iconbtn" disabled={!prev}
                    onClick={() => prev && onOpenComp(layer.id, prev.id)}
                    style={{ width: "auto", padding: "0 12px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              ← {prev ? prev.name : "—"}
            </button>
            <button className="iconbtn" disabled={!next}
                    onClick={() => next && onOpenComp(layer.id, next.id)}
                    style={{ width: "auto", padding: "0 12px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {next ? next.name : "—"} →
            </button>
          </div>
        </div>
      </aside>

      {openTech && (
        <TechDetail techLabel={openTech}
                    layerInk={layer.ink}
                    onClose={() => setOpenTech(null)} />
      )}
    </>
  );
};

window.Dossier = Dossier;
