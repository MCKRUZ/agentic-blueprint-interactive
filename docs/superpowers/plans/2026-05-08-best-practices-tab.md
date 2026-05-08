# Best Practices Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth "Practices" tab to the Agentic Blueprint Interactive site that presents enterprise AI best practices as a cross-cutting concerns matrix — 10 practice pillars mapped against the existing 11 architecture layers, with research-backed citations.

**Architecture:** Pillar Explorer layout (left sidebar selector + right detail panel) mirroring the existing Pattern Explorer. Each pillar shows a layer-relevance strip (11 colored blocks by tier) and expandable guideline cards. Data lives in a single `best-practices.ts` file with typed interfaces. State is managed via the existing Zustand store with a new `activePillar` field.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Zustand 5, Tailwind 4, CSS custom properties from globals.css

**Spec:** `docs/superpowers/specs/2026-05-08-best-practices-tab-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `site/src/data/types.ts` | Add Pillar, MatrixCell, Guideline, Citation, RelevanceTier types |
| Create | `site/src/data/best-practices.ts` | All 10 pillars with 11 cells each, citations, guidelines |
| Modify | `site/src/store/app-store.ts` | Add `"practices"` to View union, add `activePillar` state + setter |
| Modify | `site/src/components/topbar.tsx` | Add 4th tab entry |
| Modify | `site/src/app/page.tsx` | Import BestPracticesView, add keyboard shortcut `4`, add conditional render |
| Create | `site/src/components/best-practices/best-practices-view.tsx` | Top-level container — 30/70 layout |
| Create | `site/src/components/best-practices/pillar-selector.tsx` | Left panel — 10 pillar buttons with spark-bars |
| Create | `site/src/components/best-practices/pillar-detail.tsx` | Right panel — header, relevance strip, guideline cards, citations |
| Create | `site/src/components/best-practices/relevance-strip.tsx` | Horizontal 11-block layer visualization |
| Create | `site/src/components/best-practices/layer-cell-card.tsx` | Single pillar×layer intersection card |

---

## Task 1: Add Types to data/types.ts

**Files:**
- Modify: `site/src/data/types.ts`

- [ ] **Step 1: Add best-practices types at the end of types.ts**

Append after the `ExampleTrace` interface:

```typescript
/* ── Best Practices ─────────────────────────────────── */

export type RelevanceTier = "critical" | "moderate" | "minimal";

export interface Guideline {
  id: string;
  text: string;
  exec: string;
  eng: string;
}

export interface MatrixCell {
  layerId: string;
  tier: RelevanceTier;
  guidelines: Guideline[];
}

export interface Citation {
  id: string;
  label: string;
  url: string;
  org: string;
}

