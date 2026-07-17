# Branching And Worktrees

Read this file when selecting a branch model, creating a task branch, or assessing worktree safety.

## Select A Model From Repository Policy

Use the repository's stated workflow and branch protections first. The following are selection aids, not defaults:

| Model | Fits when | Watch for |
| --- | --- | --- |
| GitHub Flow | a deployable primary branch and review-based delivery are established | protected-branch and deployment requirements |
| Trunk-based development | small integrations, strong CI, and feature controls are already in place | local policy for direct trunk commits |
| GitFlow | scheduled release branches and separate integration/release roles are documented | extra merge targets for releases and hotfixes |

Do not infer team size, release cadence, or deployment authority from the model name. Verify the current repository policy and hosted-branch rules.

## Branch And Worktree Procedure

1. Inspect every registered worktree with `git worktree list --porcelain` and identify the one supplied by the user.
2. Inspect local changes, staged changes, untracked files, branch upstream, and target base before switching branches.
3. Create a branch only in the agreed worktree. Choose the name from repository convention; use `codex/<task>` only if that convention is absent and a Codex-owned branch is requested.
4. Keep a branch focused on one reviewable change. Split unrelated changes only with user agreement and without moving their edits.
5. Before cleanup, confirm whether each local branch or worktree is still referenced by an active review, release, or another worktree.

## Naming Examples

Use local naming policy where available. Common forms include `feature/<topic>`, `fix/<topic>`, `hotfix/<topic>`, `release/<version>`, `experiment/<topic>`, and issue-key prefixes. These examples are not a requirement.

## Cleanup Is A State Change

Branch or worktree removal can invalidate local recovery paths. Before deleting any branch, tag, remote reference, or worktree, show its merged/ahead status and obtain explicit approval. Prefer retaining stale state when ownership is unclear.
