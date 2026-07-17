---
name: rules-distill
description: Distill recurring, actionable principles from two or more skills into evidence-backed rule candidates, compare them with existing project rules, and preview append, revise, new-section, new-file, already-covered, or too-specific verdicts. Use for requests such as “audit these skills for shared rules,” “refresh project rules after skill changes,” or “which repeated skill patterns belong in rules.” Do not use for rewriting one skill, general repository inventory, directly editing rules without evidence and approval, or executing an unrelated task.
---

# Rules Distill

Combine deterministic inventory with bounded judgment. Produce a reviewable preview before any rule write.

## Restore project truth

1. Read the target project's `AGENTS.md`, `PROJECT.md`, `README.md`, and its minimum docs-management or context-reading guide.
2. Read the current task, completion boundary, and rule source-of-truth only when relevant to this run.
3. After compaction, session movement, or handoff, reread those files from disk before resuming. Treat summaries and model memory as aids, not current project truth.
4. Resolve the exact skill roots, rule roots, exclusions, output destination, and requested mode: `preview` or `apply-approved`.

Default to `preview`, read-only inspection, and no external access. Do not assume a user-home skill folder, a vendor-specific rules directory, or that every installed skill is in scope.

## Detect inventory capabilities

Choose an available adapter only after confirming its prerequisites and paths:

- **Windows PowerShell:** use `scripts/scan-skills.ps1` and `scripts/scan-rules.ps1`. Pass explicit roots and use `-LiteralPath` semantics.
- **POSIX shell:** use `scripts/scan-skills.sh` and `scripts/scan-rules.sh` only when Bash, `jq`, and their standard utilities are available. Pass explicit roots; the scripts have no home-directory default.
- **Fallback:** use bounded `rg` discovery plus native filesystem reads and produce the same evidence fields.

All inventory adapters emit JSON to standard output and must not modify the scanned roots. Preview commands and resolved roots before scanning when the scope is broad. Preserve Windows drive letters and keep path discovery and interpretation in the same shell.

Do not install missing dependencies merely to use an adapter. Stop or use the fallback.

## Build candidates

For each possible principle, require all of these:

1. Evidence from at least two distinct skills, with skill and section identifiers.
2. An actionable “do” or “do not” behavior rather than a general value statement.
3. A concrete violation risk.
4. A comparison against the full in-scope rule text, including equivalent wording.
5. A scope broad enough for rules but not language, framework, or one-skill implementation detail.

Assign one verdict:

| Verdict | Use when |
| --- | --- |
| Append | An existing section lacks this distinct principle. |
| Revise | Existing text is inaccurate or insufficient; show exact before/after. |
| New Section | The target file is correct but no section owns the principle. |
| New File | No existing rule file has a credible owner. |
| Already Covered | Existing wording already changes behavior sufficiently. |
| Too Specific | The guidance belongs in a skill or stack-specific source. |

Keep commands and examples in skills. Rule drafts should state what behavior is required and link back to evidence for implementation detail.

## Use optional parallel analysis safely

Run analysis in the main agent by default. Use parallel agents or subagents only when the user or project policy permits delegation, the corpus is large enough to benefit, and bounded clusters can be analyzed independently.

When parallel analysis is available:

- give every worker the same verdict contract and the same complete in-scope rules index;
- provide only its assigned skills and necessary rule text;
- require structured candidates with evidence, risk, verdict, target, confidence, and draft or revision;
- prohibit workers from writing rules or result files.

The main agent owns final integration. It must merge all worker outputs, deduplicate semantically overlapping candidates, recheck the two-skill threshold across clusters, resolve target conflicts, and discard claims unsupported by the source text. Worker agreement is not completion evidence.

## Preview before writing

Present a preview containing:

- roots, exclusions, adapter, files/headings scanned, and limitations;
- a summary table of principle, verdict, target, and confidence;
- per-candidate evidence, violation risk, existing-rule comparison, and exact draft or before/after revision;
- already-covered and too-specific items with a short reason;
- any unknown ownership or low-confidence decision.

Do not automatically create `results.json` or write inside the skill directory. Save a report only when the user requests an artifact and the project identifies an authorized destination. Show the intended path and content before an external or cross-project write.

## Apply only approved candidates

Before applying a candidate:

1. Confirm the user's approved candidate IDs and any requested modification.
2. Reread the target rule and governing project instructions.
3. Show or calculate the exact diff and recheck duplicate coverage.
4. Patch only the approved target while preserving unrelated user changes.
5. Re-read the edited section and validate local links, headings, UTF-8, and project-required checks.

Never perform an external write, notification, deletion, move, bulk overwrite, destructive command, or rule publication without explicit authorization and any approval required by the project. A request to analyze or preview is not write authorization.

Do not read, print, store, or include secret values, tokens, cookies, credentials, private keys, environment-file contents, or private data bodies. Record only a path and classification when secret-bearing material affects scope.

## Stop and hand off

Stop before widening scope or writing when:

- skill or rule roots, canonical ownership, or exclusions are ambiguous;
- evidence conflicts or fewer than two skills support a candidate;
- a secret/private-data boundary or denied path is reached;
- the adapter would require installation, network access, or source mutation;
- approval for a rule, external write, or destructive effect is missing;
- context pressure prevents reliable cross-batch integration.

For handoff, report completed inventory and clusters, candidate IDs and evidence, unresolved conflicts, preview location if any, approvals still needed, and the exact next safe step. Keep ongoing state in the project's task record and finished evidence in its completion record when project policy requires those artifacts.

## Evidence-backed completion

Report resolved roots, adapter and prerequisites, file/heading counts with method, excluded paths, candidate and verdict counts, duplicate merges, approved changes, validation results, and intentionally skipped writes. Complete only when the main agent has rechecked source evidence and rule coverage, every applied change has explicit approval and a verified diff, no secret was exposed, and remaining risks are explicit.
