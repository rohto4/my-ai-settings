---
name: google-workspace-ops
description: Coordinate discovery, review, and explicitly approved changes across Google Drive, Docs, Sheets, and Slides using available connected capabilities. Use when the user needs to find, compare, summarize, migrate, or update shared Google Workspace assets as one workflow. Do not use for local repository documents, another provider's assets, or any live edit, sharing, permission, move, rename, archive, or deletion without a confirmed target and write approval.
---

# Google Workspace Ops

Operate shared documents as a governed working system. Keep project truth, provider state, and user approval distinct.

## Restore project truth first

1. When the request belongs to a project, read its actual `AGENTS.md`, `PROJECT.md`, prescribed initialization files, and current task record before searching cloud assets.
2. After compaction, session transfer, or handoff, reread those files from disk before resuming. Conversation summaries and memory are supporting context, not the current source of truth.
3. Follow the project's canonical-document, docs-management, task-state, and completion-evidence rules. A recently modified cloud file is not automatically canonical.
4. Keep active work and finished evidence in the locations the project defines; do not invent a second tracker inside Drive.

## Detect available capabilities

- Inspect which authenticated, connected Drive, document, spreadsheet, or presentation capabilities are actually available and whether each is read-only or write-capable.
- Do not assume a specific plugin, MCP server, tool name, or edit primitive. Do not install or configure a connector as a side effect of this skill.
- If the required provider or operation is unavailable, stop with the missing capability and the next safe setup step.
- Never request or expose tokens, Cookies, credentials, private share links, or authenticated response bodies in chat, repositories, command lines, or logs. Use the existing connector authentication boundary.
- For local Windows evidence or exports, use PowerShell-safe paths, `-LiteralPath`, and explicit drive-letter paths. Do not convert a working workflow into an unverified Bash-only command.

## Default to read-only inspection

Treat search, metadata lookup, and content read as the default phase. Treat create, edit, append, formula update, slide import, rename, move, share, permission change, archive, trash, and delete as external writes.

Before a live write:

1. identify the exact provider, stable asset ID, title, owner or location, and current modified state;
2. show the intended content or structural diff, affected ranges or slides, and what remains unchanged;
3. use a fake document, copied fixture, preview, or dry-run when the operation supports it;
4. state expected effect, collaboration impact, and rollback or recovery path;
5. obtain explicit approval for that target and effect unless the current request already unambiguously approves the exact write and project policy permits direct execution.

Never broaden approval from one file, tab, range, slide, or permission to sibling assets. Destructive or access-changing operations require a fresh approval immediately before execution.

## Workflow

### 1. Locate and disambiguate

Search by the strongest available identifiers. Compare stable ID, title, owner, folder, modified time, and known project links. Surface likely duplicates, but do not merge or archive them yet.

### 2. Inspect the structure

- Documents: headings, sections, comments or tracked state when exposed.
- Spreadsheets: tabs, used ranges, formulas, filters, charts, protected ranges, and data types.
- Presentations: slide count, layouts, notes, theme, linked assets, and visual-review availability.

Read only the minimum content required. Do not infer structure from filenames or snippets.

### 3. Reconcile with the canonical source

Identify whether the cloud asset is canonical, derived, stale, duplicated, or merely a delivery copy. If project files and cloud content disagree, report the conflict and ask which authority should win when the project does not already decide it.

### 4. Plan the smallest change

Use explicit section anchors, indices, tabs, ranges, slide IDs, or other stable coordinates. Separate content edits from formatting, migration, access, and lifecycle changes so each can be approved and verified independently.

### 5. Apply and verify

After approval, make bounded, idempotent changes where possible. Re-read the exact target and verify the resulting value, structure, formula, slide, metadata, or permission. For visual work, inspect the rendered result when an approved display surface is available; otherwise report that visual acceptance remains open.

## Output and evidence

Return:

```text
ASSET
- provider / stable ID / title / canonical status

CURRENT STATE
- inspected structure / duplicates / conflicts

ACTION
- read-only finding, proposed diff, or approved write performed

EVIDENCE
- before/after values, re-read result, unavailable checks, rollback path

FOLLOW-UPS
- unresolved authority, approval, duplicate cleanup, or next safe action
```

## Stop, handoff, and completion

Stop before writing when the target is ambiguous, canonical authority conflicts, connector permissions are unclear, protected or formula-bearing content could be damaged, a secret could be exposed, or approval does not cover the exact effect. Do not bypass provider safeguards.

For context pressure or handoff, record the project source of truth, provider and asset IDs, inspected structure, proposed or completed changes, approval state, verification evidence, unresolved conflicts, and next read-only step. Then resume through the project's prescribed recovery order.

Complete only when the intended asset is unambiguous, approved changes stay within scope, provider readback confirms the result, duplicate or authority conflicts are reported, unavailable visual checks are explicit, and no secret or unintended external write appears in the evidence.

## Related boundaries

- Use provider-specific document, spreadsheet, or presentation skills for a single-asset operation after this skill establishes target and approval.
- Use local document or spreadsheet tooling for workspace files rather than routing them through Google Workspace.
- Use project coordination tooling for backlog and task-state reconciliation; do not use a shared document as an implicit task system.
