---
name: coding-standards
description: Apply a repository-aware baseline for naming, readability, errors, types, tests, and risk-based review. Use for cross-project code quality, not framework architecture.
---

# Cross-Project Coding Standards

Use this skill as a minimum quality floor. It does not replace repository rules or a
specialized skill for the language, framework, architecture, or domain in scope.

## Authority And Boundaries

1. Read repository instructions first, including `AGENTS.md`, contributor guidance,
   local conventions, and the files nearest to the change.
2. Treat the repository's formatter, linter, type checker, test commands, generated-code
   policy, and established local patterns as authoritative.
3. For version-dependent behavior, identify the target project's pinned stack and verify
   against current official documentation before changing implementation or configuration.
4. Use a narrower skill or project documentation for React/UI, API contracts, database
   access, security, deployment, or other framework/domain-specific work.
5. Do not introduce a global convention, dependency, automated rewrite, external write,
   or configuration change merely to satisfy this skill.

## Procedure

### 1. Orient

- Identify the requested behavior, affected callers, failure modes, and compatibility
  constraints.
- Inspect nearby code and tests before proposing a pattern. Preserve intentional local
  conventions unless they create a concrete maintenance, correctness, or safety risk.
- Find the repository's existing validation commands. Do not invent commands or assume a
  package manager, CI system, or fixed coverage threshold.

### 2. Implement The Smallest Coherent Change

- Choose names that reveal the role, units, and boolean state where that improves reading.
  Keep established domain terminology, public API names, and idiomatic short loop indices.
- Prefer straightforward control flow, focused functions, and explicit boundaries over
  clever abstractions. Split code when doing so improves a concrete concern such as test
  isolation, reuse, error handling, or comprehension.
- Keep state changes visible. Prefer non-mutating updates when aliasing or concurrent use
  makes mutation risky; use controlled mutation when it is clearer, required by an API, or
  measurably appropriate. Document a non-obvious invariant or tradeoff, not syntax.
- Remove duplication only when the shared behavior and lifecycle are genuinely aligned.
  A small local repetition can be safer than a premature abstraction across unrelated code.
- Add types, validation, bounds checks, and resource cleanup where the language, project
  rules, and boundary risk warrant them. Avoid type escapes and unchecked inputs unless a
  documented boundary makes them safe.

### 3. Handle Failures Deliberately

- Define what callers need on failure: a returned result, a typed/domain error, a retry,
  or propagation. Preserve actionable context without exposing secrets or internal data.
- Check external responses, parsing, I/O, and state transitions at their boundaries.
- Do not catch errors only to log and continue, replace useful diagnostics with a vague
  error, or retry non-idempotent work without project-specific safeguards.

### 4. Review By Risk

Review the changed path and its callers for:

- behavior and compatibility, including empty, invalid, and failure inputs;
- unclear names, hidden state changes, deep nesting, unexplained constants, and stale
  comments;
- duplicated logic, unnecessary abstractions, and work on unneeded paths;
- error propagation, cleanup, observability, and sensitive data exposure;
- performance only where input size, hot paths, or evidence makes it material; and
- tests that exercise changed behavior, regressions, and meaningful boundary cases.

Scale review and testing to blast radius. A local refactor may need targeted checks; shared
contracts, persistence, concurrency, authentication, payments, or destructive operations
need broader evidence and any repository-required review.

### 5. Verify

1. Run the narrowest relevant formatter, linter, type checker, and tests already defined
   by the repository.
2. Run focused checks first, then broader required checks when shared behavior changed.
3. Inspect the diff for unrelated churn, generated files, accidental configuration changes,
   debug output, and secrets.
4. Report commands actually run and their result. State any checks not run and why.

## Stop Conditions

Pause and ask for direction, or document the limitation, when:

- repository instructions conflict or the authoritative command/configuration is unclear;
- a proposed change alters a public contract, data schema, security boundary, or production
  behavior without a confirmed requirement;
- current official documentation and the pinned stack disagree or cannot be verified;
- validation cannot run because of missing dependencies, unavailable services, permissions,
  or an unrelated pre-existing failure; or
- a change would require destructive operations, broad formatting churn, or external writes
  that the user has not requested.

## Output

Summarize the behavior changed, the repository rules followed, material tradeoffs, and
verification evidence. Make residual risk, skipped validation, and assumptions explicit.

## Load Details Only When Needed

- [Core examples and review cues](references/core-practices.md): language-neutral examples
  plus TypeScript/JavaScript illustrations for naming, errors, types, comments, tests, and
  code-smell review.
- [Frontend examples](references/frontend-patterns.md): React-oriented component, hook,
  state, rendering, and performance examples. Use only for a React project after checking
  its pinned React/tooling versions and official documentation.
- [API and data examples](references/api-and-data-patterns.md): REST, input validation,
  response shape, and query examples. Use only after the project's contract, data model,
  pinned dependencies, and current official documentation are known.
