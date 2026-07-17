---
name: autonomous-loops
description: Design and operate bounded sequential, evaluator-driven, or multi-agent Codex loops with explicit state, budgets, authority, evidence, and stop conditions. Use when the user explicitly asks for iterative or continuous execution. Do not use for a simple task, implicit background work, or autonomous production mutation.
---

# Autonomous Loops

## Choose the smallest loop

| Need | Pattern |
|---|---|
| Repeat one deterministic step | Sequential loop |
| Improve an artifact against a rubric | Generator-evaluator loop |
| Coordinate independent work units | Dependency-ordered task graph |
| Wake on a schedule | Approved product automation |
| Resume after interruption | Repository task artifact plus verified readback |

Prefer a single bounded loop. Add parallel agents only when the user or project policy explicitly requests delegation and each agent has a non-overlapping scope.

## Iteration contract

For every iteration:

1. Read authoritative repository instructions and current task state.
2. Select one action with a stated hypothesis or acceptance criterion.
3. Run against a fixture, fake, sandbox, or dry-run when an external effect exists.
4. Record the action, observed result, cost, and changed artifact.
5. Decide whether to continue, retry with a changed hypothesis, hand off, or stop.

Do not treat commentary, a plan, or an attempted tool call as progress.

## Authority and safety

- Define iteration, elapsed-time, token, and cost limits before starting.
- Keep real tokens, live APIs, deployment, publishing, merge, payment, deletion, and remote writes behind separate explicit approval.
- Never auto-push, auto-merge, auto-deploy, or silently broaden scope.
- Load secrets from environment or a secret store and mask them in logs.
- On Windows, use PowerShell equivalents, LiteralPath, explicit drive-letter checks, and one shell for filesystem operations.
- Persist restart state in the repository's task artifact, not private transcripts or runtime-specific shadow paths.

## Stop and handoff

Stop when:

- acceptance criteria pass
- the next step needs new authority or user choice
- the target or expected behavior is ambiguous
- a live dependency cannot be isolated
- a budget is reached
- the same approach makes no observable progress

Hand off the current objective, artifacts, checks, failures, remaining budget, and exact next decision. Complete only after required checks pass and no required work remains.
