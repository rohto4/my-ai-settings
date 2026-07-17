---
name: plankton-code-quality
description: Apply Plankton's format, lint, repair, and recheck quality-gate pattern with project-supported Codex tools. Use when enforcing code quality after scoped edits or diagnosing repeated linter failures; do not use to install Claude hooks, silently change linter policy, or mutate code during a read-only review.
---

# Plankton Code Quality

Apply a visible three-phase quality gate through the repository's existing commands. Do not assume automatic PostToolUse hooks or model subprocesses exist.

## Run The Gate

1. Read repository instructions, target files, approved formatter and linter configuration, and the narrow validation command.
2. Inspect configuration and tool availability read-only. Do not install tools or alter rules merely to make a failure disappear.
3. Run the formatter in check or preview mode when supported.
4. Run the narrow linters and collect structured evidence: tool/version, command, target, file/line, rule, and observed output.
5. If the user authorized the scoped code change, fix root causes with the smallest patch. Keep configuration changes separate and explain why they are required.
6. Re-run the same formatter and linter checks, then the repository's relevant tests.
7. Report fixed and remaining findings, commands and observed results, skipped tools, and unverified scope.

## Protect Validation Integrity

- Treat linter, formatter, type-checker, and test configuration as protected policy. A suppression, ignore, threshold reduction, or config rewrite requires explicit review.
- Keep diagnosis read-only and prefer local fixtures, fakes, and dry-runs.
- Treat installs, live services, deploys, sends, pushes, or remote writes as separate actions requiring explicit approval immediately before execution.
- Never expose tokens, cookies, credentials, source payloads, or private paths in subprocess prompts or logs.
- On Windows, use project PowerShell commands, resolve paths with `-LiteralPath`, preserve drive letters, and keep discovery and mutation in the same shell.
- Do not launch subagents or fixer subprocesses unless the user or repository instructions explicitly authorize them. When authorized, pass raw findings and target artifacts rather than hidden conclusions.

Read [legacy-claude-hooks.md](references/legacy-claude-hooks.md) only when the user explicitly asks to maintain the upstream Claude-specific Plankton hook installation.

Stop when policy ownership is unclear, required tooling would need installation, configuration changes are disputed, or automated repair exceeds the authorized code scope. Hand off the exact commands, versions, findings, changed files, remaining failures, and next approval. Complete only after the narrow checks were rerun and every skipped or unavailable check is named.
