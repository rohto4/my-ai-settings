---
name: ck
description: Keep explicit, project-scoped working context across Codex sessions with deterministic Node.js commands and an optional documented SessionStart hook. Use when registering a project, saving or resuming handoff state, listing tracked projects, checking stale context, or installing the ck hook without relying on transcript internals or Codex-generated memories.
---

# Context Keeper

Keep a small user-owned context record for each project. Treat repository docs such as
`AGENTS.md`, `PROJECT.md`, and `docs/imp/*` as the authoritative project state; use ck as a
portable briefing and handoff aid, not as their replacement.

## Resolve runtime paths

Resolve `<skill-dir>` from this loaded `SKILL.md`. Do not assume the canonical G-drive copy has
already been synchronized to the runtime.

Use the current Node.js 18+ executable. On Windows, prefer the bundled Codex Node runtime when
`node` is unavailable on `PATH`.

Before piping non-ASCII JSON from Windows PowerShell 5.1 to Node, set the native-process encoding
for that shell session. Otherwise Japanese text is replaced with `?` before ck receives it:

```powershell
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom
```

Use `ConvertTo-Json -Compress` and pipe the resulting string from the same PowerShell process.
Do not hand-build JSON with shell escaping.

ck stores its own state under:

```text
%CODEX_HOME%\ck\                    # when CODEX_HOME is set
%USERPROFILE%\.codex\ck\            # default on Windows
~/.codex/ck/                         # default on macOS/Linux
├── projects.json
├── current-session.json
└── contexts/<project>/
    ├── context.json                 # source of truth
    └── CONTEXT.md                   # generated view
```

Do not write into `~/.codex/memories/`; Codex owns that generated store.

## Actions

### Register the current project

1. Run `node "<skill-dir>/commands/init.mjs"` from the project root.
2. Show the detected name, description, stack, goal, constraints, and repository.
3. Let the user correct the draft.
4. After confirmation, pipe the exact JSON to `node "<skill-dir>/commands/save.mjs" --init`.

Required JSON fields are `name` and `path`. Pass arrays for `stack` and `constraints`.

### Save a session checkpoint

Summarize only durable state from the current work:

- `summary`: one sentence
- `leftOff`: exact file, feature, or decision point
- `nextSteps`: ordered concrete actions
- `decisions`: objects with `what` and `why`
- `blockers`: unresolved blockers only
- `goal`: include only when it changed

Show the draft and obtain confirmation before piping JSON to
`node "<skill-dir>/commands/save.mjs"`.

### Resume, inspect, or list

- Resume: `node "<skill-dir>/commands/resume.mjs" [name-or-number]`
- Quick snapshot: `node "<skill-dir>/commands/info.mjs" [name-or-number]`
- Portfolio: `node "<skill-dir>/commands/list.mjs"`

Display stdout without inventing missing state. After resume, reread the target repository's
actual initialization and task files before continuing work.

### Forget a project

This recursively removes one ck context directory. First resolve and display the project, then
obtain explicit confirmation naming that project. Execute only after confirmation:

```text
node "<skill-dir>/commands/forget.mjs" <name-or-number> --confirm <registered-name>
```

The script independently checks the confirmation and verifies that the resolved deletion target
stays under the ck contexts directory.

### Migrate legacy ck data

Always preview with `node "<skill-dir>/commands/migrate.mjs" --dry-run`. Run without
`--dry-run` only after reviewing the preview. Migration backs up legacy metadata.

## Optional SessionStart hook

Codex supports `SessionStart` with `startup`, `resume`, `clear`, and `compact` sources. The bundled
hook reads only documented fields (`session_id`, `cwd`, `source`) and returns
`hookSpecificOutput.additionalContext`; it does not parse the transcript.

Add one absolute command to either the user-level `hooks.json` or a trusted project's
`.codex/hooks.json`. Substitute verified absolute paths:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node /absolute/path/to/ck/hooks/session-start.mjs",
            "commandWindows": "\"C:\\absolute\\node.exe\" \"C:\\absolute\\ck\\hooks\\session-start.mjs\"",
            "timeout": 10,
            "statusMessage": "Loading ck project context"
          }
        ]
      }
    ]
  }
}
```

Prefer one hook representation per config layer. In Codex CLI, use `/hooks` to inspect the source
and trust the exact non-managed hook definition before expecting it to run. Project hooks load only
for trusted projects.

## Boundaries

- Never infer state absent from `context.json` or current repository files.
- Never hand-edit `CONTEXT.md`; regenerate it through the commands.
- Never treat `transcript_path` as a stable schema.
- Never modify runtime hooks, global config, or C-drive skills without explicit deployment intent.
- Report the command, target path, and readback evidence after every write.
