"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { WORLD_W, WORLD_H } from "@/lib/regions";

const CONTENT_W = 1480;
const CONTENT_H = 960;

interface Transform {
  x: number;
  y: number;
  k: number;
}

interface DragState {
  startX: number;
  startY: number;
  tx: number;
  ty: number;
}

export function AtlasCanvas({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const center = () => {
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      if (r.width < 50 || r.height < 50) return;
      const k = Math.min((r.width - 40) / CONTENT_W, (r.height - 40) / CONTENT_H, 1.6);
      setTransform({ x: r.width / 2, y: r.height / 2 + 10, k: Math.max(0.5, k) });
    };
    center();
    const ro = new ResizeObserver(center);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        tx: transform.x,
        ty: transform.y,
      };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [transform.x, transform.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform((t) => ({ ...t, x: dragRef.current!.tx + dx, y: dragRef.current!.ty + dy }));
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const dk = -e.deltaY * 0.001;
    setTransform((t) => {
      const k2 = Math.max(0.3, Math.min(4, t.k * (1 + dk)));
      return { ...t, k: k2 };
    });
  }, []);

  const recenter = useCallback(() => {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const k = Math.min((r.width - 40) / CONTENT_W, (r.height - 40) / CONTENT_H, 1.6);
    setTransform({ x: r.width / 2, y: r.height / 2 + 10, k: Math.max(0.5, k) });
  }, []);

  const svgLeft = transform.x - (WORLD_W * transform.k) / 2;
  const svgTop = transform.y - (WORLD_H * transform.k) / 2;

  return (
    <div
      ref={stageRef}
      className="absolute inset-0"
      style={{ cursor: isDragging ? "grabbing" : "grab", overflow: "hidden" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
    >
      <svg
        width={WORLD_W}
        height={WORLD_H}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${svgLeft}px, ${svgTop}px) scale(${transform.k})`,
          transition: isDragging ? "none" : "transform 0.15s ease-out",
          overflow: "visible",
        }}
      >
        {children}
      </svg>

      {/* Zoom controls */}
      <div
        className="glass absolute flex flex-col gap-1 p-1"
        style={{ bottom: 80, right: 16, borderRadius: 8, zIndex: 50 }}
      >
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.min(4, t.k * 1.25) }))}
          className="px-2 py-0.5 rounded"
          style={{
            color: "var(--ink-3)",
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.max(0.3, t.k * 0.8) }))}
          className="px-2 py-0.5 rounded"
          style={{
            color: "var(--ink-3)",
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          &minus;
        </button>
        <button
          onClick={recenter}
          className="px-2 py-0.5 rounded"
          style={{
            color: "var(--ink-3)",
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          &#x27F2;
        </button>
      </div>
    </div>
  );
}
