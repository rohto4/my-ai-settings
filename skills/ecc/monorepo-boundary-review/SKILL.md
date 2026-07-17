---
name: monorepo-boundary-review
description: Review ownership, dependency direction, runtime, data contracts, and future extraction boundaries. Use for cross-package features and architecture drift.
---

# Monorepo Boundary Review

Use repository evidence to decide where behavior belongs and which dependencies are allowed.

## Review sequence

1. Read documented directory responsibilities and architecture decisions.
2. Trace the user or system flow end to end across current modules.
3. Name the owner of domain rules, data, public contracts, runtime state, and operations.
4. Map dependency direction and identify cycles, reverse dependencies, or shared internals.
5. Check whether a proposed shared package has multiple stable consumers or only speculative reuse.
6. Check process, deployment, scaling, failure, security, and data-ownership boundaries.
7. Evaluate whether the area can be extracted later without copying data or business rules.
8. Recommend the smallest boundary correction that preserves the product objective.

Use [references/review-checklist.md](references/review-checklist.md) for the evidence matrix.

## Output

Lead with violations and risks, then provide:

- current owner and proposed owner,
- allowed and disallowed dependencies,
- contract changes,
- data and transaction ownership,
- runtime and deployment implications,
- future extraction impact,
- tests or architecture checks that enforce the decision.

Avoid creating a service solely to match a directory diagram. A runtime boundary needs an operational reason.
