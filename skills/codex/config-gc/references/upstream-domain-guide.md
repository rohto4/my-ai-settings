# Upstream domain guide: Config GC

> Source: https://github.com/affaan-m/everything-claude-code @ ed387446052dfbc6b52de149406b70efa65edc59
> License: MIT. Attribution is preserved in `../LICENSE.txt`.
> Authority boundary: This file preserves domain knowledge and examples. Follow the parent `SKILL.md`, the current PJ source of truth, detected runtime capabilities, and explicit approval gates. Legacy agent names, Unix commands, external writes, live credentials, deployment, and destructive examples are not authorization to execute them.

# Config GC — Garbage Collection for Codex or the active coding agent Setups

Borrowed from runtime garbage collection: periodically scan for objects that are no longer referenced, redundant, expired, or low-value, and reclaim the space. The critical difference: **here, collection requires a human in the loop. Never delete autonomously.**

## When to Activate

- The user asks to clean up, audit, or slim down their Codex or the active coding agent configuration
- The user complains about too many skills, noisy hooks, or slow session startup
- A monthly/periodic config review is due
- After installing a large skill pack (e.g. this repo), to reconcile overlaps with existing setup

Do NOT activate for: cleaning project source code (that's refactoring), clearing chat history, or uninstalling Codex or the active coding agent itself.

## Design Philosophy

1. **Append-only configs leak.** Skills, memory files, hooks, and permission entries only ever get added. Without periodic review they rot silently.
2. **Regular audits beat one-time purges.** Scan every ~30 days, propose a small batch of candidates each time.
3. **Per-channel strategies.** Each accumulation type (skills, hooks, permissions, ...) has its own staleness signals — don't apply one rule everywhere.
4. **Soft-delete first.** Rename to `.disabled` > move to `<runtime-settings-dir>/_gc_trash/` > real deletion. Always keep an undo path.
5. **Forced human-in-the-loop.** Every candidate gets its own `[y/n/skip]` confirmation. No "yes to all" shortcut.
6. **Keep a log.** Every GC run appends to `<runtime-settings-dir>/gc_log.md`: what was touched, why, and how to undo it.

## Scan Channels

| # | Channel | Path | Staleness / redundancy signals |
|---|---------|------|--------------------------------|
| 1 | Skills | `<runtime-settings-dir>/skills/*/` | Heavily overlapping names; never triggered in recent transcripts; domain mismatch with the user's actual work; broken or empty SKILL.md |
| 2 | Memory | `<runtime-settings-dir>/**/memory/*.md` + its index | Multiple index entries for one topic; contents contradicting newer entries; dates that have passed; orphan files missing from the index; sub-100-word fragments that should merge |
| 3 | Hooks | `<runtime-settings-dir>/hooks/` + settings | Scripts present on disk but referenced by no hook config; old versions superseded by rewrites |
| 4 | Permissions | `permissions.allow` in `settings.json` / `settings.local.json` | Duplicate entries; specific entries already covered by a wildcard (e.g. `Bash(git push)` when `Bash(*)` is allowed); one-off grants from past experiments |
| 5 | MCP servers | `<runtime-settings-dir>.json` or project `.mcp.json` | Servers that fail to connect; functional duplicates; long-unused |
| 6 | Scheduled reminders / jobs | wherever the user keeps them | Fired one-shots older than 30 days; jobs whose target scripts no longer exist |
| 7 | Project history | `<runtime-settings-dir>/projects/*/` | Stale handoff snapshots; session records superseded by newer state |
| 8 | Runtime caches | `cache/`, `file-history/`, `logs/`, `shell-snapshots/` | Sort by size and mtime; propose items >30 days old and large |

## Workflow

1. **Scan** all channels (or the subset the user names). Collect candidates with: path, channel, signal that flagged it, size, last-modified.
2. **Rank** by confidence (broken/orphaned = high; merely old = low) and present as a numbered table. Cap each run at ~20 candidates — GC is periodic, not exhaustive.
3. **Confirm one by one.** For each candidate show the evidence, then ask `[y/n/skip]`. The user can stop at any point.
4. **Soft-delete confirmed items**: prefer `.disabled` rename for skills/hooks and `_gc_trash/<date>/` move for files. Permission entries live in JSON (no comments possible): back up the settings file, record each removed entry verbatim in `gc_log.md`, then remove it from the `allow` array with `jq`. Only hard-delete when the user explicitly asks.
5. **Log** the run to `<runtime-settings-dir>/gc_log.md`: timestamp, items actioned, undo instructions.
6. **Report**: reclaimed size, channels still healthy, suggested next review date.

## Example Scan Commands

Orphaned hook scripts (channel 3) — scripts on disk that no hook config references:

```bash
for f in <runtime-settings-dir>/hooks/*; do
  name=$(basename "$f")
  grep -rq "$name" <runtime-settings-dir>/settings.json <runtime-settings-dir>/settings.local.json 2>/dev/null \
    || echo "ORPHAN: $f"
done
```

Redundant permission entries (channel 4) — duplicates, and specific grants shadowed by a wildcard:

```bash
jq -r '.permissions.allow[]' <runtime-settings-dir>/settings.local.json | sort | uniq -d
if jq -e '.permissions.allow | index("Bash(*)")' <runtime-settings-dir>/settings.local.json >/dev/null; then
  jq -r '.permissions.allow[]' <runtime-settings-dir>/settings.local.json \
    | grep '^Bash(' | grep -vF 'Bash(*)'
fi
```

Largest stale caches (channel 8) — `du -k` instead of GNU-only `find -printf`, so it works on macOS/BSD too:

```bash
find <runtime-settings-dir>/file-history <runtime-settings-dir>/shell-snapshots -type f -mtime +30 \
  -exec du -k {} + 2>/dev/null | sort -rn | head -20
```

Soft-delete with undo path (capture the date once so the log can't disagree with the directory):

```bash
gc_date=$(date +%Y-%m-%d)
mkdir -p <runtime-settings-dir>/_gc_trash/$gc_date
mv <runtime-settings-dir>/skills/dead-skill <runtime-settings-dir>/_gc_trash/$gc_date/
echo "$(date -Iseconds) moved skills/dead-skill -> _gc_trash/$gc_date/ (undo: mv back)" >> <runtime-settings-dir>/gc_log.md
```

Removing a confirmed-redundant permission entry (JSON has no comments — back up, log, then edit):

```bash
cp <runtime-settings-dir>/settings.local.json <runtime-settings-dir>/settings.local.json.bak
echo "$(date -Iseconds) removed permission entry: Bash(git push) (undo: restore from .bak or re-add)" >> <runtime-settings-dir>/gc_log.md
jq '.permissions.allow -= ["Bash(git push)"]' <runtime-settings-dir>/settings.local.json.bak \
  > <runtime-settings-dir>/settings.local.json
```

## Anti-Patterns

- **Bulk approval.** Asking "delete all 15? [y/n]" defeats the design. One item, one decision.
- **Hard-deleting on first pass.** If there's no `_gc_trash/` copy or `.disabled` rename, you did it wrong.
- **Treating "old" as "dead".** A skill untouched for 60 days may be seasonal (tax season, quarterly reviews). Age is a signal, not a verdict — that's why a human confirms.
- **Cleaning memory by truncation.** Merging two contradicting memory files requires reading both and keeping the newer truth, not deleting the longer one.
- **Touching anything outside `<runtime-settings-dir>`** (or the project's `<project-agent-config>/`). Config GC never wanders into source trees.

## Best Practices

- Run after big additions, not just on a calendar: installing a 50-skill pack is exactly when overlap with existing skills appears.
- When two skills overlap, prefer disabling the one with the weaker trigger description — it's the one that was probably never firing anyway.
- Permission cleanup is the highest-value channel per minute spent: redundant allow-entries make security review harder.
- Keep `gc_log.md` forever. It's tiny, and "when did I disable that hook and why" comes up more often than you'd think.

## Related Skills

- `skill-stocktake` — audits skill *quality*; config-gc audits skill *existence*. Run stocktake on what survives GC.
- `workspace-surface-audit` — the additive counterpart: recommends what to install. config-gc is the subtractive half of the same lifecycle.
- `configure-ecc` — after installing skills with it, run config-gc to reconcile overlaps with your pre-existing setup.
- `continuous-learning` — produces the memory files this skill later audits.
- `security-review` — pairs well with the permissions channel.
