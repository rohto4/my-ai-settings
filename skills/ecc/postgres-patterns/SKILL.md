---
name: postgres-patterns
description: Design PostgreSQL schemas, queries, indexes, transactions, pooling, RLS, plans, and diagnostics. Use after database-migrations for persisted-shape changes.
---

# PostgreSQL Patterns

## Scope and handoff

- Use for a PostgreSQL-specific design or review of schema details, queries, indexes, transactions, pooling, RLS, plans, or diagnostics.
- Hand schema, persisted-data, index rollout, compatibility, backfill, runner, and recovery lifecycle to `database-migrations` first. Do not create or revise that lifecycle here.
- Read the target project's pinned PostgreSQL version, driver/proxy, deployment policy, and workload evidence. Check target-version behavior in the official PostgreSQL documentation; `current` is not evidence for an older target.
- Do not execute SQL, change configuration, enable extensions, or expose credentials without explicit authorization.

## Required evidence

Collect or state as assumptions: target version and topology; table sizes, growth, and write/read mix; representative query shapes, parameters, and latency goal; constraints and access roles; transaction/concurrency behavior; connection limits and pool/proxy behavior; and a safe environment for measurement.

## Design procedure

1. **Classify the request.** Separate logical invariant, query shape, access boundary, runtime limit, and operational symptom. Return to `database-migrations` if the requested change alters persisted shape or data lifecycle.
2. **Model schema from invariants.** Select identifiers, text bounds, temporal representation, numeric precision, nullability, keys, and constraints from domain semantics, interoperability, and query workload. Do not prescribe one ID, string, or timestamp type globally. Make cross-row invariants explicit and choose the PostgreSQL mechanism only after checking its semantics.
3. **Design queries and indexes together.** Specify predicates, joins, projection, ordering, cardinality/selectivity expectations, and write cost. Propose an index only for a measured or representative query; check operator class, column order, maintenance cost, and target-version behavior. Preserve deterministic ordering. Use keyset/cursor pagination only with a stable, unique ordering and cursor predicate; `OFFSET` is acceptable only where its measured cost and bounded depth meet the requirement, and neither complexity claim is universal.
4. **Set transaction boundaries.** Choose isolation, lock behavior, retry policy, idempotency, and timeout ownership from the anomaly and concurrency requirement. Keep transactions short; make retries safe before adding them. Treat job claiming, `SKIP LOCKED`, and UPSERT as workload-specific patterns, not defaults.
5. **Design pooling and RLS as boundaries.** Size pools from application concurrency, database capacity, proxy mode, and session-state needs; test exhaustion and reset behavior. For RLS, identify principals, privileged paths, roles, policy commands, and bypass ownership; test allow and deny cases with representative roles. Do not assume a managed-platform identity helper exists or has the intended semantics.
6. **Measure before tuning.** Capture a reproducible query, parameters, relevant statistics, and plan. Use approved `EXPLAIN` options in a safe environment, then compare estimated versus actual rows, timing, I/O, locks, and concurrent load. Change one justified variable at a time and remeasure.

## Stop and escalate

Stop and request evidence or owner approval when the target version, workload, cardinality, query parameters, role model, transaction semantics, pool topology, or safe measurement environment is unknown. Escalate runtime changes, extensions, broad configuration changes, production `EXPLAIN ANALYZE`, and any DDL/data change to the authorized operator and, where applicable, `database-migrations`.

## Required output

Return: scope and assumptions; target version and official sources; chosen schema/query/index or runtime design with rejected alternatives; transaction/pool/RLS boundary; measurement or test plan; risks and stop thresholds; and explicitly separate an unexecuted recommendation from authorized execution.

## Verify before completion

- Check SQL against the pinned target version and repository conventions.
- Test invariants, parameterized query results, deterministic ordering, authorization allow/deny cases, contention/retry behavior, and pool limits as applicable.
- Compare before/after plans and workload metrics where performance is claimed; retain the query shape and evidence.
- Confirm no migration lifecycle was bypassed, no secrets entered artifacts, and no platform-specific legacy example was treated as portable guidance.

## Load references only when needed

- [Schema and index patterns](references/schema-and-index.md): constraints, index candidates, and the original index examples.
- [Queries and concurrency patterns](references/queries-and-concurrency.md): UPSERT, pagination, job claims, transactions, and query-plan workflow.
- [Runtime and diagnostics](references/runtime-and-diagnostics.md): pooling, RLS review, statistics, and safe diagnostics.
- [Legacy and platform-specific examples](references/legacy-platform-examples.md): source-derived type, Supabase RLS, and configuration snippets; never use as active defaults.

Official sources: [PostgreSQL documentation](https://www.postgresql.org/docs/), [index types](https://www.postgresql.org/docs/current/indexes-types.html), [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html), and [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html).
