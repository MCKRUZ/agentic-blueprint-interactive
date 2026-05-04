# Agentic Blueprint Interactive Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the design prototype in `design_handoff_agentic_blueprint/design/` as a production Next.js website with all three interactive views (Atlas, Patterns, Example).

**Architecture:** Single-page app with tab-switched views. CSS custom properties for design tokens (dark/light theme swap), Tailwind for layout utilities, Zustand for state with URL sync. All content data lifted verbatim from prototype JS files into typed TypeScript modules. SVG-based graphics rendered in React components.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Zustand, next/font (Geist, JetBrains Mono, Source Serif 4)

**Spec:** `docs/superpowers/specs/2026-05-04-agentic-blueprint-website-design.md`
**Prototype source:** `design_handoff_agentic_blueprint/design/`

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata, theme script
│   ├── page.tsx                # SPA shell — view switching, keyboard shortcuts
│   └── globals.css             # Design tokens, keyframes, glass/glow/background effects
├── components/
│   ├── topbar.tsx              # Brand mark + view tabs + theme toggle + print
│   ├── stat-rail.tsx           # Counter pills + live indicator
│   ├── intro-card.tsx          # Atlas hero overlay card
│   ├── zoom-controls.tsx       # +/−/recenter buttons
│   ├── atlas/
│   │   ├── atlas-canvas.tsx    # Pan/zoom SVG container (1600×1100)
│   │   ├── layer-region.tsx    # Hairline rect + label per layer
│   │   ├── component-box.tsx   # Tinted glass box per component
│   │   ├── connection-lines.tsx# Orthogonal dashed SVG paths
│   │   └── reveal-scrubber.tsx # Play/pause + scrub bar
│   ├── drilldown/
│   │   ├── dossier-panel.tsx   # Right-side drawer (~460px)
│   │   ├── animated-arrow.tsx  # Cubic-bezier SVG arrow
│   │   ├── glossary-chip.tsx   # Term pill + hover popover
│   │   └── tech-chip.tsx       # Tech pill + expandable sub-panel
│   ├── patterns/
│   │   ├── pattern-explorer.tsx# 3-column layout + long-form content
│   │   └── pattern-viz.tsx     # SVG topology diagrams (4 variants)
│   └── example/
│       ├── example-view.tsx    # Step list + detail panel
│       └── mini-atlas.tsx      # Compact 720×460 diagram
├── data/
│   ├── types.ts                # All shared TypeScript interfaces
│   ├── layers.ts               # LAYERS array (10 layers, 46 components)
│   ├── enrichment.ts           # Per-component what/why/tech
│   ├── tech-catalog.ts         # Tech entries with pros/cons/best-for
│   ├── patterns.ts             # 4 topology definitions + sections
│   ├── glossary.ts             # ~107 term definitions
│   └── example-trace.ts        # "Where's my refund?" scenario
├── store/
│   └── app-store.ts            # Zustand store + URL sync + theme
└── lib/
    ├── tech-lookup.ts          # normalize + fuzzy match
    ├── regions.ts              # REGIONS constant + computeCompBoxes
    └── routes.ts               # ROUTES array + buildRoutePath
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd "C:\Users\kruz7\OneDrive\Documents\Code Repos\MCKRUZ\agentic-blueprint-interactive"
npx create-next-app@latest site --typescript --tailwind --app --src-dir --no-eslint --no-import-alias --no-turbopack
```

When prompted: use defaults. This creates a `site/` directory with the scaffolded project.

- [ ] **Step 2: Install dependencies**

```bash
cd site
npm install zustand
```

- [ ] **Step 3: Verify the dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server running on `http://localhost:3000`, default page renders.

- [ ] **Step 4: Update `next.config.ts` for static export**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 15 project with Tailwind and Zustand"
```

---

## Task 2: Design Tokens & Global CSS

**Files:**
- Replace: `site/src/app/globals.css`
- Reference: `design_handoff_agentic_blueprint/design/styles.css` (lines 1–120 for tokens/background, full file for keyframes and component classes)

- [ ] **Step 1: Replace `globals.css` with design tokens**

Replace the entire contents of `site/src/app/globals.css` with the design system. This file owns: CSS custom properties (dark + light), background treatment, keyframes, and reusable effect classes. Tailwind's `@import` goes at the top.

```css
@import "tailwindcss";

/* ─── DESIGN TOKENS ────────────────────────────────────────── */

:root {
  --bg-0:      #05060B;
  --bg-1:      #0A0C16;
  --bg-2:      #11142A;
  --glass:     rgba(20, 26, 50, 0.55);
  --glass-2:   rgba(28, 36, 70, 0.65);
  --line:      rgba(120, 200, 255, 0.18);
  --line-2:    rgba(140, 220, 255, 0.32);
  --line-3:    rgba(170, 240, 255, 0.55);
  --ink:       #E8F1FF;
  --ink-2:     #B7C7DD;
  --ink-3:     #7B8AA6;
  --ink-4:     #4F5A75;

  --c1: #67E8F9;
  --c2: #A78BFA;
  --c3: #F472B6;
  --c4: #FBBF24;
  --c5: #4ADE80;
  --signal: #F87171;

  --ink-l01: #67E8F9;
  --ink-l02: #38BDF8;
  --ink-l03: #818CF8;
  --ink-l04: #A78BFA;
  --ink-l05: #C084FC;
  --ink-l06: #E879F9;
  --ink-l07: #F472B6;
  --ink-l08: #FB7185;
  --ink-l09: #FBBF24;
  --ink-l10: #F87171;

  --type-scale: 1.18;
}

[data-theme="light"] {
  --bg-0:    #F0F3FA;
  --bg-1:    #E5EAF5;
  --bg-2:    #D8E0F0;
  --glass:   rgba(255, 255, 255, 0.65);
  --glass-2: rgba(255, 255, 255, 0.85);
  --line:    rgba(20, 50, 90, 0.18);
  --line-2:  rgba(20, 50, 90, 0.34);
  --line-3:  rgba(20, 50, 90, 0.6);
  --ink:     #0A1530;
  --ink-2:   #2C3D60;
  --ink-3:   #5C6B85;
  --ink-4:   #93A0B7;
}

/* ─── BASE ─────────────────────────────────────────────────── */

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-0);
  color: var(--ink);
  font-size: calc(15px * var(--type-scale));
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "ss01", "kern", "liga";
  overflow: hidden;
  height: 100vh;
}

body {
  background:
    radial-gradient(ellipse 90% 60% at 20% 10%, rgba(103, 232, 249, 0.10), transparent 60%),
    radial-gradient(ellipse 70% 50% at 90% 90%, rgba(167, 139, 250, 0.10), transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(244, 114, 182, 0.06), transparent 60%),
    var(--bg-0);
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.18;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent 90%);
  z-index: 0;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 12% 23%, rgba(255,255,255,0.5), transparent 50%),
    radial-gradient(1px 1px at 78% 11%, rgba(255,255,255,0.4), transparent 50%),
    radial-gradient(1px 1px at 33% 67%, rgba(255,255,255,0.35), transparent 50%),
    radial-gradient(1px 1px at 88% 71%, rgba(255,255,255,0.45), transparent 50%),
    radial-gradient(1px 1px at 60% 33%, rgba(255,255,255,0.3), transparent 50%),
    radial-gradient(1.5px 1.5px at 20% 88%, rgba(167,139,250,0.5), transparent 50%),
    radial-gradient(1.5px 1.5px at 45% 15%, rgba(103,232,249,0.5), transparent 50%);
  pointer-events: none;
  z-index: 0;
  animation: starshift 60s linear infinite;
}

[data-theme="light"] body::after { display: none; }

::selection { background: var(--c1); color: var(--bg-0); }

/* ─── KEYFRAMES ────────────────────────────────────────────── */

