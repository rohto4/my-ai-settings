---
name: search-first
description: Search existing code, tools, libraries, and established patterns before building custom behavior. Use when reuse or current ecosystem facts may change the approach; do not use to reopen an approved choice or for a trivial local edit with an explicit owner and pattern.
---

# Search First

Decide whether to reuse, adopt, wrap, compose, or build only after checking the current repository and relevant external ecosystem.

Use `documentation-lookup` when the target library is already known and only its current API is uncertain. Use `oss-adoption-planning` when adoption changes product ownership, data authority, operations, or exit strategy.

Do not use this skill to reopen an approved implementation choice or for a purely local edit whose owner and pattern are already explicit. It recommends reuse or adoption; it does not itself authorize installation, external writes, deployment, or account changes.

## 1. Define the need

Before searching, state:

- required behavior and user outcome,
- language, runtime, framework, and platform constraints,
- security, license, data, performance, and deployment constraints,
- acceptable dependency and operational cost,
- explicit non-goals.

Without this contract, popularity rankings are not evidence of fit.

## 2. Search the repository first

Use `rg` and manifests to find. If `rg` is unavailable on Windows, use targeted `Get-ChildItem` and `Select-String` commands instead:

- existing implementations, helpers, adapters, and tests,
- transitive or already-installed dependencies,
- approved patterns and architecture decisions,
- abandoned attempts and their reasons,
- extension points in existing libraries or services.

Prefer an established local owner when it meets the need. Do not duplicate behavior under a new name.

## 3. Search current primary sources

Discover and use the available search, docs, repository, or package-registry tools. Check official sources for:

- maintained packages and native platform features,
- current releases and compatibility,
- license and governance,
- security advisories and support status,
- extension and integration contracts,
- migration, export, and replacement paths.

Do not assume a researcher agent, MCP server, package registry, or web tool exists. Use only capabilities exposed in the current session. Browse when the facts are current or the user explicitly requests research.

## 4. Compare candidates

Evaluate the smallest credible set against the need:

| Dimension | Question |
| --- | --- |
| Functional fit | Does it satisfy the required behavior without major distortion? |
| Stack fit | Does it support the pinned runtime and architecture? |
| Maintenance | Is the relevant version supported and actively maintained? |
| Security and license | Are obligations and known risks acceptable? |
| Integration cost | What adapters, permissions, data flows, and tests are required? |
| Operational cost | What new service, build, deploy, or monitoring burden appears? |
| Exit path | Can data and behavior be migrated or replaced? |
| Local consistency | Does it align with existing project patterns and ownership? |

Stars, download counts, and permissive licenses are supporting signals, not adoption decisions.

## 5. Decide and verify

- Reuse local: existing code or dependency already owns the behavior.
- Adopt: candidate fits with minimal adaptation and acceptable lifecycle risk.
- Wrap: a thin boundary protects project contracts from vendor specifics.
- Compose: a small number of stable components have clear ownership.
- Build: no candidate meets critical constraints, and custom ownership is justified.
- Defer or experiment: evidence is insufficient or integration risk is high.

For adoption, name the pinned version, official evidence date, integration boundary, validation spike, and rollback or removal path. Do not install or modify the repository until the user request authorizes implementation.

When an authorized spike touches an external API, start with fake HTTP, a sandbox, or dry-run. Keep real tokens, live writes, push, deploy, and external updates behind a separate explicit gate. Do not start subagents or parallel agents unless the user or the target PJ's rules explicitly require them.

On Windows, keep path checks and file operations in PowerShell, use `-LiteralPath`, verify resolved drive-letter paths before recursive move/delete, and do not pass enumerated paths across shells.

## Output

Lead with the recommendation, then show repository findings, candidate comparison, rejected options, current-source links, implementation impact, and the test that would validate the choice.

The search is complete when the local owner has been checked, current primary evidence covers the viable candidates, the recommendation names its evidence date and exit path, and unresolved adoption risks are explicit. For long-running work, recover state from `AGENTS.md`, `PROJECT.md`, and the PJ task file rather than conversation summary alone.
