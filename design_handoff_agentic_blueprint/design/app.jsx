// Anatomy of an Agentic Platform — v2 Shell
// Holographic / ethereal · isometric architectural section.

const { useState, useEffect, useMemo, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "view": "atlas",
  "ambientMotion": true,
  "showHotkeys": true,
  "typeScale": 1.18
}/*EDITMODE-END*/;

// ── Glossary popovers ──────────────────────────────────────────
window.GLOSSARY = {
  "OAuth 2.0": "Industry-standard protocol for delegated authorization.",
  "OIDC": "OpenID Connect — identity layer on top of OAuth 2.0.",
  "SSE": "Server-Sent Events — one-way streaming over HTTP.",
  "SignalR": "Microsoft's real-time messaging library.",
  "WebRTC": "Peer-to-peer protocol for low-latency audio/video/data.",
  "STT": "Speech-to-Text (transcription).",
  "TTS": "Text-to-Speech (synthesis).",
  "JWT": "JSON Web Token — signed, compact claims envelope.",
  "MSAL": "Microsoft Authentication Library.",
  "OpenAPI": "Specification for describing REST APIs.",
  "REST": "Representational State Transfer — HTTP-based API style.",
  "A2A": "Agent-to-Agent — open protocol for agent-to-agent delegation.",
  "Agent Card": "JSON document describing an agent's capabilities.",
  "Conditional Access": "Identity policies that consider device, location, risk.",
  "SPIFFE": "Secure Production Identity Framework — workload identity standard.",
  "SPIRE": "Reference implementation of SPIFFE.",
  "Workload Identity": "Identity issued to a software process, not a person.",
  "JIT": "Just-In-Time — credentials issued on demand, expire quickly.",
  "Least Privilege": "Grant the minimum permissions needed.",
  "OPA": "Open Policy Agent — general-purpose policy engine.",
  "Cedar": "AWS's policy language for fine-grained access control.",
  "ABAC": "Attribute-Based Access Control.",
  "Classifier": "Model that tags inputs into categories.",
  "Adaptive Routing": "Route selection that learns from real-time signals.",
  "Plan-and-Execute": "Pattern: decompose into plan, then run subtasks.",
  "DAG": "Directed Acyclic Graph — task dependency structure.",
  "CQRS": "Command/Query Responsibility Segregation.",
  "Turn Loop": "Single round-trip in an agent conversation.",
  "Supervisor Pattern": "One coordinator delegates to specialist agents.",
  "Progressive Disclosure": "Load detail only when needed.",
  "SKILL.md": "Markdown file declaring an agent skill (Anthropic convention).",
  "Context Window": "Maximum tokens an LLM can attend to at once.",
  "Meta-Harness": "Self-improving loop around an agent.",
  "Regression Suite": "Tests that catch quality regressions.",
  "Cascade": "Try cheap model first, escalate on low confidence.",
  "Routing": "Picking the right model/agent for a request.",
  "Circuit Breaker": "Auto-disable a failing dependency to prevent cascading failure.",
  "429": "HTTP 'Too Many Requests' — rate-limit signal.",
  "Embedding": "Vector representation of text for semantic comparison.",
  "Semantic Cache": "Cache keyed by meaning, not exact match.",
  "PII": "Personally Identifiable Information.",
  "Tokenization": "Replacing sensitive values with reversible tokens.",
  "Quota": "Spending or usage cap.",
  "FinOps": "Cloud financial operations discipline.",
  "MCP": "Model Context Protocol — Anthropic standard for tool access.",
  "AITool": "Microsoft.Extensions.AI tool abstraction.",
  "Apigee": "Google's API management platform.",
  "Playwright": "Browser automation framework.",
  "Computer Use": "Agent driving a GUI as a human would.",
  "microVM": "Lightweight VM (e.g. Firecracker) for strong isolation.",
  "gVisor": "User-space kernel for sandboxed containers.",
  "Mem0": "Open-source agent memory layer.",
  "Letta": "Stateful-agent framework (formerly MemGPT).",
  "Neo4j": "Graph database.",
  "Kuzu": "Embedded graph database.",
  "Triples": "Subject–predicate–object data atoms.",
  "Skill File": "Markdown definition of an agent capability.",
  "Vector DB": "Database optimized for nearest-neighbor search on embeddings.",
  "BM25": "Classic sparse text-relevance ranking function.",
  "Hybrid Search": "Combining sparse and dense retrieval.",
  "Leiden": "Community-detection algorithm for graphs.",
  "Cognee": "Open-source knowledge-graph memory framework.",
  "Provenance": "Origin record for a piece of data.",
  "RAG": "Retrieval-Augmented Generation.",
  "RAPTOR": "Recursive abstractive tree summarization for retrieval.",
  "RRF": "Reciprocal Rank Fusion — combines multiple ranked lists.",
  "CRAG": "Corrective RAG — retrieval-quality evaluation step.",
  "Append-Only": "Storage that only allows new entries, never edits.",
  "Checkpoint": "Saved snapshot of state for resume.",
  "State Machine": "Finite set of states + transitions.",
  "Service Registry": "Directory of running services and their endpoints.",
  "OpenTelemetry": "Vendor-neutral observability standard.",
  "Span": "Single timed unit of work in a distributed trace.",
  "Prometheus": "Open-source metrics database.",
  "p99": "99th-percentile latency.",
  "LLM-as-Judge": "Using a model to grade another model's output.",
  "Rubric": "Structured grading criteria.",
  "Annotation Queue": "Human review backlog with structured feedback.",
  "Drift": "Distributional change in inputs or outputs over time.",
  "KL Divergence": "Statistical distance between two distributions.",
  "Llama Guard": "Meta's safety classifier for prompts and outputs.",
  "Prompt Injection": "Attack that hijacks an LLM via crafted input.",
  "Hash Chain": "Append-only log where each entry hashes the previous.",
  "SOX": "Sarbanes-Oxley financial-reporting regulation.",
  "HIPAA": "US health-data privacy regulation.",
  "GDPR": "EU general data protection regulation.",
  "Escalation": "Handing off to a human reviewer.",
  "Autonomy Tier": "Level of agent independence (observe → autonomous).",
  "ISO 42001": "International standard for AI management systems.",
  "NIST AI RMF": "US AI Risk Management Framework.",
  "EU AI Act": "EU regulation on AI systems by risk class.",
  "postMessage": "Browser API for cross-frame messaging.",
  "iframe": "Embedded HTML document.",
};