@keyframes starshift {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(-30px, -20px); }
}

@keyframes flowdash {
  to { stroke-dashoffset: -200; }
}

@keyframes pop {
  0%   { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes drawline {
  0%   { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}

@keyframes ringExpand {
  0%   { r: 0; opacity: 0.7; }
  100% { r: 30; opacity: 0; }
}

@keyframes dossierIn {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes techDetailIn {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* ─── GLASS EFFECT ─────────────────────────────────────────── */

.glass {
  background: linear-gradient(180deg, rgba(15,18,38,0.78), rgba(10,12,22,0.78));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
}

[data-theme="light"] .glass {
  background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(245,248,255,0.78));
  box-shadow: 0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5);
}

/* ─── REDUCED MOTION ───────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify dev server still renders**

```bash
cd site && npm run dev
```

Expected: page loads with dark background and grid overlay visible.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add design tokens, keyframes, and glass effects"
```

---

## Task 3: TypeScript Types & Data Files

**Files:**
- Create: `site/src/data/types.ts`
- Create: `site/src/data/layers.ts`, `site/src/data/enrichment.ts`, `site/src/data/tech-catalog.ts`, `site/src/data/patterns.ts`, `site/src/data/glossary.ts`, `site/src/data/example-trace.ts`
- Reference: All `.jsx` data files in `design_handoff_agentic_blueprint/design/`

- [ ] **Step 1: Create `src/data/types.ts`**

```typescript
export interface Component {
  id: string;
  name: string;
  exec: string;
  eng: string;
  terms: string[];
  what?: string;
  why?: string;
  tech?: string[];
}

export interface Layer {
  n: string;
  id: string;
  name: string;
  tagline: string;
  ink: string;
  exec: string;
  eng: string;
  components: Component[];
}

export interface CompEnrichment {
  what: string;
  why: string;
  tech: string[];
}

export interface TechEntry {
  name: string;
  blurb: string;
  pros: string[];
  cons: string[];
  best: string;
  license: string;
  maturity: string;
}

export interface PatternSections {
  whenToUse: string;
  anatomy: string;
  scaling: string;
  failureModes: string;
  walkthrough: string;
  stack: string[];
}

export interface Pattern {
  id: string;
  name: string;
  summary: string;
  description: string;
  bestFor: string[];
  avoidWhen: string[];
  flow: string[];
  stats: Record<string, string>;
  inTheWild: string[];
  sections: PatternSections;
}

export interface ExampleStep {
  n: number;
  layer: string;
  comp: string;
  title: string;
  narrative: string;
  duration?: string;
  tokens?: number;
  cost?: string;
  payload: Record<string, unknown>;
}

export interface ExampleTrace {
  id: string;
  title: string;
  subtitle: string;
  user: { name: string; persona: string; channel: string };
  totals: Record<string, string | number>;
  steps: ExampleStep[];
}
```

- [ ] **Step 2: Create `src/data/layers.ts`**

Open `design_handoff_agentic_blueprint/design/data.jsx`. Copy the entire `LAYERS` array content. Wrap it as a typed TypeScript export. The file defines `window.LAYERS` — convert to a named export.

Structure (first layer shown as example — copy ALL 10 layers with ALL 46 components verbatim):

```typescript
import type { Layer } from "./types";

export const LAYERS: Layer[] = [
  {
    n: "01",
    id: "surface",
    name: "User Surface",
    tagline: "Every conversation starts — and ends — here.",
    ink: "#67E8F9",
    exec: "...", // Copy exact string from data.jsx
    eng: "...",  // Copy exact string from data.jsx
    components: [
      {
        id: "chat-ui",
        name: "Chat UI",
        exec: "...", // Copy exact string
        eng: "...",  // Copy exact string
        terms: ["SSE", "SignalR", "WebRTC", "Markdown-it"],
      },
      // ... remaining 4 components for this layer
    ],
  },
  // ... remaining 9 layers with all components
];
```

**Critical:** Copy every `exec`, `eng`, `tagline`, and `terms` string exactly as written in `data.jsx`. Do not paraphrase.

- [ ] **Step 3: Create `src/data/enrichment.ts`**

Open `design_handoff_agentic_blueprint/design/enrichment.jsx`. Convert the `COMP_ENRICHMENT` object to a typed export. Merge enrichment into layers at module level.

```typescript
import type { CompEnrichment } from "./types";
import { LAYERS } from "./layers";

const COMP_ENRICHMENT: Record<string, CompEnrichment> = {
  "chat-ui": {
    what: "...", // Copy exact string from enrichment.jsx
    why: "...",  // Copy exact string
    tech: ["React", "Next.js", "Tailwind CSS", "shadcn/ui", "Vercel AI SDK"],
  },
  // ... remaining 45 component entries
};

// Merge enrichment into layer components at import time
for (const layer of LAYERS) {
  for (const comp of layer.components) {
    const enrichment = COMP_ENRICHMENT[comp.id];
    if (enrichment) {
      comp.what = enrichment.what;
      comp.why = enrichment.why;
      comp.tech = enrichment.tech;
    }
  }
}

export { COMP_ENRICHMENT };
```

- [ ] **Step 4: Create `src/data/tech-catalog.ts`**

Open `design_handoff_agentic_blueprint/design/tech-catalog.jsx`. Convert `TECH_CATALOG` (or `TECH_CATALOG_RAW`) to a typed export. Include the `norm()` helper for key normalization.

```typescript
import type { TechEntry } from "./types";

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const RAW: Record<string, TechEntry> = {
  // Copy all entries from tech-catalog.jsx verbatim
  // Key is norm(name), value has name, blurb, pros, cons, best, license, maturity
};

export const TECH_CATALOG = new Map<string, TechEntry>();
for (const [key, entry] of Object.entries(RAW)) {
  TECH_CATALOG.set(norm(key), entry);
}

export function lookupTech(label: string): TechEntry | undefined {
  const key = norm(label);
  if (TECH_CATALOG.has(key)) return TECH_CATALOG.get(key);

  const stripped = label.replace(/\s*\(.*?\)\s*/g, "").split(",")[0].trim();
  const strippedKey = norm(stripped);
  if (TECH_CATALOG.has(strippedKey)) return TECH_CATALOG.get(strippedKey);

  for (const [k, v] of TECH_CATALOG) {
    if (k.startsWith(key) || key.startsWith(k)) return v;
  }

  return undefined;
}
```

- [ ] **Step 5: Create `src/data/patterns.ts`**

Open `design_handoff_agentic_blueprint/design/patterns.jsx`. The `PATTERNS` array is defined near the top (before the React component). Copy all 4 pattern objects verbatim.

```typescript
import type { Pattern } from "./types";

export const PATTERNS: Pattern[] = [
  {
    id: "supervisor",
    name: "Supervisor",
    summary: "...", // Copy exact
    description: "...",
    bestFor: ["...", "..."],
    avoidWhen: ["...", "..."],
    flow: ["...", "..."],
    stats: { /* copy exact */ },
    inTheWild: ["...", "..."],
    sections: {
      whenToUse: "...",
      anatomy: "...",
      scaling: "...",
      failureModes: "...",
      walkthrough: "...",
      stack: ["...", "..."],
    },
  },
  // ... remaining 3 patterns (pipeline, swarm, hierarchical)
];
```

- [ ] **Step 6: Create `src/data/glossary.ts`**

Open `design_handoff_agentic_blueprint/design/app.jsx`. Find `window.GLOSSARY = { ... }`. Copy all ~107 term definitions.

```typescript
export const GLOSSARY: Record<string, string> = {
  "OAuth 2.0": "...", // Copy exact definition
  "OIDC": "...",
  // ... remaining ~105 terms
};
```

- [ ] **Step 7: Create `src/data/example-trace.ts`**

Open `design_handoff_agentic_blueprint/design/example-data.jsx`. Copy `EXAMPLE_TRACE` (or `EXAMPLE_STEPS` — check the actual variable name) with all ~14 steps.

```typescript
import type { ExampleTrace } from "./types";

export const EXAMPLE_TRACE: ExampleTrace = {
  id: "refund-query",
  title: "Where's my refund?",
  subtitle: "...", // Copy exact
  user: { name: "...", persona: "...", channel: "..." },
  totals: { /* copy exact */ },
  steps: [
    {
      n: 1,
      layer: "surface",
      comp: "chat-ui",
      title: "...", // Copy exact
      narrative: "...",
      payload: { /* copy exact JSON */ },
    },
    // ... remaining steps
  ],
};
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
cd site && npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 9: Commit**

```bash
git add src/data/
git commit -m "feat: add typed data modules with verbatim content from prototype"
```

---

## Task 4: Layout Utilities — Regions, Routes, Tech Lookup

**Files:**
- Create: `site/src/lib/regions.ts`, `site/src/lib/routes.ts`

- [ ] **Step 1: Create `src/lib/regions.ts`**

Port the REGIONS constant and `computeCompBoxes` from `design_handoff_agentic_blueprint/design/atlas.jsx` (lines 18–63).

```typescript
import type { Component } from "@/data/types";

export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  label: "left" | "top";
}

export const WORLD_W = 1600;
export const WORLD_H = 1100;

export const REGIONS: Record<string, Region> = {
  surface:       { x:  60, y:  60, w: 1200, h: 110, cols: 5, label: "left" },
  identity:      { x:  60, y: 200, w: 1200, h: 110, cols: 4, label: "left" },
  orchestration: { x: 360, y: 340, w: 600,  h: 140, cols: 4, label: "top" },
  runtime:       { x: 360, y: 510, w: 600,  h: 200, cols: 3, label: "top" },
  gateway:       { x: 360, y: 740, w: 600,  h: 140, cols: 5, label: "top" },
  memory:        { x:  60, y: 340, w: 270,  h: 540, cols: 1, label: "top" },
  state:         { x:  60, y: 910, w: 270,  h: 110, cols: 2, label: "left" },
  tools:         { x: 990, y: 340, w: 270,  h: 540, cols: 1, label: "top" },
  observability: { x: 1290, y: 60, w: 250,  h: 820, cols: 1, label: "top" },
  governance:    { x: 360, y: 910, w: 600,  h: 110, cols: 5, label: "top" },
};

const PAD = { x: 16, top: 30, bottom: 16 };

export interface CompBox {
  x: number;
  y: number;
  w: number;
  h: number;
  comp: Component;
}

export function computeCompBoxes(region: Region, components: Component[]): CompBox[] {
  const cols = Math.min(region.cols, components.length);
  const rows = Math.ceil(components.length / cols);
  const innerW = region.w - PAD.x * 2;
  const innerH = region.h - PAD.top - PAD.bottom;
  const gx = 8, gy = 8;
  const cw = (innerW - gx * (cols - 1)) / cols;
  const ch = (innerH - gy * (rows - 1)) / rows;
  return components.map((c, i) => {
    const r = Math.floor(i / cols);
    const col = i % cols;
    return {
      x: region.x + PAD.x + col * (cw + gx),
      y: region.y + PAD.top + r * (ch + gy),
      w: cw,
      h: ch,
      comp: c,
    };
  });
}
```

- [ ] **Step 2: Create `src/lib/routes.ts`**

Port ROUTES and `buildRoutePath` from `atlas.jsx` (lines 67–148).

```typescript
import { REGIONS, type Region } from "./regions";

interface Route {
  from: string;
  to: string;
  kind: string;
}

export const ROUTES: Route[] = [
  { from: "surface",       to: "identity",      kind: "down" },
  { from: "identity",      to: "orchestration", kind: "down" },
  { from: "orchestration", to: "runtime",       kind: "down" },
  { from: "runtime",       to: "gateway",       kind: "down" },
  { from: "runtime",       to: "memory",        kind: "side-l" },
  { from: "runtime",       to: "tools",         kind: "side-r" },
  { from: "runtime",       to: "state",         kind: "diag-bl" },
  { from: "gateway",       to: "governance",    kind: "down" },
  { from: "tools",         to: "governance",    kind: "diag-br" },
  { from: "memory",        to: "state",         kind: "down-l" },
  { from: "observability", to: "runtime",       kind: "side-cross" },
  { from: "observability", to: "governance",    kind: "down-r" },
];

export function buildRoutePath(route: Route): string {
  const a = REGIONS[route.from];
  const b = REGIONS[route.to];
  if (!a || !b) return "";

  const aCx = a.x + a.w / 2, aCy = a.y + a.h / 2;
  const bCx = b.x + b.w / 2, bCy = b.y + b.h / 2;
  const aBottom = a.y + a.h;
  const aLeft = a.x, aRight = a.x + a.w;
  const bTop = b.y, bCy2 = b.y + b.h / 2;
  const bLeft = b.x, bRight = b.x + b.w;

  switch (route.kind) {
    case "down": {
      const sx = aCx, sy = aBottom;
      const ex = bCx, ey = bTop;
      const my = (sy + ey) / 2;
      return `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
    }
    case "side-l": {
      const sx = aLeft, sy = aCy;
      const ex = bRight, ey = bCy2;
      const mx = (sx + ex) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    }
    case "side-r": {
      const sx = aRight, sy = aCy;
      const ex = bLeft, ey = bCy2;
      const mx = (sx + ex) / 2;
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    }
    case "diag-bl": {
      const sx = aLeft + 60, sy = aBottom;
      const ex = bRight, ey = bTop + 30;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "diag-br": {
      const sx = aRight - 60, sy = aBottom;
      const ex = bLeft, ey = bTop + 30;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "down-l": {
      const sx = aCx, sy = aBottom;
      const ex = bCx, ey = bTop;
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    case "down-r": {
      const sx = aCx, sy = aBottom;
      const ex = bRight, ey = bCy2;
      return `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
    }
    case "side-cross": {
      const sx = aLeft, sy = aCy;
      const ex = bRight, ey = bCy2;
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    default:
      return `M ${aCx} ${aCy} L ${bCx} ${bCy}`;
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add atlas regions, routes, and layout utilities"
```

---

## Task 5: Zustand Store & URL Sync

**Files:**
- Create: `site/src/store/app-store.ts`

- [ ] **Step 1: Create the store**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand store with URL sync and theme persistence"
```

---

## Task 6: Root Layout & Fonts

**Files:**
- Modify: `site/src/app/layout.tsx`

- [ ] **Step 1: Configure fonts and layout**

```typescript
import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "The Anatomy of an Agentic Platform",
  description: "A field atlas exploring the 10-layer, 46-component architecture of an agentic platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'light' || t === 'dark') {
                  document.documentElement.setAttribute('data-theme', t);
                } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geist.variable} ${jetbrainsMono.variable} ${sourceSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

**Note:** The Geist font ships with `create-next-app` as a local font file. If it's not in `src/app/fonts/`, check if it was scaffolded elsewhere or install `geist` package: `npm install geist`. Then import with `import { GeistSans } from 'geist/font/sans'`.

- [ ] **Step 2: Update `globals.css` font stacks to use CSS variables from next/font**

Add at the top of `globals.css` (after the `@import "tailwindcss"` line):

```css
:root {
  /* Override font stacks with next/font CSS variables */
  --display: var(--font-source-serif), "Iowan Old Style", Georgia, serif;
  --sans:    var(--font-geist), system-ui, -apple-system, sans-serif;
  --mono:    var(--font-jetbrains), ui-monospace, Menlo, monospace;
}

html, body {
  font-family: var(--sans);
}
```

- [ ] **Step 3: Verify fonts load**

```bash
cd site && npm run dev
```

Open browser, inspect element — verify Geist, JetBrains Mono, and Source Serif 4 are loaded.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: configure self-hosted fonts via next/font"
```

---

## Task 7: Page Shell — Topbar, Stat Rail, View Switching

**Files:**
- Modify: `site/src/app/page.tsx`
- Create: `site/src/components/topbar.tsx`, `site/src/components/stat-rail.tsx`

- [ ] **Step 1: Create `src/components/topbar.tsx`**

```tsx
"use client";

import { useAppStore, type View } from "@/store/app-store";

const VIEWS: { key: View; numeral: string; label: string }[] = [
  { key: "atlas", numeral: "i", label: "Atlas" },
  { key: "patterns", numeral: "ii", label: "Patterns" },
  { key: "example", numeral: "iii", label: "Example" },
];

export function Topbar() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <header
      className="glass flex items-center gap-4 px-5 py-2 mx-4 mt-3"
      style={{ position: "relative", zIndex: 80, borderRadius: 10 }}
    >
      <div className="flex items-center gap-3 mr-auto">
        <span
          className="font-bold tracking-tight"
          style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--c1)" }}
        >
          AGENTIC BLUEPRINT
        </span>
        <span style={{ color: "var(--ink-4)", fontSize: 12 }}>
          The Anatomy of an Agentic Platform
        </span>
      </div>

      <nav className="flex gap-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className="px-3 py-1 rounded-md transition-colors"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: `1px solid ${view === v.key ? "var(--line-3)" : "var(--line)"}`,
              background: view === v.key ? "var(--glass-2)" : "transparent",
              color: view === v.key ? "var(--ink)" : "var(--ink-3)",
            }}
          >
            <span style={{ opacity: 0.5 }}>{v.numeral}</span> {v.label}
          </button>
        ))}
      </nav>

      <div className="flex gap-1 ml-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-2 py-1 rounded-md"
          style={{
            border: "1px solid var(--line)",
            background: "transparent",
            color: "var(--ink-3)",
            fontSize: 16,
            cursor: "pointer",
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "◐" : "◑"}
        </button>
        <button
          onClick={() => window.print()}
          className="px-2 py-1 rounded-md"
          style={{
            border: "1px solid var(--line)",
            background: "transparent",
            color: "var(--ink-3)",
            fontSize: 14,
            cursor: "pointer",
          }}
          aria-label="Print"
        >
          ⎙
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `src/components/stat-rail.tsx`**

```tsx
"use client";

import { LAYERS } from "@/data/layers";
import { PATTERNS } from "@/data/patterns";
import { useAppStore } from "@/store/app-store";

export function StatRail() {
  const view = useAppStore((s) => s.view);
  const totalComponents = LAYERS.reduce((sum, l) => sum + l.components.length, 0);

  return (
    <div
      className="flex items-center justify-center gap-4 py-1.5"
      style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.15em" }}
    >
      <span>{LAYERS.length} LAYERS</span>
      <span style={{ color: "var(--line-2)" }}>·</span>
      <span>{totalComponents} COMPONENTS</span>
      <span style={{ color: "var(--line-2)" }}>·</span>
      <span>{PATTERNS.length} TOPOLOGIES</span>
      <span style={{ color: "var(--line-2)" }}>·</span>
      <span style={{ color: "var(--c1)" }}>
        ✛ Live diagram · {view.toUpperCase()}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Wire up `page.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { useAppStore, hydrateFromURL } from "@/store/app-store";
import { Topbar } from "@/components/topbar";
import { StatRail } from "@/components/stat-rail";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  useEffect(() => {
    hydrateFromURL();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "1": setView("atlas"); break;
        case "2": setView("patterns"); break;
        case "3": setView("example"); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setView]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      <Topbar />
      <StatRail />
      <main className="flex-1 relative overflow-hidden">
        {view === "atlas" && <div>Atlas placeholder</div>}
        {view === "patterns" && <div>Patterns placeholder</div>}
        {view === "example" && <div>Example placeholder</div>}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
cd site && npm run dev
```

Expected: topbar with view tabs, stat rail, and placeholder stage. Tab switching works via clicks and `1`/`2`/`3` keys. Theme toggle flips dark/light.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/topbar.tsx src/components/stat-rail.tsx
git commit -m "feat: add app shell with topbar, stat rail, and view switching"
```

---

## Task 8: Atlas Canvas — Pan/Zoom SVG Container

**Files:**
- Create: `site/src/components/atlas/atlas-canvas.tsx`

- [ ] **Step 1: Create the pan/zoom canvas**

```tsx
"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { WORLD_W, WORLD_H } from "@/lib/regions";

interface Transform {
  x: number;
  y: number;
  k: number;
}

export function AtlasCanvas({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 0.6 });
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);

  // Auto-center on mount
  useEffect(() => {
    const center = () => {
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      if (r.width < 50 || r.height < 50) return;
      const k = Math.min((r.width - 60) / WORLD_W, (r.height - 80) / WORLD_H, 0.85);
      setTransform({ x: r.width / 2, y: r.height / 2 + 20, k: Math.max(0.32, k) });
    };
    center();
    const ro = new ResizeObserver(center);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: transform.x, ty: transform.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [transform.x, transform.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform((t) => ({ ...t, x: dragRef.current!.tx + dx, y: dragRef.current!.ty + dy }));
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const dk = -e.deltaY * 0.001;
    setTransform((t) => {
      const k2 = Math.max(0.25, Math.min(2.5, t.k * (1 + dk)));
      return { ...t, k: k2 };
    });
  }, []);

  const recenter = useCallback(() => {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const k = Math.min((r.width - 60) / WORLD_W, (r.height - 80) / WORLD_H, 0.85);
    setTransform({ x: r.width / 2, y: r.height / 2 + 20, k: Math.max(0.32, k) });
  }, []);

  return (
    <div
      ref={stageRef}
      className="absolute inset-0"
      style={{ cursor: dragRef.current ? "grabbing" : "grab", overflow: "hidden" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "0 0",
          transform: `translate(${transform.x - (WORLD_W * transform.k) / 2}px, ${transform.y - (WORLD_H * transform.k) / 2}px) scale(${transform.k})`,
          transition: dragRef.current ? "none" : "transform 0.15s ease-out",
        }}
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
      >
        {children}
      </svg>

      {/* Zoom controls */}
      <div
        className="glass absolute flex flex-col gap-1 p-1"
        style={{ bottom: 80, right: 16, borderRadius: 8, zIndex: 50 }}
      >
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.min(2.5, t.k * 1.25) }))}
          className="px-2 py-0.5 rounded"
          style={{ color: "var(--ink-3)", border: "1px solid var(--line)", background: "transparent", cursor: "pointer" }}
        >
          +
        </button>
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.max(0.25, t.k * 0.8) }))}
          className="px-2 py-0.5 rounded"
          style={{ color: "var(--ink-3)", border: "1px solid var(--line)", background: "transparent", cursor: "pointer" }}
        >
          −
        </button>
        <button
          onClick={recenter}
          className="px-2 py-0.5 rounded"
          style={{ color: "var(--ink-3)", border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: 12 }}
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

Replace the Atlas placeholder:

```tsx
{view === "atlas" && <AtlasCanvas><rect x={0} y={0} width={WORLD_W} height={WORLD_H} fill="none" stroke="var(--line)" strokeWidth={1} /></AtlasCanvas>}
```

Add imports for `AtlasCanvas` and `WORLD_W`, `WORLD_H`.

- [ ] **Step 3: Verify pan/zoom works in browser**

Open `http://localhost:3000`. Drag to pan, scroll to zoom, click recenter button. Should see the world-bounds rectangle.

- [ ] **Step 4: Commit**

```bash
git add src/components/atlas/atlas-canvas.tsx src/app/page.tsx
git commit -m "feat: add atlas canvas with pan/zoom and zoom controls"
```

---

## Task 9: Layer Regions & Component Boxes

**Files:**
- Create: `site/src/components/atlas/layer-region.tsx`, `site/src/components/atlas/component-box.tsx`

- [ ] **Step 1: Create `layer-region.tsx`**

```tsx
"use client";

import { REGIONS, computeCompBoxes, type Region } from "@/lib/regions";
import type { Layer } from "@/data/types";
import { ComponentBox } from "./component-box";

interface LayerRegionProps {
  layer: Layer;
  visible: boolean;
  onOpenLayer: (layerId: string) => void;
  onOpenComp: (layerId: string, compId: string, rect: { x: number; y: number; w: number; h: number }) => void;
  hoveredComp: string | null;
  onHoverComp: (id: string | null) => void;
}

export function LayerRegion({ layer, visible, onOpenLayer, onOpenComp, hoveredComp, onHoverComp }: LayerRegionProps) {
  const region = REGIONS[layer.id];
  if (!region) return null;

  const boxes = computeCompBoxes(region, layer.components);

  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {/* Region container */}
      <rect
        x={region.x}
        y={region.y}
        width={region.w}
        height={region.h}
        rx={4}
        fill="none"
        stroke="var(--line)"
        strokeWidth={1}
      />

      {/* Layer label */}
      <text
        x={region.label === "top" ? region.x + region.w / 2 : region.x + 8}
        y={region.label === "top" ? region.y + 16 : region.y + region.h / 2}
        textAnchor={region.label === "top" ? "middle" : "start"}
        dominantBaseline={region.label === "top" ? "auto" : "middle"}
        style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", fill: "var(--ink-4)" }}
        className="pointer-events-none select-none"
      >
        {layer.n} {layer.name}
      </text>

      {/* Tagline */}
      <text
        x={region.label === "top" ? region.x + region.w / 2 : region.x + 8}
        y={region.label === "top" ? region.y + 26 : region.y + region.h / 2 + 14}
        textAnchor={region.label === "top" ? "middle" : "start"}
        style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 9, fill: "var(--ink-4)", opacity: 0.6 }}
        className="pointer-events-none select-none"
      >
        {layer.tagline}
      </text>

      {/* Component boxes */}
      {boxes.map((box) => (
        <ComponentBox
          key={box.comp.id}
          box={box}
          ink={layer.ink}
          layerId={layer.id}
          isHovered={hoveredComp === box.comp.id}
          onOpen={(rect) => onOpenComp(layer.id, box.comp.id, rect)}
          onHover={(hovered) => onHoverComp(hovered ? box.comp.id : null)}
        />
      ))}
    </g>
  );
}
```

- [ ] **Step 2: Create `component-box.tsx`**

```tsx
"use client";

import type { CompBox } from "@/lib/regions";

interface ComponentBoxProps {
  box: CompBox;
  ink: string;
  layerId: string;
  isHovered: boolean;
  onOpen: (rect: { x: number; y: number; w: number; h: number }) => void;
  onHover: (hovered: boolean) => void;
}

export function ComponentBox({ box, ink, isHovered, onOpen, onHover }: ComponentBoxProps) {
  return (
    <g
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        const svgEl = (e.target as SVGElement).closest("svg");
        if (!svgEl) return;
        const ctm = svgEl.getScreenCTM();
        if (!ctm) return;
        const pt = svgEl.createSVGPoint();
        pt.x = box.x;
        pt.y = box.y;
        const screenPt = pt.matrixTransform(ctm);
        const pt2 = svgEl.createSVGPoint();
        pt2.x = box.x + box.w;
        pt2.y = box.y + box.h;
        const screenPt2 = pt2.matrixTransform(ctm);
        onOpen({
          x: screenPt.x,
          y: screenPt.y,
          w: screenPt2.x - screenPt.x,
          h: screenPt2.y - screenPt.y,
        });
      }}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={4}
        fill={ink}
        fillOpacity={isHovered ? 0.15 : 0.08}
        stroke={ink}
        strokeOpacity={isHovered ? 0.5 : 0.2}
        strokeWidth={1}
        style={{
          transition: "fill-opacity 0.2s, stroke-opacity 0.2s, transform 0.2s",
          transformOrigin: `${box.x + box.w / 2}px ${box.y + box.h / 2}px`,
          transform: isHovered ? "scale(1.04)" : "scale(1)",
        }}
      />
      <text
        x={box.x + box.w / 2}
        y={box.y + box.h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "var(--mono)",
          fontSize: Math.min(9, box.w / (box.comp.name.length * 0.6)),
          fill: ink,
          opacity: isHovered ? 1 : 0.8,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {box.comp.name}
      </text>
    </g>
  );
}
```

- [ ] **Step 3: Wire regions into the Atlas canvas**

Update `page.tsx` to render `LayerRegion` inside `AtlasCanvas`:

```tsx
import { LAYERS } from "@/data/layers";
import { LayerRegion } from "@/components/atlas/layer-region";

// Inside the atlas view:
<AtlasCanvas>
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
```

Wire up `revealUpTo`, `openDossier`, `hoveredComp`, `setHoveredComp` from the store.

- [ ] **Step 4: Verify in browser**

Layers should appear as hairline rectangles with component boxes inside. Hovering a component box brightens it. Clicking does nothing visible yet (dossier not built).

- [ ] **Step 5: Commit**

```bash
git add src/components/atlas/layer-region.tsx src/components/atlas/component-box.tsx src/app/page.tsx
git commit -m "feat: add layer regions and component boxes to atlas"
```

---

## Task 10: Connection Lines & Reveal Scrubber

**Files:**
- Create: `site/src/components/atlas/connection-lines.tsx`, `site/src/components/atlas/reveal-scrubber.tsx`

- [ ] **Step 1: Create `connection-lines.tsx`**

```tsx
"use client";

import { ROUTES, buildRoutePath } from "@/lib/routes";

interface ConnectionLinesProps {
  activeLayer: string | null;
}

export function ConnectionLines({ activeLayer }: ConnectionLinesProps) {
  return (
    <g>
      {ROUTES.map((route, i) => {
        const d = buildRoutePath(route);
        if (!d) return null;
        const isActive = activeLayer === route.from || activeLayer === route.to;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--line)"
            strokeWidth={isActive ? 1.5 : 1}
            strokeOpacity={isActive ? 0.6 : 0.25}
            strokeDasharray="4 4"
            style={{ animation: "flowdash 14s linear infinite" }}
          />
        );
      })}
    </g>
  );
}
```

- [ ] **Step 2: Create `reveal-scrubber.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { LAYERS } from "@/data/layers";
import { useAppStore } from "@/store/app-store";

export function RevealScrubber() {
  const revealUpTo = useAppStore((s) => s.revealUpTo);
  const playReveal = useAppStore((s) => s.playReveal);
  const setRevealUpTo = useAppStore((s) => s.setRevealUpTo);
  const togglePlayReveal = useAppStore((s) => s.togglePlayReveal);
  const total = LAYERS.length;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-play reveal on mount
  useEffect(() => {
    if (!playReveal) return;
    if (revealUpTo >= total - 1) {
      useAppStore.setState({ playReveal: false });
      return;
    }

    const delay = revealUpTo < 0 ? 450 : 220;
    timerRef.current = setTimeout(() => {
      setRevealUpTo(revealUpTo + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [revealUpTo, playReveal, total, setRevealUpTo]);

  const replay = () => {
    setRevealUpTo(-1);
    useAppStore.setState({ playReveal: true });
  };

  const currentLabel = revealUpTo >= 0 && revealUpTo < total
    ? `${LAYERS[revealUpTo].n} / ${total.toString().padStart(2, "0")} · ${LAYERS[revealUpTo].name}`
    : "— / — · Ready";

  return (
    <div
      className="glass absolute flex items-center gap-3 px-4 py-2"
      style={{ bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 50, borderRadius: 8, minWidth: 380 }}
    >
      <button
        onClick={() => {
          if (revealUpTo >= total - 1) replay();
          else togglePlayReveal();
        }}
        style={{ color: "var(--c1)", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--mono)" }}
      >
        {playReveal && revealUpTo < total - 1 ? "❚❚" : "▶"}
      </button>

      <div className="flex gap-0.5 flex-1">
        {LAYERS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setRevealUpTo(i);
              useAppStore.setState({ playReveal: false });
            }}
            className="flex-1 rounded-sm"
            style={{
              height: 6,
              background: i <= revealUpTo ? "var(--c1)" : "var(--line)",
              border: "none",
              cursor: "pointer",
              opacity: i <= revealUpTo ? 1 : 0.4,
              transition: "background 0.2s, opacity 0.2s",
            }}
          />
        ))}
      </div>

      <button
        onClick={replay}
        style={{ color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
        aria-label="Replay"
      >
        ⟲
      </button>

      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", whiteSpace: "nowrap", minWidth: 170 }}>
        {currentLabel}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Add keyboard shortcuts for scrubber**

In `page.tsx`, add to the `onKey` handler:

```typescript
case "ArrowLeft":
  e.preventDefault();
  useAppStore.setState((s) => ({ revealUpTo: Math.max(-1, s.revealUpTo - 1), playReveal: false }));
  break;
case "ArrowRight":
  e.preventDefault();
  useAppStore.setState((s) => ({ revealUpTo: Math.min(LAYERS.length - 1, s.revealUpTo + 1), playReveal: false }));
  break;
case " ":
  if (view === "atlas") { e.preventDefault(); useAppStore.getState().togglePlayReveal(); }
  break;
```

- [ ] **Step 4: Wire into Atlas view**

Add `<ConnectionLines>` and `<RevealScrubber>` to the Atlas view in `page.tsx`. Connection lines go inside `<AtlasCanvas>` (before LayerRegions). Scrubber goes outside the canvas as a sibling overlay.

- [ ] **Step 5: Verify in browser**

Layers should reveal sequentially on load. Scrub bar is interactive. Arrow keys and space work.

- [ ] **Step 6: Commit**

```bash
git add src/components/atlas/connection-lines.tsx src/components/atlas/reveal-scrubber.tsx src/app/page.tsx
git commit -m "feat: add connection lines and reveal scrubber with auto-play"
```

---

## Task 11: Intro Card

**Files:**
- Create: `site/src/components/intro-card.tsx`

- [ ] **Step 1: Create `intro-card.tsx`**

```tsx
"use client";

import { useState } from "react";
import { LAYERS } from "@/data/layers";
import { useAppStore } from "@/store/app-store";

export function IntroCard() {
  const openLayer = useAppStore((s) => s.openLayer);
  const [dismissed, setDismissed] = useState(false);

  if (openLayer || dismissed) return null;

  return (
    <div
      className="glass absolute"
      style={{
        top: 24,
        left: 24,
        width: 360,
        padding: "24px 28px",
        zIndex: 50,
        borderRadius: 14,
        animation: "dossierIn 0.5s ease-out",
      }}
    >
      <div
        className="flex items-center justify-between mb-3"
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          Field Atlas · Cross-Section
        </span>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: "none", border: "none", color: "var(--ink-4)", cursor: "pointer", fontSize: 16 }}
        >
          ×
        </button>
      </div>

      <h1
        style={{
          fontFamily: "var(--display)",
          fontSize: 22,
          fontWeight: 500,
          lineHeight: 1.3,
          color: "var(--ink)",
          margin: "0 0 12px",
        }}
      >
        How an agentic platform actually works.
      </h1>

      <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.5 }}>
        Explore the architecture layer by layer. Click any component to open its dossier.
        Use the scrubber below to reveal layers sequentially.
      </p>

      <div className="flex flex-wrap gap-2">
        {LAYERS.map((l) => (
          <div key={l.id} className="flex items-center gap-1.5">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: l.ink,
                display: "inline-block",
                boxShadow: `0 0 6px ${l.ink}`,
              }}
            />
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>
              {l.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add `?`/`h` key toggle**

In `page.tsx` keyboard handler, add a state for `showIntro` and toggle:

```typescript
case "?":
case "h":
  // Toggle intro card — handled by IntroCard's own dismissed state
  break;
```

(Or lift the `dismissed` state to the store if needed.)

- [ ] **Step 3: Wire into Atlas view and verify**

- [ ] **Step 4: Commit**

```bash
git add src/components/intro-card.tsx src/app/page.tsx
git commit -m "feat: add intro card overlay"
```

---

## Task 12: Dossier Panel with Executive/Engineer Tabs

**Files:**
- Create: `site/src/components/drilldown/dossier-panel.tsx`

- [ ] **Step 1: Create `dossier-panel.tsx`**

```tsx
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
      {/* Header */}
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
```

- [ ] **Step 2: Add Escape key handler**

In `page.tsx` keyboard handler:

```typescript
case "Escape":
  if (useAppStore.getState().openLayer) {
    useAppStore.getState().closeDossier();
  }
  break;
```

- [ ] **Step 3: Wire into page and verify**

Add `<DossierPanel />` as a sibling of the Atlas canvas (not inside it — it's a fixed-position overlay). Verify clicking a component box opens the panel.

- [ ] **Step 4: Commit**

```bash
git add src/components/drilldown/dossier-panel.tsx src/app/page.tsx
git commit -m "feat: add dossier panel with executive/engineer tabs"
```

---

## Task 13: Animated Arrow, Glossary Chips, Tech Chips

**Files:**
- Create: `site/src/components/drilldown/animated-arrow.tsx`, `site/src/components/drilldown/glossary-chip.tsx`, `site/src/components/drilldown/tech-chip.tsx`

- [ ] **Step 1: Create `animated-arrow.tsx`**

Port from `design_handoff_agentic_blueprint/design/drilldown.jsx` lines 5–72.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";

export function AnimatedArrow() {
  const sourceRect = useAppStore((s) => s.sourceRect);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sourceRect) return;
    setProgress(0);
    startRef.current = null;
    const dur = 600;
    const tick = (t: number) => {
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
  const dossierLeft = typeof window !== "undefined" ? window.innerWidth - 460 - 16 : 800;
  const ex = dossierLeft - 8;
  const ey = Math.max(120, Math.min((typeof window !== "undefined" ? window.innerHeight : 600) - 120, sy));

  const cx1 = sx + Math.max(80, (ex - sx) * 0.4);
  const cy1 = sy;
  const cx2 = ex - Math.max(80, (ex - sx) * 0.4);
  const cy2 = ey;
  const path = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`;

  const ease = 1 - Math.pow(1 - progress, 3);
  const total = 1000;

  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="arrow-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0" />
          <stop offset="20%" stopColor="#67E8F9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="1" />
        </linearGradient>
        <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="arrow-head" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
          <path d="M 0 0 L 12 6 L 0 12 L 4 6 Z" fill="#A78BFA" />
        </marker>
      </defs>
      <path d={path} stroke="rgba(167,139,250,0.18)" strokeWidth="1" fill="none" strokeDasharray="3 4" />
      <path
        d={path}
        stroke="url(#arrow-grad)"
        strokeWidth="2"
        fill="none"
        strokeDasharray={total}
        strokeDashoffset={total * (1 - ease)}
        filter="url(#arrow-glow)"
        markerEnd={ease > 0.95 ? "url(#arrow-head)" : undefined}
      />
      <circle cx={sx} cy={sy} r={4 + (1 - ease) * 8} fill="none" stroke="#67E8F9" strokeOpacity={1 - ease} strokeWidth="1.5" />
      <circle cx={sx} cy={sy} r="3" fill="#67E8F9" filter="url(#arrow-glow)" />
    </svg>
  );
}
```

- [ ] **Step 2: Create `glossary-chip.tsx`**

```tsx
"use client";

import { useState, useRef } from "react";
import { GLOSSARY } from "@/data/glossary";

export function GlossaryChip({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const definition = GLOSSARY[term];

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 4,
          border: "1px solid var(--line)",
          background: "transparent",
          color: "var(--ink-3)",
          cursor: "default",
        }}
      >
        {term}
      </button>
      {open && definition && (
        <div
          className="glass"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            padding: "8px 12px",
            borderRadius: 8,
            width: 240,
            zIndex: 100,
            fontSize: 11,
            color: "var(--ink-2)",
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--c1)", marginBottom: 4 }}>{term}</div>
          {definition}
        </div>
      )}
    </span>
  );
}
```

- [ ] **Step 3: Create `tech-chip.tsx`**

```tsx
"use client";

import { useState } from "react";
import { lookupTech } from "@/data/tech-catalog";

interface TechChipProps {
  label: string;
  ink: string;
}

export function TechChip({ label, ink }: TechChipProps) {
  const [expanded, setExpanded] = useState(false);
  const detail = lookupTech(label);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 4,
          border: `1px solid ${ink}33`,
          background: `${ink}0D`,
          color: ink,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
      {expanded && detail && (
        <div
          className="glass"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            padding: "14px 16px",
            borderRadius: 10,
            width: 300,
            zIndex: 100,
            animation: "techDetailIn 0.2s ease-out",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)" }}>Technology</span>
            <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", color: "var(--ink-4)", cursor: "pointer" }}>×</button>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "var(--ink)" }}>{detail.name}</h3>
          <p style={{ fontSize: 11, color: "var(--ink-2)", margin: "0 0 10px", lineHeight: 1.4 }}>{detail.blurb}</p>

          {detail.pros.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--c5)" }}>PROS</span>
              <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 11, color: "var(--ink-2)" }}>
                {detail.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {detail.cons.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--signal)" }}>CONS</span>
              <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 11, color: "var(--ink-2)" }}>
                {detail.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6 }}>
            <span style={{ fontFamily: "var(--mono)" }}>Best for:</span> {detail.best}
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>
            {detail.license} · {detail.maturity}
          </div>
        </div>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Wire AnimatedArrow into page**

Add `<AnimatedArrow />` as a sibling of `<DossierPanel />` in the Atlas view.

- [ ] **Step 5: Verify in browser**

Click a component → arrow animates → dossier opens → glossary chips show popovers on hover → tech chips expand on click.

- [ ] **Step 6: Commit**

```bash
git add src/components/drilldown/
git commit -m "feat: add animated arrow, glossary chips, and tech chips"
```

---

## Task 14: Patterns View

**Files:**
- Create: `site/src/components/patterns/pattern-explorer.tsx`, `site/src/components/patterns/pattern-viz.tsx`

- [ ] **Step 1: Create `pattern-viz.tsx`**

Four SVG topologies. Port the node/edge layouts from `design_handoff_agentic_blueprint/design/patterns.jsx` `PatternViz` component.

```tsx
"use client";

interface PatternVizProps {
  id: string;
}

function SupervisorViz() {
  const cx = 360, cy = 230, r = 150;
  const specialists = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (
    <g>
      {specialists.map((s, i) => (
        <g key={i}>
          <line
            x1={cx} y1={cy} x2={s.x} y2={s.y}
            stroke="var(--c1)" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5"
            style={{ animation: `drawline 1.5s ease-out ${0.3 + i * 0.15}s both` }}
          />
          <circle
            cx={s.x} cy={s.y} r="18"
            fill="var(--c2)" fillOpacity="0.15" stroke="var(--c2)" strokeWidth="1"
            style={{ animation: `pop 0.5s ease-out ${0.5 + i * 0.15}s both` }}
          />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="24" fill="var(--c1)" fillOpacity="0.2" stroke="var(--c1)" strokeWidth="1.5"
        style={{ animation: "pop 0.5s ease-out 0.2s both", filter: "drop-shadow(0 0 8px var(--c1))" }} />
      <text x={cx} y={cy + 3} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--c1)" }}>SUPER</text>
    </g>
  );
}

function PipelineViz() {
  const xs = [80, 220, 360, 500, 640];
  const cy = 230;
  return (
    <g>
      {xs.map((x, i) => (
        <g key={i}>
          {i < xs.length - 1 && (
            <line x1={x + 30} y1={cy} x2={xs[i + 1] - 30} y2={cy}
              stroke="var(--c1)" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5"
              style={{ animation: `drawline 1.5s ease-out ${0.3 + i * 0.2}s both` }} />
          )}
          <rect x={x - 30} y={cy - 24} width="60" height="48" rx="6"
            fill="var(--c2)" fillOpacity="0.12" stroke="var(--c2)" strokeWidth="1"
            style={{ animation: `pop 0.5s ease-out ${0.2 + i * 0.15}s both` }} />
          <text x={x} y={cy + 3} textAnchor="middle"
            style={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--c2)" }}>
            S{i + 1}
          </text>
        </g>
      ))}
    </g>
  );
}

function SwarmViz() {
  const cx = 360, cy = 230, r = 130;
  const nodes = Array.from({ length: 7 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    edges.push([i, (i + 1) % nodes.length]);
    if (i < 2) edges.push([i, i + 3]);
  }

  return (
    <g>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="var(--c3)" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.4"
          style={{ animation: `drawline 1.5s ease-out ${0.2 + i * 0.1}s both` }} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="14"
          fill="var(--c3)" fillOpacity="0.12" stroke="var(--c3)" strokeWidth="1"
          style={{ animation: `pop 0.5s ease-out ${0.3 + i * 0.1}s both` }} />
      ))}
    </g>
  );
}

function HierarchicalViz() {
  const levels = [
    [{ x: 360, y: 80 }],
    [{ x: 200, y: 200 }, { x: 360, y: 200 }, { x: 520, y: 200 }],
    Array.from({ length: 9 }, (_, i) => ({ x: 120 + i * 60, y: 330 })),
  ];

  return (
    <g>
      {levels[0].map((parent, pi) =>
        levels[1].map((child, ci) => (
          <line key={`0-${pi}-${ci}`} x1={parent.x} y1={parent.y + 16} x2={child.x} y2={child.y - 16}
            stroke="var(--c4)" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5"
            style={{ animation: `drawline 1.5s ease-out ${0.3 + ci * 0.15}s both` }} />
        ))
      )}
      {levels[1].map((parent, pi) =>
        levels[2].slice(pi * 3, pi * 3 + 3).map((child, ci) => (
          <line key={`1-${pi}-${ci}`} x1={parent.x} y1={parent.y + 16} x2={child.x} y2={child.y - 12}
            stroke="var(--c4)" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.4"
            style={{ animation: `drawline 1.5s ease-out ${0.5 + ci * 0.1}s both` }} />
        ))
      )}
      {levels[0].map((n, i) => (
        <circle key={`l0-${i}`} cx={n.x} cy={n.y} r="20"
          fill="var(--c4)" fillOpacity="0.15" stroke="var(--c4)" strokeWidth="1.5"
          style={{ animation: "pop 0.5s ease-out 0.2s both", filter: "drop-shadow(0 0 6px var(--c4))" }} />
      ))}
      {levels[1].map((n, i) => (
        <circle key={`l1-${i}`} cx={n.x} cy={n.y} r="16"
          fill="var(--c4)" fillOpacity="0.12" stroke="var(--c4)" strokeWidth="1"
          style={{ animation: `pop 0.5s ease-out ${0.3 + i * 0.1}s both` }} />
      ))}
      {levels[2].map((n, i) => (
        <circle key={`l2-${i}`} cx={n.x} cy={n.y} r="10"
          fill="var(--c4)" fillOpacity="0.08" stroke="var(--c4)" strokeWidth="0.8"
          style={{ animation: `pop 0.5s ease-out ${0.5 + i * 0.06}s both` }} />
      ))}
    </g>
  );
}

export function PatternViz({ id }: PatternVizProps) {
  return (
    <svg viewBox="0 0 720 460" className="w-full h-full">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {id === "supervisor" && <SupervisorViz />}
      {id === "pipeline" && <PipelineViz />}
      {id === "swarm" && <SwarmViz />}
      {id === "hierarchical" && <HierarchicalViz />}
    </svg>
  );
}
```

- [ ] **Step 2: Create `pattern-explorer.tsx`**

```tsx
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
          {active.inTheWild && active.inTheWild.length > 0 && (
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
      <div className="mt-8" style={{ maxWidth: 800, margin: "32px auto 0" }}>
        {active.sections && (
          <>
            {active.sections.whenToUse && <ContentSection title="When to Use" content={active.sections.whenToUse} />}
            {active.sections.anatomy && <ContentSection title="Anatomy" content={active.sections.anatomy} />}
            {active.sections.scaling && <ContentSection title="Scaling" content={active.sections.scaling} />}
            {active.sections.failureModes && <ContentSection title="Failure Modes" content={active.sections.failureModes} />}
            {active.sections.walkthrough && <ContentSection title="Walkthrough" content={active.sections.walkthrough} />}
            {active.sections.stack && active.sections.stack.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.15em", color: "var(--ink-3)", marginBottom: 8 }}>
                  RECOMMENDED STACK
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {active.sections.stack.map((s, i) => (
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
          </>
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
```

- [ ] **Step 3: Wire into page.tsx**

Replace the Patterns placeholder:

```tsx
{view === "patterns" && <PatternExplorer />}
```

- [ ] **Step 4: Verify in browser**

Switch to Patterns tab. Four topologies selectable. SVG diagram animates. Long-form content scrolls below.

- [ ] **Step 5: Commit**

```bash
git add src/components/patterns/
git commit -m "feat: add patterns view with topology diagrams and long-form content"
```

---

## Task 15: Example View & Mini-Atlas

**Files:**
- Create: `site/src/components/example/example-view.tsx`, `site/src/components/example/mini-atlas.tsx`

- [ ] **Step 1: Create `mini-atlas.tsx`**

```tsx
"use client";

import { LAYERS } from "@/data/layers";

interface MiniAtlasProps {
  activeLayer: string;
  activeComp: string;
}

export function MiniAtlas({ activeLayer, activeComp }: MiniAtlasProps) {
  const rowH = 40;
  const compW = 70;
  const compH = 24;
  const leftPad = 140;

  return (
    <svg viewBox={`0 0 720 ${LAYERS.length * rowH + 20}`} className="w-full">
      {LAYERS.map((layer, i) => {
        const isActive = layer.id === activeLayer;
        const y = 10 + i * rowH;

        return (
          <g key={layer.id} style={{ opacity: isActive ? 1 : 0.32, transition: "opacity 0.3s" }}>
            {/* Row background */}
            {isActive && (
              <rect x={0} y={y} width={720} height={rowH} rx={4}
                fill={layer.ink} fillOpacity={0.06} stroke={layer.ink} strokeOpacity={0.15} strokeWidth={1} />
            )}

            {/* Layer label */}
            <text x={8} y={y + rowH / 2 + 3}
              style={{ fontFamily: "var(--mono)", fontSize: 8, fill: isActive ? layer.ink : "var(--ink-4)", letterSpacing: "0.1em" }}>
              {layer.n} {layer.name}
            </text>

            {/* Component chips */}
            {layer.components.map((comp, ci) => {
              const isActiveComp = isActive && comp.id === activeComp;
              const cx = leftPad + ci * (compW + 4);
              return (
                <g key={comp.id}>
                  <rect
                    x={cx} y={y + 8} width={compW} height={compH} rx={3}
                    fill={isActiveComp ? layer.ink : layer.ink}
                    fillOpacity={isActiveComp ? 0.25 : 0.06}
                    stroke={layer.ink}
                    strokeOpacity={isActiveComp ? 0.7 : 0.15}
                    strokeWidth={isActiveComp ? 1.5 : 0.5}
                    style={isActiveComp ? { filter: `drop-shadow(0 0 6px ${layer.ink})` } : undefined}
                  />
                  <text
                    x={cx + compW / 2} y={y + 8 + compH / 2 + 3}
                    textAnchor="middle"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: Math.min(7, compW / (comp.name.length * 0.55)),
                      fill: isActiveComp ? layer.ink : "var(--ink-4)",
                    }}
                  >
                    {comp.name}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Create `example-view.tsx`**

```tsx
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
                  border: `1px solid ${i === activeStep ? "var(--line-3)" : i < activeStep ? "var(--line)" : "var(--line)"}`,
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
```

- [ ] **Step 3: Wire into page.tsx**

```tsx
{view === "example" && <ExampleView />}
```

- [ ] **Step 4: Verify in browser**

Switch to Example tab. Step list is interactive. Mini-atlas highlights active layer/component. Payload expands on click.

- [ ] **Step 5: Commit**

```bash
git add src/components/example/
git commit -m "feat: add example view with mini-atlas and step walkthrough"
```

---

## Task 16: Final Integration & Build Verification

**Files:**
- Modify: `site/src/app/page.tsx` (ensure all components wired up)

- [ ] **Step 1: Ensure all Atlas view components are wired**

Verify `page.tsx` renders for the Atlas view:
- `<AtlasCanvas>` with `<ConnectionLines>` + `<LayerRegion>` for each layer
- `<IntroCard />`
- `<RevealScrubber />`
- `<DossierPanel />`
- `<AnimatedArrow />`

- [ ] **Step 2: Verify all keyboard shortcuts work**

Full keyboard handler in `page.tsx`:

```typescript
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const state = useAppStore.getState();

    switch (e.key) {
      case "1": state.setView("atlas"); break;
      case "2": state.setView("patterns"); break;
      case "3": state.setView("example"); break;
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
```

- [ ] **Step 3: Run production build**

```bash
cd site && npm run build
```

Expected: build succeeds with static export. Output in `site/out/`.

- [ ] **Step 4: Test the static build**

```bash
npx serve site/out
```

Open in browser. Verify all three views work, theme toggle works, keyboard shortcuts work, dossier panel opens with arrow animation.

- [ ] **Step 5: Verify URL sync**

- Navigate to `?view=patterns` → Patterns view loads
- Click a component in Atlas → URL updates with `?layer=...&comp=...`
- Copy URL, paste in new tab → same dossier opens

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete all three views with full interactivity"
```

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `npm run build` succeeds with no errors
- [ ] All three views render (Atlas, Patterns, Example)
- [ ] Atlas: pan/zoom works, layers reveal sequentially, components are clickable
- [ ] Atlas: dossier opens with animated arrow, exec/eng tabs switch, glossary popovers work, tech chips expand
- [ ] Atlas: reveal scrubber plays/pauses, arrow keys scrub, space toggles
- [ ] Patterns: 4 topologies render with animated SVG, long-form content scrolls
- [ ] Example: step list is interactive, mini-atlas highlights, payload expands
- [ ] Theme toggle switches dark/light and persists across refresh
- [ ] Keyboard shortcuts: 1/2/3, arrows, space, escape all work
- [ ] URL sync: view and dossier state are reflected in URL
- [ ] Reduced motion: animations disabled when OS preference is set
- [ ] Fonts: Geist, JetBrains Mono, Source Serif 4 load correctly
