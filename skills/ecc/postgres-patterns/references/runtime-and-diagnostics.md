# Runtime and Diagnostics

## Pooling and RLS review

- Establish application concurrency, per-process pool limits, database `max_connections`, proxy pooling mode, session state, transaction duration, timeouts, and failure/reset behavior before selecting a pool size.
- Treat roles, `BYPASSRLS`, table ownership, `FORCE ROW LEVEL SECURITY`, policy `USING`/`WITH CHECK`, and privileged access paths as an explicit threat model. Test both permitted and denied requests under representative roles.
- A platform helper or JWT claim is not a PostgreSQL default. Model its trust boundary, availability, and semantics before using it in a policy.

## Safe diagnostics

1. Identify the symptom, time window, workload change, database version, and safe target.
2. Capture query fingerprint and parameters or a reproducible query shape; redact confidential values.
3. Inspect approved plan and statistics evidence, then correlate with locks, I/O, connection usage, autovacuum, and application errors.
4. Define a measurable hypothesis and stop threshold; change one approved variable and compare the same workload.

### Original diagnostic examples, context required

```sql
-- Requires the extension to be installed and configured by an authorized operator.
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > $1
ORDER BY mean_exec_time DESC;

-- A triage signal, not a bloat measurement or automatic maintenance command.
SELECT relname, n_dead_tup, last_vacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > $1
ORDER BY n_dead_tup DESC;
```

Check target-version behavior and required privileges in [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html), [monitoring statistics](https://www.postgresql.org/docs/current/monitoring-stats.html), and [resource configuration](https://www.postgresql.org/docs/current/runtime-config-resource.html).
