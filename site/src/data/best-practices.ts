import type { Pillar } from "./types";

export const PILLARS: Pillar[] = [
  {
    id: "cyber-security",
    name: "Cyber Security",
    icon: "\u{1F6E1}",
    exec:
      "Agentic AI platforms expand the enterprise attack surface beyond traditional web-app boundaries. Autonomous tool use, multi-step reasoning, and shared memory introduce novel threat vectors — prompt injection, model supply-chain compromise, RAG poisoning, and unconstrained tool execution — that conventional perimeter defenses do not address. A defense-in-depth strategy must secure every layer from user input to external system integration.",
    eng:
      "Each architecture layer requires AI-specific security controls layered on top of standard application security. Implement input classifiers and output validators at the gateway, enforce least-privilege tool permissions in the runtime, isolate agent sessions in state management, and continuously monitor for adversarial patterns via the observability stack. Treat all model output as untrusted and validate before acting on it.",
    citations: [
      {
        id: "owasp-llm-top10",
        label: "OWASP Top 10 for Large Language Model Applications (2025)",
        url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        org: "OWASP",
      },
      {
        id: "mitre-atlas",
        label: "MITRE ATLAS — Adversarial Threat Landscape for AI Systems",
        url: "https://atlas.mitre.org/",
        org: "MITRE",
      },
      {
        id: "nist-ai-rmf",
        label: "NIST AI Risk Management Framework (AI RMF 1.0)",
        url: "https://www.nist.gov/artificial-intelligence/risk-management-framework",
        org: "NIST",
      },
      {
        id: "nist-sp-800-53",
        label: "NIST SP 800-53 Rev. 5 — Security and Privacy Controls",
        url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        org: "NIST",
      },
      {
        id: "azure-waf-ai",
        label: "Azure Well-Architected Framework — AI Workload Security",
        url: "https://learn.microsoft.com/en-us/azure/well-architected/ai/security",
        org: "Microsoft",
      },
      {
        id: "ms-rai-standard",
        label: "Microsoft Responsible AI Standard v2",
        url: "https://www.microsoft.com/en-us/ai/principles-and-approach",
        org: "Microsoft",
      },
    ],
    cells: [
      /* ── Surface (critical) ──────────────────────────── */
      {
        layerId: "surface",
        tier: "critical",
        guidelines: [
          {
            id: "cs-surf-1",
            text: "Implement layered prompt injection defense",
            exec:
              "Prompt injection is the top attack vector against LLM-powered systems (OWASP LLM01). Without defense-in-depth, a single malicious input can override system instructions, exfiltrate data, or trigger unauthorized tool calls.",
            eng:
              "Deploy an input classifier (Lakera Guard, Azure AI Content Safety, or a fine-tuned detector) before the LLM call. Use system-prompt isolation with delimiter-based context separation. Apply output validation to detect instruction leakage. Rate-limit per-user to bound damage radius.",
          },
          {
            id: "cs-surf-2",
            text: "Validate and sanitize all user-supplied content before LLM ingestion",
            exec:
              "User inputs to agentic systems carry richer semantics than traditional form fields — file uploads, URLs, and structured payloads can all encode adversarial instructions that bypass naive text filters.",
            eng:
              "Strip or escape control characters, enforce maximum input length, and reject inputs matching known injection signatures. For multi-modal inputs (images, documents), run content-safety classifiers before passing to the model. Log rejected inputs for threat intelligence.",
          },
          {
            id: "cs-surf-3",
            text: "Enforce output filtering to prevent sensitive data leakage",
            exec:
              "LLMs can inadvertently surface PII, credentials, or internal system details in responses (OWASP LLM06). Output-side controls are the last line of defense before data reaches the user.",
            eng:
              "Apply regex and NER-based PII detectors to all model outputs. Implement an allowlist of response patterns for structured outputs. Use a secondary classifier to detect system-prompt leakage or internal-schema exposure in free-text responses.",
          },
          {
            id: "cs-surf-4",
            text: "Implement rate limiting and abuse detection at the UI boundary",
            exec:
              "Agentic endpoints are expensive to invoke and can be weaponized for denial-of-wallet or resource-exhaustion attacks. Early throttling limits blast radius.",
            eng:
              "Apply per-user and per-session rate limits at the API gateway or edge layer. Implement progressive back-off for repeated injection attempts. Track cost-per-request and set per-tenant budget ceilings with automatic circuit-breaking.",
          },
        ],
      },

      /* ── Identity (critical) ─────────────────────────── */
      {
        layerId: "identity",
        tier: "critical",
        guidelines: [
          {
            id: "cs-id-1",
            text: "Enforce zero-trust identity for both human users and AI agents",
            exec:
              "In agentic platforms, agents act on behalf of users and invoke tools autonomously. Every request — whether from a human or an agent — must be authenticated and authorized with the principle of least privilege.",
            eng:
              "Issue short-lived, scoped OAuth 2.0 tokens for agent sessions. Bind agent identity to the originating user's permission set using on-behalf-of (OBO) flows. Never allow agents to escalate beyond the delegating user's privileges.",
          },
          {
            id: "cs-id-2",
            text: "Scope agent credentials to minimum required permissions",
            exec:
              "Over-provisioned agent credentials are a critical risk — a compromised agent with broad access can traverse internal systems unchecked. Credential scoping limits lateral movement.",
            eng:
              "Create dedicated service principals per agent role with fine-grained RBAC. Use managed identities (Azure MI, AWS IAM Roles) instead of static secrets. Rotate credentials on short TTLs (< 1 hour). Log all credential usage for audit.",
          },
          {
            id: "cs-id-3",
            text: "Implement step-up authentication for high-impact agent actions",
            exec:
              "Certain agent-initiated actions (financial transactions, data deletions, external communications) carry outsized business risk and should require additional human verification.",
            eng:
              "Define an action-risk taxonomy and map high-risk operations to step-up auth challenges (MFA, approval workflows). Implement human-in-the-loop confirmation for irreversible actions. Log all step-up events with the originating agent trace ID.",
          },
          {
            id: "cs-id-4",
            text: "Maintain a complete audit trail of delegated authority chains",
            exec:
              "When agents delegate to sub-agents or invoke tools, the chain of authority must be traceable for forensics and compliance. Untracked delegation creates accountability gaps.",
            eng:
              "Propagate a delegation chain token through all agent-to-agent and agent-to-tool calls, recording the original user, each intermediate agent, and the action taken. Store delegation logs in an append-only, tamper-evident store.",
          },
        ],
      },

      /* ── Orchestration (moderate) ────────────────────── */
      {
        layerId: "orchestration",
        tier: "moderate",
        guidelines: [
          {
            id: "cs-orch-1",
            text: "Validate agent execution plans before dispatch",
            exec:
              "Orchestrators that blindly execute LLM-generated plans can be manipulated into calling dangerous tool sequences. Plan validation acts as a circuit-breaker between reasoning and action.",
            eng:
              "Implement a plan-validation step that checks proposed tool sequences against an allowlist of permitted action graphs. Reject plans containing disallowed tool combinations (e.g., read-credentials then call-external-api). Log rejected plans for adversarial pattern analysis.",
          },
          {
            id: "cs-orch-2",
            text: "Enforce trust boundaries when delegating across agent tiers",
            exec:
              "Multi-agent orchestration creates implicit trust relationships. A compromised sub-agent should not be able to influence the orchestrator or peer agents beyond its scoped authority.",
            eng:
              "Serialize inter-agent communication through a message bus with schema validation. Prevent sub-agents from modifying orchestrator state directly. Apply output sanitization to sub-agent results before incorporating them into the parent plan.",
          },
        ],
      },

      /* ── Runtime (moderate) ──────────────────────────── */
      {
        layerId: "runtime",
        tier: "moderate",
        guidelines: [
          {
            id: "cs-rt-1",
            text: "Sandbox agent execution environments with resource constraints",
            exec:
              "Agents executing code or processing untrusted data can be exploited for container escape, resource exhaustion, or lateral movement. Sandboxing contains the blast radius.",
            eng:
              "Run each agent invocation in an isolated container or microVM (gVisor, Firecracker) with CPU/memory/network limits. Disable outbound network access by default; allowlist specific endpoints per tool. Drop all OS capabilities except those explicitly required.",
          },
          {
            id: "cs-rt-2",
            text: "Enforce tool permission policies at the runtime boundary",
            exec:
              "The runtime is the enforcement point where declared tool permissions meet actual execution. Bypassing this layer means agents can use any tool regardless of policy.",
            eng:
              "Implement a policy-decision-point (PDP) that evaluates tool-call requests against the agent's role, the user's permissions, and the current session context before forwarding to the tool. Deny by default; log all denied requests.",
          },
        ],
      },

      /* ── Gateway (critical) ──────────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "cs-gw-1",
            text: "Implement model supply-chain verification",
            exec:
              "Compromised or poisoned models are a supply-chain risk equivalent to malicious dependencies in software (OWASP LLM05, MITRE ATLAS ML Supply Chain Compromise). Verifying model provenance is non-negotiable.",
            eng:
              "Pin model versions by cryptographic hash, not mutable tags. Verify model checksums on download. Maintain an internal model registry with signed provenance metadata. Scan model artifacts for known vulnerabilities (ModelScan). Block unsigned or unverified models from production.",
          },
          {
            id: "cs-gw-2",
            text: "Apply PII and sensitive-data filtering at the model gateway",
            exec:
              "The model gateway is the chokepoint where all prompts and completions pass. Filtering here prevents accidental data exposure to third-party model providers and ensures compliance with data residency requirements.",
            eng:
              "Deploy a gateway-level PII detector (Presidio, AWS Comprehend) that redacts or tokenizes sensitive fields before they reach the model API. For self-hosted models, apply the same filtering on output. Maintain a data-classification policy that maps field types to redaction rules.",
          },
          {
            id: "cs-gw-3",
            text: "Detect and block adversarial inputs at the gateway layer",
            exec:
              "Adversarial inputs — jailbreaks, prompt injections, and evasion attacks — should be caught as early as possible before consuming compute and reaching downstream agents.",
            eng:
              "Deploy a dedicated adversarial-input classifier at the gateway (Rebuff, Lakera, or a fine-tuned model). Maintain a regularly updated signature database for known jailbreak patterns. Implement canary tokens in system prompts to detect extraction attempts.",
          },
          {
            id: "cs-gw-4",
            text: "Enforce model-access policies and request-level authorization",
            exec:
              "Not all agents or users should have access to all models. The gateway must enforce which identities can invoke which models, preventing unauthorized use of expensive or sensitive model endpoints.",
            eng:
              "Implement per-model RBAC at the gateway. Map agent roles to allowed model tiers (e.g., only approved agents can call GPT-4-class models). Log all model invocations with caller identity, token count, and cost for chargeback and anomaly detection.",
          },
        ],
      },

      /* ── Tools (critical) ────────────────────────────── */
      {
        layerId: "tools",
        tier: "critical",
        guidelines: [
          {
            id: "cs-tool-1",
            text: "Sandbox tool execution to prevent SSRF and unauthorized access",
            exec:
              "Agent-invoked tools that make network calls or access file systems can be exploited for server-side request forgery (SSRF) or data exfiltration (OWASP LLM07). Every tool must operate within a restricted boundary.",
            eng:
              "Run tools in isolated environments with egress filtering. Maintain an allowlist of permitted external URLs/IPs per tool. Block access to cloud metadata endpoints (169.254.169.254). Validate all URLs constructed from LLM output against the allowlist before making requests.",
          },
          {
            id: "cs-tool-2",
            text: "Validate tool inputs and outputs against strict schemas",
            exec:
              "LLMs generate tool invocation parameters that may contain injection payloads (SQL, shell commands, path traversal). Schema-based validation at the tool boundary stops these before execution.",
            eng:
              "Define JSON Schema for every tool's input and output contract. Reject any invocation that fails schema validation. For tools that accept strings (queries, file paths), apply type-specific sanitization — parameterized queries for databases, path canonicalization for file access, and command allowlisting for shell tools.",
          },
          {
            id: "cs-tool-3",
            text: "Enforce least-privilege data access for each tool",
            exec:
              "Tools are the bridge between AI agents and real systems. A tool with excessive permissions becomes the highest-value target in the platform — a single exploit grants access to everything the tool can reach.",
            eng:
              "Create dedicated database users or service accounts per tool with the minimum required grants. Use read-only connections for retrieval tools. Implement row-level security where tools access multi-tenant data. Audit tool-level data access quarterly.",
          },
          {
            id: "cs-tool-4",
            text: "Implement tool-call rate limiting and budget controls",
            exec:
              "Compromised or hallucinating agents can trigger runaway tool invocations — mass API calls, bulk data retrieval, or repeated writes. Per-tool rate limits prevent cascade damage.",
            eng:
              "Set per-agent, per-tool rate limits and daily invocation budgets. Implement circuit-breakers that halt tool execution after N consecutive failures. Alert on anomalous tool-call patterns (volume spikes, unusual tool combinations).",
          },
        ],
      },

      /* ── Memory (moderate) ───────────────────────────── */
      {
        layerId: "memory",
        tier: "moderate",
        guidelines: [
          {
            id: "cs-mem-1",
            text: "Protect vector stores against RAG poisoning attacks",
            exec:
              "Retrieval-augmented generation relies on trusted knowledge bases. An attacker who can inject malicious content into the vector store can influence all downstream agent responses (OWASP LLM08) — effectively a persistent prompt injection.",
            eng:
              "Enforce write-access controls on vector store ingestion pipelines. Validate document provenance before embedding. Implement content-integrity checksums on indexed chunks. Run periodic scans for anomalous embeddings that cluster near known adversarial patterns. Maintain lineage metadata linking each chunk to its source document.",
          },
          {
            id: "cs-mem-2",
            text: "Prevent cross-session context leakage in shared memory",
            exec:
              "Shared memory or conversation history that leaks across user sessions creates a data-privacy violation and an injection vector where one user's content influences another's responses.",
            eng:
              "Enforce strict namespace isolation per user/session in memory stores. Apply tenant-scoped access filters on all retrieval queries. Encrypt memory contents at rest with per-tenant keys. Implement TTLs on conversation memory to limit exposure window.",
          },
        ],
      },

      /* ── State (moderate) ────────────────────────────── */
      {
        layerId: "state",
        tier: "moderate",
        guidelines: [
          {
            id: "cs-st-1",
            text: "Encrypt agent session state and enforce tamper detection",
            exec:
              "Agent state (checkpoints, intermediate results, tool outputs) is a high-value target — tampering with it can alter agent behavior without triggering LLM-level defenses.",
            eng:
              "Encrypt state at rest (AES-256) and in transit (TLS 1.3). Apply HMAC-based integrity checks on state snapshots. Validate state checksums on resume/replay. Use append-only storage for state transitions to maintain an audit trail.",
          },
          {
            id: "cs-st-2",
            text: "Isolate agent session state across tenants and workflows",
            exec:
              "Multi-tenant platforms must guarantee that one tenant's agent state cannot be read or influenced by another. Session isolation is both a security and a compliance requirement.",
            eng:
              "Partition state storage by tenant ID at the infrastructure level (separate databases, containers, or encryption keys). Validate tenant context on every state read/write operation. Log cross-tenant access attempts as security events.",
          },
        ],
      },

      /* ── Observability (moderate) ────────────────────── */
      {
        layerId: "observability",
        tier: "moderate",
        guidelines: [
          {
            id: "cs-obs-1",
            text: "Implement AI-specific security monitoring and anomaly detection",
            exec:
              "Traditional SIEM rules miss AI-specific threats — jailbreak attempts, prompt extraction, unusual tool-call sequences, and model-behavior drift. Dedicated AI security telemetry is required.",
            eng:
              "Emit structured security events for: injection attempts (detected/blocked), tool-call policy violations, model output anomalies, and authentication failures. Feed these into a SIEM with AI-specific correlation rules. Set alerts for jailbreak-attempt spikes, unusual tool-call graphs, and cost anomalies.",
          },
          {
            id: "cs-obs-2",
            text: "Log all LLM interactions for forensic analysis",
            exec:
              "In the event of a security incident, the ability to replay the exact sequence of prompts, completions, tool calls, and state transitions is essential for root-cause analysis and regulatory response.",
            eng:
              "Log full prompt/completion pairs (with PII redacted), tool invocations, and agent decision points to an append-only store with configurable retention. Implement correlation IDs that link a user request through the entire agent execution trace. Ensure logs are tamper-evident (signed, hash-chained).",
          },
        ],
      },

      /* ── Governance (critical) ───────────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "cs-gov-1",
            text: "Establish a security policy framework for AI agent operations",
            exec:
              "Without codified security policies, each team implements ad-hoc controls. A governance framework aligned with NIST AI RMF and OWASP LLM Top 10 ensures consistent, auditable security posture across the platform.",
            eng:
              "Define machine-readable security policies (OPA/Rego or Cedar) covering: allowed tool combinations per agent role, maximum token budgets, data-classification rules, and mandatory content-safety checks. Version policies in source control. Enforce via a centralized policy engine at runtime.",
          },
          {
            id: "cs-gov-2",
            text: "Automate compliance verification for AI security controls",
            exec:
              "Manual security audits cannot keep pace with the velocity of agentic platform changes. Continuous compliance automation catches drift before it becomes a breach.",
            eng:
              "Implement policy-as-code checks in CI/CD that validate: all tools have schema definitions, all model endpoints require authentication, all agent roles have least-privilege scoping, and content-safety filters are enabled. Run automated penetration tests (prompt injection, jailbreak suites) on every release.",
          },
          {
            id: "cs-gov-3",
            text: "Maintain a threat model specific to agentic AI architecture",
            exec:
              "Generic threat models miss AI-specific attack vectors. A dedicated threat model — informed by MITRE ATLAS and OWASP LLM Top 10 — ensures the organization understands and prioritizes AI-specific risks.",
            eng:
              "Document threat models per architecture layer using STRIDE or PASTA methodology, augmented with MITRE ATLAS tactics (reconnaissance, resource development, initial access via LLM, execution via agent tools). Review and update quarterly. Map each threat to specific controls in this matrix.",
          },
          {
            id: "cs-gov-4",
            text: "Define incident response procedures for AI-specific security events",
            exec:
              "AI security incidents (model poisoning, prompt injection campaigns, data exfiltration via agents) require specialized response playbooks. Generic IR procedures lack the context to contain these threats effectively.",
            eng:
              "Create runbooks for: prompt injection incident (isolate agent, revoke tokens, analyze injection vector), model compromise (rollback to verified checkpoint, scan all cached outputs), and data exfiltration (freeze memory stores, audit tool access logs, notify affected tenants). Test with tabletop exercises quarterly.",
          },
        ],
      },

      /* ── Systems of Record (critical) ────────────────── */
      {
        layerId: "systems",
        tier: "critical",
        guidelines: [
          {
            id: "cs-sys-1",
            text: "Enforce least-privilege access controls on all external system integrations",
            exec:
              "Agents that connect to CRMs, databases, and APIs inherit the access surface of those systems. Over-provisioned integrations turn a compromised agent into a skeleton key for the enterprise.",
            eng:
              "Create dedicated service accounts per integration with minimal required permissions. Use OAuth 2.0 scopes or API key restrictions to limit operations (read-only where possible). Implement connection-level firewall rules restricting agent-accessible endpoints.",
          },
          {
            id: "cs-sys-2",
            text: "Validate and sanitize all data flowing between agents and external systems",
            exec:
              "External systems trust agent-initiated requests. Unvalidated data from LLM outputs — injected SQL, malformed API payloads, or path-traversal strings — can compromise downstream systems that have no AI-aware defenses.",
            eng:
              "Apply output-schema validation to all agent-generated payloads before sending to external APIs. Use parameterized queries for all database interactions. Implement an API gateway between agents and external systems that enforces schema contracts and logs anomalies.",
          },
          {
            id: "cs-sys-3",
            text: "Maintain comprehensive audit trails for all agent-initiated system changes",
            exec:
              "When agents modify external systems (create records, trigger workflows, send communications), the enterprise needs a complete, tamper-evident record for compliance, forensics, and rollback.",
            eng:
              "Log every agent-to-system interaction with: agent ID, user delegation chain, action type, payload hash, timestamp, and response status. Store audit logs in an immutable ledger (append-only database, blockchain-anchored hashes). Implement automated alerts for high-risk actions (bulk deletes, privilege changes, financial transactions).",
          },
          {
            id: "cs-sys-4",
            text: "Implement circuit-breakers and rollback mechanisms for agent-initiated changes",
            exec:
              "Autonomous agents can execute harmful changes at machine speed. Circuit-breakers and rollback capability ensure the organization can contain and reverse damage from compromised or malfunctioning agents.",
            eng:
              "Implement write-ahead logging for all agent-initiated mutations. Set configurable thresholds for automatic circuit-breaking (e.g., > 100 record modifications in 60 seconds). Provide one-click rollback for agent-initiated change sets. Require human approval for batch operations exceeding defined thresholds.",
          },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  PILLAR 2 — AI Governance                                        */
  /* ================================================================ */
  {
    id: "ai-governance",
    name: "AI Governance",
    icon: "⚖",
    exec:
      "Autonomous AI agents make decisions at machine speed across enterprise systems, amplifying the consequences of ungoverned behavior. A structured AI governance program — grounded in ISO/IEC 42001, the EU AI Act risk tiers, and the NIST AI RMF GOVERN function — establishes accountability, risk classification, and policy enforcement across every architecture layer. Without it, organizations face regulatory exposure, unauditable decision chains, and reputational risk from unconstrained agent actions.",
    eng:
      "Implement governance as code: machine-readable policies that travel with the agent lifecycle from development through production retirement. Every agent deployment should pass through risk-classification gates, carry an accountability mapping (RACI), emit decision audit events, and enforce guardrails defined in a centralized policy engine. Integrate compliance checks into CI/CD so governance is continuous, not periodic.",
    citations: [
      {
        id: "iso-42001",
        label: "ISO/IEC 42001:2023 — Artificial Intelligence Management System",
        url: "https://www.iso.org/standard/81230.html",
        org: "ISO/IEC",
      },
      {
        id: "eu-ai-act",
        label: "EU AI Act — Regulation (EU) 2024/1689",
        url: "https://artificialintelligenceact.eu/the-act/",
        org: "European Union",
      },
      {
        id: "nist-ai-rmf-gov",
        label: "NIST AI Risk Management Framework (AI RMF 1.0)",
        url: "https://www.nist.gov/artificial-intelligence/risk-management-framework",
        org: "NIST",
      },
      {
        id: "oecd-ai-principles",
        label: "OECD AI Principles",
        url: "https://oecd.ai/en/ai-principles",
        org: "OECD",
      },
      {
        id: "ms-rai-standard-v2",
        label: "Microsoft Responsible AI Standard v2",
        url: "https://www.microsoft.com/en-us/ai/principles-and-approach",
        org: "Microsoft",
      },
    ],
    cells: [
      /* ── Surface (moderate) ──────────────────────────── */
      {
        layerId: "surface",
        tier: "moderate",
        guidelines: [
          {
            id: "gov-surf-1",
            text: "Display AI disclosure and transparency notices at the user interface",
            exec:
              "The EU AI Act (Article 50) and OECD Transparency Principle require that users know when they are interacting with an AI system. Failure to disclose creates regulatory liability and erodes user trust.",
            eng:
              "Render a persistent AI disclosure badge on all agent-driven interfaces. Include a link to the system's AI transparency card describing model capabilities, limitations, and data usage. Log user acknowledgment events for compliance evidence.",
          },
          {
            id: "gov-surf-2",
            text: "Provide users with meaningful override and escalation controls",
            exec:
              "OECD Principle 1.4 (Human Agency) and ISO 42001 Clause 8.4 require that humans can override AI decisions. Surface-layer controls make this right actionable rather than theoretical.",
            eng:
              "Implement a visible 'escalate to human' control on every agent interaction. Allow users to reject, modify, or request re-evaluation of AI-generated outputs. Record all override events with the original AI recommendation for audit comparison.",
          },
        ],
      },

      /* ── Identity (moderate) ─────────────────────────── */
      {
        layerId: "identity",
        tier: "moderate",
        guidelines: [
          {
            id: "gov-id-1",
            text: "Maintain a registry of all AI agent identities with accountability mappings",
            exec:
              "ISO 42001 Clause 6.1 and the NIST AI RMF GOVERN 1.1 require clear accountability for AI systems. Every agent must have a designated responsible human and organizational owner, not just a service principal.",
            eng:
              "Create a machine-readable agent registry linking each agent ID to its responsible team, risk classification, approved capabilities, and deployment environment. Enforce registry enrollment as a pre-deployment gate. Expose the registry via API for governance dashboards.",
          },
          {
            id: "gov-id-2",
            text: "Enforce role-based governance policies tied to agent classification",
            exec:
              "Different agent roles carry different risk profiles. An agent that reads data has a fundamentally different governance posture than one that initiates financial transactions. Policies must reflect this stratification.",
            eng:
              "Map agent roles to EU AI Act risk tiers (high, limited, minimal) and apply corresponding governance controls — high-risk agents require human oversight, conformity assessments, and enhanced logging. Enforce these mappings through the identity layer's policy engine.",
          },
        ],
      },

      /* ── Orchestration (critical) ────────────────────── */
      {
        layerId: "orchestration",
        tier: "critical",
        guidelines: [
          {
            id: "gov-orch-1",
            text: "Enforce human-in-the-loop approval gates for high-risk orchestration plans",
            exec:
              "The EU AI Act (Article 14) mandates human oversight for high-risk AI systems. Multi-step agent plans that touch regulated domains — finance, healthcare, HR — must include explicit human approval checkpoints before execution.",
            eng:
              "Implement configurable approval gates in the orchestration pipeline. Tag plan steps with risk classifications; steps exceeding a threshold pause execution and route to a human reviewer with full plan context. Log approval decisions with reviewer identity and timestamp.",
          },
          {
            id: "gov-orch-2",
            text: "Record complete decision lineage for every orchestration decision",
            exec:
              "NIST AI RMF GOVERN 1.5 requires traceability of AI decisions. Orchestration is where the model's reasoning becomes action — the decision lineage here is the backbone of any regulatory audit.",
            eng:
              "Capture and persist the full decision chain: input context, model reasoning (chain-of-thought), selected plan, rejected alternatives, and approval status. Store in an append-only audit store with cryptographic integrity. Make lineage queryable by agent ID, time range, and decision type.",
          },
          {
            id: "gov-orch-3",
            text: "Apply regulatory-aware routing based on task jurisdiction and risk tier",
            exec:
              "Different jurisdictions impose different AI obligations. An orchestrator handling EU customer data must apply EU AI Act requirements; one processing US health data must respect HIPAA constraints. The orchestration layer must route governance policies accordingly.",
            eng:
              "Implement a jurisdiction-aware policy resolver that evaluates task metadata (user region, data classification, domain) and activates the corresponding regulatory rule set before plan generation. Maintain a regulatory mapping table updated by the compliance team.",
          },
          {
            id: "gov-orch-4",
            text: "Enforce maximum autonomy boundaries for multi-agent delegation chains",
            exec:
              "Unconstrained delegation depth creates accountability gaps — the further an action is from the original human intent, the harder it is to attribute responsibility. ISO 42001 Clause 8.2 requires defined operational boundaries.",
            eng:
              "Set configurable limits on delegation depth, total tool invocations per plan, and cumulative risk score per execution. Enforce these at the orchestrator level with automatic escalation when thresholds are approached. Alert the governance dashboard when limits are breached.",
          },
        ],
      },

      /* ── Runtime (critical) ──────────────────────────── */
      {
        layerId: "runtime",
        tier: "critical",
        guidelines: [
          {
            id: "gov-rt-1",
            text: "Enforce model approval gates and version governance at the runtime",
            exec:
              "ISO 42001 Clause 8.3 requires controlled deployment of AI components. No model should reach production without passing through a documented approval process that validates fitness, bias testing, and regulatory compliance.",
            eng:
              "Implement a model registry with lifecycle states (draft, approved, deployed, deprecated, retired). Block runtime loading of models not in 'approved' or 'deployed' state. Require sign-off from both engineering and compliance before state transitions. Log all model version changes.",
          },
          {
            id: "gov-rt-2",
            text: "Implement runtime guardrails that enforce content and behavioral policies",
            exec:
              "The NIST AI RMF MAP function requires that AI systems operate within defined boundaries. Runtime guardrails are the enforcement mechanism — they translate governance policies into real-time behavioral constraints.",
            eng:
              "Deploy guardrail evaluators (NeMo Guardrails, Guardrails AI, or custom policy engines) that intercept model inputs and outputs. Enforce topic boundaries, output format constraints, factuality checks, and prohibited-content filters. Log all guardrail activations with the triggering input for policy tuning.",
          },
          {
            id: "gov-rt-3",
            text: "Capture per-invocation provenance metadata for regulatory reporting",
            exec:
              "EU AI Act Article 12 requires high-risk systems to generate logs sufficient for post-market monitoring. Per-invocation provenance — which model, which version, which parameters — is the minimum viable audit record.",
            eng:
              "Emit structured provenance events for every model invocation: model ID, version hash, prompt template ID, temperature/top-p settings, token counts, latency, and response classification. Store with the same correlation ID used by the orchestration audit trail.",
          },
          {
            id: "gov-rt-4",
            text: "Enforce data residency and processing locality constraints at runtime",
            exec:
              "GDPR, the EU AI Act, and sector regulations mandate that certain data categories are processed only within specific jurisdictions. The runtime must enforce these constraints or the entire governance framework is undermined.",
            eng:
              "Tag each runtime environment with its geographic region and data-classification clearance. Implement a pre-dispatch check that validates the request's data classification against the target runtime's clearance. Reject and re-route requests that violate residency rules. Log all routing decisions.",
          },
        ],
      },

      /* ── Gateway (critical) ──────────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "gov-gw-1",
            text: "Enforce responsible-use policies at the model gateway",
            exec:
              "The gateway is the single chokepoint for all model interactions. Microsoft's Responsible AI Standard v2 requires that AI systems include mechanisms to prevent misuse. Gateway-level enforcement ensures no request bypasses responsible-use policies.",
            eng:
              "Deploy a policy enforcement layer at the gateway that evaluates every request against the organization's responsible-use policy: blocked use cases, required disclaimers, mandatory content safety checks, and prohibited prompt patterns. Return structured denial responses with policy references when requests are blocked.",
          },
          {
            id: "gov-gw-2",
            text: "Implement cost governance and budget enforcement per agent and tenant",
            exec:
              "Uncontrolled AI inference costs are a governance failure. ISO 42001 Clause 7.1 (Resource Management) requires that organizations allocate and monitor resources for AI operations. The gateway is the natural metering point.",
            eng:
              "Track token consumption per agent, tenant, and model at the gateway. Enforce configurable budget ceilings with soft warnings and hard stops. Emit real-time cost events for the governance dashboard. Implement chargeback reports mapping consumption to business units.",
          },
          {
            id: "gov-gw-3",
            text: "Maintain a model catalog with risk classifications and approved-use boundaries",
            exec:
              "NIST AI RMF GOVERN 1.2 requires an inventory of AI systems with associated risks. The gateway's model catalog serves as the operational manifestation of this inventory, controlling which models can be used for which purposes.",
            eng:
              "Maintain a gateway-accessible model catalog recording: model ID, provider, risk classification, approved use cases, prohibited use cases, maximum context window, and data-classification clearance. Reject requests that route to a model outside its approved-use boundary. Sync the catalog with the enterprise AI inventory.",
          },
        ],
      },

      /* ── Tools (moderate) ────────────────────────────── */
      {
        layerId: "tools",
        tier: "moderate",
        guidelines: [
          {
            id: "gov-tool-1",
            text: "Maintain a governed tool registry with risk classifications and approval status",
            exec:
              "Every tool an agent can invoke extends the system's impact surface. ISO 42001 Clause 8.2 requires documented operational procedures. A governed tool registry ensures no unapproved capability enters production.",
            eng:
              "Create a tool registry recording: tool ID, description, risk tier, data access scope, approved agent roles, and last review date. Enforce registry enrollment as a prerequisite for tool availability at runtime. Trigger re-review when tools are modified or their access scope changes.",
          },
          {
            id: "gov-tool-2",
            text: "Require impact assessments for tools that modify external systems",
            exec:
              "Tools that write data, trigger workflows, or communicate externally carry higher governance burden than read-only tools. The EU AI Act's conformity assessment requirements extend to the systems AI interacts with, not just the AI itself.",
            eng:
              "Classify tools as read-only, state-modifying, or externally-communicating. Require a documented impact assessment for state-modifying and external tools covering: data affected, reversibility, maximum blast radius, and required human oversight level. Store assessments alongside the tool registry entry.",
          },
        ],
      },

      /* ── Memory (moderate) ───────────────────────────── */
      {
        layerId: "memory",
        tier: "moderate",
        guidelines: [
          {
            id: "gov-mem-1",
            text: "Enforce data retention and right-to-erasure policies in AI memory stores",
            exec:
              "GDPR Article 17 (Right to Erasure) and ISO 42001 Clause 8.4 require that organizations can delete personal data on request. AI memory stores — vector databases, conversation histories, learned preferences — are subject to these obligations.",
            eng:
              "Implement automated retention policies on all memory stores with configurable TTLs per data classification. Build a right-to-erasure pipeline that propagates deletion requests across vector stores, conversation logs, and derived embeddings. Verify deletion completeness and log erasure events for compliance evidence.",
          },
          {
            id: "gov-mem-2",
            text: "Classify and label all data entering AI memory with provenance and sensitivity tags",
            exec:
              "Governance requires knowing what data the AI system holds, where it came from, and how sensitive it is. Unlabeled memory is ungovernable memory — it cannot be audited, retained correctly, or deleted on request.",
            eng:
              "Tag all ingested data with source provenance, data classification (public, internal, confidential, restricted), and applicable regulatory regime before embedding. Propagate tags to derived artifacts (embeddings, summaries). Enforce tag-based access controls on memory retrieval queries.",
          },
        ],
      },

      /* ── State (minimal) ─────────────────────────────── */
      {
        layerId: "state",
        tier: "minimal",
        guidelines: [
          {
            id: "gov-st-1",
            text: "Ensure agent checkpoint state supports reproducibility for regulatory review",
            exec:
              "EU AI Act Article 12 and NIST AI RMF GOVERN 1.5 require that high-risk AI decisions are reproducible for audit purposes. Checkpoint state must be sufficient to recreate the agent's decision context at any historical point.",
            eng: "",
          },
        ],
      },

      /* ── Observability (critical) ────────────────────── */
      {
        layerId: "observability",
        tier: "critical",
        guidelines: [
          {
            id: "gov-obs-1",
            text: "Implement a governance dashboard with real-time compliance KPIs",
            exec:
              "ISO 42001 Clause 9.1 requires monitoring and measurement of AI management system performance. A governance dashboard translates raw telemetry into actionable compliance metrics for leadership and auditors.",
            eng:
              "Build a dashboard consuming observability events that surfaces: policy violation rate, human override frequency, model drift indicators, cost-per-decision trends, approval gate latency, and regulatory coverage gaps. Set alert thresholds aligned with risk appetite. Export reports in formats required by regulators.",
          },
          {
            id: "gov-obs-2",
            text: "Generate tamper-evident audit trails for all AI decisions and actions",
            exec:
              "The EU AI Act (Article 12) mandates automatic logging for high-risk AI systems. NIST AI RMF requires auditability across the AI lifecycle. Tamper-evident trails are the foundation of defensible compliance.",
            eng:
              "Aggregate decision events from all layers into a centralized, append-only audit store with cryptographic hash chaining. Each entry must include: timestamp, agent ID, action type, input hash, output hash, model version, and human-oversight status. Implement audit log integrity verification as a scheduled compliance check.",
          },
          {
            id: "gov-obs-3",
            text: "Monitor for model performance drift and trigger governance reviews",
            exec:
              "NIST AI RMF MEASURE 2.6 requires ongoing monitoring of AI system performance against established metrics. Model drift — in accuracy, fairness, or behavior — can silently move a compliant system out of compliance.",
            eng:
              "Implement statistical drift detection on key model metrics: output distribution, response latency, refusal rate, and fairness indicators across demographic groups. When drift exceeds configured thresholds, automatically create a governance review ticket and optionally pause the affected agent pending review.",
          },
          {
            id: "gov-obs-4",
            text: "Track and report fairness and bias metrics across protected attributes",
            exec:
              "The EU AI Act (Article 10), OECD Principle 1.2 (Fairness), and ISO 42001 Clause 6.1.2 require that AI systems are monitored for discriminatory outcomes. Observability must include fairness metrics, not just performance metrics.",
            eng:
              "Compute and log fairness metrics (demographic parity, equalized odds, disparate impact ratio) for agent decisions that affect users. Break down key performance indicators by protected attributes where legally permissible. Alert when metrics diverge beyond acceptable thresholds. Feed results into the governance dashboard.",
          },
        ],
      },

      /* ── Governance (critical) ───────────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "gov-gov-1",
            text: "Establish an AI governance policy lifecycle with version control and periodic review",
            exec:
              "ISO 42001 Clause 5.2 requires documented AI policies that are communicated, reviewed, and updated. Static policies become stale as regulations evolve and agent capabilities expand. A managed lifecycle prevents governance decay.",
            eng:
              "Store all governance policies as versioned, machine-readable artifacts in source control. Implement a review cadence (quarterly minimum) with automated reminders. Require sign-off from legal, compliance, and engineering before policy changes take effect. Maintain a changelog mapping policy versions to the regulations they address.",
          },
          {
            id: "gov-gov-2",
            text: "Implement risk classification gates at every stage of the AI lifecycle",
            exec:
              "The EU AI Act defines four risk tiers (unacceptable, high, limited, minimal) with escalating obligations. ISO 42001 Clause 6.1 requires risk assessment. Classification must happen at design, deployment, and runtime — not just once at project kickoff.",
            eng:
              "Build automated risk-classification checks into the CI/CD pipeline, deployment gates, and runtime policy engine. Evaluate agent capabilities against the EU AI Act Annex III high-risk criteria and organizational risk taxonomy. Block deployment of agents whose risk classification has not been assessed or has expired. Re-classify when capabilities change.",
          },
          {
            id: "gov-gov-3",
            text: "Define and enforce RACI accountability structures for all AI agent operations",
            exec:
              "NIST AI RMF GOVERN 1.1 and ISO 42001 Clause 5.3 require clearly defined roles and responsibilities for AI systems. Without explicit RACI mappings, accountability defaults to 'nobody' when incidents occur.",
            eng:
              "Create RACI matrices linking each agent role, data domain, and decision type to specific human roles (Responsible, Accountable, Consulted, Informed). Embed RACI references in agent metadata. Surface accountability chains in the governance dashboard. Require RACI assignment as a pre-deployment gate.",
          },
          {
            id: "gov-gov-4",
            text: "Automate regulatory compliance mapping and gap analysis",
            exec:
              "Organizations operating across jurisdictions face overlapping AI regulations (EU AI Act, NIST AI RMF, ISO 42001, sector-specific rules). Manual compliance mapping is error-prone and cannot scale with regulatory velocity.",
            eng:
              "Maintain a regulatory requirements database mapping specific obligations to platform controls. Run automated gap analysis comparing implemented controls against applicable requirements. Generate compliance reports per regulation showing coverage percentage, gaps, and remediation priorities. Update the requirements database as new regulations are published.",
          },
          {
            id: "gov-gov-5",
            text: "Mandate conformity assessments and documentation for high-risk AI agents",
            exec:
              "EU AI Act Articles 9-15 require conformity assessments, technical documentation, and quality management systems for high-risk AI. These are legal prerequisites for market access in the EU, not optional best practices.",
            eng:
              "Create conformity assessment templates covering: intended purpose, risk analysis, data governance, technical accuracy metrics, human oversight mechanisms, and cybersecurity measures. Require completed assessments before any high-risk agent enters production. Store assessments in the governance system with links to supporting evidence (test results, audit logs, bias reports).",
          },
        ],
      },

      /* ── Systems of Record (moderate) ────────────────── */
      {
        layerId: "systems",
        tier: "moderate",
        guidelines: [
          {
            id: "gov-sys-1",
            text: "Govern data exchange agreements between AI agents and external systems",
            exec:
              "When agents interact with systems of record, data crosses organizational and regulatory boundaries. ISO 42001 Clause 8.4 and GDPR Article 28 require documented data processing agreements for automated data exchanges.",
            eng:
              "Define machine-readable data exchange contracts for each agent-to-system integration specifying: data fields accessed, purpose limitation, retention obligations, and regulatory constraints. Enforce contracts at the integration layer. Audit actual data flows against contracts periodically and flag deviations.",
          },
          {
            id: "gov-sys-2",
            text: "Ensure AI-initiated changes to systems of record are attributable and reversible",
            exec:
              "OECD Principle 1.3 (Transparency and Explainability) requires that AI-driven actions on business-critical systems can be traced and explained. Irreversible, unattributed changes undermine trust and regulatory defensibility.",
            eng:
              "Require all agent-initiated writes to external systems to carry a governance metadata envelope: agent ID, authorization chain, decision rationale, and rollback instructions. Implement compensating transactions or soft-delete patterns for reversibility. Surface agent-initiated change reports in the governance dashboard.",
          },
        ],
      },
    ],
  },
];
