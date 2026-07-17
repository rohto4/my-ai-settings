---
name: cost-aware-llm-pipeline
description: Design or review an LLM pipeline with measurable quality, latency, usage, and spend budgets. Use for model routing, batch cost control, retry/caching policy, or cost regressions; do not use for one-off prompt rewriting or provider selection without an application pipeline.
---

# Cost-Aware LLM Pipeline

Reduce cost only when the pipeline keeps its required quality and reliability. Provider names, model availability, usage units, caching rules, and prices are current facts; verify them against the pinned SDK and official provider documentation.

## Start and Boundaries

1. Read the target PJ's instructions, pinned providers/models/SDKs, current task, data policy, evals, and existing telemetry.
2. Define the workload, quality acceptance, latency target, monthly or per-run budget, and hard-stop behavior before changing routing.
3. This skill owns pipeline economics and controls. Use `prompt-optimizer` for one prompt, provider-specific skills for API details, and `eval-harness` for a full evaluation system.
4. Default experiments to fake LLM responses and recorded usage fixtures. Real credentials, live API calls, paid batches, external writes, deployment, and scheduled execution require separate explicit gates.
5. Never put tokens, credentials, prompts containing private data, raw model responses, or customer identifiers in logs or the repository. Use redacted IDs and approved secret injection.

Stop when quality acceptance, budget owner, usage/pricing evidence, or data-handling policy is unknown.

## Measurement Contract

For each evaluated call or cohort, record only approved telemetry:

- provider/model/version or deployment ID;
- workload class and redacted request ID;
- provider-reported input/output/cache usage units;
- retry count and terminal status;
- latency distribution;
- eval outcome or business-quality proxy;
- calculated cost, currency, pricing source, and effective date.

Do not estimate spend from character counts when provider usage is available. Keep estimates labeled and reconcile them against invoices or provider usage reports.

## Design Workflow

### 1. Establish a baseline

Run representative workloads through the existing path. Capture quality, latency, failures, usage, retries, cache behavior, and spend. Separate fixed overhead from per-item cost.

### 2. Segment by demonstrated difficulty

Create workload classes from observed features and eval results, not a generic text-length threshold. Examples include extraction complexity, tool need, context size, modality, or required reasoning depth.

### 3. Define routing with fallbacks

For each class, specify:

- default model/capability;
- quality gate;
- escalation signal;
- maximum attempts;
- fallback and terminal failure;
- budget impact.

Use the least expensive option that passes the declared eval. Do not route solely by vendor tier names or assumed capability.

### 4. Bound retries

Retry only documented transient failures with provider-appropriate backoff and jitter. Authentication, validation, policy, and deterministic parse failures fail fast or use a deliberate repair path. Count every retry against budget and preserve idempotency for tool or external effects.

### 5. Use caching deliberately

Apply provider or application caching only when:

- the pinned provider supports it;
- data retention and tenancy rules allow it;
- cache keys include every behavior-changing input;
- freshness and invalidation are defined;
- observed hit rate saves more than operational complexity costs.

Do not hardcode universal cache thresholds or assume a provider-specific payload shape.

### 6. Enforce budgets

Use preflight estimates for batch admission and provider-reported usage for reconciliation. Define warning, throttle, degrade, and hard-stop thresholds. A budget overrun must not silently switch to a path that violates quality, privacy, or correctness.

### 7. Verify the change

Compare like-for-like cohorts. Report quality delta, latency, failure rate, cache hit rate, cost per accepted result, total spend, variance, and workload mix. Roll back or label inconclusive if savings are within noise or quality regresses beyond tolerance.

## State and Handoff

On compaction or handoff, reread `AGENTS.md`, `PROJECT.md`, the task, pricing evidence, and eval artifacts from disk. Keep active hypotheses and budget state in the task record; move only verified results to the completion log.

## Output

Lead with the selected policy and its evidence:

- workload and quality acceptance;
- baseline economics;
- routing/retry/cache/budget rules;
- current pricing source and date;
- fake/dry-run and live gates;
- measured before/after result;
- residual uncertainty and rollback.

Complete only when representative eval quality still passes, costs reconcile to current usage/pricing evidence, hard-stop behavior is tested, secret/private data is absent from artifacts, and the result is repeatable.
