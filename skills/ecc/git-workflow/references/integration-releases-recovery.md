# Integration, Releases, And Recovery

Read this file when selecting merge versus rebase, updating a shared branch, preparing a release, or assessing recovery.

## Merge Or Rebase

Choose merge when shared history, an integration record, or repository policy matters. Choose rebase only when the branch owner and policy allow commit replacement and all affected collaborators understand the change. A local-only branch is usually lower risk, but still inspect whether it has an upstream or dependent worktree.

Before integrating, fetch and inspect the intended target using the repository's approved remote and host workflow. Do not assume `main`, `origin`, or a particular merge queue configuration.

After resolving conflicts, validate behavior before continuing the merge or rebase. If resolution intent is ambiguous, stop for a decision; do not silently abort, reset, or overwrite.

## Shared History And Force Pushes

Rebasing a pushed/shared branch rewrites its commit identities. Force pushes, including `--force-with-lease`, require explicit approval plus confirmation of affected branch ownership and repository policy. Prefer a new commit, merge, revert, or follow-up PR when it preserves a safe collaboration path.

## Release Decision Checklist

Before tagging or publishing, determine from project policy:

1. version source and versioning scheme;
2. required branch, approvals, CI, artifacts, and security checks;
3. changelog or release-note source;
4. tag format, signing, and publishing authority;
5. rollback and incident ownership.

Semantic versioning uses `MAJOR.MINOR.PATCH` when a project adopts it: incompatible changes increase major, compatible features minor, and compatible fixes patch. Confirm the repository's actual versioning and release tooling rather than assuming this convention.

Tags and releases are externally visible state. Obtain explicit authorization immediately before creating, pushing, deleting, or publishing them, then read back the remote/provider result.

## Annotated Tag Pattern

After all release gates are satisfied and approval is current, an annotated tag can record the release summary locally before its separately authorized publication:

```powershell
git tag -a v<version> -m "Release v<version>"
git show v<version>
```

Use the actual project tag prefix, signing policy, and release tool. Do not push or delete a tag from this pattern without the approval gate in the active skill.

## Recovery Options

Prefer a new corrective commit or `git revert` for published history when policy permits. `reset`, destructive restore/clean, commit amendment, history filters, branch/tag deletion, and remote deletion require explicit approval with a stated recovery path. Inspect reflog/refs first where appropriate, but do not mutate history while diagnosing.
