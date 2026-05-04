"use client";

import { useState } from "react";
import { PATTERNS } from "@/data/patterns";
import { PatternViz } from "./pattern-viz";

export function PatternExplorer() {
  const [activeId, setActiveId] = useState(PATTERNS[0].id);
  const active = PATTERNS.find((p) => p.id === activeId) ?? PATTERNS[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ padding: "16px 24px" }}>
      {/* Above the fold: 3-column */}
      <div className="flex gap-6" style={{ minHeight: 460 }}>
        {/* Left: pattern list */}
        <div className="flex flex-col gap-2" style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--ink-4)", marginBottom: 4 }}>
            TOPOLOGIES
          </div>
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className="text-left px-3 py-2.5 rounded-md"
              style={{
                border: `1px solid ${activeId === p.id ? "var(--line-3)" : "var(--line)"}`,
                background: activeId === p.id ? "var(--glass-2)" : "transparent",
                color: activeId === p.id ? "var(--ink)" : "var(--ink-3)",
                cursor: "pointer",
                fontFamily: "var(--sans)",
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{p.summary}</div>
            </button>
          ))}
        </div>

        {/* Center: diagram */}
        <div className="flex-1 flex items-center justify-center">
          <PatternViz id={active.id} />
        </div>

        {/* Right: stats rail */}
        <div className="flex flex-col gap-3" style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--ink-4)" }}>
            STATS
          </div>
          {active.stats && Object.entries(active.stats).map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", textTransform: "uppercase" }}>{k}</div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{v}</div>
            </div>
          ))}
          {active.inTheWild.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 4 }}>
                IN THE WILD
              </div>
              {active.inTheWild.map((w, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>{w}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Below the fold: long-form content */}
      <div style={{ maxWidth: 800, margin: "32px auto 0" }}>
        <ContentSection title="Description" content={active.description} />
        {active.description2 && <ContentSection title="Variants" content={active.description2} />}

        {active.bestFor.length > 0 && (
          <BulletSection title="Best For" items={active.bestFor} />
        )}
        {active.avoidWhen.length > 0 && (
          <BulletSection title="Avoid When" items={active.avoidWhen} />
        )}
        {active.flow.length > 0 && (
          <BulletSection title="Flow" items={active.flow} numbered />
        )}

        {active.scaling && <ContentSection title="Scaling" content={active.scaling} />}
        {active.failureMode && <ContentSection title="Failure Mode" content={active.failureMode} />}
        {active.example && <ContentSection title="Example" content={active.example} />}

        {active.stack.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.15em", color: "var(--ink-3)", marginBottom: 8 }}>
              RECOMMENDED STACK
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {active.stack.map((s, i) => (
                <span key={i} style={{
                  fontFamily: "var(--mono)", fontSize: 10, padding: "2px 8px", borderRadius: 4,
                  border: "1px solid var(--line)", color: "var(--ink-3)",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentSection({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.15em", color: "var(--ink-3)", marginBottom: 8 }}>
        {title.toUpperCase()}
      </h3>
      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{content}</p>
    </div>
  );
}

function BulletSection({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.15em", color: "var(--ink-3)", marginBottom: 8 }}>
        {title.toUpperCase()}
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", flexShrink: 0, marginTop: 2 }}>
              {numbered ? `${String(i + 1).padStart(2, "0")}` : "—"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
