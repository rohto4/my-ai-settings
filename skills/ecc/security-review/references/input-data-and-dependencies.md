# Input, Data, Dependency, and Abuse Review Details

Load this reference only when the relevant boundary is in scope. Confirm
version-sensitive behavior from the current official sources linked in
[current OWASP sources](current-owasp-sources.md).

## Inputs and Files

- Identify every untrusted source, including APIs, forms, headers, cookies,
  queues, webhooks, imports, environment-controlled configuration, and data
  read from another tenant or service.
- Validate type, length, format, range, ownership, and business invariants at
  the boundary. Trace canonicalized values to query, command, template,
  redirect, parser, serializer, and HTML/rendering sinks.
- For uploads and generated files, verify content handling separately from the
  declared type and filename. Check storage isolation, path construction,
  asynchronous processing, download authorization, and content serving.

## Data and Secrets

- Inspect source control, configuration, build artifacts, error paths, logs,
  traces, analytics, support tooling, responses, exports, backups, and caches
  for unintended secrets or data disclosure.
- Preserve evidence without copying sensitive values. State the location and
  exposure mechanism, then mask values and identifiers in reports.
- Check that errors distinguish usable client feedback from internal details
  without exposing credentials, authorization state, schema, stack traces, or
  other tenant data.

## Dependencies and Abuse

- Review new or changed direct and transitive dependencies in the lock state,
  install/build hooks, scripts, registries, source provenance, and runtime
  reachability. Do not equate a clean scanner result with absence of risk.
- Analyze enumeration, resource exhaustion, retry storms, concurrent updates,
  quota bypass, replay, fraudulent workflows, and privileged automation.
- Confirm that useful audit events can link the actor, target, action, result,
  and request or correlation context without recording secrets or excessive
  personal data. Match retention and alerting to project requirements.

## Targeted Tests

Add or request tests for malformed and oversized inputs, unauthorized file
access, cross-tenant data attempts, unsafe rendering or parsing, leaked errors,
abuse thresholds, and dependency/build integrity assumptions that changed.
