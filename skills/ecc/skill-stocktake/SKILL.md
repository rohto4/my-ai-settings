---
name: skill-stocktake
description: Audit a Codex skill library or selected profile for trigger quality, frontmatter validity, context cost, stale technology, unsafe instructions, duplication, and missing validation. Use for a quick changed-skill review or a full skill-set stocktake. Treat retention priority as metadata, not an automatic deletion queue.
---

# Skill Stocktake

Audit the actual files and produce actionable findings. Keep the mother set intact unless the user explicitly asks to remove skills.

## Choose scope

- Quick scan: changed or newly added skill folders.
- Profile scan: skills named by one profile manifest.
- Full stocktake: every folder under the selected `.agents/skills` root.

Resolve the exact root before scanning. Do not mix repo, user, system, and plugin skills without labeling their sources.

## Structural checks

For every skill, verify:

1. Folder name is lowercase hyphen-case.
2. `SKILL.md` exists and begins with YAML frontmatter.
3. `name` matches the folder and is unique.
4. `description` states the job, positive triggers, and important non-triggers.
5. No template TODO remains.
6. Referenced scripts and files exist.
7. Scripts have a realistic test path.
8. `agents/openai.yaml`, when present, matches the skill and names `$skill-name` in `default_prompt`.

## Quality checks

Assess each skill for:

- Trigger precision and overlap with other skills.
- Context cost, repeated general knowledge, and oversized inline examples.
- Correct degree of freedom for the task's fragility.
- Current framework, API, model, and CLI assumptions.
- Shell and OS assumptions relative to the target profile.
- Claude-specific tools, paths, or memory concepts in a Codex profile.
- Secret handling, destructive commands, external writes, and approval gates.
- Inputs, outputs, stop conditions, and completion evidence.
- Progressive disclosure through `references/`, `scripts/`, and `assets/`.

## Score and prioritize

Use four priorities:

- P0: unsafe, invalid, or predictably wrong when triggered.
- P1: high-frequency skill with material accuracy or staleness risk.
- P2: useful quality, overlap, or context-cost improvement.
- P3: wording, examples, or optional metadata.

Record importance and frequency separately from validity. A low-frequency skill can remain in the mother set while being disabled in a project profile.

## Output

Lead with findings and evidence. Include:

- counts for scanned, invalid, stale-risk, oversized, and missing-metadata skills,
- file-level findings with priority and reason,
- recommended profile changes,
- a bounded next revision batch,
- checks that prove the batch is complete.

Do not claim a full stocktake from a sample. Do not recommend deletion solely because a skill is currently inactive.
