# Schema and Index Patterns

Use after `database-migrations` has established lifecycle and target version. Match the design to constraints, query predicates, sort order, data distribution, write rate, and measured plan; do not infer an index solely from a column name.

## Schema review

- Express row-local invariants with types, `NOT NULL`, `CHECK`, keys, and named constraints where appropriate. Check cross-row/cross-table invariants against the target-version constraints documentation before choosing a foreign key, unique/exclusion constraint, trigger, or application coordination.
- Select identifier generation, text bounds, temporal representation, and numeric precision from the domain and integrations. `uuid`, `text`, and `timestamptz` are options, not universal defaults.
- Add foreign-key supporting indexes only after reviewing referencing-side queries, write cost, and deletion/update paths. PostgreSQL does not create an index on referencing columns automatically.

## Index candidates

| Query evidence | Candidate to evaluate | Verify |
| --- | --- | --- |
| Equality/range or ordered scan | B-tree | predicate, order, selectivity, writes |
| Equality prefix then range/order | Multicolumn B-tree | leading-column usage and order |
| Inclusion-only projection | `INCLUDE` | visibility, index size, write cost |
| Stable selective predicate | Partial index | predicate implication and lifecycle |
| Arrays, `jsonb`, full text | GIN/operator class | operators, update cost, target version |
| Physically correlated large data | BRIN | correlation and block-range parameters |

### Original useful examples

```sql
-- Equality columns commonly precede range columns; validate against the plan.
CREATE INDEX idx_orders_status_created_at ON orders (status, created_at);

-- A covering candidate; an index-only scan still depends on visibility and workload.
CREATE INDEX idx_users_email ON users (email) INCLUDE (name, created_at);

-- A partial candidate; queries must imply the predicate.
CREATE INDEX idx_users_active_email ON users (email) WHERE deleted_at IS NULL;
```

Use PostgreSQL's target-version documentation: [constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [index types](https://www.postgresql.org/docs/current/indexes-types.html), [multicolumn indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html), [index-only scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html), and [partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html).
