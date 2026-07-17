# Consistency and Idempotency

Load this reference for mutations, concurrency, transactional outbox, event delivery, retries, or reconciliation.

## Transaction Choice

Use a local transaction only when the affected changes share one datastore and must become visible together. Define:

- The invariant that requires atomicity.
- Transaction start/end boundaries and the code path that owns them.
- Required isolation or lock behavior, including expected contention.
- Operations that cannot occur inside the transaction because they call an external system.

Do not use a transaction wrapper as a substitute for a workflow across a database, cache, queue, payment provider, or remote service. Persist workflow state, then apply idempotent steps with compensation or repair tooling.

## Idempotent Commands

At-least-once delivery is the default for networked callers and queue workers. For a command that can create an external or user-visible effect:

1. Require a client-supplied idempotency key or derive a natural uniqueness key.
2. Bind the key to the caller/tenant, operation, and a normalized request fingerprint when needed.
3. Persist key, status, result reference, and expiry with the business write under the same transaction when possible.
4. Return the original successful result for a completed duplicate. Define whether a pending duplicate waits, returns acceptance, or is rejected.
5. Make downstream effects idempotent too; an upstream key cannot prevent a worker or provider retry from duplicating an effect.

Use unique constraints and conditional updates to enforce invariants in the datastore. Application-only pre-checks race under concurrency.

## Outbox and Durable Handoff

When a committed mutation must cause asynchronous work, write an outbox record in the same transaction as the business state. A publisher later delivers the record and records delivery attempts. Consumers must still deduplicate because publication and acknowledgement can repeat.

An outbox record normally needs an event identifier, aggregate/tenant identifiers, event type/version, payload or payload reference, creation time, delivery status, attempt metadata, and correlation ID. Avoid credentials and unnecessary personal data in payloads.

## Retries and Recovery

Retry only failures that are plausibly transient and only when the operation is idempotent or guarded by durable deduplication. Bound attempts and time, use backoff with jitter where supported, and send exhausted work to a visible terminal state. Define the operator or repair process that can inspect, replay, compensate, or permanently resolve it.

## Concurrency Review

Exercise these cases before accepting a design:

- Two identical commands arriving concurrently.
- Two distinct commands changing the same invariant.
- A request timing out after the server committed.
- A worker succeeding after its acknowledgement was lost.
- An external provider accepting a call while the caller observes a failure.
- A delayed event arriving after a newer state transition.

Use the target datastore's official documentation and pinned runtime/ORM versions to choose isolation, locks, upserts, and conflict handling.
