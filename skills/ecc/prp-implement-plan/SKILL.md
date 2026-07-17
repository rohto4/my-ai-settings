---
name: prp-implement-plan
description: Execute an accepted PRP plan through bounded changes, immediate validation, state synchronization, and a completion report while preserving unrelated work.
---

# PRP Implement Plan

Implement the real objective, not merely the easiest passing subset.

## 1. Load and reconcile

Read repository instructions, current task state, the plan, and every source of truth it cites. Inspect current files before relying on old line numbers or assumptions.

If the plan conflicts with adopted specifications or the current codebase, correct the plan interpretation and record the deviation. Ask only when the correction would materially change product scope, authority, external effects, or irreversible data behavior.

## 2. Protect current work

- Inspect Git status before editing.
- Preserve unrelated user changes and untracked files.
- Do not reset, checkout, clean, stash, or overwrite broad paths to obtain a clean tree.
- Use a branch or worktree only when the user or repository workflow requires it.

## 3. Execute in verified slices

For each plan slice:

1. Read the current implementation and pattern references.
2. Update the active implementation-task state.
3. Make the smallest coherent change that satisfies the slice.
4. Run the slice's direct validation immediately.
5. Fix failures before starting a dependent slice.
6. Record deviations, newly discovered risks, and evidence.

Do not add abstractions, compatibility layers, or fallback behavior that serve a different end state than the plan.

## 4. Complete the verification matrix

Use `verification-loop` when available. Match each acceptance criterion to direct evidence, then run broader checks proportional to blast radius. Treat skipped or unavailable checks as residual risk, not success.

## 5. Synchronize state

- Promote accepted product or technical changes to their source-of-truth docs.
- Update implementation tasks and completion records.
- Put user decisions and user actions in their dedicated files.
- Put handoff context in the repository's handoff or diary location.
- Evaluate cross-project knowledge only through the repository's knowledge policy.

## 6. Report

Write `.codex/prp/reports/{plan-name}-report.md` using [references/report-template.md](references/report-template.md). When all plan requirements are proven complete, copy the final plan snapshot to `.codex/prp/completed/` and mark its status complete.

Report changed behavior, important files, validation commands, unresolved risk, and deviations. Never claim full completion from partial checks.
