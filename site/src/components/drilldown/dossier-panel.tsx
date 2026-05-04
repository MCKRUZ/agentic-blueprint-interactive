"use client";

import { useState } from "react";
import { LAYERS } from "@/data/layers";
import { lookupTech } from "@/data/tech-catalog";
import { useAppStore } from "@/store/app-store";
import { GlossaryChip } from "./glossary-chip";
import type { Layer, Component } from "@/data/types";

export function DossierPanel() {
  const openLayer = useAppStore((s) => s.openLayer);
  const openComp = useAppStore((s) => s.openComp);
  const closeDossier = useAppStore((s) => s.closeDossier);
  const openDossier = useAppStore((s) => s.openDossier);

  if (!openLayer) return null;

  const layer = LAYERS.find((l) => l.id === openLayer);
  if (!layer) return null;

  const comp = openComp ? layer.components.find((c) => c.id === openComp) : null;

  return (
    <aside
      className="glass absolute overflow-y-auto"
      style={{
        top: 0,
        right: 0,
        bottom: 0,
        width: 480,
        zIndex: 70,
        borderRadius: "0 0 0 12px",
        padding: "20px 24px 32px",
        animation: "dossierIn 0.35s ease-out",
      }}
    >
      {/* Breadcrumb + close */}
      <div className="flex items-center justify-between mb-4">
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            color: "var(--ink-4)",
            letterSpacing: "0.04em",
          }}
        >
          <span style={{ cursor: "pointer" }} onClick={() => closeDossier()}>Atlas</span>
          {" / "}
          <span
            style={{ cursor: comp ? "pointer" : "default" }}
            onClick={() => comp && openDossier(layer.id)}
          >
            {layer.name}
          </span>
          {comp && (
            <>
              {" / "}
              <span style={{ color: "var(--ink-2)", textTransform: "uppercase" }}>{comp.name}</span>
            </>
          )}
        </div>
        <button
          onClick={closeDossier}
          style={{
            background: "none",
            border: "none",
            color: "var(--ink-4)",
            cursor: "pointer",
            fontSize: 22,
            lineHeight: 1,
            padding: "4px 6px",
          }}
        >
          ×
        </button>
      </div>

      {comp ? (
        <ComponentDossier layer={layer} comp={comp} />
      ) : (
        <LayerDossier layer={layer} onOpenComp={(compId) => openDossier(layer.id, compId)} />
      )}
    </aside>
  );
}

