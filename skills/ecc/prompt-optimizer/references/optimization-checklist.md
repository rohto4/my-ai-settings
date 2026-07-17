# Prompt Optimization Checklist

Read this reference only for technical, multi-step, high-risk, or materially underspecified prompts.

## Diagnostic dimensions

| Dimension | Questions to resolve |
| --- | --- |
| Objective | What outcome and artifact must exist? Who uses it? |
| Authority | Which files, specifications, or user decisions are canonical? |
| Target | Which repository, directory, module, system, or audience is in scope? |
| Non-goals | What must remain unchanged or unexamined? |
| Constraints | Platform, language, compatibility, performance, accessibility, or policy? |
| Safety | Secrets, private data, network, external writes, deletion, deploy, push, publication? |
| Validation | Tests, static checks, fake boundaries, visual review, or measured criteria? |
| Recovery | Where are task state, completion evidence, and handoff recorded? |

Ask no more than three questions. Prioritize answers that change authorization, safety, architecture, or acceptance. Infer low-risk details only when the assumption is explicit.

## Scope signals

- **Small:** one artifact or localized change with a direct check.
- **Medium:** multiple related files or components in one domain; require a brief plan and integration check.
- **Large:** cross-domain or multi-session work; split into phases with task-state and verification gates.
- **High-risk:** any live data, credential, external effect, migration, deletion, publication, or deploy; require a dry-run or fake boundary and explicit approval before the effect.

Size and risk are independent. A one-line production permission change can be high-risk.

## Technical context checklist

Include only applicable items:

- detected or user-specified stack and target version;
- exact source paths and existing patterns to preserve;
- required behavior and edge cases;
- tests and available runtime commands verified from project files;
- error, rollback, and partial-failure behavior;
- data ownership, migrations, retention, and privacy;
- authentication, authorization, input validation, and secret injection;
- performance or resource limits that have measurable thresholds;
- UI behavior, responsive widths, accessibility, and visual acceptance;
- dependencies that may be added only after search and approval;
- scope exclusions and unrelated user changes to preserve.

## Ready-to-paste template

```text
Objective
- [Concrete outcome and deliverable]

Authoritative context
- [AGENTS/PROJECT/spec/reference paths]
- [Known facts; label assumptions]

Scope
- In: [targets]
- Out: [non-goals]
- Preserve: [existing behavior/content/user changes]

Execution boundary
- Start with read-only inspection.
- Use fake data or dry-run before live effects.
- Require approval before: [network/external write/deploy/deletion/credential use].
- Read secrets from [environment/secret store]; never print or persist values.

Work and recovery
1. [Plan or discovery step]
2. [Implementation or production step]
3. [Verification step]
- Record ongoing state in [task source] and finished evidence in [completion source].
- On stop or handoff, report completed work, evidence, blockers, and exact next step.

Acceptance criteria
- [Observable behavior]
- [Tests/checks and expected result]
- [Failure/rollback expectation]

Completion report
- Changed artifacts, validation, intentionally skipped effects, and remaining risks.
```

## Quality checks

- The optimized prompt can stand alone without hidden conversation context.
- Canonical project paths are referenced, not paraphrased into competing policy.
- Each required action has an observable completion signal.
- Read-only, workspace mutation, and live external effect are distinct.
- Unknown capabilities are not presented as installed commands or tools.
- No secret value or private data body appears in examples.
- Long work has a recoverable task and handoff boundary.
