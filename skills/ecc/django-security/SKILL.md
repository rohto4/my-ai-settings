---
name: django-security
description: Review or harden a Django application across authentication, authorization, sessions, CSRF, validation, ORM use, secrets, deployment settings, and audit evidence. Use for a scoped Django security task. Do not use for generic penetration testing, compliance certification, or unapproved live-system changes.
---

# Django Security

## Workflow

1. Read repository instructions, pinned versions, existing conventions, and validation commands.
2. Identify the smallest owning boundary and its observable contract.
3. Make the smallest repository-consistent change.
4. Run the narrow checks that cover the changed path.
5. Report commands, observed results, and unverified surfaces.

## Decision guide

- Read the pinned Django version, settings layout, authentication model, and test command.
- Trace the request path through authorization, persistence, response, and logging.
- Deny by default, test object-level access, and preserve parameterized ORM use.
- Make the smallest fix at the owning boundary and add a regression test.

## Safety boundaries

- Keep diagnosis read-only and reproduce with local tests, fixtures, or a disposable environment.
- Inject secrets from environment or a secret store and never log values.
- Require explicit approval for live writes, migrations, publishing, deployment, or rollout.

## Detailed patterns

Read [references/detailed-patterns.md](references/detailed-patterns.md) only when the current task needs the expanded examples and checklists.
