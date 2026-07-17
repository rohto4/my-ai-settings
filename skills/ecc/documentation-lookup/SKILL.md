---
name: documentation-lookup
description: Retrieve current primary documentation for libraries, frameworks, APIs, and setup questions. Use when implementation depends on version-sensitive external facts.
---

# Documentation Lookup

Retrieve the narrowest current primary documentation needed to answer a known product, library, framework, API, or configuration question.

Use `search-first` instead when the question is which tool or library to adopt. Use this skill after the target is known.

## Source order

1. Repository-pinned documentation, lockfiles, generated API schemas, and local source for the version actually in use.
2. A purpose-built official docs tool, installed documentation plugin, or provider MCP exposed in the current session.
3. The upstream project's official documentation or primary repository.
4. Package registry metadata maintained by the publisher.
5. Secondary sources only to fill a clearly labeled gap.

For OpenAI or Codex questions, use the current official OpenAI documentation workflow. For technical questions, prefer primary sources over blogs and aggregators.

## Workflow

1. Extract the exact product, package, version, runtime, and question.
2. Check the repository for a pinned version and local conventions.
3. Discover the documentation capability actually available in this session; do not assume Context7 or any named MCP exists.
4. Search with a compact query focused on the API, feature, or error.
5. Open or fetch the exact relevant section, not only a search-result snippet.
6. Verify version, release channel, publication or update date, and deprecation status when material.
7. Answer with the smallest useful example and a direct source link or local path.
8. State any mismatch between repository version and current upstream docs.

## Guardrails

- Do not send secrets, private source, internal URLs, or customer data in external documentation queries.
- Do not present training memory as current documentation.
- Do not mix examples from incompatible versions without labeling them.
- Do not quote long copyrighted sections; summarize and cite.
- Stop after authoritative evidence resolves the question. More sources do not automatically improve accuracy.
- If current documentation cannot establish a material claim, state bounded uncertainty instead of guessing.

## Output

```text
Documentation result
- Target and version
- Confirmed behavior
- Minimal applicable example
- Source and date or local path
- Repository-version differences
- Remaining uncertainty
```
