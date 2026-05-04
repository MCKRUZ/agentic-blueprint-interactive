"use client";

import { useAppStore, type View } from "@/store/app-store";

const VIEWS: { key: View; numeral: string; label: string }[] = [
  { key: "atlas", numeral: "i", label: "Atlas" },
  { key: "patterns", numeral: "ii", label: "Patterns" },
  { key: "example", numeral: "iii", label: "Example" },
];

export function Topbar() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <header
      className="glass flex items-center gap-4 px-5 py-2 mx-4 mt-3"
      style={{ position: "relative", zIndex: 80, borderRadius: 10 }}
    >
      <div className="flex items-center gap-3 mr-auto">
        <span
          className="font-bold tracking-tight"
          style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--c1)" }}
        >
          AGENTIC BLUEPRINT
        </span>
        <span style={{ color: "var(--ink-4)", fontSize: 15 }}>
          The Anatomy of an Agentic Platform
        </span>
      </div>

      <nav className="flex gap-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className="px-3 py-1 rounded-md transition-colors"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: `1px solid ${view === v.key ? "var(--line-3)" : "var(--line)"}`,
              background: view === v.key ? "var(--glass-2)" : "transparent",
              color: view === v.key ? "var(--ink)" : "var(--ink-3)",
              cursor: "pointer",
            }}
          >
            <span style={{ opacity: 0.5 }}>{v.numeral}</span> {v.label}
          </button>
        ))}
      </nav>

      <div className="flex gap-1 ml-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-2 py-1 rounded-md"
          style={{
            border: "1px solid var(--line)",
            background: "transparent",
            color: "var(--ink-3)",
            fontSize: 18,
            cursor: "pointer",
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "◐" : "◑"}
        </button>
        <button
          onClick={() => window.print()}
          className="px-2 py-1 rounded-md"
          style={{
            border: "1px solid var(--line)",
            background: "transparent",
            color: "var(--ink-3)",
            fontSize: 16,
            cursor: "pointer",
          }}
          aria-label="Print"
        >
          ⎙
        </button>
      </div>
    </header>
  );
}
