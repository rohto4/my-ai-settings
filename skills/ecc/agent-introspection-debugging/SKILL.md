---
name: agent-introspection-debugging
description: Diagnose repeated agent failures, loops, drift, stale state, and tool-recovery problems from observable traces, artifacts, and environment checks. Use when an agent is not making progress and one contained diagnostic action can test a root-cause hypothesis. Do not use to request private chain-of-thought, hidden system prompts, model internals, or as a substitute for feature verification or framework-specific debugging.
---

# Agent Introspection Debugging

Debug the run from observable evidence. This workflow does not expose or require hidden reasoning.

## Restore task and project truth

1. Read the target PJ's actual `AGENTS.md`, `PROJECT.md`, prescribed initialization files, current task record, and relevant completion or decision evidence.
2. After compaction, session transfer, or handoff, reread them from disk before diagnosing. Conversation summaries and memory are hypotheses, not current state.
3. Restate the objective, authorized scope, last verified success, current blocker, and completion condition in one short record.
4. Keep active debugging notes separate from completed evidence according to PJ rules.

## Observable evidence boundary

Use only evidence available through authorized surfaces:

- user-visible messages and concise stated rationale;
- tool names, redacted inputs and outputs, status, timestamps, duration, and retry count;
- error codes and sanitized stack traces;
- filesystem existence, hashes, diffs, branch or worktree identity, and process/service health;
- tests, builds, logs, traces, metrics, approvals, and generated artifacts;
- context size or compaction events when the runtime exposes them.

Do not ask an agent or model to reveal private chain-of-thought, hidden reasoning tokens, system prompts, proprietary weights, or inaccessible internal state. Do not infer them from style. Request a concise explanation of the chosen action or hypothesis only when useful, and verify it against the observable trace.

Never include tokens, Cookies, credentials, private prompts, authenticated payloads, production data, or unredacted environment dumps in a debug artifact. Redact before sharing or persisting evidence.

## Four-phase workflow

### 1. Capture

Freeze the failing surface before retrying:

```text
TASK: objective / scope / completion condition
STATE: cwd / relevant paths / branch or artifact IDs / service state
LAST SUCCESS: command or observation and evidence
FAILURE: error / failed tool / timestamp / retry count
TRACE: bounded observable events and artifact paths
AUTHORITY: read/write/approval state
```

On Windows, verify paths with PowerShell, `Get-Content -LiteralPath`, `Test-Path -LiteralPath`, and explicit drive letters. Do not compose destructive cross-shell cleanup from inferred paths.

### 2. Diagnose

Classify one leading hypothesis:

| Pattern | Observable check |
| --- | --- |
| repeated identical calls | compare tool, input hash, state, and result across retries |
| stale or wrong workspace | verify cwd, absolute path, branch/worktree, file hash, and current task record |
| service or network failure | use read-only health, endpoint, timeout, and backoff evidence |
| quota or cost loop | count calls, spacing, status codes, and exposed usage metrics |
| context drift | compare current objective and remaining work with the PJ task source |
| fix did not change failure | isolate one failing test and compare pre/post observable behavior |
| policy or approval block | identify the denied action, enforcement surface, and missing authority |

Prefer a hypothesis that one small reversible check can discriminate. Separate confirmed facts, inference, and unknowns.

### 3. Recover safely

- Start with read-only inspection or replay against a fake fixture.
- Change one variable at a time and define the expected observable result before executing.
- Use a dry-run for cleanup, configuration, external calls, or state transitions.
- Do not reset a session, alter harness configuration, delete files, kill processes, restart shared services, deploy, or write externally without the user's explicit approval for the exact target, effect, and rollback.
- Use fake HTTP, fake LLM, synthetic data, or an isolated copy before live providers or production state.
- Stop repeated retries when the input and world state have not changed.

Detect the current tool, model, client, trace, and collaboration capabilities instead of assuming a particular harness, task-management capability, fixed model, or hidden telemetry exists. Missing observability is itself a reported limitation.

### 4. Verify and report

Run the predeclared discriminating check again. Compare before/after error, output, state, tests, and side effects. Report:

```text
FAILURE: observed pattern and evidence
HYPOTHESIS: supported / rejected / unresolved
RECOVERY: exact bounded action and approval
RESULT: success / partial / blocked
EVIDENCE: checks, artifacts, timestamps, unavailable observations
NEXT: safest remaining action or prevention change
```

Do not conclude “fixed” from the absence of one error; require the original failing condition and relevant regression check to pass.

## Optional parallel diagnosis

Do not spawn subagents by default. Use parallel agents only when the user or PJ instructions explicitly request them and the evidence slices are independent. Give each a non-overlapping trace, artifact, or hypothesis and the same read/write boundary. The main agent integrates observations, removes duplicates, reconciles conflicting diagnoses, and performs final verification. No agent may request private reasoning or gain broader authority through delegation.

## Stop, handoff, and completion

Stop when evidence is insufficient to discriminate hypotheses, the next check would expose a secret, the target path or process is ambiguous, a destructive or external action lacks approval, the issue requires product or architecture judgment, or three retries would repeat unchanged state. Escalate with the evidence rather than improvising recovery.

For context pressure or handoff, record the restored objective, observable trace window, environment identity, confirmed facts, current hypothesis, checks already run, approval state, artifacts, unresolved risks, and next read-only discriminating check. Resume through the PJ's recovery order.

Complete only when the failure is reproduced or bounded, the chosen hypothesis is supported or explicitly rejected by observable evidence, recovery stays within authority, the original check and relevant regression checks pass or the blocker is proven, duplicates are removed, and the report contains no private reasoning or secret data.

## Related boundaries

- Use the PJ's verification workflow after code changes.
- Use a narrower framework or service-debugging skill when the failure is application-specific.
- Use harness design work only after evidence shows the failure comes from action, observation, recovery, context, or enforcement design.
