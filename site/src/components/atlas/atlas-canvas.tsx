"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { WORLD_W, WORLD_H } from "@/lib/regions";

const CONTENT_W = 1480;
const CONTENT_H = 960;
const MIN_SCALE = 0.3;
const MAX_SCALE = 4;
const MIN_READABLE_SCALE = 0.6;

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

function getTouchDistance(t1: Touch, t2: Touch): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function AtlasCanvas({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const pinchRef = useRef<{ dist: number; k: number } | null>(null);

  // Track narrow viewport for responsive zoom controls
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-fit on mount and resize
  useEffect(() => {
    const center = () => {
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      if (r.width < 50 || r.height < 50) return;
      const computed = Math.min((r.width - 40) / CONTENT_W, (r.height - 40) / CONTENT_H, 1.6);
      const k = Math.max(MIN_READABLE_SCALE, computed);
      setTransform({ x: r.width / 2, y: r.height / 2 + 10, k });
    };
    center();
    const ro = new ResizeObserver(center);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  // Pinch-to-zoom via touch events
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDistance(e.touches[0], e.touches[1]);
        pinchRef.current = { dist, k: transform.k };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dist = getTouchDistance(e.touches[0], e.touches[1]);
        const ratio = dist / pinchRef.current.dist;
        const newK = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchRef.current.k * ratio));
        setTransform((t) => ({ ...t, k: newK }));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current = null;
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [transform.k]);

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
      const k2 = Math.max(MIN_SCALE, Math.min(MAX_SCALE, t.k * (1 + dk)));
      return { ...t, k: k2 };
    });
  }, []);

  const recenter = useCallback(() => {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const computed = Math.min((r.width - 40) / CONTENT_W, (r.height - 40) / CONTENT_H, 1.6);
    const k = Math.max(MIN_READABLE_SCALE, computed);
    setTransform({ x: r.width / 2, y: r.height / 2 + 10, k });
  }, []);

  const svgLeft = transform.x - (WORLD_W * transform.k) / 2;
  const svgTop = transform.y - (WORLD_H * transform.k) / 2;

  return (
    <div
      ref={stageRef}
      className="absolute inset-0"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        overflow: "hidden",
        touchAction: "none",
      }}
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
        className="zoom-controls glass absolute flex gap-1 p-1"
        style={{
          bottom: isNarrow ? 16 : 80,
          right: isNarrow ? "50%" : 16,
          transform: isNarrow ? "translateX(50%)" : undefined,
          flexDirection: isNarrow ? "row" : "column",
          borderRadius: 8,
          zIndex: 50,
        }}
      >
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.min(MAX_SCALE, t.k * 1.25) }))}
          className="px-2 py-0.5 rounded"
          style={{
            color: "var(--ink-3)",
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: "pointer",
            minWidth: isNarrow ? 44 : undefined,
            minHeight: isNarrow ? 44 : undefined,
            fontSize: isNarrow ? 18 : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.max(MIN_SCALE, t.k * 0.8) }))}
          className="px-2 py-0.5 rounded"
          style={{
            color: "var(--ink-3)",
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: "pointer",
            minWidth: isNarrow ? 44 : undefined,
            minHeight: isNarrow ? 44 : undefined,
            fontSize: isNarrow ? 18 : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            fontSize: isNarrow ? 18 : 12,
            minWidth: isNarrow ? 44 : undefined,
            minHeight: isNarrow ? 44 : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &#x27F2;
        </button>
      </div>
    </div>
  );
}
