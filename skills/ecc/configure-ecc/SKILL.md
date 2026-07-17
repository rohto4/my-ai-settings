---
name: configure-ecc
description: Configure this repository's Codex skill mother set and profiles using its canonical validation, export, and runtime-sync commands. Use when selecting skills for a project, creating or revising a profile, validating the active set, exporting a project candidate, or explicitly deploying the G-drive canonical skills to the C-drive Codex runtime.
---

# Configure the Codex skill set

Configure the active AI settings through the repository's own profile and command contracts. Do
not clone a fresh upstream ECC repository or install directly from it: `skills/ecc/` is an edited
source group, while `skills/codex/` and `skills/original/` are equally valid parts of the mother set.

## Establish the canonical repository

1. Use the repository path supplied by the user. On this machine the expected canonical root is
   `G:\devwork\ai-settings`.
2. Verify the resolved absolute path and read `AGENTS.md`, `PROJECT.md`, `README.md`, and the
   relevant `docs/imp/*` task before changing a profile or deploying anything.
3. Treat `C:\Users\unibe\.codex\skills` as a derived runtime, never as an editing source.

Stop if the repository cannot be identified or if the requested destination conflicts with its
`AGENTS.md` rules.

## Choose the operation

Classify the request into one or more explicit operations:

- inspect or validate the mother set;
- create or revise a profile;
- export a profile to an empty candidate directory;
- synchronize the full mother set to the local Codex runtime.

Profile edits and exports do not authorize runtime synchronization. A request to inspect or
recommend skills does not authorize any write.

## Inspect before selecting

Build the current inventory from the filesystem instead of a hard-coded category list:

```powershell
Get-ChildItem -LiteralPath .\skills -Directory |
  ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory } |
  Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') } |
  Sort-Object Name
```

For each candidate, read its frontmatter description first. Read the body or direct references
only when its trigger is still ambiguous. Select the smallest set that covers the project's actual
work; do not install a skill merely because its technology appears somewhere in the repository.

Check for:

- duplicate names across groups;
- trigger overlap and a clearer canonical skill;
- language or framework skills that match the real stack;
- workflow and quality skills that match the team's process;
- project-local skills that should remain in that project instead of the central profile.

## Create or revise a profile

Use the existing profile schema:

```json
{
  "schema_version": 1,
  "name": "profile-name",
  "description": "Intended project and operating boundary",
  "mother_set_baseline": 0,
  "skill_groups": {
    "foundation": ["skill-name"]
  },
  "recommended_additions": {
    "optional": ["another-skill"]
  }
}
```

Rules:

- `skill_groups` is the profile's initial selection for validation and export;
  `recommended_additions` is advisory. Runtime synchronization is a separate operation and always
  deploys the full mother set, not this selection.
- Set `mother_set_baseline` to the current inventory count. The validator rejects stale baselines.
- Use each skill name once.
- Every selected name must exist in exactly one mother-set group.
- Keep the discovery description budget within the validator limit.
- Explain additions and removals in terms of trigger, usage frequency, and expected effect.

Record non-trivial profile work in `docs/imp/imp-tasks.md`, and move completed evidence to
`docs/imp/imp-comp.md` according to repository rules.

## Validate

Run the mother-set validator with the target profile:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Test-AgentSet.ps1 `
  -ProfilePath .\profiles\<profile-name>\profile.json
```

Do not continue to export or deployment when the validator reports an error. Explain warnings that
affect the chosen profile; do not hide mother-set warnings that are unrelated to this operation.

## Export a profile candidate

Export only to an absent or empty directory. Verify the absolute destination stays within the
user-approved scope, then preview:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Export-AgentProfile.ps1 `
  -ProfilePath .\profiles\<profile-name>\profile.json `
  -DestinationRoot <absolute-empty-destination> `
  -WhatIf
```

Run again without `-WhatIf` only when the user requested the export and the preview matches. The
command refuses to overwrite a non-empty destination.

## Synchronize the runtime

Synchronize only when the user explicitly asks to use or distribute the updated skills now.

1. Run the target profile validation.
2. Preview the full mother-set synchronization:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Sync-AgentSkills.ps1 -WhatIf
```

3. Report that this is a **full mother-set deployment**, not a profile deployment. Synchronization
   completely replaces same-named runtime skill directories so removed legacy resources cannot
   survive, while preserving `.system` and mother-set-external skills.
4. Obtain confirmation if the request did not already explicitly authorize runtime deployment.
5. Run without `-WhatIf`.
6. Read back `.tool-set-agent-skills.json` and compare source/destination file counts and full-tree
   hashes for the changed skills. The `SKILL.md` hash remains for quick inspection.

Never edit the C-drive runtime copy to fix a failed sync. Correct the G-drive source, validate, and
repeat the preview.

## Completion report

Report:

- operation and absolute source/destination;
- profile skill and recommendation counts;
- validation errors and relevant warnings;
- preview result and whether a write actually occurred;
- manifest/hash readback for runtime deployment;
- unresolved choices or explicit statement that none remain.
