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
    icon: "\u{2696}",
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

  /* ================================================================ */
  /*  PILLAR 3 — AI Factory (MLOps / LLMOps)                         */
  /* ================================================================ */
  {
    id: "ai-factory",
    name: "AI Factory (MLOps / LLMOps)",
    icon: "\u{2699}",
    exec:
      "Agentic AI platforms depend on a continuous lifecycle of model development, evaluation, deployment, and monitoring that extends well beyond traditional software CI/CD. Without disciplined MLOps and LLMOps practices — model registries, evaluation pipelines, prompt versioning, drift detection, and embedding management — organizations ship brittle AI that degrades silently in production. The AI Factory pillar establishes the engineering discipline that turns experimental models into reliable, versioned, observable production assets across every architecture layer.",
    eng:
      "Treat models, prompts, and embeddings as first-class versioned artifacts with full lineage tracking. Implement evaluation-driven development where no model or prompt change reaches production without passing automated benchmark suites, red-team tests, and regression checks. Build continuous training and fine-tuning pipelines with reproducible data lineage. Deploy models using canary and blue-green strategies with automated rollback on metric degradation. Monitor for concept drift, data drift, and performance decay with statistical tests that trigger retraining or human review.",
    citations: [
      {
        id: "google-mlops",
        label: "Practitioners Guide to MLOps — Google Cloud",
        url: "https://services.google.com/fh/files/misc/practitioners_guide_to_mlops_whitepaper.pdf",
        org: "Google",
      },
      {
        id: "azure-mlops-waf",
        label: "Azure Well-Architected Framework — MLOps for Machine Learning",
        url: "https://learn.microsoft.com/en-us/azure/well-architected/ai/mlops-machine-learning",
        org: "Microsoft",
      },
      {
        id: "cncf-cloud-native-ai",
        label: "CNCF Cloud Native Artificial Intelligence Whitepaper",
        url: "https://www.cncf.io/reports/cloud-native-artificial-intelligence-whitepaper/",
        org: "CNCF",
      },
      {
        id: "hf-model-cards",
        label: "Hugging Face Model Cards Documentation",
        url: "https://huggingface.co/docs/hub/en/model-cards",
        org: "Hugging Face",
      },
      {
        id: "mlflow-model-registry",
        label: "MLflow Model Registry — Centralized Model Lifecycle Management",
        url: "https://mlflow.org/docs/latest/model-registry.html",
        org: "MLflow / Linux Foundation",
      },
    ],
    cells: [
      /* ── Surface (minimal) ──────────────────────────────── */
      {
        layerId: "surface",
        tier: "minimal",
        guidelines: [
          {
            id: "fac-surf-1",
            text: "Expose model version and evaluation metadata in user-facing responses",
            exec:
              "Users and support teams need to correlate AI behavior with specific model versions. Surfacing model lineage metadata in responses enables rapid triage when output quality shifts after a deployment.",
            eng: "",
          },
        ],
      },

      /* ── Identity (minimal) ─────────────────────────────── */
      {
        layerId: "identity",
        tier: "minimal",
        guidelines: [
          {
            id: "fac-id-1",
            text: "Bind model deployment approvals to identity-scoped authorization gates",
            exec:
              "Model promotion from staging to production is a high-impact action. Tying deployment approval to verified human identities with RBAC ensures accountability and prevents unauthorized model pushes.",
            eng: "",
          },
        ],
      },

      /* ── Orchestration (moderate) ───────────────────────── */
      {
        layerId: "orchestration",
        tier: "moderate",
        guidelines: [
          {
            id: "fac-orch-1",
            text: "Version and test orchestration prompt templates as part of the CI/CD pipeline",
            exec:
              "Prompt templates are code. Unversioned prompt changes silently alter agent behavior and make regressions impossible to diagnose. Treating prompts as versioned, tested artifacts prevents drift between intended and actual orchestration logic.",
            eng:
              "Store prompt templates in source control alongside application code. Assign semantic versions on every change. Run evaluation suites (exact-match, LLM-as-judge, human-preference) against a golden dataset before merging. Tag deployed prompt versions in the model gateway for traceability.",
          },
          {
            id: "fac-orch-2",
            text: "Implement evaluation-driven development for agent plan generation",
            exec:
              "Orchestration quality is measurable. Without systematic evaluation of plan correctness, tool-selection accuracy, and task-completion rates, teams optimize blindly and regressions reach production undetected.",
            eng:
              "Build an evaluation harness that scores orchestration outputs against curated test scenarios covering happy paths, edge cases, and adversarial inputs. Track metrics (plan accuracy, tool-selection F1, end-to-end success rate) per prompt version. Gate deployments on regression thresholds.",
          },
        ],
      },

      /* ── Runtime (moderate) ─────────────────────────────── */
      {
        layerId: "runtime",
        tier: "moderate",
        guidelines: [
          {
            id: "fac-rt-1",
            text: "Deploy model updates using canary and blue-green strategies with automated rollback",
            exec:
              "Model deployments carry inherent risk — fine-tuning regressions, quantization artifacts, and distribution shifts can degrade quality in ways unit tests miss. Progressive rollout with automated rollback limits blast radius to a fraction of traffic.",
            eng:
              "Implement canary deployments that route a configurable traffic percentage (start at 5%) to the new model version. Monitor key metrics (latency, error rate, evaluation scores, user satisfaction signals) against the baseline. Auto-rollback if degradation exceeds thresholds. Promote to 100% only after statistical significance is reached.",
          },
          {
            id: "fac-rt-2",
            text: "Enforce model resource quotas and hardware affinity at the runtime scheduler",
            exec:
              "LLMs and fine-tuned models have heterogeneous compute requirements — GPU memory, batch size limits, quantization constraints. The runtime must schedule model workloads to appropriate hardware or inference fails unpredictably.",
            eng:
              "Tag model artifacts with resource requirements (GPU type, VRAM, quantization level). Configure the runtime scheduler (Kubernetes with GPU operator, or managed inference endpoints) to match models to compatible hardware. Set per-model concurrency limits to prevent memory exhaustion. Alert when resource utilization exceeds 80%.",
          },
        ],
      },

      /* ── Gateway (critical) ─────────────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "fac-gw-1",
            text: "Operate a centralized model registry with lifecycle states and approval gates",
            exec:
              "A model registry is the single source of truth for which models exist, their lineage, evaluation results, and deployment status. Without one, teams deploy ad-hoc model files with no provenance, versioning, or rollback capability — the ML equivalent of deploying untracked binaries to production.",
            eng:
              "Deploy a model registry (MLflow, Azure ML Model Registry, or Vertex AI Model Registry) with enforced lifecycle states: Registered, Validated, Approved, Deployed, Deprecated, Archived. Require automated evaluation gate passage and human sign-off before Approved state. Store model artifacts with cryptographic hashes, training run links, dataset versions, and evaluation metrics. Block deployment of models not in Approved state.",
          },
          {
            id: "fac-gw-2",
            text: "Implement LLM-specific CI/CD with prompt testing and evaluation suites",
            exec:
              "Traditional CI/CD validates code correctness with deterministic tests. LLM-based systems require probabilistic evaluation — prompt regression tests, benchmark suites, red-team adversarial tests, and LLM-as-judge scoring — integrated into the deployment pipeline to catch quality regressions before production.",
            eng:
              "Build a CI pipeline that runs on every prompt or model change: (1) unit-level prompt tests with expected output patterns, (2) benchmark evaluation against domain-specific datasets, (3) red-team test suites for adversarial robustness, (4) LLM-as-judge scoring for open-ended quality. Set pass/fail thresholds per metric. Store all evaluation results with the model registry entry. Fail the pipeline if any metric regresses beyond the configured tolerance.",
          },
          {
            id: "fac-gw-3",
            text: "Route traffic across model versions using gateway-level A/B testing",
            exec:
              "Comparing model versions in production requires controlled experimentation at the gateway. Without A/B infrastructure, teams rely on offline evaluations that fail to capture real-world user behavior and edge cases.",
            eng:
              "Implement traffic-splitting at the model gateway that routes requests to model variants by percentage, user cohort, or feature flag. Collect per-variant metrics (latency, token usage, user feedback, task completion). Run statistical significance tests before declaring a winner. Integrate results back into the model registry as production evaluation evidence.",
          },
          {
            id: "fac-gw-4",
            text: "Track prompt and model version lineage across the full request lifecycle",
            exec:
              "When a production issue arises, teams need to answer: which model version, which prompt version, and which configuration produced this output? Without end-to-end lineage, debugging is guesswork and reproducibility is impossible.",
            eng:
              "Attach version metadata (model ID, model hash, prompt template version, inference config) to every gateway request as propagated headers. Log this lineage alongside the response. Enable querying historical requests by any lineage dimension. Link lineage records to the model registry and prompt version control system.",
          },
        ],
      },

      /* ── Tools (moderate) ───────────────────────────────── */
      {
        layerId: "tools",
        tier: "moderate",
        guidelines: [
          {
            id: "fac-tool-1",
            text: "Version and evaluate tool-calling schemas alongside model and prompt changes",
            exec:
              "Tool schemas define the contract between the LLM and external capabilities. Schema changes can break tool invocation accuracy as severely as a model swap. They must be versioned, tested, and deployed with the same rigor as model artifacts.",
            eng:
              "Store tool schemas in the same version control as prompt templates. Include tool-calling accuracy in the evaluation suite — measure whether the model selects the correct tool, generates valid parameters, and handles tool errors gracefully. Gate deployments on tool-call regression thresholds.",
          },
          {
            id: "fac-tool-2",
            text: "Instrument tools to emit performance telemetry for model evaluation feedback loops",
            exec:
              "Tool execution outcomes are ground-truth signals for model quality. A model that generates syntactically valid but semantically wrong tool calls will only be caught if tool-level success and failure metrics flow back into the evaluation pipeline.",
            eng:
              "Emit structured telemetry from every tool execution: success/failure, latency, input parameters, output summary, and error classification. Feed tool success rates into model evaluation dashboards. Use tool failure patterns to generate regression test cases for the prompt evaluation suite.",
          },
        ],
      },

      /* ── Memory (critical) ──────────────────────────────── */
      {
        layerId: "memory",
        tier: "critical",
        guidelines: [
          {
            id: "fac-mem-1",
            text: "Manage embedding pipelines as versioned, reproducible ML artifacts",
            exec:
              "RAG quality depends entirely on embedding quality. Changing the embedding model, chunk strategy, or preprocessing pipeline without versioning and evaluation creates silent retrieval degradation that manifests as worse agent responses with no clear root cause.",
            eng:
              "Version the full embedding pipeline: embedding model ID, chunking strategy, preprocessing steps, and metadata extraction rules. Store pipeline configurations alongside the model registry. When any component changes, re-evaluate retrieval quality (precision@k, recall@k, MRR) against a golden query set before deploying the new index. Maintain rollback capability by retaining the previous index version.",
          },
          {
            id: "fac-mem-2",
            text: "Implement continuous retrieval quality monitoring with automated alerting",
            exec:
              "Embedding quality degrades over time as source documents change, user queries evolve, and embedding model behavior drifts. Without continuous monitoring, RAG pipelines silently return increasingly irrelevant context, degrading every downstream agent response.",
            eng:
              "Sample production retrieval queries and score relevance (using LLM-as-judge or human annotation) on a recurring schedule. Track retrieval precision, recall, and semantic similarity distributions. Alert when metrics drop below baseline thresholds. Trigger re-indexing or embedding model re-evaluation when degradation is confirmed.",
          },
          {
            id: "fac-mem-3",
            text: "Automate knowledge base ingestion with data quality validation gates",
            exec:
              "Garbage in, garbage out applies directly to RAG memory stores. Unvalidated document ingestion introduces stale, contradictory, or malformed content that pollutes retrieval results across the entire platform.",
            eng:
              "Build an automated ingestion pipeline with validation stages: format verification, deduplication, freshness checks (reject documents older than configured thresholds), content-quality scoring (readability, completeness), and conflict detection against existing indexed content. Log all rejected documents with rejection reasons. Run the pipeline on a schedule or trigger on source-system change events.",
          },
          {
            id: "fac-mem-4",
            text: "Track data lineage from source documents through embeddings to agent responses",
            exec:
              "When an agent produces a wrong answer sourced from RAG, teams must trace backward: which document, which chunk, which embedding version, and which retrieval query led to this output? Without lineage, root-cause analysis is impossible and the same failure repeats.",
            eng:
              "Assign unique IDs to source documents, chunks, and embedding versions. Propagate these IDs through the retrieval pipeline into the agent's context window. Log the chunk IDs that contributed to each response alongside the model's output. Enable querying: given a response, show the source documents; given a document, show all responses it influenced.",
          },
        ],
      },

      /* ── State (minimal) ────────────────────────────────── */
      {
        layerId: "state",
        tier: "minimal",
        guidelines: [
          {
            id: "fac-st-1",
            text: "Persist experiment and training run metadata in agent checkpoint state",
            exec:
              "When fine-tuned or continuously-trained models serve agent workflows, the training provenance (dataset version, hyperparameters, evaluation scores) must be recoverable from the agent's deployment state for reproducibility and audit.",
            eng: "",
          },
        ],
      },

      /* ── Observability (critical) ───────────────────────── */
      {
        layerId: "observability",
        tier: "critical",
        guidelines: [
          {
            id: "fac-obs-1",
            text: "Implement statistical drift detection for model outputs and input distributions",
            exec:
              "Models degrade silently in production as user behavior shifts, data distributions change, and the world evolves past training data. Without drift detection, teams discover degradation only when users complain — weeks or months after quality declined.",
            eng:
              "Compute distributional statistics on model inputs (embedding centroid distance, token distribution) and outputs (response length distribution, confidence scores, refusal rates) using sliding windows. Apply statistical tests (PSI, KL divergence, KS test) against baseline distributions established at deployment time. Alert when drift exceeds configured thresholds. Integrate drift signals into the model registry as production health metadata.",
          },
          {
            id: "fac-obs-2",
            text: "Track model evaluation metrics continuously in production, not just at deploy time",
            exec:
              "Offline evaluation captures a snapshot. Production evaluation captures reality. Models that pass pre-deployment benchmarks can still fail on real-world distribution, adversarial inputs, or novel edge cases that the evaluation set did not cover.",
            eng:
              "Sample production requests and run them through the same evaluation pipeline used in CI/CD — LLM-as-judge scoring, factuality checks, tool-call accuracy, and user satisfaction proxies. Compute metrics on rolling windows (hourly, daily). Display production evaluation scores alongside deployment-time scores in the model registry. Trigger review when production scores diverge from deployment baselines.",
          },
          {
            id: "fac-obs-3",
            text: "Monitor cost-per-inference and token efficiency across model versions",
            exec:
              "AI inference cost scales with token consumption and model size. Without per-version cost tracking, teams cannot evaluate the cost-quality tradeoff of model upgrades, quantization strategies, or prompt optimizations.",
            eng:
              "Meter input and output tokens per request at the gateway and attribute costs to the specific model version, prompt version, and agent. Aggregate into cost dashboards showing cost-per-request, cost-per-successful-task, and cost trends over time. Compare cost efficiency across model versions. Alert on cost anomalies (e.g., a prompt change that doubles average token consumption).",
          },
          {
            id: "fac-obs-4",
            text: "Emit structured experiment-tracking telemetry for fine-tuning and retraining runs",
            exec:
              "Fine-tuning and continuous training produce dozens of experimental runs. Without structured experiment tracking, teams lose reproducibility, duplicate work, and cannot systematically identify the best-performing configuration.",
            eng:
              "Integrate experiment tracking (MLflow, Weights & Biases, or Azure ML Experiments) into all training pipelines. Log hyperparameters, dataset versions, training curves, evaluation metrics, and hardware utilization for every run. Link successful experiments to model registry entries. Enable comparison dashboards for selecting promotion candidates.",
          },
        ],
      },

      /* ── Governance (critical) ──────────────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "fac-gov-1",
            text: "Enforce model approval workflows with mandatory evaluation, bias testing, and sign-off",
            exec:
              "Deploying a model to production is a governed act. Without mandatory approval workflows — including automated evaluation, bias assessment, and human sign-off — organizations risk deploying undertested models that fail unpredictably or discriminate against protected groups.",
            eng:
              "Define a model promotion workflow: (1) automated evaluation suite must pass, (2) bias and fairness metrics must meet thresholds, (3) model card must be complete, (4) designated reviewer must approve. Enforce the workflow through the model registry lifecycle states. Block promotion to Deployed without all gates cleared. Log all approval decisions with reviewer identity and evaluation evidence.",
          },
          {
            id: "fac-gov-2",
            text: "Require model cards with standardized documentation for every production model",
            exec:
              "Model cards (per Hugging Face and Google's framework) provide the minimum viable documentation for responsible model deployment: intended use, limitations, evaluation results, bias analysis, and training data provenance. Without them, downstream consumers operate blind.",
            eng:
              "Generate model cards automatically from training metadata and evaluation results. Require fields: model description, intended use cases, out-of-scope uses, training data summary, evaluation benchmarks with scores, known limitations, and ethical considerations. Store cards alongside model artifacts in the registry. Validate card completeness as a deployment gate.",
          },
          {
            id: "fac-gov-3",
            text: "Maintain full data lineage from training data through model to production predictions",
            exec:
              "Regulatory frameworks (EU AI Act Article 10, NIST AI RMF) require traceability of training data. When a model produces a harmful output, the organization must be able to trace back to the data that shaped that behavior. Data lineage is both a compliance requirement and a debugging necessity.",
            eng:
              "Track dataset versions, preprocessing transformations, and sampling strategies for every training run. Link training datasets to model registry entries. Record which production predictions were generated by which model trained on which data. Enable forward queries (given a dataset, which models were trained on it?) and backward queries (given a prediction, what data influenced the model?).",
          },
          {
            id: "fac-gov-4",
            text: "Establish retraining and deprecation policies for model lifecycle management",
            exec:
              "Models have shelf lives. Training data becomes stale, performance degrades via drift, and newer architectures outperform incumbents. Without explicit retraining schedules and deprecation policies, organizations accumulate technical debt in the form of unmaintained models serving production traffic.",
            eng:
              "Define maximum model age and minimum performance thresholds per use case. Automate retraining triggers based on drift alerts, performance degradation, or scheduled cadence. Implement a deprecation workflow: notify dependent teams, set a sunset date, migrate traffic, archive the model. Track model age and drift status in the governance dashboard.",
          },
        ],
      },

      /* ── Systems of Record (moderate) ───────────────────── */
      {
        layerId: "systems",
        tier: "moderate",
        guidelines: [
          {
            id: "fac-sys-1",
            text: "Integrate feature stores with systems of record for consistent training and inference data",
            exec:
              "Training-serving skew — where the features used during training differ from those available at inference — is a top cause of production ML failures. A feature store that reads from the same systems of record for both training and serving eliminates this class of bug.",
            eng:
              "Deploy a feature store (Feast, Tecton, or Azure ML Feature Store) that materializes features from systems of record into both offline (training) and online (inference) stores. Ensure feature definitions are shared between training pipelines and serving endpoints. Monitor feature freshness and alert when online features lag offline by more than the configured SLA.",
          },
          {
            id: "fac-sys-2",
            text: "Validate data contracts between ML pipelines and upstream source systems",
            exec:
              "ML pipelines break when upstream systems change schemas, value distributions, or data availability without notice. Data contract validation catches these breaks at ingestion rather than surfacing as mysterious model degradation weeks later.",
            eng:
              "Define data contracts (Great Expectations, Soda, or Pydantic schemas) for every data source consumed by ML pipelines. Validate contracts on every pipeline run: schema checks, null rates, distribution bounds, freshness requirements. Fail pipelines early on contract violations. Notify both the ML team and the upstream data owner when contracts break.",
          },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  PILLAR 4 — AI Sovereignty                                       */
  /* ================================================================ */
  {
    id: "ai-sovereignty",
    name: "AI Sovereignty",
    icon: "\u{1F3DB}",
    exec:
      "Dependence on a single cloud provider or model vendor for core AI capabilities creates strategic risk — vendor lock-in, jurisdictional exposure, supply-chain fragility, and loss of competitive differentiation. AI sovereignty ensures an organization retains control over where inference runs, which models it can use, how training data and fine-tunes are governed, and whether it can switch providers without rebuilding the platform. This pillar addresses compute sovereignty, model sovereignty, data jurisdiction, and strategic autonomy across every architecture layer.",
    eng:
      "Architect every layer with provider abstraction as a first-class concern. Use standardized inference APIs (OpenAI-compatible endpoints), deploy open-weight models alongside proprietary ones, enforce jurisdictional routing at the gateway, and run sensitive workloads in confidential computing enclaves. Treat model weights, fine-tunes, and embeddings as organizational assets with explicit custody policies. Design for multi-cloud and on-premises deployment from day one — sovereignty is an architectural property, not a migration project.",
    citations: [
      {
        id: "eu-ai-act-sov",
        label: "EU AI Act — Regulation (EU) 2024/1689",
        url: "https://artificialintelligenceact.eu/the-act/",
        org: "European Union",
      },
      {
        id: "gaia-x-framework",
        label: "Gaia-X — European Data and AI Sovereignty Framework",
        url: "https://gaia-x.eu/what-is-gaia-x/",
        org: "Gaia-X AISBL",
      },
      {
        id: "oecd-ai-sov",
        label: "OECD AI Principles — Inclusive Growth and Sustainable Development",
        url: "https://oecd.ai/en/ai-principles",
        org: "OECD",
      },
      {
        id: "azure-confidential",
        label: "Azure Confidential Computing — Trusted Execution for AI Workloads",
        url: "https://learn.microsoft.com/en-us/azure/confidential-computing/overview",
        org: "Microsoft",
      },
      {
        id: "aws-sovereign-cloud",
        label: "AWS European Sovereign Cloud",
        url: "https://aws.amazon.com/blogs/security/aws-european-sovereign-cloud/",
        org: "AWS",
      },
    ],
    cells: [
      /* ── Surface (minimal) ──────────────────────────────── */
      {
        layerId: "surface",
        tier: "minimal",
        guidelines: [
          {
            id: "sov-surf-1",
            text: "Display data residency and inference jurisdiction indicators in the user interface",
            exec:
              "Users and compliance officers need visibility into where their data is processed and which jurisdiction governs the AI interaction. Transparency about processing locality builds trust and satisfies EU AI Act Article 13 transparency obligations.",
            eng: "",
          },
        ],
      },

      /* ── Identity (moderate) ─────────────────────────────── */
      {
        layerId: "identity",
        tier: "moderate",
        guidelines: [
          {
            id: "sov-id-1",
            text: "Decouple identity federation from any single cloud provider's IAM",
            exec:
              "Binding agent and user identity to a single cloud provider's identity stack creates a hard dependency that blocks multi-cloud and on-premises deployment. Sovereign identity requires provider-neutral federation.",
            eng:
              "Implement identity using open standards (OIDC, SAML 2.0, SCIM) with a self-managed or portable identity provider. Avoid provider-proprietary identity features (custom claims, provider-specific roles) that cannot be replicated across clouds. Test identity flows against at least two providers to validate portability.",
          },
          {
            id: "sov-id-2",
            text: "Enforce jurisdictional constraints on identity token issuance and validation",
            exec:
              "Identity tokens that cross jurisdictional boundaries may violate data residency requirements. Token issuance and validation infrastructure must respect the same geographic constraints as data processing.",
            eng:
              "Deploy identity endpoints in each required jurisdiction. Configure token issuance to embed jurisdiction metadata. Validate that tokens are consumed only within their designated region. Alert on cross-jurisdictional token usage that violates policy.",
          },
        ],
      },

      /* ── Orchestration (moderate) ────────────────────────── */
      {
        layerId: "orchestration",
        tier: "moderate",
        guidelines: [
          {
            id: "sov-orch-1",
            text: "Implement provider-agnostic orchestration that can target any compliant runtime",
            exec:
              "Orchestration logic that hardcodes provider-specific APIs (Azure OpenAI, Bedrock, Vertex) creates vendor lock-in at the decision-making core of the platform. Sovereign orchestration must be retargetable without rewriting agent logic.",
            eng:
              "Abstract model invocation behind a unified interface that accepts standard request formats and routes to pluggable backends. Use open orchestration frameworks (LangChain, Semantic Kernel, or custom abstraction layers) with swappable LLM providers. Validate orchestration behavior is identical across at least two backend providers.",
          },
          {
            id: "sov-orch-2",
            text: "Support jurisdiction-aware task routing in multi-step agent plans",
            exec:
              "Complex agent workflows may span data from multiple jurisdictions. The orchestrator must route individual plan steps to infrastructure that satisfies the jurisdictional requirements of the data being processed, not just the user's location.",
            eng:
              "Tag orchestration plan steps with data-classification and jurisdiction metadata. Implement a routing resolver that selects the target runtime based on jurisdictional constraints, data residency rules, and available sovereign infrastructure. Log all routing decisions for audit. Reject plans that cannot be satisfied within compliant infrastructure.",
          },
        ],
      },

      /* ── Runtime (critical) ──────────────────────────────── */
      {
        layerId: "runtime",
        tier: "critical",
        guidelines: [
          {
            id: "sov-rt-1",
            text: "Deploy open-weight models as sovereign alternatives to proprietary APIs",
            exec:
              "Exclusive dependence on proprietary model APIs (GPT-4, Claude, Gemini) means a pricing change, terms-of-service update, or service discontinuation can cripple the platform overnight. Open-weight models (Llama, Mistral, Qwen) provide a sovereign fallback that the organization fully controls.",
            eng:
              "Maintain deployment-ready open-weight models (Llama 3, Mistral, Mixtral, or domain-specific fine-tunes) on self-managed infrastructure. Benchmark open-weight alternatives against proprietary models for each use case. Implement automatic failover from proprietary APIs to self-hosted models when external endpoints are unavailable or non-compliant.",
          },
          {
            id: "sov-rt-2",
            text: "Run sensitive inference workloads in confidential computing enclaves",
            exec:
              "Standard cloud VMs expose inference data to the cloud operator's privileged software stack. For regulated industries and sovereign AI requirements, confidential computing (TEEs) ensures that neither the cloud provider nor any privileged software can access model inputs, outputs, or weights during processing.",
            eng:
              "Deploy inference for sensitive workloads on confidential computing infrastructure (Azure Confidential VMs with AMD SEV-SNP, AWS Nitro Enclaves, or Intel TDX). Verify attestation reports before routing traffic. Encrypt model weights at rest and in transit with keys held in a customer-managed HSM. Benchmark performance overhead and maintain a non-confidential fast path for non-sensitive workloads.",
          },
          {
            id: "sov-rt-3",
            text: "Enforce compute residency so inference runs only in approved jurisdictions",
            exec:
              "Data sovereignty extends to compute — processing EU citizen data on US-jurisdiction GPUs may violate GDPR and the EU AI Act even if the data is encrypted in transit. Compute residency ensures inference runs where policy dictates.",
            eng:
              "Tag all runtime nodes with geographic region and jurisdictional clearance. Implement a pre-dispatch admission controller that validates the request's data jurisdiction against the target node's clearance. Reject and re-route requests that violate residency policy. Maintain a real-time inventory of sovereign compute capacity per region. Alert when capacity in a required jurisdiction falls below a safe threshold.",
          },
          {
            id: "sov-rt-4",
            text: "Retain custody of model weights, fine-tunes, and adapter layers as organizational assets",
            exec:
              "Fine-tuned models and LoRA adapters encode proprietary business logic and domain expertise. Hosting them exclusively on a vendor's platform without export rights means losing this intellectual property if the vendor relationship ends.",
            eng:
              "Store all model weights, fine-tuned checkpoints, and adapters in organization-controlled storage with defined export procedures. Verify export capability before committing to any training platform. Maintain local copies of all production model artifacts. Include model custody rights in vendor contracts.",
          },
        ],
      },

      /* ── Gateway (critical) ──────────────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "sov-gw-1",
            text: "Implement a multi-provider model gateway with standardized routing interfaces",
            exec:
              "A gateway locked to one model provider is the single biggest sovereignty failure point. A multi-provider gateway with a uniform API contract enables provider switching, cost optimization, and jurisdictional routing without changing any upstream code.",
            eng:
              "Deploy a model gateway (LiteLLM, Portkey, or custom) that exposes a unified OpenAI-compatible API and routes to multiple backends — Azure OpenAI, AWS Bedrock, Google Vertex, self-hosted vLLM/TGI, and on-premises endpoints. Implement provider-selection logic based on: cost, latency, jurisdiction, data classification, and availability. Maintain provider health checks and automatic failover.",
          },
          {
            id: "sov-gw-2",
            text: "Enforce jurisdictional routing policies at the gateway for all model requests",
            exec:
              "The gateway is the natural enforcement point for data residency. Every model request must be evaluated against jurisdictional policies before routing — not after. Routing EU-regulated prompts to US endpoints and filtering after the fact does not satisfy GDPR or the EU AI Act.",
            eng:
              "Implement a pre-routing policy engine at the gateway that inspects request metadata (user region, data classification, regulatory tags) and selects only model endpoints within compliant jurisdictions. Maintain a jurisdiction-to-endpoint mapping updated by the compliance team. Log all routing decisions. Block requests when no compliant endpoint is available rather than routing to a non-compliant one.",
          },
          {
            id: "sov-gw-3",
            text: "Monitor and report vendor concentration risk across model consumption",
            exec:
              "If 95% of inference traffic flows to a single provider, the organization has nominal multi-provider support but actual single-vendor dependency. Concentration risk must be measured and managed at the gateway, not assumed away by having multiple providers configured.",
            eng:
              "Track per-provider traffic share, cost share, and availability metrics at the gateway. Set concentration thresholds (e.g., no single provider exceeds 70% of total inference volume). Alert when thresholds are approached. Report concentration metrics on the governance dashboard. Periodically test failover to secondary providers under realistic load.",
          },
          {
            id: "sov-gw-4",
            text: "Maintain gateway portability with no proprietary cloud-service dependencies",
            exec:
              "A model gateway that depends on a proprietary cloud service (e.g., Azure API Management, AWS API Gateway) for its core routing logic transfers the lock-in problem from the model layer to the infrastructure layer. The gateway itself must be portable.",
            eng:
              "Deploy the gateway on portable infrastructure (containers, Kubernetes) using open-source or self-managed components. Avoid embedding cloud-proprietary features (custom policies, managed caching) into the critical routing path. Validate gateway portability by deploying to at least two cloud environments in staging.",
          },
        ],
      },

      /* ── Tools (moderate) ────────────────────────────────── */
      {
        layerId: "tools",
        tier: "moderate",
        guidelines: [
          {
            id: "sov-tool-1",
            text: "Use open standards and protocols for tool integrations to avoid vendor lock-in",
            exec:
              "Tools that integrate via proprietary SDKs or cloud-specific connectors create hidden vendor dependencies. Each proprietary integration is a migration cost that compounds as the tool ecosystem grows.",
            eng:
              "Prefer tools that expose standard APIs (REST, GraphQL, MCP, OpenAPI). Wrap proprietary integrations behind an adapter interface so the tool contract is stable regardless of the backing service. Test critical tool integrations against at least two backend implementations.",
          },
          {
            id: "sov-tool-2",
            text: "Ensure tool execution respects data jurisdictional boundaries",
            exec:
              "Tools that call external APIs may transmit data across jurisdictions. A sovereign tool layer must enforce the same residency constraints that govern model inference — the data does not become less regulated because a tool rather than a model processes it.",
            eng:
              "Tag tool endpoints with geographic and jurisdictional metadata. Route tool invocations through the same jurisdictional policy engine used by the gateway. Block tool calls that would transmit regulated data to non-compliant endpoints. Log all cross-jurisdictional tool data flows.",
          },
        ],
      },

      /* ── Memory (critical) ───────────────────────────────── */
      {
        layerId: "memory",
        tier: "critical",
        guidelines: [
          {
            id: "sov-mem-1",
            text: "Host vector stores and knowledge bases on sovereign infrastructure with jurisdictional controls",
            exec:
              "RAG memory stores contain organizational knowledge — often the most sensitive data in the AI platform. Hosting embeddings on a vendor-controlled service with no data residency guarantees exposes the organization to jurisdictional risk and vendor lock-in simultaneously.",
            eng:
              "Deploy vector databases (Qdrant, Weaviate, Milvus, or pgvector) on self-managed or sovereign cloud infrastructure. Enforce data residency at the storage layer — embeddings derived from EU data must reside in EU infrastructure. Maintain the ability to migrate vector stores between providers by using open embedding formats and portable database engines.",
          },
          {
            id: "sov-mem-2",
            text: "Retain custody of all embeddings and ensure embedding model portability",
            exec:
              "Embeddings encode proprietary knowledge in vector form. If the embedding model is available only as a vendor API and the vendor changes or discontinues it, the entire knowledge base must be re-embedded — a costly and disruptive process.",
            eng:
              "Use open-weight embedding models (BGE, E5, GTE, or Nomic Embed) that can be self-hosted alongside vendor APIs. Store embedding model artifacts locally. Maintain re-indexing pipelines that can regenerate the vector store from source documents when the embedding model changes. Test embedding model migration annually.",
          },
          {
            id: "sov-mem-3",
            text: "Encrypt memory stores with customer-managed keys not controlled by the infrastructure provider",
            exec:
              "Encryption with provider-managed keys does not constitute sovereignty — the provider retains technical access to decrypt. True data sovereignty requires customer-managed encryption keys held in infrastructure the organization controls.",
            eng:
              "Encrypt all vector stores and knowledge bases at rest using keys from a customer-managed HSM or key vault deployed in the organization's own infrastructure. Implement envelope encryption so storage-layer encryption is independent of the cloud provider's encryption stack. Rotate keys on a defined schedule and verify that provider-side access to plaintext is cryptographically impossible.",
          },
        ],
      },

      /* ── State (moderate) ────────────────────────────────── */
      {
        layerId: "state",
        tier: "moderate",
        guidelines: [
          {
            id: "sov-st-1",
            text: "Store agent checkpoint and session state on portable, jurisdiction-compliant infrastructure",
            exec:
              "Agent state includes intermediate reasoning, tool outputs, and user context — all potentially regulated data. State storage must respect the same jurisdictional and portability requirements as all other data layers.",
            eng:
              "Deploy state storage on portable database engines (PostgreSQL, Redis, DynamoDB-compatible alternatives) that can run on any cloud or on-premises. Tag state partitions with jurisdiction metadata. Enforce residency at the storage layer. Maintain export and migration procedures for state data to support provider transitions.",
          },
          {
            id: "sov-st-2",
            text: "Avoid proprietary state serialization formats that create migration barriers",
            exec:
              "State serialized in a vendor-specific format (proprietary checkpoint schemas, cloud-specific blob encodings) becomes a migration blocker. When switching providers, state that cannot be deserialized forces cold starts and data loss.",
            eng:
              "Use open serialization formats (JSON, Protocol Buffers, Apache Avro) for all agent state persistence. Define and document state schemas explicitly. Test state deserialization across target environments. Include state migration in provider-switch runbooks.",
          },
        ],
      },

      /* ── Observability (moderate) ────────────────────────── */
      {
        layerId: "observability",
        tier: "moderate",
        guidelines: [
          {
            id: "sov-obs-1",
            text: "Use open telemetry standards to avoid observability vendor lock-in",
            exec:
              "Observability data — traces, metrics, logs — is critical operational context. Binding it to a proprietary APM vendor means losing historical operational intelligence when switching providers and rebuilding dashboards and alerts from scratch.",
            eng:
              "Instrument all platform components using OpenTelemetry (OTLP) for traces, metrics, and logs. Route telemetry through an OpenTelemetry Collector that can fan out to multiple backends (Grafana, Datadog, Azure Monitor, self-hosted Jaeger/Prometheus). Avoid vendor-specific instrumentation SDKs in application code.",
          },
          {
            id: "sov-obs-2",
            text: "Retain observability data in organization-controlled storage with jurisdictional compliance",
            exec:
              "Observability data often contains prompts, completions, and user metadata — all subject to data residency rules. Sending this telemetry to an overseas SaaS observability platform may violate the same regulations the platform itself is designed to satisfy.",
            eng:
              "Store observability data in jurisdiction-compliant infrastructure. When using SaaS observability, verify data residency guarantees contractually. For sensitive workloads, deploy self-hosted observability stacks (Grafana + Loki + Tempo + Mimir) in sovereign infrastructure. Apply the same data-classification and retention policies to observability data as to production data.",
          },
        ],
      },

      /* ── Governance (critical) ───────────────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "sov-gov-1",
            text: "Establish a multi-provider strategy with documented exit plans for each vendor dependency",
            exec:
              "Strategic autonomy requires that no single vendor termination can halt AI operations. The Gaia-X framework and OECD AI Principles both emphasize that organizations must maintain self-determination in their AI capabilities. An exit plan is not pessimism — it is due diligence.",
            eng:
              "Document every vendor dependency in the AI platform: model APIs, cloud infrastructure, embedding services, vector databases, observability tools. For each, define: alternative provider, migration effort estimate, data export procedure, and maximum acceptable switchover time. Test the highest-risk exit plan annually. Report vendor dependency status on the governance dashboard.",
          },
          {
            id: "sov-gov-2",
            text: "Define and enforce a sovereign AI policy covering compute, model, and data jurisdiction",
            exec:
              "Without an explicit sovereignty policy, teams make ad-hoc vendor and deployment decisions that accumulate into ungovernable dependency. A codified policy ensures consistent sovereign posture across all teams and workloads.",
            eng:
              "Create a machine-readable sovereignty policy covering: approved inference jurisdictions per data classification, minimum open-weight model coverage per use case, maximum single-vendor concentration thresholds, mandatory encryption key custody requirements, and approved cloud regions. Enforce the policy through CI/CD gates and runtime admission controllers. Review and update the policy quarterly as regulations and vendor landscapes evolve.",
          },
          {
            id: "sov-gov-3",
            text: "Track regulatory sovereignty requirements across all operating jurisdictions",
            exec:
              "AI sovereignty obligations vary by jurisdiction — the EU AI Act, national AI strategies, sector-specific regulations, and data localization laws each impose different requirements. A governance layer must map and track these dynamically.",
            eng:
              "Maintain a regulatory requirements database mapping jurisdictions to sovereignty obligations: data residency mandates, model transparency requirements, local infrastructure preferences, and cross-border transfer restrictions. Run automated compliance checks comparing the platform's actual deployment posture against required sovereignty controls. Generate jurisdiction-specific compliance reports for regulators.",
          },
          {
            id: "sov-gov-4",
            text: "Mandate open-weight model evaluation for every new AI use case before committing to proprietary-only",
            exec:
              "Defaulting to proprietary APIs without evaluating open alternatives is a governance failure that compounds vendor lock-in. Open-weight models have reached production quality for many use cases and should be the first option considered, not the fallback.",
            eng:
              "Require a documented evaluation comparing at least one open-weight model against the proposed proprietary model for every new use case. Record evaluation results (quality, latency, cost, sovereignty posture) in the governance system. Where open-weight models meet quality thresholds, prefer them. Where proprietary models are chosen, document the justification and the exit path.",
          },
        ],
      },

      /* ── Systems of Record (critical) ────────────────────── */
      {
        layerId: "systems",
        tier: "critical",
        guidelines: [
          {
            id: "sov-sys-1",
            text: "Ensure all agent-to-system integrations use portable, standards-based protocols",
            exec:
              "Integrations with systems of record built on proprietary cloud connectors (Azure Logic Apps, AWS Step Functions, GCP Workflows) create deep infrastructure lock-in that extends beyond the AI platform into enterprise integration architecture.",
            eng:
              "Build agent-to-system integrations using portable protocols (REST, gRPC, GraphQL, AMQP, CloudEvents). Wrap cloud-proprietary connectors behind an adapter layer with a stable interface. Test critical integrations against mock backends that simulate alternative infrastructure. Include integration portability in sovereignty compliance audits.",
          },
          {
            id: "sov-sys-2",
            text: "Enforce data sovereignty at the integration boundary when agents access external systems",
            exec:
              "When agents read from or write to systems of record, data crosses trust boundaries. If the system of record is in a different jurisdiction or hosted by a third party, the integration must enforce the same sovereignty controls as the AI platform itself.",
            eng:
              "Classify all system-of-record integrations by jurisdiction and data sensitivity. Route cross-jurisdictional data flows through sovereignty policy enforcement points. Implement data minimization — agents should request only the fields they need, not entire records. Log all cross-boundary data transfers with jurisdiction metadata for audit.",
          },
          {
            id: "sov-sys-3",
            text: "Maintain the ability to operate core AI capabilities independently of external system availability",
            exec:
              "If the AI platform cannot function when a single external system or cloud service is unavailable, it lacks operational sovereignty. Core capabilities — inference, orchestration, memory retrieval — must degrade gracefully, not fail completely.",
            eng:
              "Implement circuit-breakers and cached fallbacks for all external system integrations. Define a minimum viable capability set that operates using only self-managed infrastructure. Test this degraded mode quarterly. Document recovery procedures for restoring full connectivity after external system outages.",
          },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  PILLAR 5 — Data Sovereignty                                     */
  /* ================================================================ */
  {
    id: "data-sovereignty",
    name: "Data Sovereignty",
    icon: "\u{1F5C4}",
    exec:
      "Agentic AI platforms ingest, process, and store data across every layer — prompts, conversation histories, embeddings, tool payloads, and inference outputs all carry regulatory obligations. GDPR, ISO/IEC 27701, the NIST Privacy Framework, and the EU Data Governance Act impose enforceable requirements on data classification, residency, cross-border transfer, encryption, consent, and subject rights that apply regardless of whether a human or an autonomous agent handles the data. Without a Data Sovereignty discipline embedded in the architecture, organizations face regulatory penalties, data breach liability, and the inability to honor data subject rights across AI-specific data stores like vector databases and prompt logs.",
    eng:
      "Treat every data flow in the agentic platform as a regulated pipeline. Classify all data at ingestion with sensitivity labels and jurisdictional tags. Enforce residency constraints at storage, processing, and transit boundaries — not just at the perimeter. Implement PII detection before every model call, automate DSAR fulfillment across all data stores including vector databases and conversation logs, manage consent for AI training data with granular opt-in/opt-out, encrypt with customer-managed keys using envelope encryption, and maintain full data lineage from source through embedding to agent response. Cross-border transfers must use legally valid mechanisms (SCCs, adequacy decisions, binding corporate rules) verified at the gateway before data leaves its jurisdiction.",
    citations: [
      {
        id: "gdpr-regulation",
        label: "General Data Protection Regulation (GDPR) — Regulation (EU) 2016/679",
        url: "https://gdpr-info.eu/",
        org: "European Union",
      },
      {
        id: "iso-27701",
        label: "ISO/IEC 27701:2019 — Privacy Information Management System (PIMS)",
        url: "https://www.iso.org/standard/71670.html",
        org: "ISO/IEC",
      },
      {
        id: "nist-privacy-framework",
        label: "NIST Privacy Framework: A Tool for Improving Privacy through Enterprise Risk Management",
        url: "https://www.nist.gov/privacy-framework",
        org: "NIST",
      },
      {
        id: "eu-data-governance-act",
        label: "EU Data Governance Act — Regulation (EU) 2022/868",
        url: "https://digital-strategy.ec.europa.eu/en/policies/data-governance-act",
        org: "European Union",
      },
      {
        id: "edpb-sccs-guidance",
        label: "EDPB Guidelines on Standard Contractual Clauses for International Transfers",
        url: "https://www.edpb.europa.eu/our-work-tools/documents/public-consultations/2021/recommendations-012020-measures-supplement_en",
        org: "EDPB",
      },
    ],
    cells: [
      /* ── Surface (moderate) ──────────────────────────────── */
      {
        layerId: "surface",
        tier: "moderate",
        guidelines: [
          {
            id: "dsov-surf-1",
            text: "Present data collection notices and consent controls before AI interactions begin",
            exec:
              "GDPR Articles 13-14 and the NIST Privacy Framework Communicate-P function require that data subjects are informed about data collection purposes before processing begins. For agentic AI, this includes prompt data, conversation history, and any inference outputs retained by the platform.",
            eng:
              "Display a consent banner or data notice before the first AI interaction that describes: what data is collected (prompts, responses, metadata), processing purposes (inference, improvement, analytics), retention periods, and data subject rights. Store consent records with timestamps and the specific policy version acknowledged. Gate AI interactions on valid consent where required by jurisdiction.",
          },
          {
            id: "dsov-surf-2",
            text: "Provide self-service data subject rights controls in the user interface",
            exec:
              "GDPR Articles 15-22 grant data subjects rights to access, rectify, erase, port, and restrict processing of their personal data. Agentic platforms that lack self-service controls for these rights face compliance risk and manual fulfillment bottlenecks.",
            eng:
              "Implement a privacy dashboard where users can: view collected data (prompts, conversation logs, preference models), request export in machine-readable format (JSON, CSV), submit erasure requests that cascade through all data stores, and toggle consent for optional processing (model training, analytics). Route requests through the automated DSAR pipeline.",
          },
        ],
      },

      /* ── Identity (moderate) ─────────────────────────────── */
      {
        layerId: "identity",
        tier: "moderate",
        guidelines: [
          {
            id: "dsov-id-1",
            text: "Bind data classification and consent state to authenticated identity for policy enforcement",
            exec:
              "Data sovereignty rules are per-subject, not per-request. The identity layer must carry the user's jurisdictional context, consent state, and data classification preferences so downstream layers can enforce the correct policies without re-querying the user.",
            eng:
              "Embed jurisdiction, consent flags, and data-classification context in the identity token or session claims. Propagate these claims through all service-to-service calls. Enforce that downstream layers (gateway, tools, memory) evaluate these claims before processing data. Invalidate sessions when consent is withdrawn.",
          },
          {
            id: "dsov-id-2",
            text: "Enforce purpose limitation by binding data access to declared processing purposes",
            exec:
              "GDPR Article 5(1)(b) and ISO/IEC 27701 Clause 7.2.1 require that personal data is collected for specified, explicit purposes and not processed incompatibly. Agents that access data for inference must not silently repurpose it for training or analytics without distinct authorization.",
            eng:
              "Define purpose codes (inference, training, analytics, support) in the identity and authorization layer. Bind each data access request to a declared purpose. Enforce purpose-based access controls in the gateway and memory layers — block reads where the declared purpose does not match the data's authorized use. Log purpose-tagged access for audit.",
          },
        ],
      },

      /* ── Orchestration (minimal) ─────────────────────────── */
      {
        layerId: "orchestration",
        tier: "minimal",
        guidelines: [
          {
            id: "dsov-orch-1",
            text: "Tag orchestration plan steps with data classification and residency requirements",
            exec:
              "Multi-step agent plans may handle data of varying sensitivity levels. If the orchestrator does not propagate data classification metadata through the plan, downstream steps may process restricted data on non-compliant infrastructure or transmit it across jurisdictional boundaries.",
            eng: "",
          },
        ],
      },

      /* ── Runtime (moderate) ──────────────────────────────── */
      {
        layerId: "runtime",
        tier: "moderate",
        guidelines: [
          {
            id: "dsov-rt-1",
            text: "Enforce data residency at the inference runtime so processing occurs only in approved jurisdictions",
            exec:
              "GDPR Article 44 and the EDPB supplementary measures guidelines require that personal data processing respects jurisdictional transfer restrictions. Routing EU personal data to a US-based inference endpoint violates GDPR regardless of encryption in transit.",
            eng:
              "Tag runtime environments with geographic jurisdiction. Implement a pre-dispatch policy check that matches the request's data classification and user jurisdiction against the target runtime's clearance. Reject and re-queue requests that would violate residency policy. Maintain a capacity map per jurisdiction and alert when sovereign capacity is insufficient to meet demand.",
          },
          {
            id: "dsov-rt-2",
            text: "Ensure ephemeral handling of sensitive data during inference with no uncontrolled persistence",
            exec:
              "Model inference processes may retain prompt and completion data in GPU memory, swap space, or temporary files. ISO/IEC 27701 Clause 7.4.5 requires that personal data is not kept longer than necessary. Uncontrolled persistence in the inference runtime creates a data leakage surface.",
            eng:
              "Configure inference runtimes to clear GPU memory between requests for sensitive workloads. Disable swap for inference containers processing classified data. Ensure temporary files are encrypted and purged after response delivery. Validate through periodic memory forensics that no PII persists beyond the request lifecycle.",
          },
        ],
      },

      /* ── Gateway (critical) ──────────────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "dsov-gw-1",
            text: "Deploy automated PII detection and redaction at the model gateway before any external model call",
            exec:
              "The gateway is the last enforcement point before data leaves the organization's control boundary and reaches a third-party model provider. GDPR Article 28 requires data processing agreements, and ISO/IEC 27701 Clause 8.2.2 mandates controls on sub-processors. PII that reaches a model API without redaction is data the organization cannot recall.",
            eng:
              "Deploy a PII detection pipeline (Microsoft Presidio, AWS Comprehend, or a fine-tuned NER model) at the gateway that scans all outbound prompts. Redact or tokenize detected PII before forwarding to external model endpoints. For self-hosted models, apply the same detection on responses. Maintain a configurable detection taxonomy covering names, addresses, phone numbers, SSNs, financial identifiers, health data, and biometric markers. Log all redactions for audit.",
          },
          {
            id: "dsov-gw-2",
            text: "Enforce cross-border transfer controls with legally valid transfer mechanisms",
            exec:
              "GDPR Chapter V prohibits personal data transfers to third countries without adequate safeguards. The Schrems II ruling invalidated Privacy Shield, leaving Standard Contractual Clauses (SCCs), adequacy decisions, and Binding Corporate Rules (BCRs) as primary transfer mechanisms. The gateway must enforce these before routing data.",
            eng:
              "Maintain a transfer-mechanism registry mapping each external model endpoint to its legal transfer basis (adequacy decision, SCC, BCR, or derogation). Block requests to endpoints without a valid, unexpired transfer mechanism on file. Implement automated alerts when transfer mechanisms approach expiration. For EU-to-US transfers, verify the endpoint is covered by the EU-US Data Privacy Framework where applicable. Log all cross-border routing decisions with the legal basis applied.",
          },
          {
            id: "dsov-gw-3",
            text: "Implement data classification-aware routing that matches data sensitivity to endpoint trust levels",
            exec:
              "Not all data requires the same protection level. Routing public data through sovereignty controls adds unnecessary latency, while routing confidential data to standard endpoints creates compliance risk. The gateway must match data classification to endpoint trust level.",
            eng:
              "Define endpoint trust tiers: sovereign (self-hosted, jurisdiction-verified), trusted (contracted provider with DPA and SCCs), and external (third-party API without data guarantees). Map data classifications (public, internal, confidential, restricted) to minimum required endpoint trust tiers. Enforce the mapping at the gateway routing layer. Log classification-to-tier decisions for compliance audit.",
          },
          {
            id: "dsov-gw-4",
            text: "Block model training data opt-in by default and enforce contractual no-training clauses",
            exec:
              "Third-party model providers may use customer prompt data to improve their models unless explicitly prohibited. GDPR Article 6 requires a lawful basis for processing, and using customer data for model training without consent violates purpose limitation. The gateway must enforce no-training policies at the API level.",
            eng:
              "Set API headers or parameters that opt out of model training on all requests to third-party endpoints (e.g., OpenAI's data usage controls, Azure's abuse monitoring opt-out). Verify contractual no-training clauses in DPAs for every external model provider. Monitor provider policy changes for training-data scope creep. Block endpoints where no-training guarantees cannot be verified.",
          },
        ],
      },

      /* ── Tools (critical) ────────────────────────────────── */
      {
        layerId: "tools",
        tier: "critical",
        guidelines: [
          {
            id: "dsov-tool-1",
            text: "Implement data classification scanning on all tool inputs and outputs",
            exec:
              "Tools bridge the AI platform to external systems. Data flowing through tools may contain PII, financial records, or health information that the originating LLM did not flag. Classifying tool data flows prevents uncontrolled transmission of sensitive data to non-compliant destinations.",
            eng:
              "Deploy data classification scanners at tool ingress and egress points. Apply the same PII detection taxonomy used at the gateway. Tag classified data with sensitivity labels and propagate labels through the tool execution chain. Block tool outputs that contain restricted data from flowing to unauthorized destinations. Log all classification events.",
          },
          {
            id: "dsov-tool-2",
            text: "Enforce data minimization in tool queries — request only the fields required for the task",
            exec:
              "GDPR Article 5(1)(c) requires data minimization — processing only data adequate, relevant, and limited to what is necessary. Tools that fetch entire database records when only one field is needed create unnecessary exposure of personal data to the AI platform.",
            eng:
              "Define field-level access policies for each tool specifying the maximum data scope per use case. Implement query rewriting or field filtering at the tool boundary to strip unnecessary columns before data enters the agent context. Audit tool data requests against minimization policies quarterly. Alert on tools that consistently over-fetch relative to their declared purpose.",
          },
          {
            id: "dsov-tool-3",
            text: "Ensure tools that write data propagate classification labels and consent status to target systems",
            exec:
              "When agents write data back to systems of record through tools, the classification and consent metadata must travel with the data. Otherwise, downstream systems lose the ability to enforce retention, erasure, or access controls on AI-generated content.",
            eng:
              "Require all write-capable tools to include data classification labels, source lineage, and consent context in the payload metadata sent to target systems. Validate that target systems acknowledge and store these labels. Reject writes to systems that cannot accept classification metadata. Log all classification-propagation events for DSAR fulfillment.",
          },
        ],
      },

      /* ── Memory (critical) ───────────────────────────────── */
      {
        layerId: "memory",
        tier: "critical",
        guidelines: [
          {
            id: "dsov-mem-1",
            text: "Classify all data at ingestion into memory stores with sensitivity labels and jurisdictional tags",
            exec:
              "ISO/IEC 27701 Clause 7.2.8 requires organizations to identify and classify personal data. AI memory stores — vector databases, conversation logs, learned preferences — contain a mix of public knowledge and personal data. Without classification at ingestion, the organization cannot enforce differential retention, access, or erasure policies.",
            eng:
              "Implement a classification pipeline at the memory ingestion boundary that scans content for PII, applies sensitivity labels (public, internal, confidential, restricted, AI-training, prompt-data, inference-data), and tags with source jurisdiction. Store labels as metadata alongside embeddings and documents. Enforce label-based access controls on all retrieval queries. Re-classify periodically to catch drift.",
          },
          {
            id: "dsov-mem-2",
            text: "Automate data subject access requests (DSARs) across vector stores, conversation logs, and derived embeddings",
            exec:
              "GDPR Articles 15-17 require that organizations locate, export, and delete personal data across all processing systems within defined timeframes (typically 30 days). AI memory stores — especially vector databases where personal data is embedded in high-dimensional vectors — make DSAR fulfillment technically challenging but legally non-negotiable.",
            eng:
              "Build an automated DSAR pipeline that: (1) identifies all data associated with a subject across vector stores, conversation logs, session state, and derived artifacts, (2) exports identified data in machine-readable format for access requests, (3) deletes or anonymizes data for erasure requests including re-indexing affected vector store partitions, (4) logs fulfillment evidence for regulatory proof. Maintain a data map linking subjects to storage locations. Test DSAR execution quarterly and measure fulfillment latency against SLA.",
          },
          {
            id: "dsov-mem-3",
            text: "Encrypt memory stores at rest with customer-managed keys and enforce envelope encryption",
            exec:
              "GDPR Article 32 requires appropriate technical measures including encryption. ISO/IEC 27701 Clause 6.7 mandates cryptographic controls. Provider-managed encryption keys grant the provider technical access to decrypt — insufficient for data sovereignty. Customer-managed keys with envelope encryption ensure the organization retains exclusive control.",
            eng:
              "Encrypt all vector databases, conversation stores, and knowledge bases at rest using AES-256 with keys from a customer-managed HSM (Azure Key Vault, AWS CloudHSM, or on-premises HSM). Implement envelope encryption: generate a data encryption key (DEK) per partition, wrap the DEK with the customer master key (CMK). Rotate CMKs on schedule (annual minimum). Verify that the infrastructure provider cannot access plaintext through key escrow, lawful intercept, or admin access.",
          },
          {
            id: "dsov-mem-4",
            text: "Enforce data retention policies with automated expiration across all memory tiers",
            exec:
              "GDPR Article 5(1)(e) mandates storage limitation — personal data must not be kept longer than necessary. AI platforms accumulate conversation histories, embeddings, and cached inference results that may contain personal data well past their useful life. Without automated retention, the data surface grows indefinitely.",
            eng:
              "Define retention schedules per data classification and memory tier: conversation logs (configurable, default 90 days), prompt/completion cache (7 days), vector store chunks (aligned with source document lifecycle), user preference models (until consent withdrawal). Implement automated TTL enforcement that purges expired data including derived embeddings. Log all retention-driven deletions for audit. Alert when retention policies are overridden or disabled.",
          },
        ],
      },

      /* ── State (critical) ────────────────────────────────── */
      {
        layerId: "state",
        tier: "critical",
        guidelines: [
          {
            id: "dsov-st-1",
            text: "Classify agent session state by data sensitivity and enforce jurisdictional storage constraints",
            exec:
              "Agent session state captures intermediate reasoning, tool outputs, and user context that may include personal data subject to GDPR or sector-specific regulations. State storage must respect the same classification and residency rules as primary data stores.",
            eng:
              "Tag all session state with data classification derived from the originating request. Store classified state only in jurisdiction-compliant infrastructure. Implement partition-level isolation so state containing restricted data is physically separated from less sensitive state. Enforce classification checks on state reads to prevent cross-classification access.",
          },
          {
            id: "dsov-st-2",
            text: "Include agent checkpoint state in DSAR scope and automated erasure pipelines",
            exec:
              "Agent checkpoints persist intermediate results and decision context that may reference personal data. GDPR right-to-erasure requests must cover all processing systems, including agent state stores. Omitting checkpoints from DSAR scope creates a compliance gap.",
            eng:
              "Register agent state stores in the organization's data map as DSAR-eligible repositories. Implement subject-identifier indexing on checkpoints so associated state can be located during DSAR fulfillment. Cascade erasure requests to checkpoint stores and verify deletion. Log checkpoint erasure events as part of the DSAR fulfillment evidence chain.",
          },
          {
            id: "dsov-st-3",
            text: "Encrypt session state at rest and in transit with tenant-scoped encryption keys",
            exec:
              "Multi-tenant agent platforms store session state from multiple customers in shared infrastructure. ISO/IEC 27701 Clause 6.7 and GDPR Article 32 require technical measures proportionate to risk. Tenant-scoped encryption ensures that a breach of one tenant's key space does not expose another's data.",
            eng:
              "Generate per-tenant data encryption keys (DEKs) for session state encryption. Wrap DEKs with the tenant's customer-managed master key. Enforce TLS 1.3 for all state transit. Validate that plaintext state is never written to shared disk without encryption. Rotate DEKs when tenants offboard. Verify encryption coverage through automated compliance scans.",
          },
        ],
      },

      /* ── Observability (moderate) ────────────────────────── */
      {
        layerId: "observability",
        tier: "moderate",
        guidelines: [
          {
            id: "dsov-obs-1",
            text: "Redact PII from observability telemetry before storage and ensure log residency compliance",
            exec:
              "Observability logs, traces, and metrics frequently capture prompt text, completion content, and user metadata that constitute personal data under GDPR. Storing unredacted telemetry in a non-compliant jurisdiction or retaining it beyond necessity violates data protection obligations.",
            eng:
              "Apply the same PII detection pipeline used at the gateway to all observability data before it is written to storage. Redact or pseudonymize detected PII in log entries, span attributes, and metric labels. Store observability data in jurisdiction-compliant infrastructure. Apply retention policies aligned with data classification — operational logs may have shorter retention than compliance audit logs.",
          },
          {
            id: "dsov-obs-2",
            text: "Monitor and alert on data sovereignty policy violations across the platform",
            exec:
              "NIST Privacy Framework CT.PO-P3 requires monitoring of privacy controls effectiveness. Data sovereignty violations — cross-border transfers without valid mechanisms, unclassified data processing, missed DSAR SLAs — must be detected in near-real-time, not discovered during annual audits.",
            eng:
              "Emit structured events for all data sovereignty enforcement decisions: classification results, residency routing, transfer mechanism validation, DSAR fulfillment, and consent state changes. Aggregate events into a privacy compliance dashboard. Set alerts for: unclassified data in production stores, cross-border routing without valid legal basis, DSAR fulfillment approaching SLA deadlines, and consent withdrawal cascades not completing. Feed violations into incident management workflows.",
          },
        ],
      },

      /* ── Governance (critical) ───────────────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "dsov-gov-1",
            text: "Maintain an AI-specific data classification scheme covering all data types in the agentic platform",
            exec:
              "ISO/IEC 27701 Clause 7.2.8 and NIST Privacy Framework ID.IM-P1 require data inventorying and classification. Standard enterprise classification schemes (public, internal, confidential, restricted) are insufficient for AI — they miss AI-specific categories like training data, prompt data, inference outputs, embedding vectors, and conversation history that carry distinct regulatory obligations.",
            eng:
              "Extend the enterprise data classification taxonomy with AI-specific categories: training-data, fine-tuning-data, prompt-data, completion-data, inference-metadata, embedding-vector, conversation-history, user-preference-model, and RAG-source-document. Map each category to applicable regulations (GDPR, sector-specific rules), required controls (encryption, residency, retention, consent), and DSAR obligations. Publish the classification scheme as a machine-readable policy and enforce it at all data ingestion points.",
          },
          {
            id: "dsov-gov-2",
            text: "Enforce consent management for AI training data with granular opt-in and opt-out mechanisms",
            exec:
              "GDPR Article 6 requires a lawful basis for processing. Using customer interaction data to fine-tune or improve models requires explicit consent or a legitimate interest assessment. The EU Data Governance Act further regulates data reuse conditions. Without consent management, any model improvement using customer data creates regulatory exposure.",
            eng:
              "Implement a consent management platform that tracks per-user, per-purpose consent for AI-specific processing: model training, fine-tuning, evaluation, analytics, and personalization. Enforce consent state at the data pipeline level — block training data extraction for users who have not opted in. Support granular opt-out (e.g., allow inference but prohibit training use). Propagate consent changes to all downstream pipelines within 24 hours. Maintain consent audit logs with version history.",
          },
          {
            id: "dsov-gov-3",
            text: "Implement data lineage and provenance tracking from source through embedding to agent response",
            exec:
              "GDPR Article 30 requires records of processing activities. The NIST Privacy Framework CT.DM-P1 requires data provenance. When an agent produces an output that references personal data, the organization must trace backward through the full processing chain: which source document, which embedding pipeline, which retrieval query, and which model produced the result.",
            eng:
              "Assign unique lineage identifiers to every data artifact: source documents, ingestion batches, embedding pipeline versions, vector store chunks, and model inference runs. Propagate lineage IDs through the processing chain. Store lineage metadata in a queryable graph. Enable both forward queries (given a source document, what agent responses did it influence?) and backward queries (given an agent response, what source data contributed?). Integrate lineage into DSAR fulfillment to identify all processing that touched a subject's data.",
          },
          {
            id: "dsov-gov-4",
            text: "Conduct and maintain Data Protection Impact Assessments for all AI processing activities",
            exec:
              "GDPR Article 35 requires DPIAs for processing likely to result in high risk to individuals. Agentic AI systems that profile users, make automated decisions, or process special category data at scale require DPIAs. Without them, the organization lacks a defensible risk assessment for regulatory inquiries.",
            eng:
              "Create DPIA templates tailored to agentic AI use cases covering: data flows (prompts, completions, memory, state), automated decision-making scope, profiling activities, cross-border transfers, and data subject impact. Require DPIA completion before any agent deployment that processes personal data. Review DPIAs annually or when processing activities change materially. Store DPIAs in the governance system linked to the agent registry. Integrate DPIA findings into the privacy compliance dashboard.",
          },
          {
            id: "dsov-gov-5",
            text: "Establish cross-border data transfer governance with validated legal mechanisms for every data flow",
            exec:
              "GDPR Chapter V, the Schrems II ruling, and the EDPB supplementary measures guidelines require that every personal data transfer outside the EEA has a valid legal basis. Agentic platforms that route data to model endpoints, vector stores, or tool APIs across jurisdictions must map and validate transfer mechanisms for each flow — not just the primary model API.",
            eng:
              "Inventory all data flows that cross jurisdictional boundaries: model API calls, vector store replication, tool API requests, observability telemetry, and backup data. Map each flow to a transfer mechanism (adequacy decision, SCC, BCR, or Article 49 derogation). Automate validation that mechanisms are in place and unexpired before data flows commence. Maintain a transfer impact assessment for high-risk transfers. Alert when a mechanism expires or when a new data flow is created without a mapped mechanism. Report transfer governance status on the privacy compliance dashboard.",
          },
        ],
      },

      /* ── Systems of Record (critical) ────────────────────── */
      {
        layerId: "systems",
        tier: "critical",
        guidelines: [
          {
            id: "dsov-sys-1",
            text: "Enforce data processing agreements and sub-processor controls for all AI-to-system integrations",
            exec:
              "GDPR Article 28 requires written data processing agreements (DPAs) between controllers and processors. When agents interact with external systems of record, each integration constitutes a data processing relationship that must be contractually governed. ISO/IEC 27701 Clause 8.2 extends this to sub-processor chains.",
            eng:
              "Maintain a DPA registry mapping every agent-to-system integration to its governing data processing agreement. Track sub-processor chains — if the system of record uses third-party infrastructure, validate that the sub-processor chain is documented in the DPA. Block integrations where DPAs are missing, expired, or do not cover AI-specific processing. Alert when new sub-processors are added to existing chains. Audit DPA coverage quarterly.",
          },
          {
            id: "dsov-sys-2",
            text: "Implement data anonymization and pseudonymization at the integration boundary for analytics and training pipelines",
            exec:
              "GDPR Recital 26 excludes truly anonymous data from its scope. Data flowing from systems of record into AI training or analytics pipelines can be anonymized or pseudonymized at the integration boundary, reducing regulatory burden while preserving analytical value. ISO/IEC 27701 Clause 7.4.6 recommends de-identification where possible.",
            eng:
              "Deploy anonymization/pseudonymization services at the boundary between systems of record and AI data pipelines. Apply k-anonymity, differential privacy, or tokenization depending on the use case. Validate that anonymized data cannot be re-identified through linkage attacks. For pseudonymized data, store mapping tables in a separate, access-controlled system. Log all anonymization events with the technique applied.",
          },
          {
            id: "dsov-sys-3",
            text: "Cascade data subject rights requests to all downstream systems touched by agent interactions",
            exec:
              "When an agent reads from a CRM, writes to a ticketing system, and logs context to a knowledge base, the data subject's personal data now exists in multiple systems. GDPR Articles 17 and 19 require that erasure and rectification requests propagate to all recipients. Incomplete cascading leaves personal data residue in systems the subject cannot discover.",
            eng:
              "Maintain a data flow graph mapping which systems of record are touched by each agent interaction type. When a DSAR is received, traverse the graph to identify all affected systems. Issue cascading erasure or rectification requests to each system with verification callbacks. Track fulfillment status per system and per request. Report incomplete cascades as compliance incidents. Test cascade paths quarterly with synthetic DSARs.",
          },
          {
            id: "dsov-sys-4",
            text: "Validate data residency compliance for all systems of record that agents access across jurisdictions",
            exec:
              "Systems of record hosted in different jurisdictions create indirect cross-border transfer risks when agents access them. An EU-deployed agent querying a US-hosted CRM transfers EU personal data to US jurisdiction. Every agent-to-system integration must be validated against residency requirements, not just the AI platform's own infrastructure.",
            eng:
              "Map all systems of record by hosting jurisdiction and data classification. Implement residency validation at the tool/integration layer that checks whether the agent's data classification permits access to the target system's jurisdiction. For cross-jurisdictional access, verify valid transfer mechanisms (SCCs, adequacy decisions) are in place. Block access when no valid mechanism exists. Log all cross-jurisdictional data access with transfer basis for audit.",
          },
        ],
      },
    ],
  },
];
