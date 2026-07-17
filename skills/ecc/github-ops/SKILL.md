---
name: github-ops
description: Inspect or manage GitHub issues, PRs, checks, workflow runs, releases, contributors, and security alerts with the gh CLI. Use for a concrete GitHub-hosted read or authorized write beyond local Git; do not use for local branch/commit workflows or another hosting provider.
---

# GitHub Operations

Manage GitHub repositories with a focus on community health, CI reliability, and contributor experience.

## When to Activate

- Triaging issues (classifying, labeling, responding, deduplicating)
- Managing PRs (review status, CI checks, stale PRs, merge readiness)
- Debugging CI/CD failures
- Preparing releases and changelogs
- Monitoring Dependabot and security alerts
- Managing contributor experience on open-source projects
- User says "check GitHub", "triage issues", "review PRs", "merge", "release", "CI is broken"

## Scope, Project Truth, And Recovery

- Use `$git-workflow` for local branch, commit, worktree, merge/rebase, or tag decisions that do not require GitHub state. Use the applicable provider skill for non-GitHub hosts.
- Read repository-local `AGENTS.md`, `PROJECT.md`, contribution guidance, `CODEOWNERS`, issue/PR templates, `SECURITY.md`, workflow files, and release policy as applicable. These sources override generic labels, stale periods, merge rules, and examples below.
- After compaction, session transfer, or handoff, reread the repository-required initialization files and current task record from disk before another GitHub call. Do not resume external operations from a conversation summary alone.
- Confirm the sanitized `owner/repository`, default/base branch, target issue/PR/run/release, and current authorization boundary before acting. Stop if repository identity, ownership, or write authority is ambiguous.

## Tool And Safety Contract

- Use the `gh` CLI or another user-approved GitHub connector. Start with read-only `list`, `view`, `checks`, `run view`, or GET requests and keep result limits bounded.
- Treat label edits, assignments, comments, issue closure, reruns/cancellations, PR updates/merge, release creation, and non-GET API calls as external writes. Before each write, show the target, intended payload/effect, available rollback or corrective action, and obtain explicit authorization unless the user already authorized that exact operation.
- Prefer a supported preview or dry-run. When GitHub/`gh` has no dry-run, prepare and show the command/body without executing it; do not substitute a live request as a test.
- Never print `GH_TOKEN`, `GITHUB_TOKEN`, cookies, authorization headers, `gh auth token`, or token-bearing URLs. Use the existing approved credential store/environment, redact logs, and do not add authentication material to repository files.
- On Windows, keep examples in PowerShell. Validate local body/template paths with `Resolve-Path -LiteralPath`, quote paths containing spaces, and do not build mutation commands from filenames enumerated in another shell.

Stop when authentication/scopes are missing, the target cannot be distinguished, policy conflicts with the requested action, a security alert may contain sensitive data, required checks are incomplete, or rollback ownership is unclear. On completion or handoff, report the sanitized repository/targets, read-only evidence, exact external writes, returned issue/PR/run/release identifiers, verification readback, failures, remaining items, and approvals still required.

## Issue Triage

Classify each issue by type and priority:

**Types:** bug, feature-request, question, documentation, enhancement, duplicate, invalid, good-first-issue

**Priority:** critical (breaking/security), high (significant impact), medium (nice to have), low (cosmetic)

### Triage Workflow

1. Read the issue title, body, and comments
2. Check if it duplicates an existing issue (search by keywords)
3. Apply appropriate labels via `gh issue edit --add-label`
4. For questions: draft and post a helpful response
5. For bugs needing more info: ask for reproduction steps
6. For good first issues: add `good-first-issue` label
7. For duplicates: comment with link to original, add `duplicate` label

```powershell
# Search for potential duplicates
gh issue list --search "keyword" --state all --limit 20

# Add labels
gh issue edit <number> --add-label "bug,high-priority"

# Comment on issue
gh issue comment <number> --body "Thanks for reporting. Could you share reproduction steps?"
```

## PR Management

### Review Checklist

1. Check CI status: `gh pr checks <number>`
2. Check if mergeable: `gh pr view <number> --json mergeable`
3. Check age and last activity
4. Flag PRs >5 days with no review
5. For community PRs: ensure they have tests and follow conventions

### Stale Policy

- Issues with no activity in 14+ days: add `stale` label, comment asking for update
- PRs with no activity in 7+ days: comment asking if still active
- Close stale issues after 30 days only when repository policy explicitly defines that lifecycle and the user authorizes the scoped write; otherwise report candidates without changing them

```powershell
# Find stale issues (no activity in 14+ days)
gh issue list --label "stale" --state open

# Find PRs with no recent activity
gh pr list --json number,title,updatedAt --jq '.[] | select(.updatedAt < "2026-03-01")'
```

## CI/CD Operations

When CI fails:

1. Check the workflow run: `gh run view <run-id> --log-failed`
2. Identify the failing step
3. Check if it is a flaky test vs real failure
4. For real failures: identify the root cause and suggest a fix
5. For flaky tests: note the pattern for future investigation

```powershell
# List recent failed runs
gh run list --status failure --limit 10

# View failed run logs
gh run view <run-id> --log-failed

# Re-run a failed workflow (external write; requires authorization)
gh run rerun <run-id> --failed
```

## Release Management

When preparing a release:

1. Check all CI is green on main
2. Review unreleased changes: `gh pr list --state merged --base main`
3. Generate changelog from PR titles
4. Create release: `gh release create`

```powershell
# List merged PRs since last release
gh pr list --state merged --base main --search "merged:>2026-03-01"

# Create a release (external write; requires authorization)
gh release create v1.2.0 --title "v1.2.0" --generate-notes

# Create a pre-release (external write; requires authorization)
gh release create v1.3.0-rc1 --prerelease --title "v1.3.0 Release Candidate 1"
```

## Security Monitoring

```powershell
# Check Dependabot alerts
gh api repos/{owner}/{repo}/dependabot/alerts --jq '.[].security_advisory.summary'

# Check secret scanning alerts
gh api repos/{owner}/{repo}/secret-scanning/alerts --jq '.[].state'

# Review and auto-merge safe dependency bumps
gh pr list --label "dependencies" --json number,title
```

- Review dependency bumps; never auto-merge without repository policy and explicit authorization for the scoped merge
- Flag any critical/high severity alerts immediately
- Check for new Dependabot alerts weekly at minimum

## Quality Gate

Before completing any GitHub operations task:
- every reported target is within the requested scope and its final state was read back
- any labels, comments, closures, reruns, merges, or releases are listed as external writes with identifiers
- CI failures were investigated rather than merely re-run, or the remaining diagnosis is explicit
- release evidence follows the repository's version/changelog policy
- security alerts are summarized without leaking sensitive data and have a clear owner or handoff
