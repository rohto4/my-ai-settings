---
name: continuous-learning-v2
description: Build evidence-backed, project-scoped instincts from Codex work using documented tool lifecycle hooks, privacy-preserving observation metadata, confidence scoring, and an explicit review/promotion workflow. Use when installing PreToolUse/PostToolUse observation, reviewing repeated workflows or corrections, managing project and global instincts, or evolving confirmed instincts into reusable guidance.
---

# Continuous Learning v2

Separate deterministic observation from judgment. Hooks record bounded metadata; Codex and the user
review current conversation plus repository evidence before an instinct is created or promoted.

## Storage

Resolve `CODEX_HOME` first. The default is `%USERPROFILE%\.codex` on Windows and `~/.codex`
elsewhere. This skill owns:

```text
<CODEX_HOME>/continuous-learning-v2/
├── projects.json
├── observations.jsonl                 # no-project fallback
├── instincts/{personal,inherited}/    # reviewed global instincts
├── evolved/{skills,commands,agents}/
└── projects/<project-id>/
    ├── project.json
    ├── observations.jsonl
    ├── observations.archive/
    ├── instincts/{personal,inherited}/
    └── evolved/{skills,commands,agents}/
```

Do not write into `~/.codex/memories/`; Codex owns that generated state.

## Observation contract

The bundled Node hook accepts documented `PreToolUse` and `PostToolUse` input fields. It stores:

- event name, timestamp, model, and hashed session/turn references;
- canonical tool name and hashed tool-call reference;
- bounded input key names, response type/key names, and `isError` when present;
- project ID derived from git remote or resolved repository root.

It does not store command text, patches, MCP arguments, tool output, prompts, transcript content,
tokens, cookies, the raw project root/remote, or the full working directory. Sensitive-looking key
names are replaced with `[sensitive-key]`. This makes observations useful for repeated workflow
frequency while keeping semantic learning dependent on explicit review.

## Install observation hooks

1. Resolve this skill's absolute runtime path and a Node.js 18+ executable.
2. Review `config.json`; observation is enabled by default because payload capture is disabled.
   Missing or invalid config fails closed and records nothing.
3. Add both events to one user-level `hooks.json` or a trusted project's `.codex/hooks.json`.
   Substitute verified absolute paths:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node /absolute/path/to/continuous-learning-v2/hooks/observe.mjs",
            "commandWindows": "\"C:\\absolute\\node.exe\" \"C:\\absolute\\continuous-learning-v2\\hooks\\observe.mjs\"",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node /absolute/path/to/continuous-learning-v2/hooks/observe.mjs",
            "commandWindows": "\"C:\\absolute\\node.exe\" \"C:\\absolute\\continuous-learning-v2\\hooks\\observe.mjs\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

4. Prefer one hook representation per config layer.
5. Use `/hooks` in Codex CLI to inspect and trust the exact non-managed definitions.
6. Test with a temporary `CODEX_HOME`, then read back one JSONL line and confirm that no payload
   value was retained.

The hook serializes registry and JSONL writes with a short cross-platform lock and uses atomic JSON
replacement. If the lock cannot be obtained within three seconds it records nothing rather than
risking state corruption. Hooks can also miss unsupported tool paths; treat counts as evidence,
not complete telemetry.

## Create an instinct

Use an instinct only for a repeatable behavior with evidence. Strong candidates include explicit
user corrections, repeated successful workflows, and verified error-resolution patterns.

1. Read the current project's recent observation metadata.
2. Re-read the repository evidence and relevant conversation; metadata alone cannot establish a
   semantic rule.
3. Draft one atomic instinct:

```yaml
---
id: prefer-explicit-errors
trigger: "when returning domain failures"
confidence: 0.6
domain: "error-handling"
source: "reviewed-session-evidence"
scope: project
project_id: "<project-id>"
project_name: "<project-name>"
---

# Prefer explicit errors

## Action
Return a typed domain error instead of a silent fallback.

## Evidence
- User correction and passing regression test on YYYY-MM-DD.
```

4. Show trigger, action, evidence, confidence, and scope to the user.
5. After confirmation, write the YAML under the matching project or global `instincts/personal/`
   directory. Use a filename derived from the validated ID.
6. Read the file back and run status.

Do not infer user preference from lack of correction. Do not raise confidence without new evidence.

## Manage instincts

Resolve `<skill-dir>` from this loaded skill, then use:

```text
python "<skill-dir>/scripts/instinct-cli.py" status
python "<skill-dir>/scripts/instinct-cli.py" projects
python "<skill-dir>/scripts/instinct-cli.py" evolve
python "<skill-dir>/scripts/instinct-cli.py" promote --dry-run
python "<skill-dir>/scripts/instinct-cli.py" export <destination>
python "<skill-dir>/scripts/instinct-cli.py" import <source>
```

Run `promote` without `--dry-run`, imports, exports, or generated-skill writes only after verifying
their absolute paths and obtaining the authorization appropriate to that side effect. Treat evolved
artifacts as candidates until they pass the normal skill review and validation process.

## Scope and confidence

- Keep framework, code-style, file-layout, and repository workflow instincts project-scoped.
- Promote security and genuinely cross-project operating rules only with evidence from at least two
  projects.
- Use 0.3 for tentative, 0.5 for moderate, 0.7 for strong, and 0.9 only for repeatedly confirmed
  behavior.
- Decrease confidence or retire an instinct when contradictory evidence appears.

## Completion

Report hook source and trust status, observation path, payload-privacy check, instincts created or
changed, evidence and scope, CLI validation, and anything left pending. State explicitly when the
evidence was insufficient to create an instinct.
