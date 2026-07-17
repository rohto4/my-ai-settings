---
name: git-workflow
description: Choose repository-safe Git workflows for worktrees, branches, commits, PRs, integration, conflicts, releases, recovery, and history-changing operations.
---

# Git Workflow

Use this skill to make a repository-specific Git decision, then carry it out only within the confirmed authority and repository policy.

## Trigger

Activate for branch, commit, PR, merge, rebase, conflict, release/tag, rollback, cleanup, or Git-worktree decisions. Do not use it merely to explain a single Git command unless the request also needs a workflow decision.

## Boundaries

- Treat the current worktree, staged changes, untracked files, and other listed worktrees as user-owned until the user explicitly identifies what may change.
- Work only in the requested repository and paths. Do not modify another worktree to make the current one clean.
- Do not discard, overwrite, stash, amend, or stage existing user changes without explicit approval. Show the relevant scoped diff before adding files that were not created for the request.
- Treat `push`, PR creation, merge queue actions, tag publication, release publication, remote deletion, and hosted-provider writes as external writes. Obtain clear user authorization before performing them.
- Never expose credentials, remote URLs containing tokens, or secret-bearing diffs in output.

## Source Of Truth

1. Read repository-local `AGENTS.md`, `PROJECT.md`, contribution guidance, and CI/release documentation before choosing a workflow.
2. Use branch protection, CI, release, and host-provider policies over generic Git conventions.
3. For Git, hosting-provider, action, or release-tool behavior that is version-dependent, confirm the repository's pinned version and current official documentation before acting. Do not treat examples in this skill as current policy.
4. If policy, ownership, base branch, or release authority is unclear, stop and ask a focused question.
5. After compaction, session transfer, or handoff, reread the repository-required initialization files and current task record from disk before another Git mutation. Treat conversation summaries as pointers, not repository truth.

## Inspect Before Changing

Run read-only checks in PowerShell and report the relevant state:

```powershell
git status --short
git worktree list --porcelain
git branch --show-current
git log --oneline --decorate -n 12
git remote
```

Then identify the repository root, active worktree, intended base branch, remote name, existing PR/review state, and any changes not owned by this task. Do not print raw remote URLs. If a host or repository identity is necessary, capture the URL without echoing it and report only a sanitized host/path with credentials, tokens, and query data removed. Prefer `git diff -- <paths>` and `git diff --cached -- <paths>` to broad staging or inspection.

On Windows, keep filesystem validation in PowerShell: use `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath` for user-supplied worktree and file paths, preserve drive letters and spaces, and do not enumerate targets in one shell before passing computed cleanup or move operations to another.

## Decision Procedure

1. **Classify the work.** Separate local editing, local history organization, shared-branch integration, hosted review, and release publication. Apply only the controls needed for that class.
   Prefer a supported dry-run or preview for state-changing helpers. When Git itself has no dry-run, show the exact refs/paths and intended diff or effect, then stop at the approval gate rather than using the real mutation as a test.
2. **Choose the branch model from policy.** Use the repository's documented model. If none exists, propose a short-lived task branch and PR review as a reversible default; do not install a new branching model unilaterally.
3. **Protect the base.** Confirm the base branch and its current remote state before creating or updating a branch. Use a unique `codex/` prefix only when creating a Codex branch and local policy does not specify another prefix.
4. **Make focused commits.** Stage explicit paths, inspect the staged diff, and write an imperative message that describes the change. Follow the repository's commit convention; Conventional Commits are optional, not assumed.
5. **Choose integration deliberately.** Prefer merge when preserving shared history or policy requires it. Rebase only when the branch owner and policy permit history rewrite. Resolve conflicts by understanding both sides, not by taking a side wholesale.
6. **Prepare review evidence.** State scope, motivation, behavioral impact, tests actually run, and known limitations. Use the provider's required PR template and checks when they exist.
7. **Release from release policy.** Confirm version source, changelog/release-note process, required approvals, tag format, artifacts, and rollback path before creating a tag or publishing.

## Approval Gates

Stop for explicit approval after presenting impact, affected refs/worktrees, and recovery path before any of the following:

- rewriting history (`rebase` of a shared/pushed branch, `commit --amend`, `filter-repo`, or equivalent);
- force pushing, including `--force-with-lease`;
- `reset`, destructive restore/clean, stash drop, branch/tag deletion, or remote pruning that changes retained state;
- installing or changing Git hooks, global Git configuration, branch protection, CI settings, or merge policy;
- merging a PR, publishing a tag/release, or other remote/hosted write not already authorized by the user.

For a conflicted operation, stop rather than aborting or continuing it when the intended resolution is unclear. Preserve the conflict state and report the files and choices needed.

## Output

Report: repository and worktree inspected; policy and base branch used; decision and rationale; files/refs changed; commands that caused external writes; verification performed; and any approval still required. State clearly when no mutation was made.

## Verification

- Confirm the intended diff and staged diff contain only task-owned changes.
- Run the repository-prescribed formatter, static checks, tests, build, and release validation that apply to the change. Do not invent fixed coverage thresholds.
- Run `git diff --check`, re-check `git status --short`, and confirm the final branch/HEAD/ref state.
- After an authorized remote action, read back the provider or remote state and report the resulting PR, merge, tag, or release identifier.

## References

- [Branch models and local worktrees](references/branching-and-worktrees.md): selection criteria, branch naming, and cautious cleanup.
- [Commits, PRs, and conflicts](references/commits-prs-conflicts.md): message/PR patterns and conflict-resolution detail.
- [Integration, releases, and recovery](references/integration-releases-recovery.md): merge/rebase trade-offs, release checks, and reversible recovery options.
- [Configuration and legacy hooks](references/configuration-and-legacy-hooks.md): optional configuration plus deprecated Bash hook examples; read only when requested.
- [Operational patterns](references/operational-patterns.md): optional commit vocabulary, stash/fork workflows, ignores, and tag/changelog examples.
