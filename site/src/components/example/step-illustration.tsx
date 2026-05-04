"use client";

interface StepIllustrationProps {
  layer: string;
  ink: string;
  stepN: string;
}

export function StepIllustration({ layer, ink, stepN }: StepIllustrationProps) {
  const Illust = ILLUSTRATIONS[layer] ?? FallbackIllust;
  return (
    <svg viewBox="0 0 400 220" className="w-full" style={{ maxHeight: 260, display: "block" }}>
      <Illust ink={ink} stepN={stepN} />
    </svg>
  );
}

type IllustProps = { ink: string; stepN: string };

function ChatIllust({ ink }: IllustProps) {
  return (
    <g>
      <rect x={40} y={10} width={320} height={200} rx={12} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      <rect x={40} y={10} width={320} height={28} rx={12} fill={ink} fillOpacity={0.1} />
      <circle cx={58} cy={24} r={4} fill={ink} fillOpacity={0.4} />
      <circle cx={72} cy={24} r={4} fill={ink} fillOpacity={0.3} />
      <circle cx={86} cy={24} r={4} fill={ink} fillOpacity={0.2} />
      <rect x={150} y={50} width={190} height={48} rx={8} fill={ink} fillOpacity={0.15} stroke={ink} strokeOpacity={0.25} />
      <text x={164} y={70} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.9 }}>I returned my order over</text>
      <text x={164} y={86} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.9 }}>a week ago — where&apos;s my refund?</text>
      <rect x={60} y={115} width={100} height={36} rx={8} fill={ink} fillOpacity={0.08} stroke={ink} strokeOpacity={0.15} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={84 + i * 18} cy={133} r={4} fill={ink} fillOpacity={0.6}>
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <line x1={200} y1={168} x2={200} y2={200} stroke={ink} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1s" repeatCount="indefinite" />
      </line>
      <text x={212} y={190} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>SSE stream</text>
    </g>
  );
}

function IdentityIllust({ ink, stepN }: IllustProps) {
  if (stepN === "03") {
    return (
      <g>
        <rect x={100} y={20} width={200} height={180} rx={10} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5} />
        <text x={200} y={50} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>POLICY ENGINE</text>
        {[
          { y: 75, label: "order.read.self", status: "ALLOW" },
          { y: 105, label: "refund.issue.self", status: "ALLOW" },
          { y: 135, label: "credit.goodwill", status: "APPROVAL" },
        ].map((row) => (
          <g key={row.label}>
            <rect x={120} y={row.y - 12} width={160} height={24} rx={4} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.15} />
            <text x={130} y={row.y + 4} style={{ fontFamily: "var(--mono)", fontSize: 10.5, fill: ink, opacity: 0.7 }}>{row.label}</text>
            <text x={290} y={row.y + 4} style={{ fontFamily: "var(--mono)", fontSize: 10.5, fill: ink, opacity: row.status === "APPROVAL" ? 1 : 0.5 }}>{row.status}</text>
          </g>
        ))}
        <text x={200} y={178} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>OPA v3.91</text>
      </g>
    );
  }
  return (
    <g>
      <rect x={130} y={80} width={140} height={90} rx={12} fill={ink} fillOpacity={0.12} stroke={ink} strokeOpacity={0.35} strokeWidth={2} />
      <path d="M170 80 V60 A30 30 0 0 1 230 60 V80" fill="none" stroke={ink} strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
      <circle cx={200} cy={118} r={10} fill={ink} fillOpacity={0.3} />
      <rect x={196} y={124} width={8} height={18} rx={2} fill={ink} fillOpacity={0.3} />
      <circle cx={200} cy={118} r={26} fill="none" stroke={ink} strokeOpacity={0.2} strokeWidth={1}>
        <animate attributeName="r" values="26;32;26" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x={300} y={95} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>passkey ✓</text>
      <text x={300} y={115} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>device ✓</text>
      <text x={300} y={135} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>risk: 0.04</text>
      <text x={55} y={105} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>OIDC</text>
      <text x={55} y={125} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>WebAuthn</text>
    </g>
  );
}

