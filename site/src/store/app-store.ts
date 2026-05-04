import { create } from "zustand";

export type View = "atlas" | "patterns" | "example";
export type Theme = "dark" | "light";

interface SourceRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AppState {
  view: View;
  theme: Theme;
  revealUpTo: number;
  playReveal: boolean;
  openLayer: string | null;
  openComp: string | null;
  sourceRect: SourceRect | null;
  hoveredComp: string | null;

  setView: (v: View) => void;
  setTheme: (t: Theme) => void;
  setRevealUpTo: (n: number) => void;
  togglePlayReveal: () => void;
  openDossier: (layerId: string, compId?: string | null, rect?: SourceRect | null) => void;
  closeDossier: () => void;
  setHoveredComp: (id: string | null) => void;
}

function syncURL(view: View, layer: string | null, comp: string | null) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (view !== "atlas") params.set("view", view);
  if (layer) params.set("layer", layer);
  if (comp) params.set("comp", comp);
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

export const useAppStore = create<AppState>((set, get) => ({
  view: "atlas",
  theme: "dark",
  revealUpTo: -1,
  playReveal: true,
  openLayer: null,
  openComp: null,
  sourceRect: null,
  hoveredComp: null,

  setView: (v) => {
    set({ view: v, openLayer: null, openComp: null, sourceRect: null });
    syncURL(v, null, null);
  },

  setTheme: (t) => {
    set({ theme: t });
    applyTheme(t);
  },

  setRevealUpTo: (n) => set({ revealUpTo: n }),
  togglePlayReveal: () => set((s) => ({ playReveal: !s.playReveal })),

  openDossier: (layerId, compId = null, rect = null) => {
    set({ openLayer: layerId, openComp: compId, sourceRect: rect });
    syncURL(get().view, layerId, compId);
  },

  closeDossier: () => {
    set({ openLayer: null, openComp: null, sourceRect: null });
    syncURL(get().view, null, null);
  },

  setHoveredComp: (id) => set({ hoveredComp: id }),
}));

export function hydrateFromURL() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const view = (params.get("view") as View) || "atlas";
  const layer = params.get("layer") || null;
  const comp = params.get("comp") || null;

  useAppStore.setState({ view, openLayer: layer, openComp: comp });

  const theme = getInitialTheme();
  useAppStore.setState({ theme });
  applyTheme(theme);
}
