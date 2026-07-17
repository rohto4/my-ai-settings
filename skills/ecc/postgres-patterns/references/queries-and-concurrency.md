# Queries and Concurrency Patterns

Use actual query parameters, ordering rules, conflict targets, expected contention, and target-version documentation. These examples are starting points, not universal recipes.

## Original useful examples, qualified

```sql
-- UPSERT requires a conflict target that represents the intended invariant.
INSERT INTO settings (user_id, key, value)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, key)
DO UPDATE SET value = EXCLUDED.value;

-- Keyset pagination needs a stable, unique ordering and matching cursor.
SELECT *
FROM products
WHERE (created_at, id) > ($1, $2)
ORDER BY created_at, id
LIMIT $3;

-- Queue claim pattern: confirm fairness, retries, transaction scope, and lease recovery.
UPDATE jobs SET status = 'processing'
WHERE id = (
  SELECT id FROM jobs WHERE status = 'pending'
  ORDER BY created_at LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

Do not claim that a cursor is always O(1) or `OFFSET` always O(n). Planner choices, indexes, visibility, ordering, cursor selectivity, and requested depth determine the observed cost. Measure both alternatives for the required page range.

## Transaction and plan workflow

1. State the anomaly to prevent and the expected concurrent operations.
2. Select isolation, locking, timeout, retry, and idempotency from that evidence; record the retryable errors and ownership of each timeout.
3. Reproduce representative parameters and capture `EXPLAIN` first. Use `EXPLAIN (ANALYZE, BUFFERS)` only in an approved safe environment because it executes the query.
4. Compare estimated and actual rows, node time, loops, buffer reads/hits, sorts, spills, lock waits, and concurrent workload. Update statistics or query/index design only with evidence, then remeasure.

Official sources: [INSERT / ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html), [SELECT](https://www.postgresql.org/docs/current/sql-select.html), [transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), and [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).
