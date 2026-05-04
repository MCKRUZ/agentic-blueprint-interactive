# Handoff: Agentic Blueprint — "The Anatomy of an Agentic Platform"

## Overview

A long-form, single-page interactive **field atlas** of an agentic platform. The site lets a reader explore a 10-layer / 46-component architecture three ways:

1. **Atlas** — a free-form orthographic architecture diagram (pan/zoom, hover, click-through drilldowns into each layer and component).
2. **Patterns** — four orchestration topologies (Supervisor, Plan-and-Execute, Pipeline, Swarm) with diagrams + deep context.
3. **Example** — a step-by-step walkthrough of one customer-support scenario lighting up the relevant layer + component on a mini-atlas.

It is intended as a reference website (think editorial / explainer microsite), not a product UI. Aesthetic is **dark, holographic, ethereal — isometric architectural section** with a cyan / violet / magenta HUD spectrum and a soft-glow wireframe vibe.

## About the Design Files

The files in `design/` are **design references built in HTML/JSX (in-browser Babel)** — interactive prototypes showing intended look and behavior. They are **not production code to copy directly**.

The job is to **recreate these designs in the target codebase's environment** using its established framework, build pipeline, and component patterns. If no codebase exists yet, choose the most appropriate stack (Next.js + Tailwind is a strong default for a content-heavy interactive microsite like this) and implement there.

Notes specifically for re-implementation:

- The prototype loads React via UMD + `<script type="text/babel">`. **Do not ship that to production** — set up a normal bundler (Vite / Next.js) and compile JSX ahead of time.
- The prototype uses `window.LAYERS`, `window.PATTERNS`, `window.GLOSSARY`, `window.TECH_CATALOG`, `window.EXAMPLE_STEPS`, etc. as a quick way to share data between separate `<script>` tags. Re-implement these as proper ES module imports.
- The prototype includes a **Tweaks panel** (theme/motion/typescale toggles persisted via `postMessage`). That is a designer-tool overlay; **do not ship the Tweaks panel** in production. Carry over only the underlying behaviors that should be permanent (theming + reduced-motion support).

## Fidelity

**High-fidelity (hifi).** Final colors, typography scale, spacing, motion, layout, and interactions are all defined. Recreate pixel-faithfully. The exact data — layer/component copy, glossary, patterns, example steps — should be lifted verbatim from `design/data.jsx`, `design/patterns.jsx` (the `PATTERNS` array near the top of the file), `design/tech-catalog.jsx`, `design/enrichment.jsx`, and `design/example-data.jsx`.

## File Map (what's in `design/`)

| File | Purpose |
|---|---|
| `index.html` | Shell. Loads React/Babel, then JSX modules in order. Owns global keyframes + bundler thumbnail. |
| `styles.css` | All styling. Tokens, layout, components, motion. ~2,100 lines — the canonical source for visual design. |
| `app.jsx` | Top-level `<App>`. Topbar, view tabs, stat rail, intro card, hotkeys, global state, keyboard shortcuts, theme application. Also defines `window.GLOSSARY`. |
| `data.jsx` | The 10 layers and 46 components — id, name, ink color, executive copy, engineering copy, glossary terms. **Source of truth for atlas content.** |
| `atlas.jsx` | The orthographic architecture diagram (pan/zoom, hover ripple, click-to-drilldown). Layer regions are hand-positioned in `REGIONS`. |
| `drilldown.jsx` | The "Dossier" side panel that opens when a layer or component is clicked, with the animated SVG arrow that connects the source box to the panel. |
| `enrichment.jsx` | Rich per-layer detail (responsibilities, decision points, anti-patterns, KPIs) shown in the dossier. |
| `tech-catalog.jsx` | `window.TECH_CATALOG` — the tech chips inside dossiers (e.g. OAuth, OPA, Neo4j) with pros/cons/best-for sub-panels. |
| `patterns.jsx` | Pattern Explorer view — 4 topology diagrams + long-form per-pattern content (when-to-use, anatomy, scaling, failure modes, walkthrough, stack). |
| `example.jsx` | Example view — step-by-step scenario walkthrough with mini-atlas highlighting active layer/component per step. |
| `example-data.jsx` | The scenario steps + payloads for the Example view. |
| `tweaks-panel.jsx` | Designer-only tweak controls (theme, ambient motion, hotkeys, type scale). **Do not ship.** |

## Information Architecture

