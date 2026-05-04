import type { CompEnrichment } from "./types";
import { LAYERS } from "./layers";

const COMP_ENRICHMENT: Record<string, CompEnrichment> = {
  // ── 01 User Surface ─────────────────────────────────────────
  "chat-ui": {
    what: "A streaming chat panel embedded in your product. Users type or speak; tokens stream back as the model generates them, with citations and tool calls rendered inline.",
    why: "It is the highest-bandwidth way for users to express intent and the highest-bandwidth way for agents to show their work. Done well, it replaces dozens of forms and dashboards with one conversation.",
    tech: ["Vercel AI SDK", "Microsoft Copilot Studio", "LangChain Chat UI Kit", "Custom React + SSE", "Streamlit (internal tools)", "Slack / Teams app shells", "Chainlit", "Gradio ChatInterface", "assistant-ui (shadcn)"],
  },
  "voice": {
    what: "Real-time spoken dialogue. Audio in, audio out, low enough latency that the conversation feels natural — under ~600ms round trip end to end.",
    why: "Voice unlocks hands-free contexts (driving, cooking, field ops) and call-center deflection. It also exposes interruption handling and emotional tone, which most chat UIs ignore.",
    tech: ["OpenAI Realtime API", "Deepgram + ElevenLabs", "Whisper + Coqui TTS", "LiveKit Agents", "Azure Speech Services", "Twilio Voice Intelligence", "Vapi", "Retell AI", "Pipecat"],
  },
  "copilot": {
    what: "An assistant pane that lives inside another product (Salesforce, ServiceNow, Excel, VS Code) without rebuilding the host. It reads context from the host and writes back actions.",
    why: "Users do not switch tools — agents come to where work already happens. Adoption multiplies because there is no new app to learn, and the agent inherits the host's permissions.",
    tech: ["Microsoft Copilot Extensibility", "Salesforce Einstein Copilot", "ServiceNow Now Assist", "Chrome Extension + postMessage", "VS Code Extension API", "Office Add-ins", "Glean Assistant", "Slack Bolt", "CopilotKit"],
  },
  "api": {
    what: "Programmatic endpoints other systems call directly — backend pipelines, partner integrations, workflow engines that need agent capabilities without a chat UI.",
    why: "Most enterprise value comes from agents triggered by events, not humans. The API surface is also the contract that lets you swap models, frameworks, or vendors underneath without changing callers.",
    tech: ["FastAPI / ASP.NET", "AWS API Gateway", "GraphQL Mesh", "tRPC", "Apollo Federation", "Postman / Stoplight (spec)", "Kong Gateway", "Hono", "Encore"],
  },
  "a2a-in": {
    what: "An open protocol endpoint where other autonomous agents discover this platform's capabilities and delegate tasks to it.",
    why: "As agents proliferate, no single vendor will own the whole stack. Standards like A2A let your agent be a capability inside someone else's workflow — and vice versa — without bespoke integrations.",
    tech: ["A2A Protocol (Anthropic / Google)", "Agent Connect Protocol", "MCP server (read-mode)", "OpenAI Agent Builder", "AutoGen Studio", "AGNTCY", "LangGraph Cloud", "Vellum Agents"],
  },

  // ── 02 Identity & Trust ─────────────────────────────────────
  "sso": {
    what: "The corporate front door — confirms the human is who they say they are, using your existing identity provider, and decides whether they should be let in at all.",
    why: "Without it, you cannot apply per-user policy, audit who triggered what, or comply with anything. Conditional access (device posture, geo, risk score) also lives here and stops most account-takeover attacks.",
    tech: ["Azure AD / Entra ID", "Okta", "Auth0", "Ping Identity", "Keycloak", "AWS Cognito", "Passkeys (WebAuthn)", "WorkOS", "Clerk", "Stytch"],
  },
  "agent-id": {
    what: "A separate, machine identity for every agent — distinct from the human who invoked it. The agent signs its own actions and shows up as itself in audit logs.",
    why: "Without agent identity, you cannot tell whether the user did something or the agent did it on their behalf. You also cannot revoke a misbehaving agent without revoking the user, which is a non-starter.",
    tech: ["SPIFFE / SPIRE", "HashiCorp Vault Workload Identity", "AWS IAM Roles for Service Accounts", "Azure Managed Identity", "Google Workload Identity Federation", "Aembit", "Astrix Security", "Teleport Workload Identity"],
  },
  "scoped-creds": {
    what: "Short-lived credentials issued just-in-time for a specific task, with permissions trimmed to exactly what that task needs and nothing more.",
    why: "Long-lived service accounts are the largest blast radius in most breaches. JIT scoping means a compromised agent token is useful for minutes, not months, and only for the narrow scope it was issued.",
    tech: ["HashiCorp Vault", "AWS STS AssumeRole", "Azure Key Vault + Managed Identity", "Teleport", "Boundary (HashiCorp)", "GCP Service Account Impersonation", "Doppler", "1Password Secrets Automation", "Infisical"],
  },
  "policy": {
    what: "A central engine that evaluates 'is this allowed?' for every action — independent of the calling agent's code, expressed as policies-as-data.",
    why: "Agents will try things you didn't predict. Centralized policy lets you change rules without redeploying agents, and gives auditors one place to read 'what is allowed here'.",
    tech: ["Open Policy Agent (OPA)", "AWS Cedar", "Oso", "Styra DAS", "Casbin", "AuthZed / SpiceDB (relational)", "Permit.io", "Cerbos", "OpenFGA"],
  },

  // ── 03 Orchestration ────────────────────────────────────────
  "router": {
    what: "The first decision point inside the platform — looks at the request and decides which model, agent, or workflow handles it.",
    why: "Sending every request to GPT-5 is slow and expensive. Cheap classifiers can route 80% of traffic to small fast models and reserve frontier models for what actually needs them — often 5–10× cost savings.",
    tech: ["NotDiamond", "Martian Router", "OpenRouter", "Custom embedding classifier", "RouteLLM (LMSYS)", "LiteLLM Router", "Unify AI", "Portkey Conditional Routing", "Anyscale Endpoints"],
  },
  "planner": {
    what: "Decomposes a goal into a plan — an ordered or parallel set of subtasks — before any execution starts.",
    why: "Planning separately from execution lets you validate the approach (sometimes with a human) before spending tool calls. It also enables retry on a single step instead of re-running the whole task.",
    tech: ["LangGraph", "AutoGen", "CrewAI", "OpenAI Swarm", "Microsoft Semantic Kernel Planner", "Plan-and-Solve prompting", "DSPy", "Pydantic AI", "Mastra"],
  },
  "delegator": {
    what: "Hands subtasks to specialist sub-agents that each have a narrow scope, their own tools, and their own memory.",
    why: "Single mega-agents collapse under context-window pressure and tool ambiguity. Delegation keeps each agent focused, makes failure isolated, and lets specialists be swapped or upgraded independently.",
    tech: ["LangGraph supervisor pattern", "AutoGen GroupChat", "CrewAI hierarchical", "OpenAI Assistants v2", "Anthropic claude-code subagents", "Magentic-One", "Agency Swarm", "Squad (Letta)"],
  },
  "turn-loop": {
    what: "The runtime loop that drives one round-trip of an agent — assemble context, call the model, parse output, run any tools, decide whether to loop again.",
    why: "This is where most production failures happen — infinite loops, cost runaways, partial state. A well-designed turn loop has hard step caps, cost ceilings, and clean checkpoints between iterations.",
    tech: ["LangGraph StateGraph", "Anthropic claude-agent-sdk", "OpenAI Assistants run loop", "Mastra Agents", "DSPy Modules", "Pydantic AI", "Atomic Agents", "Smol Agents (HuggingFace)"],
  },

  // ── 04 Runtime ──────────────────────────────────────────────
  "skills": {
    what: "Discrete, declarative capabilities an agent can pick up — typically a markdown file plus optional code — that describe what the skill does, when to use it, and any tools it needs.",
    why: "Skills are how you scale capability without scaling the prompt. The agent only loads skills relevant to the current task, keeping the context small and the behaviour predictable.",
    tech: ["Anthropic SKILL.md (Claude Skills)", "OpenAI Custom GPTs", "LangChain Tools registry", "Microsoft Skills SDK", "Genkit Tools", "Composio", "Arcade.dev", "Toolhouse"],
  },
  "context-mgmt": {
    what: "The discipline of deciding what information the model sees on each turn — relevant memory, recent history, retrieved docs — and what to leave out.",
    why: "Context windows are a budget, not a free lunch. Stuffing everything causes attention dilution and hallucination. Smart context management is often the single largest quality lever you have.",
    tech: ["LlamaIndex", "LangChain Memory", "Mem0", "Letta (MemGPT)", "Custom RAG pipelines", "Anthropic Memory Tool", "Zep", "Cognee", "EmbedChain"],
  },
  "self-improve": {
    what: "A loop where the agent (or a meta-agent) reviews its own outputs, identifies failure patterns, and updates prompts, skills, or routing rules accordingly.",
    why: "Production agents drift as inputs change. Building a feedback loop into the runtime means the system gets better over time without engineers manually tuning prompts every week.",
    tech: ["DSPy (prompt optimization)", "TextGrad", "Anthropic prompt-improver tool", "LangSmith Auto-Evals", "Custom regression suites", "Adaline", "PromptLayer Evolution", "OpenAI Reinforcement Fine-Tuning"],
  },
  "fallbacks": {
    what: "What happens when the primary model is down, slow, rate-limited, or hallucinating — alternate models, cached answers, escalation to humans, or graceful degradation.",
    why: "Frontier models have outages. Without fallbacks, your agent stops working whenever Anthropic or OpenAI has a bad afternoon. Cascade strategies also save money on confident easy queries.",
    tech: ["LiteLLM fallback chains", "Portkey", "Helicone Vault", "Custom circuit breakers", "Multi-provider routing (OpenRouter)", "Cloudflare AI Gateway", "Kong AI Gateway", "Martian"],
  },

  // ── 05 Model Gateway ───────────────────────────────────────
  "providers": {
    what: "The abstraction layer over Anthropic, OpenAI, Google, and self-hosted models — one API your agents call, many providers underneath.",
    why: "Locking into a single provider is a procurement and risk problem. A gateway lets you A/B models, route by cost, fail over on outages, and negotiate from a position of strength.",
    tech: ["LiteLLM", "Portkey", "Helicone", "OpenRouter", "Vercel AI SDK", "AWS Bedrock", "Azure AI Foundry", "Cloudflare AI Gateway", "Google Vertex AI", "Together AI"],
  },
  "embed": {
    what: "Models that turn text (or images, code, audio) into dense vectors so you can compare meaning, not just keywords.",
    why: "Embeddings power semantic search, deduplication, clustering, and similarity-based caching — every modern memory and retrieval system depends on them.",
    tech: ["OpenAI text-embedding-3", "Voyage AI", "Cohere Embed", "BAAI BGE (open)", "Nomic Embed", "Sentence Transformers", "Jina Embeddings", "Mistral Embed", "Google Vertex Embeddings"],
  },
  "cache": {
    what: "A cache that returns previously-computed responses for semantically-similar requests, not just byte-identical ones.",
    why: "30–60% of production traffic is variations of the same handful of questions. Semantic caching cuts cost and latency dramatically for high-traffic agents — sometimes paying for the rest of the platform.",
    tech: ["Redis Vector + LangChain", "GPTCache", "Helicone Cache", "Portkey Cache", "Upstash Vector", "Anthropic Prompt Caching", "OpenAI Prompt Caching", "Momento Cache"],
  },
  "redact": {
    what: "Strips or replaces sensitive values (PII, secrets, payment data) before they reach a model — and re-injects real values into responses if needed.",
    why: "Most enterprise blockers are data-governance worries. Redaction at the gateway is a hard line that satisfies GDPR, HIPAA, and SOC2 reviewers without restricting what agents can do conceptually.",
    tech: ["Microsoft Presidio", "Skyflow Privacy Vault", "Tonic.ai", "BigID", "AWS Macie + custom Lambda", "Nightfall AI", "Private AI", "Protecto", "Lasso Security"],
  },
  "budgets": {
    what: "Spending and rate limits per tenant, per agent, per skill — with alerts when something is burning money faster than expected.",
    why: "Agents can cost $10k/day if a loop goes wrong. Hard budgets are the difference between 'someone notices on Monday' and 'CFO calls on Tuesday morning'. Non-negotiable in production.",
    tech: ["Helicone Limits", "Portkey Budgets", "Datadog Cost Insights", "Vantage / Cloudability", "Custom token meter + Stripe", "Langfuse Costs", "Honeycomb", "OpenMeter"],
  },

  // ── 06 Tool Surface ─────────────────────────────────────────
  "tool-registry": {
    what: "A central directory of every tool an agent can call — its schema, owner, permissions, and current health.",
    why: "Without one, every agent re-implements the same tools and no one can answer 'who has access to what'. The registry is also where you enforce policy: a tool that isn't registered cannot be called.",
    tech: ["Anthropic MCP Servers", "OpenAI Function Registry", "Microsoft AITool", "LangChain Tools", "Custom Tool API + GitOps", "Composio", "Arcade.dev", "Toolhouse"],
  },
  "mcp": {
    what: "Model Context Protocol — an open standard for connecting agents to tools and data sources, with capability discovery built in.",
    why: "MCP is becoming the USB-C of agent tools. Adopting it means any new model can use your existing tools, and any new tool you build is immediately usable across providers.",
    tech: ["Anthropic MCP (reference)", "Cloudflare MCP", "AWS MCP servers", "MCP-Bridge", "FastMCP (Python)", "official SDKs (TS / Python / Go)", "Pulse MCP", "MCP.so registry", "Smithery"],
  },
  "api-bridge": {
    what: "A wrapper that converts existing REST/GraphQL APIs into agent-callable tools — typically auto-generated from an OpenAPI spec.",
    why: "Most enterprises have hundreds of APIs already. The bridge is faster than rewriting them as MCP servers and lets you start using existing infrastructure on day one.",
    tech: ["Apigee", "Kong AI Gateway", "Zuplo", "OpenAPI-to-tool generators", "n8n", "Pipedream", "Zapier Agents", "Composio", "Workato", "Tray.io"],
  },
  "computer-use": {
    what: "An agent that drives a browser or desktop GUI directly — clicking, typing, scrolling — for systems that have no API.",
    why: "20% of enterprise workflows live in apps that will never get an API. Computer use is the only way to automate them — and the only way to bring legacy SaaS into the agent era without vendor cooperation.",
    tech: ["Anthropic Computer Use", "Browserbase", "Playwright + agent harness", "Skyvern", "Stagehand (Browserbase)", "OpenAI Operator", "Multion", "BrowserUse", "Hyperbrowser"],
  },
  "code-sandbox": {
    what: "An isolated environment where agents can write and execute code — scripts, data analysis, generated UIs — without touching your real systems.",
    why: "Letting an LLM `eval` on production is unsafe. A sandbox gives you the power of code execution with a hard isolation boundary, which most regulators will actually accept.",
    tech: ["Modal", "E2B", "Daytona", "AWS Firecracker (microVM)", "gVisor containers", "Anthropic code execution tool", "Cloudflare Workers", "Riza", "CodeSandbox SDK", "Northflank Sandboxes"],
  },

  // ── 07 Memory & Knowledge ───────────────────────────────────
  "convo-mem": {
    what: "Short-term memory of the current conversation — recent turns, the user's stated goal, what has been tried so far in this session.",
    why: "Without it, every turn is a goldfish memory and the user has to re-explain the goal repeatedly. With it, agents can pick up where the last turn left off and self-correct mid-conversation.",
    tech: ["LangGraph Checkpointer", "OpenAI Threads", "Anthropic Messages API state", "Mem0 short-term", "Redis + custom", "Zep", "Cognee", "Pinecone Conversational Memory"],
  },
  "long-mem": {
    what: "Memory that survives across sessions — preferences, past decisions, learned facts about the user or organization.",
    why: "Persistent memory is what turns a chatbot into an assistant that 'knows you'. It also accumulates institutional knowledge that would otherwise be re-discovered every conversation.",
    tech: ["Mem0", "Letta (formerly MemGPT)", "Zep", "LangGraph Long-term Store", "Custom + Postgres + pgvector", "Cognee", "MemGPT (research)", "EmbedChain"],
  },
  "knowledge-graph": {
    what: "A structured graph of entities and relationships extracted from your documents — people, products, accounts, and how they connect.",
    why: "Vector search finds similar text but loses structure. Graphs answer questions like 'all contracts signed by this counterparty in 2024' that no embedding can. Most enterprise knowledge is graph-shaped.",
    tech: ["Neo4j", "Kuzu (embedded)", "Microsoft GraphRAG", "Cognee", "TigerGraph", "AWS Neptune", "Memgraph", "ArangoDB", "FalkorDB", "LightRAG"],
  },
  "skill-store": {
    what: "Versioned storage for the skills, prompts, and agent definitions themselves — like a package registry, but for agent capabilities.",
    why: "Skills evolve. Without versioning you cannot roll back a regression, A/B test a new prompt, or audit 'what was the agent doing on March 14?'. GitOps for skills is non-negotiable past prototype stage.",
    tech: ["Anthropic SKILL.md repos", "LangSmith Hub", "PromptLayer", "Humanloop", "Git + custom CI", "Helicone Prompts", "Agenta", "Pezzo", "Mirascope"],
  },
  "vector-store": {
    what: "A database optimized for nearest-neighbor search on embeddings — find the 10 most semantically-similar chunks to a query in milliseconds, even across millions of items.",
    why: "Vector search is the engine of RAG. Without it, agents either hallucinate or scan everything every time. Hybrid search (sparse + dense) is the modern best practice.",
    tech: ["Pinecone", "Weaviate", "Qdrant", "Milvus / Zilliz", "pgvector (Postgres)", "Turbopuffer", "Vespa", "Chroma", "LanceDB", "MongoDB Atlas Vector"],
  },
  "rag": {
    what: "Retrieval-Augmented Generation — pull relevant context from your knowledge stores and inject it into the prompt before generation.",
    why: "It is how you ground models on your data without fine-tuning. Modern RAG (hybrid search, reranking, query rewriting) is the difference between 'demoware' and 'works on real corpus'.",
    tech: ["LlamaIndex", "LangChain RAG", "Cohere Rerank", "Vespa", "RAGAS (eval)", "RAPTOR", "CRAG / corrective RAG", "Vectara", "Haystack", "Ragie"],
  },

  // ── 08 State ────────────────────────────────────────────────
  "event-log": {
    what: "An append-only record of every event in the system — request started, tool called, model responded, error raised — with timestamps and IDs.",
    why: "It is your single source of truth. Every dashboard, replay, audit trail, and post-mortem is derived from this log. If you don't have it, debugging multi-step agents is essentially impossible.",
    tech: ["Apache Kafka", "AWS Kinesis", "Redpanda", "Postgres + jsonb", "ClickHouse", "EventStoreDB", "Confluent Cloud", "WarpStream", "Materialize"],
  },
  "checkpoint": {
    what: "Snapshots of agent state at key moments so a long-running task can pause, fail, and resume from the last good point instead of starting over.",
    why: "Without checkpoints, a 20-step task that fails on step 19 has wasted everything. Checkpointing makes long-horizon agents economical and resilient.",
    tech: ["LangGraph Checkpointer", "Temporal", "AWS Step Functions", "Inngest", "Restate", "Durable Objects (Cloudflare)", "DBOS", "Hatchet", "Trigger.dev"],
  },
  "registry-state": {
    what: "Live information about every agent, skill, and tool currently running — version, health, queue depth, error rate.",
    why: "Operating dozens of agents without a registry is like running microservices without service discovery. You cannot route traffic, drain agents for upgrade, or detect a stuck instance.",
    tech: ["Consul", "etcd", "Kubernetes API", "Nacos", "AWS Service Discovery", "Custom Postgres + heartbeats", "Eureka (Netflix)", "ZooKeeper", "HashiCorp Nomad"],
  },

  // ── 09 Observability ────────────────────────────────────────
  "traces": {
    what: "End-to-end visibility into every step of an agent run — prompts, tool calls, latencies, costs — usually rendered as a flame chart.",
    why: "Agent failures are emergent. Without traces, debugging is reading log files and guessing. With traces, you can see exactly which step blew up and why, in seconds.",
    tech: ["LangSmith", "Langfuse", "Helicone", "Arize Phoenix", "OpenTelemetry GenAI", "Datadog LLM Observability", "Honeycomb", "Traceloop", "New Relic AI Monitoring", "Lunary"],
  },
  "metrics": {
    what: "Aggregate numbers — token spend per tenant, p99 latency, tool error rate, cache hit rate — visible on dashboards and alertable on thresholds.",
    why: "Traces tell you what happened in one run; metrics tell you what's happening across millions. You need both. Metrics are also the input to capacity planning and unit-economics decisions.",
    tech: ["Prometheus + Grafana", "Datadog", "New Relic", "Honeycomb", "Helicone Dashboards", "Custom ClickHouse", "Grafana Cloud", "Dynatrace", "VictoriaMetrics"],
  },
  "evals": {
    what: "Automated quality grading — does the agent's output match the rubric? — run continuously against production traffic and on every prompt change.",
    why: "Vibes-based testing does not survive contact with real users. Evals catch regressions before they ship and give you a defensible 'we measure quality at X' answer for executives.",
    tech: ["LangSmith Evals", "Braintrust", "Inspect (UK AISI)", "RAGAS", "DeepEval", "Promptfoo", "Patronus", "Confident AI", "Galileo", "TruLens"],
  },
  "feedback": {
    what: "Structured channels for users (and reviewers) to flag bad outputs — thumbs, freeform notes, suggested corrections — that flow back into evals and training data.",
    why: "Real user signal is the rarest and most valuable training resource you have. Without a feedback loop, agents stagnate at launch quality. With one, they improve weekly without you doing anything.",
    tech: ["LangSmith Annotation Queues", "Braintrust", "Argilla", "Label Studio", "Humanloop", "Custom thumbs + queue", "Scale Studio", "Surge AI", "Prolific"],
  },
  "drift": {
    what: "Detection of distributional shift — input topics, output styles, tool-use patterns drifting away from baseline — that often signals a brewing problem.",
    why: "Catastrophic agent failures rarely happen overnight; they drift in. Drift monitoring catches the slow slide before users complain — the difference between a heads-up and an outage.",
    tech: ["Arize Phoenix Drift", "Fiddler AI", "WhyLabs", "Evidently AI", "Custom KL-divergence on embeddings", "Aporia", "Galileo Drift", "Datadog ML Monitoring"],
  },

  // ── 10 Governance ──────────────────────────────────────────
  "guardrails": {
    what: "Inline filters on inputs and outputs — block prompt injections, profanity, PII leakage, off-topic requests — applied before the agent acts and before the user sees the response.",
    why: "Agents will be jailbroken; some users will try malicious inputs. Guardrails are the seatbelt: not foolproof, but the difference between a bad day and a viral incident.",
    tech: ["Llama Guard 3 (Meta)", "Anthropic Constitutional Classifiers", "Lakera Guard", "Protect AI Guardian", "NVIDIA NeMo Guardrails", "Aporia Guardrails", "Guardrails AI", "Robust Intelligence", "WhyLabs LangKit"],
  },
  "audit-log": {
    what: "An immutable, signed record of every agent decision and action — who triggered it, what was retrieved, what was sent, what happened — designed to satisfy regulators and forensics.",
    why: "When (not if) something goes wrong, the audit log is what auditors, lawyers, and regulators ask for. Without it, you cannot defend yourself or learn what failed.",
    tech: ["AWS CloudTrail + S3 Object Lock", "Hyperledger / hash chain", "Splunk Audit", "ImmuDB", "Datadog Audit Trail", "Custom append-only Postgres", "Cribl", "Panther", "Elastic Security"],
  },
  "human-loop": {
    what: "Workflow integration that pauses an agent for human approval, escalation, or override on sensitive actions — wires, refunds, customer-facing replies, code merges.",
    why: "Full autonomy is rarely the right starting point. HITL lets you ramp autonomy tier by tier as you build evidence the agent is trustworthy on a class of actions, instead of making a binary bet.",
    tech: ["LangGraph Interrupts", "Inngest Human-in-the-Loop", "Slack approvals", "ServiceNow workflows", "Temporal Signals", "Custom + email", "HumanLayer", "Camunda", "Retool Workflows"],
  },
  "compliance": {
    what: "The mappings, controls, and evidence packs that prove the platform meets external standards — ISO 42001, NIST AI RMF, EU AI Act, SOC 2, HIPAA.",
    why: "Regulated industries cannot adopt without it. Building compliance in from day one is 10× cheaper than retrofitting it once an audit is scheduled.",
    tech: ["Vanta", "Drata", "Tugboat Logic", "OneTrust", "TrustCloud", "Custom + Confluence", "Secureframe", "Sprinto", "AuditBoard"],
  },
  "autonomy": {
    what: "An explicit framework defining how much independence each agent has — observe-only, suggest, act-with-approval, fully-autonomous — and the rules for graduating between tiers.",
    why: "Without explicit tiers, autonomy creeps invisibly and incidents follow. Explicit tiers turn 'is this agent safe to ship?' into a structured question with a structured answer.",
    tech: ["Custom YAML / policy", "Anthropic responsible scaling framework", "OpenAI deployment tiers", "Weights & Biases Launch", "Custom OPA policies", "NIST AI RMF mappings", "EU AI Act compliance frameworks", "ISO 42001 controls"],
  },
};

for (const layer of LAYERS) {
  for (const comp of layer.components) {
    const e = COMP_ENRICHMENT[comp.id];
    if (e) {
      comp.what = e.what;
      comp.why = e.why;
      comp.tech = e.tech;
    }
  }
}

export { COMP_ENRICHMENT };
