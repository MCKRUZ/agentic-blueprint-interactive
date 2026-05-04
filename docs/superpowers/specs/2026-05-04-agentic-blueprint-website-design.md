# Agentic Blueprint Interactive Website — Design Spec

**Date:** 2026-05-04
**Status:** Draft
**Source:** `design_handoff_agentic_blueprint/design/` prototype

## Summary

Recreate the high-fidelity design prototype as a production Next.js website. The site is an editorial "field atlas" of a 10-layer, 46-component agentic platform architecture, presented through three interactive views: Atlas (pan/zoom architecture diagram with drilldown dossiers), Patterns (four orchestration topology diagrams with deep content), and Example (step-by-step scenario walkthrough).

**Deployment target:** Azure Static Web Apps (built locally, pushed to git, pulled down elsewhere).

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | URL routing, `next/font`, Azure SWA first-class support |
| Language | TypeScript | Type safety on the 6 data files and component props |
| Styling | Tailwind CSS v4 + CSS custom properties | Tailwind for layout/spacing/typography; CSS vars for tokens, glass/glow effects, keyframes |
| State | Zustand | 1KB, well-defined state shape, URL sync pattern |
| Fonts | `next/font` | Self-hosted Geist, JetBrains Mono, Source Serif 4 — no Google CDN dependency |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — fonts, theme provider, metadata
│   ├── page.tsx            # Single-page app shell, keyboard shortcut registration
│   └── globals.css         # Design tokens, keyframes, glass/glow effects, background
├── components/
│   ├── topbar.tsx          # Brand + view tabs + theme toggle + print button
│   ├── stat-rail.tsx       # Counter pills ("10 Layers · 46 Components · ...")
│   ├── intro-card.tsx      # Hero overlay card on Atlas view
│   ├── atlas/
│   │   ├── atlas-canvas.tsx    # Pan/zoom SVG container (1600x1100 world)
│   │   ├── layer-region.tsx    # Hairline rect + label for each layer
│   │   ├── component-box.tsx   # Tinted glass box per component
│   │   ├── connection-lines.tsx # Orthogonal dashed SVG paths with flow animation
│   │   └── reveal-scrubber.tsx  # Play/pause + scrub bar + layer label
│   ├── drilldown/
│   │   ├── dossier-panel.tsx   # Right-side drawer (~460px)
│   │   ├── animated-arrow.tsx  # Cubic-bezier SVG path from source box to panel
│   │   ├── glossary-chip.tsx   # Term pill with hover popover
│   │   └── tech-chip.tsx       # Tech pill with expandable pros/cons sub-panel
│   ├── patterns/
│   │   ├── pattern-explorer.tsx # 3-column layout + long-form content below
│   │   └── pattern-viz.tsx      # SVG topology diagrams (4 variants)
│   └── example/
│       ├── example-view.tsx    # Step list + detail panel
│       └── mini-atlas.tsx      # Compact 720x460 layer diagram
├── data/
│   ├── layers.ts           # LAYERS array (10 layers, 46 components)
│   ├── enrichment.ts       # Per-component what/why/tech enrichment
│   ├── tech-catalog.ts     # Tech lookup with pros/cons/best-for/license/maturity
│   ├── patterns.ts         # 4 topology definitions + long-form sections
│   ├── glossary.ts         # ~60 term definitions
│   └── example-steps.ts    # "Where's my refund?" scenario trace
├── store/
│   └── app-store.ts        # Zustand store + URL sync
└── lib/
    └── tech-lookup.ts      # normalize + fuzzy match for tech catalog
```

## Data Layer

All content lifted verbatim from prototype data files into typed TypeScript modules.

### Types

```typescript
interface Component {
  id: string;           // "chat-ui"
  name: string;         // "Chat UI"
  exec: string;         // Executive copy
  eng: string;          // Engineering copy
  terms: string[];      // Glossary term keys
}

