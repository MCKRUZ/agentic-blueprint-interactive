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