function SectionLabel({ n, text, ink, count }: { n: string; text: string; ink?: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-2" style={{ marginTop: 24 }}>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          fontWeight: 700,
          color: ink || "var(--accent)",
          letterSpacing: "0.08em",
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
        }}
      >
        {text}
      </span>
      {count !== undefined && (
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--ink-4)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function LayerDossier({ layer, onOpenComp }: { layer: Layer; onOpenComp: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div style={{ width: 14, height: 14, borderRadius: 3, background: layer.ink }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.12em", color: layer.ink }}>
          {layer.n} · {layer.name.toUpperCase()}
        </span>
      </div>
      <h2 style={{ fontFamily: "var(--display)", fontSize: 34, fontWeight: 600, margin: "0 0 4px", color: "var(--ink)" }}>
        {layer.name}
      </h2>
      <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 16, color: "var(--ink-3)", margin: "0 0 20px" }}>
        {layer.tagline}
      </p>

      <SectionLabel n="01" text="EXECUTIVE SUMMARY" ink={layer.ink} />
      <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
        {layer.exec}
      </p>

      <SectionLabel n="02" text="ENGINEERING NOTE" ink={layer.ink} />
      <blockquote
        style={{
          fontFamily: "var(--mono)",
          fontSize: 18,
          lineHeight: 1.6,
          color: "var(--ink)",
          borderLeft: `3px solid ${layer.ink}`,
          margin: "0 0 20px",
          padding: "16px 20px",
          background: "var(--glass)",
          borderRadius: "0 8px 8px 0",
        }}
      >
        {layer.eng}
      </blockquote>

      <SectionLabel n="03" text="COMPONENTS" ink={layer.ink} count={layer.components.length} />
      <div className="flex flex-col gap-1">
        {layer.components.map((c, i) => (
          <button
            key={c.id}
            onClick={() => onOpenComp(c.id)}
            className="flex items-center gap-3 text-left px-3 py-2.5 rounded-md"
            style={{
              border: "1px solid var(--line)",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--sans)",
            }}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: layer.ink, minWidth: 20 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ flex: 1, color: "var(--ink-2)", fontSize: 16 }}>{c.name}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.1em" }}>
              OPEN →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ComponentDossier({ layer, comp }: { layer: Layer; comp: Component }) {
  const compIdx = layer.components.findIndex((c) => c.id === comp.id) + 1;
  const [expandedTech, setExpandedTech] = useState<string | null>(null);

  return (
    <div>
      {/* Layer badge */}
      <div className="flex items-center gap-2 mb-1">
        <div style={{ width: 14, height: 14, borderRadius: 3, background: layer.ink }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.12em", color: layer.ink }}>
          {layer.n}.{String(compIdx).padStart(2, "0")} · {layer.name.toUpperCase()}
        </span>
      </div>

      {/* Component name */}
      <h2 style={{ fontFamily: "var(--display)", fontSize: 38, fontWeight: 600, margin: "0 0 8px", color: "var(--ink)" }}>
        {comp.name}
      </h2>

      {/* 01 WHAT IT IS */}
      {comp.what && (
        <>
          <SectionLabel n="01" text="WHAT IT IS" ink={layer.ink} />
          <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            {comp.what}
          </p>
        </>
      )}

      {/* 02 WHY IT MATTERS */}
      {comp.why && (
        <>
          <SectionLabel n="02" text="WHY IT MATTERS" ink={layer.ink} />
          <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            {comp.why}
          </p>
        </>
      )}

      {/* Engineering Note */}
      <div className="flex items-center gap-2" style={{ marginTop: 24, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>🔧</span>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
        }}>
          ENGINEERING NOTE
        </span>
      </div>
      <blockquote
        style={{
          fontFamily: "var(--mono)",
          fontSize: 22,
          lineHeight: 1.55,
          color: "var(--ink)",
          borderLeft: `3px solid ${layer.ink}`,
          margin: "0 0 8px",
          padding: "20px 24px",
          background: "var(--glass)",
          borderRadius: "0 8px 8px 0",
        }}
      >
        {comp.eng}
      </blockquote>

      {/* 03 TECHNOLOGIES THAT SOLVE THIS */}
      {comp.tech && comp.tech.length > 0 && (
        <>
          <SectionLabel n="03" text="TECHNOLOGIES THAT SOLVE THIS" ink={layer.ink} count={comp.tech.length} />
          <div className="flex flex-col gap-0.5">
            {comp.tech.map((t, i) => {
              const entry = lookupTech(t);
              const hasAnalysis = entry && entry.pros.length > 0;
              const isExpanded = expandedTech === t;

              return (
                <div key={t}>
                  <button
                    onClick={() => setExpandedTech(isExpanded ? null : t)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5"
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      cursor: "pointer",
                      fontFamily: "var(--sans)",
                    }}
                  >
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-4)", minWidth: 20 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ flex: 1, color: "var(--ink-2)", fontSize: 16 }}>{t}</span>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        color: hasAnalysis ? layer.ink : "var(--ink-4)",
                      }}
                    >
                      {hasAnalysis ? "ANALYSIS" : "BRIEF"} →
                    </span>
                  </button>

                  {isExpanded && entry && (
                    <div
                      style={{
                        padding: "12px 16px 16px 44px",
                        borderBottom: "1px solid var(--line)",
                        background: "var(--glass)",
                      }}
                    >
                      <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 10px" }}>
                        {entry.blurb}
                      </p>
                      {hasAnalysis && (
                        <div className="flex gap-4" style={{ fontSize: 13 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--c1)", letterSpacing: "0.12em", marginBottom: 4 }}>
                              PROS
                            </div>
                            {entry.pros.map((p, pi) => (
                              <div key={pi} style={{ color: "var(--ink-3)", lineHeight: 1.5, marginBottom: 2 }}>
                                + {p}
                              </div>
                            ))}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--signal)", letterSpacing: "0.12em", marginBottom: 4 }}>
                              CONS
                            </div>
                            {entry.cons.map((c, ci) => (
                              <div key={ci} style={{ color: "var(--ink-3)", lineHeight: 1.5, marginBottom: 2 }}>
                                − {c}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-3)" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.1em" }}>BEST FOR </span>
                        {entry.best}
                      </div>
                      <div className="flex gap-3" style={{ marginTop: 6 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>
                          {entry.license}
                        </span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>
                          {entry.maturity}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Glossary terms */}
      {comp.terms && comp.terms.length > 0 && (
        <>
          <SectionLabel n="04" text="GLOSSARY" ink={layer.ink} count={comp.terms.length} />
          <div className="flex flex-wrap gap-1.5">
            {comp.terms.map((term) => (
              <GlossaryChip key={term} term={term} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
