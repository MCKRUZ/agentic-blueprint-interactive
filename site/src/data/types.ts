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
  stack: string[];
  scaling?: string;
  failureMode?: string;
  example?: string;
  description2?: string;
}

export interface ExampleStep {
  n: string;
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
  outcome: Record<string, string | number>;
  steps: ExampleStep[];
}

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
