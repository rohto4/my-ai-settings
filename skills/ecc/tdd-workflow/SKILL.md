---
name: tdd-workflow
description: Design risk-based unit, integration, contract, and E2E evidence. Use for test-first cycles, bug reproducers, flaky tests, and test reporting.
---

# Risk-Based Test Workflow

## Trigger

Use for a feature, bug fix, refactor, API or UI behavior change that needs test design or
test evidence. Do not use merely to run an already specified command. Pair with a
framework/domain skill only after the target project confirms that framework is adopted and
pinned.

## Authority And Boundaries

1. Read the target repository's `AGENTS.md`, `PROJECT.md`, task/acceptance criteria, nearby
   tests, manifests, lockfiles, and CI scripts before choosing a test or command. Those
   sources override this skill.
2. Select only the evidence justified by change risk and blast radius. Do not impose TDD,
   a coverage percentage, a runner, a package manager, test layout, or commit checkpoints.
3. Keep test data, logs, fixtures, and reports free of secrets, tokens, cookies, production
   personal data, and unpublished endpoints. Redact sensitive output before reporting it.
4. Do not change CI, coverage gates, production data, external services, or hosted systems
   without explicit authorization. Keep work inside the requested repository and paths.
5. Leave branching, staging, commits, and remote writes to `git-workflow` and the user's
   authority. This skill creates no automatic commits.

## Procedure

### 1. Map Behavior To Evidence

- State the observable behavior, users/callers, inputs, failure modes, and compatibility
  constraints. Inspect the existing test seam before adding an abstraction.
- Choose the narrowest useful layer:

| Need | Default evidence |
| --- | --- |
| Deterministic local logic | Unit test |
| Component/service with real local collaborators | Integration test |
| Public schema, API, event, or provider agreement | Contract test |
| Critical user journey across real boundaries | E2E test |

- Combine layers only when one cannot prove the acceptance criterion. Raise coverage for
  shared contracts, authorization, persistence, concurrency, money, destructive actions,
  or externally visible workflows; keep narrow refactors proportionate.

### 2. Decide Whether To Work Test-First

Use test-first when the expected behavior is precise, the test can fail for the intended
reason, and the feedback loop is affordable. It is especially valuable for a bug reproducer,
new decision logic, validation, or stable API contract. Do not force it for exploratory work,
one-off migration investigation, inaccessible legacy seams, or a change where a direct
runtime check is stronger. Record the alternative evidence and reason when test-first is not
practical.

### 3. Run A Focused Cycle

1. Write or update the smallest test that expresses the behavior or regression.
2. When working test-first, run it and confirm **RED**: it executes and fails because of the
   intended missing/incorrect behavior, not a setup, syntax, dependency, or unrelated fault.
3. Make the smallest coherent implementation change, then rerun the same target to confirm
   **GREEN**.
4. Refactor only with relevant evidence green; rerun it after the refactor.
5. For a reported bug, retain a regression test when a stable automated reproducer is
   feasible. Otherwise preserve the exact manual/runtime reproduction and its result.

### 4. Control Boundaries And Reliability

- Unit tests may mock network, clock, randomness, filesystem, queues, and third-party SDKs
  at the owned adapter boundary. Do not mock the code whose behavior is being claimed.
- Integration/contract tests should use the project-approved local, disposable, or sandboxed
  dependency and assert the owned boundary. Never target a production account by default.
- Give each test independent setup, data, cleanup, and assertions on observable behavior;
  avoid ordering dependencies, arbitrary sleeps, unstable CSS selectors, and incidental
  implementation details.
- Treat intermittent failure as a defect. Capture the failing command, test, environment,
  retry pattern, artifacts, and suspected shared state; diagnose the cause before adding a
  retry, timeout, skip, or quarantine. Do not hide a flake merely to make CI green.

### 5. Verify And Report

1. Run the focused test first, then repository-required type, lint, build, contract,
   integration, E2E, or broader regression checks according to risk.
2. Inspect changed tests and implementation together for false positives, missing failure
   paths, test-only production branches, and unrelated churn.
3. Report: behavior and test layer; test-first decision and RED/GREEN evidence when used;
   commands actually run and results; mock/real dependency boundaries; coverage rationale
   and gaps; flaky/pre-existing failures; and checks not run with reasons.

## Stop And Escalate

Stop and ask for direction when acceptance criteria, the repository test command, required
environment, ownership of an external system, or an expected contract is unclear. Stop before
using production data, credentials, paid APIs, destructive fixtures, external writes, or
changing test/CI policy. Report a blocked or unrepeatable failure instead of claiming success.

## References

- [Test design and cycle](references/test-design-and-cycle.md): layer selection, regression
  tests, mock boundaries, risk-based coverage, and reusable patterns from the prior skill.
- [Test operations and evidence](references/test-operations-and-evidence.md): command
  discovery, isolation, artifacts, flaky-test investigation, and report template.
- [Candidate project stacks](references/candidate-project-stacks.md): read only after the
  target project confirms an adopted, pinned Next.js, Hono, Drizzle, Better Auth, Vitest, or
  Playwright stack; then verify the current official documentation for that pinned version.
