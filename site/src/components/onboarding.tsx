"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Welcome to the Atlas",
    body: "This is an interactive map of an 11-layer agentic platform. Each box is a component you can explore.",
    hint: "Let's take a quick tour.",
  },
  {
    title: "Click any component",
    body: "Tap a colored rectangle to open its dossier — you'll see what it does, why it matters, and which technologies solve it.",
    hint: "Try one after this tour ends.",
  },
  {
    title: "Pan & zoom",
    body: "Drag to pan. Scroll to zoom. On mobile, pinch to zoom. Use the +/− buttons or the reset button to re-center.",
    hint: "The diagram extends below the fold.",
  },
  {
    title: "Reveal layers one at a time",
    body: "The scrubber at the bottom lets you step through the architecture layer by layer — great for presentations.",
    hint: "Press ▶ to auto-play the reveal.",
  },
  {
    title: "Switch views",
    body: "The nav bar at the top has three views: Atlas (the diagram), Patterns (orchestration topologies), and Example (a real request traced end-to-end).",
    hint: "You're ready. Go explore.",
  },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<"loading" | "show" | "hidden">("loading");

  useEffect(() => {
    try {
      const seen = localStorage.getItem("atlas-onboarding-seen");
      setState(seen ? "hidden" : "show");
    } catch {
      setState("hidden");
    }
  }, []);

  if (state !== "show") return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const dismiss = () => {
    setState("hidden");
    try { localStorage.setItem("atlas-onboarding-seen", "1"); } catch {}
  };

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 200, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onClick={dismiss}
    >
      <div
        className="glass absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          maxWidth: "calc(100vw - 48px)",
          padding: "32px 36px",
          borderRadius: 16,
          animation: "dossierIn 0.4s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? "var(--c1)" : "var(--line-2)",
                transition: "width 0.2s, background 0.2s",
              }}
            />
          ))}
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--ink-4)",
            }}
          >
            {step + 1}/{STEPS.length}
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--display)",
            fontSize: 24,
            fontWeight: 600,
            color: "var(--ink)",
            margin: "0 0 10px",
          }}
        >
          {current.title}
        </h2>

        <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>
          {current.body}
        </p>

        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            color: "var(--ink-3)",
            fontStyle: "italic",
            margin: "0 0 24px",
          }}
        >
          {current.hint}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            style={{
              background: "none",
              border: "none",
              color: "var(--ink-4)",
              cursor: "pointer",
              fontFamily: "var(--mono)",
              fontSize: 13,
              letterSpacing: "0.05em",
            }}
          >
            Skip tour
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--line-2)",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontFamily: "var(--sans)",
                  fontSize: 14,
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? dismiss() : setStep(step + 1))}
              style={{
                background: "var(--c1)",
                border: "none",
                color: "var(--bg-0)",
                cursor: "pointer",
                padding: "8px 20px",
                borderRadius: 8,
                fontFamily: "var(--sans)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {isLast ? "Start exploring" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
