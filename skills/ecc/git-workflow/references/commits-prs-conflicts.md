# Commits, PRs, And Conflicts

Read this file when authoring commits or PRs, preparing review evidence, or resolving a conflict.

## Focused Commit Procedure

1. Inspect `git status --short` and the path-scoped unstaged/staged diffs.
2. Stage only agreed paths; do not use broad staging when unrelated user changes exist.
3. Inspect the staged diff and confirm no generated secrets, credentials, or unintended files are included.
4. Write a concise imperative subject following repository convention. Conventional Commits may be used only when the repository expects them.
5. Run the relevant repository checks before committing, unless the user explicitly requests a draft/WIP state.

Examples: `fix(auth): handle expired refresh tokens`, `docs: clarify local setup`, `refactor(api): separate request validation`.

## Conventional Commit Vocabulary

When the repository has adopted Conventional Commits, common types are `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, and `revert`. Use an optional scope only when it improves discovery, and put breaking-change or issue references in the format required by the repository. Do not introduce this convention for one contribution without team agreement.

## PR Content

Use the repository or host-provider template. Where no template exists, cover:

- what changed and why;
- user-visible, compatibility, operational, and security impact;
- tests/checks actually run and their results;
- known limitations, follow-up work, and linked issues;
- screenshots or recordings where the repository requests them.

Do not claim a check passed unless it was run in the current change context. Do not state a universal PR-size target or fixed coverage threshold.

## Conflict Resolution

1. Identify the operation and files with `git status`.
2. Read each conflicting hunk and surrounding code, including the intent of the base and incoming changes.
3. Edit the intended combined result, remove conflict markers, and review the diff.
4. Run the applicable checks, then stage only resolved files.
5. Continue only when the correct behavior is evident. Otherwise preserve the operation state and ask the owner which behavior wins.

`--ours` and `--theirs` depend on the operation context and can be misleading. Do not use either as a blanket conflict-resolution strategy.

## Review Checklist

Verify problem fit, error paths, compatibility, security effects, maintainability, tests appropriate to the changed behavior, documentation impact, and compliance with repository checks. Review history only to the degree required by repository policy.
