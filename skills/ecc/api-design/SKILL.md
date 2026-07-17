---
name: api-design
description: Design or review REST API contracts, including resources, status and error semantics, queries, auth boundaries, idempotency, compatibility, and observability.
---

# REST API Contract Design

Design contracts before implementation, or review implementation against the
existing contract. Keep REST as the default; do not introduce RPC, GraphQL, an
API gateway, a documentation format, or a versioning scheme unless the target
project's source of truth calls for it.

## Scope and Boundaries

- Cover resources, methods, representations, status and error behavior,
  collection queries, authentication, authorization, idempotency, rate limits,
  compatibility, and observability.
- Treat the target project's `AGENTS.md`, `PROJECT.md`, pinned stack, existing
  contract, and decisions as authoritative. Preserve established conventions
  unless a requested change explicitly replaces them.
- Adopt or update OpenAPI only when the project already makes it authoritative,
  or the user explicitly asks for its adoption. Do not infer it from examples.
- `api-design` owns the public or cross-component contract artifact. Use
  `backend-patterns` first to surface ownership, consistency, transaction, and
  asynchronous constraints; then finalize the contract here and hand the
  accepted contract back to backend implementation planning.
- Do not write to external systems, publish specifications, create credentials,
  or change runtime policy without explicit user authorization.

## Workflow

1. Read the target project's instructions, pinned stack, current API contract,
   and adjacent endpoints. Identify the authoritative contract location and
   consumers before proposing a shape.
2. State the operation's resource, actor, lifecycle, ownership boundary, and
   whether it is a collection, member, relationship, or exceptional action.
   Use nouns for resources; use an action endpoint only when no useful resource
   model exists.
3. Define each operation: method, path, path and query parameters, request
   representation, response representation, headers, and every expected status.
   Specify validation and state-conflict behavior rather than returning `200`
   for every outcome.
4. Define one project-consistent error shape. Include a stable machine code,
   safe human message, correlation identifier when available, and structured
   field errors only when they can be supported consistently. Never expose
   secrets, stack traces, database errors, or authorization-sensitive detail.
5. For list and search endpoints, set filtering, sorting, field selection,
   includes, default ordering, maximum page size, and pagination semantics.
   Choose offset or cursor pagination from data shape, concurrency, UX, index
   support, and current project conventions; make cursors opaque.
6. Define security and retry semantics: authentication mechanism, per-resource
   authorization rule, tenant isolation, idempotency behavior for retryable
   writes, rate-limit identity and response headers, and retry guidance.
7. Classify compatibility. Additive changes can still break strict clients;
   removals, renames, type changes, semantic changes, and auth changes require
   an explicit migration and deprecation decision. Use the project's versioning
   policy; do not prescribe path versioning by default.
8. Define observability without recording sensitive payloads: request or trace
   ID, operation name, status family, latency, rate-limit outcome, and safe
   audit events where required. Align names and retention with project policy.
9. Update the authoritative contract artifact and implementation only within
   the requested scope. For version-dependent behavior, consult the current
   official documentation for the project's pinned libraries and platform.

## Decision Rules

- `401` means authentication is absent or invalid; `403` means authentication
  succeeded but access is denied. Deliberately hiding resource existence is a
  project security decision, not an accidental status-code substitution.
- Use `201` with a `Location` header when creation produces an addressable
  resource. Use `202` only when acceptance and completion are genuinely
  separate; document how the client observes completion.
- Make retry behavior explicit. A POST can be made safely retryable with a
  scoped idempotency key and durable request/result handling; document mismatch,
  expiry, concurrent duplicate, and replay outcomes.
- Bound every collection query. Reject or normalize unsupported filters and
  sort fields deterministically; never silently broaden access or query cost.
- Put authorization checks at the resource and tenant boundary, not only in UI
  logic. Verify both allowed and denied paths.

## Stop and Escalate

Stop contract changes and surface a decision when any of these are unknown:

- authoritative API artifact or established naming and envelope convention;
- consumer impact of a breaking response, auth, or lifecycle change;
- tenant ownership or authorization rule;
- idempotency storage and retry behavior for a write with external effects;
- rate-limit identity, policy owner, or operator handling for overload;
- current behavior of a pinned dependency that affects the contract.

Do not fill these gaps with a copied example. Record assumptions and request
the smallest necessary decision or evidence.

## Expected Output

Produce an implementation-ready contract change containing:

1. Scope and compatibility classification.
2. Operation table: method, path, authz, inputs, successful statuses, failure
   statuses, headers, and idempotency/retry behavior.
3. Schemas or an authoritative-spec diff, including error and collection
   metadata where applicable.
4. Query, authorization, rate-limit, observability, and migration decisions.
5. Verification cases covering happy path, validation, authn/authz denial,
   ownership or tenant isolation, conflict or duplicate retry, pagination
   boundary, limit handling, and backward compatibility as applicable.

## Verification

- Compare the proposed contract with adjacent endpoints and the authoritative
  artifact; verify method, path, schema, status, and headers match exactly.
- Exercise the specified success, error, authorization, and retry cases using
  the project's existing test and API tooling. Do not invent coverage targets.
- Validate generated or edited API descriptions with the project's configured
  validator. Confirm examples and generated clients against the pinned stack.
- Recheck that logs, errors, and examples contain no secrets or internal detail.

## References

Read only the topic needed for the current decision:

- [Resources and HTTP semantics](references/resources-and-http.md)
- [Representations and error contracts](references/representations-and-errors.md)
- [Collection queries and pagination](references/queries-and-pagination.md)
- [Security, resilience, compatibility, and observability](references/security-resilience-evolution.md)
- [TypeScript, Python, and Go implementation examples](references/implementation-examples.md). For a `pj-general` Hono backend, use the `backend-patterns` Hono/BullMQ/Drizzle reference instead of the Next.js example.
