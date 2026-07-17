# Operational Patterns

Read this file for optional Git operation patterns that are not the active decision workflow. Confirm repository policy, installed/pinned tool versions, and current official documentation before adapting commands.

## Starting Or Updating A Task Branch

Inspect the active worktree and target branch first. Only after user-owned changes are understood, create or update the agreed task branch, make focused commits, and use the approved remote/host review flow. Do not assume the target is `main`, the remote is `origin`, or that direct pushes are permitted.

## Stash Is Not A Cleanup Shortcut

Stashing changes mutates the working state and can hide user work. Obtain approval before stashing changes not owned by the task. Give the stash a descriptive message, inspect it with `git stash list`, and do not apply, pop, or drop it automatically. `pop` can create conflicts; `drop` removes a recovery reference.

## Fork Synchronization

Adding an `upstream` remote changes local repository configuration and requires approval. Before fetching or integrating from it, verify the canonical upstream URL from repository documentation. Compare the upstream target to the fork's policy-approved base branch, then use the selected merge or rebase decision process. Pushing the result is a separate external-write approval.

## Ignore Rules

Use repository-owned ignore files and existing generator/tool conventions. Typical candidates are dependency directories, build outputs, local environment files, editor state, OS metadata, logs, caches, and tool-specific build metadata. Do not blanket-ignore generated output or environment-file patterns without confirming whether the repository intentionally tracks them. Never rely on `.gitignore` to protect a secret that has already been committed; follow the repository's incident/remediation process.

## Changelog Evidence

Release notes may be assembled from reviewed PRs, issue trackers, generated changelog tooling, or a tag comparison such as `git log <previous-tag>..<next-tag> --oneline --no-merges`. Confirm project formatting, version source, and inclusion/exclusion rules. Generated changelog commands can overwrite files, so inspect their behavior and obtain approval before running a write mode.

## Common Anti-Patterns

- Do not commit credentials, token-bearing environment files, or generated dependency trees unless policy explicitly requires them.
- Do not commit directly to a protected branch merely for speed.
- Do not use vague messages such as `update` or `fixed stuff` when a focused description is available.
- Do not rewrite public history to avoid a follow-up commit.
- Do not assume a long-running branch, large PR, or a specific test-coverage value is acceptable or unacceptable without repository policy.
