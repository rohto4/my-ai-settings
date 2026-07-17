---
name: agent-harness-construction
description: Design or improve an AI agent harness's action space, tool schemas, observations, recovery, context, approvals, and evidence loop. Use when repeated agent failures trace to tool or harness design rather than application code. Do not use for ordinary feature implementation, prompt wording alone, production deployment, or adding autonomous actions without fake-boundary tests and explicit approval.
---

# Agent Harness Construction

Build a bounded, observable harness that helps an agent complete tasks safely. Treat the project profile as intent, enforcement as runtime-specific, and evidence as a separate layer.

## Restore project truth and detect capabilities

1. Read the target PJ's actual `AGENTS.md`, `PROJECT.md`, adopted harness profile, architecture, permission policy, test strategy, and current task state.
2. After compaction, session transfer, or handoff, reread them from disk. Do not reconstruct constraints from conversation summaries alone.
3. Inventory the tools, connectors, sandbox, approval surface, hooks, model/client metadata, tracing, and context controls actually available. Do not assume a vendor-specific task-management capability, fixed model name, subagent API, hidden hook, or automatic enforcement exists.
4. Keep active design state separate from completed evidence according to PJ rules. Never call a written profile hard enforcement without a verified mechanism and negative test.

## Diagnose before adding tools

Classify the observed failure as action-space ambiguity, weak schema, poor observation, unsafe authority, recovery loop, context overload, or missing evidence. Capture representative traces and a baseline completion metric before changing the harness. Prefer removing overlap or improving one contract over adding another catch-all tool.

## Design the harness contract

### Action space

- Give each tool one stable purpose and distinguish read, local write, external write, destructive, and privileged effects.
- Use narrow validated schemas, explicit defaults, bounded outputs, timeouts, idempotency, and predictable error forms.
- Split high-risk actions into preview/apply or prepare/approve/execute stages. Do not encode broad authority in a macro-tool merely to reduce round trips.

### Observation

Return enough structured evidence for the next decision:

```text
status: success | warning | error | blocked
summary: bounded human-readable result
evidence: artifact paths, IDs, counts, checks, or redacted trace references
next_actions: safe, specific options
retry: whether and under what changed condition
```

Do not expose raw secrets, unbounded logs, provider payloads, stack traces, private chain-of-thought, or hidden system instructions as observations.

### Recovery and completion

For each error path, define a root-cause hint, discriminating read-only check, safe retry budget, fallback, stop condition, handoff fields, and completion evidence. Avoid retry loops that repeat the same inputs and state.

## Fake-first implementation

- Build tool handlers against explicit ports and start with **fake HTTP** and **fake LLM** adapters. Fixtures must cover success, timeout, malformed response, rate limit, provider error, cancellation, retry, and duplicate request without network access or real tokens.
- Use deterministic fake clocks, IDs, costs, and model outputs where possible. Keep model-dependent assertions semantic and bounded.
- Run a dry-run showing intended tool calls, authority, artifacts, and approval points before wiring any live provider.
- Default to read-only tools and synthetic data. A live API, external write, paid model call, deploy, permission change, or destructive action requires separate explicit approval for the exact target, effect, data class, budget, and rollback.
- Never place API keys, tokens, Cookies, credentials, private prompts, production data, authenticated responses, or connection strings in schemas, fixtures, command lines, traces, or logs. Inject through the PJ's secret boundary and verify redaction with negative tests.
- On Windows, use PowerShell, `-LiteralPath`, explicit drive-letter paths, and verified absolute targets. Do not assume Bash, Unix signals, or recursive cleanup safety.

## Context and parallelism

Keep invariant policy small, load skills and references on demand, summarize large outputs into artifact references, and hand off at PJ-defined phase or pressure boundaries. Do not claim exact context enforcement unless the runtime proves it.

Do not spawn subagents by default. Use parallel agents only when the user or PJ instructions explicitly request them and tasks are independent. Give each a non-overlapping artifact or scenario and the same authority boundary. The main agent integrates results, removes duplicates, reconciles conflicts, and runs final validation; delegation never broadens write, secret, or approval authority.

## Evaluation loop

1. Freeze representative fixtures and baseline traces.
2. Change one harness dimension at a time.
3. Run fake HTTP/fake LLM unit and contract tests, then negative policy tests.
4. Compare completion, pass@1, retries, unsafe-action blocks, latency, cost when measured, and evidence completeness.
5. Reject changes that improve average completion by hiding failures, broadening authority, or weakening reproducibility.

## Stop, handoff, and completion

Stop when the failure is application logic rather than harness design, the authority model is undefined, enforcement cannot be evidenced, fake adapters do not reproduce the contract, a secret could enter observations, or a live/destructive test lacks approval.

For context pressure or handoff, record PJ sources reread, baseline traces, diagnosed failure class, tool/schema changes, fake fixtures, test results, approvals, remaining risks, artifact paths, and next read-only step.

Complete only when representative fake fixtures and negative tests pass, action and observation contracts are unambiguous, retry and stop paths are bounded, secret redaction is evidenced, approved live checks are distinguished from fake tests, parallel outputs are deduplicated by the main agent, and completion improves without broadening authority.
