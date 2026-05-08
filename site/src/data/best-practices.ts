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
  {
    id: "agentic-orchestration",
    name: "Agentic Orchestration",
    icon: "\u{1F500}",
    exec:
      "Multi-agent systems introduce coordination complexity that exceeds what single-agent architectures encounter. Agents must discover each other's capabilities, negotiate task decomposition, share context without exceeding token budgets, and recover gracefully when a participant fails mid-workflow. Without explicit orchestration discipline — covering supervisor hierarchies, plan validation, delegation trust boundaries, and lifecycle management — multi-agent deployments degrade into unpredictable, undebuggable chains of autonomous actions with compounding failure rates.",
    eng:
      "Implement orchestration as a first-class architectural concern, not an emergent property of agent prompts. Define explicit topology patterns (supervisor, plan-and-execute, pipeline, swarm) per workflow type. Enforce delegation policies through code — not prompt instructions — so that agent authority boundaries survive adversarial inputs. Instrument every agent-to-agent handoff with distributed trace context. Checkpoint workflow state at each orchestration step to enable resume-after-failure without replaying the full chain.",
    citations: [
      {
        id: "anthropic-agents",
        label: "Building Effective Agents — Anthropic Engineering",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
        org: "Anthropic",
      },
      {
        id: "langgraph-docs",
        label: "LangGraph — Multi-Actor Agent Framework",
        url: "https://langchain-ai.github.io/langgraph/",
        org: "LangChain",
      },
      {
        id: "autogen-framework",
        label: "AutoGen — Multi-Agent Conversation Framework",
        url: "https://microsoft.github.io/autogen/",
        org: "Microsoft",
      },
      {
        id: "google-a2a",
        label: "Agent2Agent (A2A) Protocol Specification",
        url: "https://google.github.io/A2A/",
        org: "Google",
      },
      {
        id: "crewai-docs",
        label: "CrewAI — Multi-Agent Orchestration Framework",
        url: "https://docs.crewai.com/",
        org: "CrewAI",
      },
    ],
    cells: [
      /* ── Surface (moderate) ──────────────────────────── */
      {
        layerId: "surface",
        tier: "moderate",
        guidelines: [
          {
            id: "ao-surf-1",
            text: "Surface agent delegation status and active-agent identity to the user in real time",
            exec:
              "When a supervisor agent delegates to specialist sub-agents, users lose visibility into who is handling their request and why. Opaque delegation erodes trust and makes it impossible for users to intervene when an agent takes an unexpected path.",
            eng:
              "Emit delegation events over a WebSocket or SSE channel that the UI consumes to render a live agent-activity indicator — showing which agent is active, what task it is performing, and how it relates to the user's original request. Include a 'cancel delegation' affordance for long-running sub-agent tasks.",
          },
          {
            id: "ao-surf-2",
            text: "Provide a human-in-the-loop approval gate for high-impact delegated actions",
            exec:
              "Certain agent-to-agent delegations result in actions with real-world consequences — financial transactions, data mutations, external communications. The user must be able to review and approve these before execution, even when the action was planned by a sub-agent two levels deep in the delegation chain.",
            eng:
              "Implement an approval-queue component that intercepts delegated actions tagged as high-impact by the orchestrator's risk classifier. Render the proposed action, its originating agent, the delegation chain, and expected consequences. Block execution until the user explicitly approves or rejects.",
          },
        ],
      },

      /* ── Identity (moderate) ─────────────────────────── */
      {
        layerId: "identity",
        tier: "moderate",
        guidelines: [
          {
            id: "ao-id-1",
            text: "Assign distinct identities to each agent in a multi-agent workflow",
            exec:
              "When multiple agents share a single service identity, audit trails collapse — you cannot distinguish which agent made a tool call, consumed tokens, or triggered an error. Distinct agent identities are the foundation for accountability, rate limiting, and forensic analysis in multi-agent systems.",
            eng:
              "Issue a unique agent identity (service principal or scoped JWT) per agent instance at spawn time. Bind the identity to the originating user session and the orchestration trace. Propagate the agent identity through all downstream calls — tool invocations, memory reads, state writes — so every action is attributable to a specific agent within a specific workflow.",
          },
          {
            id: "ao-id-2",
            text: "Enforce delegation trust boundaries through identity-scoped permission sets",
            exec:
              "A supervisor agent should not be able to grant a sub-agent more permissions than it holds itself. Without explicit trust-boundary enforcement, delegation chains can inadvertently escalate privileges — a research agent delegates to a code-execution agent that inherits write access the research agent was never meant to have.",
            eng:
              "Implement a delegation policy engine that computes the intersection of the delegating agent's permissions and the target agent's role permissions. The delegated agent receives the lesser of the two. Store delegation policies as declarative rules (not prompt instructions) evaluated at delegation time. Log all delegation events with the computed permission set for audit.",
          },
        ],
      },

      /* ── Orchestration (critical) ────────────────────── */
      {
        layerId: "orchestration",
        tier: "critical",
        guidelines: [
          {
            id: "ao-orch-1",
            text: "Select orchestration topology explicitly per workflow type rather than defaulting to a single pattern",
            exec:
              "Supervisor, plan-and-execute, pipeline, and swarm topologies each optimize for different workflow characteristics. A single-pattern default — typically supervisor — leads to bottlenecks for parallelizable work and unnecessary complexity for sequential tasks. Topology selection should be a deliberate architectural decision, not an accident of the first agent framework adopted.",
            eng:
              "Define a topology registry mapping workflow types to orchestration patterns: supervisor for hierarchical control with human oversight, plan-and-execute for decomposable multi-step reasoning, pipeline for sequential data-transformation chains, swarm for parallel independent subtasks. Implement each topology as a reusable orchestration template. Select topology at workflow-initiation time based on task classification.",
          },
          {
            id: "ao-orch-2",
            text: "Validate agent execution plans before dispatching sub-tasks",
            exec:
              "In plan-and-execute patterns, the planning agent decomposes a goal into a sequence of sub-tasks and assigns them to specialist agents. If the plan is executed without validation, an adversarial or hallucinated plan can invoke dangerous tool sequences, allocate unbounded resources, or create circular delegation chains.",
            eng:
              "Implement a plan-validation middleware that checks proposed execution plans against constraints: maximum delegation depth, permitted tool combinations per agent role, budget ceilings (tokens, API calls, wall-clock time), and cycle detection in the delegation graph. Reject invalid plans with structured error feedback to the planning agent. Log all plan submissions and validation outcomes.",
          },
          {
            id: "ao-orch-3",
            text: "Implement circuit-breaking and fallback strategies for agent failures",
            exec:
              "In multi-agent workflows, a single agent failure can cascade — a stalled sub-agent blocks the supervisor, which times out, which leaves the user request in limbo. Without explicit failure recovery, multi-agent systems are less reliable than single-agent alternatives despite their greater capability.",
            eng:
              "Apply circuit-breaker patterns at each delegation boundary: if a sub-agent fails or exceeds its time/token budget, the orchestrator trips the circuit and executes a fallback strategy — retry with a different agent, degrade to a simpler single-agent path, or return a partial result with an explanation. Configure failure thresholds per agent role. Track failure rates to identify chronically unreliable agents.",
          },
          {
            id: "ao-orch-4",
            text: "Enforce maximum delegation depth and fan-out limits to prevent runaway agent spawning",
            exec:
              "Without explicit limits, a supervisor agent can delegate to sub-agents that delegate to further sub-agents, creating exponential fan-out. This exhausts compute resources, inflates costs, and produces trace trees too deep to debug. Unbounded spawning is the multi-agent equivalent of a fork bomb.",
            eng:
              "Set hard limits on delegation depth (typically 3-4 levels) and fan-out (concurrent sub-agents per parent). Enforce limits in the orchestration runtime, not in agent prompts — prompts can be circumvented. When limits are reached, the orchestrator must consolidate remaining work into the current agent rather than delegating further. Emit alerts when workflows approach limits.",
          },
        ],
      },

      /* ── Runtime (critical) ──────────────────────────── */
      {
        layerId: "runtime",
        tier: "critical",
        guidelines: [
          {
            id: "ao-rt-1",
            text: "Manage agent lifecycle explicitly — spawn, monitor, and terminate agents through the runtime",
            exec:
              "Agents in a multi-agent system are not fire-and-forget. Without lifecycle management, orphaned agents consume resources indefinitely, zombie agents hold locks on shared state, and there is no mechanism to drain in-flight workflows during deployment. The runtime must own the full agent lifecycle.",
            eng:
              "Implement an agent registry in the runtime that tracks all active agent instances, their parent orchestrator, current task, resource consumption, and heartbeat status. Support graceful termination (finish current step, checkpoint, exit) and forced termination (immediate kill with state rollback). Implement TTL-based garbage collection for agents that stop heartbeating. Expose lifecycle APIs for orchestrators to spawn, query, and terminate sub-agents.",
          },
          {
            id: "ao-rt-2",
            text: "Isolate agent execution contexts to prevent cross-agent interference",
            exec:
              "When multiple agents run within the same process or share execution resources, a misbehaving agent — one that leaks memory, monopolizes CPU, or corrupts shared state — can degrade all co-located agents. Isolation is required for both reliability and security.",
            eng:
              "Run each agent in an isolated execution context — separate containers, sandboxed processes, or at minimum isolated memory spaces with resource quotas (CPU, memory, network). Prevent agents from directly accessing another agent's memory, tool handles, or in-flight state. Route all inter-agent communication through the orchestration layer, never through shared mutable state.",
          },
          {
            id: "ao-rt-3",
            text: "Implement token and cost budgets per agent with runtime enforcement",
            exec:
              "Individual agents have no incentive to minimize token consumption — they optimize for task completion. Without runtime-enforced budgets, a verbose agent or a retry loop can burn through API credits in minutes. Cost governance must be a runtime concern, not an agent-level prompt instruction.",
            eng:
              "Track cumulative token usage per agent instance and per workflow. Enforce per-agent token ceilings and per-workflow cost budgets at the LLM gateway layer. When an agent approaches its budget, inject a summarization step to compress context rather than allowing unbounded growth. When the budget is exceeded, trigger the orchestrator's fallback strategy rather than hard-killing the agent mid-task.",
          },
          {
            id: "ao-rt-4",
            text: "Support graceful workflow draining during deployments and scaling events",
            exec:
              "Multi-agent workflows can span minutes or hours. Deploying a new version of the runtime or scaling down infrastructure must not orphan in-flight workflows. Without graceful draining, deployments become a source of data loss and user-facing errors.",
            eng:
              "Implement a drain mode that stops accepting new workflows while allowing in-flight workflows to complete up to a configurable deadline. Checkpoint long-running workflows at the current orchestration step so they can resume on the new runtime version. Use health-check endpoints that report drain status to load balancers.",
          },
        ],
      },

      /* ── Gateway (moderate) ──────────────────────────── */
      {
        layerId: "gateway",
        tier: "moderate",
        guidelines: [
          {
            id: "ao-gw-1",
            text: "Route agent LLM requests through a unified gateway with per-agent traffic shaping",
            exec:
              "In multi-agent systems, multiple agents compete for LLM API capacity simultaneously. Without traffic shaping, a burst of concurrent agent requests can hit provider rate limits, causing cascading failures across all agents in the workflow.",
            eng:
              "Route all agent LLM calls through a shared API gateway that enforces per-agent and per-workflow rate limits, implements priority queuing (supervisor agents get priority over leaf agents), and provides automatic retry with exponential back-off. Track per-agent request volume and latency for capacity planning.",
          },
          {
            id: "ao-gw-2",
            text: "Implement model routing to assign appropriate model tiers to different agent roles",
            exec:
              "Not every agent in a multi-agent workflow needs the most capable (and expensive) model. A classification agent, a summarization agent, and a planning agent have different capability requirements. Routing all agents to the same model wastes cost on simple tasks and may under-serve complex ones.",
            eng:
              "Define a model-routing policy that maps agent roles to model tiers: planning and reasoning agents to high-capability models, extraction and formatting agents to smaller/faster models, and validation agents to specialized fine-tuned models where available. Evaluate routing decisions against task-completion quality metrics and adjust thresholds.",
          },
        ],
      },

      /* ── Tools (critical) ────────────────────────────── */
      {
        layerId: "tools",
        tier: "critical",
        guidelines: [
          {
            id: "ao-tool-1",
            text: "Scope tool permissions per agent role — no agent should access tools beyond its task requirements",
            exec:
              "In multi-agent systems, each agent has a specific role (researcher, coder, reviewer). Granting all agents access to all tools violates least privilege and creates a blast radius where a compromised or confused agent can invoke any tool in the platform. Tool scoping is the primary mechanism for constraining agent authority.",
            eng:
              "Define tool-permission sets per agent role in a declarative policy file. At agent spawn time, the runtime injects only the permitted tool definitions into the agent's system prompt and registers runtime-level enforcement that rejects calls to unpermitted tools. Never rely solely on prompt-level tool restriction — always enforce at the runtime layer.",
          },
          {
            id: "ao-tool-2",
            text: "Implement capability discovery so agents can find available tools and peer agents dynamically",
            exec:
              "Hardcoding tool and agent references into prompts creates brittle orchestration that breaks when tools are added, removed, or versioned. The A2A protocol and similar standards define capability-discovery mechanisms that let agents find what they need at runtime.",
            eng:
              "Implement an agent-card and tool-manifest registry that agents query at task-initiation time. Each entry declares capabilities, input/output schemas, version, and access requirements. Support semantic search over capability descriptions so planning agents can discover relevant tools without hardcoded lists. Version manifests to ensure agents bind to compatible tool versions.",
          },
          {
            id: "ao-tool-3",
            text: "Enforce tool-call rate limits and concurrency controls per agent instance",
            exec:
              "An agent in a retry loop or an overly ambitious plan can issue hundreds of tool calls in seconds, overwhelming downstream services. Per-agent tool-call throttling prevents a single agent from monopolizing shared infrastructure.",
            eng:
              "Apply per-agent-instance rate limits on tool invocations at the tool-execution layer. Implement concurrency limits for tools that access shared resources (databases, external APIs). Queue excess calls with back-pressure signaling to the orchestrator so it can adjust the plan rather than stalling silently.",
          },
        ],
      },

      /* ── Memory (critical) ──────────────────────────── */
      {
        layerId: "memory",
        tier: "critical",
        guidelines: [
          {
            id: "ao-mem-1",
            text: "Implement shared memory with access-control boundaries between agents",
            exec:
              "Multi-agent workflows require shared context — the research agent's findings must be available to the synthesis agent. But unrestricted shared memory allows any agent to read or overwrite any other agent's context, creating data-integrity risks and information leakage between agent roles that should be isolated.",
            eng:
              "Implement a shared-memory layer (vector store or key-value store) with namespace isolation per agent and a shared namespace for orchestrator-mediated data exchange. Agents write to their own namespace and to designated shared slots; they read from shared slots and their own namespace only. The orchestrator controls which shared slots each agent can access. Log all cross-namespace reads for audit.",
          },
          {
            id: "ao-mem-2",
            text: "Implement context-window management strategies to prevent token exhaustion in long workflows",
            exec:
              "Multi-agent workflows accumulate context across delegation steps — the supervisor's plan, each sub-agent's findings, tool outputs, and error messages. Without active context management, the accumulated context exceeds model context windows, causing silent truncation or outright failures.",
            eng:
              "Apply a context-management strategy at each delegation boundary: summarize completed sub-task outputs before injecting them into the next agent's context, use sliding-window approaches for iterative workflows, and offload detailed results to retrievable memory (RAG) while keeping only summaries in the active context. Monitor per-agent context utilization and alert when approaching window limits.",
          },
          {
            id: "ao-mem-3",
            text: "Scope memory retention policies per agent role and workflow sensitivity",
            exec:
              "Not all agent memory should persist equally. A customer-service agent's conversation memory has different retention requirements than a code-generation agent's scratch space. Blanket retention policies either waste storage or violate data-minimization principles.",
            eng:
              "Define retention tiers: ephemeral (cleared at agent termination), workflow-scoped (cleared at workflow completion), session-scoped (cleared at user session end), and persistent (retained for learning or audit). Assign default retention tiers per agent role. Allow orchestrators to override retention for specific workflows. Implement automated cleanup jobs that enforce retention policies.",
          },
        ],
      },

      /* ── State (critical) ────────────────────────────── */
      {
        layerId: "state",
        tier: "critical",
        guidelines: [
          {
            id: "ao-st-1",
            text: "Checkpoint workflow state at every orchestration boundary for resume-after-failure",
            exec:
              "Multi-agent workflows can span minutes or hours. A failure at step 8 of a 10-step workflow should not require replaying steps 1-7. Without state checkpointing, every failure restarts the entire workflow, wasting compute, time, and cost.",
            eng:
              "Persist a workflow-state snapshot at each orchestration decision point — after plan generation, after each sub-agent completion, after each tool-call result. Store checkpoints in a durable state backend (Redis with persistence, PostgreSQL, or a dedicated workflow engine like Temporal). Include the full orchestration context: completed steps, pending steps, accumulated results, and current agent assignments. Implement a resume API that reconstitutes a workflow from its latest checkpoint.",
          },
          {
            id: "ao-st-2",
            text: "Version workflow state schemas to support rolling upgrades of agent logic",
            exec:
              "When agent logic or orchestration patterns are updated, in-flight workflows carry state written by the previous version. If the new code cannot deserialize old state, checkpointed workflows become unresumable — defeating the purpose of checkpointing.",
            eng:
              "Include a schema version in every state checkpoint. Implement forward-compatible state migrations that can upgrade checkpoint state from version N to version N+1. Test state migrations as part of the CI pipeline. When a breaking migration is unavoidable, drain in-flight workflows before deploying.",
          },
          {
            id: "ao-st-3",
            text: "Implement distributed locking for state accessed by concurrent agents",
            exec:
              "When multiple agents in a swarm or parallel-execution topology read and write shared workflow state concurrently, race conditions corrupt state — two agents may both claim the same sub-task, or one agent's result may overwrite another's. Distributed locking prevents these conflicts.",
            eng:
              "Use a distributed lock manager (Redis Redlock, etcd lease, or database advisory locks) to serialize writes to shared workflow state. Keep lock granularity fine — lock per state key, not per workflow — to maximize concurrency. Set lock TTLs shorter than agent heartbeat intervals to prevent deadlocks from crashed agents. Implement optimistic concurrency control as a fallback for non-critical state updates.",
          },
        ],
      },

      /* ── Observability (critical) ────────────────────── */
      {
        layerId: "observability",
        tier: "critical",
        guidelines: [
          {
            id: "ao-obs-1",
            text: "Propagate distributed trace context through all agent-to-agent and agent-to-tool calls",
            exec:
              "Multi-agent workflows create tree-shaped execution traces where a single user request fans out into multiple agent invocations, tool calls, and LLM requests. Without distributed tracing, debugging a failure requires manually correlating logs across agents — a process that does not scale beyond trivial workflows.",
            eng:
              "Adopt OpenTelemetry trace propagation across all orchestration boundaries. Each agent invocation creates a child span linked to its parent agent's span. Attach workflow ID, agent ID, agent role, and delegation depth as span attributes. Ensure tool calls, LLM requests, and memory operations inherit the trace context. Export traces to a backend that supports tree visualization (Jaeger, Grafana Tempo).",
          },
          {
            id: "ao-obs-2",
            text: "Track per-agent and per-workflow cost metrics in real time",
            exec:
              "Multi-agent workflows have opaque cost profiles — a single user request may invoke 5 agents, 20 LLM calls, and 50 tool invocations. Without per-agent cost attribution, you cannot identify which agents or workflows drive cost and where optimization efforts should focus.",
            eng:
              "Instrument every LLM call and tool invocation with token counts, model tier, and estimated cost. Aggregate costs per agent instance, per agent role, and per workflow. Publish cost metrics to a real-time dashboard with alerting on per-workflow budget thresholds. Use cost data to inform model-routing decisions and identify agents that should be replaced with cheaper alternatives.",
          },
          {
            id: "ao-obs-3",
            text: "Log agent reasoning traces alongside execution traces for post-hoc analysis",
            exec:
              "Execution traces show what happened; reasoning traces show why. When a multi-agent workflow produces an incorrect result, understanding the failure requires seeing each agent's chain-of-thought, the orchestrator's plan, and the decision points where delegation occurred. Without reasoning traces, root-cause analysis is guesswork.",
            eng:
              "Capture and store the planning agent's generated plan, each agent's chain-of-thought (or scratchpad), tool-call decisions with rationale, and the orchestrator's delegation decisions. Link reasoning traces to the corresponding execution spans via trace ID. Implement a review UI that replays a workflow step-by-step with both execution and reasoning context visible.",
          },
        ],
      },

      /* ── Governance (moderate) ───────────────────────── */
      {
        layerId: "governance",
        tier: "moderate",
        guidelines: [
          {
            id: "ao-gov-1",
            text: "Register all agent types in a governance catalog with capability declarations and risk classifications",
            exec:
              "A multi-agent platform can accumulate dozens of agent types over time. Without a governance catalog, there is no authoritative inventory of what agents exist, what they can do, who owns them, or what risk tier they fall into. This makes compliance audits, incident response, and capability planning impossible.",
            eng:
              "Maintain a machine-readable agent catalog that records each agent type's name, capabilities, permitted tools, delegation authority (can it spawn sub-agents?), risk classification, owning team, and deployment environments. Enforce catalog enrollment as a pre-deployment gate. Expose the catalog via API for governance dashboards and automated compliance checks.",
          },
          {
            id: "ao-gov-2",
            text: "Enforce orchestration-pattern guardrails through policy-as-code rather than prompt engineering",
            exec:
              "Governance constraints expressed only in agent prompts — 'do not delegate to more than 3 sub-agents' — are suggestions, not enforcement. Prompts can be overridden by adversarial inputs, ignored during high-temperature sampling, or lost during context-window truncation. Policy enforcement must live outside the model.",
            eng:
              "Define orchestration governance rules (max delegation depth, permitted agent-to-agent delegation pairs, required approval gates, budget ceilings) in a declarative policy engine (OPA, Cedar, or custom). Evaluate policies at the runtime layer before executing delegation decisions. Log policy evaluations with the rule matched and the outcome. Update policies through version-controlled pull requests, not runtime configuration changes.",
          },
        ],
      },

      /* ── Systems of Record (moderate) ────────────────── */
      {
        layerId: "systems",
        tier: "moderate",
        guidelines: [
          {
            id: "ao-sys-1",
            text: "Implement agent-aware integration adapters that enforce per-agent access policies on systems of record",
            exec:
              "When multiple agents access the same system of record (CRM, ERP, ticketing system), each agent should only access the data relevant to its role. A research agent querying a CRM should not have the same access as an admin agent performing bulk updates. Integration adapters must be agent-identity-aware.",
            eng:
              "Wrap each system-of-record integration in an adapter that reads the calling agent's identity and role, then applies row-level and field-level access filters before returning data. Use the agent's scoped credentials (from the identity layer) to enforce access at the system-of-record level where possible. Log all agent-to-system interactions with the agent identity, query, and data classification of returned records.",
          },
          {
            id: "ao-sys-2",
            text: "Coordinate multi-agent writes to systems of record through a transaction coordinator to prevent conflicts",
            exec:
              "When multiple agents in a workflow write to the same system of record — one agent updates a ticket status while another appends notes — uncoordinated writes can create inconsistent state. This is especially dangerous when agents operate on stale reads due to eventual consistency.",
            eng:
              "Implement a transaction coordinator at the orchestration layer that serializes writes to the same system-of-record entity within a workflow. Use optimistic concurrency control (version fields, ETags) when the system of record supports it. When concurrent writes conflict, route the conflict to the orchestrator for resolution rather than silently overwriting. Log all write conflicts with the involved agents and resolution outcome.",
          },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  PILLAR 7 — Responsible AI & Ethics                               */
  /* ================================================================ */
  {
    id: "responsible-ai",
    name: "Responsible AI & Ethics",
    icon: "\u{2726}",
    exec:
      "Agentic AI systems operate with increasing autonomy — generating content, making decisions, and taking actions that directly affect people. Without embedded ethical safeguards, these systems risk producing harmful outputs, amplifying societal biases, making opaque decisions that cannot be explained or challenged, and operating in ways that violate fundamental rights. Responsible AI is not a compliance checkbox — it is an engineering discipline that requires content safety pipelines, bias measurement, fairness testing, transparency mechanisms, and human oversight woven into every architecture layer. The EU AI Act, NIST AI RMF, UNESCO AI Ethics Recommendation, and Microsoft Responsible AI Standard converge on the same imperative: organizations deploying autonomous AI must demonstrate that their systems are fair, transparent, accountable, safe, and inclusive by design.",
    eng:
      "Implement responsible AI as runtime-enforced controls, not aspirational policy documents. Deploy content safety classifiers on all inputs and outputs at the gateway. Measure bias across protected attributes using statistical fairness metrics and red-team evaluations. Provide decision explanations through retrieval attribution, chain-of-thought logging, and model cards. Enforce prohibited-use policies through code-level guardrails that cannot be bypassed by prompt manipulation. Build human-in-the-loop review workflows for high-stakes agent decisions. Monitor fairness metrics continuously in production and alert on drift. Treat responsible AI failures — harmful outputs, biased decisions, unexplainable actions — with the same severity as security incidents.",
    citations: [
      {
        id: "nist-ai-rmf-rai",
        label: "NIST AI Risk Management Framework (AI RMF 1.0) — Trustworthy AI Characteristics",
        url: "https://www.nist.gov/artificial-intelligence/risk-management-framework",
        org: "NIST",
      },
      {
        id: "eu-ai-act-rai",
        label: "EU AI Act — Regulation (EU) 2024/1689: Prohibited Practices and High-Risk Requirements",
        url: "https://artificialintelligenceact.eu/the-act/",
        org: "European Union",
      },
      {
        id: "ms-rai-standard-v2",
        label: "Microsoft Responsible AI Standard v2 — Principles and Implementation Requirements",
        url: "https://www.microsoft.com/en-us/ai/principles-and-approach",
        org: "Microsoft",
      },
      {
        id: "unesco-ai-ethics",
        label: "UNESCO Recommendation on the Ethics of Artificial Intelligence",
        url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
        org: "UNESCO",
      },
      {
        id: "pai-responsible-practices",
        label: "Partnership on AI — Responsible Practices for Synthetic Media and AI Development",
        url: "https://partnershiponai.org/responsible-practices-for-synthetic-media/",
        org: "Partnership on AI",
      },
    ],
    cells: [
      /* ── Surface (critical) ──────────────────────────────── */
      {
        layerId: "surface",
        tier: "critical",
        guidelines: [
          {
            id: "rai-surf-1",
            text: "Deploy content safety classifiers on all user-facing inputs and outputs",
            exec:
              "Users interact directly with AI-generated content at the surface layer. Without content safety filtering, harmful, violent, sexually explicit, or self-harm-promoting outputs reach users unimpeded. The EU AI Act Article 52 and Microsoft RAI Standard require that AI-generated content is subject to safety controls before delivery.",
            eng:
              "Integrate a multi-category content safety classifier (Azure AI Content Safety, Llama Guard, or a fine-tuned moderation model) on both inbound user messages and outbound model responses. Classify across severity levels for categories including hate speech, violence, sexual content, self-harm, and dangerous instructions. Block or flag content exceeding configurable severity thresholds. Return safe fallback responses when content is blocked. Log all classification decisions with categories and confidence scores for audit.",
          },
          {
            id: "rai-surf-2",
            text: "Disclose AI involvement and provide attribution for AI-generated content",
            exec:
              "The EU AI Act Article 52 requires that users are informed when they are interacting with an AI system. UNESCO's AI Ethics Recommendation emphasizes transparency as a foundational principle. Users have a right to know when content is AI-generated and to understand the basis for AI decisions that affect them.",
            eng:
              "Display clear, persistent indicators when content is AI-generated rather than human-authored. Implement source attribution for RAG-grounded responses — show which documents or sources informed the response. Provide a mechanism for users to view the chain of reasoning or evidence behind AI recommendations. Never disguise AI-generated content as human-produced.",
          },
          {
            id: "rai-surf-3",
            text: "Provide accessible feedback mechanisms for users to report harmful or biased AI outputs",
            exec:
              "Users are the first line of detection for harmful outputs that automated classifiers miss. Without structured feedback channels, harmful content goes unreported, and the organization loses critical signal for improving safety. NIST AI RMF MANAGE 3.1 requires mechanisms for stakeholder feedback on AI system performance.",
            eng:
              "Implement a per-response feedback widget that allows users to flag outputs as harmful, biased, inaccurate, or inappropriate with optional free-text context. Route flagged responses to a content safety review queue with SLA-based triage. Feed confirmed harmful outputs back into the content safety classifier training pipeline and red-team test suites. Track flag rates per model version, agent type, and content category.",
          },
          {
            id: "rai-surf-4",
            text: "Implement inclusivity standards for AI interactions across languages, abilities, and cultural contexts",
            exec:
              "AI systems that work well only for English-speaking, able-bodied users in Western cultural contexts exclude large populations and perpetuate inequity. UNESCO's AI Ethics Recommendation and the NIST AI RMF emphasize inclusive design as a core trustworthiness characteristic.",
            eng:
              "Test AI interactions across supported languages for quality parity — measure response quality, safety classifier accuracy, and bias metrics per language. Ensure UI components for AI interactions meet WCAG 2.1 AA accessibility standards. Validate that content safety classifiers perform equitably across cultural contexts and dialects. Include diverse user populations in usability testing for AI features.",
          },
        ],
      },

      /* ── Identity (minimal) ──────────────────────────────── */
      {
        layerId: "identity",
        tier: "minimal",
        guidelines: [
          {
            id: "rai-id-1",
            text: "Prevent identity attributes from being used as discriminatory inputs to AI decision-making",
            exec:
              "Protected attributes in identity tokens — age, gender, ethnicity, disability status — must not flow into AI models as features that drive differential treatment unless explicitly justified and audited. The EU AI Act prohibits AI systems that exploit vulnerabilities related to age, disability, or social situation.",
            eng: "",
          },
        ],
      },

      /* ── Orchestration (moderate) ────────────────────────── */
      {
        layerId: "orchestration",
        tier: "moderate",
        guidelines: [
          {
            id: "rai-orch-1",
            text: "Enforce ethical guardrails in agent planning to prevent harmful action sequences",
            exec:
              "Orchestrators that decompose goals into multi-step plans can produce action sequences that are individually benign but collectively harmful — for example, gathering personal information across multiple tools to build a profile that enables discrimination. Plan-level ethical validation catches harms that per-step checks miss.",
            eng:
              "Implement a plan-validation layer that evaluates proposed agent plans against an ethical policy ruleset before execution. Check for: prohibited action combinations, disproportionate data collection relative to the task, actions that affect protected groups differently, and plans that bypass human oversight requirements. Reject plans that violate ethical constraints with structured feedback to the planning agent.",
          },
          {
            id: "rai-orch-2",
            text: "Require human-in-the-loop approval for high-stakes agent decisions that affect individuals",
            exec:
              "The EU AI Act Article 14 requires human oversight for high-risk AI systems. NIST AI RMF GOVERN 1.4 mandates that organizations define contexts requiring human intervention. Fully autonomous decisions about credit, employment, healthcare, or legal matters create unacceptable risk without human review.",
            eng:
              "Classify agent actions by impact level: low (informational responses), medium (data mutations, recommendations), high (financial decisions, access changes, communications to external parties). Route high-impact actions through an approval queue that presents the proposed action, its basis, affected individuals, and potential consequences to a qualified human reviewer. Block execution until approval is received. Log all approval decisions.",
          },
        ],
      },

      /* ── Runtime (critical) ──────────────────────────────── */
      {
        layerId: "runtime",
        tier: "critical",
        guidelines: [
          {
            id: "rai-rt-1",
            text: "Implement grounding mechanisms to reduce hallucination and ensure factual accuracy",
            exec:
              "Hallucinated outputs — confident but fabricated claims — erode user trust and can cause real harm when users act on false information. Microsoft's RAI Standard and NIST AI RMF Trustworthy AI characteristics both identify validity and reliability as core requirements. Grounding model outputs in verifiable sources is the primary mitigation.",
            eng:
              "Deploy RAG (Retrieval Augmented Generation) pipelines that ground model responses in authoritative source documents. Implement citation injection so every factual claim references its source. Apply a faithfulness evaluator that scores response-to-source consistency and flags low-fidelity outputs for review. For domains where accuracy is critical (medical, legal, financial), enforce minimum grounding scores before delivering responses.",
          },
          {
            id: "rai-rt-2",
            text: "Conduct systematic red-teaming for harmful outputs before and during production deployment",
            exec:
              "Automated safety classifiers catch known harm patterns. Red-teaming discovers novel attack vectors, edge-case failures, and emergent harmful behaviors that classifiers were not trained on. Microsoft's RAI Standard and the NIST AI RMF both require adversarial testing as a pre-deployment gate.",
            eng:
              "Establish a red-team program that probes models for: jailbreak vulnerabilities, harmful content generation across all safety categories, bias amplification under adversarial prompts, information extraction attacks, and reasoning failures that lead to harmful actions. Run red-team evaluations as a CI/CD gate before model or prompt deployment. Maintain a red-team test suite that grows with each discovered vulnerability. Run continuous red-team evaluations against production systems on a recurring schedule.",
          },
          {
            id: "rai-rt-3",
            text: "Enforce prohibited-use policies at the runtime layer to block EU AI Act Article 5 violations",
            exec:
              "The EU AI Act Article 5 prohibits specific AI practices: social scoring, real-time biometric identification in public spaces (with exceptions), exploitation of vulnerabilities, and subliminal manipulation. These prohibitions must be enforced through technical controls, not policy alone — a model that can perform prohibited actions but is told not to in a prompt is not compliant.",
            eng:
              "Implement a prohibited-use classifier at the runtime layer that detects request patterns matching EU AI Act Article 5 categories. Block requests that would result in social scoring, unauthorized biometric identification, vulnerability exploitation, or manipulative techniques. Enforce these controls at the infrastructure level so they cannot be circumvented by prompt engineering. Log all blocked requests for compliance reporting. Update the classifier as regulatory interpretation evolves.",
          },
          {
            id: "rai-rt-4",
            text: "Implement content provenance and watermarking for AI-generated outputs",
            exec:
              "As AI-generated content becomes indistinguishable from human-created content, provenance tracking becomes essential for trust and accountability. The EU AI Act Article 52 requires labeling of AI-generated content. The C2PA (Coalition for Content Provenance and Authenticity) standard provides a technical framework for content provenance.",
            eng:
              "Embed provenance metadata in AI-generated content using C2PA or equivalent standards. For text outputs, include model identifier, generation timestamp, and grounding sources in structured metadata. For image or media outputs, embed watermarks that survive common transformations (compression, cropping, rescaling). Implement verification endpoints that allow downstream consumers to validate content provenance. Store provenance records for audit and regulatory compliance.",
          },
        ],
      },

      /* ── Gateway (critical) ──────────────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "rai-gw-1",
            text: "Deploy layered content safety filtering at the gateway for all model traffic",
            exec:
              "The gateway is the centralized enforcement point for content safety across all agents, models, and use cases. Gateway-level filtering ensures that no model request or response bypasses safety controls regardless of which agent or application initiated it. Defense-in-depth requires both gateway-level and surface-level safety filtering.",
            eng:
              "Implement a content safety pipeline at the gateway that processes all inbound prompts and outbound completions. Layer multiple detection strategies: rule-based pattern matching for known harmful patterns, ML-based classifiers for nuanced content categories, and LLM-as-judge evaluation for context-dependent harm. Apply different severity thresholds per use case — a medical information agent has different safety boundaries than a creative writing agent. Emit structured telemetry for all safety decisions.",
          },
          {
            id: "rai-gw-2",
            text: "Implement bias detection on model outputs at the gateway with statistical monitoring",
            exec:
              "Bias in AI outputs manifests across protected attributes: gender, race, age, disability, religion. NIST AI RMF MAP 2.3 requires identifying fairness-related risks. The gateway sees all model traffic, making it the optimal point to measure output bias across the full request distribution rather than isolated test cases.",
            eng:
              "Deploy a bias detection pipeline at the gateway that samples model outputs and evaluates them against fairness metrics: demographic parity in recommendations, sentiment consistency across demographic references, stereotype association scores, and representation balance in generated content. Compute metrics on rolling windows per model version and agent type. Alert when bias metrics deviate from established baselines. Feed bias signals into the model evaluation pipeline and governance dashboards.",
          },
          {
            id: "rai-gw-3",
            text: "Enforce model-level safety configurations and system prompt integrity at the gateway",
            exec:
              "Safety-critical system prompts — the instructions that define model behavior boundaries, tone, and prohibited actions — must be tamper-proof and consistently applied. If an agent or developer can override safety-critical system prompt sections, the entire safety architecture is undermined.",
            eng:
              "Manage safety-critical system prompt segments as versioned, immutable artifacts deployed through the gateway. Inject mandatory safety instructions into every model call regardless of the calling agent's system prompt. Implement integrity checks that detect and block attempts to override or negate safety instructions through user-message injection. Version and audit all changes to safety prompt configurations.",
          },
        ],
      },

      /* ── Tools (moderate) ────────────────────────────────── */
      {
        layerId: "tools",
        tier: "moderate",
        guidelines: [
          {
            id: "rai-tool-1",
            text: "Classify tools by ethical risk level and enforce proportionate safeguards",
            exec:
              "Tools that affect people directly — sending communications, modifying records, making financial transactions — carry higher ethical risk than read-only tools. NIST AI RMF MANAGE 2.2 requires risk-proportionate controls. A one-size-fits-all tool permission model either over-constrains safe tools or under-constrains dangerous ones.",
            eng:
              "Assign each tool an ethical risk classification: low (read-only, no PII), medium (data mutations, PII access), high (external communications, financial actions, decisions affecting individuals). Enforce proportionate safeguards: low-risk tools execute freely, medium-risk tools require audit logging and rate limits, high-risk tools require human approval before execution. Review tool risk classifications quarterly as tool capabilities evolve.",
          },
          {
            id: "rai-tool-2",
            text: "Validate tool outputs for bias and harmful content before injecting into agent context",
            exec:
              "Tools that retrieve data from external systems can introduce biased or harmful content into the agent's context — a search tool returning biased web content, a database query returning historically discriminatory data patterns. Bias enters through tools, not just through the model itself.",
            eng:
              "Apply content safety and bias screening to tool outputs before they are injected into the agent's context window. Flag tool results that contain potentially biased data patterns (e.g., historical data reflecting discriminatory practices) with contextual warnings that the agent's system prompt can reference. Log tool output classifications for bias audit trails.",
          },
        ],
      },

      /* ── Memory (moderate) ───────────────────────────────── */
      {
        layerId: "memory",
        tier: "moderate",
        guidelines: [
          {
            id: "rai-mem-1",
            text: "Audit RAG knowledge bases for bias, accuracy, and representational balance",
            exec:
              "RAG memory stores are the factual foundation for grounded AI responses. If the knowledge base contains biased, outdated, or unrepresentative content, every grounded response inherits those biases. NIST AI RMF MAP 2.3 requires assessing data for bias and representativeness.",
            eng:
              "Implement periodic audits of RAG knowledge bases covering: source diversity (are multiple perspectives represented?), demographic balance in examples and case studies, currency of information (are outdated practices still indexed?), and accuracy validation against authoritative sources. Generate audit reports with bias scores per content category. Remediate identified gaps through targeted content curation. Track audit coverage and remediation rates on the governance dashboard.",
          },
          {
            id: "rai-mem-2",
            text: "Prevent conversation memory from creating discriminatory user profiles",
            exec:
              "Long-term conversation memory and user preference models can accumulate inferred attributes — political views, health conditions, financial status — that create a discriminatory profiling risk if used as context for future interactions. The EU AI Act prohibits AI systems that create social scoring or exploit vulnerabilities.",
            eng:
              "Define and enforce boundaries on what attributes can be stored in user preference models and conversation memory. Block inference and storage of sensitive attributes (political opinions, health status, sexual orientation) unless explicitly consented to for a declared purpose. Implement periodic reviews of accumulated user profiles for discriminatory pattern formation. Provide users with visibility into and control over their stored preference data.",
          },
        ],
      },

      /* ── State (minimal) ─────────────────────────────────── */
      {
        layerId: "state",
        tier: "minimal",
        guidelines: [
          {
            id: "rai-st-1",
            text: "Include ethical decision audit context in agent checkpoint state for post-hoc review",
            exec:
              "When an agent makes a decision that affects an individual — approving or denying a request, prioritizing one user over another, escalating a case — the ethical basis for that decision must be recoverable from the checkpoint state. NIST AI RMF GOVERN 1.7 requires accountability mechanisms for AI decisions.",
            eng: "",
          },
        ],
      },

      /* ── Observability (critical) ────────────────────────── */
      {
        layerId: "observability",
        tier: "critical",
        guidelines: [
          {
            id: "rai-obs-1",
            text: "Monitor fairness metrics continuously in production across protected attributes",
            exec:
              "Fairness is not a one-time evaluation — it drifts as user populations, data distributions, and model behavior evolve. NIST AI RMF MEASURE 2.6 and 2.7 require ongoing monitoring of bias and fairness. Without continuous production monitoring, bias regressions go undetected until they cause measurable harm.",
            eng:
              "Define fairness metrics per use case: demographic parity (equal positive outcome rates across groups), equalized odds (equal true positive and false positive rates), predictive parity (equal precision across groups), and individual fairness (similar individuals receive similar treatment). Compute metrics on rolling production windows. Segment by protected attributes where available through voluntary self-identification. Alert when metrics deviate from baselines by more than configurable thresholds. Display fairness dashboards alongside accuracy and performance metrics.",
          },
          {
            id: "rai-obs-2",
            text: "Track and alert on content safety incident rates across all safety categories",
            exec:
              "Content safety failures — harmful outputs that bypass filters and reach users — must be tracked as incidents with the same rigor as security breaches. Without incident-rate monitoring, the organization cannot measure safety posture, detect degradation, or demonstrate compliance with EU AI Act safety requirements.",
            eng:
              "Emit structured events for every content safety classification: category, severity, action taken (blocked, flagged, passed), model version, and agent type. Compute incident rates (harmful outputs that reached users) per safety category on rolling windows. Set alert thresholds per category — zero tolerance for highest-severity categories, statistical thresholds for lower severities. Generate weekly safety reports for governance review. Feed incident data back into red-team test suites and classifier retraining pipelines.",
          },
          {
            id: "rai-obs-3",
            text: "Log decision explanations and reasoning traces for all consequential AI decisions",
            exec:
              "The EU AI Act Article 13 requires that high-risk AI systems are designed to be sufficiently transparent for users to interpret outputs. NIST AI RMF MEASURE 2.8 requires explainability. When an AI decision affects an individual, the organization must be able to explain why that decision was made — not just what the decision was.",
            eng:
              "Capture structured decision explanations for all consequential agent actions: the input context, retrieved sources, model reasoning (chain-of-thought), alternative options considered, confidence levels, and the final decision with its basis. Store explanations linked to the execution trace via trace ID. Implement a decision-review interface where compliance officers can inspect any flagged decision's full reasoning chain. Retain decision explanations for the regulatory-required period (minimum 5 years for EU AI Act high-risk systems).",
          },
          {
            id: "rai-obs-4",
            text: "Measure and report hallucination rates with automated factuality evaluation",
            exec:
              "Hallucination — generating plausible but false information — is a core reliability risk for LLM-based systems. Without systematic measurement, organizations cannot quantify the trustworthiness of their AI outputs or track whether changes improve or degrade factual accuracy. NIST AI RMF identifies validity and reliability as foundational trustworthy AI characteristics.",
            eng:
              "Deploy automated factuality evaluators that sample production responses and score them against grounding sources (RAG retrieval hits, knowledge base entries, authoritative reference data). Compute hallucination rates per model version, agent type, and topic domain. Alert when hallucination rates exceed configurable thresholds. Report hallucination metrics alongside accuracy metrics on the model evaluation dashboard. Use high-hallucination responses to enrich red-team test suites.",
          },
        ],
      },

      /* ── Governance (critical) ───────────────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "rai-gov-1",
            text: "Conduct human rights impact assessments for all AI systems that affect individuals",
            exec:
              "The UNESCO AI Ethics Recommendation and the EU AI Act require that organizations assess the human rights impact of AI systems before deployment. Impact assessments identify risks to fundamental rights — non-discrimination, privacy, freedom of expression, access to services — that technical bias metrics alone do not capture.",
            eng:
              "Create a human rights impact assessment (HRIA) template covering: affected populations, fundamental rights at risk, severity and likelihood of adverse impacts, existing mitigations, residual risk, and monitoring plan. Require HRIA completion for all AI systems classified as medium or high risk. Review assessments annually or when system scope changes materially. Publish impact assessment summaries (redacting commercially sensitive details) for transparency. Store HRIAs in the governance system linked to the agent registry.",
          },
          {
            id: "rai-gov-2",
            text: "Establish an AI ethics review board with authority to block deployments that fail responsible AI criteria",
            exec:
              "Technical controls catch measurable harms; an ethics review board catches contextual, societal, and emergent risks that automated systems miss. The NIST AI RMF GOVERN function and Microsoft RAI Standard both require organizational accountability structures with genuine authority over AI deployment decisions.",
            eng:
              "Constitute a cross-functional AI ethics board including engineering, legal, compliance, domain experts, and external advisors. Grant the board authority to: review and approve high-risk AI deployments, mandate additional testing or mitigations, block deployments that fail responsible AI criteria, and require post-deployment monitoring plans. Define clear escalation criteria for which deployments require board review. Document all board decisions with rationale.",
          },
          {
            id: "rai-gov-3",
            text: "Maintain a responsible AI incident response process with defined severity levels and remediation SLAs",
            exec:
              "When an AI system produces harmful, biased, or unexplainable outputs in production, the organization needs a structured response process — not ad-hoc scrambling. The EU AI Act Article 62 requires providers of high-risk AI to report serious incidents. Without a defined process, response is slow, inconsistent, and poorly documented.",
            eng:
              "Define responsible AI incident severity levels: P1 (immediate harm to individuals, prohibited use detected), P2 (systematic bias confirmed, safety classifier bypass), P3 (isolated harmful output, fairness metric degradation), P4 (user complaint, minor quality concern). Set remediation SLAs per level: P1 requires immediate model/feature disablement, P2 requires remediation within 24 hours, P3 within one sprint, P4 within the next release. Implement a post-incident review process that produces a root-cause analysis and feeds findings back into red-team test suites, classifier training, and governance policies.",
          },
          {
            id: "rai-gov-4",
            text: "Enforce mandatory bias and fairness testing as a pre-deployment gate for all models and prompts",
            exec:
              "NIST AI RMF MEASURE 2.6 requires pre-deployment bias evaluation. The EU AI Act requires that high-risk AI systems are tested for bias before being placed on the market. Deploying models or prompts without bias testing is a governance failure that compounds with each untested deployment.",
            eng:
              "Integrate bias and fairness evaluation into the CI/CD pipeline for all model and prompt changes. Run evaluation suites that measure: output consistency across demographic references, sentiment bias in generated content, stereotype association using established benchmarks (BBQ, WinoBias, or domain-specific equivalents), and disparate impact in decision-oriented outputs. Set pass/fail thresholds per metric. Block deployments that fail fairness gates. Store evaluation results in the model registry alongside accuracy metrics.",
          },
        ],
      },

      /* ── Systems of Record (moderate) ────────────────────── */
      {
        layerId: "systems",
        tier: "moderate",
        guidelines: [
          {
            id: "rai-sys-1",
            text: "Assess systems of record for historical bias before using their data in AI pipelines",
            exec:
              "Systems of record reflect historical business decisions that may embed structural biases — lending data reflecting discriminatory practices, hiring records reflecting gender imbalance, customer service data reflecting language biases. Using this data uncritically in AI training or RAG pipelines perpetuates and amplifies these biases. NIST AI RMF MAP 2.3 requires data fitness assessment.",
            eng:
              "Conduct bias assessments on data sourced from systems of record before incorporating it into AI training, fine-tuning, or RAG pipelines. Measure demographic distribution, outcome fairness, and representation balance in source data. Document identified biases with remediation strategies (resampling, reweighting, augmentation). Tag data lineage with bias assessment results so downstream consumers can evaluate fitness for their use case.",
          },
          {
            id: "rai-sys-2",
            text: "Implement fairness-aware data sampling when extracting training data from enterprise systems",
            exec:
              "Naive data extraction from enterprise systems produces training sets that reflect operational biases — majority-class overrepresentation, temporal biases from seasonal patterns, and survivorship bias from incomplete records. Fairness-aware sampling corrects these imbalances at the data pipeline stage rather than relying solely on model-level debiasing.",
            eng:
              "Implement stratified sampling strategies that ensure balanced representation across protected attributes in training data extracted from systems of record. Apply oversampling or synthetic augmentation for underrepresented groups where appropriate. Document the sampling strategy and its fairness rationale in the data lineage record. Validate that sampled distributions meet predefined balance targets before feeding data into training pipelines.",
          },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  PILLAR 8 — Observability & Operations                           */
  /* ================================================================ */
  {
    id: "observability-operations",
    name: "Observability & Operations",
    icon: "\u{1F4E1}",
    exec:
      "Agentic AI platforms generate execution patterns that are fundamentally harder to observe than traditional request-response services. A single user request can spawn multi-agent workflows spanning dozens of LLM calls, tool invocations, memory reads, and state mutations — each with non-deterministic latency, variable token consumption, and probabilistic correctness. Traditional APM tools capture infrastructure health but miss the AI-specific signals that matter: whether the model hallucinated, whether the agent selected the right tool, whether the retrieval grounded the response, and whether the total cost was proportionate to the value delivered. Without AI-native observability — distributed traces that follow agent delegation chains, LLM-specific metrics (token throughput, grounding scores, tool-call success rates), semantic telemetry that captures intent alongside events, and cost attribution per tenant and per agent — organizations operate their most complex and expensive systems blind. SRE principles must be adapted for AI workloads: SLOs defined on end-to-end agent latency and response quality, error budgets that account for non-determinism, incident playbooks that cover model degradation and safety-threshold breaches, and on-call practices that treat hallucination spikes with the same urgency as availability outages.",
    eng:
      "Instrument every layer of the agentic architecture with OpenTelemetry-based distributed tracing, propagating trace context from the surface through orchestration, runtime, gateway, tools, memory, and state. Define LLM-specific semantic conventions for spans: model identifier, prompt/completion token counts, estimated cost, grounding score, and tool-call outcomes. Emit custom metrics for agent-level KPIs — task completion rate, delegation depth, context-window utilization, and hallucination rate. Build cost-attribution pipelines that tag every LLM call and tool invocation with tenant, agent, workflow, and task identifiers, then aggregate into real-time showback dashboards. Define SLOs on P50/P95/P99 inference latency, end-to-end agent response time, and response quality scores. Implement anomaly detection on token consumption patterns, error rates, and latency distributions to surface degradation before users notice. Create AI-specific incident response playbooks covering model regression, safety-classifier bypass, retrieval pipeline failure, and runaway cost scenarios. Treat observability data as a first-class product — it powers debugging, cost optimization, model evaluation, and continuous improvement.",
    citations: [
      {
        id: "otel-genai-semconv",
        label: "OpenTelemetry Semantic Conventions for Generative AI Systems",
        url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/",
        org: "OpenTelemetry / CNCF",
      },
      {
        id: "azure-waf-ai-ops",
        label: "Azure Well-Architected Framework — Operational Excellence for AI Workloads",
        url: "https://learn.microsoft.com/en-us/azure/well-architected/ai/observability",
        org: "Microsoft",
      },
      {
        id: "datadog-llm-obs",
        label: "Datadog LLM Observability — Tracing and Evaluating LLM Applications",
        url: "https://www.datadoghq.com/product/llm-observability/",
        org: "Datadog",
      },
      {
        id: "google-sre-book",
        label: "Google Site Reliability Engineering — Monitoring Distributed Systems",
        url: "https://sre.google/sre-book/monitoring-distributed-systems/",
        org: "Google",
      },
      {
        id: "cncf-observability-wp",
        label: "CNCF Observability Whitepaper — Cloud-Native Observability Principles",
        url: "https://github.com/cncf/tag-observability/blob/main/whitepaper.md",
        org: "CNCF",
      },
    ],
    cells: [
      /* ── Surface (moderate) ──────────────────────────────── */
      {
        layerId: "surface",
        tier: "moderate",
        guidelines: [
          {
            id: "obs-surf-1",
            text: "Expose real-time agent execution status and latency indicators to end users",
            exec:
              "Agentic workflows take seconds to minutes — far longer than traditional API calls. Users waiting without feedback lose trust and retry, doubling load. Surfacing execution progress (which agent is active, which step is in progress, elapsed time) converts opaque waits into transparent workflows and reduces abandonment.",
            eng:
              "Stream execution-status events to the UI via SSE or WebSocket: current agent identity, active step label, elapsed wall-clock time, and estimated completion. Derive estimates from P50 historical latency for the workflow type. Display a visual progress indicator that maps to orchestration steps. Log client-side perceived latency alongside server-side instrumented latency to identify rendering bottlenecks.",
          },
          {
            id: "obs-surf-2",
            text: "Provide user-accessible response quality feedback that feeds the evaluation pipeline",
            exec:
              "Users detect quality failures — hallucinations, irrelevant responses, tone mismatches — that automated evaluators miss. Structured feedback from the surface layer is the highest-signal evaluation data source. Without a feedback loop, quality degradation goes undetected until it reaches governance escalation thresholds.",
            eng:
              "Implement a per-response feedback widget (thumbs up/down plus optional category tags: inaccurate, irrelevant, harmful, slow). Attach the originating trace ID, model version, and agent type to each feedback event. Route feedback to the evaluation pipeline where it joins automated quality scores. Aggregate feedback rates per model version and agent type on the observability dashboard. Alert when negative-feedback rates exceed rolling baselines.",
          },
        ],
      },

      /* ── Identity (minimal) ──────────────────────────────── */
      {
        layerId: "identity",
        tier: "minimal",
        guidelines: [
          {
            id: "obs-id-1",
            text: "Attach authenticated identity context to every trace span for tenant-scoped observability",
            exec:
              "Multi-tenant agentic platforms must attribute telemetry to specific tenants and users for cost showback, SLO reporting, and incident scoping. Without identity context on spans, observability data is an undifferentiated aggregate that cannot answer 'which tenant is affected?' or 'who is driving this cost spike?'.",
            eng: "",
          },
        ],
      },

      /* ── Orchestration (critical) ────────────────────────── */
      {
        layerId: "orchestration",
        tier: "critical",
        guidelines: [
          {
            id: "obs-orch-1",
            text: "Implement end-to-end distributed tracing across multi-agent delegation chains",
            exec:
              "A single user request in a multi-agent system fans out into a tree of agent invocations, each spawning LLM calls, tool executions, and memory operations. Without distributed tracing that follows the full delegation chain, debugging a failure at step 8 of a 12-step workflow requires manually correlating logs across independent agent instances — a process that does not scale.",
            eng:
              "Adopt OpenTelemetry trace propagation (W3C TraceContext) across all orchestration boundaries. Create a parent span for the user request and child spans for each agent delegation, preserving the tree structure. Attach span attributes per the OpenTelemetry GenAI semantic conventions: agent role, delegation depth, task description, and orchestration topology. Ensure child agent spans link back to the parent via standard parent-child span relationships. Export traces to a backend supporting tree visualization (Jaeger, Grafana Tempo, Datadog APM).",
          },
          {
            id: "obs-orch-2",
            text: "Track workflow-level SLOs covering end-to-end latency and task completion rate",
            exec:
              "Agent-level metrics (individual LLM call latency, single tool-call duration) do not capture the user experience. A workflow where every individual step is fast but the orchestrator makes poor delegation decisions can still be slow end-to-end. SLOs must be defined at the workflow level — P50/P95/P99 end-to-end latency and task-completion success rate — to align engineering effort with user-perceived quality.",
            eng:
              "Define SLIs at the orchestration layer: end-to-end workflow duration (time from user request to final response), task completion rate (did the workflow achieve its stated goal?), and delegation efficiency (ratio of useful agent invocations to total invocations). Set SLOs per workflow type — interactive workflows target P95 < 10s, batch workflows target P99 < 5min. Compute error budgets on a rolling 30-day window. Alert when burn rate indicates SLO breach within the budget period.",
          },
          {
            id: "obs-orch-3",
            text: "Log orchestration decision points to enable replay and root-cause analysis of workflow failures",
            exec:
              "When a multi-agent workflow produces a wrong result or times out, understanding the failure requires seeing every decision the orchestrator made: which plan it generated, which agents it selected, which delegations it attempted, and where the execution diverged from the plan. Without decision-point logging, root-cause analysis depends on reconstructing intent from execution traces alone.",
            eng:
              "Emit structured events at each orchestration decision point: plan generation (the full proposed plan), agent selection (candidates considered, selection rationale, selected agent), delegation dispatch (task payload, budget allocated, timeout set), result evaluation (sub-agent output, acceptance/rejection decision), and plan revision (original plan, revision trigger, revised plan). Link all events to the workflow trace via span context. Store decision logs with sufficient retention for post-incident review (minimum 30 days).",
          },
          {
            id: "obs-orch-4",
            text: "Detect and alert on anomalous workflow patterns — circular delegations, excessive fan-out, and cascading retries",
            exec:
              "Multi-agent orchestration can produce pathological execution patterns that waste resources and stall user requests: circular delegation loops where Agent A delegates to Agent B which delegates back to A, excessive fan-out where a supervisor spawns dozens of concurrent agents, and cascading retries where failure recovery triggers more failures. These patterns are invisible without real-time anomaly detection on workflow structure.",
            eng:
              "Instrument the orchestration layer to emit workflow-topology metrics: delegation depth, fan-out per orchestration step, retry count per agent, and cycle detection events. Apply statistical anomaly detection (z-score or IQR-based) on these metrics using rolling baselines per workflow type. Alert immediately on detected cycles. Alert on fan-out or retry counts exceeding 2 standard deviations from baseline. Feed anomaly data into the orchestration circuit-breaker to enable automatic mitigation.",
          },
        ],
      },

      /* ── Runtime (critical) ──────────────────────────────── */
      {
        layerId: "runtime",
        tier: "critical",
        guidelines: [
          {
            id: "obs-rt-1",
            text: "Capture LLM-specific metrics on every inference call — token counts, latency, model version, and estimated cost",
            exec:
              "LLM inference is the most expensive and latency-sensitive operation in the agentic stack. Without per-call metrics — prompt tokens, completion tokens, time-to-first-token, total latency, model identifier, and cost — organizations cannot optimize spend, detect model degradation, or right-size their model selection. The OpenTelemetry GenAI semantic conventions define a standard schema for these attributes.",
            eng:
              "Instrument all LLM client calls to emit spans with attributes per OpenTelemetry GenAI semantic conventions: gen_ai.system, gen_ai.request.model, gen_ai.usage.input_tokens, gen_ai.usage.output_tokens, gen_ai.response.finish_reason, and estimated cost (computed from token counts and model pricing). Record time-to-first-token for streaming responses as a separate metric. Aggregate into dashboards showing token throughput, cost rate, and latency distributions per model and per agent role.",
          },
          {
            id: "obs-rt-2",
            text: "Implement continuous evaluation in production — grounding score, tool-call success rate, and hallucination detection",
            exec:
              "Offline evaluations on benchmarks do not predict production behavior. Model quality drifts with prompt changes, data distribution shifts, and provider-side model updates. Continuous production evaluation — scoring live responses for faithfulness to retrieved context, correctness of tool-call decisions, and factual accuracy — is the only way to detect quality regressions before they accumulate user impact.",
            eng:
              "Deploy an evaluation sidecar that samples production responses (10-20% for high-traffic, 100% for low-traffic workflows) and scores them on: grounding fidelity (response-to-source overlap using NLI or token-F1), tool-call appropriateness (did the agent select the right tool for the task?), and hallucination rate (claims present in the response but absent from grounding sources). Store evaluation scores linked to trace IDs. Compute rolling averages per model version and agent type. Alert on score degradation exceeding configurable thresholds.",
          },
          {
            id: "obs-rt-3",
            text: "Monitor agent resource consumption — context-window utilization, memory footprint, and execution duration per agent instance",
            exec:
              "Agents are long-lived processes compared to stateless API handlers. A single agent can accumulate context, hold memory references, and consume compute for the duration of a multi-step workflow. Without per-agent resource monitoring, a memory-leaking agent or context-window-exhausting conversation degrades the platform silently until it triggers an out-of-memory kill or a context-truncation error.",
            eng:
              "Emit per-agent-instance metrics at regular intervals: context-window utilization (tokens used / context limit), process memory consumption, wall-clock execution time, and cumulative LLM calls. Set alerts for: context utilization exceeding 80% (trigger summarization), memory growth exceeding 2x baseline (potential leak), and execution duration exceeding the workflow-type P99. Expose resource metrics per agent on an operational dashboard for capacity planning.",
          },
          {
            id: "obs-rt-4",
            text: "Build semantic telemetry that captures agent intent and reasoning alongside execution events",
            exec:
              "Traditional telemetry records what happened — function calls, HTTP requests, database queries. In agentic systems, understanding why an agent took an action is equally important. Semantic telemetry captures the agent's stated intent, the plan it was executing, the reasoning behind tool selection, and the evaluation of intermediate results. Without this layer, post-incident analysis cannot distinguish between a correct execution of a bad plan and a bad execution of a correct plan.",
            eng:
              "Extend span attributes with semantic fields: agent.intent (the task goal in natural language), agent.plan_step (which step of the plan this span executes), agent.reasoning (summarized chain-of-thought for the decision), and agent.confidence (model-reported confidence when available). Capture these at the orchestration and runtime layers. Store semantic telemetry in the same trace backend as execution telemetry, enabling correlated queries. Use semantic fields to power a workflow-replay UI that shows reasoning alongside execution.",
          },
        ],
      },

      /* ── Gateway (critical) ──────────────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "obs-gw-1",
            text: "Instrument the LLM gateway for per-model, per-provider, and per-tenant traffic analytics",
            exec:
              "The LLM gateway is the single choke point for all model traffic. It sees every request across all agents, tenants, and model providers. Gateway-level instrumentation provides the authoritative source for token throughput, cost attribution, provider health, and capacity utilization. Without it, cost and performance data must be reconstructed from fragmented agent-level telemetry.",
            eng:
              "Emit metrics on every gateway request: model identifier, provider, tenant ID, agent role, token counts (prompt and completion), latency (total and time-to-first-token), HTTP status, and rate-limit headroom. Aggregate into real-time dashboards covering: cost per tenant per hour, token throughput per model, provider error rates, and rate-limit utilization. Use gateway metrics as the source of truth for billing reconciliation and capacity planning.",
          },
          {
            id: "obs-gw-2",
            text: "Implement provider health monitoring with automated failover telemetry",
            exec:
              "LLM providers experience outages, degradations, and rate-limit events that are outside the platform's control. The gateway must detect provider health issues in real time — not after users report failures. Provider health monitoring enables automated failover to backup models and provides the data needed to hold providers accountable against SLAs.",
            eng:
              "Track per-provider health signals at the gateway: error rate (4xx, 5xx), P50/P95/P99 latency, rate-limit rejection rate, and response quality scores (from the evaluation pipeline). Compute health scores on 1-minute rolling windows. Trigger automated failover when a provider's health score drops below configurable thresholds. Emit failover events with the trigger reason, source provider, target provider, and affected request count. Display provider health on the operations dashboard with historical trend data.",
          },
          {
            id: "obs-gw-3",
            text: "Implement cost attribution and showback at the gateway — per tenant, per agent, per workflow",
            exec:
              "LLM API costs scale with usage and are often the largest variable cost in agentic platforms. Without granular cost attribution, finance teams cannot allocate costs to business units, engineering cannot identify optimization targets, and product teams cannot price AI features accurately. The gateway — which sees every token — is the natural cost-metering point.",
            eng:
              "Compute estimated cost for every gateway request using token counts and model-specific pricing tables (maintained as configuration, updated when providers change pricing). Tag costs with tenant ID, agent role, workflow ID, and task type. Aggregate into showback dashboards with drill-down from tenant to workflow to individual LLM call. Set per-tenant and per-workflow cost budgets with alerts at 80% and hard circuit-breaking at 100%. Reconcile gateway-computed costs against provider invoices monthly.",
          },
        ],
      },

      /* ── Tools (moderate) ────────────────────────────────── */
      {
        layerId: "tools",
        tier: "moderate",
        guidelines: [
          {
            id: "obs-tool-1",
            text: "Trace every tool invocation with input/output summaries, latency, and success/failure status",
            exec:
              "Tool calls are where agents interact with the real world — querying databases, calling APIs, executing code. Tool failures are the most common cause of agent workflow failures, yet they are often logged only as opaque errors in the agent's reasoning trace. Without structured tool-call telemetry, diagnosing whether a workflow failed due to a bad tool call, a tool timeout, or a tool returning unexpected data requires reading raw agent logs.",
            eng:
              "Create a child span for every tool invocation with attributes: tool name, input parameters (redacted of PII), output summary (truncated to a configurable size), latency, success/failure status, and error category if failed. Link tool spans to the parent agent span. Aggregate tool metrics: per-tool success rate, P95 latency, invocation count, and error distribution. Alert on tool-level error-rate spikes that exceed historical baselines.",
          },
          {
            id: "obs-tool-2",
            text: "Monitor tool-call appropriateness — track whether agents select the right tools for their tasks",
            exec:
              "An agent can produce a technically successful but semantically wrong result by calling the wrong tool — using a web search when a database lookup was appropriate, or invoking a calculation tool for a question that needed retrieval. Tool-selection accuracy is a leading indicator of agent quality that is invisible in traditional error-rate metrics.",
            eng:
              "Sample tool-call decisions in the evaluation pipeline and score tool-selection appropriateness against the task context (using an LLM-as-judge evaluator or human review for high-stakes workflows). Compute tool-selection accuracy per agent type. Alert when accuracy drops below baseline. Feed misclassified tool selections back into agent prompt tuning and the red-team test suite.",
          },
        ],
      },

      /* ── Memory (moderate) ───────────────────────────────── */
      {
        layerId: "memory",
        tier: "moderate",
        guidelines: [
          {
            id: "obs-mem-1",
            text: "Monitor retrieval quality metrics — relevance, recall, and latency of RAG pipeline results",
            exec:
              "The RAG pipeline is the grounding backbone of most agentic systems. If retrieval returns irrelevant or stale documents, every downstream agent response inherits that quality deficit. Retrieval quality is a leading indicator of response quality — degradation here predicts hallucination spikes downstream. Without retrieval-specific monitoring, the root cause of quality regressions is misattributed to the model.",
            eng:
              "Instrument the retrieval pipeline to emit per-query metrics: number of chunks retrieved, relevance scores (from the vector similarity or reranker), retrieval latency, and cache hit rate. Sample retrieved chunks through a relevance evaluator (NLI-based or embedding-similarity against the query). Compute rolling retrieval quality scores per knowledge-base partition. Alert on relevance-score degradation that may indicate stale embeddings, index corruption, or data drift.",
          },
          {
            id: "obs-mem-2",
            text: "Track memory-store health — embedding freshness, index size, and query-latency distributions",
            exec:
              "Vector stores and memory backends are stateful infrastructure that degrade gradually: embeddings go stale as source documents change, index size grows unbounded without compaction, and query latency creeps up as data volume increases. Unlike crash failures, gradual degradation is invisible without proactive monitoring.",
            eng:
              "Emit infrastructure metrics for all memory stores: index document count, storage size, average and P99 query latency, embedding age distribution (time since last re-embedding), and compaction status. Set alerts for: query latency exceeding SLO targets, embedding age exceeding freshness policy (e.g., >30 days for actively updated sources), and index size approaching capacity limits. Display memory-store health on the infrastructure dashboard alongside compute and network metrics.",
          },
        ],
      },

      /* ── State (moderate) ────────────────────────────────── */
      {
        layerId: "state",
        tier: "moderate",
        guidelines: [
          {
            id: "obs-st-1",
            text: "Instrument checkpoint operations with durability confirmation and restore-success tracking",
            exec:
              "Workflow checkpoints are the recovery mechanism for long-running agent workflows. A checkpoint that appears to succeed but fails to persist durably — due to storage errors, serialization bugs, or replication lag — defeats the purpose of checkpointing. Without telemetry on checkpoint write-success, restore-success, and restore-fidelity, the recovery mechanism itself becomes an unmonitored single point of failure.",
            eng:
              "Emit metrics for every checkpoint operation: write latency, payload size, storage confirmation (was the write acknowledged by durable storage?), and any serialization warnings. Track checkpoint restore operations: restore latency, success/failure status, and state-version compatibility result. Compute checkpoint reliability rate (successful restores / total restore attempts) per workflow type. Alert when checkpoint reliability drops below 99.9% or when write-acknowledgment failures occur.",
          },
          {
            id: "obs-st-2",
            text: "Monitor state-store capacity, replication lag, and consistency metrics for agent session backends",
            exec:
              "Agent state backends (Redis, PostgreSQL, Temporal) underpin workflow durability. Capacity exhaustion causes checkpoint failures; replication lag causes stale reads during failover; consistency violations cause corrupted workflow state. These failure modes are preventable with proactive infrastructure monitoring but catastrophic if discovered only when a recovery attempt fails.",
            eng:
              "Collect and alert on state-backend infrastructure metrics: memory/disk utilization, replication lag (for replicated stores), connection pool usage, and operation latency distributions. Set capacity alerts at 70% utilization with projected-exhaustion estimates. Monitor replication lag against the maximum acceptable data-loss window (RPO). Validate consistency by periodically reading recently-written checkpoints and confirming data integrity.",
          },
        ],
      },

      /* ── Observability (critical) ────────────────────────── */
      {
        layerId: "observability",
        tier: "critical",
        guidelines: [
          {
            id: "obs-obs-1",
            text: "Adopt OpenTelemetry as the telemetry standard and define AI-specific semantic conventions for all instrumentation",
            exec:
              "Proprietary telemetry formats create vendor lock-in and fragment observability data across incompatible backends. The OpenTelemetry project — now a CNCF graduated project — provides vendor-neutral APIs, SDKs, and semantic conventions including the emerging GenAI semantic conventions for LLM-specific attributes. Standardizing on OpenTelemetry ensures telemetry portability, consistent attribute naming, and compatibility with the broadest ecosystem of backends and analysis tools.",
            eng:
              "Instrument all services with OpenTelemetry SDKs for traces, metrics, and logs. Adopt the OpenTelemetry GenAI semantic conventions for LLM-specific spans: gen_ai.system, gen_ai.request.model, gen_ai.usage.input_tokens, gen_ai.usage.output_tokens, gen_ai.response.finish_reason. Extend with platform-specific conventions for agent attributes (agent.role, agent.delegation_depth, workflow.type). Use the OpenTelemetry Collector for telemetry routing, sampling, and export to backend(s). Define and enforce attribute naming conventions in a shared instrumentation library.",
          },
          {
            id: "obs-obs-2",
            text: "Implement AI-specific alerting that covers model degradation, safety-threshold breaches, and cost anomalies",
            exec:
              "Traditional infrastructure alerts (CPU, memory, error rate) miss AI-specific failure modes: gradual model quality degradation, safety-classifier bypass rates increasing, hallucination rates spiking after a provider model update, or cost anomalies from a runaway agent loop. AI-specific alerts are the early-warning system that prevents silent quality erosion and unexpected cost overruns.",
            eng:
              "Define alert rules for AI-specific signals: hallucination rate exceeding baseline by >2 standard deviations, grounding score dropping below minimum threshold, safety-classifier block rate spiking (potential attack), content-safety bypass rate increasing (classifier degradation), per-tenant cost exceeding daily budget, and workflow latency SLO burn rate indicating breach. Route alerts to AI-ops on-call rotation. Include in each alert: the affected metric, current value, baseline value, impacted tenants/workflows, and a link to the relevant dashboard.",
          },
          {
            id: "obs-obs-3",
            text: "Create AI-specific incident response playbooks for model regression, retrieval failure, and safety-classifier bypass",
            exec:
              "AI workloads fail in ways that traditional incident playbooks do not cover: a model provider silently updates their model and quality degrades, the RAG pipeline returns stale documents after a failed re-indexing job, a safety classifier starts passing harmful content after a threshold misconfiguration, or a cost spike from a retry loop drains the monthly budget in hours. Without AI-specific playbooks, on-call engineers fall back to generic troubleshooting that wastes time on the wrong layers.",
            eng:
              "Author and maintain runbooks for: (1) model quality regression — symptoms, triage steps (check provider status, compare evaluation scores across model versions, verify prompt integrity), mitigation (failover to backup model, rollback prompt changes); (2) retrieval pipeline failure — symptoms, triage (check index health, embedding freshness, query-latency metrics), mitigation (serve from cache, degrade to non-RAG response with disclosure); (3) safety-classifier bypass — symptoms, triage (check classifier version, threshold configuration, recent deployments), mitigation (increase safety thresholds, enable secondary classifier, page security-on-call); (4) cost anomaly — symptoms, triage (identify top-cost workflow and agent, check for retry loops), mitigation (circuit-break affected workflow, apply emergency rate limits). Store playbooks in the incident management system linked to alert definitions.",
          },
          {
            id: "obs-obs-4",
            text: "Implement observability-driven continuous improvement — use telemetry to identify optimization targets and validate changes",
            exec:
              "Observability is not just for incident detection — it is the data foundation for continuous optimization. Token cost reduction, latency improvement, quality improvement, and model-routing decisions all depend on production telemetry. Without a systematic practice of mining observability data for improvement opportunities, optimization efforts are driven by intuition rather than evidence.",
            eng:
              "Establish a weekly review cadence that analyzes: top-cost workflows and agents (candidates for model-tier optimization or prompt compression), highest-latency orchestration paths (candidates for parallelization or caching), lowest-quality agent types (candidates for prompt tuning or model upgrade), and most-frequent tool errors (candidates for tool improvement or fallback strategies). Track optimization impact by comparing before/after metrics for each change. Publish optimization results to the engineering team to build a culture of data-driven AI operations.",
          },
        ],
      },

      /* ── Governance (moderate) ───────────────────────────── */
      {
        layerId: "governance",
        tier: "moderate",
        guidelines: [
          {
            id: "obs-gov-1",
            text: "Define and enforce telemetry retention policies aligned with compliance requirements and operational needs",
            exec:
              "Observability data for AI systems captures prompts, completions, reasoning traces, and user interactions that may constitute personal data or regulated content. Retaining everything indefinitely creates compliance risk; deleting too aggressively loses the data needed for incident investigation and model evaluation. Retention policies must balance regulatory requirements, operational needs, and storage costs.",
            eng:
              "Define retention tiers for observability data: hot (7-14 days, full-resolution traces and logs for active debugging), warm (30-90 days, sampled traces and aggregated metrics for trend analysis), cold (1-2 years, compliance-required audit logs and incident-related traces). Apply PII redaction before data moves from hot to warm tier. Automate lifecycle management through the telemetry pipeline. Validate retention policies against GDPR, sector-specific regulations, and contractual obligations.",
          },
          {
            id: "obs-gov-2",
            text: "Publish SLO dashboards and error-budget reports for AI workloads to stakeholders across engineering, product, and leadership",
            exec:
              "SLOs are only useful if they drive decisions. Engineering needs SLO dashboards for operational awareness, product needs them for feature-quality accountability, and leadership needs them for investment prioritization. Without cross-functional visibility, SLO breaches are treated as engineering incidents rather than product-quality signals.",
            eng:
              "Build tiered dashboards: operational (real-time SLI values, error-budget burn rates, active incidents), product (weekly quality trends, cost-per-interaction, user-feedback rates per feature), and executive (monthly SLO compliance summary, cost trends, quality trends). Automate weekly SLO reports distributed to engineering and product leads. Trigger error-budget-exhaustion reviews that bring engineering and product together to decide between reliability investment and feature velocity.",
          },
        ],
      },

      /* ── Systems of Record (moderate) ────────────────────── */
      {
        layerId: "systems",
        tier: "moderate",
        guidelines: [
          {
            id: "obs-sys-1",
            text: "Trace agent-to-system interactions with round-trip latency, payload size, and error categorization",
            exec:
              "Agents interact with systems of record (CRMs, ERPs, databases) through tool integrations that are often the slowest and most failure-prone links in the execution chain. Without tracing at the system-integration boundary, tool-call failures are attributed to the agent rather than the downstream system, and latency budgets cannot be allocated across the stack.",
            eng:
              "Create spans for every system-of-record interaction with attributes: target system identifier, operation type (read/write/query), payload size, round-trip latency, response status, and error category (timeout, auth failure, rate limit, data error). Aggregate per-system metrics: availability, P95 latency, error-rate distribution, and throughput. Display system-health dashboards alongside agent-workflow dashboards to enable cross-stack root-cause analysis. Alert on system-level degradation that will impact agent workflow SLOs.",
          },
          {
            id: "obs-sys-2",
            text: "Correlate agent workflow traces with system-of-record audit logs for end-to-end accountability",
            exec:
              "When an agent modifies a record in a CRM or triggers a transaction in an ERP, the system-of-record's audit log captures the mutation but not the agent reasoning that led to it. The agent trace captures the reasoning but not the downstream system impact. Without correlation between these two telemetry streams, neither the AI team nor the system-of-record team has full accountability context.",
            eng:
              "Propagate a correlation identifier (the OpenTelemetry trace ID or a dedicated correlation header) through all agent-to-system interactions. Store the correlation ID in the system-of-record's audit log alongside the mutation record. Build a correlation query interface that, given either a trace ID or a system-audit-log entry, retrieves the full end-to-end context: user request, agent reasoning, tool invocation, and system mutation. Use correlated data for compliance audits and incident investigations.",
          },
        ],
      },
    ],
  },


  /* ================================================================
   *  9. COST MANAGEMENT
   * ================================================================ */
  {
    id: "cost-management",
    name: "Cost Management",
    icon: "◎",
    exec:
      "LLM inference is the dominant variable cost in agentic platforms, and it scales non-linearly with agent complexity — multi-step reasoning, tool-calling loops, and RAG augmentation multiply token consumption per user request. Without disciplined cost management spanning model selection, prompt optimization, caching, and tenant-level attribution, AI spend becomes unpredictable and unaccountable. A FinOps-for-AI practice must be embedded across every architecture layer, treating tokens as a metered resource with the same rigor applied to cloud compute and storage.",
    eng:
      "Cost management in agentic systems requires instrumentation at the gateway for metering, policy enforcement at the orchestration layer for budget controls, and optimization techniques at every layer that touches LLM inference. Implement model tiering to route requests to the cheapest capable model, prompt caching to eliminate redundant token processing, semantic caching to serve repeated intents from cache, and context-window right-sizing to avoid paying for unused capacity. Attribute all costs to tenants, agents, and workflows using gateway telemetry. Set budget guardrails with circuit-breakers that degrade gracefully rather than failing hard.",
    citations: [
      {
        id: "azure-waf-ai-cost",
        label: "Azure Well-Architected Framework — Cost Optimization for AI Workloads",
        url: "https://learn.microsoft.com/en-us/azure/well-architected/ai/cost",
        org: "Microsoft",
      },
      {
        id: "finops-ai",
        label: "FinOps Foundation — AI Cost Management Working Group",
        url: "https://www.finops.org/wg/ai-cost-management/",
        org: "FinOps Foundation",
      },
      {
        id: "anthropic-prompt-caching",
        label: "Anthropic — Prompt Caching Documentation",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
        org: "Anthropic",
      },
      {
        id: "openai-pricing",
        label: "OpenAI — API Pricing and Token Economics",
        url: "https://openai.com/api/pricing/",
        org: "OpenAI",
      },
      {
        id: "aws-genai-cost",
        label: "AWS — Cost Optimization for Generative AI Workloads",
        url: "https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/cost-optimization.html",
        org: "AWS",
      },
    ],
    cells: [
      /* ── Surface (moderate) ──────────────────────── */
      {
        layerId: "surface",
        tier: "moderate",
        guidelines: [
          {
            id: "cost-surf-1",
            text: "Implement token-aware UX patterns that minimize unnecessary inference cost",
            exec:
              "Every user interaction that triggers an LLM call consumes tokens. Auto-submit on keystroke, speculative pre-generation, and unbounded conversation histories inflate costs without proportional user value. The UI must be designed to elicit high-signal, well-scoped prompts that reduce wasted inference.",
            eng:
              "Use explicit submit actions instead of auto-triggering inference. Display estimated token cost or complexity indicator before submission for high-cost operations. Implement conversation-history truncation or summarization in the UI layer to prevent unbounded context growth. Offer suggested prompts and templates that guide users toward efficient query patterns. Track cost-per-interaction at the UI level and surface it in analytics dashboards.",
          },
          {
            id: "cost-surf-2",
            text: "Use streaming responses with early termination to avoid paying for unwanted output",
            exec:
              "Users frequently abandon or redirect long-form AI responses mid-stream. Without early termination, the platform pays for completion tokens the user never reads. Streaming with cancellation support converts wasted output tokens into direct cost savings.",
            eng:
              "Implement SSE or WebSocket streaming for all LLM responses. Provide a visible stop/cancel button that sends an abort signal propagated to the LLM gateway. Track early-termination rates per workflow type — high rates indicate over-generation that can be addressed by tuning max_tokens or response-length instructions in the system prompt.",
          },
        ],
      },

      /* ── Identity (minimal) ──────────────────────── */
      {
        layerId: "identity",
        tier: "minimal",
        guidelines: [
          {
            id: "cost-id-1",
            text: "Bind cost quotas and tier entitlements to authenticated identity for per-tenant budget enforcement",
            exec:
              "Cost controls that operate without identity context cannot enforce per-tenant budgets, tiered pricing plans, or usage-based billing. Identity is the key that links every inference request to a billable entity and its associated spending limits.",
            eng: "",
          },
        ],
      },

      /* ── Orchestration (critical) ──────────────────── */
      {
        layerId: "orchestration",
        tier: "critical",
        guidelines: [
          {
            id: "cost-orch-1",
            text: "Implement model tiering — route each task to the cheapest model that meets its quality threshold",
            exec:
              "Not every agent task requires frontier-model capabilities. Classification, extraction, and simple summarization can be handled by smaller, cheaper models at 10-50x lower cost per token. Routing all tasks to a single high-end model wastes budget on work that simpler models handle equally well. Model tiering is typically the single highest-impact cost optimization in agentic platforms.",
            eng:
              "Define a task-complexity classifier at the orchestration layer that categorizes each sub-task (e.g., simple extraction, multi-step reasoning, creative generation, code synthesis). Maintain a model-tier configuration mapping task categories to models: lightweight tasks to small models (GPT-4o mini, Claude Haiku, Llama 3 8B), moderate tasks to mid-tier models, and complex tasks to frontier models. Evaluate tier assignments using offline benchmarks and continuous production quality scores. Log model-tier decisions with task metadata to enable ongoing optimization.",
          },
          {
            id: "cost-orch-2",
            text: "Enforce per-workflow and per-agent token budgets with graceful degradation on exhaustion",
            exec:
              "Runaway agent loops, excessive tool-calling chains, and open-ended reasoning steps can consume orders of magnitude more tokens than intended. Without per-workflow budget caps, a single pathological request can consume an entire tenant's daily allocation. Budget enforcement at the orchestration layer prevents cost blowouts before they reach the gateway.",
            eng:
              "Assign a token budget to each workflow invocation based on workflow type and tenant tier. Track cumulative token consumption across all LLM calls within the workflow. At 80% budget consumption, trigger a summarize-and-compress step that condenses the conversation context. At 100%, halt further LLM calls and return the best available partial result with a budget-exhaustion notice. Emit budget-consumption metrics per workflow for capacity planning and budget calibration.",
          },
          {
            id: "cost-orch-3",
            text: "Optimize orchestration topology for cost — prefer parallel fan-out over sequential chains when quality is equivalent",
            exec:
              "Sequential multi-agent chains accumulate context at each step, causing later agents to process all previous agents' outputs as input tokens. Parallel fan-out with result aggregation keeps each agent's context window lean. For workflows where agent ordering doesn't matter, parallelization reduces total token consumption in addition to reducing latency.",
            eng:
              "Analyze workflow DAGs to identify steps that can execute in parallel without data dependencies. For parallel branches, provide each agent only the context it needs — not the accumulated history of sibling branches. Implement a lightweight aggregation step that combines parallel results. Compare sequential vs. parallel token consumption per workflow type and enforce the more efficient topology in the orchestration configuration.",
          },
          {
            id: "cost-orch-4",
            text: "Implement prompt optimization — compress system prompts and few-shot examples to minimize per-request input token overhead",
            exec:
              "System prompts and few-shot examples are repeated on every LLM call and often account for 60-80% of input tokens in agentic workloads. A 1,000-token reduction in the system prompt across 100,000 daily requests saves 100 million input tokens per day — a material cost reduction that requires no quality tradeoff when done carefully.",
            eng:
              "Audit all system prompts for redundancy, verbosity, and unused instructions. Apply prompt compression techniques: remove filler language, use structured formats (YAML/JSON) instead of prose for tool definitions, and replace verbose few-shot examples with concise ones. Measure quality impact using the evaluation pipeline before and after compression. Automate prompt-token-count tracking and alert when prompt size regresses. Consider prompt-compression models (LLMLingua, selective context) for dynamic context that cannot be manually optimized.",
          },
        ],
      },

      /* ── Runtime (moderate) ──────────────────────── */
      {
        layerId: "runtime",
        tier: "moderate",
        guidelines: [
          {
            id: "cost-rt-1",
            text: "Right-size context windows — send only the context each inference call actually needs",
            exec:
              "LLM pricing scales with token count, and many implementations naively pass the full conversation history and all retrieved documents to every call. Right-sizing the context window — sending only relevant history, selected retrieval chunks, and necessary tool outputs — directly reduces input token costs without quality degradation for focused tasks.",
            eng:
              "Implement context-selection logic that filters conversation history to the most relevant turns for each call (sliding window, topic-relevance scoring, or summarization of older turns). For RAG-augmented calls, limit retrieved chunks to the top-k most relevant and set k based on task complexity. Strip tool-call results from history when they are no longer relevant to the current reasoning step. Monitor context-window utilization per model call and alert when average utilization exceeds 70% of the model's maximum — a sign that context management needs optimization.",
          },
          {
            id: "cost-rt-2",
            text: "Leverage batch inference for non-interactive workloads to reduce per-token cost",
            exec:
              "Batch inference APIs (OpenAI Batch API, Anthropic Message Batches) offer 50% cost discounts by trading latency for throughput. Workloads that are not latency-sensitive — nightly evaluations, bulk classification, document processing, scheduled summarization — should always use batch endpoints rather than real-time inference.",
            eng:
              "Identify all non-interactive LLM workloads: evaluation pipelines, data enrichment jobs, report generation, embedding computation, and scheduled summarization. Route these through a batch-processing queue that accumulates requests and submits them to batch inference endpoints. Set batch SLOs (e.g., complete within 24 hours) rather than real-time latency targets. Track batch vs. real-time cost split as a key FinOps metric — the ratio indicates optimization headroom.",
          },
        ],
      },

      /* ── Gateway (critical) ──────────────────────── */
      {
        layerId: "gateway",
        tier: "critical",
        guidelines: [
          {
            id: "cost-gw-1",
            text: "Implement prompt caching at the gateway to eliminate redundant processing of repeated prefixes",
            exec:
              "Agentic platforms repeat identical system prompts, tool definitions, and few-shot examples across thousands of requests. Prompt caching — supported natively by Anthropic (cache_control breakpoints) and via prefix caching by other providers — reduces input token costs by up to 90% for the cached prefix and cuts time-to-first-token by up to 85%. The gateway is the natural enforcement point for cache-aware request routing.",
            eng:
              "Structure all LLM requests with stable prefixes (system prompt, tool definitions, few-shot examples) followed by variable content (user message, retrieved context). Enable provider-native prompt caching where available (Anthropic cache_control headers, OpenAI automatic prefix caching). At the gateway, route requests with identical prefixes to the same provider endpoint to maximize cache hit rates. Monitor cache hit ratio per model and per tenant — target >80% hit rate for system-prompt prefixes. Alert on cache-miss spikes that indicate prompt instability or routing misconfiguration.",
          },
          {
            id: "cost-gw-2",
            text: "Deploy semantic caching to serve repeated and near-duplicate queries from cache without LLM inference",
            exec:
              "Many user queries to agentic systems are semantically identical or near-duplicates — rephrased questions, repeated lookups, and common support requests. Semantic caching uses embedding similarity to match incoming queries against cached responses, serving cache hits without any LLM inference. For platforms with repetitive query patterns, semantic caching can eliminate 20-40% of inference calls.",
            eng:
              "Deploy an embedding-based semantic cache layer at the gateway. On each request, compute the embedding of the user query and search the cache for entries above a configurable similarity threshold (start at 0.95 cosine similarity). On cache hit, return the cached response with a cache-hit indicator. On cache miss, forward to the LLM, cache the response keyed by the query embedding. Implement TTL-based and event-based cache invalidation to prevent serving stale responses. Partition the cache by tenant and model to avoid cross-contamination. Track cache hit rate, latency savings, and cost avoidance as primary KPIs.",
          },
          {
            id: "cost-gw-3",
            text: "Implement real-time cost attribution and per-tenant budget enforcement at the gateway",
            exec:
              "The LLM gateway is the single metering point for all model traffic. Every token passes through it, making it the authoritative source for cost attribution, budget enforcement, and usage-based billing. Without gateway-level cost controls, budget enforcement depends on after-the-fact reconciliation that cannot prevent overruns.",
            eng:
              "Compute per-request cost on every gateway response using token counts from the provider response and a maintained pricing table per model. Tag costs with tenant ID, agent role, workflow ID, and task type. Enforce per-tenant budget limits in real-time: soft limits trigger alerts and degrade to cheaper models, hard limits reject requests with a budget-exhausted error. Aggregate costs into hourly and daily rollups for showback dashboards. Reconcile gateway-computed costs against provider invoices monthly to detect metering drift.",
          },
          {
            id: "cost-gw-4",
            text: "Route traffic across providers to optimize cost-quality tradeoffs and leverage competitive pricing",
            exec:
              "LLM providers offer different price-performance profiles that change frequently. A gateway locked to a single provider cannot capitalize on pricing competition, promotional tiers, or provider-specific strengths. Multi-provider routing enables cost arbitrage — sending traffic to the provider offering the best price for equivalent quality on each task type.",
            eng:
              "Maintain a provider-model matrix at the gateway with per-model pricing, latency profiles, and quality scores from the evaluation pipeline. Implement routing rules that select the optimal provider for each request based on task type, quality requirements, and current pricing. Support fallback routing that cascades to cheaper alternatives when primary providers are rate-limited or degraded. Track per-provider cost efficiency (quality per dollar) and update routing weights based on production evaluation data. Alert on pricing changes that shift optimal routing configuration.",
          },
        ],
      },

      /* ── Tools (moderate) ────────────────────────── */
      {
        layerId: "tools",
        tier: "moderate",
        guidelines: [
          {
            id: "cost-tool-1",
            text: "Cache tool-call results to avoid redundant external API calls and the LLM tokens spent processing duplicate outputs",
            exec:
              "Agents frequently invoke the same tool with identical or near-identical parameters within a single workflow or across workflows — repeated database lookups, API queries, and search operations. Each redundant tool call wastes both the external API cost and the LLM tokens consumed when the agent processes the duplicate result. Tool-result caching addresses both cost vectors.",
            eng:
              "Implement a tool-result cache keyed by tool identifier and normalized input parameters. Set per-tool TTLs based on data freshness requirements — real-time data (stock prices) gets short TTLs (seconds), reference data (product catalogs) gets longer TTLs (hours). For tools with side effects (write operations), cache only read operations. Monitor cache hit rates per tool and track combined savings from avoided API calls and avoided LLM token processing.",
          },
          {
            id: "cost-tool-2",
            text: "Optimize tool output formatting to minimize tokens consumed when the LLM processes tool results",
            exec:
              "Tool outputs are injected into the LLM context as tokens. Verbose tool responses — full JSON API payloads, unfiltered database result sets, raw HTML — inflate input token costs on the subsequent LLM call. Compressing tool outputs to include only the fields the agent actually needs can reduce per-tool-call token consumption by 50-80%.",
            eng:
              "Implement response-shaping middleware on tool outputs that extracts only the fields relevant to the agent's task. Define per-tool output schemas that specify which fields to include, maximum array lengths, and truncation rules for long text fields. Apply output compression before injecting tool results into the agent context. Track per-tool token contribution to the context window and flag tools whose outputs consistently exceed a configurable threshold.",
          },
        ],
      },

      /* ── Memory (moderate) ───────────────────────── */
      {
        layerId: "memory",
        tier: "moderate",
        guidelines: [
          {
            id: "cost-mem-1",
            text: "Optimize embedding operations — batch embedding requests, cache embeddings, and right-size embedding models",
            exec:
              "Embedding computation is a secondary but significant cost in RAG-heavy agentic systems. Real-time per-query embedding, re-embedding unchanged documents, and using high-dimensional models for simple retrieval tasks all waste compute and API cost. Embedding optimization compounds over millions of daily operations.",
            eng:
              "Batch embedding requests during document ingestion rather than embedding one-at-a-time. Cache query embeddings for repeated or similar queries using the semantic cache at the gateway layer. Use smaller, cheaper embedding models (e.g., text-embedding-3-small vs. text-embedding-3-large) when retrieval quality benchmarks show equivalent recall. Implement incremental re-embedding that only processes changed documents. Track embedding cost as a separate line item in the FinOps dashboard.",
          },
          {
            id: "cost-mem-2",
            text: "Implement retrieval-budget controls to limit the number of chunks injected into LLM context",
            exec:
              "Over-retrieval — fetching too many chunks from the vector store and injecting all of them into the LLM context — is a common cost amplifier. Each additional chunk increases input tokens on every subsequent LLM call in the workflow. Retrieval budgets cap the token cost of grounding without requiring changes to the retrieval pipeline itself.",
            eng:
              "Set a per-query retrieval budget in tokens (not just chunk count, since chunk sizes vary). Implement a reranker that scores retrieved chunks by relevance and selects the top chunks that fit within the token budget. Track average retrieval-token-to-context-token ratio per workflow type — this ratio indicates how much of the context window is consumed by retrieval vs. conversation history. Alert when retrieval token consumption exceeds budget thresholds.",
          },
        ],
      },

      /* ── State (minimal) ─────────────────────────── */
      {
        layerId: "state",
        tier: "minimal",
        guidelines: [
          {
            id: "cost-st-1",
            text: "Implement conversation-state compression to reduce checkpoint storage costs and context-reload token costs",
            exec:
              "Long-running agent workflows accumulate large conversation states that are checkpointed for durability. When a workflow resumes from a checkpoint, the full state is reloaded into the LLM context as input tokens. Compressing stored state — summarizing older turns, pruning resolved sub-tasks — reduces both storage costs and the token cost of resumption.",
            eng: "",
          },
        ],
      },

      /* ── Observability (moderate) ──────────────────── */
      {
        layerId: "observability",
        tier: "moderate",
        guidelines: [
          {
            id: "cost-obs-1",
            text: "Build FinOps dashboards that track AI unit economics — cost per conversation, cost per task completion, and cost per tenant",
            exec:
              "Raw token spend is meaningless without business context. FinOps for AI requires unit economics that connect infrastructure costs to business outcomes: cost per successful task completion, cost per conversation, cost per active tenant, and cost trend by workflow type. These metrics enable product teams to price AI features, engineering to prioritize optimizations, and finance to forecast spend.",
            eng:
              "Aggregate gateway cost data with workflow-completion telemetry to compute unit economics: total cost / successful completions = cost per task. Break down by dimensions: tenant, workflow type, model tier, and time period. Display on dashboards with trend lines, anomaly detection, and drill-down to individual expensive workflows. Compare unit costs across model-tier configurations to quantify optimization impact. Publish weekly FinOps reports to engineering, product, and finance stakeholders.",
          },
          {
            id: "cost-obs-2",
            text: "Implement cost anomaly detection that alerts on spend spikes before they exhaust budgets",
            exec:
              "AI workload costs can spike suddenly — a prompt regression that doubles token usage, a retry loop that multiplies calls, or a traffic surge from a new integration. After-the-fact invoice review catches these too late. Real-time cost anomaly detection using statistical baselines is the early-warning system that prevents budget blowouts.",
            eng:
              "Compute rolling cost baselines per tenant, per workflow type, and per model on hourly and daily windows. Apply anomaly detection (z-score, IQR, or ML-based) to detect deviations exceeding configurable thresholds (e.g., >2x baseline). Alert immediately on anomalies with context: affected tenant, workflow, model, token breakdown (input vs. output), and comparison to baseline. Integrate cost anomaly alerts with the orchestration circuit-breaker to enable automated mitigation — throttle or downgrade affected workflows until the anomaly is investigated.",
          },
        ],
      },

      /* ── Governance (critical) ───────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "cost-gov-1",
            text: "Establish a FinOps practice for AI with defined roles, cadences, and cost-accountability structures",
            exec:
              "AI cost management cannot be an ad-hoc engineering activity. Without a formal FinOps practice — with defined roles (FinOps practitioner, engineering leads, finance), regular review cadences, and clear cost-accountability chains — optimization efforts are sporadic and savings are not sustained. The FinOps Foundation's AI cost management framework provides a maturity model for building this capability.",
            eng:
              "Assign a FinOps practitioner or team responsible for AI cost visibility, optimization, and governance. Establish cadences: daily automated anomaly checks, weekly engineering cost reviews, monthly cross-functional business reviews. Define cost-accountability: each team owns the cost of their agents and workflows, with showback dashboards providing transparency. Track optimization initiatives with before/after metrics. Report AI unit economics alongside traditional cloud FinOps metrics.",
          },
          {
            id: "cost-gov-2",
            text: "Define and enforce cost governance policies — model-usage policies, budget hierarchies, and approval workflows for high-cost operations",
            exec:
              "Without governance policies, any engineer can deploy an agent that routes all traffic to the most expensive model, any workflow can consume unlimited tokens, and cost optimization depends entirely on individual discipline. Policy-based governance makes cost efficiency systemic rather than heroic.",
            eng:
              "Define model-usage policies that specify which model tiers are approved for which task categories — prevent frontier-model use for tasks where mid-tier models meet quality requirements. Implement budget hierarchies: organization → department → team → workflow, with each level inheriting and subdividing the parent budget. Require approval workflows for deploying new agents or workflows that exceed per-request cost thresholds. Enforce policies through gateway configuration and orchestration rules, not just documentation. Audit policy compliance monthly.",
          },
          {
            id: "cost-gov-3",
            text: "Implement chargeback or showback for AI costs to drive cost-conscious behavior across teams",
            exec:
              "When AI costs are pooled into a central budget with no team-level attribution, there is no incentive for product teams to optimize their agents' token consumption, choose efficient model tiers, or invest in caching. Showback (visibility) or chargeback (actual cost allocation) creates the economic signal that drives cost-conscious design decisions at the team level.",
            eng:
              "Implement showback as a first step: attribute all AI costs to teams, products, and tenants based on gateway metering data. Publish per-team cost reports with trend analysis and peer benchmarking (team A's cost per task vs. team B's for similar workflows). Graduate to chargeback when the attribution model is mature — allocate actual provider invoice costs proportionally based on metered usage. Provide teams with self-service cost dashboards and optimization recommendations based on their usage patterns.",
          },
        ],
      },

      /* ── Systems of Record (minimal) ───────────────── */
      {
        layerId: "systems",
        tier: "minimal",
        guidelines: [
          {
            id: "cost-sys-1",
            text: "Account for system-of-record API costs in the total cost of agent workflows that invoke external integrations",
            exec:
              "Agent workflows that call external systems (CRMs, ERPs, payment processors) incur API costs beyond LLM inference — per-call fees, data-transfer charges, and rate-limit-based pricing tiers. Excluding these from cost attribution understates the true cost of agent operations and misaligns optimization incentives.",
            eng: "",
          },
        ],
      },
    ],
  },

  /* ================================================================
     10. HUMAN-IN-THE-LOOP
     ================================================================ */
  {
    id: "human-in-the-loop",
    name: "Human-in-the-Loop",
    icon: "\u{1F464}",
    exec:
      "Fully autonomous AI is a spectrum, not a binary. The highest-performing agentic platforms deliberately engineer human touchpoints — approval gates, escalation paths, override mechanisms, and feedback loops — calibrated to risk, regulatory requirements, and the maturity of each agent capability. Human-in-the-loop design is not a concession to AI limitations; it is a strategic control that builds trust, ensures compliance with emerging AI regulation, and creates the feedback signal that drives progressive autonomy over time.",
    eng:
      "Implement human-in-the-loop as a first-class architectural concern, not a bolt-on. The orchestration layer routes decisions to human review based on confidence scores, risk classifications, and regulatory mandates. The runtime enforces approval gates before high-stakes tool execution. The surface layer provides UX patterns — decision-support cards, approval queues, and override controls — that give reviewers the context they need to act quickly and accurately. State management tracks pending approvals with timeouts and fallback policies. Every human decision feeds back into training data and policy refinement, creating a virtuous cycle where agents earn greater autonomy as they demonstrate reliability.",
    citations: [
      {
        id: "anthropic-effective-agents",
        label: "Building Effective Agents — Human-in-the-Loop Patterns",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
        org: "Anthropic",
      },
      {
        id: "ms-autogen-hitl",
        label: "Microsoft AutoGen — Human-in-the-Loop Tutorial",
        url: "https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.html",
        org: "Microsoft",
      },
      {
        id: "eu-ai-act-article14",
        label: "EU AI Act — Human Oversight Requirements (Article 14)",
        url: "https://artificialintelligenceact.eu/article/14/",
        org: "European Union",
      },
      {
        id: "nist-ai-rmf-govern",
        label: "NIST AI RMF — GOVERN Function: Human-AI Interaction",
        url: "https://airc.nist.gov/AI_RMF_Interactivity/GOVERN",
        org: "NIST",
      },
      {
        id: "google-pair-guidebook",
        label: "Google PAIR — People + AI Guidebook: Human-AI Interaction Patterns",
        url: "https://pair.withgoogle.com/guidebook/",
        org: "Google",
      },
    ],
    cells: [
      /* ── Surface (critical) ──────────────────────────── */
      {
        layerId: "surface",
        tier: "critical",
        guidelines: [
          {
            id: "hitl-surf-1",
            text: "Design approval UX that provides full decision context — agent reasoning, confidence score, affected resources, and reversibility — so reviewers can act in seconds, not minutes",
            exec:
              "Human reviewers become bottlenecks when approval interfaces lack context. If a reviewer must leave the approval screen to investigate what the agent wants to do and why, approval latency dominates end-to-end workflow time. Decision-support UX that front-loads context transforms human review from a friction point into a fast, high-quality gate.",
            eng:
              "Render approval cards that display: the agent's proposed action in plain language, the chain-of-thought reasoning that led to the decision, a confidence score with calibration context (e.g., 'this agent is correct 94% of the time at this confidence level'), the specific resources affected, whether the action is reversible, and a diff-style preview of the change. Include one-click approve/reject with mandatory rejection-reason capture. Support keyboard shortcuts for high-volume reviewers.",
          },
          {
            id: "hitl-surf-2",
            text: "Implement batch approval queues for lower-risk items with sorting, filtering, and bulk-action capabilities",
            exec:
              "Not every human review requires individual deliberation. When agents generate many similar low-to-medium risk actions (e.g., content moderation decisions, standard refund approvals), forcing one-by-one review wastes reviewer time. Batch approval patterns let humans review at throughput scale while maintaining oversight.",
            eng:
              "Build a review queue UI that groups similar pending actions by type, risk tier, and agent. Support sort-by-confidence (review lowest confidence first), filter-by-category, and select-all for bulk approve/reject. Show aggregate statistics: approval rate trends, average review time, and agent accuracy for the batch category. Implement pagination with prefetching so reviewers never wait for the next page.",
          },
          {
            id: "hitl-surf-3",
            text: "Provide emergency override controls that let authorized users halt, take over, or roll back agent actions in real time",
            exec:
              "When an agent goes off-rails — executing a wrong plan, producing harmful outputs, or behaving unpredictably — the time between detection and intervention determines the blast radius. Emergency controls must be immediately accessible, not buried in admin panels.",
            eng:
              "Surface a persistent emergency-stop control in the agent monitoring UI that immediately pauses the active workflow, prevents further tool calls, and preserves the full execution state for forensic review. Implement a takeover mode that transfers the in-progress workflow to a human operator with full context. Provide rollback capabilities for reversible actions. Gate emergency controls behind appropriate authorization (RBAC role) but ensure zero-friction access for authorized users — no confirmation dialogs during emergencies.",
          },
          {
            id: "hitl-surf-4",
            text: "Surface agent confidence and uncertainty to users transparently — never present low-confidence outputs as definitive answers",
            exec:
              "Users calibrate their trust in AI systems based on how the system presents its outputs. When an agent presents a 60% confidence answer with the same visual treatment as a 99% confidence answer, users either over-trust (acting on wrong answers) or under-trust (ignoring correct answers). Transparent uncertainty communication enables appropriate reliance.",
            eng:
              "Display calibrated confidence indicators alongside agent outputs using a consistent visual language (e.g., high/medium/low badges with color coding). For low-confidence responses, explicitly state the uncertainty and suggest human verification. In structured outputs (tables, recommendations), highlight cells or items where the agent's confidence is below a configurable threshold. Never auto-execute actions when confidence is below the tier's approval threshold.",
          },
        ],
      },

      /* ── Identity (moderate) ─────────────────────────── */
      {
        layerId: "identity",
        tier: "moderate",
        guidelines: [
          {
            id: "hitl-id-1",
            text: "Define RBAC roles for human reviewers — approval authority, escalation targets, and override permissions — and enforce them in the approval routing engine",
            exec:
              "Not all humans are qualified to approve all agent actions. A junior support agent should not approve a $50,000 refund override, and a marketing reviewer should not approve database schema changes. Role-based approval authority ensures the right human reviews the right action.",
            eng:
              "Model reviewer roles with explicit approval scopes: action types they can approve, monetary thresholds, risk tiers, and domain boundaries. Implement an approval-routing engine that matches pending actions to qualified reviewers based on these scopes. Support delegation chains for when primary reviewers are unavailable. Audit all approval authority changes.",
          },
          {
            id: "hitl-id-2",
            text: "Maintain distinct identity contexts for human-initiated vs. agent-initiated actions so audit trails attribute decisions to the correct actor",
            exec:
              "When a human approves an agent's proposed action, the resulting system change has two actors: the agent that proposed it and the human that authorized it. Collapsing these into a single identity — either attributing it solely to the agent or solely to the human — creates audit gaps and liability ambiguity.",
            eng:
              "Stamp every action with a composite identity: the originating agent, the authorizing human (if applicable), and the authorization mechanism (auto-approved by policy, human-approved, escalated). Propagate this composite identity through all downstream system calls so that audit logs in systems of record reflect the full decision chain.",
          },
        ],
      },

      /* ── Orchestration (critical) ────────────────────── */
      {
        layerId: "orchestration",
        tier: "critical",
        guidelines: [
          {
            id: "hitl-orch-1",
            text: "Implement confidence-based escalation routing — agent actions below a tunable confidence threshold are automatically routed to human review",
            exec:
              "The core human-in-the-loop decision is which actions need human review and which can proceed autonomously. Static rules (e.g., 'always review refunds over $100') are a starting point, but confidence-based routing adapts to the actual reliability of each agent on each task type, reducing unnecessary reviews while catching genuinely uncertain decisions.",
            eng:
              "Instrument the orchestrator to capture the agent's confidence score (or derive one from logprobs, self-consistency checks, or a calibrated classifier) for every proposed action. Define per-action-type confidence thresholds that route to: auto-execute (high confidence), human review (medium confidence), or human takeover (low confidence). Store threshold configurations externally so they can be tuned without redeployment. Log all routing decisions with the confidence score for threshold optimization.",
          },
          {
            id: "hitl-orch-2",
            text: "Implement risk-based routing that escalates to human review based on action severity — financial impact, irreversibility, data sensitivity, and regulatory classification",
            exec:
              "Confidence alone is insufficient for routing decisions. A highly confident agent can still propose a catastrophic action (e.g., deleting a production database). Risk-based routing ensures that high-stakes actions always receive human oversight regardless of agent confidence, satisfying both operational prudence and regulatory mandates like the EU AI Act's human oversight requirements.",
            eng:
              "Classify every tool and action in the platform by risk dimensions: financial impact (thresholds per tier), reversibility (reversible/partially reversible/irreversible), data sensitivity (PII, financial, health), and regulatory classification (EU AI Act high-risk, SOX-relevant, HIPAA-covered). The orchestrator evaluates proposed actions against these classifications and routes to appropriate review queues. High-risk actions require human approval regardless of confidence. Combine risk and confidence scoring into a single routing matrix that the governance team maintains.",
          },
          {
            id: "hitl-orch-3",
            text: "Design approval workflows with timeout and fallback policies — define what happens when a human reviewer does not respond within the SLA",
            exec:
              "A human-in-the-loop system that blocks indefinitely on human approval is worse than a fully autonomous system — it has all the risks of autonomy with none of the speed benefits, plus it degrades user experience. Every approval gate must have a defined timeout with an explicit fallback: escalate, auto-approve, auto-reject, or park.",
            eng:
              "Configure per-action-type timeout SLAs (e.g., 30 seconds for chat-embedded approvals, 4 hours for batch reviews, 24 hours for compliance reviews). Implement escalation chains: on timeout, route to a secondary reviewer, then to a manager, then to a fallback policy. Fallback policies include: auto-reject with user notification (safe default for most cases), auto-approve for low-risk items that passed confidence thresholds, or park the workflow and notify the user of the delay. Track timeout rates as a key metric — high timeout rates indicate understaffed review queues.",
          },
          {
            id: "hitl-orch-4",
            text: "Support progressive autonomy — automatically widen the auto-approve envelope as agents demonstrate sustained accuracy on specific task types",
            exec:
              "Static approval thresholds force a permanent trade-off between safety and speed. Progressive autonomy resolves this by treating approval thresholds as dynamic parameters that relax as agents accumulate a track record of accurate decisions on specific task types. This mirrors how organizations build trust with human employees — starting with close supervision and granting more independence as competence is demonstrated.",
            eng:
              "Track per-agent, per-task-type accuracy metrics: what percentage of the agent's proposals did human reviewers approve without modification? When an agent sustains >N% approval rate over M decisions on a task type, automatically lower the confidence threshold for human review on that task type (subject to risk-tier floors — high-risk actions always require review). Implement a ratchet-down mechanism: if accuracy drops, automatically tighten thresholds. Expose the progressive-autonomy status in dashboards so stakeholders can see which agents have earned which autonomy levels.",
          },
        ],
      },

      /* ── Runtime (critical) ──────────────────────────── */
      {
        layerId: "runtime",
        tier: "critical",
        guidelines: [
          {
            id: "hitl-run-1",
            text: "Enforce pre-execution approval gates for tool calls classified as high-risk — the runtime must block execution until human authorization is received",
            exec:
              "The runtime is the last enforcement point before an agent's decision becomes a real-world action. If the orchestrator routes an action for human approval but the runtime does not enforce the gate, a race condition or misconfiguration can allow unapproved execution. The runtime must be the authoritative enforcement layer for approval gates.",
            eng:
              "Implement a pre-execution hook in the tool-call pipeline that checks whether the proposed call requires human approval (based on the routing decision from the orchestrator). If approval is required, the runtime suspends the execution context (preserving full state), emits an approval-request event, and waits for an authorization token. Only resume execution when a valid, unexpired authorization token is received from an authorized reviewer. Implement a hard timeout that auto-rejects if no authorization arrives.",
          },
          {
            id: "hitl-run-2",
            text: "Implement graceful workflow suspension and resumption so that human review latency does not corrupt agent state or lose progress",
            exec:
              "When an agent workflow pauses for human review, the execution context must be preserved faithfully — conversation history, intermediate results, tool-call queue, and any acquired resources. If the runtime discards state on suspension, the agent either fails to resume or restarts from scratch, wasting all prior computation and creating a poor user experience.",
            eng:
              "Serialize the full execution context (agent state, conversation history, pending tool calls, acquired locks, and partial results) to durable storage when a workflow suspends for human review. Implement a resumption protocol that rehydrates the context and continues from the exact suspension point. Handle resource expiration: if tokens, sessions, or locks expired during the human review period, re-acquire them transparently before resuming. Set maximum suspension duration per workflow type — workflows that exceed it are terminated gracefully with user notification.",
          },
          {
            id: "hitl-run-3",
            text: "Provide a human takeover protocol that transfers an in-flight agent workflow to a human operator with full execution context",
            exec:
              "Sometimes the right intervention is not approving or rejecting a single action but taking over the entire workflow — the agent is confused, the user is frustrated, or the situation has become too complex for the agent to handle. A clean takeover protocol preserves the work already done and gives the human operator everything they need to continue.",
            eng:
              "Implement a takeover API that: (1) immediately pauses the agent's execution, (2) packages the full context — original user request, conversation history, actions taken so far, current step, and remaining plan — into a human-readable handoff summary, (3) routes the handoff to an appropriate human operator based on skill routing, and (4) notifies the end user that a human is taking over. The human operator's actions are logged in the same trace so the audit trail is continuous. After resolution, optionally feed the human's approach back as a training signal.",
          },
        ],
      },

      /* ── Gateway (minimal) ───────────────────────────── */
      {
        layerId: "gateway",
        tier: "minimal",
        guidelines: [
          {
            id: "hitl-gw-1",
            text: "Route approval-request and approval-response events through the gateway with the same authentication, rate-limiting, and audit controls as primary agent traffic",
            exec:
              "Approval events are security-sensitive control-plane traffic — an attacker who can forge an approval-response can bypass all human oversight. These events must pass through the same gateway controls as agent requests, not through a separate unprotected channel.",
            eng: "",
          },
        ],
      },

      /* ── Tools (critical) ────────────────────────────── */
      {
        layerId: "tools",
        tier: "critical",
        guidelines: [
          {
            id: "hitl-tool-1",
            text: "Classify every tool and action by risk tier — annotate tool registrations with approval requirements so the orchestrator can route deterministically",
            exec:
              "Risk-based routing is only as good as the risk classifications on individual tools. If tools are not annotated with their risk profile, the orchestrator must infer risk at runtime, which is fragile and inconsistent. Tool-level risk metadata makes approval routing deterministic and auditable.",
            eng:
              "Extend the tool registration schema with risk metadata: risk tier (critical/high/moderate/low), reversibility flag, maximum financial impact, data classification of inputs and outputs, and whether the tool has side effects. The orchestrator reads this metadata to make routing decisions. Require risk annotation as part of the tool onboarding process — reject tool registrations without it. Review and update risk classifications quarterly.",
          },
          {
            id: "hitl-tool-2",
            text: "Implement dry-run / preview mode for high-risk tools so humans can review the exact effect before authorizing execution",
            exec:
              "Asking a reviewer to approve an action described in natural language is less reliable than showing them the exact operation that will execute. Dry-run mode bridges this gap by generating a precise preview — the API call, the SQL statement, the file diff — without executing it.",
            eng:
              "Implement a dry-run flag on tool interfaces that returns the full execution plan (API request body, query, file changes) without committing side effects. The approval UX renders the dry-run output as a diff or structured preview. On approval, execute the identical operation — do not re-plan, which could produce a different result. For tools that cannot support dry-run (e.g., third-party APIs without preview modes), generate the closest possible preview from the request payload.",
          },
          {
            id: "hitl-tool-3",
            text: "Implement tool-level guardrails that enforce hard limits independent of human approval — maximum monetary amounts, rate ceilings, and scope boundaries that no approval can override",
            exec:
              "Human approval is not infallible — reviewers can make mistakes, especially under time pressure or in high-volume batch approval flows. Tool-level guardrails provide a safety floor that catches both agent errors and human approval errors, enforcing invariants that should never be violated regardless of who authorized the action.",
            eng:
              "Configure per-tool hard limits: maximum monetary value per transaction, maximum records affected per operation, rate ceiling (max calls per time window), and scope boundary (e.g., a tool can only operate on staging, not production). These limits are enforced in the tool execution layer, below the approval layer — even an approved action that exceeds a hard limit is rejected. Log all hard-limit rejections as high-severity events for investigation.",
          },
        ],
      },

      /* ── Memory (minimal) ────────────────────────────── */
      {
        layerId: "memory",
        tier: "minimal",
        guidelines: [
          {
            id: "hitl-mem-1",
            text: "Persist human feedback — approvals, rejections, corrections, and override reasons — as structured memory that agents can retrieve to improve future decisions",
            exec:
              "Every human intervention is a training signal. If human corrections are not captured in agent-accessible memory, the same mistakes recur and humans review the same failure patterns repeatedly, creating a frustrating and unsustainable oversight load.",
            eng: "",
          },
        ],
      },

      /* ── State (moderate) ────────────────────────────── */
      {
        layerId: "state",
        tier: "moderate",
        guidelines: [
          {
            id: "hitl-state-1",
            text: "Track pending-approval as a first-class workflow state with its own lifecycle — creation, assignment, escalation, timeout, and resolution",
            exec:
              "Approval gates introduce a new state in every workflow: pending-human-review. If this state is not modeled explicitly, the system cannot report on approval queue depth, reviewer load, SLA compliance, or bottleneck analysis. Treating approval as a first-class state enables operational visibility.",
            eng:
              "Model approval states in the workflow state machine: pending-approval (awaiting assignment), assigned (reviewer claimed), escalated (timeout triggered re-routing), approved, rejected, timed-out. Persist state transitions with timestamps and actor identity. Expose queue-depth and age-of-oldest-pending metrics for operational dashboards. Implement dead-letter handling for approvals that fall through all escalation levels.",
          },
          {
            id: "hitl-state-2",
            text: "Ensure approval state is durable and survives system restarts — a pending approval must never be silently dropped",
            exec:
              "If the system restarts while a workflow is awaiting human approval, the approval request must survive and be re-presented to reviewers. Silently dropping pending approvals means the agent either blocks forever or the action is never reviewed, both of which erode trust in the oversight system.",
            eng:
              "Persist all pending-approval records to durable storage (database, not in-memory queue) with the full execution context needed for resumption. On system startup, rehydrate pending approvals and re-emit notification events. Implement a consistency check that reconciles in-flight workflows with the approval store to detect orphaned approvals.",
          },
        ],
      },

      /* ── Observability (moderate) ────────────────────── */
      {
        layerId: "observability",
        tier: "moderate",
        guidelines: [
          {
            id: "hitl-obs-1",
            text: "Track human-in-the-loop metrics — approval latency, rejection rate, override frequency, timeout rate, and reviewer utilization — as first-class observability signals",
            exec:
              "Human review is a system resource with capacity constraints. Without metrics on approval latency, queue depth, and reviewer utilization, the organization cannot staff review teams appropriately, identify bottleneck task types, or measure the overhead that human oversight adds to workflow completion time.",
            eng:
              "Emit structured telemetry for every approval event: time-to-review (from request to decision), decision outcome (approved/rejected/escalated/timed-out), reviewer identity, and task type. Aggregate into dashboards showing: p50/p95 approval latency by task type, rejection rate trends, timeout rate by queue, and reviewer utilization (approvals per reviewer per hour). Alert on SLA breaches and queue depth exceeding capacity thresholds.",
          },
          {
            id: "hitl-obs-2",
            text: "Measure and report the human-agent agreement rate to track whether approval thresholds are correctly calibrated",
            exec:
              "If human reviewers approve 99% of actions routed to them, the confidence threshold is probably too conservative — the system is wasting reviewer time on actions the agent handles correctly. If the rejection rate is high, the agent may need retraining or the task type may be unsuitable for automation. The agreement rate is the key feedback signal for tuning the human-in-the-loop system.",
            eng:
              "Compute per-agent, per-task-type agreement rates: approved-without-modification / total-reviewed. Track this over time with trend analysis. When agreement exceeds a configurable target (e.g., 95% over 500+ reviews), flag the task type as a candidate for threshold relaxation (progressive autonomy). When agreement drops below a floor (e.g., 80%), alert the governance team and tighten thresholds. Include disagreement analysis: categorize rejection reasons to identify systematic failure patterns.",
          },
        ],
      },

      /* ── Governance (critical) ───────────────────────── */
      {
        layerId: "governance",
        tier: "critical",
        guidelines: [
          {
            id: "hitl-gov-1",
            text: "Establish a human oversight policy that maps every agent capability to an oversight level — fully autonomous, human-on-the-loop, or human-in-the-loop — based on risk classification",
            exec:
              "The EU AI Act (Article 14) requires that high-risk AI systems be designed to allow effective human oversight. Beyond regulatory compliance, a formal oversight policy prevents ad-hoc decisions about which actions need review, eliminates gaps in coverage, and provides a defensible framework for progressive autonomy. Without a policy, oversight is inconsistent — some high-risk actions go unreviewed while low-risk actions are over-supervised.",
            eng:
              "Document a human oversight matrix that classifies every agent capability by oversight level. Fully autonomous: the agent executes without human review (low-risk, high-confidence tasks). Human-on-the-loop: the agent executes but a human monitors output asynchronously with the ability to intervene. Human-in-the-loop: the agent proposes but a human must approve before execution. Map these levels to the tool risk classifications and confidence thresholds in the orchestration layer. Review the matrix quarterly and whenever new capabilities are deployed.",
          },
          {
            id: "hitl-gov-2",
            text: "Implement mandatory human review for actions classified as high-risk under the EU AI Act or equivalent regulatory frameworks — no confidence score overrides this requirement",
            exec:
              "Regulatory frameworks including the EU AI Act, NIST AI RMF, and sector-specific regulations (financial services, healthcare) mandate human oversight for specific categories of AI-assisted decisions. These are non-negotiable — no level of agent accuracy justifies removing human review for regulatory-mandated categories. Violations carry significant penalties and reputational risk.",
            eng:
              "Maintain a regulatory-mandated-review registry: a list of action types, data categories, and decision domains where human review is legally required, tagged by the applicable regulation. The orchestrator checks every proposed action against this registry before applying confidence-based routing — registry matches always route to human review regardless of confidence score. Implement the registry as externally configurable (not hardcoded) so legal and compliance teams can update it without engineering deployments. Audit registry compliance monthly.",
          },
          {
            id: "hitl-gov-3",
            text: "Require human reviewers to provide structured feedback on rejections — categorized rejection reasons that feed back into agent improvement and threshold tuning",
            exec:
              "An approval/reject binary provides minimal signal. Knowing why a reviewer rejected an action — wrong tool, incorrect parameters, policy violation, hallucinated information, inappropriate tone — is essential for targeted agent improvement and for identifying systemic failure patterns that threshold tuning alone cannot fix.",
            eng:
              "Present reviewers with a structured rejection form: predefined rejection categories (factual error, policy violation, wrong action, hallucination, scope exceeded, tone/safety), optional free-text elaboration, and a severity rating. Aggregate rejection reasons by category, agent, and task type to identify improvement priorities. Feed structured rejections into the agent fine-tuning pipeline and the prompt engineering feedback loop. Report rejection category trends to governance stakeholders.",
          },
          {
            id: "hitl-gov-4",
            text: "Audit human-in-the-loop effectiveness — regularly evaluate whether human oversight is actually catching errors and improving outcomes, not just adding latency",
            exec:
              "Human oversight has a cost: reviewer staffing, approval latency, and workflow complexity. If reviews are rubber-stamps (99.5% auto-approve) or if reviewers are not catching real errors, the oversight adds cost without value. Regular audits ensure the human-in-the-loop system is actually functioning as a quality gate.",
            eng:
              "Conduct quarterly audits: sample approved actions and independently verify correctness (would a more careful review have caught errors that slipped through?). Measure error-catch rate: what percentage of agent errors were caught by human review vs. discovered downstream? Track false-negative rate: errors that human reviewers should have caught but did not. Use audit results to calibrate reviewer training, threshold settings, and staffing levels. Report audit results to governance leadership with recommendations.",
          },
        ],
      },

      /* ── Systems of Record (moderate) ────────────────── */
      {
        layerId: "systems",
        tier: "moderate",
        guidelines: [
          {
            id: "hitl-sys-1",
            text: "Require human approval before agent-initiated write operations to external systems of record — reads may auto-execute, but creates, updates, and deletes must be gated",
            exec:
              "Writes to systems of record (CRMs, ERPs, financial systems) have downstream consequences that are difficult or impossible to reverse. An incorrect CRM update propagates through reporting, an erroneous financial transaction triggers reconciliation cascades. Default-to-review for writes provides a safety net proportional to the impact.",
            eng:
              "Classify all system-of-record integrations by operation type: read operations may proceed autonomously based on standard confidence routing, but write operations (create, update, delete) require human approval unless explicitly exempted by the governance policy for specific low-risk write patterns. Present the reviewer with a diff view: current state vs. proposed state in the target system. After approval, execute the write with idempotency protections.",
          },
          {
            id: "hitl-sys-2",
            text: "Log human approval decisions as part of the system-of-record audit trail — compliance teams must be able to trace any data change back through the approval chain",
            exec:
              "In regulated industries, every change to a system of record must be traceable to an authorized decision-maker. When an agent proposes a change and a human approves it, both actors must appear in the audit trail. Without this linkage, compliance teams cannot satisfy audit requests and the organization cannot demonstrate adequate human oversight.",
            eng:
              "When a human-approved agent action writes to a system of record, include the approval metadata in the audit entry: approval ID, reviewer identity, timestamp, the original agent proposal, and any modifications the reviewer made. If the system of record supports custom audit fields, write the approval ID directly. Otherwise, maintain a parallel approval-audit log that can be joined to the system-of-record change log by correlation ID.",
          },
        ],
      },
    ],
  },

];
