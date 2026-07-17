# Boundary Review Checklist

| Dimension | Evidence to inspect | Failure signal |
| --- | --- | --- |
| Product ownership | use cases, package docs, maintainers | two modules own the same rule |
| Dependency direction | imports, build graph, API calls | cycle or lower layer importing app code |
| Data ownership | schema, migrations, writes, events | multiple writers without a contract |
| Transactions | unit-of-work boundaries | cross-service transaction assumption |
| Runtime | processes, workers, queues | hidden in-process coupling |
| Deployment | build and release units | independent deploy claimed but impossible |
| Failure isolation | retries, timeouts, fallbacks | one module failure cascades silently |
| Permissions | actor and resource scope | authorization duplicated inconsistently |
| Observability | logs, metrics, traces | no owner for cross-boundary failures |
| Extraction | public API and storage contract | extraction requires copying internals |
