---
name: prp-create-prd
description: Create an evidence-based PRP product requirements document from an idea, problem, or unresolved capability. Use when the user needs product scope, users, outcomes, constraints, hypotheses, and open decisions before implementation planning. Do not use when the request is already implementation-ready.
---

# PRP Create PRD

Turn product intent into a grounded draft without inventing certainty.

## Workflow

1. Read repository instructions and product, specification, architecture, and task sources of truth.
2. Restate the problem, target actor, desired outcome, and current evidence.
3. Inspect relevant code and prior decisions when a repository exists.
4. Research current external facts only when they materially affect the product decision; cite primary sources.
5. Ask only for decisions whose absence would materially change the PRD. Record other gaps as assumptions or open questions.
6. Separate problem evidence, proposed solution, hypothesis, constraints, and implementation ideas.
7. Bound the smallest useful validation slice and list explicit non-goals.
8. Write the draft using [references/prd-template.md](references/prd-template.md).

## Artifact routing

- Draft: `.codex/prp/prds/{kebab-case-name}.prd.md`
- Adopted product truth: the repository's `docs/product/` or `docs/spec/` source of truth
- User decisions: the repository's user-decision file
- Implementation work created by adoption: the repository's implementation-task file

The PRP draft is not automatically authoritative. Promote only accepted content and keep unresolved items out of specifications.

## Completion evidence

Verify that the problem, actor, outcome, evidence status, non-goals, success signals, constraints, and open decisions are present. Report the draft path and which sections remain assumptions.