Single-page application with three views, switched by tabs in the topbar (or `1` / `2` / `3` keys):

```
┌──────────────────────────────────────────────────────────────┐
│ Topbar:  brand · view tabs (Atlas / Patterns / Example) ·    │
│          theme toggle · print button                         │
├──────────────────────────────────────────────────────────────┤
│ Stat rail: "10 Layers · 46 Components · 4 Topologies ·       │
│             Live diagram · ATLAS"                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   STAGE  (one of the three views)                            │
│                                                              │
│   Atlas:    pan/zoom architecture diagram + intro card +     │
│             reveal scrubber + dossier panel on click         │
│   Patterns: left list / center diagram / right rail / long   │
│             content section below                            │
│   Example:  mini-atlas + step list + step detail w/ payload  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The dossier in Atlas opens **on top of** the diagram with an animated SVG arrow connecting the clicked box to the panel — see `drilldown.jsx`.

## Design Tokens

All token values are defined in `styles.css` `:root` (dark) and `[data-theme="light"]`. The most important:

### Color — base surfaces (dark)

| Token | Value | Purpose |
|---|---|---|
| `--bg-0` | `#05060B` | Page background |
| `--bg-1` | `#0A0C16` | Card surface |
| `--bg-2` | `#11142A` | Elevated surface |
| `--glass` | `rgba(20, 26, 50, 0.55)` | Frosted panel fill |
| `--glass-2` | `rgba(28, 36, 70, 0.65)` | Frosted panel fill, stronger |
| `--line` | `rgba(120, 200, 255, 0.18)` | Hairline rule |
| `--line-2` | `rgba(140, 220, 255, 0.32)` | Stronger rule |
| `--line-3` | `rgba(170, 240, 255, 0.55)` | Active/hover rule |
| `--ink` | `#E8F1FF` | Primary text |
| `--ink-2` | `#B7C7DD` | Secondary text |
| `--ink-3` | `#7B8AA6` | Tertiary text |
| `--ink-4` | `#4F5A75` | Muted / labels |

### Color — base surfaces (light)

| Token | Value |
|---|---|
| `--bg-0` | `#F0F3FA` |
| `--bg-1` | `#E5EAF5` |
| `--bg-2` | `#D8E0F0` |
| `--glass` | `rgba(255, 255, 255, 0.65)` |
| `--glass-2` | `rgba(255, 255, 255, 0.85)` |
| `--line` | `rgba(20, 50, 90, 0.18)` |
| `--line-2` | `rgba(20, 50, 90, 0.34)` |
| `--line-3` | `rgba(20, 50, 90, 0.6)` |
| `--ink` | `#0A1530` |
| `--ink-2` | `#2C3D60` |
| `--ink-3` | `#5C6B85` |
| `--ink-4` | `#93A0B7` |

### Color — HUD accents

| Token | Value | Use |
|---|---|---|
| `--c1` | `#67E8F9` | Cyan — primary HUD |
| `--c2` | `#A78BFA` | Violet — secondary HUD |
| `--c3` | `#F472B6` | Magenta — tertiary HUD |
| `--c4` | `#FBBF24` | Amber accent |
| `--c5` | `#4ADE80` | Mint |
| `--signal` | `#F87171` | Alert / governance |

### Color — layer inks (top → bottom of the atlas, holographic spectrum)

| Token | Value | Layer |
|---|---|---|
| `--ink-l01` | `#67E8F9` | 01 User Surface |
| `--ink-l02` | `#38BDF8` | 02 Identity & Trust |
| `--ink-l03` | `#818CF8` | 03 Orchestration |
| `--ink-l04` | `#A78BFA` | 04 Runtime |
| `--ink-l05` | `#C084FC` | 05 Memory |
| `--ink-l06` | `#E879F9` | 06 State |
| `--ink-l07` | `#F472B6` | 07 Tools / Gateway |
| `--ink-l08` | `#FB7185` | 08 Observability |
| `--ink-l09` | `#FBBF24` | 09 (lower band) |
| `--ink-l10` | `#F87171` | 10 Governance |

(Each layer's `ink` is also stored on the data object in `data.jsx` and is the source of truth for that component group's color.)

### Typography

Three families. Imported from Google Fonts in `styles.css`:

