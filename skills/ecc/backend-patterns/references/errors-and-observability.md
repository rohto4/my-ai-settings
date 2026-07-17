# Errors and Observability

Load this reference while defining public failure contracts, telemetry, alerts, or operational runbooks.

## Error Taxonomy

Map failures at the transport boundary without leaking internals:

| Class | Client behavior | Server behavior |
| --- | --- | --- |
| Input validation | Correct request | Return stable field/problem details where safe |
| Authentication/authorization | Re-authenticate or request access | Return the target PJ's policy-defined response; audit as required |
| Domain conflict | Resolve state or retry only when documented | Return a stable conflict/precondition category |
| Dependency/transient | Retry only when the contract permits | Apply bounded retry/circuit policy and record dependency context |
| Unexpected | Do not expose internals | Generate a safe error response, retain correlation ID, and alert by signal |

Keep a stable machine-readable error code separate from a safe human message. Preserve causal context in protected logs/traces, not in client responses. Validate error serialization so exception details, secrets, tokens, SQL, and internal topology are never exposed.

## Structured Telemetry

At minimum propagate a correlation ID across request, database mutation, outbox/event, worker job, and external call. Emit structured events with:

- Timestamp, severity, component, operation, outcome, duration, and correlation/trace ID.
- Safe resource or tenant identifiers when permitted by the target PJ's privacy policy.
- Queue/job identifiers, attempt number, state transition, and dependency classification for asynchronous work.

Do not log authorization headers, cookies, tokens, raw credentials, or unrestricted request bodies. Apply redaction before events leave the process.

## Metrics, Traces, and Alerts

Measure request volume, latency distribution, error outcomes, dependency latency/failures, queue depth/age, retries, terminal failures, cache hit/miss, and resource saturation. Use traces to connect synchronous requests and asynchronous continuations where the observability stack supports it.

Alerts should target sustained user-impacting symptoms or exhausted recovery paths, with a named owner and diagnostic links. Do not alert on every retry or log line.

## Operational Verification

Trigger safe test failures and confirm that the client response is stable, the correlation ID connects all telemetry, sensitive fields are redacted, terminal work is visible, and an operator can identify the owner and recovery action.
