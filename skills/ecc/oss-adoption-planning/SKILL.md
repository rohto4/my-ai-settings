---
name: oss-adoption-planning
description: Evaluate and stage third-party OSS adoption behind explicit product, data, integration, security, operations, and exit contracts. Use when comparing, embedding, forking, wrapping, or replacing an external system. Do not adopt from feature count alone or let the OSS silently become the product source of truth.
---

# OSS Adoption Planning

Adopt capability in reversible layers and keep ownership explicit.

## Workflow

1. Define the product capability and invariants before naming an OSS candidate.
2. Inspect current official documentation, releases, license, security posture, maintenance activity, and migration constraints.
3. Compare candidates against must-have contracts, not total feature count.
4. Decide what the project owns: identity, permissions, canonical data, workflow state, UI, integration events, and audit history.
5. Choose an adoption layer: reference only, isolated prototype, adapter integration, embedded component, managed dependency, or maintained fork.
6. Define the boundary contract and anti-corruption layer.
7. Plan data import/export, identifiers, idempotency, retries, version pinning, upgrade tests, and failure isolation.
8. Define rollback or replacement evidence before production adoption.
9. Stage rollout with explicit exit gates.

Use [references/adoption-decision.md](references/adoption-decision.md) for the decision artifact.

## Guardrails

- Pin a tested version; do not rely on `latest` in production design.
- Treat upstream facts as drift-prone and date their verification.
- Keep secrets outside the repository.
- Do not fork before confirming an adapter or extension point cannot satisfy the requirement.
- Do not claim reversibility without testing export, deletion, and identifier mapping.
