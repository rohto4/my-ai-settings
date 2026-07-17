---
name: context-budget
description: Audit context use across instructions, skills, tools, and task history. Use when prompt bloat, skill omission, compaction, or declining agent focus needs diagnosis.
---

# Context Budget

Measure what the current Codex task must carry, then reduce avoidable context without deleting the reusable mother set.

## Boundaries

- This skill measures and recommends. It does not compact the task; use `strategic-compact` for recovery preparation.
- Do not invent exact token costs for hidden system instructions or tool schemas.
- Do not treat disk size as loaded context. Distinguish discoverable metadata, selected skill bodies, tool output, and unread files.
- Do not solve a project profile problem by deleting source skills.

## Workflow

### 1. Resolve the active scope

Read the repository instructions and current task files. Identify the current workspace, selected profile, task phase, and required tools. Use current-session capability data when available rather than assuming which plugins, apps, MCP servers, or skills are loaded.

### 2. Inventory context surfaces

Measure only surfaces that can affect this task:

| Surface | Evidence |
| --- | --- |
| Durable instructions | `AGENTS.md`, nested instructions, project config guidance |
| Skill discovery | name, description, and path for discoverable skills |
| Selected workflows | full bodies and references of invoked skills |
| Task state | plan, current task, user decisions, handoff notes |
| Tool context | callable tools and schemas exposed in this session |
| Working evidence | file reads, search results, logs, diffs, screenshots |
| Conversation history | prior decisions and accumulated task output |

For local files, report characters, lines, and approximate tokens only as estimates. State the estimation method. For Codex product limits, verify current official documentation before quoting a number.

### 3. Classify cost and value

Classify each item:

- Required now: directly changes current decisions or execution.
- Required for recovery: needed after compaction or session transfer.
- Discoverable on demand: keep on disk but do not load now.
- Duplicate: restates an authoritative source without adding routing value.
- Stale or conflicting: contradicts the current source of truth.
- Unknown: loading behavior cannot be confirmed from current evidence.

### 4. Find correctness risks

Prioritize issues that can change behavior, not only large files:

- overlapping skill descriptions that trigger the wrong workflow,
- too many profile skills competing for discovery budget,
- long selected skill bodies containing generic knowledge,
- repeated policy tables across `AGENTS.md`, skills, and docs,
- tool output retained after its decision value expires,
- old plans or handoffs conflicting with current task state,
- hidden assumptions about unavailable tools.

### 5. Recommend reversible changes

Prefer, in order:

1. Shorten and front-load skill descriptions.
2. Split project core and task-specific additions into profiles.
3. Move detailed examples and version-specific facts into `references/`.
4. Keep canonical policy in one file and replace copies with routing instructions.
5. Summarize completed exploration into a plan or task artifact before compaction.
6. Disable or omit a skill in a project profile; keep it in the mother set.

## Output

```text
Context budget
- Scope and task phase
- Confirmed loaded or discoverable surfaces
- Largest costs with measurement method
- Trigger conflicts and stale-context risks
- Keep now / load on demand / profile out / rewrite
- Expected benefit and verification step
- Unknowns that could not be measured
```

Do not promise a token saving that was not measured. Re-run the same inventory after changes and compare like for like.
