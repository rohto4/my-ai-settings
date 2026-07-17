# Identity and State Review Details

Load this reference only when identity, authorization, tenant or organization
scope, delegation, sessions, browser state, or CSRF is in the review boundary.
Use the current OWASP primary sources before relying on a technical control.

## Review Questions

- Map each identity issuer, authentication method, verifier, session store, and
  authorization decision point. Reject missing, malformed, expired, revoked,
  and wrong-audience credentials at the server-side boundary.
- Map the resource owner, tenant or organization, and requested action. Prove
  that every query, mutation, export, task, event, and cache lookup is scoped
  to the authorized principal and tenant, including error and empty-result
  behavior.
- Treat role names alone as insufficient evidence. Verify object-level and
  action-level authorization where resource ownership or delegated access can
  differ from a broad role.
- For delegated access, inspect impersonation, service accounts, callbacks,
  signed URLs, support tooling, and background jobs. Verify grantor/grantee,
  scope, expiry, audience, replay protection, revocation, and audit event.
- For browser state, trace login, renewal, logout, password recovery, session
  fixation, concurrent sessions, and state-changing requests. Verify CSRF
  controls against the actual cookie and request architecture rather than
  applying a generic cookie attribute recipe.

## Verification Evidence

Prefer targeted negative tests for cross-user and cross-tenant reads/writes,
privilege changes, expired or replayed credentials, revoked delegation, and
state-changing cross-origin requests. Use synthetic test identities and redact
identifiers in review output.

For current detailed guidance, read the identity and access links in
[current OWASP sources](current-owasp-sources.md).
