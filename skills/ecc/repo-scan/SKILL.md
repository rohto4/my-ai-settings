---
name: repo-scan
description: Audit a repository's source assets, modules, embedded dependencies, and ownership signals. Use for broad inventory and actionable module-level findings.
---

# Repository Scan

Perform a read-only, cross-stack inventory of source ownership and structural risk. This skill audits repository contents; `codebase-onboarding` explains how to work in the repository, and `workspace-surface-audit` audits Codex capabilities around it.

## Scope first

Resolve the exact repository or subpath and the question being answered. Record exclusions. Do not recurse into sibling projects, user home, dependency caches, backups, hidden credential stores, or external clones unless explicitly in scope.

Use a staged scan:

1. Surface: manifests, top-level directories, file counts and sizes.
2. Module: ownership, public interfaces, and dependency direction.
3. Focused: selected source, tests, licenses, version markers, and generated headers.
4. Deep: full-file review only for flagged modules or explicit exhaustive audits.

## Classify assets

Classify with evidence:

- project-owned source,
- generated source or build output,
- declared dependency,
- embedded or vendored third-party code,
- copied example, fixture, or template,
- binary or large asset,
- obsolete, duplicated, or ownership-unknown material.

Do not infer third-party ownership from a directory name alone. Check license files, headers, package manifests, upstream markers, history, and code similarity where available.

## Assess modules

For each material module, inspect:

- product or runtime responsibility,
- owner and active consumers,
- inbound and outbound dependencies,
- source-to-test relationship,
- data and configuration ownership,
- duplication or wrapper overlap,
- generated or vendored update path,
- maintenance, security, and replacement risk.

Assign a disposition only with evidence:

- Keep: clear owner and current value.
- Consolidate: duplicated responsibility with a viable target owner.
- Isolate: third-party or unstable boundary needs containment.
- Regenerate or restore: checked-in output has a reliable source process.
- Investigate: evidence is insufficient.
- Retire candidate: no current consumer and removal can be verified.

This audit never deletes or moves files.

## Output

Use [references/scan-report.md](references/scan-report.md) for a durable report. Lead with high-impact findings and include counts with their method. Separate observed facts, inferences, and recommendations.

When an external scanner is already installed and trusted, it may provide evidence. Do not install or execute third-party audit code solely because this skill mentions it; inspect provenance and get required approval first.