interface Layer {
  n: string;            // "01"–"10"
  id: string;           // "surface"
  name: string;         // "User Surface"
  tagline: string;      // One-line summary
  ink: string;          // CSS color "#67E8F9"
  exec: string;         // Executive copy
  eng: string;          // Engineering copy
  components: Component[];
}

interface CompEnrichment {
  what: string;         // User-facing description
  why: string;          // Architectural rationale
  tech: string[];       // 5–10 technology options
}

interface TechEntry {
  name: string;
  blurb: string;
  pros: string[];
  cons: string[];
  best: string;
  license: string;
  maturity: string;     // "Alpha" | "Beta" | "GA" | "Production"
}

interface Pattern {
  id: string;           // "supervisor" | "pipeline" | "swarm" | "hierarchical"
  name: string;
  summary: string;
  sections: {
    whenToUse: string;
    anatomy: string;
    scaling: string;
    failureModes: string;
    walkthrough: string;
    stack: string[];
  };
}

interface ExampleTrace {
  id: string;           // "refund-query"
  title: string;        // "Where's my refund?"
  subtitle: string;
  user: { name: string; persona: string; channel: string };
  steps: ExampleStep[];
}

interface ExampleStep {
  n: number;
  layer: string;        // References Layer.id
  comp: string;         // References Component.id
  title: string;
  narrative: string;
  payload: Record<string, unknown>;
}
```

### Tech Lookup

`lib/tech-lookup.ts` normalizes keys via `s.toLowerCase().replace(/[^a-z0-9]/g, "")`. Lookup cascade: exact match → strip parentheses and comma fragments → prefix match. Matches prototype's `norm()` + `lookupTech()`.

### Enrichment Merge

Done once at module level in `data/layers.ts`: iterate LAYERS, merge `{ what, why, tech }` from `COMP_ENRICHMENT[comp.id]` into each component. Consumers import already-enriched data.

## State Management

### Zustand Store

```
URL-persisted (synced to searchParams via history.replaceState):
  view:       "atlas" | "patterns" | "example"
  openLayer:  string | null     // layer.id
  openComp:   string | null     // component.id

localStorage-persisted:
  theme:      "dark" | "light"

Transient (in-memory only):
  revealUpTo:  number           // -1..9
  playReveal:  boolean
  sourceRect:  { x, y, w, h } | null
  hoveredComp: string | null

Actions:
  setView(v)        → clears openLayer/openComp, syncs URL
  openDossier(layerId, compId?, sourceRect?)  → syncs URL
  closeDossier()    → clears openLayer/openComp/sourceRect, syncs URL
  setTheme(t)       → toggles data-theme on <html>, persists localStorage
  setRevealUpTo(n)
  togglePlayReveal()
  setHoveredComp(id | null)
```

### URL Sync

On store mutation: push `?view=atlas&layer=orchestration&comp=planner` via `window.history.replaceState`. On mount: hydrate from `searchParams`. Dossier links are shareable.

### Theme

Read `localStorage` on mount → fallback to `prefers-color-scheme` → apply `data-theme` attribute on `<html>`. CSS custom properties handle all visual switching.

### Keyboard Shortcuts

Registered once in `page.tsx` via `useEffect` on `keydown`:

| Key | Action | Context |
|---|---|---|
| `1` / `2` / `3` | Switch view | Global |
| `←` / `→` | Scrub reveal index | Atlas only |
| `Space` | Toggle play/pause reveal | Atlas only |
| `Escape` | Close tech sub-panel → dossier (layered) | Atlas only |
| `?` or `h` | Toggle intro card visibility | Atlas only |

## Design System (CSS)

### Token Strategy

`globals.css` owns design tokens as CSS custom properties. Dark theme in `:root`, light in `[data-theme="light"]`.

**Surface colors (dark):**
`--bg-0: #05060B`, `--bg-1: #0A0C16`, `--bg-2: #11142A`, `--glass: rgba(20,26,50,0.55)`, `--glass-2: rgba(28,36,70,0.65)`

