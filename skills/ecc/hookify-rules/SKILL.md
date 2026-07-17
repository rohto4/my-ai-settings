---
name: hookify-rules
description: Translate a requested Hookify-style guard into a supported Codex or repository rule, or maintain a legacy Hookify rule when the user explicitly names that runtime. Use for command, file, prompt, or completion guardrails; do not use for ordinary code validation, unsupported automatic hooks, or destructive enforcement without approval.
---

# Hookify Rules

Turn a requested guardrail into an enforceable rule without assuming that Codex supports another runtime's hook system.

## Choose The Supported Target

1. Read repository `AGENTS.md`, `PROJECT.md`, current task state, and the runtime's documented capabilities.
2. Capture the rule intent: event, match condition, warning or block behavior, false-positive boundary, and verification example.
3. Prefer an existing supported owner:
   - durable agent behavior in `AGENTS.md` or a scoped skill;
   - deterministic repository validation in an existing script, test, linter, or CI rule;
   - user-facing reminders in the current task workflow;
   - a runtime hook only when the current runtime documents it and the user authorizes configuration changes.
4. Do not invent `.codex` hook files or copy `.claude` paths into a Codex project.
5. For an explicitly scoped legacy Hookify task, read [legacy-hookify-format.md](references/legacy-hookify-format.md) and keep its files isolated from Codex-native configuration.

## Specify And Verify The Rule

- Use a narrow pattern and include positive and negative fixtures.
- State which field is inspected, whether matching is regex or literal, and what action follows.
- Diagnose read-only. Preview the proposed rule and fixture outcomes before writing.
- Treat a blocking rule, config write, install, or external mutation as a separate action requiring explicit approval.
- Never embed tokens, cookies, credentials, or sensitive prompt content. Redact fixture and log values.
- On Windows, use project PowerShell commands and resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`; preserve drive letters and keep discovery and mutation in the same shell.
- Before any delete, reset, or cleanup, verify absolute targets and obtain explicit approval.

Stop when the target runtime or rule owner is unknown, the pattern would block unrelated work, or safe fixtures cannot reproduce the behavior. Hand off the target runtime, proposed owner/path, rule intent, fixtures, preview results, blockers, and approval needed. Complete only after the supported owner accepts the rule and positive and negative fixtures show the expected behavior.