export interface Pillar {
  id: string;
  name: string;
  icon: string;
  exec: string;
  eng: string;
  citations: Citation[];
  cells: MatrixCell[];
}
```

- [ ] **Step 2: Verify build**

Run: `cd site && npx next build`
Expected: Build succeeds (unused types are fine in TypeScript)

- [ ] **Step 3: Commit**

```bash
git add site/src/data/types.ts
git commit -m "feat(practices): add Pillar, MatrixCell, Guideline, Citation types"
```

---

## Task 2: Add State to app-store.ts

**Files:**
- Modify: `site/src/store/app-store.ts`

- [ ] **Step 1: Add "practices" to View union**

Change line 3 from:
```typescript
export type View = "atlas" | "patterns" | "example";
```
To:
```typescript
export type View = "atlas" | "patterns" | "example" | "practices";
```

- [ ] **Step 2: Add activePillar state and setter to AppState interface**

Add after `hoveredComp: string | null;`:
```typescript
activePillar: string | null;
```

Add after `setHoveredComp: (id: string | null) => void;`:
```typescript
setActivePillar: (id: string | null) => void;
```

- [ ] **Step 3: Add initial state and implementation to create()**

Add after `hoveredComp: null,`:
```typescript
activePillar: null,
```

Add after the `setHoveredComp` implementation:
```typescript
setActivePillar: (id) => set({ activePillar: id }),
```

- [ ] **Step 4: Update syncURL to handle pillar param**

Replace the existing `syncURL` function:
```typescript
function syncURL(view: View, layer: string | null, comp: string | null, pillar: string | null = null) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (view !== "atlas") params.set("view", view);
  if (layer) params.set("layer", layer);
  if (comp) params.set("comp", comp);
  if (pillar) params.set("pillar", pillar);
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}
```

- [ ] **Step 5: Update setView to clear activePillar**

Change the `setView` implementation from:
```typescript
setView: (v) => {
  set({ view: v, openLayer: null, openComp: null, sourceRect: null });
  syncURL(v, null, null);
},
```
To:
```typescript
setView: (v) => {
  set({ view: v, openLayer: null, openComp: null, sourceRect: null, activePillar: null });
  syncURL(v, null, null, null);
},
```

- [ ] **Step 6: Update setActivePillar to sync URL**

Replace the simple setter with:
```typescript
setActivePillar: (id) => {
  set({ activePillar: id });
  syncURL(get().view, null, null, id);
},
```

- [ ] **Step 7: Update all other syncURL call sites**

In `openDossier`:
```typescript
syncURL(get().view, layerId, compId, null);
```

In `closeDossier`:
```typescript
syncURL(get().view, null, null, null);
```

- [ ] **Step 8: Update hydrateFromURL to read pillar param**

In `hydrateFromURL`, add after `const comp = ...`:
```typescript
const pillar = params.get("pillar") || null;
```

Update the setState call:
```typescript
useAppStore.setState({ view, openLayer: layer, openComp: comp, activePillar: pillar });
```

- [ ] **Step 9: Verify build**

Run: `cd site && npx next build`
Expected: Build succeeds

- [ ] **Step 10: Commit**

```bash
git add site/src/store/app-store.ts
git commit -m "feat(practices): add practices view state and activePillar to store"
```

---

## Task 3: Navigation Integration (topbar + page.tsx)

**Files:**
- Modify: `site/src/components/topbar.tsx`
- Modify: `site/src/app/page.tsx`

- [ ] **Step 1: Add practices tab to topbar VIEWS array**

In `topbar.tsx`, change the VIEWS array from:
```typescript
const VIEWS: { key: View; numeral: string; label: string }[] = [
  { key: "atlas", numeral: "i", label: "Atlas" },
  { key: "patterns", numeral: "ii", label: "Patterns" },
  { key: "example", numeral: "iii", label: "Example" },
];
```
To:
```typescript
const VIEWS: { key: View; numeral: string; label: string }[] = [
  { key: "atlas", numeral: "i", label: "Atlas" },
  { key: "patterns", numeral: "ii", label: "Patterns" },
  { key: "example", numeral: "iii", label: "Example" },
  { key: "practices", numeral: "iv", label: "Practices" },
];
```

- [ ] **Step 2: Add keyboard shortcut in page.tsx**

In the keyboard handler switch statement in `page.tsx`, add after `case "3":`:
```typescript
case "4": state.setView("practices"); break;
```

- [ ] **Step 3: Add BestPracticesView import and conditional render**

Add import at the top of `page.tsx`:
```typescript
import { BestPracticesView } from "@/components/best-practices/best-practices-view";
```

Add after `{view === "example" && <ExampleView />}` (line 94):
```typescript
{view === "practices" && <BestPracticesView />}
```

- [ ] **Step 4: Create placeholder component so build passes**

Create `site/src/components/best-practices/best-practices-view.tsx`:
```typescript
"use client";