function OrchestrationIllust({ ink }: IllustProps) {
  return (
    <g>
      <circle cx={200} cy={30} r={18} fill={ink} fillOpacity={0.12} stroke={ink} strokeOpacity={0.35} strokeWidth={1.5} />
      <text x={200} y={35} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink }}>IN</text>
      <line x1={200} y1={48} x2={90} y2={100} stroke={ink} strokeOpacity={0.2} strokeWidth={1.5} />
      <line x1={200} y1={48} x2={200} y2={100} stroke={ink} strokeOpacity={0.5} strokeWidth={2} />
      <line x1={200} y1={48} x2={310} y2={100} stroke={ink} strokeOpacity={0.2} strokeWidth={1.5} />
      <circle r={4} fill={ink} fillOpacity={0.8}>
        <animateMotion dur="1.5s" repeatCount="indefinite" path="M200,48 L200,100" />
      </circle>
      {[
        { x: 90, label: "General", score: "0.61", active: false },
        { x: 200, label: "Refunds", score: "0.94", active: true },
        { x: 310, label: "Billing", score: "0.23", active: false },
      ].map((a) => (
        <g key={a.label}>
          <rect x={a.x - 50} y={100} width={100} height={40} rx={6} fill={ink} fillOpacity={a.active ? 0.15 : 0.06} stroke={ink} strokeOpacity={a.active ? 0.5 : 0.2} strokeWidth={a.active ? 1.5 : 1} />
          <text x={a.x} y={125} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: a.active ? 600 : 400, opacity: a.active ? 1 : 0.5 }}>{a.label}</text>
          <text x={a.x} y={158} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: a.active ? 0.8 : 0.35 }}>{a.score}</text>
        </g>
      ))}
      <line x1={200} y1={140} x2={200} y2={190} stroke={ink} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
      </line>
      <text x={200} y={210} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>&rarr; agents.refunds.v3</text>
    </g>
  );
}

function AgentsIllust({ ink, stepN }: IllustProps) {
  if (stepN === "12") {
    return (
      <g>
        <rect x={60} y={20} width={280} height={180} rx={10} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5} />
        <text x={80} y={48} style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>DRAFTING REPLY</text>
        {[
          { y: 70, text: '"Hi Maria — I\'m sorry, you\'re right."' },
          { y: 90, text: '"Your return arrived April 4 but the"' },
          { y: 110, text: '"refund didn\'t fire automatically..."' },
          { y: 130, text: '"$147 refund → card by April 17"' },
          { y: 150, text: '"+ $15 goodwill credit (pending)"' },
        ].map((line, i) => (
          <text key={i} x={80} y={line.y} style={{ fontFamily: "var(--mono)", fontSize: 10.5, fill: ink, opacity: 0.6 + i * 0.05 }}>{line.text}</text>
        ))}
        <rect x={80} y={164} width={60} height={18} rx={3} fill={ink} fillOpacity={0.12} stroke={ink} strokeOpacity={0.3} />
        <text x={110} y={177} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: ink }}>§3.2 cited</text>
        <circle cx={330} cy={110} r={4} fill={ink} fillOpacity={0.6}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }
  return (
    <g>
      <circle cx={200} cy={50} r={28} fill={ink} fillOpacity={0.1} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      <text x={200} y={46} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, fontWeight: 600 }}>REFUND</text>
      <text x={200} y={60} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, fontWeight: 600 }}>AGENT</text>
      <line x1={200} y1={78} x2={200} y2={100} stroke={ink} strokeOpacity={0.4} strokeWidth={1.5} />
      {[
        { y: 108, text: "1. Fetch order from CRM" },
        { y: 130, text: "2. Check return in WMS" },
        { y: 152, text: "3. Look up refund in Stripe" },
        { y: 174, text: "4. Issue / explain" },
        { y: 196, text: "5. Draft reply + citations" },
      ].map((item, i) => (
        <g key={i}>
          <rect x={90} y={item.y - 12} width={220} height={20} rx={3} fill={ink} fillOpacity={0.05} stroke={ink} strokeOpacity={0.12} />
          <text x={100} y={item.y + 3} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.6 }}>{item.text}</text>
        </g>
      ))}
      <text x={200} y={218} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: ink, opacity: 0.35 }}>budget: 4 calls · 6k tokens · 30s</text>
    </g>
  );
}

