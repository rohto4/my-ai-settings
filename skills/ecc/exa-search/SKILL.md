---
name: exa-search
description: Perform focused neural web or code-context lookup with an already available Exa tool, then verify important claims against opened sources. Use for current web discovery, technical examples, public company information, or professional-profile discovery when Exa's search is specifically useful. Do not use for repo-local truth, broad multi-source synthesis better handled by deep-research, or decision-oriented market analysis better handled by market-research.
---

# Exa Search

Use Exa as a focused discovery surface. Keep the task read-only and verify what matters beyond result snippets.

## Establish the boundary

1. Translate the request into one narrow query goal: factual lookup, code context, company discovery, or public professional information.
2. If the request references a repository or project, read its actual `AGENTS.md`, `PROJECT.md`, prescribed initialization files, and current task record first. After compaction or handoff, reread them from disk. External results supplement, but do not overwrite, project truth.
3. Use local repository search instead when the answer should be in workspace files. Route broad synthesis to `deep-research` and business-decision framing to `market-research`.

## Capability and secret gate

- Inspect the Exa tools actually exposed in the current runtime. Use `web_search_exa` or `get_code_context_exa` only if those exact tools are available; do not assume advanced, crawl, people, or company endpoints exist.
- Do not run `npx`, install an MCP server, edit Codex configuration, or create an account merely to satisfy this skill. If Exa is unavailable, use an already available read-only web tool when it preserves the user's intent, or report the missing capability.
- If a requested follow-on would submit, contact, purchase, or update anything, return a fake payload or dry-run description instead. Treat the live action as a separate task requiring explicit user approval of target and effect.
- Never ask the user to paste an API key, token, Cookie, or credential into chat or a repository. Use existing connector authentication or a secret store, and never echo authenticated configuration or response bodies.
- If the user explicitly asks to diagnose a Windows configuration, use PowerShell with `Join-Path`, explicit drive letters where known, and `Get-Content -LiteralPath`; mask secret values in all output.

## Search workflow

### Web lookup

Use the narrowest query that preserves the question. Add quoted phrases, `site:`, `intitle:`, date terms, or an available category filter only when they improve precision.

```text
web_search_exa(query: "<focused query>", numResults: 5)
```

### Code context

Use code-context search for API usage, implementation examples, or technical documentation. Include the language, library, version, and target behavior when known.

```text
get_code_context_exa(query: "<library version and behavior>", tokensNum: 3000)
```

Treat parameter names and ranges as runtime-dependent. Inspect the callable tool schema instead of copying an old example blindly.

### Verify and deduplicate

- Open the primary or official source for material technical, legal, financial, or product claims when an opening tool is available.
- Do not cite a search result page or snippet as if it were the underlying evidence.
- Collapse mirrors, syndicated articles, duplicated code snippets, and multiple pages that repeat one announcement.
- For public professional information, stay within role-relevant published facts. Do not infer sensitive traits, seek private contact data, deanonymize people, or initiate contact.

## Output

Return:

1. a direct answer or short finding list;
2. source links adjacent to supported claims;
3. publication or update dates when freshness matters;
4. a note on inaccessible primary sources, conflicting evidence, or tool limitations;
5. the query boundary used, when that affects recall.

Do not launch subagents for a focused lookup. If the question expands into independent research tracks, hand it to `deep-research`; use parallel agents there only when the user or project instructions explicitly allow them.

## Completion, stop, and handoff

Complete when the focused question is answered, important claims are verified against opened sources where possible, duplicates are removed, and limitations are explicit. Stop when Exa or the necessary source is unavailable, authentication would expose a secret, or the next step would submit, purchase, contact, or update anything. For context pressure or handoff, record the exact query, sources already opened, verified findings, unresolved items, and next read-only step, then follow the project's recovery order.
