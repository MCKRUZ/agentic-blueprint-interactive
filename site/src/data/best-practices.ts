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
];