| Token | Family | Use |
|---|---|---|
| `--display` | `Source Serif 4` (italic for accents), fallback `Iowan Old Style, Georgia, serif` | Editorial display headings, intro card title |
| `--sans` | `Geist`, fallback `system-ui, -apple-system, sans-serif` | Body, UI |
| `--mono` | `JetBrains Mono`, fallback `ui-monospace, Menlo, monospace` | Numerals, labels, eyebrows, glossary chips |

Body baseline: `font-size: calc(15px * var(--type-scale))`, `line-height: 1.55`, `font-feature-settings: "ss01", "kern", "liga"`.

`--type-scale` defaults to `1.18` (a designer knob — keep `1.18` as the production default; `1.0` is the original tighter scale).

### Spacing / Radius / Motion

- Hairline: `1px` solid `--line`.
- Card radius: `12px–16px` for panels; `4px–6px` for chips and buttons; component boxes in atlas use `4px`.
- Frosted panels: `backdrop-filter: blur(20px–28px)` on `--glass` / `--glass-2`.
- Glow: `box-shadow: 0 0 12px–24px <accent>` and `filter: drop-shadow(0 0 4px–14px <accent>)` on SVG stroke layers.
- Motion: subtle. Reveal pulses (~300ms cascade per layer), pop-in (~500ms), drawline (~1.4s), arrow draw (~600ms cubic-bezier ease-out). Respect `prefers-reduced-motion` via the `ambientMotion` toggle (in production, key off the OS preference instead of the Tweak).

### Background treatment

The page background is a layered radial-gradient + a faint 80px grid backplane:

```css
body {
  background:
    radial-gradient(ellipse 90% 60% at 20% 10%, rgba(103,232,249,0.10), transparent 60%),
    radial-gradient(ellipse 70% 50% at 90% 90%, rgba(167,139,250,0.10), transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(244,114,182,0.06), transparent 60%),
    var(--bg-0);
}
body::before {
  /* 80px grid, opacity 0.18, fixed position */
}
```

## Screens / Views

### 1. Atlas

**Purpose.** The hero view. A single, pannable, zoomable architectural diagram of the whole platform.

**Layout.**

