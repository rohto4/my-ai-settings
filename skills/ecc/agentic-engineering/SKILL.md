---
name: agentic-engineering
description: Structure a substantial AI-assisted engineering task around evals, bounded work units, and risk-aware model routing. Use for multi-phase implementation or harness work; do not use for a simple local edit or ordinary explanation.
---

# Agentic Engineering

Use this skill for engineering workflows where AI agents perform most implementation work and humans enforce quality and risk controls.

Do not use it to override the target repository's architecture, task process, approval boundary, or completion definition. Subagents and parallel execution are optional and may be used only when the user or target PJ rules authorize them.

## Operating Principles

1. Define completion criteria before execution.
2. Decompose work into agent-sized units.
3. Route model tiers by task complexity.
4. Measure with evals and regression checks.

## Eval-First Loop

1. Define capability eval and regression eval.
2. Run baseline and capture failure signatures.
3. Execute implementation.
4. Re-run evals and compare deltas.

## Task Decomposition

Apply the 15-minute unit rule:
- each unit should be independently verifiable
- each unit should have a single dominant risk
- each unit should expose a clear done condition

## Model Routing

- Use the lightest available model that can satisfy the task's accuracy and tool requirements.
- Escalate for architecture, root-cause analysis, ambiguous evidence, or multi-file invariants.
- Do not encode vendor-specific model names as a durable contract; route against capabilities exposed in the current environment.

## Session Strategy

- Continue session for closely-coupled units.
- Start fresh session after major phase transitions.
- Compact after milestone completion, not during active debugging.
- On resume or compaction, reread `AGENTS.md`, `PROJECT.md`, and the current task record from disk before continuing.
- Keep in-progress state and done conditions in the task file; move only completed evidence to the completion log.

## Review Focus for AI-Generated Code

Prioritize:
- invariants and edge cases
- error boundaries
- security and auth assumptions
- hidden coupling and rollout risk

Do not waste review cycles on style-only disagreements when automated format/lint already enforce style.

## Cost Discipline

Track per task:
- model
- token estimate
- retries
- wall-clock time
- success/failure

Escalate model tier only when lower tier fails with a clear reasoning gap.

## Completion and Handoff

Complete only when the declared evals pass and the requested artifact is verified. Stop and hand off when authority, architecture, or source-of-truth ownership is unresolved; include the last verified state, failure signature, remaining risk, and next safe action.
