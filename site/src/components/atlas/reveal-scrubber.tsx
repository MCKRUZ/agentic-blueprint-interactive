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

  const currentLabel =
    revealUpTo >= 0 && revealUpTo < total
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
        style={{ color: "var(--c1)", background: "none", border: "none", cursor: "pointer", fontSize: 16, fontFamily: "var(--mono)" }}
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
        style={{ color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
        aria-label="Replay"
      >
        ⟲
      </button>

      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap", minWidth: 170 }}>
        {currentLabel}
      </span>
    </div>
  );
}
