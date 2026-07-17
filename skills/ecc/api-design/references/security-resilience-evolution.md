# Security, Resilience, Compatibility, and Observability

Use this reference when a contract crosses an identity, tenant, public-client,
retry, or operational boundary. Apply the target project's security policy and
pinned implementation guidance before using any pattern here.

## Authentication and Authorization

Send bearer credentials in the standard authorization header when the project's
selected authentication scheme requires it. API keys, if supported, need an
approved transport, storage, rotation, scope, and audit policy. Never put
credentials in URLs, examples, logs, or error messages.

Authorize every operation against the actor, resource, tenant, and requested
fields or relationships. Evaluate both direct resource lookup and collection
filtering. A `404` in place of `403` is valid only when intentionally chosen
for the threat model and documented consistently.

## Idempotency and Retries

For a write that clients may retry after a timeout, define whether the operation
is naturally idempotent or accepts an idempotency key. A robust key contract
states its scope, request fingerprint, storage lifetime, concurrent behavior,
replayed result, mismatch status, and interaction with downstream side effects.

Do not claim that `PATCH`, `DELETE`, or `POST` is safe to retry without
describing the actual persistence and failure boundaries. Recheck framework,
gateway, and client retry behavior against the pinned versions and current
official documentation.

## Rate Limits and Overload

Define the limiting identity (such as user, tenant, key, or IP), bucket scope,
cost model, endpoint exceptions, operator ownership, and client behavior.
Return `429` for an enforced limit and provide retry guidance such as
`Retry-After` when the policy supports it. Limit headers are a contract: choose
header names and semantics from the current project and official platform
guidance, not from a copied convention.

The following old tier examples are illustrative only and must not become a
default policy: anonymous `30/min`, authenticated `100/min`, premium
`1000/min`, and internal `10000/min`. Set limits from capacity, abuse risk,
fairness, and product requirements.

## Versioning and Compatibility

Classify each change by consumer impact. Adding a field or optional parameter
may still break strict parsers, signed payloads, caches, or generated clients.
Removing or renaming fields, changing a type or meaning, changing URLs, and
changing authentication require explicit migration planning.

Follow the target API's version-selection mechanism. A path such as `/api/v1`
and media-type negotiation are both possible patterns; neither is universally
recommended. Document announcement, migration support, deprecation signal,
sunset date, replacement path, and end-of-service behavior where applicable.
Confirm header syntax and lifecycle requirements in current official docs.

## Observability

Define safe request or trace correlation, operation name, status family,
latency, dependency outcome, rate-limit outcome, and audit events needed for
the service. Record identifiers and metadata rather than raw credentials or
payloads. Ensure metrics labels have bounded cardinality and that retention and
access match project policy.
