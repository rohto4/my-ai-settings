---
name: agent-architecture-audit
description: Perform a read-only, evidence-first architecture audit of an agent or LLM application across prompts, session context, memory, orchestration, tools, response shaping, transport, hidden repair loops, and persistence. Use for requests such as “audit this agent architecture,” “why does the direct model work but the wrapper fail,” “find memory contamination or hidden retries,” or “review tool-routing discipline.” Do not use to build or change a harness, benchmark agents, run a security vulnerability review, debug one active failing run, or implement fixes.
---

# Agent Architecture Audit

Diagnose where an agent system corrupts, hides, or weakens model behavior. Report findings and improvement proposals; do not change the architecture.

## Route adjacent work

| Need | Route |
| --- | --- |
| Diagnose cross-layer wrapper, memory, tool, transport, repair, or persistence failures | This skill |
| Design or implement action spaces, tool schemas, observations, recovery, or a new harness | `agent-harness-construction` |
| Compare agents or configurations with reproducible tasks and metrics | `agent-eval` |
| Review vulnerabilities, trust boundaries, identity, secrets, abuse, or exploit paths | An installed security review or threat-model skill |
| Capture and recover one currently looping, timing-out, or drifting agent run | `agent-introspection-debugging` |

Recommend a routed follow-up when needed, but do not execute it inside this audit.

## Restore project truth and scope

1. Read the target project's `AGENTS.md`, `PROJECT.md`, `README.md`, and the minimum architecture or context-reading guide they require.
2. Read the current task, completion boundary, and relevant handoff only when they affect the audit.
3. After compaction, session movement, or handoff, reread those files from disk before continuing. Treat conversation summaries and model memory as aids, not current project truth.
4. Resolve the exact repository or subpath, entrypoints, reported symptom, affected users, time window, known-good comparison, and applicable layers.
5. Record exclusions, unavailable evidence, and whether historical traces are required before drawing conclusions.

On Windows, prefer `rg` for bounded search and PowerShell reads such as `Get-Content -Raw -Encoding UTF8 -LiteralPath <path>`. Preserve drive-letter and worktree boundaries. Keep path discovery and interpretation in the same shell; do not substitute shell-specific home paths for the project's actual source of truth.

## Keep the audit read-only

- Do not edit source, prompts, configuration, memory, caches, data, or deployment state.
- Do not install dependencies, run project code, start services, invoke live models, probe production, use credentials, or fetch remote data unless the user separately authorizes a narrower diagnostic action.
- Do not create tickets, send reports, publish artifacts, or write to an external system.
- Save a local audit artifact only when the user explicitly asks for it and approves the destination when project policy requires approval.
- Treat implementation, configuration changes, cache clearing, data repair, deploy, and external write as separate tasks with their own authorization and verification.

Never print or copy secret values, tokens, cookies, credentials, private keys, environment-file contents, private prompts, or private data bodies. Request a sanitized trace or report only the secret class and evidence location.

## Audit the twelve layers

| # | Layer | Typical failure |
| --- | --- | --- |
| 1 | System instructions | Conflict, bloat, stale policy, hidden precedence |
| 2 | Session history | Old turns or summaries injected into the wrong task |
| 3 | Long-term memory | Cross-session pollution or corrections losing priority |
| 4 | Distillation | Compressed artifacts reintroduced as facts |
| 5 | Active recall | Duplicate retrieval and repeated summaries consume context |
| 6 | Tool selection | Overlap, wrong routing, or optional tools treated as mandatory |
| 7 | Tool execution | Claimed execution without a trace or unchecked failure |
| 8 | Tool interpretation | Valid tool output ignored, truncated, or misread |
| 9 | Answer shaping | Post-processing changes meaning or format |
| 10 | Transport and rendering | API, stream, CLI, or UI mutates valid output |
| 11 | Retry, repair, and fallback | Hidden second passes silently replace the answer |
| 12 | Persistence and cache | Expired or mismatched state reused as live evidence |

Audit only layers present in the scoped system. Mark a layer `not applicable` or `not observed`; do not invent components to complete the table.

