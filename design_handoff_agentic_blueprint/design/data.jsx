// Data model for the Anatomy of an Agentic Platform.
// Each layer + component has BOTH executive and engineer copy.
// Color encodes layer category — a 10-ink palette of restrained chromatic inks.

const LAYERS = [
  {
    n: "01",
    id: "surface",
    name: "User Surface",
    tagline: "Where requests enter the system",
    ink: "#67E8F9", // burnt sienna
    exec: "The doors people walk through to talk to the platform — chat, voice, embedded panels, programmatic APIs, and other agents calling in.",
    eng: "Ingress channels. Every channel funnels into a typed request envelope before identity. Streaming over SSE/SignalR for chat; WebRTC for voice; REST + OpenAPI for programmatic; A2A inbound at /.well-known/agent.json.",
    components: [
      { id: "chat-ui", name: "Chat UI",
        exec: "The streaming conversational front-end embedded in your product or app. What most users actually see.",
        eng: "React/TypeScript front-end. SignalR or SSE for token streaming. MSAL for auth. Renders citations + tool call surfaces inline.",
        terms: ["SSE","SignalR","MSAL"] },
      { id: "voice", name: "Voice",
        exec: "Spoken interaction for call-center deflection, in-car assistants, and accessibility.",
        eng: "WebRTC audio in. Real-time STT (Whisper, Deepgram). TTS streaming back. End-to-end latency budget < 600ms.",
        terms: ["WebRTC","STT","TTS"] },
      { id: "copilot", name: "Embedded Copilot",
        exec: "An assistant pane that lives inside Salesforce, ServiceNow, or Excel without rebuilding the host app.",
        eng: "iframe or browser extension. Host context exchanged via postMessage. Auth bridged through host SSO session.",
        terms: ["postMessage","iframe"] },
      { id: "api", name: "API",
        exec: "Programmatic access for backend systems and partners that need to call agents directly.",
        eng: "REST + streaming endpoints. JWT bearer. Rate-limited per tenant. OpenAPI spec auto-generated from handlers.",
        terms: ["JWT","OpenAPI","REST"] },
      { id: "a2a-in", name: "A2A Inbound",
        exec: "Other autonomous agents calling this platform as a capability they can use.",
        eng: "A2A protocol over HTTP. Agent cards published at /.well-known/agent.json. Capability negotiation precedes delegation.",
        terms: ["A2A","Agent Card"] },
    ]
  },
  {
    n: "02",
    id: "identity",
    name: "Identity & Trust",
    tagline: "Who is asking, what are they allowed to do",
    ink: "#38BDF8", // oxblood
    exec: "Verifies the human, gives every agent its own identity, and issues short-lived credentials scoped to the task at hand. No static service accounts.",
    eng: "AuthN + AuthZ plane. Issues scoped credentials per agent invocation. Every downstream tool call carries a propagated identity envelope. Workload identity per agent. Policies as code.",
    components: [
      { id: "sso", name: "SSO / OAuth",
        exec: "Confirms the human via your existing corporate identity — Azure AD, Okta, passkeys.",
        eng: "OAuth 2.0 / OIDC. Azure AD / Okta / Auth0. Passkeys. Conditional access checks device posture and risk signals.",
        terms: ["OAuth 2.0","OIDC","Conditional Access"] },
      { id: "agent-id", name: "Agent Identity",
        exec: "Every agent has its own identity, separate from the user, so its actions can be tracked individually.",
        eng: "Workload identity per agent. Scoped tokens with TTL < 15 min. SPIFFE/SPIRE-style attestation in mature setups.",
        terms: ["SPIFFE","SPIRE","Workload Identity"] },
      { id: "scoped-creds", name: "Scoped Credentials",
        exec: "Least-privilege access — each task gets only the permissions it needs, only for as long as it needs them.",
        eng: "JIT credential issuance. Permission set derived from skill manifest + user delegation. Refreshed per turn.",
        terms: ["JIT","Least Privilege"] },
      { id: "policy", name: "Policy Engine",
        exec: "A central rulebook that says what agents are allowed to do — independent of the agent's own code.",
        eng: "OPA or Cedar. Attribute-based access control. Policies version-controlled. Every decision logged.",
        terms: ["OPA","Cedar","ABAC"] },
    ]
  },
  {
    n: "03",
    id: "orchestration",
    name: "Orchestration",
    tagline: "Decides what happens, in what order, by whom",
    ink: "#818CF8", // ink blue
    exec: "The brain of the platform. Reads the request, figures out what kind of work it is, and routes it to the right specialist — keeping the turn loop, budgets, and limits in check.",
    eng: "Receives a typed request, classifies intent, routes to the correct runtime, drives the turn loop, enforces turn and budget limits. CQRS pipeline.",
    components: [
      { id: "classifier", name: "Classifier",
        exec: "Decides what kind of work the request is — knowledge lookup, transaction, code task, or escalation to a human.",
        eng: "Lightweight LLM or trained classifier. Confidence-thresholded. Falls back to 'I don't know' rather than guessing.",
        terms: ["Classifier"] },
      { id: "router", name: "Router",
        exec: "Sends work to the right agent or workflow based on availability, cost, and past success.",
        eng: "Adaptive routing on availability, latency, cost tier, historical success rate. Continuously updated weights.",
        terms: ["Adaptive Routing"] },
      { id: "planner", name: "Planner",
        exec: "Breaks complex requests into smaller subtasks the specialists can handle.",
        eng: "Plan-and-execute pattern. Outputs a directed task graph. May replan mid-execution on signal change.",
        terms: ["Plan-and-Execute","DAG"] },
      { id: "orchestrator", name: "Orchestrator",
        exec: "Drives the turn-by-turn execution — making sure each step finishes before the next begins.",
        eng: "CQRS pipeline: validation → caching → perf logging → handler. Commands: ExecuteAgentTurn, RunConversation, RunOrchestratedTask.",
        terms: ["CQRS","Turn Loop"] },
    ]
  },
  {
    n: "04",
    id: "runtime",
    name: "Agent Runtime",
    tagline: "The agents themselves",
    ink: "#A78BFA", // forest
    exec: "The specialist workforce. Each agent declares its skills, tools, and decision style — and loads only what it needs to keep the conversation focused.",
    eng: "Each agent has a manifest declaring skills, tools, decision framework. Skills load progressively to manage context budget. Self-tuning meta-harness drives improvement.",
    components: [
      { id: "supervisor", name: "Supervisor Agent",
        exec: "Coordinates the specialists — holds the plan, hands out work, and brings the answers back together.",
        eng: "Holds the plan. Delegates via A2A. Synthesizes results across specialists. Owns the user-facing turn.",
        terms: ["A2A","Supervisor Pattern"] },
      { id: "specialists", name: "Specialist Agents",
        exec: "Domain experts — fraud, compliance, customer history, code review. Each one knows its lane and stays in it.",
        eng: "Individually deployed. Narrow skill manifests. Discoverable via agent cards. Versioned independently.",
        terms: ["Agent Card"] },
      { id: "skills", name: "Skills System",
        exec: "Three-tier progressive disclosure — agents see a one-line index of what they can do, then load the details only when they pick a skill.",
        eng: "SKILL.md files. Tier 1 index card (~100 tok, always loaded). Tier 2 folder (~5k tok, on selection). Tier 3 filing cabinet (unbounded, during execution).",
        terms: ["Progressive Disclosure","SKILL.md"] },
      { id: "context", name: "Context Budget",
        exec: "A book-keeper that tracks how much room is left in the conversation, and gracefully drops detail when space runs out.",
        eng: "Tracks system prompt, skills, tool schemas, history. Tiered context assembler degrades gracefully when budget is tight.",
        terms: ["Context Window"] },
      { id: "meta", name: "Meta-Harness",
        exec: "A self-tuning loop that proposes changes, evaluates them, and only adopts the ones that don't break anything. Research shows this matters more than the model itself.",
        eng: "Propose → evaluate → regression-gate → record. Eval tasks in JSON. Regression suite self-maintained. Causal trace analysis on failed turns. Harness choice causes 6× perf gaps on identical benchmarks.",
        terms: ["Meta-Harness","Regression Suite"] },
    ]
  },
  {
    n: "05",
    id: "gateway",
    name: "Model Gateway",
    tagline: "Talks to the underlying LLMs",
    ink: "#C084FC", // ochre
    exec: "A reverse proxy in front of every model provider. Decides which model handles which request, retries when one fails, caches similar answers, strips sensitive data, and stops runaway costs.",
    eng: "Reverse proxy in front of OpenAI, Anthropic, Azure OpenAI, AI Foundry, Bedrock. The single most under-discussed layer in most architecture diagrams.",
    components: [
      { id: "model-route", name: "Multi-Model Routing",
        exec: "Picks the right LLM for the job — a frontier model for hard reasoning, a cheap model for summaries.",
        eng: "Rule-based, complexity-based, or learned routing. Cascade pattern: try cheap first, escalate on low confidence.",
        terms: ["Cascade","Routing"] },
      { id: "fallback", name: "Fallback Chains",
        exec: "When a provider goes down or rate-limits you, requests fail over to a backup automatically.",
        eng: "Configured per route. Triggers on 429/503/timeout. Circuit breaker prevents cascading failures.",
        terms: ["Circuit Breaker","429"] },
      { id: "cache", name: "Semantic Cache",
        exec: "Reuses answers when a similar question has already been asked. Cuts model spend by a third or more.",
        eng: "Embedding similarity over prompts. Reduces token spend 30–50% in chat workloads. Tunable similarity threshold.",
        terms: ["Embedding","Semantic Cache"] },
      { id: "pii", name: "PII Redaction",
        exec: "Strips sensitive personal data before it ever reaches the model — and puts it back on the way out.",
        eng: "Pattern match + ML detection. Reversible token-mapping for round-trip. Configurable per-tenant policies.",
        terms: ["PII","Tokenization"] },
      { id: "cost", name: "Cost Governance",
        exec: "Per-team and per-tenant spending caps. Stops runaway loops automatically before they become an invoice.",
        eng: "Per-agent / per-team / per-tenant quota enforcement. Real-time cost attribution. Hard limits + soft alerts.",
        terms: ["Quota","FinOps"] },
    ]
  },
  {
    n: "06",
    id: "tools",
    name: "Tool & Integration Surface",
    tagline: "How agents act on the world",
    ink: "#E879F9", // indigo
    exec: "The platform's hands. Lets agents read and write across enterprise systems through a clean, governed catalog — and call other agents when their own skills aren't enough.",
    eng: "MCP server + client. API hub for enterprise system catalog. A2A outbound. Code sandbox for safe execution. Computer use as last resort.",
    components: [
      { id: "mcp-server", name: "MCP Server",
        exec: "Exposes the platform's tools so other agents can use them, securely and with rate limits.",
        eng: "ASP.NET Core WebAPI. JWT bearer. Rate limited. Tool definitions versioned alongside handlers.",
        terms: ["MCP","JWT"] },
      { id: "mcp-client", name: "MCP Client",
        exec: "Discovers and consumes external tools so the agent doesn't care where they live.",
        eng: "Discovers and consumes external MCP tools. Converts them to native AITool instances. Agent doesn't know or care where a tool lives.",
        terms: ["MCP","AITool"] },
      { id: "api-hub", name: "API Hub",
        exec: "A catalog of enterprise systems — CRM, ERP, ticketing — that agents can call.",
        eng: "Apigee API Hub or equivalent. OpenAPI-based discovery. Schema-to-tool conversion at registration time.",
        terms: ["Apigee","OpenAPI"] },
      { id: "a2a-out", name: "A2A Outbound",
        exec: "Lets this platform delegate work to other agents on the network.",
        eng: "Reads agent cards. Selects peer by capability fit. Sends task over HTTP. Awaits typed result.",
        terms: ["A2A","Agent Card"] },
      { id: "sandbox", name: "Code Sandbox",
        exec: "A locked-down environment where agents can run code safely — for analysis, transformations, or coding tasks.",
        eng: "Locked-down container or microVM. File system caged. Network restricted. Used for data analysis, transformations, agentic coding.",
        terms: ["microVM","gVisor"] },
      { id: "computer-use", name: "Computer Use",
        exec: "When there's no API, the agent drives a browser like a person would. Used as a last resort because it's fragile.",
        eng: "Playwright or vendor-native (Anthropic Computer Use, OpenAI Operator). Last resort due to DOM fragility.",
        terms: ["Playwright","Computer Use"] },
    ]
  },
  {
    n: "07",
    id: "memory",
    name: "Memory & Knowledge",
    tagline: "What the platform remembers",
    ink: "#F472B6", // teal
    exec: "Without this layer, every conversation starts from zero and the agent can't see your company's data. Splits memory three ways — what happened, what's true, and what works — and grounds answers in real documents.",
    eng: "Three-way split: episodic, semantic, procedural — plus a RAG pipeline. Vector store + knowledge graph for hybrid retrieval.",
    components: [
      { id: "episodic", name: "Episodic Memory",
        exec: "What happened, and when. A time-stamped log of past interactions the agent can refer back to.",
        eng: "Time-indexed interaction log. Bounded buffer with consolidation pathway to semantic store. Mem0 / Letta-style.",
        terms: ["Mem0","Letta"] },
      { id: "semantic", name: "Semantic Memory",
        exec: "Facts and concepts distilled from many past interactions — the agent's working understanding of your business.",
        eng: "Knowledge graph with entity-relation triples. Neo4j or Kuzu backend. Built via LLM extraction with ontology validation.",
        terms: ["Neo4j","Kuzu","Triples"] },
      { id: "procedural", name: "Procedural Memory",
        exec: "Patterns that have proven themselves and become standard procedures — the agent's habits.",
        eng: "Skill files updated by the meta-harness. Implicit (model weights) + explicit (skill markdown). Versioned in git.",
        terms: ["Skill File"] },
      { id: "vector", name: "Vector Store",
        exec: "Lets the agent search documents by meaning rather than exact words.",
        eng: "Azure AI Search, FAISS, Pinecone, Weaviate. Used in hybrid retrieval with sparse / BM25.",
        terms: ["Vector DB","BM25","Hybrid Search"] },
      { id: "kg", name: "Knowledge Graph",
        exec: "Captures relationships — who reports to whom, which product belongs to which line — when the answer depends on connections, not text.",
        eng: "Cognee-inspired. Community detection (Leiden), temporal events, feedback-weighted re-ranking, entity-level provenance.",
        terms: ["Leiden","Cognee","Provenance"] },
      { id: "rag", name: "RAG Pipeline",
        exec: "End-to-end grounding — pulls relevant documents, ranks them, checks them, and cites them in the answer.",
        eng: "Ingestion (chunking, contextual enrichment, RAPTOR). Retrieval (hybrid + RRF). Reranking. CRAG eval. Citation tracking.",
        terms: ["RAG","RAPTOR","RRF","CRAG"] },
    ]
  },
  {
    n: "08",
    id: "state",
    name: "State & Persistence",
    tagline: "Remembering across turns and restarts",
    ink: "#FB7185", // violet
    exec: "Where working state lives, so a restart, disconnect, or hand-off doesn't lose progress. Every agent's current step is checkpointed and resumable.",
    eng: "Persistent state plane. Checkpointed per transition. Idempotent resume. Service registry for discovery.",
    components: [
      { id: "history", name: "Conversation History",
        exec: "A persistent record of every conversation, retrievable by user or thread.",
        eng: "Append-only. Indexed by conversation and user ID. Retention policy per data classification.",
        terms: ["Append-Only"] },
      { id: "agent-state", name: "Agent State",
        exec: "The current step each running agent is on — so it can pick up exactly where it left off.",
        eng: "Workflow state machine. Checkpointed on every transition. Idempotent resume on restart.",
        terms: ["Checkpoint","State Machine"] },
      { id: "registry", name: "Agent Registry",
        exec: "A directory of every known agent — what it can do, where to reach it, and whether it's healthy.",
        eng: "Service registry pattern. Agent cards with capability metadata. Health-checked + latency-tracked.",
        terms: ["Service Registry","Agent Card"] },
      { id: "evals", name: "Eval Store",
        exec: "A time-series of how well each agent has been performing. Backs the regression suite.",
        eng: "Time-series of eval scores per agent and skill. Backs the regression suite and the meta-harness proposer.",
        terms: ["Regression Suite"] },
    ]
  },
  {
    n: "09",
    id: "observability",
    name: "Observability & Evaluation",
    tagline: "Seeing inside the black box",
    ink: "#FBBF24", // amber
    exec: "With non-deterministic systems, you can't guess — you have to see. Traces every request, scores quality, catches drift, and feeds learnings back into the system.",
    eng: "OpenTelemetry traces, Prometheus metrics, LLM-as-judge scoring, drift detection, human review queue, learnings log.",
    components: [
      { id: "tracing", name: "Distributed Tracing",
        exec: "End-to-end request paths across every agent, tool, and model. Like a flight recorder for each conversation.",
        eng: "OpenTelemetry. Spans on Microsoft.Extensions.AI, Semantic Kernel, Azure.AI.OpenAI. Custom processor enriches with agent context.",
        terms: ["OpenTelemetry","Span"] },
      { id: "metrics", name: "Metrics",
        exec: "Latency, token usage, cost per turn, success rate — rolled up by agent and by tenant.",
        eng: "Prometheus. Latency p50/p95/p99. Tokens in/out. Cost per turn. Success rate. Per-agent cardinality.",
        terms: ["Prometheus","p99"] },
      { id: "judge", name: "LLM-as-Judge",
        exec: "Automated quality scoring when the right answer isn't a fixed string — a second model grades the first.",
        eng: "Secondary model evaluates against rubrics. Calibrated against a human-rated golden set. Disagreement triggers human review.",
        terms: ["LLM-as-Judge","Rubric"] },
      { id: "human-review", name: "Human Review",
        exec: "An expert review queue for the cases the system can't grade itself. Their feedback flows back into the eval suite.",
        eng: "Subject-matter expert annotation queue. Structured feedback schema. Dataset curation. Hard examples → eval suite.",
        terms: ["Annotation Queue"] },
      { id: "drift", name: "Drift Detection",
        exec: "Catches when the system starts behaving differently — often the first sign of a model update or prompt regression.",
        eng: "Statistical comparison of output distributions over time. Alerts on significant divergence (KS test, KL divergence).",
        terms: ["Drift","KL Divergence"] },
      { id: "learnings", name: "Learnings Log",
        exec: "A persistent record of what worked, so the system stops re-trying ideas that already failed.",
        eng: "Markdown log fed back into the meta-harness proposer so failed hypotheses don't get re-attempted.",
        terms: ["Meta-Harness"] },
    ]
  },
  {
    n: "10",
    id: "governance",
    name: "Governance & Control",
    tagline: "Keeping agents safe and accountable",
    ink: "#F87171", // signal red
    exec: "What turns a demo into something Legal, Risk, and Compliance will sign off on. Real-time safety checks, tamper-evident audit trail, human escalation paths, and reporting mapped to regulation.",
    eng: "Runtime guardrails (input/output filters), tamper-evident audit log, human escalation tree, autonomy tiering, compliance report generation against ISO 42001 / NIST AI RMF / EU AI Act.",
    components: [
      { id: "guardrails", name: "Runtime Guardrails",
        exec: "Real-time safety checks on every input and output — blocking prompt injection, leaking PII, or toxic content.",
        eng: "Input filter (prompt injection, PII), output filter (toxicity, leakage). Llama Guard, Azure Content Safety, or custom.",
        terms: ["Llama Guard","Prompt Injection"] },
      { id: "audit", name: "Audit Log",
        exec: "A tamper-evident record of who did what, when, and why — required by SOX, HIPAA, GDPR.",
        eng: "Append-only. Cryptographically chained (hash-linked). Retention per regulation (SOX, HIPAA, GDPR).",
        terms: ["Hash Chain","SOX","HIPAA","GDPR"] },
      { id: "escalation", name: "Human Escalation",
        exec: "Built-in handoff points where the agent stops and asks a person — calibrated to the risk of the action.",
        eng: "Decision tree. Risk-tier classification per action. Async handoff with full context envelope to a human queue.",
        terms: ["Escalation"] },
      { id: "tiers", name: "Autonomy Tiers",
        exec: "Levels of agent independence: observe, suggest, act with approval, act autonomously. Move down on uncertainty, up with proven track record.",
        eng: "Tier-down on uncertainty signals. Tier-up gated by positive eval history + human sign-off. Per-action tier override.",
        terms: ["Autonomy Tier"] },
      { id: "compliance", name: "Compliance Reporting",
        exec: "Pre-built reports mapped to ISO 42001, NIST AI RMF, and the EU AI Act, generated from the audit log.",
        eng: "Pre-built mappings to ISO/IEC 42001, NIST AI RMF, EU AI Act control sets. Scheduled exports from audit log + eval store.",
        terms: ["ISO 42001","NIST AI RMF","EU AI Act"] },
    ]
  },
];

