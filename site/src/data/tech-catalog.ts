import type { TechEntry } from "./types";

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const RAW: Record<string, Omit<TechEntry, "name">> = {
  // ── Chat & UI frameworks ──────────────────────────────────────
  "Vercel AI SDK": {
    blurb: "TypeScript SDK + React hooks for streaming chat, tool calls, and structured output across most model providers.",
    pros: ["First-class Next.js integration with useChat / streamText", "Provider-agnostic — swap OpenAI/Anthropic/Google with one line", "Generative UI primitives (streaming React components)"],
    cons: ["Tightly coupled to Vercel's edge runtime mental model", "Tool-orchestration is thinner than LangGraph for complex flows", "Breaking changes have been frequent across major versions"],
    best: "Greenfield Next.js or React product surfaces where you want streaming chat shipped in a day, not a week.",
    license: "Apache 2.0",
    maturity: "Production",
  },
  "Microsoft Copilot Studio": {
    blurb: "Low-code agent builder embedded in the Microsoft 365 / Power Platform ecosystem.",
    pros: ["Deep Microsoft 365 + Dataverse integration out of the box", "Non-engineers can ship simple bots", "Inherits enterprise tenancy, DLP, and compliance"],
    cons: ["Locked into Azure / Microsoft graph", "Hard to express genuinely complex multi-agent logic", "Per-message pricing adds up fast at scale"],
    best: "Microsoft-shop enterprises building internal copilots over Outlook, Teams, SharePoint, and Dynamics data.",
    license: "Commercial",
    maturity: "Production",
  },
  "LangChain Chat UI Kit": {
    blurb: "Open-source React components for chat, message lists, tool-call rendering, and trace inspection.",
    pros: ["Free and ejectable", "Plays well with LangGraph runtimes", "Good for internal tools where polish matters less than control"],
    cons: ["Component aesthetics are utilitarian", "Tied to LangChain's mental model", "Less batteries-included than Vercel AI SDK"],
    best: "Internal tools and prototypes built on LangChain/LangGraph where you need a UI fast and don't care about pixel-perfect design.",
    license: "MIT",
    maturity: "Active",
  },
  "Custom React + SSE": {
    blurb: "Roll your own — React components reading from a Server-Sent Events endpoint your backend exposes.",
    pros: ["Total control over UX, state, and rendering", "No SDK lock-in or breaking changes", "Easy to self-host and audit"],
    cons: ["You build (and maintain) every primitive — streaming, tool render, retries, abort", "Reinventing well-trodden ground", "Slower to ship"],
    best: "Teams with strong frontend muscle and unusual UX requirements that off-the-shelf SDKs would constrain.",
    license: "Your code",
    maturity: "Forever",
  },

  // ── Voice ─────────────────────────────────────────────────────
  "OpenAI Realtime API": {
    blurb: "Speech-to-speech model with sub-second latency, function calling, and interruption handling.",
    pros: ["Genuinely low-latency duplex audio (~300ms)", "Function calling over voice", "Single API for STT + LLM + TTS"],
    cons: ["OpenAI lock-in", "Cost scales with audio minutes — pricier than chained pipelines at high volume", "Voice catalog is limited"],
    best: "Voice-first agents where latency matters more than cost or vendor diversity — phone agents, hands-free copilots.",
    license: "Commercial",
    maturity: "GA",
  },
  "Deepgram + ElevenLabs": {
    blurb: "Best-of-breed pairing: Deepgram for streaming ASR, ElevenLabs for low-latency TTS, your model in between.",
    pros: ["Each component is class-leading at its job", "Voice cloning + many languages on ElevenLabs", "Decoupled — swap any layer independently"],
    cons: ["More integration glue (turn detection, barge-in, latency budget)", "Two more vendors in your security review", "Cost can be high if you don't tune"],
    best: "Voice apps that need premium voice quality and accurate transcription, willing to do the integration work.",
    license: "Commercial",
    maturity: "Production",
  },
  "Whisper + Coqui TTS": {
    blurb: "Open-source ASR (Whisper) + open TTS (Coqui XTTS) — fully self-hostable voice stack.",
    pros: ["Free and on-prem capable", "No data leaves your infra", "Whisper is genuinely state-of-the-art for offline ASR"],
    cons: ["Higher latency than commercial offerings", "You operate GPUs and tune VAD / endpointing yourself", "Coqui's commercial entity wound down — community-only now"],
    best: "Privacy-critical or air-gapped deployments where latency tolerance is higher and ops capacity exists.",
    license: "MIT / MPL-2.0",
    maturity: "Mature",
  },
  "LiveKit Agents": {
    blurb: "Open-source real-time voice/video agent framework with built-in turn detection and multi-modal support.",
    pros: ["Plays well with WebRTC for true low-latency phone-grade voice", "Provider-agnostic (use any STT/TTS/LLM)", "Strong open-source momentum"],
    cons: ["Steeper learning curve than turnkey APIs", "WebRTC ops are non-trivial", "Newer — fewer production case studies"],
    best: "Custom voice agents that need WebRTC delivery, multi-party rooms, or video plus voice.",
    license: "Apache 2.0",
    maturity: "Production",
  },

  // ── Identity ──────────────────────────────────────────────────
  "Azure AD / Entra ID": {
    blurb: "Microsoft's enterprise identity platform — SSO, MFA, conditional access, B2B/B2C.",
    pros: ["Default identity for ~80% of enterprises", "Conditional access policies are best-in-class", "Tight integration with Microsoft 365 + GitHub"],
    cons: ["Tenant-and-app model is intricate", "Costly at higher tiers (P1/P2)", "Microsoft-centric"],
    best: "Anyone selling into Microsoft-shop enterprises — or running on Azure.",
    license: "Commercial",
    maturity: "GA",
  },
  "Okta": {
    blurb: "Vendor-neutral enterprise IdP with strong SSO, lifecycle management, and a deep app catalog.",
    pros: ["Neutral — works equally well across cloud providers", "Massive pre-built app integration catalog", "Strong workforce + customer identity story"],
    cons: ["Pricing can be opaque and grows with seats + features", "2022 breach left some scars", "Less native to any one cloud than Entra/Cognito"],
    best: "Multi-cloud or vendor-neutral enterprises that want one identity backbone across SaaS sprawl.",
    license: "Commercial",
    maturity: "GA",
  },
  "Auth0": {
    blurb: "Developer-friendly identity-as-a-service (now part of Okta) — fast to integrate for B2C and B2B SaaS.",
    pros: ["Excellent developer DX, generous free tier", "Strong customer identity (CIAM) features", "Universal Login is genuinely good"],
    cons: ["Enterprise pricing escalates quickly", "Now living under Okta's roadmap", "Customization hits limits"],
    best: "Startups and SaaS products that need login working in an afternoon and won't outgrow the model for years.",
    license: "Commercial",
    maturity: "GA",
  },
  "Keycloak": {
    blurb: "Open-source identity and access management — SSO, OIDC, SAML, fine-grained authz.",
    pros: ["Free and self-hosted", "Standards-compliant (OIDC/SAML/OAuth2)", "Highly customizable via SPIs"],
    cons: ["You operate it (HA, upgrades, JVM tuning)", "UX is dated", "Fewer turnkey integrations than commercial peers"],
    best: "Cost-sensitive or sovereignty-conscious teams that have ops capacity to run JVM services.",
    license: "Apache 2.0",
    maturity: "Mature",
  },
  "AWS Cognito": {
    blurb: "AWS-native user pool + identity broker for OIDC, SAML, and social logins.",
    pros: ["Cheap at scale, deeply integrated with AWS IAM", "Federated identities for fine-grained AWS access", "Pay-as-you-go MAU pricing"],
    cons: ["Console UX is rough", "Customization is limited (Lambda triggers help but only so far)", "Localization and email templates are weak"],
    best: "AWS-native applications where Cognito's seams disappear behind your own UI.",
    license: "Commercial",
    maturity: "GA",
  },
  "Passkeys (WebAuthn)": {
    blurb: "Phishing-resistant credentials backed by device hardware (Touch ID, Windows Hello, security keys).",
    pros: ["Eliminates password phishing entirely", "Better UX than passwords + 2FA", "Supported by all major OS/browsers"],
    cons: ["Account recovery is the hard problem", "Cross-device sync still maturing", "Not all enterprise systems accept passkeys yet"],
    best: "Consumer apps and progressive enterprises ready to invest in modern auth UX.",
    license: "W3C Standard",
    maturity: "GA",
  },

  // ── Agent identity / secrets / policy ─────────────────────────
  "SPIFFE / SPIRE": {
    blurb: "CNCF standard (SPIFFE) and reference implementation (SPIRE) for issuing cryptographic identities to workloads.",
    pros: ["Open standard with broad adoption", "Strong attestation model — identity tied to workload, not credentials", "Cloud-agnostic"],
    cons: ["Conceptually heavy — non-trivial to operate", "Smaller talent pool", "Best for sophisticated platform teams"],
    best: "Platform engineering teams that need workload identity to span multi-cloud and bare metal.",
    license: "Apache 2.0",
    maturity: "Production",
  },
  "HashiCorp Vault": {
    blurb: "Secrets management, dynamic credentials, encryption-as-a-service, and PKI in one platform.",
    pros: ["Industry-standard for dynamic / short-lived creds", "Rich auth methods + audit", "Self-hosted or HCP Cloud"],
    cons: ["Operational complexity (Raft, seal/unseal, upgrades)", "License terms changed (BUSL) — open-source forks exist (OpenBao)", "Pricey at enterprise tier"],
    best: "Any organization where long-lived secrets are unacceptable — financial services, regulated SaaS, anyone post-incident.",
    license: "BUSL 1.1 (was MPL)",
    maturity: "GA",
  },
  "AWS STS AssumeRole": {
    blurb: "AWS-native short-lived credential issuance — assume a role, get scoped temporary credentials.",
    pros: ["Free and built-in to AWS", "Integrates natively with every AWS service", "Well-understood by ops teams"],
    cons: ["AWS-only", "Role chaining and trust policies can become a tangle", "Doesn't manage non-AWS secrets"],
    best: "AWS-heavy environments where IAM roles are already the abstraction for everything.",
    license: "Commercial",
    maturity: "GA",
  },
  "Open Policy Agent (OPA)": {
    blurb: "CNCF general-purpose policy engine — write policy in Rego, evaluate it as a service or sidecar.",
    pros: ["Truly decoupled — same engine for K8s admission, microservice authz, agent actions", "Huge ecosystem", "Battle-tested at scale"],
    cons: ["Rego has a learning curve", "Performance tuning matters at high QPS", "Policy bundles need their own CI/CD"],
    best: "Anyone who wants one policy language across infra, services, and agents.",
    license: "Apache 2.0",
    maturity: "Production",
  },
  "AWS Cedar": {
    blurb: "Amazon's open-source policy language designed for clarity, performance, and provable safety.",
    pros: ["Cleaner ergonomics than Rego for many cases", "Formal verification tooling", "Built into Amazon Verified Permissions"],
    cons: ["Younger ecosystem than OPA", "Best support is on AWS", "Tooling outside AVP is still maturing"],
    best: "Greenfield authz where Cedar's clearer mental model wins, especially on AWS.",
    license: "Apache 2.0",
    maturity: "GA",
  },
  "Oso": {
    blurb: "Authorization-as-a-service with a relationship-based model and a hosted policy editor.",
    pros: ["Excellent DX for app-level authz", "Hosted option removes ops burden", "Polar policy language is approachable"],
    cons: ["Vendor-hosted by default", "Less suited to infra/admission policy than OPA", "Smaller community"],
    best: "Product teams who want authz that scales beyond RBAC without standing up OPA.",
    license: "Commercial / Apache 2.0 (oss)",
    maturity: "Production",
  },

  // ── Orchestration ─────────────────────────────────────────────
  "LangGraph": {
    blurb: "State-machine framework for agents — explicit nodes, edges, persistence, human-in-the-loop.",
    pros: ["Explicit state model survives failure and pause", "First-class checkpointing + interrupts", "Pairs naturally with LangSmith for traces"],
    cons: ["More verbose than imperative agent code", "LangChain ecosystem churn", "Conceptual overhead before it pays off"],
    best: "Multi-step agents where you need durable state, replay, and human approval gates.",
    license: "MIT",
    maturity: "Production",
  },
  "AutoGen": {
    blurb: "Microsoft's multi-agent conversation framework — agents talk to each other to solve tasks.",
    pros: ["Conversation-as-orchestration is a powerful primitive", "Strong group-chat patterns", "Good research provenance"],
    cons: ["Less production-hardened than LangGraph", "Debugging multi-agent chats is hard", "v0.4 rewrite was disruptive"],
    best: "Research-flavored builds and exploratory multi-agent prototypes.",
    license: "MIT",
    maturity: "Active",
  },
  "CrewAI": {
    blurb: "Role-based multi-agent framework — define crews with roles, goals, and tools.",
    pros: ["Highest-level abstraction — easy to start", "Role/goal mental model is intuitive", "Active community"],
    cons: ["Abstractions can hide failures", "Less escape-hatch than LangGraph when you need control", "Production telemetry weaker"],
    best: "Demos, hackathons, and teams who want a working crew of agents in an afternoon.",
    license: "MIT",
    maturity: "Active",
  },
  "OpenAI Swarm": {
    blurb: "OpenAI's experimental lightweight multi-agent handoff framework.",
    pros: ["Tiny surface area — easy to grok", "Handoff pattern is clean", "Pairs with OpenAI's stack natively"],
    cons: ["Explicitly experimental — not for production", "OpenAI-only", "No persistence built in"],
    best: "Prototyping handoff patterns inside the OpenAI ecosystem.",
    license: "MIT",
    maturity: "Experimental",
  },

  // ── Runtime / context / memory ────────────────────────────────
  "Anthropic SKILL.md (Claude Skills)": {
    blurb: "Claude's capability format — folders containing markdown + optional code that the agent loads on demand.",
    pros: ["Markdown-first — humans can read and review", "Progressive disclosure keeps context small", "Model-agnostic in spirit (just files)"],
    cons: ["Anthropic-flavored conventions", "Discovery / packaging tooling still evolving", "Less mature than LangChain Tools registry"],
    best: "Claude-based agents (and others adopting the convention) that need composable, reviewable capabilities.",
    license: "Open spec",
    maturity: "Active",
  },
  "Mem0": {
    blurb: "Open-source memory layer for agents — extracts facts from conversations and retrieves them later.",
    pros: ["Drop-in for both short and long-term memory", "Pluggable vector store", "Active development"],
    cons: ["Hosted tier still maturing", "Quality depends on extraction prompts you tune", "Newer than LlamaIndex Memory"],
    best: "Agents that need 'remembers me' behavior across sessions without you building memory plumbing.",
    license: "Apache 2.0",
    maturity: "Active",
  },
  "Letta (MemGPT)": {
    blurb: "Open-source agent memory system based on the MemGPT paper — virtual context with hierarchical memory.",
    pros: ["Strong research foundation (MemGPT)", "Designed for genuinely long-running agents", "Self-hostable"],
    cons: ["More opinionated than Mem0", "Smaller community", "Operationally more involved"],
    best: "Long-running agents (research assistants, ongoing project agents) where memory architecture is a first-class concern.",
    license: "Apache 2.0",
    maturity: "Active",
  },
  "LlamaIndex": {
    blurb: "Data framework for LLMs — ingestion, indexing, RAG, agentic retrieval over your data.",
    pros: ["Best-in-class for retrieval engineering", "Huge connector library", "Strong eval + observability tie-ins"],
    cons: ["API surface is large; learning curve is real", "Some overlap/competition with LangChain", "Production deployments need pruning"],
    best: "Retrieval-heavy applications where smart chunking, indexing, and query rewriting are the value.",
    license: "MIT",
    maturity: "Production",
  },

  // ── Models / gateway ──────────────────────────────────────────
  "LiteLLM": {
    blurb: "Open-source unified API across 100+ LLM providers, with routing, caching, and cost tracking.",
    pros: ["Drop-in OpenAI-compatible API for everyone else", "Built-in fallbacks, retries, budgets", "Self-hosted or managed"],
    cons: ["Yet another moving part in the request path", "Feature flags and config can get gnarly", "Some provider-specific features get lowest-common-denominatored"],
    best: "Teams that want one HTTP surface across providers without rewriting client code.",
    license: "MIT",
    maturity: "Production",
  },
  "Portkey": {
    blurb: "AI gateway with caching, fallback, guardrails, observability, and prompt management.",
    pros: ["Genuinely batteries-included gateway", "Strong observability story", "Hosted SaaS with self-hosted option"],
    cons: ["SaaS dependency in critical path (mitigatable)", "Pricing scales with traffic", "Less standards-track than LiteLLM"],
    best: "Mid-market teams that want gateway features without operating LiteLLM themselves.",
    license: "MIT (oss core) / Commercial",
    maturity: "Production",
  },
  "Helicone": {
    blurb: "LLM observability + caching gateway — proxy your traffic for traces, costs, and analytics.",
    pros: ["Easy to adopt — just change base URL", "Strong cost analytics", "Good free tier"],
    cons: ["Proxy in the critical path (async option helps)", "Caching/guardrail features less deep than Portkey", "Fewer providers than LiteLLM"],
    best: "Teams whose first need is 'where is my money going' — observability with light gateway features.",
    license: "Apache 2.0",
    maturity: "Production",
  },
  "OpenRouter": {
    blurb: "Hosted inference router across 100+ models with one API and unified billing.",
    pros: ["Try a new model in seconds", "Pay-as-you-go consolidates billing", "Built-in fallback chains"],
    cons: ["Hosted-only — your traffic flows through them", "Latency adds a hop", "Provider features sometimes lag"],
    best: "Experimentation and apps where simplicity beats squeezing every cent.",
    license: "Commercial",
    maturity: "GA",
  },
  "AWS Bedrock": {
    blurb: "AWS's managed gateway to multiple foundation models (Anthropic, Meta, Cohere, Amazon, Mistral).",
    pros: ["AWS-native IAM, VPC, logging", "Strong compliance posture", "Provisioned throughput option"],
    cons: ["Latest frontier models lag direct providers by weeks/months", "Region availability is uneven", "Pricing not always cheaper than direct"],
    best: "AWS-shop enterprises that need contracts, compliance, and IAM more than they need bleeding-edge models.",
    license: "Commercial",
    maturity: "GA",
  },

  // ── Tools / MCP / sandbox ─────────────────────────────────────
  "Anthropic MCP Servers": {
    blurb: "Reference servers + spec for Model Context Protocol — the emerging standard for agent ↔ tool/data connections.",
    pros: ["Becoming the cross-vendor standard", "Capability discovery built into the protocol", "Growing official + community server library"],
    cons: ["Spec still evolving", "Auth/ACL story is maturing", "Server quality varies wildly outside the official set"],
    best: "Anyone building tools they want callable across Claude, ChatGPT, Cursor, Windsurf, and the next model.",
    license: "MIT (spec / SDKs)",
    maturity: "Active",
  },
  "Cloudflare MCP": {
    blurb: "Cloudflare's hosted MCP servers + Workers-based MCP runtime.",
    pros: ["Edge-deployed — global low latency", "Free tier covers serious traffic", "OAuth wrappers for SaaS APIs included"],
    cons: ["Cloudflare lock-in for runtime", "Workers constraints (CPU time, etc)", "MCP itself still evolving"],
    best: "Teams already on Cloudflare who want MCP servers without running infra.",
    license: "Commercial / OSS",
    maturity: "Active",
  },
  "Anthropic Computer Use": {
    blurb: "Claude's ability to operate a computer GUI directly — screen, mouse, keyboard.",
    pros: ["Genuine GUI automation when no API exists", "Improving rapidly", "Inherits Claude's reasoning quality"],
    cons: ["Slower and pricier than API-driven flows", "Brittle to UI changes", "Beta — not production-grade for high-stakes"],
    best: "Workflows trapped in legacy SaaS or desktop apps with no API, where slow-but-it-works beats nothing.",
    license: "Commercial",
    maturity: "Beta",
  },
  "Browserbase": {
    blurb: "Hosted, instrumented headless browsers tuned for agent workloads — sessions, stealth, recording.",
    pros: ["Better than self-hosted Playwright for stealth + scale", "Session replay aids debugging", "Pairs with Stagehand for higher-level agent driving"],
    cons: ["Per-session cost adds up", "Hosted-only", "Compliance review needs to consider data flow"],
    best: "Production browser agents where reliability and observability beat 'we run our own Chrome'.",
    license: "Commercial",
    maturity: "Production",
  },
  "Modal": {
    blurb: "Serverless GPU + sandbox platform for Python — one-command code execution with strong isolation.",
    pros: ["Excellent DX for sandboxed code", "Genuine GPU access on demand", "Per-second billing"],
    cons: ["Python-first (other langs supported less natively)", "Cold starts on rare images", "Hosted-only"],
    best: "Code-execution sandboxes for data analysis, generated code, or ML workloads from agents.",
    license: "Commercial",
    maturity: "GA",
  },
  "E2B": {
    blurb: "Open-source secure sandboxes for AI-generated code — Firecracker microVMs with a clean SDK.",
    pros: ["Open-source core + hosted option", "Strong isolation (Firecracker)", "Designed expressly for AI code-exec"],
    cons: ["Smaller community than Modal", "Some rough edges in advanced config", "Egress / network rules need care"],
    best: "Code-exec sandboxes where open-source + isolation guarantees matter.",
    license: "Apache 2.0 / Commercial",
    maturity: "Production",
  },

  // ── Vector / RAG ──────────────────────────────────────────────
  "Pinecone": {
    blurb: "Hosted, managed vector database — the original.",
    pros: ["Truly managed — operational burden near zero", "Strong filtering, namespaces, hybrid search", "Battle-tested at scale"],
    cons: ["Hosted-only", "Pricing rises sharply at scale", "Less flexible than self-hosted alternatives"],
    best: "Teams who want vector search to be a problem they don't think about.",
    license: "Commercial",
    maturity: "GA",
  },
  "Weaviate": {
    blurb: "Open-source vector + hybrid search database with built-in modules for embeddings and reranking.",
    pros: ["Self-hosted or cloud", "Strong hybrid (BM25 + vector) out of the box", "Modules for reranking, generative search"],
    cons: ["Operationally heavier than pgvector", "Schema-first model adds upfront cost", "Resource-hungry at scale"],
    best: "Teams that want a real search engine — not just a vector index — and can run it.",
    license: "BSD-3-Clause",
    maturity: "Production",
  },
  "Qdrant": {
    blurb: "Open-source vector database in Rust with strong performance and filtering.",
    pros: ["Fast, low-latency", "Excellent filtering and payload model", "Self-hosted or cloud"],
    cons: ["Smaller ecosystem than Pinecone/Weaviate", "Hybrid search added later, less mature", "Smaller commercial backing"],
    best: "Performance-sensitive deployments where filter-aware vector search matters.",
    license: "Apache 2.0",
    maturity: "Production",
  },
  "pgvector (Postgres)": {
    blurb: "Vector index extension that adds nearest-neighbor search to Postgres.",
    pros: ["You already run Postgres — no new database", "Joins to your real data", "Free, simple, well-understood ops"],
    cons: ["Slower than purpose-built engines past a few million rows", "Limited hybrid search", "Index types (IVFFlat / HNSW) need tuning"],
    best: "Most apps under ~10M vectors — and especially where vectors join structured data.",
    license: "PostgreSQL License",
    maturity: "Production",
  },
  "Cohere Rerank": {
    blurb: "API for reordering retrieved passages by relevance to the query — the unsung hero of good RAG.",
    pros: ["Massively improves RAG precision with one API call", "Multilingual", "Self-hosted option for enterprise"],
    cons: ["Adds latency + cost per query", "Vendor dependency", "Less needed if your retrieval is already excellent"],
    best: "Any RAG pipeline that retrieves >5 candidates per query — rerank is almost always worth it.",
    license: "Commercial",
    maturity: "GA",
  },

  // ── State / events ────────────────────────────────────────────
  "Apache Kafka": {
    blurb: "Distributed log — the canonical event-streaming platform.",
    pros: ["Industry standard, vast ecosystem", "Genuine durability and throughput", "Replay and stream processing built in"],
    cons: ["Operationally heavy (Zookeeper / KRaft, brokers, partitions)", "Overkill for small workloads", "Consumer-side discipline matters"],
    best: "Anywhere you need event sourcing at scale and have ops capacity.",
    license: "Apache 2.0",
    maturity: "GA",
  },
  "Temporal": {
    blurb: "Durable execution platform — write workflows as code, get retries, timers, and history for free.",
    pros: ["Eliminates entire classes of distributed bugs", "Excellent for long-running agent workflows", "Strong dev experience"],
    cons: ["Conceptual learning curve", "Hosted (Temporal Cloud) adds vendor dependency", "Self-hosted is non-trivial"],
    best: "Multi-step, long-running agent flows that must survive crashes and need durable retries.",
    license: "MIT",
    maturity: "Production",
  },
  "Inngest": {
    blurb: "Durable workflow engine with first-class agent + step primitives.",
    pros: ["Excellent DX — feels like writing async code", "Built for AI workflows including HITL", "Generous free tier"],
    cons: ["Younger than Temporal", "Hosted-leaning", "Less power-user knobs than Temporal"],
    best: "Teams who want durable workflows without Temporal's learning curve.",
    license: "Apache 2.0 (oss) / Commercial",
    maturity: "Production",
  },

  // ── Observability / evals ─────────────────────────────────────
  "LangSmith": {
    blurb: "LangChain's hosted observability + evals + prompt management platform.",
    pros: ["Best-in-class trace UI for LangChain/LangGraph", "Built-in evals + annotation queues", "Prompt registry"],
    cons: ["Tied to LangChain's lens (works elsewhere but native fit is LC)", "Hosted-only by default", "Can get expensive at scale"],
    best: "LangChain shops — and anyone else who wants polished traces over rolling their own.",
    license: "Commercial",
    maturity: "GA",
  },
  "Langfuse": {
    blurb: "Open-source LLM observability + evals platform — self-hosted or cloud.",
    pros: ["Fully open-source", "Self-hosting works well", "Framework-agnostic"],
    cons: ["UI polish trails LangSmith slightly", "Fewer managed evals out of the box", "Smaller ecosystem"],
    best: "Privacy-conscious or open-source-first teams who want LangSmith-class capability self-hosted.",
    license: "MIT",
    maturity: "Production",
  },
  "Arize Phoenix": {
    blurb: "Open-source observability + evals + drift monitoring with strong embeddings analysis.",
    pros: ["Open-source under Arize", "Embedding drift visualization is excellent", "OpenTelemetry GenAI native"],
    cons: ["Pairs best with Arize's commercial offering for full capability", "Fewer prompt-management features", "Newer than LangSmith"],
    best: "Teams that care about embedding drift and ML-style monitoring more than pretty traces.",
    license: "Elastic / OSS",
    maturity: "Production",
  },
  "Braintrust": {
    blurb: "Evals-first platform — datasets, scorers, experiments, and trace inspection.",
    pros: ["Genuinely focused on eval rigor", "Good experiment ergonomics", "Pairs with any tracer"],
    cons: ["Less of a one-stop shop than LangSmith", "Hosted-only", "Smaller than competitors but well-funded"],
    best: "Teams whose primary pain is 'we ship and pray' — eval first, telemetry second.",
    license: "Commercial",
    maturity: "GA",
  },
  "RAGAS": {
    blurb: "Open-source RAG evaluation framework — faithfulness, context recall, answer relevance.",
    pros: ["Free, focused, well-known metrics", "Easy to plug into any pipeline", "Strong research grounding"],
    cons: ["RAG-specific (not a full agent eval suite)", "Some metrics are still LLM-judge-flavored", "No UI by itself"],
    best: "Anyone who has built RAG and needs to measure whether changes are helping or hurting.",
    license: "Apache 2.0",
    maturity: "Production",
  },

  // ── Guardrails / governance ───────────────────────────────────
  "Llama Guard 3 (Meta)": {
    blurb: "Open-weight content-safety classifier from Meta for input and output filtering.",
    pros: ["Open weights — self-host with no per-call cost", "Multilingual", "Good baseline for unsafe-content detection"],
    cons: ["Static taxonomy (you can't easily extend categories)", "Lower precision than commercial guardrails for edge cases", "Compute cost at high QPS"],
    best: "Cost-sensitive deployments and anyone who wants safety classification fully on-prem.",
    license: "Llama 3 Community License",
    maturity: "Production",
  },
  "Anthropic Constitutional Classifiers": {
    blurb: "Anthropic's input/output classifiers tuned against jailbreak and harmful-content patterns.",
    pros: ["Best-in-class jailbreak resistance per public research", "Tightly integrated with Claude API", "Updates with the model"],
    cons: ["Anthropic-only (input side)", "Cost adds to every request", "Less customization than self-hosted guards"],
    best: "Claude-based products with high jailbreak / safety risk and willingness to pay for managed protection.",
    license: "Commercial",
    maturity: "Active",
  },
  "Lakera Guard": {
    blurb: "Commercial guardrails for prompt-injection, PII, and content safety with low latency.",
    pros: ["Strong prompt-injection benchmark performance", "Easy integration", "Continuously updated rule corpus"],
    cons: ["Hosted-only by default", "Per-call pricing", "Closed model"],
    best: "Production agents on the public internet where prompt-injection defense is the top concern.",
    license: "Commercial",
    maturity: "GA",
  },
  "NVIDIA NeMo Guardrails": {
    blurb: "Open-source toolkit for programmable, conversation-level guardrails using a Colang DSL.",
    pros: ["Free and self-hostable", "Programmable conversation-flow control", "Plays well with multi-turn agents"],
    cons: ["Colang has a learning curve", "Tied to NVIDIA's broader stack ergonomically", "More complex than classifier-style guards"],
    best: "Teams that need conversation-flow rules (not just message filtering) and want them open-source.",
    license: "Apache 2.0",
    maturity: "Production",
  },
  "AWS CloudTrail + S3 Object Lock": {
    blurb: "Native AWS audit logging written to immutable, versioned S3 objects.",
    pros: ["Tamper-evident through Object Lock + versioning", "Cheap at scale", "Auditors already accept it"],
    cons: ["AWS-only", "Querying requires Athena / extra tooling", "Not a turnkey 'agent audit' product"],
    best: "AWS-resident systems where regulators want immutability and you want minimal new vendors.",
    license: "Commercial",
    maturity: "GA",
  },
  "LangGraph Interrupts": {
    blurb: "LangGraph's primitive for pausing a graph for human review and resuming with input.",
    pros: ["Native to LangGraph — no extra plumbing", "Survives process restart via checkpointer", "Pairs with LangSmith review queue"],
    cons: ["Tied to LangGraph runtime", "UI for review is your problem", "Less workflow-engine-y than Temporal"],
    best: "LangGraph apps that need clean approval-and-resume on sensitive steps.",
    license: "MIT",
    maturity: "Production",
  },
  "Vanta": {
    blurb: "Compliance automation — continuously evidence SOC 2, ISO 27001, HIPAA, ISO 42001.",
    pros: ["Speeds first audits dramatically", "Wide framework coverage including ISO 42001 (AI)", "Strong integrations to cloud + HRIS"],
    cons: ["Annual SaaS cost adds up", "Auto-evidence still needs human review", "Not a substitute for actual security work"],
    best: "Startups and growth-stage companies pursuing first major certifications.",
    license: "Commercial",
    maturity: "GA",
  },
};

export const TECH_CATALOG = new Map<string, TechEntry>();
for (const [key, entry] of Object.entries(RAW)) {
  TECH_CATALOG.set(norm(key), { name: key, ...entry });
}

export function lookupTech(label: string): TechEntry | undefined {
  if (!label) return undefined;
  const key = norm(label);
  if (TECH_CATALOG.has(key)) return TECH_CATALOG.get(key);
  const stripped = label.replace(/\s*\(.*?\)\s*/g, "").split(",")[0].trim();
  const strippedKey = norm(stripped);
  if (TECH_CATALOG.has(strippedKey)) return TECH_CATALOG.get(strippedKey);
  for (const [k, v] of TECH_CATALOG) {
    if (k.startsWith(key) || key.startsWith(k)) return v;
  }
  return undefined;
}