- A virtual world canvas at `1600 × 1100` (logical), placed in a pan/zoom container that fills the stage.
- 10 layer regions hand-positioned. See `REGIONS` constant in `atlas.jsx` for exact coordinates. Top band: User Surface. Below: Identity. Center column: Orchestration → Runtime → Gateway. Left rail: Memory + State. Right rail: Tools. Far-right rail: Observability (full-height). Bottom band: Governance.
- Each region: hairline border, faint `--line` color, layer label in mono uppercase + tagline in italic serif.
- Components inside a region: small filled-glass tinted boxes (the layer's ink color at low alpha), arranged in a grid (cols defined per region in `REGIONS`).
- Orthogonal connection lines between layers with a slow ambient flow animation (dashed stroke moving along path).
- **Hover** on a component: scale up slightly, brighter outline, ring pulse keyframe (`compPulse`/`ringExpand`).
- **Click** on a component or layer label: opens the **Dossier** drawer from the right with an animated cubic-bezier SVG arrow connecting the source box to the panel.

**Floating overlays** (HUD-style, frosted glass):

- **Intro card** (top-left, hidden when dossier is open): eyebrow "Field Atlas · Cross-Section", H1 "How an agentic platform actually works.", paragraph, color legend.
- **Reveal scrubber** (bottom-center): replay button, play/pause, scrub bar with one tick per layer, current label "01 / 10 · User Surface". Auto-plays on first load (450ms initial delay, then 220ms per layer).
- **Zoom controls** (corner): + / − / recenter.
- **Hotkey hint** (only when no dossier): `1` / `2` / `3` view, `←` / `→` scrub, `space` play, `esc` back.

**Dossier panel** (right side, ~460px wide):

- Tabs at top: **Executive** / **Engineer** copy switch — both present in `data.jsx` for every layer and component.
- Layer-level dossier shows: name + tagline, exec/eng paragraph, list of components (clickable), enrichment block (responsibilities, decision points, anti-patterns, KPIs) from `enrichment.jsx`.
- Component-level dossier shows: name, exec/eng paragraph, glossary chips for each `term` in `data.jsx` (clicking a chip pops a definition tooltip from `window.GLOSSARY` in `app.jsx`), and tech chips from `window.TECH_CATALOG` (clicking opens a sub-panel with pros/cons/best-for).

### 2. Patterns

**Purpose.** Explore the four orchestration topologies separately from the atlas.

**Layout.**

- Three-column above-the-fold split: left list of patterns, center large SVG diagram, right rail with stats + "in the wild" examples.
- Below the fold: long content section with description, when-to-use, anatomy, scaling notes, failure modes, example walkthrough, and recommended stack.
- Each pattern has its own SVG diagram in `patterns.jsx` (`<PatternViz id={...} />`):
  - **Supervisor** — central node (cyan glow) with 5 specialist nodes (violet) arranged on a circle, connected by dashed cyan lines with arrowheads. `drawline` + `pop` keyframes stagger the entrance.
  - **Plan-and-Execute** — linear DAG, plan node feeds task nodes.
  - **Pipeline** — left-to-right sequential stages.
  - **Swarm** — many small nodes, peer-to-peer mesh.

The pattern data — names, descriptions, when-to-use, etc. — lives at the top of `patterns.jsx` in the `PATTERNS` array. Lift it verbatim.

### 3. Example

**Purpose.** Concrete walkthrough — "Where's my refund?" — of how a single user request traverses the platform.

**Layout.**

- Mini-atlas SVG (720×460). One row per layer. Rows are gray; the active layer for the current step lights up; the active component chip glows.
- Step list (numbered). Clicking a step jumps the mini-atlas to that step.
- Step detail panel: human-readable explanation of what's happening + an expandable raw payload (JSON-style, mono). Toggle to view payload.

Step data in `example-data.jsx` (`window.EXAMPLE_STEPS`): each step has a layer id, component id, narrative, and example payload.

## Components (re-implementable inventory)

These are the durable UI primitives — recreate them in your design system / component library:

| Component | Notes |
|---|---|
| `Topbar` | Brand mark + title + sub + view tabs + tool buttons. Frosted backdrop. |
| `StatRail` | Counter pills ("10 Layers", "46 Components") + "Live diagram · ATLAS" crosshair indicator. |
| `ViewTabs` | Roman-numeral prefixed tabs (i, ii, iii). Active = filled, others = hairline outline. |
| `IconButton` | Square, hairline border, hover = stronger border + glow. |
| `HUDCard` (intro / scrubber / hotkey-hint container) | `--glass` background, blur, hairline, soft outer glow. |
| `RevealScrubber` | Play/pause + scrub bar with per-layer ticks + label. |
| `ZoomControls` | Vertical stack of +/−/recenter buttons, frosted. |
| `LayerRegion` (atlas) | Hairline rectangle with title bar (mono uppercase + italic serif tagline). |
| `ComponentBox` (atlas) | Filled glass with layer's ink color at low alpha; hover = brighter, scale, ripple. |
| `ConnectionLine` (atlas) | Orthogonal SVG path with dashed stroke + ambient flow animation. |
| `Dossier` (drilldown) | Right-side drawer ~460px, tabs, scrolling content, glossary chips, tech chips. |
| `AnimatedArrow` (drilldown) | Cubic SVG path animating `pathLength` from clicked box to drawer (~600ms ease-out). |
| `GlossaryChip` | Mono small text, hairline pill. Hover = popover with definition. |
| `TechChip` | Same shape, accent tint. Click = expands a sub-panel with pros/cons/best-for. |
| `PatternViz` | Per-pattern SVG. See `patterns.jsx`. |
| `MiniAtlas` (example) | Compact stacked-row variant of the atlas, used in the Example view. |
| `StepList` / `StepCard` (example) | Numbered list with active highlight; expandable JSON payload viewer. |
| `Tooltip` | Frosted, mono caption + serif body. |

## Interactions & Behavior

- **View switching:** topbar tabs or keys `1` / `2` / `3`. Clears any open dossier.
- **Atlas first-load reveal:** layers fade/slide in one at a time, 450ms initial delay then 220ms per layer.
- **Scrubber:** `←` / `→` move the reveal index; `space` play/pause. Click anywhere on the bar to jump.
- **Pan/zoom:** drag to pan, scroll/pinch to zoom, recenter button to reset.
- **Hover (component):** brighter outline, slight scale-up, soft pulse ring.
- **Click (component or layer):** opens dossier; animated arrow connects source rect → panel.
- **Glossary chip click:** opens a definition popover.
- **Tech chip click:** opens a tech sub-panel with pros/cons/best-for.
- **Esc:** if tech sub-panel open → close; else if dossier open → close.
- **Theme toggle:** swaps `data-theme="dark|light"` on `<html>`. Persist in `localStorage` (in the prototype it lives in the Tweaks-panel's persistence layer).
- **Print:** `window.print()` — the page should be print-stylesheet-clean. (Don't expect a perfect 1:1; the print output is a "good enough" PDF of the current view.)

## State Management

Top-level state lives in `<App>` in `app.jsx`. For a real implementation, lift to a small store (Zustand / Context / route state). Keys:

- `view: "atlas" | "patterns" | "example"` — also reflected in URL.
- `theme: "dark" | "light"`.
- `revealUpTo: number` (-1 .. 9) — atlas reveal index.
- `playReveal: boolean`.
- `openLayer: string | null` — layer id.
- `openComp: string | null` — component id.
- `sourceRect: {x,y,w,h} | null` — bounds of the clicked box (for the arrow overlay).
- `hoveredComp: string | null` — component id under cursor.

URL routing: at minimum, sync `view` and `(openLayer, openComp)` to the URL so a dossier is shareable.

## Data

All long-form copy is stored as JS data in `design/`. Lift verbatim:

- **Layers + components:** `data.jsx` → `LAYERS` array. Each entry has `n`, `id`, `name`, `tagline`, `ink`, `exec`, `eng`, and `components[]` (each with `id`, `name`, `exec`, `eng`, `terms[]`).
- **Layer enrichment:** `enrichment.jsx` → responsibilities, decision points, anti-patterns, KPIs per layer.
- **Tech catalog:** `tech-catalog.jsx` → `TECH_CATALOG` keyed by tech name, with `pros`, `cons`, `best_for`, links.
- **Patterns:** `patterns.jsx` → `PATTERNS` array (description, when-to-use, anatomy, scaling, failure modes, walkthrough, stack).
- **Glossary:** `app.jsx` → `window.GLOSSARY` (term → short definition).
- **Example walkthrough:** `example-data.jsx` → `EXAMPLE_STEPS` array.

Convert these to typed JSON or TypeScript modules. They are the content of the site — they should not be re-derived or paraphrased.

## Assets

No raster images, no logos, no third-party brand assets. All graphics are SVG generated in code (orthogonal lines, circles, dashed paths, arrowhead markers). No icon library — the few glyphs used (▶ ❚❚ ⟲ ⊕ ＋ − ⎙ ◐ ◑) are unicode characters typeset in the body font / mono font.

Fonts (loaded from Google Fonts at runtime by `styles.css`):

- Geist (300, 400, 500, 600, 700)
- JetBrains Mono (300, 400, 500, 600)
- Source Serif 4 (italic + roman, opsz 8..60, weights 400, 500, 600)

In production, self-host these (or use `next/font` / equivalent) so you don't depend on Google's CDN.

## Recreate This Design — Suggested Approach

1. Bootstrap a Next.js (App Router) + TypeScript + Tailwind (or vanilla CSS modules) project.
2. Port `styles.css` tokens to your design-token layer (`@theme` in Tailwind v4, or `:root` CSS vars). The token list above is exhaustive.
3. Port the data files (`data.jsx`, `patterns.jsx`, `tech-catalog.jsx`, `enrichment.jsx`, `example-data.jsx`, the `GLOSSARY` object in `app.jsx`) to typed `.ts` modules under `src/data/`.
4. Build the atomic components from the inventory above. Build them dark-first; theme is handled by token swap, not by component branching.
5. Build views in this order:
   - **Atlas** (highest fidelity needed) — pan/zoom, layer regions, component boxes, connection lines, reveal scrubber, dossier drawer, animated arrow, glossary + tech chips.
   - **Patterns** — left list / center diagram / right rail layout, then the long-form section. Diagrams are pure SVG; lift them from `patterns.jsx`.
   - **Example** — mini-atlas + step list + payload viewer.
6. Wire URL routing to `view` and `(layer, component)` so dossiers are shareable.
7. Add `prefers-reduced-motion` handling (drop the ambient flow + reveal cascade when the user opts out).
8. Self-host fonts.
9. Add a real print stylesheet if PDF export is a priority (the `window.print()` button currently exists but isn't tuned).

## Things That Are Designer-Only — Skip in Production

- The Tweaks panel (`tweaks-panel.jsx` and the `<Tweaks>` component in `app.jsx`).
- The `EDITMODE-BEGIN` / `EDITMODE-END` JSON block in `app.jsx`.
- The `__bundler_thumbnail` `<template>` in `index.html`.
- The runtime React + Babel `<script>` tags.