const PATTERNS = [
  {
    id: "supervisor",
    name: "Supervisor",
    summary: "One coordinator agent decomposes the goal, delegates subtasks to specialists, and synthesizes their results before responding.",

    // Long-form description — the "what & why"
    description: "The classic multi-agent topology. A single supervisor agent owns the conversation with the user and the global plan. It hands work to narrow specialists (a 'search agent', a 'code agent', a 'compliance agent') and stitches their answers back together. Crucially, only the supervisor has the user-facing context; specialists see just enough to do their job.",

    // When does this win
    bestFor: [
      "Multi-domain workflows where one request touches several systems (auth + records + payments + audit).",
      "Cases where reasoning transparency matters more than raw latency — the supervisor's plan is auditable.",
      "Mid-complexity teams (3–8 specialists). The supervisor's context window is the ceiling.",
      "Products where the user expects a single coherent voice answering them.",
    ],

    // When this loses
    avoidWhen: [
      "Massive parallel fan-out — supervisor becomes the bottleneck.",
      "Tasks where specialists need to negotiate among themselves (use Swarm).",
      "Latency-critical sub-second flows — every hop through the supervisor costs a turn.",
    ],

    // The anatomy of one turn
    flow: [
      "User message arrives at supervisor.",
      "Supervisor builds a plan — sometimes explicitly (Plan-Solve), sometimes via tool-call reasoning.",
      "Supervisor dispatches subtasks to specialists, in parallel where possible.",
      "Specialists return structured results (and any tool side-effects).",
      "Supervisor reconciles, resolves conflicts, and composes the user-facing reply.",
    ],

    // What scales / breaks
    scaling: "Throughput is bounded by the supervisor's context budget and reasoning latency. Most production teams cap at ~6 specialists per supervisor before splitting into Hierarchical.",
    failureMode: "If the supervisor hallucinates a plan, every specialist works on the wrong thing in parallel — failure is correlated, not isolated. Mitigations: plan-validation step, strong eval on the supervisor's planning prompt, hard step caps.",

    // Concrete example walked through
    example: "“Pay off my car loan from savings.” The supervisor decomposes into: (1) Auth specialist verifies user, (2) Banking specialist checks both balances, (3) Transactions specialist initiates transfer, (4) Notification specialist confirms to user, (5) Audit specialist writes a signed event. The supervisor sequences and presents one clean confirmation.",

    // Implementations in the wild
    inTheWild: [
      "Anthropic claude-code (Claude as supervisor delegating to subagents)",
      "OpenAI Assistants v2 with tool-use",
      "LangGraph 'supervisor' template",
      "Microsoft Semantic Kernel Planner",
    ],

    // Stack you'd actually pick
    stack: ["LangGraph", "AutoGen", "OpenAI Assistants v2", "Anthropic claude-agent-sdk", "Semantic Kernel"],

    // Vital stats for the chart strip
    stats: { latency: "Medium", parallelism: "Medium", traceability: "High", complexity: "Low" },
  },

  {
    id: "pipeline",
    name: "Pipeline",
    summary: "Sequential stages — each agent's output is the next agent's input. No backwards branches, no central coordinator.",

    description: "The most predictable topology. Work flows left-to-right through fixed stages, each owned by a specialist. There is no central planner; the pipeline shape itself is the plan. Perfect when you know the steps in advance and want each to be independently scalable, replaceable, and observable.",

    bestFor: [
      "Document workflows: extract → classify → summarize → rewrite → publish.",
      "ETL-style data work where each stage has a clean input/output schema.",
      "Compliance-heavy flows where each stage needs its own approval gate.",
      "Anywhere the steps are fixed for months at a time and the value is in reliability, not flexibility.",
    ],

    avoidWhen: [
      "Open-ended exploratory tasks — there's no fixed sequence to encode.",
      "Workflows that need branching or loops based on intermediate results (use Supervisor).",
      "Sub-second user-facing turns — pipeline latency is cumulative.",
    ],

    flow: [
      "Stage 1 receives the request, transforms it, emits a typed payload.",
      "Stage 2 receives stage 1's output (and only that), transforms, emits.",
      "Each stage validates its input against a schema before doing work.",
      "Stages are deployed independently and can scale horizontally per-stage.",
      "A failed stage halts the pipeline; checkpoints let you resume from the last good stage.",
    ],

    scaling: "Linearly with the slowest stage — Amdahl applies. Add capacity to whichever stage hits queue depth first. Most production pipelines run each stage as its own service with its own SLO.",
    failureMode: "One slow or flaky stage holds up everything behind it. The classic anti-pattern is 'one stage with a 30-second LLM call gating a thousand QPS upstream'. Use queues + back-pressure between stages, not direct calls.",

    example: "Loan application: (1) OCR & extract uploaded docs → (2) Identity & sanctions check → (3) Income verification against payroll APIs → (4) Risk model produces score → (5) Decision agent applies policy & generates customer letter. Each stage has its own owner, eval, and rollback story.",

    inTheWild: [
      "Most enterprise document AI (Hebbia, Harvey, Glean ingestion)",
      "ETL platforms with LLM steps (dbt + AI, Airbyte AI)",
      "Inngest / Temporal-driven content generation pipelines",
    ],

    stack: ["Temporal", "Inngest", "AWS Step Functions", "Airflow + LLM operators", "Prefect", "Dagster"],

    stats: { latency: "High (cumulative)", parallelism: "Per-stage", traceability: "High", complexity: "Low" },
  },

  {
    id: "swarm",
    name: "Swarm",
    summary: "Peer-to-peer hand-offs with no central authority. Agents pass control to each other based on local context.",

    description: "The decentralized topology. There is no supervisor — each agent decides whether it can handle the current state, and if not, hands off to another agent it knows about. Closer in spirit to the actor model than to a traditional workflow. Best when you need genuine parallelism and the routing logic can be co-located with each agent.",

    description2: "Two main flavors: (a) hand-off swarms where one agent runs at a time and explicitly transfers control (OpenAI Swarm), and (b) parallel swarms where many agents work simultaneously and converge results (research-agent farms).",

    bestFor: [
      "Embarrassingly-parallel research and search — twenty agents each pursuing different sources.",
      "Customer support routing where the right specialist is the one closest to the question.",
      "Systems where agents are owned by different teams and you don't want a central choke point.",
      "Cost-sensitive workloads — small models route, only the right specialist invokes the expensive one.",
    ],

    avoidWhen: [
      "Workflows that need a single auditable plan — swarm decisions are distributed and hard to summarize.",
      "Cases where consistency between agents matters (multiple agents writing to the same record).",
      "Compliance contexts that require one named decision-maker per outcome.",
    ],

    flow: [
      "Agent A receives a request. Decides if it's the right handler.",
      "If not, A hands off to agent B — passing along just the context B needs.",
      "B may further hand off, run in parallel with C, or handle and respond.",
      "When all agents are done, results converge — usually via a thin aggregator, not a supervisor.",
      "Each hand-off is logged so the path can be reconstructed post-hoc.",
    ],

    scaling: "Genuinely horizontal — add agents and the system absorbs more load. But the routing graph density grows quadratically; past ~15 agents you almost always want Hierarchical instead.",
    failureMode: "The 'lost packet' problem: if agent A hands off to B and B silently fails, no one is responsible. Mitigations: every hand-off is a checkpoint; aggregator times out and surfaces 'agent X never returned'.",

    example: "Twenty research agents kicked off in parallel — one searches academic sources, one combs press releases, one scrapes pricing pages, one queries the CRM, etc. Each writes findings to a shared scratchpad. A thin synthesis agent at the end de-duplicates, ranks, and assembles the briefing.",

    inTheWild: [
      "OpenAI Swarm (hand-off pattern)",
      "AutoGen GroupChat (negotiation flavor)",
      "GPT-Researcher style multi-agent search",
      "Salesforce Agentforce skill routing",
    ],

    stack: ["OpenAI Swarm", "AutoGen", "CrewAI hierarchical-off", "LangGraph parallel", "Custom + Kafka"],

    stats: { latency: "Low (parallel)", parallelism: "Very high", traceability: "Low", complexity: "Medium" },
  },

  {
    id: "hierarchical",
    name: "Hierarchical",
    summary: "Multiple supervisors, each running a small team — with a top-level coordinator over them.",

    description: "What you graduate to once a single Supervisor stops fitting in one context window. Domain supervisors (Sales, Support, Finance, IT) each manage a few specialists. A thin top-level coordinator routes user requests to the right supervisor and handles cross-domain stitching. Each level of the tree gets its own observability and policy stack.",

    bestFor: [
      "Enterprise scale — 15+ agents across multiple domains.",
      "Organizations where domain ownership is real (the Sales team owns Sales agents).",
      "Workflows that occasionally cross domains but mostly stay within one.",
      "Anywhere you need different policies / SLAs / compliance posture per domain.",
    ],

    avoidWhen: [
      "Small systems — the coordination tax isn't worth it under ~10 agents.",
      "Tightly-coupled workflows where every domain talks to every other constantly (use Swarm).",
      "Startups that haven't yet hit the limits of a flat Supervisor.",
    ],

    flow: [
      "User request hits the top-level coordinator.",
      "Coordinator classifies the request and routes to one (or more) domain supervisors.",
      "Each domain supervisor runs its own Supervisor pattern internally.",
      "Domain supervisors return synthesized answers up to the coordinator.",
      "Coordinator stitches cross-domain results and replies — one voice, many teams underneath.",
    ],

    scaling: "Adds layers, not breadth. The first split (flat → 2 levels) is dramatic; further depth (3+ levels) usually creates more confusion than it resolves. Most production hierarchies stop at 2 levels.",
    failureMode: "Coordination overhead and 'the answer is up two levels' debugging. A bad coordinator becomes a system-wide bottleneck — every request goes through it. Mitigations: coordinator-level caching, strict timeouts on each level, full-trace observability across the tree.",

    example: "A bank's customer-facing agent platform: top-level coordinator routes to Banking Supervisor (4 specialists: accounts, transfers, cards, statements), Lending Supervisor (3: applications, payoff, hardship), and Wealth Supervisor (3: portfolio, advice, transactions). Cross-domain requests like 'pay off my loan from my brokerage' are handled by the coordinator stitching answers from Lending + Wealth.",

    inTheWild: [
      "Most enterprise agent platforms past pilot stage",
      "Salesforce Agentforce (domain Topics + cross-domain orchestration)",
      "ServiceNow Now Assist multi-domain",
      "Microsoft Copilot Studio multi-bot routing",
    ],

    stack: ["LangGraph (multi-graph)", "CrewAI hierarchical", "Microsoft Semantic Kernel", "Custom + A2A protocol", "Temporal + per-team workers"],

    stats: { latency: "Medium-High", parallelism: "High", traceability: "Medium", complexity: "High" },
  },
];

