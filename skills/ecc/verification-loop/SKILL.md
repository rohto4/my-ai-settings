---
name: verification-loop
description: Verify changes with project-defined build, type, lint, test, security, diff, and runtime evidence. Use before claiming implementation or refactoring complete.
---

# Verification Loop

Prove the requested behavior at the same scope as the change. Treat a green but unrelated command as weak evidence.

## 1. Load project rules

Read `AGENTS.md`, `PROJECT.md`, the current task files, and the repository's documented verification commands. On Windows, prefer PowerShell and UTF-8-safe commands.

Preserve user changes. Never use reset, checkout, clean, or broad deletion to make verification pass.

## 2. Build the verification matrix

Map every acceptance criterion to direct evidence before running commands.

| Requirement | Evidence | Command or inspection | Status |
| --- | --- | --- | --- |
| Behavior | Focused test or runtime action | project-specific | pending |
| Contract | Type/schema/API check | project-specific | pending |
| Regression | Relevant suite | project-specific | pending |
| Integration | E2E, browser, service, or data check | project-specific | pending |
| Documentation | Source-of-truth inspection | file read/diff | pending |

Mark missing evidence as missing. Do not silently substitute a narrower check.

## 3. Detect the repository toolchain

Use project docs first, then inspect manifests and lockfiles.

| Signal | Preferred runner |
| --- | --- |
| `bun.lock` or `bun.lockb` | `bun run` |
| `pnpm-lock.yaml` | `pnpm run` |
| `yarn.lock` | `yarn` |
| `package-lock.json` | `npm run` |
| `pyproject.toml` | documented Python, `uv run`, or `python -m` |
| `Cargo.toml` | `cargo` |
| `go.mod` | `go` |

Inspect declared scripts instead of inventing command names. In a monorepo, identify the affected package and the root orchestration command.

## 4. Run checks from narrow to broad

1. Run the cheapest focused check that can fail for the changed behavior.
2. Run type or schema checks for affected contracts.
3. Run lint or static analysis for affected paths.
4. Run affected unit and integration tests.
5. Run build checks where compilation or bundling changed.
6. Run E2E, browser, service, migration, or manual checks when the user-visible workflow changed.
7. Run the broader regression suite when blast radius justifies it.
8. Inspect `git diff --check`, `git diff --stat`, and the final diff.

Fix a failure before relying on later checks. If a failure is pre-existing, prove that with baseline or path-specific evidence and report it separately.

## 5. Apply risk-specific gates

- Authentication or permissions: test allow, deny, scope, and cross-tenant cases.
- Database changes: inspect generated SQL, forward migration, compatibility window, and rollback or roll-forward path.
- External integrations: test timeout, retry, idempotency, duplicate delivery, and unavailable dependency behavior.
- UI changes: verify desktop and mobile layout, loading, empty, error, keyboard, and accessibility states.
- AI behavior: run stable examples or evals that cover expected output and unacceptable regressions.
- Secrets and dependencies: use the repository's approved scanners; do not print secret values.

Coverage targets come from the project. Never invent a universal percentage.

## 6. Report evidence

Use this compact format:

```text
Verification result
- Requirement: pass | fail | not run - evidence
- Focused tests: command and result
- Static checks: command and result
- Build/runtime: command and result
- Broader regression: command and result
- Residual risk: concrete unverified surface or none
```

Only claim completion when every required item has direct evidence. State commands that could not run and why.
