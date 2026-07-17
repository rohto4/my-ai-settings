---
name: deep-research
description: Plan and conduct multi-source research with source attribution, uncertainty, and decision-ready synthesis. Use for broad or high-stakes questions that require several current sources, competing evidence, or a cited report. Do not use for a single factual lookup, a repo-local fact recoverable from workspace truth, or business-specific market analysis better handled by market-research.
---

# Deep Research

Produce a proportionate, cited research report. Treat web findings as evidence, not as a replacement for project truth or user-provided sources.

## Establish the source boundary

1. Identify the decision, reader, time horizon, jurisdictions, and required depth. Ask only when an answer would materially change the research plan.
2. When the request concerns a workspace or repository, read its actual `AGENTS.md`, `PROJECT.md`, prescribed initialization files, and current task records before searching externally. After compaction, session transfer, or handoff, reread them from disk before resuming.
3. Prefer the project's current source of truth over memory, summaries, old reports, or general web guidance. Read only the minimum linked material needed for the question.
4. If project rules require task tracking, keep objective, state, and completion conditions in the designated active-task file; keep finished evidence in its designated completion record.

## Use a safe research surface

- Discover which search, browser, connector, or MCP tools are actually available. Do not assume Firecrawl, Exa, a Claude-specific tool, or a particular command name exists.
- Search, open, and fetch in read-only mode by default. Do not install packages, change MCP configuration, sign in, buy reports, submit forms, contact people, or update an external system as part of research.
- When a proposed method could mutate external state, demonstrate it with a fake boundary, saved request example, or dry-run first. Perform a live action only as a separate user-approved task with target and effect stated.
- Never place tokens, API keys, Cookies, credentials, or authenticated response bodies in prompts, reports, repositories, command lines, or logs. Use an already-configured connector or secret store without echoing values.
- On Windows, use PowerShell-safe paths, `-LiteralPath`, and explicit drive-letter paths when inspecting local evidence. Do not translate a working Windows workflow into an unverified Bash-only command.
- If a needed capability or primary source is unavailable, report the limitation; do not silently weaken the evidence standard.

## Research workflow

### 1. Frame the questions

Break the goal into three to five non-overlapping questions. Include at least one question that could disconfirm the expected conclusion.

### 2. Plan evidence

For each question, name the preferred evidence class:

1. primary sources: official documentation, regulations, filings, datasets, or papers;
2. independent analysis or reputable reporting;
3. blogs, forums, and social posts as leads or lived-experience evidence, not automatic fact authority.

Set a freshness requirement where the answer can drift. Do not impose a fixed source quota; use enough independent evidence to resolve the question in proportion to its risk.

### 3. Search and deep-read

- Use distinct query formulations for terminology, counterevidence, and recent changes.
- Deduplicate mirrors, syndication, copied press releases, and sources that all depend on one underlying claim.
- Open and read the strongest sources. Search snippets are discovery aids, not sufficient support for material claims.
- Record title, publisher, publication or update date when available, URL, and the claim each source supports.

### 4. Synthesize

Separate:

- confirmed facts supported by the cited source;
- inferences drawn across sources;
- estimates and their assumptions;
- unresolved conflicts or missing evidence;
- recommendations and the decision criteria behind them.

Do not average away disagreements. Explain whether they arise from different dates, definitions, populations, incentives, or methods.

### 5. Deliver

Use this default structure when it fits:

```markdown
# [Topic]: Research Report
*As of: [date] | Scope: [boundary] | Confidence: [High/Medium/Low]*

## Executive Summary
## Key Findings
## Counterevidence and Uncertainty
## Implications / Recommendation
## Evidence Gaps
## Sources
## Method
```

Keep short reports in chat. Save a long report only to a user-specified or project-authorized path, then return the path and a compact summary.

## Optional parallel research

Do not launch subagents by default. Use parallel agents only when the user or project instructions explicitly request delegation or parallel work and the questions are independently bounded. Give each agent a distinct question and source boundary; the main agent must verify citations, remove duplicates, reconcile conflicts, and own the final synthesis. Parallel agents do not broaden write or approval authority.

## Completion, stop, and handoff

Complete only when:

- the original decision or question is answered within the stated scope;
- material claims have resolvable citations and important single-source claims are labeled;
- source dates, counterevidence, assumptions, and gaps are visible;
- duplicate sources and unsupported assertions have been removed;
- the method and unavailable checks are reported.

Stop and report a blocker when the task requires unavailable primary evidence, an authenticated or paid source the user has not authorized, exposure of a secret, or an external action outside the research scope. For a long task or approaching context pressure, leave a compact handoff containing the objective, completed questions, remaining questions, source list, unresolved conflicts, artifact paths, and next safe step; then follow the project's compaction-recovery order.

## Related skill boundaries

- Use `exa-search` for a focused Exa lookup or code-context search when that tool is available.
- Use `market-research` when the main output is a market, competitor, investor, sizing, or entry decision.
- Use local repository search before this skill when the answer should come from workspace files.