// Workflow steps reference layer.id + component.id.
const WORKFLOW = [
  { layer: "surface", comp: "chat-ui", title: "User submits request",
    exec: "The streaming chat captures the message and forwards a typed envelope to identity.",
    eng: "Streaming chat captures the message; serializes a typed RequestEnvelope { user, channel, payload, traceId } and forwards to identity.",
    envelope: { traceId: "01HF…9KX", channel: "chat", user: "u_482", payload: "Pay off my car loan from savings" } },
  { layer: "identity", comp: "sso", title: "Authenticate the human",
    exec: "OAuth verifies who the user is; conditional access checks device posture.",
    eng: "OIDC token validated. Conditional access evaluates device posture, location, risk score. User claims attached.",
    envelope: { auth: { method: "OIDC", sub: "u_482", aud: "agent-platform", deviceTrust: "compliant" } } },
  { layer: "identity", comp: "agent-id", title: "Mint agent credentials",
    exec: "A scoped, short-lived token is issued for this specific request and skill set.",
    eng: "Workload identity issues per-turn token. TTL=12m, scope=[balances.read, transactions.write]. Bound to traceId.",
    envelope: { agentToken: { ttl: "12m", scopes: ["balances.read","transactions.write"], spiffe: "spiffe://acme/agent/finance" } } },
  { layer: "governance", comp: "guardrails", title: "Input safety check",
    exec: "Prompt-injection filter and PII detector run before the request enters the runtime.",
    eng: "Llama-Guard input pass. Prompt-injection classifier (score 0.03). PII detector flags 'car loan' as benign.",
    envelope: { guardrails: { injection: 0.03, pii: [], verdict: "pass" } } },
  { layer: "orchestration", comp: "classifier", title: "Classify intent",
    exec: "A lightweight model decides this is a knowledge-and-action request, not a simple Q&A.",
    eng: "Intent classifier → 'transactional/finance'. Confidence 0.91. Routes to finance supervisor lane.",
    envelope: { intent: "transactional/finance", confidence: 0.91 } },
  { layer: "orchestration", comp: "planner", title: "Decompose into subtasks",
    exec: "The planner outputs a task graph: retrieve context → reason → act → confirm.",
    eng: "Plan-and-execute emits DAG: [fetch_balances, fetch_loan, validate_funds, transfer, log_audit, confirm].",
    envelope: { plan: ["fetch_balances","fetch_loan","validate_funds","transfer","log_audit","confirm"] } },
  { layer: "runtime", comp: "supervisor", title: "Supervisor takes the plan",
    exec: "The supervisor delegates retrieval and action subtasks to specialists.",
    eng: "Supervisor agent loads plan; delegates fetch_* to BalanceAgent, transfer to PaymentsAgent via A2A.",
    envelope: { delegations: [{ to: "BalanceAgent", task: "fetch_balances" }, { to: "PaymentsAgent", task: "transfer" }] } },
  { layer: "memory", comp: "rag", title: "Retrieve grounding context",
    exec: "Pulls relevant documents from the vector store and graph.",
    eng: "Hybrid retrieval (BM25 + dense), RRF fusion, reranker top-k=8, CRAG eval=0.86. Citations attached.",
    envelope: { retrieval: { k: 8, crag: 0.86, citations: ["loan-agmt-2024.pdf#p3","savings-tos.pdf#p7"] } } },
  { layer: "gateway", comp: "model-route", title: "Pick the right model",
    exec: "Routes to a frontier model for reasoning, a cheap model for summarization.",
    eng: "Cascade: Claude Sonnet for reasoning ($), Haiku for summarize ($¢). Cache miss. Cost budget OK.",
    envelope: { models: { reason: "claude-sonnet-4.5", summarize: "claude-haiku-4.5" }, cacheHit: false } },
  { layer: "tools", comp: "mcp-client", title: "Call enterprise tool",
    exec: "The agent invokes an MCP-exposed tool to read or update a backend system.",
    eng: "MCP tool transfer_funds invoked: from=acct_savings_8821, to=loan_acct_4471, amount=18420.00.",
    envelope: { tool: "transfer_funds", args: { from: "acct_savings_8821", to: "loan_acct_4471", amount: 18420.00 }, result: "queued" } },
  { layer: "observability", comp: "tracing", title: "Spans recorded",
    exec: "Every step above emitted an OpenTelemetry span; the trace is now navigable end-to-end.",
    eng: "11 spans emitted. Root: agent.turn. Children: identity.*, planner, retrieval, gateway, tool.transfer_funds.",
    envelope: { trace: { spans: 11, durationMs: 4280, root: "agent.turn" } } },
  { layer: "governance", comp: "audit", title: "Audit log written",
    exec: "A tamper-evident record of who acted, when, on what, and with which permissions.",
    eng: "Hash-chained entry: actor=u_482, agent=spiffe://acme/agent/finance, action=transfer_funds, prevHash=…ab3, hash=…7c1.",
    envelope: { audit: { actor: "u_482", action: "transfer_funds", hash: "…7c1", prev: "…ab3" } } },
  { layer: "observability", comp: "judge", title: "Quality scored",
    exec: "A secondary model rates the response against the rubric; flagged for review if it scores low.",
    eng: "Judge: groundedness=0.94, completeness=0.88, safety=1.00. Above thresholds. No human review needed.",
    envelope: { judge: { groundedness: 0.94, completeness: 0.88, safety: 1.00 } } },
  { layer: "surface", comp: "chat-ui", title: "Stream response",
    exec: "The final answer streams back to the user with citations.",
    eng: "Streamed tokens to client. Citations rendered inline. traceId surfaced for support handoff.",
    envelope: { response: "Transferred $18,420.00 from savings to your auto-loan. Confirmation #PAY-7741.", citations: 2, traceId: "01HF…9KX" } },
];

window.LAYERS = LAYERS;
window.PATTERNS = PATTERNS;
window.WORKFLOW = WORKFLOW;
