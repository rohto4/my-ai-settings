---
name: project-harness-conformance
description: Validate a project harness kit before adoption by checking its profile, schemas, policy fixtures, positive and negative scenarios, evidence claims, and runtime-adapter boundaries. Use when a repository contains harness profiles or policy-as-code, when someone asks whether a guardrail is really enforced, or before promoting a synthetic harness design into a project, CI gate, hook, MCP broker, or managed runtime setting.
---

# Project Harness Conformance

## Purpose

Turn “a rule is written down” into a bounded conformance report. Keep `declared`, `mapped`, `simulated`, `enforced`, and `evidenced` separate, and never infer production enforcement from a passing synthetic scenario.

## Workflow

1. Read the target repository's actual `AGENTS.md`, `PROJECT.md`, task ledger, and harness entrypoint in its required order.
2. Identify the kit root and its claimed state. Do not widen filesystem, network, credential, or external-write authority.
3. Run `scripts/check_harness_kit.py --kit <path>` first. This structural pass is read-only.
4. If the kit declares deterministic commands, run its preflight, conformance, and explicit unit-test commands with the project's approved runtime.
5. Require both positive and negative scenarios for every hard-control claim. A deny-only suite does not prove useful operation; an allow-only suite does not prove containment.
6. Record the enforcement point, observed evidence, owner, failure mode, and untested boundary for every control.
7. Report claims using the exact vocabulary in `references/conformance-claims.md`.

## Stop Conditions

Stop and report `blocked` instead of fabricating evidence when:

- the target is not a harness kit or the claimed entrypoints are absent;
- a schema or fixture cannot be parsed as UTF-8;
- a test would require real credentials, production data, external writes, deploy, push, or permission changes;
- a control bypasses the policy path or the runtime adapter is only a sample;
- the user has not approved a materially stronger runtime setting.

## Output Contract

Return:

- scope and exact kit path;
- structural result and deterministic command results;
- positive/negative case counts;
- claim state per control;
- limitations and next approval boundary;
- links to generated evidence if the project authorized writes.

Do not label a control `enforced` unless a real execution mechanism blocks the operation and a negative test observed that block. Do not label it `evidenced` unless the result is retained in an auditable artifact.

## Resources

- `scripts/check_harness_kit.py`: dependency-free, read-only structural inspection and scenario inventory.
- `references/conformance-claims.md`: state vocabulary and minimum evidence table.