## Collect evidence from the real path

Trace at least one representative flow when evidence permits:

`user input → assembled instructions → session/memory retrieval → model request → tool routing/execution → raw model output → post-processing → transport/rendering → persistence`

Use the smallest relevant evidence set:

- entrypoint and orchestration source;
- prompt assembly and context-budget code;
- tool definitions, routing, execution receipts, and error paths;
- memory admission, correction priority, retrieval, expiry, and distillation;
- sanitized request/response IDs and historical traces;
- response transformers, retry/fallback logic, transport, and renderer;
- persistence keys, version markers, and invalidation rules.

Start with bounded searches, for example:

```powershell
rg -n -- "tool_call|toolCall|tool_use|retry|fallback|repair|distill|memory|persist|transform" <scope>
Get-Content -Raw -Encoding UTF8 -LiteralPath <evidence-file>
```

Search terms discover candidates; they are not findings. Read the surrounding implementation and follow data flow before assigning a mechanism.

## Build evidence-first findings

For every finding, include:

- severity: `critical`, `high`, `medium`, or `low`;
- observed symptom and affected path;
- source layer and failure mechanism;
- deepest supported root cause;
- evidence references such as `file:line`, sanitized trace ID, log row, or config key;
- relevant counterevidence and coverage gaps;
- confidence and what would raise or lower it;
- smallest improvement direction and a separate validation method.

Separate `observed`, `inferred`, and `unknown`. Do not blame the base model before checking wrapper differences. Do not blame memory without showing the contamination path. Do not accept a prompt-only “must use tool” rule as enforcement when the execution trace can bypass it. A clean current snapshot does not disprove a historical incident.

Use severity according to demonstrated impact and reach, not wording intensity:

- **critical:** supported path to confidently wrong or unsafe operational behavior;
- **high:** frequent correctness or stability degradation with material user impact;
- **medium:** correctness usually survives but behavior is fragile, opaque, or wasteful;
- **low:** localized maintainability, observability, or presentation weakness.

## Propose improvements without changing composition

Order proposals by causal leverage and reversibility. Prefer:

1. expose missing traces and request/output identity;
2. enforce tool requirements in code or policy rather than prompt prose;
3. make retry, repair, and fallback passes explicit and bounded;
4. remove duplicate context or retrieval paths;
5. prioritize user correction and tighten memory admission/expiry;
6. preserve typed envelopes through tool and transport boundaries;
7. reduce unverified response mutation and rendering transforms.

State expected effect, prerequisites, risk, and proof for each proposal. Do not add, remove, or reorder agents, tools, models, memory layers, prompts, or platform components. Architecture changes and implementation require a separately authorized task.

## Stop and hand off

Stop and request direction when:

- the canonical architecture, target path, symptom, or time window cannot be established;
- required logs or traces are secret-bearing, private, unavailable, or unredacted;
- evidence would require live model calls, production probing, credential use, source mutation, or an external write;
- two layers remain equally plausible and no read-only observation can discriminate them;
- context pressure prevents a reliable cross-layer trace.

For handoff, record scope and exclusions, layers covered, evidence read, findings and confidence, unresolved hypotheses, approval-gated diagnostics, and the exact next safe step. Follow the project's task/ completion separation: ongoing investigation belongs in the task record, while finished findings and verification belong in the completion evidence when those project artifacts are authorized.

## Evidence-backed completion

Lead with severity-ranked findings, then provide the cross-layer diagnosis, ordered improvement plan, coverage map, limitations, and residual risk. Report `no confirmed finding` rather than `healthy` when evidence is insufficient.

Complete only when every finding has a reproducible evidence reference, observations are separated from inference, adjacent-skill boundaries are explicit, no implementation or external effect was performed, secrets remain redacted, and unresolved risks have a concrete next verification step.

## Provenance and license

Privately adapted for Codex and Windows from `affaan-m/everything-claude-code`, upstream commit `ed387446052dfbc6b52de149406b70efa65edc59`, `skills/agent-architecture-audit/SKILL.md`. See [LICENSE.txt](LICENSE.txt).

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
