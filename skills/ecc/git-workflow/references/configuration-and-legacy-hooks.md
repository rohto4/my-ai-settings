# Configuration And Legacy Hooks

Read this file only when a user asks to change Git configuration, commit templates, aliases, ignore rules, or hooks.

## Configuration

Repository configuration and user/global configuration have different blast radii. Inspect existing values and the project's documented tooling before changing either. Changes to global config, commit templates, aliases, ignore rules, hooks, CI enforcement, or branch protection require explicit approval and must not override existing user choices.

Useful settings sometimes include an initial branch name, pull behavior, push behavior, diff algorithm, identity, or aliases. Their safe values depend on installed Git version, host policy, and the user's workflow. Verify the pinned or installed Git/tooling version and current official documentation before recommending exact settings.

An optional commit template may ask for a conventional type, scope, imperative subject, rationale, breaking-change note, and issue link. Store it and enable it only at the repository scope when policy allows; never replace a user's global template. Useful aliases can shorten routine inspection, but aliases such as reset/undo/amend need the same approval rules as their underlying commands.

## Legacy Bash Hook Examples

The following pattern is retained only as historical reference from the previous skill. It is **deprecated for this Windows/PowerShell-oriented skill**, is Bash/Unix dependent, and must not be installed without explicit approval and repository-policy support. Prefer the repository's documented cross-platform task runner, CI, or supported hook manager.

```bash
#!/bin/bash
# Legacy illustrative pre-commit hook; do not install by default.
npm run lint || exit 1
npm test || exit 1
git diff --cached | grep -E '(password|api_key|secret)' && exit 1
```

```bash
#!/bin/bash
# Legacy illustrative pre-push hook; do not install by default.
npm run test:all || exit 1
git diff origin/main | grep -E 'console\.log' && exit 1
```

These snippets are incomplete safeguards: text matching is not a secret-scanning strategy, command availability varies, and `origin/main` may not be the correct base. Confirm the repository's pinned tooling and official documentation before any adaptation.