function GatewayIllust({ ink }: IllustProps) {
  return (
    <g>
      <ellipse cx={200} cy={80} rx={100} ry={50} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5} />
      <text x={200} y={72} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 500 }}>MODEL</text>
      <text x={200} y={90} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>GATEWAY</text>
      {[{ x: 90, label: "Haiku" }, { x: 200, label: "Sonnet" }, { x: 310, label: "GPT-4o" }].map((m) => (
        <g key={m.label}>
          <rect x={m.x - 45} y={155} width={90} height={32} rx={5} fill={ink} fillOpacity={m.label === "Sonnet" ? 0.15 : 0.06} stroke={ink} strokeOpacity={m.label === "Sonnet" ? 0.4 : 0.15} />
          <text x={m.x} y={176} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, opacity: m.label === "Sonnet" ? 0.9 : 0.4 }}>{m.label}</text>
          <line x1={m.x} y1={130} x2={m.x} y2={155} stroke={ink} strokeOpacity={0.2} strokeWidth={1} strokeDasharray="3 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
          </line>
        </g>
      ))}
    </g>
  );
}

function MemoryIllust({ ink }: IllustProps) {
  return (
    <g>
      <text x={200} y={25} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>RAG RETRIEVAL</text>
      <circle cx={200} cy={65} r={16} fill="none" stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      <line x1={212} y1={77} x2={224} y2={89} stroke={ink} strokeOpacity={0.3} strokeWidth={2.5} strokeLinecap="round" />
      <text x={200} y={70} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: ink, opacity: 0.5 }}>Q</text>
      {[
        { y: 110, doc: "refund-policy.md §3.2", score: "0.91", w: 280 },
        { y: 145, doc: "return-sla.md §1.1", score: "0.82", w: 240 },
        { y: 180, doc: "holiday-delays-2026.md §2", score: "0.74", w: 200 },
      ].map((r, i) => (
        <g key={i}>
          <rect x={60} y={r.y - 14} width={r.w} height={28} rx={4} fill={ink} fillOpacity={0.06 + i * 0.02} stroke={ink} strokeOpacity={0.15 + (2 - i) * 0.08} />
          <text x={74} y={r.y + 4} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.6 }}>{r.doc}</text>
          <text x={60 + r.w - 8} y={r.y + 4} textAnchor="end" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.8 }}>{r.score}</text>
        </g>
      ))}
      <text x={200} y={212} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: ink, opacity: 0.35 }}>BM25 + vector · reranked</text>
    </g>
  );
}

