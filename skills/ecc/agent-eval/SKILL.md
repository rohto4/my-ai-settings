---
name: agent-eval
description: Design and run reproducible evaluations of coding agents, models, prompts, tools, or harness changes using representative fixtures, deterministic judges, repeated trials, and explicit score formulas. Use for adoption comparisons, regression checks, or evidence-backed agent selection. Do not use for one anecdotal run, unrelated product testing, live production tasks, or comparisons whose permissions, budgets, and environments cannot be normalized.
---

# Agent Eval

Compare agent behavior with controlled evidence rather than brand assumptions or one successful demo.

## Restore project truth

1. Read the target PJ's actual `AGENTS.md`, `PROJECT.md`, evaluation policy, pinned stack, test commands, and current task state before defining fixtures.
2. After compaction, session transfer, or handoff, reread them from disk. Project acceptance criteria outrank this skill, old reports, and conversation summaries.
3. Keep active evaluation state separate from completed evidence according to PJ rules. Never rewrite acceptance criteria after seeing a preferred agent's output.

## Define the comparison contract

Record before execution:

- decision being made and excluded conclusions;
- evaluated agent/client/model/tool versions and observable capabilities actually available;
- identical prompt, context, files, permissions, network policy, time budget, token/cost budget, and stop conditions;
- baseline commit or immutable fixture hash, runtime versions, OS, and judge commands;
- number of trials, concurrency, random seed when supported, and missing metrics;
- score formula and tie or failure handling.

Do not assume a particular harness, task-management capability, subagent API, model name, or cost field exists. Detect current capabilities and record unavailable dimensions instead of fabricating parity.

## Build representative fixtures

Use a small versioned set that reflects the real workload:

1. a common successful path;
2. an edge case with ambiguous or incomplete context;
3. a recovery case with a failing test or tool error;
4. a boundary case involving permissions, unsafe requests, or a required stop;
5. a larger case only when the adoption decision depends on long-horizon work.

Each fixture must define scope, starting state, allowed files/tools, forbidden actions, expected artifacts, deterministic checks, cleanup, and why it represents production work. Use synthetic or properly authorized sanitized data; never copy secrets or live customer content into fixtures. Avoid toy tasks, cherry-picked strengths, and duplicated fixtures that measure the same behavior.

## Safe execution gate

- Default to read-only fixture review and a dry-run of setup, judge, cleanup, and scoring.
- Run agents only in isolated copies, disposable worktrees, sandboxes, or equivalent bounded environments. Verify the resolved target path before any recursive move or cleanup.
- Replace HTTP services, LLM calls, databases, queues, email, payments, deploys, and other external effects with fake adapters unless the user separately approves a live test, exact target, cost, data boundary, and rollback.
- Do not push, merge, deploy, contact people, change permissions, or mutate a shared external system during an eval. Destructive fixture reset or cleanup requires a verified disposable target and explicit approval when not inherently isolated.
- Never place tokens, Cookies, credentials, system prompts, private traces, authenticated payloads, or command-line connection strings in fixtures, reports, or logs. Record only redacted usage totals when available.
- On Windows, use PowerShell-safe setup, `-LiteralPath`, explicit drive-letter paths, and a single verified shell path. Do not assume Bash, Docker, or Unix signals.

## Scoring

Prefer deterministic judges: tests, builds, schema validation, exact artifact checks, policy checks, and bounded static analysis. Use pattern matching only as supporting evidence. Use an LLM judge only when semantics cannot be deterministically checked; pin its version and rubric, blind it to agent identity, and report its variance.

For each fixture, define weighted checks before running:

```text
fixture_score = sum(check_weight * check_result) / sum(check_weight)
overall_score = sum(fixture_weight * mean(fixture_score across trials)) / sum(fixture_weight)
```

Use `check_result` values fixed by the rubric, normally `0` or `1`. Report pass rate, score distribution, consistency, elapsed time, tool calls, retries, and cost only when measured from comparable sources. Never convert an unavailable metric to zero.

## Execution workflow

1. Validate fixture hashes, baseline, setup, judge, cleanup, and expected failure behavior without an agent.
2. Run a smoke trial for every candidate to detect capability mismatch.
3. Run the predeclared trial count under equivalent isolation. Preserve raw stdout/stderr, tool events, artifacts, judge results, and environment metadata with secrets redacted.
4. Re-run flaky judges independently. Do not rerun only the preferred candidate or discard failed trials after observation.
5. Aggregate by the fixed formula, show per-fixture results, and separate measured facts from interpretation.

## Optional parallel runs

Do not launch subagents or parallel runners by default. Use them only when the user or PJ instructions explicitly request parallelization and isolation prevents cross-run interference. Partition by independent run or fixture, not by overlapping edits. The main agent owns fixture parity, artifact collection, deduplication, scoring, conflict resolution, and final verification. Record concurrency because it can distort latency and shared-rate limits.

## Stop, handoff, and completion

Stop when fixtures are not representative, baseline or judge is unstable, permissions differ materially, required secrets or live data would be exposed, cost approval is missing, isolation cannot prevent shared mutation, or results cannot be scored by the predeclared rubric.

For context pressure or handoff, record the decision, fixture/version hashes, candidate capabilities, completed and remaining trials, raw artifact paths, judge versions, score formula, exclusions, approval state, and next read-only step. Resume through the PJ's recovery order.

Complete only when representative fixtures pass their own validation, candidates ran under comparable conditions, all trials are accounted for, scores reproduce from saved judge results, variance and missing metrics are visible, duplicate evidence is removed, and the recommendation follows from the stated decision criteria.

## Output

Return the comparison contract, fixture coverage, per-fixture score table, aggregate score with formula, variance, cost/time provenance, failures and safety stops, artifact paths, limitations, and recommendation. Label structural-only or incomplete evaluations clearly.
