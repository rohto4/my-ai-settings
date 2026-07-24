---
name: harness-review-customization
description: Convert component-ID review comments from a harness catalog or HTML review cockpit into bounded, traceable customization work. Use when a user pastes section comments, exports harness review JSON, chooses project-specific path/data/approval/runtime settings, or asks to customize only selected harness components without silently changing authority or enforcement claims.
---

# Harness Review Customization

## Purpose

Preserve the user's component-level intent while preventing broad comments from silently expanding filesystem, network, credential, external-write, or managed-policy authority.

## Workflow

1. Re-read the target project's actual initialization files and task/decision ledgers.
2. Normalize the pasted or exported comments with `scripts/normalize_review.py <file>` when a file is available. For direct chat text, preserve every component ID and comment verbatim in the analysis table.
3. Classify each non-empty item as:
   - `clarification`: explanation or wording only;
   - `soft-policy`: instructions, defaults, reading order, or recommended behavior;
   - `safe-implementation`: schema, deterministic policy, fake fixture, test, or evidence format;
   - `authority-change`: filesystem/network/credential/external-write/managed-policy expansion;
   - `conflict`: incompatible requests or contradiction with a higher-priority rule.
4. Link each requested change to one or more actual component files. Do not modify unmentioned components unless a dependency makes it necessary; explain that dependency first.
5. Implement `clarification`, `soft-policy`, and in-scope `safe-implementation` items when authorized by the request.
6. Stop before any `authority-change`. Show target, effect, data class, before/after boundary, rollback, and the exact approval needed.
7. Run the kit's preflight, positive/negative conformance, explicit tests, and HTML checks. Update task, decision, completion, and handoff files according to project rules.

## Decision Rules

- An empty comment means “no requested change,” not approval of the current value.
- A percentage is a dependency estimate, not a security level or priority.
- “Make it usable” does not authorize production data, live API, external writes, deploy, push, OS ACL, or managed-policy changes.
- Do not translate “allow” into a global wildcard. Ask for the smallest path, tool, domain, credential class, and duration.
- Do not upgrade `declared` or `simulated` to `enforced` without real runtime evidence.

## Output Contract

Return a table with component ID, normalized request, classification, affected files, decision needed, implementation state, and verification evidence. Preserve rejected or deferred comments so the user can revisit them.

## Resources

- `scripts/normalize_review.py`: dependency-free JSON/text normalizer; it never edits the target project.
- `references/review-contract.md`: accepted export and paste formats.
