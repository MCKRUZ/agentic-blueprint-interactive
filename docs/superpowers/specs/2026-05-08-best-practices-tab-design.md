# Best Practices Tab — Design Spec

## Overview

A fourth view ("Practices") for the Agentic Blueprint Interactive site. Presents enterprise-level AI foundational best practices organized as a cross-cutting concerns matrix: 10 practice domains (pillars) mapped against the existing 11 architecture layers.

Each pillar×layer intersection is tiered by relevance (critical/moderate/minimal) with corresponding guideline depth. Content is research-backed with citations to industry frameworks (NIST AI RMF, ISO 42001, OWASP LLM Top 10, EU AI Act, Microsoft Responsible AI, CNCF).

## Audience

Dual-lens (matching the site's existing exec/eng pattern):
- **Enterprise architects / CTOs**: Strategic guidance — what to stand up, why, governance posture
- **Platform engineers / tech leads**: Tactical guidance — concrete patterns, tooling, operational concerns

## Approach

**Pillar Explorer with Layer Matrix** — primary navigation by pillar (left sidebar), with a layer-relevance strip and expandable guideline cards in the detail panel (right). The matrix is navigable without rendering a literal 110-cell grid.

## Data Model

File: `site/src/data/best-practices.ts`

```typescript
export type RelevanceTier = "critical" | "moderate" | "minimal";

export interface Guideline {
  id: string;
  text: string;           // The guideline itself
  exec: string;           // Why it matters (strategic)
  eng: string;            // How to implement (tactical)
}

export interface MatrixCell {
  layerId: string;        // References LAYERS[].id
  tier: RelevanceTier;    // Visual heat indicator
  guidelines: Guideline[];
  // critical: 3-5 guidelines, moderate: 1-2, minimal: 1 brief note
}

export interface Citation {
  id: string;
  label: string;          // "NIST AI RMF 1.0"
  url: string;
  org: string;            // "NIST", "ISO", "OWASP", etc.
}

export interface Pillar {
  id: string;
  name: string;           // "Cyber Security"
  icon: string;           // Unicode glyph (no icon libraries)
  exec: string;           // Executive summary
  eng: string;            // Technical overview
  citations: Citation[];  // Frameworks this pillar draws from
  cells: MatrixCell[];    // One per layer (11 entries)
}
```

### The 10 Pillars

| # | Pillar | Description |
|---|--------|-------------|
| 1 | Cyber Security | Threat modeling, zero-trust, supply chain, runtime protection across the AI stack |
| 2 | AI Governance | Policies, standards, accountability structures, model lifecycle governance |
| 3 | AI Factory (MLOps/LLMOps) | Model training, fine-tuning, evaluation, deployment pipelines, registry |
| 4 | AI Sovereignty | Control over AI models, inference location, vendor lock-in avoidance, strategic autonomy |
| 5 | Data Sovereignty | Data residency, classification, cross-border compliance, encryption at rest/transit |
| 6 | Agentic Orchestration | Agent coordination patterns, delegation, supervision, failure recovery |
| 7 | Responsible AI & Ethics | Bias detection, fairness, transparency, content safety, harmful output prevention |
| 8 | Observability & Operations | Monitoring, tracing, alerting, SLOs, incident response for AI workloads |
| 9 | Cost Management | Token economics, model selection optimization, caching, budget controls |
| 10 | Human-in-the-Loop | Approval gates, escalation paths, override mechanisms, feedback loops |

### The 11 Layers (existing)

| # | Layer ID | Name |
|---|----------|------|
| 01 | surface | User Surface |
| 02 | identity | Identity & Trust |
| 03 | orchestration | Orchestration |
| 04 | runtime | Agent Runtime |
| 05 | gateway | Model Gateway |
| 06 | tools | Tool Mesh |
| 07 | memory | Memory |
| 08 | state | State & Sessions |
| 09 | observability | Observability |
| 10 | governance | Governance |
| 11 | systems | Systems of Record |

### Content Depth by Tier

- **Critical** (bright): 3-5 detailed guidelines, each with exec + eng text. These are the intersections where real risk lives — e.g., Cyber Security at Identity & Trust.
- **Moderate** (medium): 1-2 focused guidelines with exec + eng text. Relevant but not the primary concern — e.g., Cost Management at Memory.
- **Minimal** (dim): 1 brief note (exec only, no eng expansion needed). Acknowledges the intersection exists but isn't a major focus — e.g., AI Factory at User Surface.

### Content Sourcing

Research-heavy with citations. Primary frameworks:
- NIST AI Risk Management Framework (AI RMF 1.0)
- ISO/IEC 42001 (AI Management Systems)
- OWASP Top 10 for LLM Applications
- EU AI Act principles and risk classifications
- Microsoft Responsible AI Standard v2
- CNCF Cloud Native AI whitepaper
- Cloud provider well-architected frameworks (Azure, AWS, GCP) for AI workloads
- MITRE ATLAS (adversarial threat landscape for AI)

## Component Architecture

All components in `site/src/components/best-practices/`.

### best-practices-view.tsx
Top-level container. 30/70 layout split — pillar selector left, detail panel right. Glass morphism consistent with site theme. Responsive: stacks vertically on mobile.

### pillar-selector.tsx
Left panel. Vertical list of 10 pillars:
- Icon (unicode glyph) + pillar name
- Spark-bar showing critical/moderate/minimal cell distribution
- Click to select; first pillar selected by default
- Active pillar highlighted with `--glass-2` background + `--line-3` border (matching topbar active state)

### pillar-detail.tsx
Right panel for selected pillar:
1. **Header**: Icon, name, exec summary
2. **Eng deep-dive**: Collapsible technical overview
3. **Layer relevance strip**: Horizontal bar of 11 colored blocks
   - Critical: layer's `ink` color at full opacity
   - Moderate: 50% opacity
   - Minimal: 15% opacity
   - Click any block to scroll to that cell's guidelines
4. **Guidelines by layer**: Stacked `<LayerCellCard>` components, critical-first ordering
5. **Citations footer**: Framework references with external links

### layer-cell-card.tsx
Individual card for one pillar x layer intersection:
- Layer name + tier badge (colored dot or tag)
- Guidelines with exec/eng dual text (exec shown by default, eng expandable)
- Minimal-tier cells collapsed by default
- "Open in Atlas" link: `setView("atlas")` + `openDossier(layerId)`

### relevance-strip.tsx
Horizontal 11-block mini visualization. Each block represents a layer, colored by tier. Clickable. Reusable component.

## State Changes

### app-store.ts
```typescript
// View union
export type View = "atlas" | "patterns" | "example" | "practices";

// New state fields
activePillar: string | null;
setActivePillar: (id: string | null) => void;
```

### URL sync
- `?view=practices` — practices tab
- `?view=practices&pillar=cyber-security` — specific pillar deep-link

### topbar.tsx
```typescript
{ key: "practices", numeral: "iv", label: "Practices" }
```

### page.tsx
- Add `{view === "practices" && <BestPracticesView />}` to view switch
- Add keyboard shortcut `4` for practices view

### types.ts
Add all new interfaces (Pillar, MatrixCell, Guideline, Citation, RelevanceTier).

## Cross-View Links

- **Practices -> Atlas**: "Open in Atlas" on layer cell cards switches view and opens dossier
- Atlas -> Practices: out of scope for initial implementation

## Implementation Order

1. Types + data model (`types.ts`, `best-practices.ts` with stub data for 1-2 pillars)
2. State changes (`app-store.ts`, URL sync)
3. Navigation integration (`topbar.tsx`, `page.tsx`, keyboard shortcut)
4. Components (best-practices-view, pillar-selector, pillar-detail, relevance-strip, layer-cell-card)
5. Research + populate all 10 pillars (the bulk of the work)
6. Cross-view links (Practices -> Atlas)

## Research Phase

The content population (step 5) is the largest workload. For each of the 10 pillars:
1. Research current best practices from cited frameworks
2. Map guidelines to each of the 11 layers with appropriate tier
3. Write exec + eng text for each guideline
4. Include specific citations with URLs

This produces ~110 matrix cells with an estimated 250-350 individual guidelines total.

## Out of Scope

- Atlas -> Practices reverse links (future enhancement)
- PDF/export of best practices (future enhancement)
- Search/filter across guidelines (future enhancement)
- User-contributed best practices or comments
