"use client";

import { useState, useMemo } from "react";
import { EXAMPLE_TRACE } from "@/data/example-trace";
import { LAYERS } from "@/data/layers";
import { MiniAtlas } from "./mini-atlas";
import { StepIllustration } from "./step-illustration";

export function ExampleView() {
  const [activeStep, setActiveStep] = useState(0);
  const trace = EXAMPLE_TRACE;
  const step = trace.steps[activeStep];
  const stepLayer = LAYERS.find((l) => l.id === step.layer);
  const stepComp = stepLayer?.components.find((c) => c.id === step.comp);

  const cumulative = useMemo(() => {
    let tokens = 0, cost = 0;
    for (let i = 0; i <= activeStep; i++) {
      const s = trace.steps[i];
      if (s.tokens) tokens += s.tokens;
      if (s.cost) cost += parseFloat(s.cost.replace(/\$/g, ""));
    }
    return { tokens, cost: cost.toFixed(4), stepsComplete: activeStep + 1, total: trace.steps.length };
  }, [activeStep, trace.steps]);

  const prevStep = activeStep > 0 ? trace.steps[activeStep - 1] : null;
  const nextStep = activeStep < trace.steps.length - 1 ? trace.steps[activeStep + 1] : null;
  const prevLayer = prevStep ? LAYERS.find((l) => l.id === prevStep.layer) : null;
  const nextLayer = nextStep ? LAYERS.find((l) => l.id === nextStep.layer) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ padding: "14px 18px 14px", gap: 10 }}>
      {/* TOP BAR: Title only */}
      <div style={{ flexShrink: 0 }}>
        <h2 style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontSize: "calc(32px * var(--type-scale, 1.18))",
          fontWeight: 400,
          color: "var(--ink)",
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.01em",
        }}>
          {trace.title}
        </h2>
        <p style={{
          fontFamily: "var(--sans)",
          fontSize: "calc(13px * var(--type-scale, 1.18))",
          color: "var(--ink-2)",
          margin: "6px 0 0",
          lineHeight: 1.5,
        }}>
          {trace.subtitle}
        </p>
      </div>

      {/* PROGRESS BAR */}
      <div className="flex gap-1" style={{ flexShrink: 0, height: 5, borderRadius: 3, overflow: "hidden" }}>
        {trace.steps.map((s, i) => {
          const sLayer = LAYERS.find((l) => l.id === s.layer);
          return (
            <div
              key={i}
              onClick={() => setActiveStep(i)}
              style={{
                flex: 1,
                background: i <= activeStep ? sLayer?.ink : "var(--line)",
                opacity: i === activeStep ? 1 : i < activeStep ? 0.5 : 0.3,
                cursor: "pointer",
                borderRadius: 3,
                transition: "all 0.2s",
              }}
            />
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(0, 1.6fr) minmax(300px, 1.1fr)",
        gap: 12,
        flex: 1,
        minHeight: 0,
      }}>
        {/* LEFT COLUMN: Step list */}
        <div className="flex flex-col overflow-y-auto" style={{ gap: 2, minHeight: 0 }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.22em",
            color: "var(--ink-4)", textTransform: "uppercase" as const,
            padding: "0 10px 8px",
          }}>
            Trace &middot; {trace.steps.length} steps
          </div>
          {trace.steps.map((s, i) => {
            const sLayer = LAYERS.find((l) => l.id === s.layer);
            const isActive = i === activeStep;
            const isPast = i < activeStep;
            return (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr 6px",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "9px 10px",
                  borderRadius: 4,
                  border: `1px solid ${isActive ? "var(--line-2)" : "transparent"}`,
                  background: isActive
                    ? `linear-gradient(90deg, ${sLayer?.ink}14, transparent 80%)`
                    : "transparent",
                  cursor: "pointer",
                  opacity: isPast ? 0.55 : 1,
                  transition: "all 160ms",
                  textAlign: "left" as const,
                }}
              >
                <span style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: isActive || isPast ? sLayer?.ink : "var(--ink-4)",
                  paddingTop: 2,
                }}>
                  {s.n}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: isActive ? sLayer?.ink : "var(--ink-4)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase" as const,
                  }}>
                    {sLayer?.name}
                  </span>
                  <span style={{
                    fontFamily: "var(--sans)",
                    fontSize: 14,
                    lineHeight: 1.35,
                    color: isActive ? "var(--ink)" : isPast ? "var(--ink-2)" : "var(--ink-3)",
                    fontWeight: isActive ? 500 : 400,
                  }}>
                    {s.title}
                  </span>
                </span>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                  background: isActive ? sLayer?.ink : isPast ? sLayer?.ink : "var(--line)",
                  opacity: isPast && !isActive ? 0.55 : 1,
                  boxShadow: isActive ? `0 0 12px ${sLayer?.ink}` : "none",
                }} />
              </button>
            );
          })}
        </div>

        {/* CENTER: Illustration + Narrative + Payload */}
        <div className="flex flex-col glass" style={{ borderRadius: 12, padding: "18px 22px", overflow: "hidden", minWidth: 0, minHeight: 0 }}>
          {/* Step header */}
          <div className="flex items-center justify-between mb-3" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div style={{
                fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: "0.18em",
                color: stepLayer?.ink, textTransform: "uppercase" as const,
              }}>
                STEP {step.n}
              </div>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 12.5, color: stepLayer?.ink, opacity: 0.7,
                padding: "3px 10px", border: `1px solid ${stepLayer?.ink}`, borderRadius: 4,
              }}>
                {stepLayer?.name} &rsaquo; {stepComp?.name}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => activeStep > 0 && setActiveStep(activeStep - 1)}
                disabled={activeStep === 0}
                style={{
                  fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: "0.16em",
                  textTransform: "uppercase" as const, padding: "8px 14px", borderRadius: 3,
                  border: "1px solid var(--line)", background: "transparent",
                  cursor: activeStep > 0 ? "pointer" : "not-allowed",
                  color: activeStep > 0 ? "var(--ink-2)" : "var(--ink-4)",
                  opacity: activeStep > 0 ? 1 : 0.35, transition: "all 140ms",
                }}
              >
                &larr; Prev
              </button>
              <button
                onClick={() => activeStep < trace.steps.length - 1 && setActiveStep(activeStep + 1)}
                disabled={activeStep === trace.steps.length - 1}
                style={{
                  fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: "0.16em",
                  textTransform: "uppercase" as const, padding: "8px 14px", borderRadius: 3,
                  border: `1px solid ${stepLayer?.ink}`, background: stepLayer?.ink,
                  cursor: activeStep < trace.steps.length - 1 ? "pointer" : "not-allowed",
                  color: "var(--bg-0)", fontWeight: 600,
                  opacity: activeStep < trace.steps.length - 1 ? 1 : 0.35, transition: "all 140ms",
                }}
              >
                Next &rarr;
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: "var(--display)", fontStyle: "italic",
            fontSize: "calc(24px * var(--type-scale, 1.18))", fontWeight: 400,
            color: "var(--ink)", margin: "0 0 12px", flexShrink: 0, lineHeight: 1.2,
          }}>
            {step.title}
          </h3>

          {/* Content area */}
          <div className="flex flex-1 gap-4 min-h-0 overflow-y-auto">
            <div className="flex-1 flex flex-col gap-4">
              <div style={{
                background: "var(--bg-1)", borderRadius: 10, padding: 14,
                border: "1px solid var(--line)", flexShrink: 0,
              }}>
                <StepIllustration layer={step.layer} ink={stepLayer?.ink ?? "var(--ink-3)"} stepN={step.n} />
              </div>
              <p style={{
                fontFamily: "var(--display)",
                fontSize: "calc(15px * var(--type-scale, 1.18))",
                color: "var(--ink)", lineHeight: 1.65, margin: 0, fontWeight: 400,
              }}>
                {step.narrative}
              </p>
              <div className="flex gap-3" style={{ flexShrink: 0 }}>
                {prevStep && (
                  <div style={{ flex: 1, padding: "10px 14px", borderRadius: 6, border: "1px solid var(--line)" }}>
                    <div style={{
                      fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)",
                      letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 4,
                    }}>
                      &larr; FROM STEP {prevStep.n}
                    </div>
                    <div style={{ color: prevLayer?.ink, fontSize: 13.5, lineHeight: 1.35 }}>{prevStep.title}</div>
                  </div>
                )}
                {nextStep && (
                  <div style={{ flex: 1, padding: "10px 14px", borderRadius: 6, border: "1px solid var(--line)" }}>
                    <div style={{
                      fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)",
                      letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 4,
                    }}>
                      NEXT STEP {nextStep.n} &rarr;
                    </div>
                    <div style={{ color: nextLayer?.ink, fontSize: 13.5, lineHeight: 1.35 }}>{nextStep.title}</div>
                  </div>
                )}
              </div>
              {(step.duration || step.tokens || step.cost) && (
                <div className="flex gap-5" style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-3)", flexShrink: 0 }}>
                  {step.duration && <span>&middot; {step.duration}</span>}
                  {step.tokens && <span>&middot; {step.tokens.toLocaleString()} tokens</span>}
                  {step.cost && <span>&middot; {step.cost}</span>}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3" style={{ flex: "0 1 400px", minWidth: 280 }}>
              {step.payload && Object.keys(step.payload).length > 0 && (
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.22em",
                    textTransform: "uppercase" as const, color: stepLayer?.ink, marginBottom: 8, opacity: 0.7,
                  }}>
                    PAYLOAD
                  </div>
                  <pre style={{
                    fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--ink-2)",
                    background: "var(--bg-0)", padding: "14px 16px", borderRadius: 6,
                    overflow: "auto", maxHeight: 400, lineHeight: 1.6,
                    border: "1px solid var(--line)", margin: 0,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>
                    {JSON.stringify(step.payload, null, 2)}
                  </pre>
                </div>
              )}
              {stepComp && (
                <div style={{
                  padding: "14px 16px", borderRadius: 8,
                  border: "1px solid var(--line)", background: "var(--bg-1)",
                }}>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.18em",
                    textTransform: "uppercase" as const, color: stepLayer?.ink, marginBottom: 6,
                  }}>
                    ABOUT THIS COMPONENT
                  </div>
                  <div style={{
                    fontFamily: "var(--sans)", fontSize: "calc(14px * var(--type-scale, 1.18))",
                    fontWeight: 500, color: "var(--ink)", marginBottom: 8,
                  }}>
                    {stepComp.name}
                  </div>
                  {stepComp.what && (
                    <p style={{
                      fontFamily: "var(--sans)", fontSize: "calc(13px * var(--type-scale, 1.18))",
                      color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 10px",
                    }}>
                      {stepComp.what}
                    </p>
                  )}
                  {stepComp.tech && stepComp.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
                      {stepComp.tech.slice(0, 5).map((t) => (
                        <span key={t} style={{
                          fontFamily: "var(--mono)", fontSize: 11.5, padding: "3px 10px",
                          borderRadius: 4, border: "1px solid var(--line)", color: "var(--ink-3)",
                        }}>
                          {t}
                        </span>
                      ))}
                      {stepComp.tech.length > 5 && (
                        <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, padding: "3px 10px", color: "var(--ink-4)" }}>
                          +{stepComp.tech.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mini atlas + persona/stats + outcome */}
        <div className="flex flex-col" style={{ gap: 10, minHeight: 0 }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.18em",
            textTransform: "uppercase" as const, color: "var(--ink-4)",
          }}>
            ARCHITECTURE MAP
          </div>
          <div className="glass flex-1" style={{
            borderRadius: 10, padding: "12px 8px", minHeight: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MiniAtlas activeLayer={step.layer} activeComp={step.comp} />
          </div>

          {/* Persona + running stats */}
          <div className="glass" style={{ borderRadius: 10, padding: "16px 20px" }}>
            <div className="flex items-center gap-4" style={{ marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--glass-2)", border: "2px solid var(--line-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 15, fontWeight: 600, color: "var(--ink-2)",
                flexShrink: 0,
              }}>
                MC
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)" }}>{trace.user.name}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-3)" }}>{trace.user.persona}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-4)", opacity: 0.7 }}>{trace.user.channel}</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8,
              }}>
                {[
                  { label: "PROGRESS", value: `${cumulative.stepsComplete} / ${cumulative.total}`, color: "var(--c1)" },
                  { label: "TOKENS", value: cumulative.tokens.toLocaleString(), color: "var(--c2)" },
                  { label: "COST", value: `$${cumulative.cost}`, color: "var(--c4)" },
                  { label: "DURATION", value: trace.outcome.duration as string, color: "var(--c5)" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div style={{
                      fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.14em",
                      color: "var(--ink-4)", textTransform: "uppercase" as const, marginBottom: 3,
                    }}>
                      {stat.label}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scenario totals — compact */}
          <div className="glass" style={{ borderRadius: 8, padding: "10px 16px" }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.22em",
              textTransform: "uppercase" as const, color: "var(--ink-4)", marginBottom: 6,
            }}>
              SCENARIO TOTALS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {Object.entries(trace.outcome).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center" style={{ padding: "2px 0" }}>
                  <span style={{
                    color: "var(--ink-4)", fontFamily: "var(--mono)", fontSize: 10.5,
                    letterSpacing: "0.14em", textTransform: "uppercase" as const,
                  }}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <span style={{
                    color: "var(--ink-2)", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500,
                  }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
