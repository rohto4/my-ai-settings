---
name: permission-modeling
description: Model actors, resources, capabilities, scopes, delegation, deny rules, lifecycle, and audit evidence before implementing multi-user authorization.
---

# Permission Modeling

Define the authorization contract before choosing middleware or a policy engine.

## Workflow

1. Identify actors, identities, organizations, tenants, and trust boundaries.
2. Identify protected resources and their ownership lifecycle.
3. Express actions as capabilities on resources, not UI labels.
4. Define scope: self, owned resource, team, organization, tenant, delegated set, or system.
5. Define role-to-capability mapping only after capabilities are stable.
6. Specify inheritance, explicit deny, conflict precedence, and default-deny behavior.
7. Model delegation, expiration, revocation, impersonation, and break-glass access when applicable.
8. Specify authorization decision inputs, enforcement points, and audit evidence.
9. Test positive, negative, cross-scope, stale-membership, and race cases.

Write the contract using [references/permission-contract.md](references/permission-contract.md).

## Non-negotiable checks

- Authentication is not authorization.
- UI hiding is not enforcement.
- Tenant or organization identifiers come from trusted context, not unchecked input.
- Every privileged mutation has a server-side decision point.
- Cache invalidation follows membership and revocation semantics.
- Audit logs avoid secrets while preserving actor, action, resource, decision, and correlation.