// ── Topbar + view tabs ─────────────────────────────────────────
const Topbar = ({ view, setView, theme, setTheme, onPrint }) => (
  <header className="topbar">
    <div className="brand">
      <div className="mark" />
      <div className="label">
        <div className="title">The Anatomy of an Agentic Platform</div>
        <div className="sub">Vol.01 · Field Atlas · 2026</div>
      </div>
    </div>

    <div className="viewtabs" role="tablist">
      <button className={view === "atlas" ? "on" : ""} onClick={() => setView("atlas")}>
        <span className="num">i</span>Atlas
      </button>
      <button className={view === "patterns" ? "on" : ""} onClick={() => setView("patterns")}>
        <span className="num">ii</span>Patterns
      </button>
      <button className={view === "example" ? "on" : ""} onClick={() => setView("example")}>
        <span className="num">iii</span>Example
      </button>
    </div>

    <div className="toolbar">
      <button className="iconbtn" onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title="Toggle theme">{theme === "light" ? "◐" : "◑"}</button>
      <button className="iconbtn" onClick={onPrint} title="Print / Save as PDF">⎙</button>
    </div>
  </header>
);

// ── Status rail under topbar ───────────────────────────────────
const StatRail = ({ view }) => {
  const totalComps = window.LAYERS.reduce((s, l) => s + l.components.length, 0);
  return (
    <div className="statrail">
      <span className="stat"><b>10</b> Layers</span>
      <span className="stat"><b>{totalComps}</b> Components</span>
      <span className="stat"><b>{window.PATTERNS.length}</b> Topologies</span>
      <span className="spacer" />
      <span className="crosshair">
        <span className="dot" />
        Live diagram · {view.toUpperCase()}
      </span>
    </div>
  );
};

