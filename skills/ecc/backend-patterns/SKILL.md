---
name: backend-patterns
description: Design server-side ownership, transactions, idempotency, queues, caches, failures, and observability. Use for backend architecture and design review.
---

# Server-side Architecture Selection

Design for explicit ownership and failure semantics before choosing frameworks or writing handlers.

## Scope and Boundaries

- Use this skill for server-side architecture selection and design review, not for a frontend-only change or a framework migration with no architectural decision.
- Read the target PJ's `AGENTS.md`, architecture and product documents, and pinned stack before recommending a library or integration. Those files are authoritative over this skill.
- Confirm version-dependent behavior against the exact installed or pinned version and current official documentation. Do not treat a reference example as a current implementation contract.
- Keep external writes, migrations, deployments, and configuration changes out of scope until the user explicitly requests them.
- For an authorized integration spike, default to fake HTTP, fake dependencies, a sandbox, or dry-run. Keep real credentials, live API writes, migrations, deployment, and timer enablement behind separate explicit gates.
- Escalate authentication, authorization, privacy, compliance, or abuse-prevention requirements to the target PJ's security policy and dedicated security review.
- When a change also alters a public API, use this skill first to surface ownership, consistency, transaction, and asynchronous constraints. Then let `api-design` own the authoritative contract change; treat the accepted contract as input when returning to backend implementation planning.

## Required Design Record

Capture these decisions before implementation. Ask for the missing facts rather than inventing them.

1. State the user-visible capability, command/query boundary, latency target, and synchronous versus asynchronous work.
2. Name each data owner, source of truth, identifiers, lifecycle states, and the readers allowed to derive copies.
3. Define the API or event contract: validation, authorization boundary, response or acknowledgement, and compatibility needs.
4. Define consistency: transaction boundary, isolation/concurrency assumptions, cross-resource workflow, and compensating action.
5. Define duplicate-delivery behavior: idempotency key or natural deduplication key, storage duration, replay result, and side-effect guard.
6. Define operational behavior: queue semantics, cache authority and invalidation, retry classification, timeout, dead-letter or recovery path, and operator action.
7. Define observability: correlation identifiers, structured events, metrics, traces, audit needs, alert signal, and data-redaction rules.

## Selection Workflow

1. **Establish constraints.** Read the target PJ's product, architecture, data, security, and pinned-stack sources. Confirm deployment model, database guarantees, expected load, external dependencies, and failure tolerance.
2. **Map ownership.** Separate request adaptation, application orchestration, domain rules, data access, and external integration. Keep write authority with one bounded component; expose read models or events instead of shared mutable access.
3. **Choose the consistency model.** Use one database transaction for changes that must commit atomically in the same datastore. For work crossing datastores or services, design an explicit workflow with durable state, idempotent steps, and compensation or reconciliation; do not imply distributed atomicity.
4. **Design for at-least-once delivery.** Assume clients, webhooks, workers, and retries can repeat. Persist the deduplication decision with the business state where possible, make external effects idempotent, and make replay outcomes deterministic.
5. **Place asynchronous work deliberately.** Return after durable acceptance when work can be deferred. Put the job payload, retry policy, ownership, visibility, and terminal failure handling in the design. Use an outbox or equivalent durable handoff when a committed write must reliably emit work.
6. **Use caches as derived data.** Specify keys, scope, TTL or freshness rule, invalidation trigger, stale-data tolerance, stampede control, and behavior when the cache is unavailable. Never make an unreplicated cache the sole source of truth.
7. **Normalize failures.** Translate validation, domain-conflict, dependency, and unexpected failures at the boundary. Retry only transient, idempotent operations with bounded backoff and an observable terminal state.
8. **Make operation observable.** Propagate a correlation ID, log structured events without secrets, measure saturation/error/latency/outcome, and provide traceable transitions for asynchronous workflows.
9. **Review the narrowest design.** Prefer the smallest topology that satisfies ownership and recovery requirements. Record rejected alternatives and the condition that would justify a later split.

## Stop Conditions

Stop and request a decision when any of these remain unknown: source-of-truth owner, authorization boundary, transaction boundary, duplicate behavior, failure owner, or recovery path. Stop before implementation when current official documentation conflicts with the pinned stack, when a change needs an unapproved migration or external write, or when the design claims exactly-once behavior without a defensible end-to-end mechanism.

## Output

Produce a concise architecture note or implementation plan containing:

- Context, constraints, and the selected option with alternatives considered.
- Component responsibilities and data-ownership map.
- Contract, state transitions, transaction/idempotency/retry semantics, and queue/cache behavior.
- Error contract, observability plan, security assumptions, rollout or migration risks, and verification steps.

Do not claim the design is production-ready until the target PJ's tests and operational checks have verified the stated invariants.

## Verification

- Trace a successful request, duplicate request, concurrent conflict, dependency timeout, worker retry, terminal failure, and cache miss/invalidation.
- Confirm each write has one owner and each event/job has a durable producer, consumer, deduplication rule, and recovery owner.
- Verify sensitive data is absent from logs, traces, queue payloads, and error responses.
- Verify framework- and provider-specific code against the target PJ's pinned versions and current official documentation.

## References

- [Architecture and ownership](references/architecture-and-ownership.md): layers, API contracts, data ownership, and query design.
- [Consistency and idempotency](references/consistency-and-idempotency.md): transactions, concurrency, outbox, retries, and reconciliation.
- [Async work, caching, and resilience](references/async-cache-resilience.md): queue, cache-aside, timeout, retry, and recovery decisions.
- [Errors and observability](references/errors-and-observability.md): error taxonomy, structured telemetry, and operational signals.
- [Edge security patterns](references/edge-security-patterns.md): authentication/authorization integration and rate-limit decisions.
- [pj-general Hono, BullMQ, and Drizzle path](references/pj-general-hono-bullmq-drizzle.md): load only after confirming that PJ's pinned stack and official documentation.
