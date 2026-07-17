---
name: ai-first-engineering
description: Design or review the operating model for a team where AI generates substantial implementation output. Use for process, review, architecture, and eval policy; do not use to execute a single coding task.
---

# AI-First Engineering

Use this skill when designing process, reviews, and architecture for teams shipping with AI-assisted code generation.

It does not replace `agentic-engineering` for one multi-phase execution, `tdd-workflow` for implementation discipline, or the target PJ's existing governance. Start from the team's actual risks, authority, repository rules, and observed failure modes rather than imposing a generic autonomous-agent process.

## Process Shifts

1. Planning quality matters more than typing speed.
2. Eval coverage matters more than anecdotal confidence.
3. Review focus shifts from syntax to system behavior.

## Architecture Requirements

Prefer architectures that are agent-friendly:
- explicit boundaries
- stable contracts
- typed interfaces
- deterministic tests

Avoid implicit behavior spread across hidden conventions.

## Code Review in AI-First Teams

Review for:
- behavior regressions
- security assumptions
- data integrity
- failure handling
- rollout safety

Minimize time spent on style issues already covered by automation.

## Hiring and Evaluation Signals

Strong AI-first engineers:
- decompose ambiguous work cleanly
- define measurable acceptance criteria
- produce high-signal prompts and evals
- enforce risk controls under delivery pressure

## Testing Standard

Raise testing bar for generated code:
- required regression coverage for touched domains
- explicit edge-case assertions
- integration checks for interface boundaries

## State, Stop, and Completion

For a long-running policy change, reread `AGENTS.md`, `PROJECT.md`, and the current task after compaction or handoff. Keep open decisions and rollout state in the task file; keep only accepted policy and verified outcomes in completion/canonical documents.

Stop when human ownership, approval boundaries, evaluation data, or production rollback responsibility is unclear. Complete only when the operating model names decision owners, mandatory evals, review gates, exception handling, and the evidence that will show whether the policy is working.
