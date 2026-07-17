---
name: security-review
description: Review trust, identity, tenancy, input, secrets, data, dependencies, abuse resistance, and auditability. Use when a change crosses a security boundary.
---

# Security Review

## Activation and Boundary

Use this skill for a scoped security-sensitive code or change review. Review
the changed behavior and its reachable supporting code, proportionate to impact.

Do not treat this as a full repository scan, a standalone threat model, or
finding validation. Use [security workflow routing](references/security-workflow-routing.md)
to select an installed, current capability for broader discovery, threat
modeling, validation, or remediation. Do not substitute the ECC-local
`security-scan` skill for a Codex Security repository scan.

## Prepare

1. Read the target project's `AGENTS.md`, `PROJECT.md`, and applicable
   architecture, data, and security source-of-truth files before assuming a
   stack, identity model, tenancy rule, or deployment control.
2. Define the review boundary: changed entry points, assets, actors, trust
   transitions, data stores, privileged operations, and external dependencies.
3. Rank impact by exposure, privilege, blast radius, exploitability, and
   available compensating controls. Spend the most depth on high-impact paths.
4. Read [current OWASP sources](references/current-owasp-sources.md) when a
   conclusion depends on current ASVS or Cheat Sheet guidance. Verify every
   version-dependent fact in the current official primary source.
5. On Windows, keep path discovery and file inspection in PowerShell, use
   `-LiteralPath` for exact targets, preserve drive-letter paths, and keep any
   recursive move or deletion outside this read-only review unless separately
   authorized and verified in the same shell.

## Review

Trace untrusted input from entry point to side effect. For each applicable
category, inspect both the allow path and the reject or failure path.

- **Threat boundary:** Identify callers, services, queues, browsers, workers,
  and third parties that cross a trust boundary. Confirm server-side checks are
  present at the enforcement point, not only in the client or route layout.
- **Authentication and authorization:** Verify identity binding, credential or
  token validation, default-deny behavior, object/action checks, privilege
  changes, and recovery paths. Check tenant or organization scoping on reads,
  writes, search, exports, background jobs, and cache keys.
- **Delegation and state:** Check impersonation, service identities, signed
  links, callbacks, and delegated grants for audience, scope, expiry, replay,
  revocation, and auditability. Review session lifecycle and CSRF protection
  for the actual browser and cookie/request model.
- **Input and files:** Validate canonicalized input at the boundary; inspect
  query, command, template, redirect, serialization, and rendering sinks.
  For files, inspect size, type/content, filename/path, storage isolation,
  processing, authorization, and serving behavior.
- **AI and agent boundaries:** Treat model output, retrieved documents, tool
  arguments, and generated paths as untrusted input. Check allowlists, schema
  validation, tenant isolation, loop and cost bounds, and confirmation before
  destructive or externally visible tool actions.
- **Secrets and data exposure:** Check source, configuration, logs, errors,
  traces, client payloads, exports, backups, and telemetry. Do not print or
  copy secret values, tokens, cookies, or unnecessary personal data.
- **Dependencies and delivery:** Inspect new or changed dependencies, lock or
  integrity state, install/build hooks, provenance, CI permissions, and
  reachable vulnerable behavior. Do not apply automatic dependency updates as
  part of review unless separately authorized.
- **Abuse and audit:** Evaluate enumeration, excessive-cost paths, retries,
  quota/rate limits, idempotency, fraud or workflow bypass, and alertable audit
  events for privileged and security-relevant actions.

Use [identity and state details](references/identity-and-state.md) or
[input, data, and dependency details](references/input-data-and-dependencies.md)
only when those topics are in scope. Read
[cloud-infrastructure-security.md](cloud-infrastructure-security.md) only for
changed infrastructure, CI/CD, deployment, IAM, network, or observability
controls. It is a supplemental resource, not this skill's default scope.

## Framework and Platform Boundaries

Do not assume a particular framework, ORM, auth library, cloud, or blockchain
platform. Historical ECC platform examples are preserved under
`agents-v1/ecc-legacy/skills/security-review/` for provenance only and are not
an active execution reference.

For `pj-general`, read
[future-stack adoption guidance](references/pj-general-future-stack.md) only
after its project source of truth confirms that Next, Hono, Drizzle, Better
Auth, Vitest, or Playwright has been adopted and pinned. They are not a current
P0 assumption; Better Auth is reviewed only after that adoption is confirmed.

## Output

Report findings first, ordered by risk. For each finding include the affected
path and line, attack precondition and path, impact, evidence, a minimal
remediation direction, and a test or verification needed. Separate confirmed
findings from assumptions, coverage gaps, and out-of-scope areas.

Report an explicit review boundary and residual risk. Never claim that a change
is secure merely because no issue was found. Redact secrets and sensitive user
data from all output. Do not create tickets, change external systems, upload
artifacts, or send reports without explicit authorization.

## Stop Conditions

Stop and ask for the missing source of truth when the intended actor, resource,
tenant model, authorization rule, or security impact cannot be established.
Stop before production probing, credential use, exploit execution, destructive
testing, or external writes. Record the limitation and recommend the smallest
safe next verification step.

## References

- [Current OWASP primary sources](references/current-owasp-sources.md): load
  for current requirements or control guidance.
- [Identity and state](references/identity-and-state.md): load for authn,
  authz, tenancy, delegation, session, or CSRF review.
- [Input, data, and dependencies](references/input-data-and-dependencies.md):
  load for inputs, files, exposure, secrets, supply chain, or abuse review.
- [Security workflow routing](references/security-workflow-routing.md): choose
  scoped review, diff/repository scan, threat model, validation, or fixing.
- [Cloud and infrastructure security](cloud-infrastructure-security.md): load
  only when the changed boundary includes cloud or delivery controls.