export function BestPracticesView() {
  return (
    <div className="flex items-center justify-center h-full">
      <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-4)" }}>
        PRACTICES VIEW — LOADING
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Verify build and test navigation**

Run: `cd site && npx next build`
Expected: Build succeeds.

Run: `cd site && npx next dev`
Test: Open browser, press `4` — should show placeholder. Click "iv Practices" tab — should work. URL should show `?view=practices`.

- [ ] **Step 6: Commit**

```bash
git add site/src/components/topbar.tsx site/src/app/page.tsx site/src/components/best-practices/best-practices-view.tsx
git commit -m "feat(practices): add practices tab to navigation and keyboard shortcuts"
```

---

## Task 4: Relevance Strip Component

**Files:**
- Create: `site/src/components/best-practices/relevance-strip.tsx`

- [ ] **Step 1: Create relevance-strip.tsx**

```typescript
"use client";

import { LAYERS } from "@/data/layers";
import type { MatrixCell } from "@/data/types";

const TIER_OPACITY: Record<string, number> = {
  critical: 1,
  moderate: 0.5,
  minimal: 0.15,
};

interface RelevanceStripProps {
  cells: MatrixCell[];
  onClickLayer: (layerId: string) => void;
}

export function RelevanceStrip({ cells, onClickLayer }: RelevanceStripProps) {
  const cellMap = new Map(cells.map((c) => [c.layerId, c]));

  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 24 }}>
      {LAYERS.map((layer) => {
        const cell = cellMap.get(layer.id);
        const tier = cell?.tier ?? "minimal";
        return (
          <button
            key={layer.id}
            onClick={() => onClickLayer(layer.id)}
            title={`${layer.name} — ${tier}`}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: layer.ink,
              opacity: TIER_OPACITY[tier],
              cursor: "pointer",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                bottom: -18,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "var(--ink-4)",
                whiteSpace: "nowrap",
              }}
            >
              {layer.n}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd site && npx next build`
Expected: Build succeeds (component not yet mounted but import-clean)

- [ ] **Step 3: Commit**

```bash
git add site/src/components/best-practices/relevance-strip.tsx
git commit -m "feat(practices): add RelevanceStrip component"
```

---

## Task 5: Layer Cell Card Component

**Files:**
- Create: `site/src/components/best-practices/layer-cell-card.tsx`

- [ ] **Step 1: Create layer-cell-card.tsx**

```typescript
"use client";

import { useState } from "react";
import { LAYERS } from "@/data/layers";
import { useAppStore } from "@/store/app-store";
import type { MatrixCell } from "@/data/types";

const TIER_COLORS: Record<string, string> = {
  critical: "var(--c1)",
  moderate: "var(--c3)",
  minimal: "var(--ink-4)",
};

interface LayerCellCardProps {
  cell: MatrixCell;
}

export function LayerCellCard({ cell }: LayerCellCardProps) {
  const layer = LAYERS.find((l) => l.id === cell.layerId);
  const openDossier = useAppStore((s) => s.openDossier);
  const setView = useAppStore((s) => s.setView);
  const [expanded, setExpanded] = useState(cell.tier !== "minimal");

  if (!layer) return null;

  return (
    <div
      id={`cell-${cell.layerId}`}
      className="glass"
      style={{ padding: "16px 20px", marginBottom: 12 }}
    >
      {/* Header row */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: expanded ? 12 : 0, cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: layer.ink,
          }}
        >
          {layer.n}
        </span>
        <span style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500, flex: 1 }}>
          {layer.name}
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: 4,
            border: `1px solid ${TIER_COLORS[cell.tier]}`,
            color: TIER_COLORS[cell.tier],
          }}
        >
          {cell.tier}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setView("atlas");
            setTimeout(() => openDossier(layer.id), 100);
          }}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--ink-4)",
            background: "transparent",
            border: "1px solid var(--line)",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          ATLAS →
        </button>
      </div>

      {/* Guidelines */}
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cell.guidelines.map((g) => (
            <GuidelineItem key={g.id} guideline={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function GuidelineItem({ guideline }: { guideline: import("@/data/types").Guideline }) {
  const [showEng, setShowEng] = useState(false);

  return (
    <div style={{ paddingLeft: 12, borderLeft: "2px solid var(--line)" }}>
      <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, marginBottom: 4 }}>
        {guideline.text}
      </div>
      <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
        {guideline.exec}
      </div>
      {guideline.eng && (
        <>
          <button
            onClick={() => setShowEng(!showEng)}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-4)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              letterSpacing: "0.1em",
            }}
          >
            {showEng ? "▾ HIDE TECHNICAL" : "▸ TECHNICAL DETAIL"}
          </button>
          {showEng && (
            <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6, marginTop: 4 }}>
              {guideline.eng}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd site && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add site/src/components/best-practices/layer-cell-card.tsx
git commit -m "feat(practices): add LayerCellCard component with exec/eng toggle"
```

---

## Task 6: Pillar Selector Component

**Files:**
- Create: `site/src/components/best-practices/pillar-selector.tsx`

- [ ] **Step 1: Create pillar-selector.tsx**

```typescript
"use client";

import type { Pillar } from "@/data/types";

interface PillarSelectorProps {
  pillars: Pillar[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function PillarSelector({ pillars, activeId, onSelect }: PillarSelectorProps) {
  return (
    <div className="flex flex-col gap-2" style={{ width: 240, flexShrink: 0 }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          letterSpacing: "0.2em",
          color: "var(--ink-4)",
          marginBottom: 4,
        }}
      >
        PRACTICE DOMAINS
      </div>
      {pillars.map((p) => {
        const isActive = activeId === p.id;
        const critical = p.cells.filter((c) => c.tier === "critical").length;
        const moderate = p.cells.filter((c) => c.tier === "moderate").length;
        const minimal = p.cells.filter((c) => c.tier === "minimal").length;
        const total = p.cells.length || 1;

        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="text-left px-3 py-2.5 rounded-md"
            style={{
              border: `1px solid ${isActive ? "var(--line-3)" : "var(--line)"}`,
              background: isActive ? "var(--glass-2)" : "transparent",
              color: isActive ? "var(--ink)" : "var(--ink-3)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 500 }}>
                {p.name}
              </span>
            </div>
            {/* Spark bar */}
            <div
              style={{
                display: "flex",
                height: 3,
                borderRadius: 2,
                overflow: "hidden",
                marginTop: 8,
                background: "var(--line)",
              }}
            >
              <div style={{ width: `${(critical / total) * 100}%`, background: "var(--c1)" }} />
              <div style={{ width: `${(moderate / total) * 100}%`, background: "var(--c3)" }} />
              <div style={{ width: `${(minimal / total) * 100}%`, background: "var(--ink-4)" }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd site && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add site/src/components/best-practices/pillar-selector.tsx
git commit -m "feat(practices): add PillarSelector with tier spark-bars"
```

---

## Task 7: Pillar Detail Component

**Files:**
- Create: `site/src/components/best-practices/pillar-detail.tsx`

- [ ] **Step 1: Create pillar-detail.tsx**

```typescript
"use client";

import { useRef, useState } from "react";
import type { Pillar } from "@/data/types";
import { RelevanceStrip } from "./relevance-strip";
import { LayerCellCard } from "./layer-cell-card";

interface PillarDetailProps {
  pillar: Pillar;
}

export function PillarDetail({ pillar }: PillarDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEng, setShowEng] = useState(false);

  const sortedCells = [...pillar.cells].sort((a, b) => {
    const order = { critical: 0, moderate: 1, minimal: 2 };
    return order[a.tier] - order[b.tier];
  });

  function scrollToLayer(layerId: string) {
    const el = scrollRef.current?.querySelector(`#cell-${layerId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ padding: "0 8px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>{pillar.icon}</span>
          <h2
            style={{
              fontFamily: "var(--display)",
              fontSize: 26,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {pillar.name}
          </h2>
        </div>
        <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.65 }}>
          {pillar.exec}
        </p>
        {pillar.eng && (
          <>
            <button
              onClick={() => setShowEng(!showEng)}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--ink-4)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 0 0",
                letterSpacing: "0.1em",
              }}
            >
              {showEng ? "▾ HIDE TECHNICAL OVERVIEW" : "▸ TECHNICAL OVERVIEW"}
            </button>
            {showEng && (
              <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.65, marginTop: 8 }}>
                {pillar.eng}
              </p>
            )}
          </>
        )}
      </div>

      {/* Relevance strip */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--ink-4)",
            marginBottom: 8,
          }}
        >
          LAYER RELEVANCE
        </div>
        <RelevanceStrip cells={pillar.cells} onClickLayer={scrollToLayer} />
      </div>

      {/* Layer cell cards */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--ink-4)",
            marginBottom: 12,
          }}
        >
          GUIDELINES BY LAYER
        </div>
        {sortedCells.map((cell) => (
          <LayerCellCard key={cell.layerId} cell={cell} />
        ))}
      </div>

      {/* Citations */}
      {pillar.citations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.2em",
              color: "var(--ink-4)",
              marginBottom: 8,
            }}
          >
            FRAMEWORKS & CITATIONS
          </div>
          <div className="flex flex-wrap gap-2">
            {pillar.citations.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid var(--line)",
                  color: "var(--ink-3)",
                  textDecoration: "none",
                }}
              >
                {c.label}
                <span style={{ color: "var(--ink-4)", marginLeft: 4, fontSize: 10 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd site && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add site/src/components/best-practices/pillar-detail.tsx
git commit -m "feat(practices): add PillarDetail with relevance strip, guidelines, citations"
```

---

## Task 8: Wire Up BestPracticesView (Replace Placeholder)

**Files:**
- Modify: `site/src/components/best-practices/best-practices-view.tsx`

- [ ] **Step 1: Replace the placeholder with the full view**

Replace the entire contents of `best-practices-view.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { PILLARS } from "@/data/best-practices";
import { PillarSelector } from "./pillar-selector";
import { PillarDetail } from "./pillar-detail";

export function BestPracticesView() {
  const activePillar = useAppStore((s) => s.activePillar);
  const setActivePillar = useAppStore((s) => s.setActivePillar);

  useEffect(() => {
    if (!activePillar && PILLARS.length > 0) {
      setActivePillar(PILLARS[0].id);
    }
  }, [activePillar, setActivePillar]);

  const pillar = PILLARS.find((p) => p.id === activePillar) ?? PILLARS[0];

  if (!pillar) return null;

  return (
    <div className="flex h-full overflow-hidden" style={{ padding: "16px 24px", gap: 24 }}>
      <PillarSelector
        pillars={PILLARS}
        activeId={pillar.id}
        onSelect={setActivePillar}
      />
      <PillarDetail pillar={pillar} />
    </div>
  );
}
```

- [ ] **Step 2: Create stub data file so the import resolves**

Create `site/src/data/best-practices.ts` with a single stub pillar so the build passes:

```typescript
import type { Pillar } from "./types";

export const PILLARS: Pillar[] = [
  {
    id: "cyber-security",
    name: "Cyber Security",
    icon: "🛡",
    exec: "Stub — content populated in research tasks.",
    eng: "Stub — content populated in research tasks.",
    citations: [],
    cells: [
      { layerId: "surface", tier: "critical", guidelines: [{ id: "cs-surf-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "identity", tier: "critical", guidelines: [{ id: "cs-id-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "orchestration", tier: "moderate", guidelines: [{ id: "cs-orch-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "runtime", tier: "moderate", guidelines: [{ id: "cs-rt-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "gateway", tier: "critical", guidelines: [{ id: "cs-gw-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "tools", tier: "critical", guidelines: [{ id: "cs-tool-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "memory", tier: "moderate", guidelines: [{ id: "cs-mem-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "state", tier: "moderate", guidelines: [{ id: "cs-st-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "observability", tier: "moderate", guidelines: [{ id: "cs-obs-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "governance", tier: "critical", guidelines: [{ id: "cs-gov-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
      { layerId: "systems", tier: "critical", guidelines: [{ id: "cs-sys-1", text: "Stub guideline", exec: "Stub exec", eng: "Stub eng" }] },
    ],
  },
];
```

- [ ] **Step 3: Verify build and test in browser**

Run: `cd site && npx next build`
Expected: Build succeeds.

Run: `cd site && npx next dev`
Test: Press `4` → Practices view loads. Left panel shows "Cyber Security" pillar. Right panel shows the stub content with relevance strip, layer cell cards, and tier badges. Click tier blocks in the relevance strip — should scroll to corresponding card.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/best-practices/best-practices-view.tsx site/src/data/best-practices.ts
git commit -m "feat(practices): wire up BestPracticesView with stub data"
```

---

## Task 9: Research & Populate — Cyber Security Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- NIST AI RMF 1.0 — MAP, MEASURE, MANAGE functions for security
- OWASP Top 10 for LLM Applications (2025) — all 10 categories
- MITRE ATLAS — adversarial tactics for AI systems
- Microsoft Responsible AI Standard v2 — security provisions
- Azure Well-Architected Framework — AI security pillar
- NIST SP 800-53 — security controls applicable to AI systems

**Instructions:**
1. Research each source above for cybersecurity best practices relevant to agentic AI platforms
2. Map findings to each of the 11 layers, assigning tier based on relevance
3. Write 3-5 guidelines for critical cells, 1-2 for moderate, 1 for minimal
4. Each guideline needs: `text` (the practice), `exec` (why it matters strategically), `eng` (how to implement tactically)
5. Include citation objects with real URLs to the source documents

**Content rules (apply to ALL research tasks 9-18):**
- Critical cells: 3-5 guidelines, each with `text`, `exec`, and `eng` filled
- Moderate cells: 1-2 guidelines, each with `text`, `exec`, and `eng` filled
- Minimal cells: 1 guideline, `text` and `exec` filled, `eng: ""` (empty string — the component hides the technical toggle when eng is empty)
- Guideline IDs follow convention: `{pillar-abbrev}-{layer-abbrev}-{number}` (e.g., `cs-surf-1`)
- All citation URLs must be real, publicly accessible documents
- Icons must be unique across all pillars — do not reuse `"⚖"` (taken by AI Governance)

- [ ] **Step 1: Research cybersecurity frameworks for agentic AI**

Use web search, Microsoft Learn, and NIST/OWASP docs to gather current best practices. Focus on:
- Prompt injection defense (OWASP LLM01)
- Model supply chain security (OWASP LLM05)  
- Agent identity and credential management
- Tool execution sandboxing
- Data exfiltration prevention via tool calls
- Adversarial attacks on AI systems (MITRE ATLAS)

- [ ] **Step 2: Replace the Cyber Security stub in best-practices.ts**

Replace the stub entry for `id: "cyber-security"` with fully researched content. The entry must have:
- `exec`: 2-3 sentence strategic overview
- `eng`: 2-3 sentence technical overview
- `citations`: Array of 4-6 Citation objects with real URLs
- `cells`: Array of 11 MatrixCell objects, one per layer, each with:
  - `tier`: "critical" for surface, identity, gateway, tools, governance, systems; "moderate" for orchestration, runtime, memory, state, observability
  - `guidelines`: Array of Guideline objects per the tier depth rules

Tier assignments for Cyber Security:
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | critical | Primary attack surface — prompt injection, input validation |
| identity | critical | AuthN/AuthZ, credential management, zero-trust |
| orchestration | moderate | Plan validation, delegation trust boundaries |
| runtime | moderate | Agent sandboxing, tool permission enforcement |
| gateway | critical | Model supply chain, PII filtering, adversarial input detection |
| tools | critical | Tool sandboxing, SSRF prevention, output validation |
| memory | moderate | RAG poisoning, context injection, vector store security |
| state | moderate | Session isolation, data encryption, tamper detection |
| observability | moderate | Security event logging, anomaly detection |
| governance | critical | Security policy enforcement, compliance automation |
| systems | critical | Data access controls, audit trails, external system auth |

- [ ] **Step 3: Verify build**

Run: `cd site && npx next build`
Expected: Build succeeds

- [ ] **Step 4: Test in browser**

Run: `cd site && npx next dev`
Verify: Cyber Security pillar shows full content, relevance strip colors match tiers, guidelines expand correctly, citations have working links.

- [ ] **Step 5: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate Cyber Security pillar with researched guidelines"
```

---

## Task 10: Research & Populate — AI Governance Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- ISO/IEC 42001:2023 — AI Management Systems
- EU AI Act — risk classification, obligations by risk tier
- NIST AI RMF 1.0 — GOVERN function
- OECD AI Principles
- Microsoft Responsible AI Standard v2

**Tier assignments for AI Governance:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | moderate | User-facing disclosure, transparency notices |
| identity | moderate | Role-based access to AI capabilities |
| orchestration | critical | Decision audit trails, plan approval gates |
| runtime | critical | Agent behavior policies, capability boundaries |
| gateway | critical | Model selection policies, approved model registry |
| tools | moderate | Tool authorization policies, capability governance |
| memory | moderate | Knowledge curation policies, data retention |
| state | minimal | Session governance is secondary |
| observability | critical | Governance dashboards, compliance reporting |
| governance | critical | Policy engine, risk classification, regulatory mapping |
| systems | moderate | Data governance integration, lineage tracking |

- [ ] **Step 1: Research AI governance frameworks**

Focus on: policy lifecycle management, risk classification schemes, accountability structures, model lifecycle governance, regulatory mapping (EU AI Act risk tiers), audit and compliance automation.

- [ ] **Step 2: Add AI Governance pillar to PILLARS array in best-practices.ts**

Follow the exact same structure as Cyber Security. Use `id: "ai-governance"`, `icon: "⚖"`. Include 4-6 citations with real URLs.

- [ ] **Step 3: Verify build and test in browser**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate AI Governance pillar with researched guidelines"
```

---

## Task 11: Research & Populate — AI Factory (MLOps/LLMOps) Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- Google MLOps whitepaper (Practitioners Guide to MLOps)
- Azure Machine Learning Well-Architected guidance
- CNCF Cloud Native AI whitepaper
- LF AI & Data Foundation — LLMOps patterns
- Hugging Face model lifecycle best practices

**Tier assignments for AI Factory:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | minimal | Factory is backend; surface connection is thin |
| identity | minimal | Service identity for pipelines |
| orchestration | moderate | Model selection based on evaluation metrics |
| runtime | moderate | Agent versioning, A/B deployment |
| gateway | critical | Model registry, deployment pipelines, versioning |
| tools | moderate | Evaluation tool integration |
| memory | critical | Knowledge base curation, embedding pipelines |
| state | minimal | Minimal intersection |
| observability | critical | Model monitoring, drift detection, eval dashboards |
| governance | critical | Model approval workflows, risk assessment |
| systems | moderate | Training data pipelines, feature stores |

- [ ] **Step 1: Research MLOps/LLMOps best practices**

Focus on: model evaluation pipelines, prompt versioning, fine-tuning workflows, model registry patterns, deployment strategies (canary, blue-green for models), evaluation-driven development, drift detection.

- [ ] **Step 2: Add AI Factory pillar** — `id: "ai-factory"`, `icon: "⚙"`

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate AI Factory (MLOps/LLMOps) pillar"
```

---

## Task 12: Research & Populate — AI Sovereignty Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- EU AI Act — sovereignty provisions
- Gaia-X — European data and AI sovereignty framework
- OECD AI Principles — national AI strategy alignment
- Cloud provider sovereign cloud offerings (Azure Confidential Computing, AWS Sovereign Cloud, Google Sovereign Controls)

**Tier assignments for AI Sovereignty:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | minimal | Surface is channel-agnostic |
| identity | moderate | Sovereign identity providers, jurisdiction-aware auth |
| orchestration | moderate | Routing decisions respecting sovereignty constraints |
| runtime | critical | Where agents execute, compute jurisdiction |
| gateway | critical | Model hosting location, inference sovereignty, vendor lock-in |
| tools | moderate | Tool execution jurisdiction |
| memory | critical | Knowledge storage sovereignty, embedding location |
| state | moderate | State residency requirements |
| observability | moderate | Telemetry sovereignty, log residency |
| governance | critical | Sovereignty policy enforcement, regulatory compliance |
| systems | critical | Data residency, cross-border data flow controls |

- [ ] **Step 1: Research AI sovereignty frameworks**

Focus on: compute sovereignty (where inference runs), model sovereignty (control over model weights/fine-tunes), vendor lock-in avoidance, open-weight model strategies, confidential computing, sovereign cloud patterns.

- [ ] **Step 2: Add AI Sovereignty pillar** — `id: "ai-sovereignty"`, `icon: "🏛"`

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate AI Sovereignty pillar"
```

---

## Task 13: Research & Populate — Data Sovereignty Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- GDPR — data residency, cross-border transfer (SCCs, adequacy decisions)
- ISO/IEC 27701 — Privacy Information Management
- NIST Privacy Framework
- Cloud provider data residency documentation
- EU Data Governance Act

**Tier assignments for Data Sovereignty:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | moderate | Data collection consent, residency-aware ingestion |
| identity | moderate | Data subject identity, consent management |
| orchestration | minimal | Orchestration metadata is low-sensitivity |
| runtime | moderate | Runtime data processing location |
| gateway | critical | PII detection, data classification before model calls |
| tools | critical | External tool data leakage, cross-border API calls |
| memory | critical | Vector store residency, knowledge base classification |
| state | critical | Session data residency, encryption, retention |
| observability | moderate | Log data residency, PII in telemetry |
| governance | critical | Data classification policies, retention rules, DSAR automation |
| systems | critical | Source system data controls, lineage, cross-border flows |

- [ ] **Step 1: Research data sovereignty frameworks**

Focus on: data classification schemes, residency enforcement, cross-border transfer mechanisms, encryption at rest/transit, PII detection pipelines, data subject rights automation, consent management.

- [ ] **Step 2: Add Data Sovereignty pillar** — `id: "data-sovereignty"`, `icon: "🗄"`

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate Data Sovereignty pillar"
```

---

## Task 14: Research & Populate — Agentic Orchestration Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- LangChain/LangGraph documentation — agent patterns
- Microsoft AutoGen — multi-agent orchestration
- CrewAI — agent coordination patterns
- Anthropic "Building Effective Agents" guide
- Google A2A (Agent-to-Agent) protocol spec

**Tier assignments for Agentic Orchestration:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | moderate | Request routing, multi-turn context |
| identity | moderate | Agent-to-agent identity, delegation credentials |
| orchestration | critical | Core domain — planning, routing, coordination |
| runtime | critical | Agent lifecycle, supervision, failure recovery |
| gateway | moderate | Model selection per agent role |
| tools | critical | Tool capability discovery, permission scoping |
| memory | critical | Shared context, handoff state, conversation history |
| state | critical | Task state machines, checkpoint/resume, workflow persistence |
| observability | critical | Agent trace visualization, performance attribution |
| governance | moderate | Agent capability policies, delegation limits |
| systems | moderate | SoR integration patterns for agent actions |

- [ ] **Step 1: Research agentic orchestration best practices**

Focus on: supervisor patterns, plan-and-execute, hierarchical delegation, failure recovery, context window management, tool permission scoping, agent-to-agent communication, state checkpoint/resume.

- [ ] **Step 2: Add Agentic Orchestration pillar** — `id: "agentic-orchestration"`, `icon: "🔀"`

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate Agentic Orchestration pillar"
```

---

## Task 15: Research & Populate — Responsible AI & Ethics Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- Microsoft Responsible AI Standard v2
- NIST AI RMF 1.0 — fairness, bias, transparency provisions
- UNESCO Recommendation on the Ethics of AI
- EU AI Act — prohibited practices, high-risk requirements
- Partnership on AI — responsible practices

**Tier assignments for Responsible AI:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | critical | Content safety in responses, harmful output filtering |
| identity | minimal | Identity is orthogonal to ethics |
| orchestration | moderate | Bias in routing/classification decisions |
| runtime | critical | Content safety middleware, harmful action prevention |
| gateway | critical | Model output filtering, safety classifiers, grounding |
| tools | moderate | Tool action ethics (e.g., automated decisions affecting people) |
| memory | moderate | Bias in training/retrieval data |
| state | minimal | Minimal ethical intersection |
| observability | critical | Bias monitoring, fairness metrics, incident reporting |
| governance | critical | Ethics review board integration, risk classification |
| systems | moderate | Decision impact on real people/systems |

- [ ] **Step 1: Research responsible AI frameworks**

Focus on: content safety pipelines, bias detection/mitigation, fairness metrics, transparency and explainability, human rights impact assessment, prohibited use enforcement, grounding to reduce hallucination.

- [ ] **Step 2: Add Responsible AI pillar** — `id: "responsible-ai"`, `icon: "⚖"`

Note: Use a different icon than AI Governance. Suggestion: `"✦"` or `"◈"` for Responsible AI, keep `"⚖"` for Governance.

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate Responsible AI & Ethics pillar"
```

---

## Task 16: Research & Populate — Observability & Operations Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- OpenTelemetry documentation — AI observability extensions
- Azure Monitor / Application Insights — AI workload monitoring
- Datadog LLM Observability documentation
- Google SRE Book — adapted for AI workloads
- CNCF Observability whitepaper

**Tier assignments for Observability & Operations:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | moderate | User experience metrics, error rates |
| identity | minimal | Auth metrics are standard (not AI-specific) |
| orchestration | critical | Trace spans for agent plans, routing decisions |
| runtime | critical | Agent execution traces, tool call logging, latency |
| gateway | critical | Token usage, model latency, cache hit rates, cost tracking |
| tools | moderate | Tool execution metrics, failure rates |
| memory | moderate | Retrieval quality metrics, embedding freshness |
| state | moderate | Session health, checkpoint metrics |
| observability | critical | Meta — the observability layer itself, dashboards, alerting |
| governance | moderate | Compliance reporting, policy evaluation metrics |
| systems | moderate | Integration health, data freshness |

- [ ] **Step 1: Research AI observability best practices**

Focus on: distributed tracing for agent flows, token usage tracking, model latency SLOs, LLM-specific metrics (hallucination rate, grounding score), cost attribution, alert design for AI workloads.

- [ ] **Step 2: Add Observability & Operations pillar** — `id: "observability-ops"`, `icon: "📡"`

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate Observability & Operations pillar"
```

---

## Task 17: Research & Populate — Cost Management Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- Azure Cost Management — AI workload patterns
- AWS Cost Optimization for Generative AI
- FinOps Foundation — AI cost management guidance
- Anthropic/OpenAI pricing documentation — token economics
- Various: prompt caching, semantic caching patterns

**Tier assignments for Cost Management:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | moderate | User-facing cost signals, usage limits |
| identity | minimal | Cost per identity is thin |
| orchestration | critical | Model selection cost optimization, plan efficiency |
| runtime | moderate | Agent execution cost attribution |
| gateway | critical | Token routing, caching, model tiering, cost caps |
| tools | moderate | Tool call cost (external API fees) |
| memory | moderate | Embedding generation/storage costs |
| state | minimal | Storage costs are marginal |
| observability | moderate | Cost dashboards, budget alerts |
| governance | critical | Budget policies, cost caps, chargeback rules |
| systems | minimal | SoR integration costs are standard |

- [ ] **Step 1: Research AI cost management best practices**

Focus on: token economics, prompt caching strategies, semantic caching, model tiering (use cheaper models for simpler tasks), cost attribution per tenant/agent/task, budget controls, FinOps for AI.

- [ ] **Step 2: Add Cost Management pillar** — `id: "cost-management"`, `icon: "◎"`

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate Cost Management pillar"
```

---

## Task 18: Research & Populate — Human-in-the-Loop Pillar

**Files:**
- Modify: `site/src/data/best-practices.ts`

**Research sources:**
- Microsoft AutoGen — human-in-the-loop patterns
- Anthropic "Building Effective Agents" — escalation patterns
- EU AI Act — human oversight requirements for high-risk AI
- NIST AI RMF — human-AI interaction provisions
- UX research on human-AI collaboration patterns

**Tier assignments for Human-in-the-Loop:**
| Layer | Tier | Reasoning |
|-------|------|-----------|
| surface | critical | Approval UIs, escalation interfaces, override mechanisms |
| identity | moderate | Human approver identity, delegation of authority |
| orchestration | critical | Approval gates in plans, escalation routing |
| runtime | critical | Breakpoint/pause mechanisms, human takeover |
| gateway | minimal | Model selection rarely needs human approval |
| tools | critical | High-risk tool execution approval, confirmation flows |
| memory | minimal | Knowledge updates may need review but rarely real-time |
| state | moderate | Approval state machines, timeout handling |
| observability | moderate | Approval metrics, escalation rates, response times |
| governance | critical | Approval policies, risk-based escalation rules |
| systems | moderate | Write-back confirmation, transaction approval |

- [ ] **Step 1: Research human-in-the-loop best practices**

Focus on: approval gate patterns, escalation routing, confidence-based escalation, human override mechanisms, timeout and fallback handling, UX for AI approval flows, risk-based routing to human review.

- [ ] **Step 2: Add Human-in-the-Loop pillar** — `id: "human-in-the-loop"`, `icon: "👤"`

- [ ] **Step 3: Verify build and test**

- [ ] **Step 4: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): populate Human-in-the-Loop pillar"
```

---

## Task 19: Final Integration — Remove Stubs, Verify All 10 Pillars

**Files:**
- Modify: `site/src/data/best-practices.ts`

- [ ] **Step 1: Verify all 10 pillars are present in PILLARS array**

The array should contain exactly these IDs in order:
1. `cyber-security`
2. `ai-governance`
3. `ai-factory`
4. `ai-sovereignty`
5. `data-sovereignty`
6. `agentic-orchestration`
7. `responsible-ai`
8. `observability-ops`
9. `cost-management`
10. `human-in-the-loop`

Each must have exactly 11 cells (one per layer ID: surface, identity, orchestration, runtime, gateway, tools, memory, state, observability, governance, systems).

- [ ] **Step 2: Remove any remaining stub content**

Search for "Stub" in best-practices.ts. All stub guidelines from Task 8 must be replaced with real researched content.

- [ ] **Step 3: Verify unique guideline IDs**

Every `Guideline.id` across the entire file must be unique. Convention: `{pillar-abbrev}-{layer-abbrev}-{number}` (e.g., `cs-surf-1`, `gov-orch-2`).

- [ ] **Step 4: Verify all citation URLs are real**

Every `Citation.url` must point to a real, publicly accessible document. No placeholder URLs.

- [ ] **Step 5: Full build verification**

Run: `cd site && npx next build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Full browser test**

Run: `cd site && npx next dev`
Test each pillar:
- Click through all 10 pillars — each loads content
- Relevance strips show correct tier coloring
- Layer cell cards expand/collapse
- Eng toggle works on guidelines
- "ATLAS →" button switches to Atlas view and opens the correct layer
- Citations render as links
- URL updates when switching pillars (`?view=practices&pillar=...`)
- Keyboard shortcut `4` works
- Direct URL navigation works (`?view=practices&pillar=ai-governance`)

- [ ] **Step 7: Commit**

```bash
git add site/src/data/best-practices.ts
git commit -m "feat(practices): finalize all 10 pillars, verify integration"
```

---

## Summary

| Task | Description | Type |
|------|-------------|------|
| 1 | Add types | Structural |
| 2 | Add state | Structural |
| 3 | Navigation integration | Structural |
| 4 | Relevance strip component | Component |
| 5 | Layer cell card component | Component |
| 6 | Pillar selector component | Component |
| 7 | Pillar detail component | Component |
| 8 | Wire up view + stub data | Integration |
| 9 | Cyber Security pillar | Research + Content |
| 10 | AI Governance pillar | Research + Content |
| 11 | AI Factory pillar | Research + Content |
| 12 | AI Sovereignty pillar | Research + Content |
| 13 | Data Sovereignty pillar | Research + Content |
| 14 | Agentic Orchestration pillar | Research + Content |
| 15 | Responsible AI pillar | Research + Content |
| 16 | Observability & Ops pillar | Research + Content |
| 17 | Cost Management pillar | Research + Content |
| 18 | Human-in-the-Loop pillar | Research + Content |
| 19 | Final integration | Verification |

**Parallelization:** Tasks 1-3 are sequential. Tasks 4-7 can run in parallel after Task 1. Task 8 depends on 4-7. Tasks 9-18 (research) can ALL run in parallel after Task 8. Task 19 depends on 9-18.