// ── Reveal scrubber (Atlas only) ───────────────────────────────
const RevealScrubber = ({ revealUpTo, setRevealUpTo, total }) => {
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    if (revealUpTo >= total - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setRevealUpTo(revealUpTo + 1), 300);
    return () => clearTimeout(t);
  }, [playing, revealUpTo]);

  const startReveal = () => {
    setRevealUpTo(-1);
    setTimeout(() => setPlaying(true), 50);
  };

  const layer = window.LAYERS[Math.max(0, Math.min(total - 1, revealUpTo))];
  return (
    <div className="hud reveal">
      <button className="ctl" onClick={startReveal} title="Replay reveal">⟲</button>
      <button className="ctl play" onClick={() => setPlaying(p => !p)} title="Play/Pause">
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="scrub" onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const f = (e.clientX - r.left) / r.width;
        setRevealUpTo(Math.max(0, Math.min(total - 1, Math.round(f * (total - 1)))));
        setPlaying(false);
      }}>
        <div className="bar" style={{ width: `${((revealUpTo + 1) / total) * 100}%` }} />
        <div className="ticks">
          {Array.from({ length: total }).map((_, i) => <div key={i} className="tick" />)}
        </div>
      </div>
      <div className="label">
        <span className="n">{String(Math.max(0, revealUpTo) + 1).padStart(2, "0")}</span>
        / {String(total).padStart(2, "0")} · {layer.name}
      </div>
    </div>
  );
};

// ── Zoom controls ──────────────────────────────────────────────
const ZoomControls = ({ onZoomIn, onZoomOut, onReset }) => (
  <div className="zoomctl">
    <button onClick={onZoomIn} title="Zoom in">＋</button>
    <button onClick={onZoomOut} title="Zoom out">−</button>
    <button onClick={onReset} title="Recenter" style={{ fontSize: 10 }}>⊕</button>
  </div>
);

// ── Intro card (top-left) ──────────────────────────────────────
const Intro = () => (
  <div className="hud intro">
    <div className="eyebrow">Field Atlas · Cross-Section</div>
    <h1>How an agentic platform actually works.</h1>
    <p>
      Ten layers. Forty-six components. One conversation passing through them.
      Pan, zoom, hover, click — or scrub the reveal to watch it assemble.
    </p>
    <div className="legend">
      <div className="row"><span className="sw" style={{ background: "#67E8F9", color: "#67E8F9" }} /> User surface</div>
      <div className="row"><span className="sw" style={{ background: "#A78BFA", color: "#A78BFA" }} /> Reasoning core</div>
      <div className="row"><span className="sw" style={{ background: "#F472B6", color: "#F472B6" }} /> Memory & data</div>
      <div className="row"><span className="sw" style={{ background: "#F87171", color: "#F87171" }} /> Governance</div>
    </div>
  </div>
);

// ── Hotkeys hint ───────────────────────────────────────────────
const HotkeyHint = () => (
  <div className="hotkeys">
    <span><kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> view</span>
    <span><kbd>←</kbd>/<kbd>→</kbd> scrub</span>
    <span><kbd>space</kbd> play</span>
    <span><kbd>esc</kbd> back</span>
  </div>
);

