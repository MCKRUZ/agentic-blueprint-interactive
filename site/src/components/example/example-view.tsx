"use client";

import { useState } from "react";
import { EXAMPLE_TRACE } from "@/data/example-trace";
import { LAYERS } from "@/data/layers";
import { MiniAtlas } from "./mini-atlas";

export function ExampleView() {
  const [activeStep, setActiveStep] = useState(0);
  const trace = EXAMPLE_TRACE;
  const step = trace.steps[activeStep];
  const stepLayer = LAYERS.find((l) => l.id === step.layer);

  return (
    <div className="flex h-full overflow-hidden" style={{ padding: "16px 24px", gap: 24 }}>
      {/* Left: mini-atlas */}
      <div className="flex-1 flex flex-col">
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--ink-4)", marginBottom: 8 }}>
          {trace.title.toUpperCase()}
        </div>
        <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 16 }}>{trace.subtitle}</p>
        <div className="flex-1 overflow-auto">
          <MiniAtlas activeLayer={step.layer} activeComp={step.comp} />
        </div>
      </div>

      {/* Right: step list + detail */}
      <div className="flex flex-col" style={{ width: 380, flexShrink: 0 }}>
        <div className="flex flex-col gap-1 overflow-y-auto mb-4" style={{ maxHeight: "40%" }}>
          {trace.steps.map((s, i) => {
            const sLayer = LAYERS.find((l) => l.id === s.layer);
            return (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className="text-left px-3 py-2 rounded-md"
                style={{
                  border: `1px solid ${i === activeStep ? "var(--line-3)" : "var(--line)"}`,
                  background: i === activeStep ? "var(--glass-2)" : "transparent",
                  color: i === activeStep ? "var(--ink)" : i < activeStep ? "var(--ink-4)" : "var(--ink-3)",
                  cursor: "pointer",
                  fontSize: 12,
                  opacity: i < activeStep ? 0.5 : 1,
                }}
              >
                <span style={{ fontFamily: "var(--mono)", color: sLayer?.ink, marginRight: 6 }}>{s.n}.</span>
                <span style={{ fontSize: 10, color: "var(--ink-4)", marginRight: 6 }}>{sLayer?.name}</span>
                {s.title}
              </button>
            );
          })}
        </div>

        {/* Step detail */}
        <div className="glass flex-1 overflow-y-auto" style={{ padding: "16px 20px", borderRadius: 10 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: stepLayer?.ink, marginBottom: 4 }}>
            STEP {step.n} · {stepLayer?.name}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px", color: "var(--ink)" }}>{step.title}</h3>
          <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 12 }}>{step.narrative}</p>

          {step.payload && Object.keys(step.payload).length > 0 && (
            <details>
              <summary style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", cursor: "pointer", marginBottom: 6 }}>
                Payload
              </summary>
              <pre style={{
                fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)",
                background: "var(--bg-0)", padding: 12, borderRadius: 6,
                overflow: "auto", maxHeight: 200, lineHeight: 1.4,
              }}>
                {JSON.stringify(step.payload, null, 2)}
              </pre>
            </details>
          )}

          {(step.duration || step.tokens || step.cost) && (
            <div className="flex gap-4 mt-3" style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)" }}>
              {step.duration && <span>⏱ {step.duration}</span>}
              {step.tokens && <span>◆ {step.tokens} tokens</span>}
              {step.cost && <span>$ {step.cost}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
