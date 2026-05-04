"use client";

import { useState } from "react";
import { LAYERS } from "@/data/layers";
import { useAppStore } from "@/store/app-store";
import { GlossaryChip } from "./glossary-chip";
import { TechChip } from "./tech-chip";
import type { Layer, Component } from "@/data/types";

type Tab = "exec" | "eng";

export function DossierPanel() {
  const openLayer = useAppStore((s) => s.openLayer);
  const openComp = useAppStore((s) => s.openComp);
  const closeDossier = useAppStore((s) => s.closeDossier);
  const openDossier = useAppStore((s) => s.openDossier);
  const [tab, setTab] = useState<Tab>("exec");

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
        width: 460,
        zIndex: 70,
        borderRadius: "0 0 0 12px",
        padding: "20px 24px",
        animation: "dossierIn 0.35s ease-out",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(["exec", "eng"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 4,
                border: `1px solid ${tab === t ? "var(--line-3)" : "var(--line)"}`,
                background: tab === t ? "var(--glass-2)" : "transparent",
                color: tab === t ? "var(--ink)" : "var(--ink-4)",
                cursor: "pointer",
              }}
            >
              {t === "exec" ? "Executive" : "Engineer"}
            </button>
          ))}
        </div>
        <button
          onClick={closeDossier}
          style={{ background: "none", border: "none", color: "var(--ink-4)", cursor: "pointer", fontSize: 18 }}
        >
          ×
        </button>
      </div>

      {comp ? (
        <ComponentDossier layer={layer} comp={comp} tab={tab} />
      ) : (
        <LayerDossier layer={layer} tab={tab} onOpenComp={(compId) => openDossier(layer.id, compId)} />
      )}
    </aside>
  );
}

function LayerDossier({ layer, tab, onOpenComp }: { layer: Layer; tab: Tab; onOpenComp: (id: string) => void }) {
  return (
    <div>
      <div
        className="mb-1"
        style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", color: layer.ink }}
      >
        LAYER {layer.n}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px", color: "var(--ink)" }}>{layer.name}</h2>
      <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", margin: "0 0 16px" }}>
        {layer.tagline}
      </p>
      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 20px" }}>
        {tab === "exec" ? layer.exec : layer.eng}
      </p>

      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--ink-4)", marginBottom: 8 }}>
        COMPONENTS
      </div>
      <div className="flex flex-col gap-1">
        {layer.components.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenComp(c.id)}
            className="text-left px-3 py-2 rounded-md"
            style={{
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--ink-2)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--sans)",
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function ComponentDossier({ layer, comp, tab }: { layer: Layer; comp: Component; tab: Tab }) {
  return (
    <div>
      <button
        onClick={() => useAppStore.getState().openDossier(layer.id)}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: "var(--ink-4)",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: 8,
          padding: 0,
        }}
      >
        ← {layer.name}
      </button>

      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px", color: "var(--ink)" }}>{comp.name}</h2>
      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 16px" }}>
        {tab === "exec" ? comp.exec : comp.eng}
      </p>

      {comp.what && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.15em", marginBottom: 4 }}>
            WHAT IT DOES
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>{comp.what}</p>
        </div>
      )}

      {comp.why && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.15em", marginBottom: 4 }}>
            WHY IT EXISTS
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>{comp.why}</p>
        </div>
      )}

      {comp.terms && comp.terms.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.15em", marginBottom: 6 }}>
            GLOSSARY
          </div>
          <div className="flex flex-wrap gap-1.5">
            {comp.terms.map((term) => (
              <GlossaryChip key={term} term={term} />
            ))}
          </div>
        </div>
      )}

      {comp.tech && comp.tech.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.15em", marginBottom: 6 }}>
            TECHNOLOGY
          </div>
          <div className="flex flex-wrap gap-1.5">
            {comp.tech.map((t) => (
              <TechChip key={t} label={t} ink={layer.ink} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
