# Test Design And Cycle

Read this after the active workflow when selecting test depth, writing a regression test, or
deciding how to isolate dependencies. Project-local rules and acceptance criteria remain the
source of truth.

## Select The Layer

| Layer | Proves | Avoid using it for |
| --- | --- | --- |
| Unit | Deterministic logic, validation, transformations, local error paths | Framework wiring or provider behavior |
| Integration | Owned modules working together, persistence adapters, request handling | Every tiny branch |
| Contract | Request/response, schema, event, or provider expectations at an owned boundary | Full user journeys |
| E2E | A critical workflow as a user experiences it | Exhaustive combinations or internal branches |

Prefer a focused unit or integration test for a deterministic decision. Add contract coverage
when a change crosses a published or independently deployed boundary. Add E2E coverage only
when the path depends on browser wiring, routing, authentication, or other end-to-end behavior
that lower layers cannot prove.

## Test-First And Regression Work

Translate the acceptance criterion into one observable example. Cover normal, invalid, empty,
boundary, and failure inputs only where they are meaningful to the changed behavior. A bug test
should demonstrate the old failure with the smallest realistic setup, then pass with the fix.

Use RED/GREEN/refactor as a feedback loop, not a ritual:

1. RED is valid only if the intended test target runs and fails for the behavior being changed.
2. GREEN is valid only if the same target passes after the implementation change.
3. Refactor after behavior is protected; re-run affected evidence immediately.

For a change not suited to test-first work, establish a baseline first where possible, then use
the strongest practical evidence: focused existing tests, a contract check, a disposable
integration environment, or a precise manual/runtime verification.

## Risk-Based Coverage

Use coverage reports to find unexercised risk, not as a universal percentage gate. Raise
confidence for authorization, tenant boundaries, durable data, retry/idempotency, concurrent
updates, billing, destructive operations, and compatibility paths. A low-risk rename may only
need an existing focused test plus type/lint evidence. Note untested branches when the cost or
environment prevents them from being exercised.

## External Dependencies And Test Data

Mock at the owned edge: for example, wrap a provider SDK or transport behind an adapter and
mock that adapter in unit tests. Keep real implementations in integration or contract tests
only when a project-approved disposable dependency makes the evidence stronger. Specify each
mock's request, response, error, timeout, and retry behavior so tests do not silently diverge
from the contract.

Use isolated data per test. Seed only the records needed, generate unique identifiers where
parallelism requires it, clean up through approved lifecycle hooks, and never use production
credentials or records. Assert user-visible outcomes or stable contracts rather than private
state, generated class names, timing accidents, or call ordering unless that ordering itself is
the contract.

## Reusable Patterns

Use Arrange-Act-Assert to make setup, triggering action, and outcome readable. Give tests a
behavioral name. Test error paths deliberately, but do not require exactly one assertion; use
the number that establishes one coherent behavior. Keep components, route handlers, and test
files in the repository's existing layout rather than importing a generic directory tree.

For browser tests, prefer semantic role/name locators or durable test IDs over generated CSS
classes. Wait on a meaningful UI state, request, or locator assertion instead of a fixed delay.
See the adopted runner's official reference before using its APIs.