**Borders:** `--line: rgba(120,200,255,0.18)`, `--line-2` at 0.32, `--line-3` at 0.55

**Text:** `--ink: #E8F1FF`, `--ink-2: #B7C7DD`, `--ink-3: #7B8AA6`, `--ink-4: #4F5A75`

**HUD accents:** `--c1: #67E8F9` (cyan), `--c2: #A78BFA` (violet), `--c3: #F472B6` (magenta), `--c4: #FBBF24` (amber), `--c5: #4ADE80` (mint), `--signal: #F87171`

**Layer inks:** `--ink-l01: #67E8F9` through `--ink-l10: #F87171` (holographic spectrum)

**Typography:** `--type-scale: 1.18`, body = `calc(15px * var(--type-scale))`, line-height 1.55, font-feature-settings `"ss01", "kern", "liga"`

### Complex Effects (in CSS, not Tailwind)

**Glass panels:**
```css
background: linear-gradient(180deg, rgba(15,18,38,0.78), rgba(10,12,22,0.78));
backdrop-filter: blur(20px);
border: 1px solid var(--line);
box-shadow: 0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
```

**Glow:** `filter: drop-shadow(0 0 8px var(--c1))` and SVG `<feGaussianBlur stdDeviation="3-4">`

**Background:** Three layered radial gradients (cyan 10%, violet 10%, magenta 6%) over `--bg-0`, plus 80px SVG grid pattern at 18% opacity.

### Keyframe Animations

| Name | Duration | Purpose |
|---|---|---|
| `flowdash` | 14s infinite | Dashed stroke offset cycling on connection lines |
| `pop` | 0.5s | Scale 0→1 + opacity for pattern viz nodes |
| `drawline` | 1.5s | Stroke-dashoffset reveal for pattern viz edges |
| `compPulse` / `ringExpand` | ~300ms | Hover feedback on component boxes |

### Reduced Motion

Global `@media (prefers-reduced-motion: reduce)` rule disables `flowdash`, `pop`, `drawline`, and the reveal cascade. Transitions become instant.

### Tailwind Usage

Layout (`flex`, `grid`, `gap`), spacing (`p-*`, `m-*`), typography (`text-sm`, `font-mono`), and referencing CSS vars via `text-[var(--ink)]` / `bg-[var(--bg-1)]` arbitrary value syntax.

## Atlas View

The hero view. Three visual layers: SVG canvas, floating HUD overlays, and the dossier drawer.

### Atlas Canvas (`atlas-canvas.tsx`)

- SVG with 1600x1100 logical world inside a full-stage `div`
- Pan: `onPointerDown` → track drag delta → update `transform.x/y`
- Zoom: `onWheel` → scale `transform.k` clamped 0.4–3.2, zoom toward cursor
- Transform: `style={{ transform: translate(${x}px, ${y}px) scale(${k}) }}`
- Recenter button resets `{ x: 0, y: 0, k: 1 }` with CSS transition

### Layer Regions (`layer-region.tsx`)

10 hand-positioned rects from REGIONS constant:

| Region | x | y | w | h | cols |
|---|---|---|---|---|---|
| surface | 60 | 60 | 1200 | 110 | 5 |
| identity | 60 | 200 | 1200 | 110 | 4 |
| orchestration | 360 | 340 | 600 | 140 | 4 |
| runtime | 360 | 510 | 600 | 200 | 4 |
| memory_state | 60 | 340 | 280 | 370 | 2 |
| tools | 1000 | 340 | 260 | 370 | 2 |
| gateway | 1290 | 340 | 250 | 370 | 1 |
| observability | 1290 | 60 | 250 | 820 | 1 |
| governance | 360 | 910 | 600 | 110 | 5 |

Each region: hairline `--line` border, mono uppercase layer number + name, italic serif tagline. Visibility driven by `revealUpTo` — layers beyond the index are `opacity: 0, translateY(12px)`.

