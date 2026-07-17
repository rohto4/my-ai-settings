---
name: performance-optimization
description: Measure and fix a verified application bottleneck. Use for a reported slowdown, performance regression, explicit latency or size budget, poor runtime metric, or profiler evidence; do not use for speculative micro-optimization without a baseline.
---

# Performance Optimization

Improve an observed user or system outcome with comparable before/after evidence. Measurement owns the decision; a familiar optimization pattern does not.

## Start and Boundaries

1. Read the target PJ's `AGENTS.md`, `PROJECT.md`, pinned stack, current task, and existing performance/test commands.
2. Name the user-visible symptom, metric, representative workload, environment, and acceptable target.
3. Keep diagnosis read-only. Do not install profilers, enable production telemetry, change infrastructure, clear shared caches, or run load against external systems unless the task authorizes it.
4. Use `frontend-patterns` for React/Next.js ownership, `backend-patterns` for server consistency and recovery, and database-specific skills for query/index design. This skill owns measurement and performance proof, not those architectures.
5. Use `benchmark` when the request is to design a repeatable benchmark rather than fix one product bottleneck.

Stop and request direction if the target metric, representative workload, data-safety boundary, or allowed test environment is unknown.

## Evidence Loop

### 1. Establish the baseline

Capture:

- exact command or observation path,
- input size and test data,
- environment and relevant version,
- warm/cold state, concurrency, and sample count,
- baseline distribution such as median and p95, not only the best run,
- correctness checks that must remain true.

Prefer an existing repository script. Do not compare results from materially different machines, data, cache state, or build modes without labeling the limitation.

### 2. Localize the bottleneck

Follow the evidence from symptom to owner:

- browser: navigation timing, network waterfall, main-thread work, layout, rendering, bundle, image/font delivery;
- backend: request trace, CPU, allocation, lock/queue wait, dependency latency, serialization;
- database: query count, plan, rows examined, index use, contention, connection pool;
- pipeline: build/test step duration, cache hit rate, I/O, repeated work.

Form one dominant hypothesis at a time. Record evidence that would falsify it.

### 3. Make the smallest reversible change

Change the component supported by the trace. Preserve correctness, error behavior, accessibility, security, and ownership boundaries.

For an authorized external experiment, start with fake HTTP, fake data, a sandbox, or dry-run. Keep real credentials, live writes, shared cache changes, load tests, deployment, and monitoring enablement behind separate explicit gates. Never put tokens, cookies, or credentials in commands, tracked artifacts, or logs.

On Windows, keep path discovery and file mutation in PowerShell, use `-LiteralPath`, and verify resolved drive-letter targets before recursive move/delete. Do not pass enumerated paths across shells.

### 4. Remeasure comparably

Run the same workload and correctness checks under the same documented conditions. Report:

- baseline and after values,
- absolute and relative delta,
- run-to-run variance or sample size,
- correctness/regression result,
- remaining bottleneck and trade-off.

If the change does not improve the target beyond noise, revert or report it as inconclusive; do not stack speculative changes on top.

### 5. Add a guard

Use the lightest durable guard the repository supports:

- budget or threshold with justified tolerance,
- regression benchmark,
- query-count or payload-size assertion,
- runtime metric and alert,
- documented manual check when automation is disproportionate.

Do not invent a universal threshold. Product requirements, representative field data, and current official standards outrank examples.

## Long-Running Work

After compaction or handoff, recover state from the PJ files, not the conversation summary. Keep the active hypothesis, baseline, changed variable, and next proving command in the task record; move only finished evidence to the completion log.

## Output and Completion

Lead with the observed outcome:

- target metric and workload,
- baseline,
- identified bottleneck and evidence,
- one change made,
- comparable result,
- correctness checks,
- residual risk and guard.

Complete only when the requested metric is remeasured, correctness still passes, and the result is reproducible or explicitly labeled inconclusive. If blocked, hand off the last verified state and the next safe measurement.

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