function ToolsIllust({ ink, stepN }: IllustProps) {
  if (stepN === "08") {
    return (
      <g>
        <rect x={80} y={20} width={240} height={180} rx={10} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5} />
        <text x={200} y={50} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>STRIPE CHECK</text>
        <text x={200} y={70} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>stripe.list_refunds(ch_3O…)</text>
        <rect x={110} y={85} width={180} height={50} rx={6} fill={ink} fillOpacity={0.08} stroke={ink} strokeOpacity={0.2} />
        <text x={200} y={108} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, opacity: 0.7 }}>refunds: []</text>
        <text x={200} y={124} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>charge: succeeded · $147</text>
        <rect x={110} y={150} width={180} height={28} rx={4} fill={ink} fillOpacity={0.12} stroke={ink} strokeOpacity={0.35} />
        <text x={200} y={169} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, fontWeight: 500 }}>NO REFUND ISSUED</text>
        <text x={200} y={210} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: ink, opacity: 0.35 }}>218ms</text>
      </g>
    );
  }
  if (stepN === "10") {
    return (
      <g>
        <rect x={80} y={20} width={240} height={180} rx={10} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5} />
        <text x={200} y={50} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>STRIPE REFUND</text>
        <text x={200} y={70} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>stripe.create_refund($147)</text>
        <path d="M160 110 L200 90 L240 110 L200 130 Z" fill={ink} fillOpacity={0.1} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
        <text x={200} y={115} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink }}>$147.00</text>
        <path d="M200 130 L200 160" stroke={ink} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
        </path>
        <rect x={140} y={160} width={120} height={28} rx={4} fill={ink} fillOpacity={0.12} stroke={ink} strokeOpacity={0.35} />
        <text x={200} y={179} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink }}>re_3P… pending</text>
        <text x={200} y={210} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: ink, opacity: 0.35 }}>idempotent · 489ms</text>
      </g>
    );
  }
  return (
    <g>
      <rect x={80} y={20} width={240} height={180} rx={10} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5} />
      <text x={200} y={50} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>CRM LOOKUP</text>
      <text x={200} y={70} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>crm.get_order(A-19284)</text>
      {[
        { y: 95, k: "order_id", v: "A-19284" },
        { y: 115, k: "total", v: "$147.00" },
        { y: 135, k: "status", v: "returned" },
        { y: 155, k: "return_at", v: "2026-04-04" },
        { y: 175, k: "refund_due", v: "$147.00" },
      ].map((row) => (
        <g key={row.k}>
          <text x={110} y={row.y} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.45 }}>{row.k}</text>
          <text x={290} y={row.y} textAnchor="end" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.7 }}>{row.v}</text>
        </g>
      ))}
      <text x={200} y={210} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: ink, opacity: 0.35 }}>312ms · identity propagated</text>
    </g>
  );
}

