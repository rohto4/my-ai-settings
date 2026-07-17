# Test Operations And Evidence

Read this when locating commands, diagnosing a failure, managing flaky tests, or preparing the
final verification report.

## Discover Commands

Read repository documentation, CI definitions, manifests, lockfiles, and nearby tests before
running anything. Use the declared package manager and explicit project scripts; do not assume
`npm`, a test filename convention, watch mode, coverage tooling, or a global installation. On
Windows, use PowerShell and keep paths/encoding safe. Start with the narrowest test that can
fail for the changed behavior, then widen only as the risk warrants.

## Isolation Checklist

- Give each test its own setup and cleanup; do not rely on suite order or mutable shared state.
- Control time, randomness, locale, environment variables, ports, and asynchronous completion
  where they affect the assertion.
- Use a project-approved fake, container, emulator, or sandbox for dependencies that cannot be
  mocked. Keep its lifecycle and data scope explicit.
- Capture only safe artifacts. Scrub headers, tokens, cookies, personal data, and private URLs
  from logs, snapshots, videos, traces, screenshots, and reports.

## Flaky-Test Triage

1. Reproduce with the exact focused command and record frequency, platform, worker count, and
   relevant safe artifacts.
2. Check for unawaited work, shared data, order coupling, race conditions, clock dependence,
   resource contention, selector instability, and real-network dependence.
3. Fix the cause and demonstrate repeated stable runs when practical. A retry can diagnose a
   flake, but is not evidence that it is resolved.
4. If immediate repair is impossible, follow repository policy for marking/quarantining it;
   state the impact, owner, exit condition, and missing coverage. Never silently skip it.

## Evidence Template

```text
Verification result
- Behavior / risk: <what changed and why this scope>
- Test design: <unit|integration|contract|E2E>; <test-first used or not, with reason>
- Focused evidence: <command> - <pass|fail|not run>
- RED/GREEN: <evidence or not applicable>
- Broader checks: <commands and results>
- Dependencies: <mocked/real approved boundary and data scope>
- Coverage: <risk covered, deliberate gaps>
- Limitations: <flake, pre-existing failure, blocked check, or none>
```

Do not claim a test passed when it was not executed, when it did not include the changed path,
or when the environment substituted a different implementation. Separate pre-existing failures
from task-caused failures with baseline or path-specific evidence where possible.
