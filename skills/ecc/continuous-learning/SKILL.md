---
name: continuous-learning
description: Capture reviewable learning candidates from Codex turn completion and curate validated lessons into the correct durable source. Use when installing a conservative Stop hook, reviewing locally queued outcomes, extracting a lesson from a correction or resolved failure, or deciding whether a lesson belongs in AGENTS.md, project docs, a skill, or nowhere.
---

# Continuous Learning

Use a conservative two-stage workflow: capture a local candidate, then let a human review the
lesson before changing durable guidance. Never auto-create or auto-enable skills from raw chat data.

## Storage and evidence boundary

The bundled Stop hook uses only documented Codex fields:

- `session_id`
- `turn_id`
- `cwd`
- `model`
- `stop_hook_active`
- `last_assistant_message`

It does not parse `transcript_path`; that path is convenient, but its file format is not a stable
hook interface.

Candidates are stored outside repositories under:

```text
%CODEX_HOME%\continuous-learning\candidates\
```

or under `%USERPROFILE%\.codex\continuous-learning\candidates\` when `CODEX_HOME` is unset.
The hook is disabled by default in `config.json` so installation alone never starts retaining turn
content. `CODEX_CONTINUOUS_LEARNING=1` enables it for the current process and is useful for a
disposable test without editing the runtime copy.

## Install the optional Stop hook

1. Resolve this skill's absolute runtime path and a Node.js 18+ executable. On Windows, if `node`
   is absent from `PATH`, use the workspace dependency runtime discovery and put the verified
   absolute `node.exe` path in `commandWindows`; do not install or guess a runtime path.
2. Review `config.json`. Enabling capture means the final assistant message is retained locally
   after basic secret redaction and length limiting.
3. Add an absolute command to the user-level `hooks.json` or a trusted project's
   `.codex/hooks.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node /absolute/path/to/continuous-learning/hooks/stop-candidate.mjs",
            "commandWindows": "\"C:\\absolute\\node.exe\" \"C:\\absolute\\continuous-learning\\hooks\\stop-candidate.mjs\"",
            "timeout": 10,
            "statusMessage": "Capturing a learning candidate"
          }
        ]
      }
    ]
  }
}
```

4. Prefer one hook representation per config layer.
5. Use `/hooks` in Codex CLI to inspect and trust the exact non-managed hook definition.
6. Send a disposable test turn with a temporary `CODEX_HOME`, then verify one candidate and its
   redaction before enabling capture in normal work.

The hook exits with valid JSON and does not continue or block the turn. It skips recursive Stop
continuations when `stop_hook_active` is true.

The hook redacts common token/password forms, truncates long text, and hashes only the redacted,
stored form for deduplication. It cannot prove that arbitrary prose contains no personal or
confidential information. Keep capture disabled when a message may contain unknown secret formats
or personal data; use the manual extraction workflow instead.

## Review candidates

For each candidate:

1. Verify the source project and date.
2. Reconstruct the claim from current repository evidence; do not trust the captured message alone.
3. Classify the lesson:
   - repeatable correction;
   - verified failure and fix;
   - stable project convention;
   - temporary workaround;
   - one-off result or noise.
4. Reject candidates that contain secrets, personal data, unverified causal claims, or only a
   one-time outcome.
5. Draft one short trigger, one action, evidence, and scope.
6. Ask for confirmation before changing a durable source.

## Choose the durable destination

Use the narrowest source that owns the rule:

| Lesson | Destination |
| --- | --- |
| Required repository convention | `AGENTS.md` or checked-in project docs |
| Active implementation state | `docs/imp/*` task source |
| Reusable multi-step workflow | Existing canonical skill or a new reviewed skill |
| Personal recall that need not be enforced | Codex memory controls, not this hook |
| Temporary or weakly supported observation | Keep pending or reject |

Do not write directly into `~/.codex/memories/`; Codex owns that generated store. Do not publish a
candidate to `G:\knowledge-vault` without first following that vault's write policy.

## Manual extraction without the hook

When the user explicitly asks to learn from the current work, skip capture and review the current
conversation plus repository evidence directly. Present the proposed trigger, action, evidence,
scope, and destination. Write only after approval.

## Completion

Report the candidate reviewed, disposition, durable destination, evidence checked, files changed,
validation performed, and any rejected or pending item. State explicitly when no durable lesson was
found.
