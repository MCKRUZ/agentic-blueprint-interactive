"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppStore, hydrateFromURL } from "@/store/app-store";
import { LAYERS } from "@/data/layers";
import "@/data/enrichment";
import { Topbar } from "@/components/topbar";
import { StatRail } from "@/components/stat-rail";
import { AtlasCanvas } from "@/components/atlas/atlas-canvas";
import { LayerRegion } from "@/components/atlas/layer-region";
import { ConnectionLines } from "@/components/atlas/connection-lines";
import { RevealScrubber } from "@/components/atlas/reveal-scrubber";
import { Onboarding } from "@/components/onboarding";
import { DossierPanel } from "@/components/drilldown/dossier-panel";
import { AnimatedArrow } from "@/components/drilldown/animated-arrow";
import { PatternExplorer } from "@/components/patterns/pattern-explorer";
import { ExampleView } from "@/components/example/example-view";

const BestPracticesView = dynamic(
  () => import("@/components/best-practices/best-practices-view").then((m) => m.BestPracticesView),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full">
      <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-4)" }}>
        Loading practices…
      </span>
    </div>
  )},
);

export default function Home() {
  const view = useAppStore((s) => s.view);
  const revealUpTo = useAppStore((s) => s.revealUpTo);
  const openLayer = useAppStore((s) => s.openLayer);
  const hoveredComp = useAppStore((s) => s.hoveredComp);
  const openDossier = useAppStore((s) => s.openDossier);
  const setHoveredComp = useAppStore((s) => s.setHoveredComp);

  useEffect(() => {
    hydrateFromURL();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const state = useAppStore.getState();

      switch (e.key) {
        case "1": state.setView("atlas"); break;
        case "2": state.setView("patterns"); break;
        case "3": state.setView("example"); break;
        case "4": state.setView("practices"); break;
        case "ArrowLeft":
          if (state.view === "atlas") {
            e.preventDefault();
            state.setRevealUpTo(Math.max(-1, state.revealUpTo - 1));
            useAppStore.setState({ playReveal: false });
          }
          break;
        case "ArrowRight":
          if (state.view === "atlas") {
            e.preventDefault();
            state.setRevealUpTo(Math.min(LAYERS.length - 1, state.revealUpTo + 1));
            useAppStore.setState({ playReveal: false });
          }
          break;
        case " ":
          if (state.view === "atlas") { e.preventDefault(); state.togglePlayReveal(); }
          break;
        case "Escape":
          if (state.openLayer) state.closeDossier();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      <Topbar />
      <StatRail />
      <main className="flex-1 relative overflow-hidden">
        {view === "atlas" && (
          <>
            <AtlasCanvas>
              <ConnectionLines activeLayer={openLayer} />
              {LAYERS.map((layer, i) => (
                <LayerRegion
                  key={layer.id}
                  layer={layer}
                  visible={i <= revealUpTo}
                  onOpenLayer={(id) => openDossier(id)}
                  onOpenComp={(layerId, compId, rect) => openDossier(layerId, compId, rect)}
                  hoveredComp={hoveredComp}
                  onHoverComp={setHoveredComp}
                />
              ))}
            </AtlasCanvas>
            <Onboarding />
            <RevealScrubber />
            <AnimatedArrow />
            <DossierPanel />
          </>
        )}
        {view === "patterns" && <PatternExplorer />}
        {view === "example" && <ExampleView />}
        {view === "practices" && <BestPracticesView />}
      </main>
    </div>
  );
}
