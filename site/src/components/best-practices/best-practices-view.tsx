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
