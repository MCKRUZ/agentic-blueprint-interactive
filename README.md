# The Anatomy of an Agentic Platform

An interactive editorial microsite that lets readers explore a 10-layer, 46-component agentic platform architecture through three views.

## Views

- **Atlas** — Pan/zoom architecture diagram. Click any component to open its dossier with executive and engineering perspectives, glossary terms, and technology options with pros/cons.
- **Patterns** — Four orchestration topologies (Supervisor, Pipeline, Swarm, Hierarchical) with animated SVG diagrams and deep-dive content.
- **Example** — "Where's my refund?" scenario walkthrough showing how a request traverses all 10 layers with a mini-atlas visualization.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| State | Zustand (URL sync + localStorage theme) |
| Fonts | Geist, JetBrains Mono, Source Serif 4 (self-hosted via next/font) |
| Graphics | Code-generated SVG (no raster images or icon libraries) |

## Getting Started

```bash
cd site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for Production

```bash
cd site
npm run build
```

Static files are output to `site/out/`, ready for deployment to Azure Static Web Apps or any static hosting provider.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `1` / `2` / `3` | Switch to Atlas / Patterns / Example |
| `←` / `→` | Scrub layer reveal (Atlas) |
| `Space` | Play/pause layer reveal (Atlas) |
| `Escape` | Close dossier panel |

## Features

- Dark and light themes with system preference detection
- URL-synced state for shareable dossier links
- Reduced motion support via `prefers-reduced-motion`
- 94-term glossary with hover popovers
- 43 technology entries with expandable pros/cons panels
- Animated cubic-bezier SVG arrow connecting clicked components to the dossier

## Project Structure

```
site/src/
├── app/            # Next.js App Router (layout, page, globals.css)
├── components/
│   ├── atlas/      # Pan/zoom canvas, layer regions, component boxes, connections, scrubber
│   ├── drilldown/  # Dossier panel, animated arrow, glossary/tech chips
│   ├── patterns/   # Pattern explorer, 4 SVG topology diagrams
│   └── example/    # Step walkthrough, mini-atlas
├── data/           # 6 typed data modules (layers, enrichment, tech-catalog, patterns, glossary, example-trace)
├── lib/            # Atlas region layout, connection routes
└── store/          # Zustand store with URL sync
```

## Design Source

The `design_handoff_agentic_blueprint/design/` directory contains the original prototype. All content data was lifted verbatim from those files.
