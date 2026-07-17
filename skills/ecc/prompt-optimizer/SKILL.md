---
name: prompt-optimizer
description: Analyze, clarify, and rewrite a draft prompt into a ready-to-paste request with explicit context, scope, safety boundaries, acceptance criteria, and verification. Use for requests such as “optimize this prompt,” “rewrite my prompt,” “このpromptを改善して,” “promptの書き方を手伝って,” or “优化prompt.” Advisory only: do not trigger when the user wants the underlying task executed directly, asks to optimize code or performance, or requests configuration or skill inventory rather than prompt wording.
---

# Prompt Optimizer

Produce a better prompt; do not execute the prompt's underlying task.

## Preserve the advisory boundary

- Read and analyze by default. Do not edit project files, run implementation commands, call live APIs, deploy, send messages, or mutate external systems.
- If the user says “just do it” or otherwise requests execution, leave this skill and handle the request as a normal task instead of pretending optimization completed it.
- Do not copy secrets, tokens, cookies, credentials, private data, or live payloads into the optimized prompt. Replace them with named placeholders and require injection from an environment variable or secret store with masked logs.
- Save the optimized prompt to a file only when the user explicitly requests that artifact. Preview the target and content first when the write is cross-project, external, or otherwise approval-gated.

## Restore only relevant project context

For a repository-specific prompt:

1. Read the current `AGENTS.md`, `PROJECT.md`, `README.md`, and the minimum context-reading or docs-management guide they require.
2. If compaction, session movement, or handoff occurred, reread the current task and completion boundary from disk before analyzing the prompt.
3. Inspect only the manifests, reference files, or source paths needed to resolve material unknowns. Do not make a vendor-specific instruction file, command catalog, fixed agent catalog, or particular model name the default.
4. On Windows, prefer `rg` and PowerShell reads with `-LiteralPath`; preserve drive-letter paths and avoid broad recursive scans outside the selected project.

If project access is unavailable or unnecessary, mark repository facts as unknown rather than inventing them.

## Optimize in six passes

1. **Intent:** preserve the requested outcome, reader, and desired deliverable. Separate the task from background commentary.
2. **Scope:** name targets, exclusions, constraints, and assumptions. Keep explicit non-goals from the draft.
3. **Context:** include only facts the executor needs. Cite project source-of-truth paths instead of duplicating long policies.
4. **Execution boundary:** distinguish read-only discovery, fake or dry-run validation, reversible workspace changes, and approval-gated effects such as network writes, real data changes, deploys, credential use, deletion, push, or publication.
5. **Acceptance and evidence:** state artifacts, expected behavior, tests or checks, failure handling, and the evidence required before completion.
6. **Recovery:** for long or multi-session work, require current state in the project's task file, finished evidence in its completion record, and a handoff with the exact next step when work stops.

Use [references/optimization-checklist.md](references/optimization-checklist.md) only for technical, multi-step, high-risk, or underspecified prompts that need a fuller diagnostic or template. Do not load it for a simple wording cleanup.

## Ask only material questions

Ask at most three short clarification questions when answers would materially change scope, safety, architecture, or acceptance. Otherwise make a conservative assumption, label it, and produce the optimized prompt in the current turn.

Never invent a slash command, agent, skill, plugin, model version, test command, or project path. Recommend only capabilities verified in the current environment or named by the project's source-of-truth files. Express the step generically when availability is unknown.

## Output

Respond in the user's language. Prefer:

1. a brief diagnosis of the most consequential gaps;
2. one self-contained optimized prompt in a fenced code block;
3. an optional compact version when it is genuinely useful;
4. a short note listing assumptions or decisions still required.

The ready-to-paste prompt should normally contain:

- objective and deliverable;
- authoritative context and target paths;
- scope and explicit non-goals;
- execution and approval boundaries;
- acceptance criteria and verification;
- task-state, stop, and handoff expectations for long work.

## Stop and completion

Stop and request direction when the source prompt is missing, two plausible intents conflict, a required secret or private payload is embedded, or a material irreversible effect lacks an approval boundary.

Finish only when the optimized prompt preserves the original intent, resolves or labels material gaps, names no unverified capability, separates dry-run from live effects, protects secrets, and defines observable completion evidence.
