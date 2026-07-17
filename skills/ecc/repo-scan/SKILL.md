---
name: repo-scan
description: Perform a read-only repository inventory with evidence for ownership, generated or vendored assets, module responsibility, dependencies, and structural risk. Use for broad scans and keep/consolidate/isolate decisions, not targeted review, installation, or file mutation.
---

# Repository Scan

Audit repository contents without changing them. `codebase-onboarding` explains how to work in a repository; security review skills handle vulnerability-focused requests; this skill inventories ownership and structural risk.

## Restore project truth

1. Read the target project's `AGENTS.md`, `PROJECT.md`, `README.md`, and its minimum context-reading guide.
2. Read the current task, exclusions, and prior completion boundary when the project policy requires them.
3. After compaction, session movement, or handoff, reread those files from disk before resuming. Do not infer current scope from a summary alone.
4. For long scans, keep scope, exclusions, completed stages, evidence locations, and the next stage in the project's designated task or handoff record. Do not mix finished evidence back into an active task list.

## Fix the scope and safety boundary

Resolve the exact repository root or subpath, the question to answer, scan depth, exclusions, and output location. Confirm any drive-letter or worktree boundary before scanning.

Default to read-only and offline:

- Do not edit, delete, move, install, build, execute project code, fetch a remote, or run an external scanner unless separately requested and authorized.
- Do not recurse into sibling projects, user profiles, dependency caches, backups, external clones, `.git` object storage, or hidden credential stores unless explicitly in scope.
- Do not open or print secret values, environment files, tokens, cookies, keys, credentials, or private data bodies. Record only the path and classification when necessary.
- Treat an existing scanner as optional evidence only after checking provenance. Use its dry-run or report-only mode first when available.

On Windows, prefer `rg --files` and `rg` for bounded discovery. Use PowerShell `Resolve-Path -LiteralPath`, `Get-ChildItem -LiteralPath`, and `Get-Content -Raw -Encoding UTF8 -LiteralPath` for paths requiring literal handling. Preserve drive letters, keep enumeration and interpretation in the same shell, and never pass enumerated paths into another shell for mutation.

## Scan in stages

1. **Surface:** manifests, top-level directories, bounded file counts, sizes, and obvious generated or dependency roots.
2. **Module:** responsibility, ownership signals, public interfaces, consumers, and dependency direction.
3. **Focused:** selected source, tests, licenses, version markers, generated headers, and update paths.
4. **Deep:** full-file review only for flagged modules or an explicitly requested exhaustive audit.

Start with a dry-run inventory that reports intended roots, exclusions, likely cost, and files requiring content inspection. Stop expanding when the next stage does not answer the user's question.

## Classify with evidence

- project-owned source;
- generated source or build output;
- declared dependency;
- embedded or vendored third-party code;
- copied example, fixture, or template;
- binary or large asset;
- obsolete, duplicated, or ownership-unknown material.

Do not infer ownership from a directory name alone. Check licenses, headers, manifests, upstream or generator markers, history when available, and code similarity only within the authorized scope.

For each material module, inspect responsibility, owner, consumers, dependencies, source-to-test relationship, data/configuration ownership, overlap, update path, and maintenance or replacement risk.

Assign a disposition only with evidence:

- **Keep:** clear owner and current value.
- **Consolidate:** duplicated responsibility with a viable target owner.
- **Isolate:** third-party or unstable boundary needs containment.
- **Regenerate or restore:** checked-in output has a reliable source process.
- **Investigate:** evidence is insufficient.
- **Retire candidate:** no current consumer and a later removal can be verified.

`Retire candidate` is a recommendation, not deletion authorization.

## Stop and hand off

Stop and report rather than widening or mutating when:

- the repository root, ownership, or exclusions are ambiguous;
- the scan reaches a secret/private-data boundary or denied path;
- generated, vendored, binary, or very large content makes exhaustive reading disproportionate;
- an external tool, network fetch, build, or write is needed for stronger evidence;
- findings would require removal, migration, or another project to validate.

The handoff must include completed stages, counts and method, inspected/excluded paths, evidence gathered, unknowns, and the exact next safe stage.

## Report and completion evidence

Use [references/scan-report.md](references/scan-report.md) for a durable report. Lead with high-impact findings. Separate observed facts, inferences, and recommendations.

Report:

- resolved root, depth, exclusions, commands or methods, and limitations;
- counts with the counting method and whether generated/dependency roots were excluded;
- module-level evidence and disposition confidence;
- unreadable, secret-bearing, binary, or unscanned areas without exposing their contents;
- files changed, which should be none unless the user explicitly requested a report artifact or project policy required task-state maintenance;
- verification of report paths, row/module counts, links, and UTF-8 when an artifact was created;
- remaining risks and approval-gated next steps.

Complete only when the requested scope is covered, every material disposition cites evidence, unknowns and exclusions are explicit, and no mutation or external effect was performed beyond the authorized report/task artifact.