### Component Boxes (`component-box.tsx`)

Grid-distributed within regions via `computeCompBoxes()`: cols from REGIONS, rows = ceil(count/cols). Each box: layer ink at ~8% opacity fill, ~20% ink hairline border. Hover: brighter border, scale 1.04, `compPulse` ring. Click: `openDossier(layerId, compId, boundingRect)`.

### Connection Lines (`connection-lines.tsx`)

Orthogonal SVG `<line>` elements between related layers. `stroke-dasharray: 4 4` with `flowdash` animation (14s). Active layer connections brighten and thicken.

### Reveal Scrubber (`reveal-scrubber.tsx`)

Bottom-center HUD overlay. Play/pause (unicode glyphs), scrub bar with per-layer ticks, label "01 / 10 · User Surface". Auto-plays on mount: 450ms delay then 220ms per layer.

### Intro Card (`intro-card.tsx`)

Top-left HUD overlay, hidden when dossier open. Eyebrow "Field Atlas · Cross-Section", H1 "How an agentic platform actually works.", paragraph, 10-color legend.

### Dossier Panel (`dossier-panel.tsx`)

Right-side drawer, ~460px, frosted glass, z-above canvas. Tabs: Executive / Engineer. Layer dossier: name + tagline, copy, component list (clickable), enrichment (responsibilities, decision points, anti-patterns, KPIs). Component dossier: name, copy, glossary chips (hover → popover), tech chips (click → sub-panel with pros/cons/best-for).

### Animated Arrow (`animated-arrow.tsx`)

Full-viewport SVG overlay. Cubic bezier from `sourceRect` to dossier panel edge. Animates `stroke-dashoffset` from full length to 0 over ~600ms with `1 - (1-p)^3` easing. Start circle, gradient stroke (layer ink → fade), end arrowhead marker. Glow via SVG `<feGaussianBlur>`.

### Zoom Controls

Corner stack of +/−/recenter icon buttons, frosted glass. Mutate `transform.k` or reset.

## Patterns View

### Layout

Above the fold: three-column split — left pattern list (4 items), center SVG topology diagram, right stats rail ("in the wild" examples). Below the fold: long-form content (whenToUse, anatomy, scaling, failureModes, walkthrough, stack).

### Pattern Visualizations (`pattern-viz.tsx`)

Four SVG topologies, each with `drawline` (1.5s) + `pop` (0.5s) staggered entrance:

| Pattern | Layout | Elements |
|---|---|---|
| Supervisor | Central + 5 satellites on circle | Coordinator node (cyan glow), specialist nodes (violet), dashed cyan edges with arrowheads |
| Hierarchical | Tree: 1 root → 3 mid → 9 leaf | Three-tier tree, edges connecting parent to children |
| Pipeline | 5 sequential boxes left-to-right | Linear stages with directional arrows |
| Swarm | 7 nodes circular, 9 mesh edges | Peer-to-peer mesh, all-to-all connections |

## Example View

"Where's my refund?" scenario walkthrough (~10 steps).

### Mini-Atlas (`mini-atlas.tsx`)

720x460 SVG. One row per layer, component chips as small boxes. Active layer: full opacity + halo highlight. Active component: bright fill + glow filter. Inactive layers: 32% opacity. Subtle grid background.

### Step List + Detail

Left: numbered step buttons (step.n, layer name, step title). Active step: bright accent. Past steps: grayed. Right: step detail panel with narrative text + expandable JSON payload viewer (mono, collapsible).

Steps trace: chat input → auth/identity → policy check → orchestration/planning → memory retrieval → tool calls → safety check → human approval → response delivery → audit log.

## Things Not Shipped

- `tweaks-panel.jsx` and `<Tweaks>` component
- `EDITMODE-BEGIN` / `EDITMODE-END` block from `app.jsx`
- `__bundler_thumbnail` template from `index.html`
- Runtime React + Babel script tags
