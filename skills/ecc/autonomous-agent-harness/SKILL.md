---
name: autonomous-agent-harness
description: Design a bounded long-running Codex agent harness with durable task state, scheduled or event-driven wakeups, tool adapters, approvals, observability, and recovery. Use when the user explicitly requests persistent or recurring agent operation. Do not use for a one-shot task, hidden background work, or unapproved production actions.
---

# Autonomous Agent Harness

## Establish the contract

Before building or enabling a loop, record:

- the concrete objective and non-goals
- the authoritative repository and task artifact
- allowed read and write surfaces
- iteration, time, token, and cost budgets
- wakeup or event source
- stop, escalation, handoff, and completion conditions
- evidence required after every external effect

Reread AGENTS.md, PROJECT.md, and the current task artifact from disk after compaction, handoff, or summary-based resume. Keep in-progress state separate from completion evidence.

## Architecture

Keep these boundaries explicit:

1. **Trigger**: a user request, approved automation, or verified external event
2. **Planner**: derives one bounded next action from current state
3. **Tool adapter**: exposes narrow schemas and fakeable effects
4. **Executor**: performs at most the authorized action
5. **Observer**: records result, error, cost, and next state
6. **Stop controller**: ends on completion, budget, risk, ambiguity, or repeated non-progress

Persist only the minimum restart state in a repository-approved task artifact. Do not depend on private chain-of-thought, hidden prompts, raw session transcripts, or runtime-private shadow files.

## Safe execution

- Start with fake tools, recorded fixtures, dry-runs, or a disposable environment.
- Keep real tokens, live APIs, deployment, production scheduling, and external writes behind separate gates.
- Load tokens, cookies, and credentials from environment or a secret store; mask them in logs and never commit them.
- Obtain explicit approval immediately before sending, publishing, deploying, merging, charging, deleting, or changing remote state.
- Do not spawn subagents by default. Use delegation only when the user or project policy explicitly requests it and scopes do not overlap.
- On Windows, use PowerShell equivalents, LiteralPath, explicit drive-letter checks, and one shell for each filesystem operation.

## Scheduling and wakeups

Use the product's supported automation or thread coordination capability only when the user explicitly requests recurring work or a new task. Record the schedule, timezone, owner, cancellation path, and next wakeup. Do not invent cron files, remote triggers, or background services.

## Recovery and completion

Stop and hand off when authority, target identity, secret handling, live dependency behavior, or expected output is ambiguous. Also stop after repeated non-progress or when a budget is reached.

Complete only when:

- the objective's acceptance checks pass
- external effects have readback evidence
- observed errors and unverified surfaces are reported
- durable state says no required work remains
- any recurring automation has an explicit owner and cancellation path
