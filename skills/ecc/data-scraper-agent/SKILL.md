---
name: data-scraper-agent
description: Design or implement a bounded data-scraping workflow with source rules, pagination, rate limits, normalization, provenance, and reproducible output. Use for an authorized public or test data source. Do not use to bypass access controls, collect secrets or personal data without authority, or run an unapproved live crawl.
---

# Data Scraper Agent

## Workflow

1. Read repository instructions, pinned versions, existing conventions, and validation commands.
2. Identify the smallest owning boundary and its observable contract.
3. Make the smallest repository-consistent change.
4. Run the narrow checks that cover the changed path.
5. Report commands, observed results, and unverified surfaces.

## Decision guide

- Confirm the allowed source, fields, authorization, terms, rate budget, and output contract.
- Start with saved fixtures or fake HTTP; make pagination, retries, normalization, and dedupe deterministic.
- Record provenance, stable identifiers, timestamps, rejected records, and partial failures.
- Write to a disposable output until schema and dedupe checks pass.

## Safety boundaries

- Inject credentials from environment or a secret store and mask logs.
- Stop on access-control ambiguity, unexpected personal data, or rate-limit escalation.
- Require explicit approval for a live crawl, live API, persistence, deployment, or scheduled execution.

## Detailed patterns

Read [references/detailed-patterns.md](references/detailed-patterns.md) only when the current task needs the expanded examples and checklists.