function ObservabilityIllust({ ink }: IllustProps) {
  return (
    <g>
      <text x={200} y={25} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>TRACE SPANS</text>
      <line x1={60} y1={200} x2={350} y2={200} stroke={ink} strokeOpacity={0.2} strokeWidth={1} />
      <line x1={60} y1={40} x2={60} y2={200} stroke={ink} strokeOpacity={0.2} strokeWidth={1} />
      <polyline points="60,170 100,155 140,160 180,95 220,110 260,65 300,75 340,80" fill="none" stroke={ink} strokeOpacity={0.5} strokeWidth={2} strokeLinejoin="round" />
      <polygon points="60,170 100,155 140,160 180,95 220,110 260,65 300,75 340,80 340,200 60,200" fill={ink} fillOpacity={0.06} />
      {[[60, 170], [100, 155], [140, 160], [180, 95], [220, 110], [260, 65], [300, 75], [340, 80]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={4} fill={ink} fillOpacity={0.5}>
          <animate attributeName="r" values="3;5;3" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <text x={370} y={68} style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>5/5</text>
      <text x={200} y={218} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>23 spans · $0.038 · 47.2s</text>
    </g>
  );
}

function GuardrailsIllust({ ink, stepN }: IllustProps) {
  if (stepN === "11") {
    return (
      <g>
        <text x={200} y={30} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>AUDIT CHAIN</text>
        {Array.from({ length: 5 }).map((_, i) => {
          const x = 60 + i * 65;
          return (
            <g key={i}>
              <rect x={x} y={55} width={55} height={55} rx={6} fill={ink} fillOpacity={0.06 + i * 0.02} stroke={ink} strokeOpacity={0.15 + i * 0.05} />
              <text x={x + 27} y={80} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: ink, opacity: 0.5 }}>#{i + 1}</text>
              <text x={x + 27} y={100} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 8, fill: ink, opacity: 0.35 }}>0x{(9 + i).toString(16)}a…</text>
              {i < 4 && <line x1={x + 55} y1={82} x2={x + 65} y2={82} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5} />}
            </g>
          );
        })}
        <text x={200} y={140} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>11 events · hash-chained · append-only</text>
        <text x={200} y={165} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>retention: 7 years · SOX · PCI-DSS</text>
      </g>
    );
  }
  if (stepN === "13") {
    return (
      <g>
        <text x={200} y={30} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: ink, fontWeight: 600 }}>HUMAN-IN-THE-LOOP</text>
        <rect x={60} y={50} width={130} height={100} rx={8} fill={ink} fillOpacity={0.06} stroke={ink} strokeOpacity={0.2} />
        <text x={125} y={75} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>AGENT REQUEST</text>
        <text x={125} y={100} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.6 }}>$15 goodwill</text>
        <text x={125} y={120} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.6 }}>credit</text>
        <line x1={190} y1={100} x2={220} y2={100} stroke={ink} strokeOpacity={0.3} strokeWidth={2} markerEnd="url(#arrowH)" />
        <rect x={220} y={50} width={130} height={100} rx={8} fill={ink} fillOpacity={0.12} stroke={ink} strokeOpacity={0.35} />
        <text x={285} y={75} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, fontWeight: 500 }}>APPROVED ✓</text>
        <text x={285} y={100} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.6 }}>j.morris</text>
        <text x={285} y={120} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>11 seconds</text>
        <text x={200} y={185} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>queue: support.credits</text>
        <defs>
          <marker id="arrowH" viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0,0 L6,3 L0,6" fill={ink} fillOpacity={0.3} />
          </marker>
        </defs>
      </g>
    );
  }
  return (
    <g>
      <path d="M200 15 L260 50 V120 C260 165 200 190 200 190 C200 190 140 165 140 120 V50 Z" fill={ink} fillOpacity={0.08} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      <path d="M175 110 L195 130 L230 85" fill="none" stroke={ink} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <text x={200} y={215} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.5 }}>refund: ALLOW · goodwill: NEEDS HUMAN</text>
    </g>
  );
}

function StateIllust({ ink }: IllustProps) {
  return (
    <g>
      <ellipse cx={200} cy={60} rx={80} ry={22} fill={ink} fillOpacity={0.1} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      <rect x={120} y={60} width={160} height={90} fill={ink} fillOpacity={0.06} />
      <line x1={120} y1={60} x2={120} y2={150} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      <line x1={280} y1={60} x2={280} y2={150} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      <ellipse cx={200} cy={150} rx={80} ry={22} fill={ink} fillOpacity={0.1} stroke={ink} strokeOpacity={0.3} strokeWidth={1.5} />
      {[85, 105, 125].map((y) => (
        <line key={y} x1={145} y1={y} x2={255} y2={y} stroke={ink} strokeOpacity={0.12} strokeWidth={1} />
      ))}
      <text x={200} y={185} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: ink, opacity: 0.4 }}>persisting state</text>
    </g>
  );
}

function FallbackIllust({ ink }: IllustProps) {
  return (
    <g>
      <circle cx={200} cy={110} r={50} fill={ink} fillOpacity={0.08} stroke={ink} strokeOpacity={0.25} strokeWidth={1.5}>
        <animate attributeName="r" values="48;52;48" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x={200} y={115} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 13, fill: ink }}>PROCESSING</text>
    </g>
  );
}

const ILLUSTRATIONS: Record<string, React.FC<IllustProps>> = {
  surface: ChatIllust,
  identity: IdentityIllust,
  orchestration: OrchestrationIllust,
  agents: AgentsIllust,
  runtime: AgentsIllust,
  gateway: GatewayIllust,
  memory: MemoryIllust,
  tools: ToolsIllust,
  observability: ObservabilityIllust,
  governance: GuardrailsIllust,
  guardrails: GuardrailsIllust,
  state: StateIllust,
};
