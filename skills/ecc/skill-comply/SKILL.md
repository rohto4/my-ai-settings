---
name: skill-comply
description: Evaluate whether a skill, rule, or agent definition is followed by designing prompt-independent scenarios and comparing observable behavior with an explicit specification. Use when the user asks for compliance evidence or a behavioral regression check; do not use to invoke unsupported agent CLIs, hidden hooks, or unapproved external runs.
---

# Skill Compliance Evaluation

Measure whether an instruction changes observable behavior, including when the test prompt does not restate the instruction. Treat the target file, repository policy, and visible execution evidence as the sources of truth.

## Supported Targets

- Skills such as `skills/*/SKILL.md`
- Repository rules and operational policies
- Agent definitions whose activation or output is externally observable

Do not claim compliance for hidden internal routing or unavailable traces. Report those checks as unverified.

## Workflow

1. Read the target and the repository's `AGENTS.md`, `PROJECT.md`, and current task record.
2. Convert mandatory behavior into ordered, observable steps. Separate required, optional, prohibited, stop, and completion conditions.
3. Create three concrete scenarios:
   - supportive: the prompt reinforces the instruction;
   - neutral: the prompt does not mention it;
   - competing: the prompt creates pressure to skip it without authorizing a violation.
4. Stop after the scenario/spec draft by default. Show the target, prompts, expected evidence, external effects, credentials, and cost before any run.
5. Run scenarios only when the user or repository contract authorizes the exact execution path. Prefer fake inputs, read-only tools, and isolated fixtures. Do not install dependencies, invoke a separate agent process, or send data externally without explicit approval.
6. Capture only evidence visible in the current environment: tool calls, commentary, file diffs, test output, and final responses. Do not infer hidden reasoning.
7. Classify each required step as observed, contradicted, or unverified. Check ordering separately from presence.
8. Report per-scenario results, shared failure modes, evidence paths, and the narrowest recommended instruction or test change.

## Output Contract

Include:

- target revision or content hash;
- behavioral specification;
- the three scenario prompts;
- evidence and classification for every step;
- temporal-order findings;
- limitations and unverified surfaces;
- recommended repository-enforced checks when prose alone is insufficient.

Do not present a percentage without the underlying step results and evidence.

## Bundled Legacy Harness

The bundled `scripts/`, `prompts/`, `fixtures/`, and `pyproject.toml` preserve an upstream harness built around a different agent CLI and model aliases. They are provenance resources, not a supported Codex execution path. Do not run them until a separately reviewed adapter replaces the process invocation, trace schema, model routing, and enforcement recommendations with capabilities verified in the current environment.

## Operational Safety, Recovery, And Completion

- On Windows, resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`, preserve drive letters and spaces, and keep discovery and any later mutation in the same PowerShell process.
- Keep evaluation read-only by default. Gate credentials, paid model calls, external writes, dependency installation, and subprocess agent execution separately and immediately before execution.
- Stop when authority, required evidence, or external impact is unclear. Hand off the exact scope, checks, results, artifacts, blockers, and next decision.
- At start and after compaction, session transfer, or handoff, reread repository `AGENTS.md`, `PROJECT.md`, and the current `docs/imp` task from disk. Claim completion only with recorded evidence and remaining unverified scope.
