# pj-general: Hono, BullMQ, and Drizzle Path

Load this reference only after confirming from `pj-general`'s current `AGENTS.md`, `PROJECT.md`, `tech-stack.md`, lockfiles, and package manifests that Hono, BullMQ, and Drizzle are selected for the capability. This file is a routing aid, not evidence of installed versions or configuration.

## Source Priority

1. The target capability's product, architecture, data, and security documents.
2. `pj-general`'s pinned stack, workspace manifests, lockfiles, and existing local conventions.
3. The current official documentation for the exact Hono, BullMQ, Drizzle, database, Redis, and runtime versions in use.

If these sources disagree, stop and resolve the discrepancy before copying an API, configuration field, transaction behavior, or retry/default assumption.

## Architectural Routing

| Concern | Route the decision through | Verify |
| --- | --- | --- |
| HTTP/API boundary | Hono adapter plus the PJ's validation/auth middleware conventions | Request context lifecycle, error mapping, runtime adapter, deployment constraints |
| Business mutation | Application/domain service and Drizzle-backed persistence boundary | Transaction owner, generated SQL, isolation/locking, unique constraints, tenant filter |
| Durable async handoff | Transactional outbox or documented equivalent, then BullMQ producer | Commit/enqueue gap, payload schema/version, idempotency key, correlation ID |
| Background execution | BullMQ worker invoking the same application service | Job retries/backoff, concurrency, completion semantics, terminal failure/replay owner |
| Cache or rate coordination | PJ-selected Redis client/infrastructure boundary | Key namespace, TTL/freshness, failure behavior, multi-instance semantics |

## Implementation Sequence

1. Locate the existing Hono route/middleware, Drizzle schema/repository, BullMQ producer/worker, Redis, logging, and test patterns in `pj-general`; reuse their boundaries rather than adding parallel conventions.
2. Read current official documentation for the exact pinned packages before using Hono context APIs, Drizzle transactions/query builders, BullMQ job options/events, or Redis behaviors.
3. Implement one capability path: validated input -> authorization -> application service -> transactionally owned mutation -> durable handoff -> idempotent worker -> observable outcome.
4. Prove the path with the target PJ's existing test and runtime commands. Test duplication, transaction rollback, worker retry/terminal failure, cache invalidation if relevant, and telemetry propagation.

Do not assume framework middleware provides authorization, an ORM transaction publishes a queue job atomically, or a queue configuration provides exactly-once delivery. Those guarantees must be designed and verified for the deployed topology.
