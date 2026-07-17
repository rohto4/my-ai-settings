---
name: workspace-surface-audit
description: Audit the current Codex session's tools, configuration, plugins, connectors, authorization state, and extension gaps. Use when actual Codex capabilities are uncertain.
---

# Workspace Surface Audit

Answer what the current Codex workspace can actually do now, what is configured but unavailable, and which extension surface fits each real gap.

This skill audits Codex capability surfaces, not repository architecture, code ownership, or application entrypoints. Use `codebase-onboarding` for orientation and `repo-scan` for repository structure and ownership risks.

This is read-only unless the user separately authorizes implementation, installation, connection, or configuration changes.

## Safety and scope

- Read repository instructions before inspecting settings.
- Use exact workspace and user-provided paths; do not sweep unrelated projects or the whole home directory.
- Report credential variable names or provider presence only. Never print values, cookies, tokens, connection strings, or private identifiers.
- Treat installed, enabled, authorized, and callable as different states.
- Treat current-session callable tools as stronger evidence than remembered product behavior.

## Inventory surfaces

Collect only evidence relevant to the request:

| Surface | Evidence |
| --- | --- |
| Durable repository behavior | `AGENTS.md`, nested instructions, docs policy |
| Project Codex settings | trusted `.codex/config.toml`, rules, hooks |
| Reusable workflow | repo and user skills, enabled state, trigger metadata |
| Distribution bundle | installed plugins and valid plugin manifests |
| Live external capability | callable MCP tools, app connectors, authorization state |
| Scheduled work | automations or thread goals visible in the current surface |
| Local execution | shell, runtimes, manifests, scripts, sandbox and writable roots |
| Browser or desktop control | capability exposed in the current session |

Do not infer that a config file is active. Check project trust, installed state, current-session exposure, and errors where observable.

## Classify findings

- Available now: callable or directly usable in this session.
- Installed but inactive: present, disabled, unauthorized, untrusted, or restart-dependent.
- Primitive only: tool exists but repeated workflow lacks a focused skill or script.
- Missing: no current capability or configuration evidence.
- Conflicting or stale: duplicate settings, obsolete paths, or instructions for another harness.
- Unknown: cannot be verified without new access or user action.

## Choose the smallest correct surface

Use [references/surface-map.md](references/surface-map.md). Do not recommend a plugin when a repo skill is enough, an MCP server when a local CLI is enough, or a hook for a judgment-heavy workflow.

For Codex product facts, use current official documentation. For private connected data, prefer the authorized connector over web search. Do not install plugins or connect accounts during an audit.

## Output

1. Scope and evidence checked.
2. Available-now capabilities.
3. Inactive, primitive-only, missing, and conflicting surfaces.
4. Highest-value changes ranked by user impact, frequency, and implementation cost.
5. Exact verification that would prove each change works.
6. User approval or action required, kept separate from implementation work.

Avoid marketplace catalog dumps. Recommend only gaps supported by the user's workflows and current environment.
