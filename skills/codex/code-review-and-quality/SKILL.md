---
name: code-review-and-quality
description: Review a scoped code change with findings-first evidence across correctness, tests, maintainability, architecture, security, performance, and delivery risk. Use when the user asks for code review, before accepting a substantial implementation, or when AI-generated changes need an independent quality gate; do not implement fixes unless requested.
---

# Code Review and Quality

Review the requested change, not the author. Lead with actionable findings and
support every claim with the smallest relevant path, line, test, or observed
behavior.

## Establish the review boundary

1. Read the repository instructions, accepted specification, current task, and
   relevant architecture or style source of truth from disk.
2. Inspect the actual diff and its reachable behavior. Include adjacent code
   only where it establishes an invariant, consumer, or failure path.
3. State what is in scope, what verification is available, and what remains
   unverified. Do not turn a scoped review into an unsolicited repository scan,
   threat model, or refactor.
4. Keep the review read-only. Do not edit files, post comments, create issues,
   approve a pull request, push, deploy, or call write-capable external APIs
   unless the user separately requests that action.

## Review in leverage order

1. **Correctness:** Compare behavior with the accepted requirement. Trace happy,
   boundary, error, retry, concurrency, and state-transition paths that apply.
2. **Tests and evidence:** Read tests before trusting them. Check whether they
   would fail for the regression, cover the public behavior, and exercise the
   relevant failure path. Distinguish tests observed passing from tests merely
   present in the repository.
3. **Security and data:** Check trust boundaries, authorization, tenant scope,
   validation, injection sinks, secret or personal-data exposure, dependency
   changes, external effects, and AI/model output used as executable input.
   Never reproduce tokens, cookies, credentials, or sensitive payloads in the
   review; mask them and report only the location and risk.
4. **Architecture and ownership:** Check dependency direction, canonical helper
   reuse, module ownership, transaction or lifecycle boundaries, and whether
   feature-specific logic leaked into a shared layer.
5. **Clarity and complexity:** Flag confusing names, deep or repeated branches,
   silent fallbacks, unnecessary wrappers, dead paths, or abstractions that
   relocate complexity without removing it. Propose a concrete structural move.
6. **Performance and operations:** Check unbounded work, N+1 access, hot-path
   allocation, blocking I/O, pagination, timeout and retry ownership,
   observability, migration, rollback, and compatibility when applicable.

Do not invent a numeric line limit, coverage target, latency budget, or preferred
framework. Use the target repository's standards and measured evidence.

## Classify findings

Order findings by impact and confidence:

- **P0 Critical:** credible security compromise, data loss, privilege bypass, or
  production-wide failure; stop acceptance.
- **P1 High:** likely incorrect behavior, broken requirement, unsafe migration,
  or material regression; fix before acceptance.
- **P2 Medium:** bounded defect, missing important test, maintainability or
  operational risk that should be addressed in this change.
- **P3 Low:** optional improvement or minor clarity issue. Label style-only
  preferences as a nit and do not present them as defects.

Do not inflate severity. State the triggering conditions, affected behavior,
and why the evidence supports the level. If evidence is incomplete, label the
item as a question or coverage gap instead of a confirmed finding.

## Produce the review

For each finding provide:

1. severity and concise title;
2. exact path and tight line range;
3. evidence and reproduction or reasoning path;
4. user or system impact;
5. minimal remediation direction;
6. verification that would close the finding.

Then report assumptions, coverage gaps, and tests or commands actually run.
When no findings remain, say so plainly while retaining residual-risk and
verification limits. Never use “LGTM” as a substitute for evidence.

## Stop and hand off

Stop when the specification, intended actor, data ownership, deployment target,
or authoritative behavior cannot be established. Request the smallest missing
decision or source. Route repository-wide security discovery to an installed
security scan, threat modeling to the threat-model capability, and requested
fixes to a separate implementation pass.

On Windows, use PowerShell and `-LiteralPath` for exact filesystem inspection.
Never compose deletion or move targets across shells. Review external state in
read-only mode and require explicit authorization immediately before any later
write-capable action.

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