// ── Tweaks panel ───────────────────────────────────────────────
const Tweaks = ({ tweaks, setTweak }) => {
  const TP = window.TweaksPanel;
  return (
    <TP title="Tweaks">
      <window.TweakSection label="Aesthetic">
        <window.TweakRadio
          label="Theme"
          value={tweaks.theme}
          options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
          onChange={(v) => setTweak("theme", v)}
        />
        <window.TweakToggle label="Ambient motion" value={tweaks.ambientMotion}
          onChange={(v) => setTweak("ambientMotion", v)} />
        <window.TweakToggle label="Show hotkeys" value={tweaks.showHotkeys}
          onChange={(v) => setTweak("showHotkeys", v)} />
        <window.TweakSlider
          label="Type scale"
          value={tweaks.typeScale}
          min={0.9} max={1.5} step={0.02}
          onChange={(v) => setTweak("typeScale", v)}
        />
      </window.TweakSection>

      <window.TweakSection label="Reading">
        <window.TweakRadio
          label="View"
          value={tweaks.view}
          options={[
            { value: "atlas", label: "Atlas" },
            { value: "patterns", label: "Patterns" },
          ]}
          onChange={(v) => setTweak("view", v)}
        />
      </window.TweakSection>
    </TP>
  );
};

// ── Main App ───────────────────────────────────────────────────
const App = () => {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const view = tweaks.view;
  const theme = tweaks.theme;
  const setView = (v) => setTweak("view", v);
  const setTheme = (v) => setTweak("theme", v);

  const [revealUpTo, setRevealUpTo] = useState(window.LAYERS.length - 1);
  const [playReveal, setPlayReveal] = useState(false);
  const [openLayer, setOpenLayer] = useState(null);
  const [openComp, setOpenComp] = useState(null);
  const [sourceRect, setSourceRect] = useState(null);
  const [hoveredComp, setHoveredComp] = useState(null);

  // First-load reveal animation
  useEffect(() => {
    setRevealUpTo(-1);
    let i = 0;
    const tick = () => {
      i++;
      setRevealUpTo(i);
      if (i < window.LAYERS.length - 1) setTimeout(tick, 220);
    };
    setTimeout(tick, 450);
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Apply type scale to root
  useEffect(() => {
    document.documentElement.style.setProperty("--type-scale", String(tweaks.typeScale ?? 1.18));
  }, [tweaks.typeScale]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "1") setView("atlas");
      else if (e.key === "2") setView("patterns");
      else if (e.key === "3") setView("example");
      else if (e.key === "Escape") {
        if (openComp) setOpenComp(null);
        else if (openLayer) setOpenLayer(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openComp, openLayer]);

  const onPrint = () => window.print();

  const onOpenLayer = (id) => { setOpenLayer(id); setOpenComp(null); setSourceRect(null); };
  const onOpenComp = (lid, cid, rect) => { setOpenLayer(lid); setOpenComp(cid); setSourceRect(rect || null); };
  const onClose = () => { setOpenLayer(null); setOpenComp(null); setSourceRect(null); };

  return (
    <>
      <Topbar
        view={view} setView={setView}
        theme={theme} setTheme={setTheme}
        onPrint={onPrint}
      />
      <StatRail view={view} />

      <div className="stage">
        {view === "atlas" && (
          <>
            <window.Atlas
              revealUpTo={revealUpTo}
              activeFlow={null}
              onOpenLayer={onOpenLayer}
              onOpenComp={onOpenComp}
              hoveredComp={hoveredComp}
              setHoveredComp={setHoveredComp}
            />
            {!openLayer && !openComp && <Intro />}
            <RevealScrubber
              revealUpTo={revealUpTo}
              setRevealUpTo={setRevealUpTo}
              total={window.LAYERS.length}
            />
            {(openLayer || openComp) && (
              <window.Dossier
                layerId={openLayer}
                compId={openComp}
                sourceRect={sourceRect}
                onClose={onClose}
                onOpenLayer={onOpenLayer}
                onOpenComp={onOpenComp}
              />
            )}
          </>
        )}

        {view === "patterns" && (
          <window.Patterns />
        )}

        {view === "example" && (
          <window.Example />
        )}

        {tweaks.showHotkeys && view === "atlas" && !openLayer && !openComp && <HotkeyHint />}
      </div>

      <Tweaks tweaks={tweaks} setTweak={setTweak} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
