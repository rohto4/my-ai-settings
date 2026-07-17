# Edge Security Patterns

Load this reference when a backend design must integrate authentication, authorization, abuse protection, or tenant isolation. Follow the target PJ's security policy and dedicated security-review skill; this reference does not prescribe an identity provider, token format, or role model.

## Authentication and Authorization

Treat authentication as establishing a verified actor context and authorization as a resource/action decision. Make the authorization decision close to the owned use case, not only at a route declaration. Carry tenant/account scope explicitly and enforce it in data access.

Define the policy source, actor/resource/action inputs, default-deny behavior, audit requirements, privilege-change propagation, and test cases for cross-tenant access. Use roles, attributes, relationships, or capabilities only when they match the target PJ's established model.

Validate bearer tokens, sessions, API keys, and webhook signatures using the selected provider's official documentation and current pinned library versions. Do not copy a generic JWT verifier or role table into a PJ with a different identity system.

## Rate and Abuse Controls

Choose the protected action and identity key deliberately: account, tenant, credential, IP, device, or a combination. Define scope, burst/sustained policy, storage/coordination model, response contract, bypasses for trusted internal traffic, and monitoring.

An in-memory limiter is valid only when one process is intentionally the enforcement boundary. Distributed deployments need a shared or edge-enforced mechanism with documented consistency behavior. Rate limiting supplements, but does not replace, authorization and input validation.

## Security Stop Conditions

Request review before implementation when data classification, tenant isolation, public endpoint exposure, credential handling, policy source, or audit-retention requirements are unknown.
