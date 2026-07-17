# Architecture and Ownership

Load this reference while defining server-side boundaries, contracts, ownership, or query patterns.

## Responsibility Split

Use a small set of explicit responsibilities. Names and file layout must follow the target PJ's conventions.

| Boundary | Owns | Must not own |
| --- | --- | --- |
| Transport adapter | Protocol parsing, request validation, authentication context, response mapping | Domain policy or persistence details |
| Application service | Use-case orchestration, transaction selection, authorization invocation, result mapping | Transport-specific objects |
| Domain component | Business invariants and state transitions | HTTP, queue, or ORM mechanics |
| Repository or data gateway | Queries and persistence for one owned aggregate/read model | Cross-use-case orchestration |
| Integration adapter | A provider's protocol, failure translation, and idempotent call boundary | Provider-specific logic spread across services |
| Worker consumer | Job validation, idempotent application service invocation, terminal outcome | A second source of business authority |

Do not introduce every layer mechanically. Keep a direct handler-to-service-to-database path for a small capability only when ownership and tests remain clear. Split an adapter when it isolates a real transport, provider, or persistence concern.

## Data Ownership Map

For each entity or aggregate, record:

- Canonical store and the component allowed to change it.
- Stable identifier, tenant/account boundary, lifecycle states, and retention constraints.
- Read models, caches, search indexes, analytics copies, and the event/rebuild path that derives them.
- Invariant scope: one record, a transactionally consistent set, or an eventually consistent workflow.
- Conflict policy: reject, serialize, optimistic retry, merge, or compensate.

Avoid exposing a repository as a generic shared data API. Consumers should call a use case or a purposeful read interface, so ownership and authorization do not drift into callers.

## Contract Design

Choose REST, RPC, GraphQL, events, or internal calls based on consumers and compatibility requirements; do not select a style by habit. For every command and query, specify:

- Input schema and semantic validation.
- Caller identity and authorization decision point.
- Resource/action identifiers and pagination, filtering, sorting, or versioning rules where applicable.
- Success representation and stable error categories.
- Idempotency, concurrency, and retry expectations.
- Compatibility and deprecation path for public contracts.

For resource-oriented HTTP APIs, use resource paths and query parameters for collection navigation when that matches the target PJ's API conventions. A command that changes several resources or starts a workflow may be clearer as an explicit action endpoint or asynchronous command.

## Query Design

Treat query shape as part of the contract:

- Select only fields needed by the response or computation.
- Batch dependent reads or use a join/preload strategy to avoid per-row follow-up queries.
- Define deterministic ordering and cursor/offset behavior before pagination.
- Add indexes only after identifying predicates, ordering, cardinality, and write cost; verify with the database's plan tooling.
- Bound list sizes and large fan-out operations.

Read the target datastore/ORM documentation and inspect its actual generated queries before relying on provider-specific transaction, locking, or loading behavior.
