# Async Work, Caching, and Resilience

Load this reference when deferring work, using a queue, adding a cache, or choosing timeout and retry behavior.

## Queue Selection Record

For each job type, record producer, queue, consumer owner, schema/version, payload size, acknowledgement point, concurrency, ordering requirement, retry classification, terminal destination, and recovery owner. A queue can improve latency and isolation; it does not make a non-idempotent job safe.

Return a durable acknowledgement only after the system has persisted enough state to recover the requested work. For command-created jobs, prefer a transactional outbox or the target platform's documented equivalent over an untracked best-effort enqueue after a database commit.

Keep jobs small and refer to canonical records by identifier when practical. Re-read current state in the worker rather than trusting a stale mutable snapshot.

## Cache Design

Use a cache only for derived, recomputable data with an explicit freshness tolerance. Record:

- Canonical source and cache key namespace, including tenant and version boundaries.
- Read path, write/invalidation path, expiration/freshness rule, and stale-read tolerance.
- Behavior on cache failure and controls for hot-key/stampede behavior.
- Invalidation or rebuild path after writes, schema changes, and incident recovery.

Cache-aside is often appropriate: read cache, load canonical data on a miss, then populate a derived entry. It still permits stale values and concurrent misses; address those explicitly. Do not make an in-process cache the shared rate limiter, cross-instance coordinator, or durable job queue.

## Timeouts, Retries, and Circuit Breaking

Set a deadline for every remote dependency based on the caller's latency budget. Classify failures before retrying: validation and domain conflicts normally fail immediately; network/transient capacity failures may retry when idempotent. Bound retries, include jitter when the library supports it, and expose the final outcome.

Use bulkheads, concurrency limits, circuit breaking, or load shedding only when measurements justify them. Their reset and fallback behavior must preserve correctness, not silently accept a lost write.

## Recovery Scenarios

Verify worker restart, duplicate message, poison payload, queue outage, cache outage, database slowdown, and downstream partial success. Design an observable terminal state and a repeatable repair/replay procedure for each case.
