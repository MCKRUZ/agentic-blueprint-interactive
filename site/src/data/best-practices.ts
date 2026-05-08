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
