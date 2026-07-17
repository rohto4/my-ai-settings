---
name: codebase-onboarding
description: Map an unfamiliar codebase's architecture, entry points, conventions, workflows, and risks. Use when joining or orienting within a repository.
---

# Codebase Onboarding

Build an evidence-backed map of an unfamiliar repository without reading every file or generating new project rules by default.

Keep onboarding read-only unless the user explicitly requests a durable
artifact. Do not install dependencies, run deployment, create project files,
or call write-capable external services merely to understand the repository.

## 1. Read authority first

Locate and read the repository's `AGENTS.md`, `PROJECT.md`, README, current task files, and documented build or verification entrypoints. Nested instructions apply to their subtree. Existing project instructions outrank inferred conventions.

Do not create `AGENTS.md`, tool-specific instruction files, or an onboarding document unless the user asks for a durable artifact. Onboarding and instruction authoring are separate tasks.

## 2. Reconnoiter cheaply

Use `rg --files` and targeted reads before broad traversal. If `rg` is unavailable on Windows, use targeted `Get-ChildItem` and `Select-String` commands. Identify:

- project root and workspace boundaries,
- language, package, and runtime manifests,
- lockfiles and version constraints,
- apps, services, packages, workers, plugins, and infrastructure,
- primary executable, request, job, and test entrypoints,
- schema, migration, API, event, and configuration sources of truth,
- CI, build, test, deploy, and local-development commands.

Ignore dependency caches, generated output, binaries, vendored code, and build artifacts unless they are part of the question.

## 3. Trace representative flows

Choose one or two flows that expose the architecture. Trace them from entry to outcome:

- user request to UI, API, domain rule, storage, and response,
- event or queue input to worker and side effect,
- configuration change to runtime behavior,
- test fixture to exercised production path.

Record precise paths. Distinguish observed calls from inferred relationships.

## 4. Detect conventions from repeated evidence

Inspect several representative modules and tests before naming a convention. Cover:

- ownership and dependency direction,
- naming and file layout,
- validation, errors, logging, and transactions,
- state and data-access patterns,
- test placement, fixtures, and verification commands,
- Git or release conventions only when history is sufficient.

Label one-off patterns and ambiguous areas as unknown. Do not turn accidental code into guidance.

## 5. Report for action

Use [references/onboarding-map.md](references/onboarding-map.md) when a durable guide is requested. Otherwise provide a compact answer with:

1. what the repository does,
2. authoritative starting files,
3. architecture and ownership map,
4. representative flows,
5. exact development and verification commands,
6. conventions to follow,
7. risks, unknowns, and best first task.

Do not copy the README or list every dependency. The result should help the next change land in the correct owner with the correct checks.

Stop and label the gap when the repository root, nested instruction scope,
authoritative task, generated/source boundary, or safe verification command
cannot be established. Do not guess a convention from one file or use a
conversation summary in place of the current files on disk.
