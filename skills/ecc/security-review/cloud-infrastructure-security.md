# Cloud And Infrastructure Security Review

Load this resource only when the scoped change touches cloud identity, IAM, network policy, storage, secrets delivery, CI/CD, deployment, logging, or monitoring.

## Authority

- Read the target PJ's infrastructure, deployment, and incident-response sources of truth.
- Identify the adopted provider, service, region, runtime, CI platform, and pinned action/module versions.
- Verify version-dependent controls in current official provider documentation.
- Do not apply a generic AWS, Vercel, Railway, GitHub Actions, Terraform, or container recipe to an unconfirmed platform.

## Review Areas

1. **Identity and privilege:** workload identity, human/admin access, least privilege, separation of duties, short-lived credentials, break-glass path, and access review.
2. **Secrets delivery:** secret origin, runtime injection, rotation, auditability, process/log exposure, and least-privilege access. Environment variables are not categorically unsafe; assess how the adopted platform protects and exposes them.
3. **Network and storage:** ingress/egress, public exposure, service-to-service authentication, encryption, backup, retention, tenant separation, and recovery.
4. **Pipeline and supply chain:** minimal job permissions, trusted sources, lock/integrity state, artifact provenance, protected environments, and approval gates.
5. **Observability:** security-relevant events, redaction, retention, alert ownership, tamper resistance, and incident evidence.

## CI/CD Rules

- Do not reference mutable action branches such as `@main` as a security control. Follow the repository or organization policy for immutable commit SHA or approved release pinning.
- Inspect third-party action permissions, transitive execution, install/build hooks, and secret access before adoption.
- Use read-only audit commands during review. Dependency updates, secret rotation, IAM changes, deployment, and pipeline writes require separate authorization.

## Output

Report the reviewed boundary, adopted platform evidence, findings by impact, affected policy or path, attack precondition, remediation direction, verification, coverage gaps, and residual risk. Do not claim cloud security from a checklist alone.
